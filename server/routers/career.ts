import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { jobs, profiles, automationLogs, notifications } from "../../drizzle/schema";
import { eq, desc, sql, gte } from "drizzle-orm";
import { scoreJobWithAI } from "../aiScorer";

export const careerRouter = router({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { totalJobs: 0, applied: 0, interviews: 0, avgMatch: 0 };

    const allJobs = await db.select().from(jobs);
    const totalJobs = allJobs.length;
    const applied = allJobs.filter(j => j.status === 'Applied' || j.status === 'Interview' || j.status === 'Offer').length;
    const interviews = allJobs.filter(j => j.status === 'Interview' || j.status === 'Offer').length;
    const totalMatch = allJobs.reduce((acc, j) => acc + (j.matchScore || 0), 0);
    const avgMatch = totalJobs > 0 ? Math.round(totalMatch / totalJobs) : 0;

    return { totalJobs, applied, interviews, avgMatch };
  }),

  listJobs: protectedProcedure.input(z.object({
    track: z.string().optional(),
    status: z.string().optional(),
    search: z.string().optional(),
  }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];

    let query = db.select().from(jobs).orderBy(desc(jobs.discoveredAt));
    const results = await query;

    return results.filter(j => {
      if (input?.track && input.track !== "All" && j.track !== input.track) return false;
      if (input?.status && input.status !== "All" && j.status !== input.status) return false;
      if (input?.search) {
        const term = input.search.toLowerCase();
        const matchTitle = j.title.toLowerCase().includes(term);
        const matchCompany = j.company.toLowerCase().includes(term);
        const matchLocation = j.location.toLowerCase().includes(term);
        if (!matchTitle && !matchCompany && !matchLocation) return false;
      }
      return true;
    });
  }),

  updateJobStatus: protectedProcedure.input(z.object({
    id: z.number(),
    status: z.enum(["Discovered", "Applied", "Interview", "Offer", "Rejected"]),
    notes: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const updateData: any = { status: input.status };
    if (input.status === 'Applied') {
      updateData.appliedAt = new Date();
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }

    await db.update(jobs).set(updateData).where(eq(jobs.id, input.id));

    // Create notification if status changed to Interview or Offer
    if (input.status === 'Interview' || input.status === 'Offer') {
      await db.insert(notifications).values({
        userId: ctx.user.id,
        title: `Application Update: ${input.status}`,
        message: `Your job application status has been updated to ${input.status}!`,
        isRead: 0,
      });
    }

    return { success: true };
  }),

  addJob: protectedProcedure.input(z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    track: z.enum(["Pharmaceutical", "AI & Python"]),
    remoteEligibility: z.string(),
    jobUrl: z.string(),
    description: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Fetch profile for AI match scoring
    const profileRes = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    const profile = profileRes[0] || {
      summary: "Pharmaceutical QA and Python Automation Specialist",
      skills: "QA, IPQA, GMP, Python, AI, Automation, BMR Review",
      matchThreshold: 75
    };

    const scoring = await scoreJobWithAI(input.title, input.description, profile.summary || "", profile.skills || "");

    const [inserted] = await db.insert(jobs).values({
      title: input.title,
      company: input.company,
      location: input.location,
      track: input.track,
      remoteEligibility: input.remoteEligibility,
      jobUrl: input.jobUrl,
      description: input.description,
      matchScore: scoring.matchScore,
      matchExplanation: scoring.matchExplanation,
      status: "Discovered",
    });

    // Check if match score exceeds configurable threshold
    if (scoring.matchScore >= (profile.matchThreshold || 75)) {
      await db.insert(notifications).values({
        userId: ctx.user.id,
        title: `High Match Job Discovered! (${scoring.matchScore}%)`,
        message: `${input.title} at ${input.company} matches your profile with ${scoring.matchScore}%.`,
        isRead: 0,
      });
    }

    return { success: true, matchScore: scoring.matchScore };
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    let res = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    if (res.length === 0) {
      await db.insert(profiles).values({
        userId: ctx.user.id,
        fullName: "Balaji Dilip Singh Rajput",
        headline: "Pharmaceutical QA & Python AI Automation Specialist",
        summary: "Experienced in pharmaceutical manufacturing, quality assurance (IPQA, BMR, GMP), and modern Python AI automation engineering.",
        skills: "Quality Assurance, IPQA, Tablet Compression, OSD, GMP, BMR Review, Python, AI Agents, RAG, Workflow Automation, APIs",
        experienceSummary: "5+ years in pharmaceutical production quality and transitioning into AI automation systems.",
        targetTracks: JSON.stringify(["Pharmaceutical", "AI & Python"]),
        matchThreshold: 75.0,
      });
      res = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    }
    return res[0];
  }),

  updateProfile: protectedProcedure.input(z.object({
    fullName: z.string(),
    headline: z.string(),
    summary: z.string(),
    skills: z.string(),
    experienceSummary: z.string(),
    matchThreshold: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.update(profiles).set({
      fullName: input.fullName,
      headline: input.headline,
      summary: input.summary,
      skills: input.skills,
      experienceSummary: input.experienceSummary,
      matchThreshold: input.matchThreshold,
    }).where(eq(profiles.userId, ctx.user.id));

    return { success: true };
  }),

  listLogs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(automationLogs).orderBy(desc(automationLogs.runTime)).limit(50);
  }),

  triggerDiscovery: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Simulate automated discovery of new sample curated jobs for Balaji
    const sampleJobs = [
      {
        title: "Senior QA Officer - OSD & IPQA",
        company: "Sun Pharmaceutical Industries",
        location: "Vadodara, Gujarat",
        track: "Pharmaceutical" as const,
        remoteEligibility: "On-site (Vadodara preferred)",
        jobUrl: "https://www.linkedin.com/jobs/view/sun-pharma-qa-officer",
        description: "Looking for experienced Quality Assurance Officer with solid background in Oral Solid Dosage (OSD), tablet compression, line clearance, IPQA, and GMP compliance documentation review.",
      },
      {
        title: "Python AI Workflow Automation Engineer",
        company: "Global Tech Solutions Remote",
        location: "Remote (India Eligible)",
        track: "AI & Python" as const,
        remoteEligibility: "Remote - India eligible",
        jobUrl: "https://www.linkedin.com/jobs/view/python-ai-automation-engineer",
        description: "We are seeking a Python automation specialist experienced with LangChain, workflow APIs, RAG agents, and backend system integrations working in a global remote team environment.",
      },
      {
        title: "Pharmaceutical Production Executive",
        company: "Cadila Pharmaceuticals Ltd",
        location: "Ahmedabad, Gujarat",
        track: "Pharmaceutical" as const,
        remoteEligibility: "On-site (Ahmedabad / Sanand)",
        jobUrl: "https://www.linkedin.com/jobs/view/cadila-production-executive",
        description: "Responsible for granulation, coating, packaging, BMR review, and manufacturing execution adhering strictly to SOP and GMP standards.",
      }
    ];

    const profileRes = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
    const profile = profileRes[0] || {
      summary: "Pharmaceutical QA and Python Automation Specialist",
      skills: "QA, IPQA, GMP, Python, AI, Automation, BMR Review",
      matchThreshold: 75
    };

    let addedCount = 0;
    for (const sj of sampleJobs) {
      // Check if job already exists
      const existing = await db.select().from(jobs).where(eq(jobs.jobUrl, sj.jobUrl)).limit(1);
      if (existing.length === 0) {
        const scoring = await scoreJobWithAI(sj.title, sj.description, profile.summary || "", profile.skills || "");
        await db.insert(jobs).values({
          ...sj,
          matchScore: scoring.matchScore,
          matchExplanation: scoring.matchExplanation,
          status: "Discovered",
        });
        addedCount++;

        if (scoring.matchScore >= (profile.matchThreshold || 75)) {
          await db.insert(notifications).values({
            userId: ctx.user.id,
            title: `High Match Job Discovered! (${scoring.matchScore}%)`,
            message: `${sj.title} at ${sj.company} matches your profile with ${scoring.matchScore}%.`,
            isRead: 0,
          });
        }
      }
    }

    await db.insert(automationLogs).values({
      runTime: new Date(),
      status: "Success",
      jobsFound: addedCount,
      details: `Scheduled discovery run successfully fetched and scored ${addedCount} new matching vacancies across Pharmaceutical and AI tracks.`,
    });

    return { success: true, addedCount };
  }),

  listNotifications: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(notifications).where(eq(notifications.userId, ctx.user.id)).orderBy(desc(notifications.createdAt)).limit(20);
  }),

  markNotificationRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, input.id));
    return { success: true };
  })
});
