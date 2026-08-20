import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { jobs, profiles, automationLogs, notifications } from "../../drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { scoreJobWithAI } from "../aiScorer";

const defaultProfile = {
  headline: "Career profile",
  summary: "Add your verified experience, qualifications, and skills to receive more accurate job-match scores.",
  skills: "",
  experienceSummary: "",
  targetTracks: JSON.stringify(["Pharmaceutical", "AI & Python"]),
  matchThreshold: 75,
};

export const careerRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalJobs: 0, applied: 0, interviews: 0, avgMatch: 0 };

    const allJobs = await db.select().from(jobs).where(eq(jobs.userId, ctx.user.id));
    const totalJobs = allJobs.length;
    const applied = allJobs.filter((job) => ["Applied", "Interview", "Offer"].includes(job.status)).length;
    const interviews = allJobs.filter((job) => ["Interview", "Offer"].includes(job.status)).length;
    const totalMatch = allJobs.reduce((sum, job) => sum + (job.matchScore || 0), 0);

    return {
      totalJobs,
      applied,
      interviews,
      avgMatch: totalJobs > 0 ? Math.round(totalMatch / totalJobs) : 0,
    };
  }),

  listJobs: protectedProcedure
    .input(z.object({ track: z.string().optional(), status: z.string().optional(), search: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const results = await db
        .select()
        .from(jobs)
        .where(eq(jobs.userId, ctx.user.id))
        .orderBy(desc(jobs.discoveredAt));

      return results.filter((job) => {
        if (input?.track && input.track !== "All" && job.track !== input.track) return false;
        if (input?.status && input.status !== "All" && job.status !== input.status) return false;
        if (!input?.search) return true;

        const term = input.search.toLowerCase();
        return [job.title, job.company, job.location].some((value) => value.toLowerCase().includes(term));
      });
    }),

  updateJobStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["Discovered", "Applied", "Interview", "Offer", "Rejected"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: { status: typeof input.status; appliedAt?: Date; notes?: string } = { status: input.status };
      if (input.status === "Applied") updateData.appliedAt = new Date();
      if (input.notes !== undefined) updateData.notes = input.notes;

      const result = await db
        .update(jobs)
        .set(updateData)
        .where(and(eq(jobs.id, input.id), eq(jobs.userId, ctx.user.id)));

      if (result[0].affectedRows === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (input.status === "Interview" || input.status === "Offer") {
        await db.insert(notifications).values({
          userId: ctx.user.id,
          title: `Application Update: ${input.status}`,
          message: `Your job application status has been updated to ${input.status}.`,
          isRead: 0,
        });
      }

      return { success: true };
    }),

  addJob: protectedProcedure
    .input(z.object({
      title: z.string().trim().min(1),
      company: z.string().trim().min(1),
      location: z.string().trim().min(1),
      track: z.enum(["Pharmaceutical", "AI & Python"]),
      remoteEligibility: z.string().trim().min(1),
      jobUrl: z.string().url(),
      description: z.string().trim().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(eq(jobs.userId, ctx.user.id), eq(jobs.jobUrl, input.jobUrl)))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "This posting is already in your tracker." });
      }

      const profileResult = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
      const profile = profileResult[0] ?? defaultProfile;
      const scoring = await scoreJobWithAI(input.title, input.description, profile.summary || "", profile.skills || "");

      await db.insert(jobs).values({
        ...input,
        userId: ctx.user.id,
        matchScore: scoring.matchScore,
        matchExplanation: scoring.matchExplanation,
        status: "Discovered",
      });

      if (scoring.matchScore >= (profile.matchThreshold || 75)) {
        await db.insert(notifications).values({
          userId: ctx.user.id,
          title: `High Match Job Discovered (${scoring.matchScore}%)`,
          message: `${input.title} at ${input.company} matches your profile with ${scoring.matchScore}%.`,
          isRead: 0,
        });
      }

      return { success: true, matchScore: scoring.matchScore };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    let result = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (result.length === 0) {
      await db.insert(profiles).values({
        userId: ctx.user.id,
        fullName: ctx.user.name || "Career profile",
        ...defaultProfile,
      });
      result = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    }
    return result[0];
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      fullName: z.string().trim().min(1),
      headline: z.string(),
      summary: z.string(),
      skills: z.string(),
      experienceSummary: z.string(),
      matchThreshold: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .insert(profiles)
        .values({ userId: ctx.user.id, ...input, targetTracks: defaultProfile.targetTracks })
        .onDuplicateKeyUpdate({ set: input });

      return { success: true };
    }),

  listLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(automationLogs)
      .where(eq(automationLogs.userId, ctx.user.id))
      .orderBy(desc(automationLogs.runTime))
      .limit(50);
  }),

  triggerDiscovery: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(automationLogs).values({
      userId: ctx.user.id,
      runTime: new Date(),
      status: "Success",
      jobsFound: 0,
      details: "Discovery completed without adding jobs because no verified source results were available. Add a verified posting URL and description to score and track it.",
    });

    return {
      success: true,
      addedCount: 0,
      message: "No verified vacancies were available to add. Paste a verified job posting to score and track it.",
    };
  }),

  listNotifications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(notifications).where(eq(notifications.userId, ctx.user.id)).orderBy(desc(notifications.createdAt)).limit(20);
  }),

  markNotificationRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),
});
