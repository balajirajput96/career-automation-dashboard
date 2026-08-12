import { Request, Response } from "express";
import { sdk } from "./sdk";
import { getDb } from "../db";
import { jobs, profiles, automationLogs, notifications } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { scoreJobWithAI } from "../aiScorer";

export async function scheduledDiscoveryHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "Unauthorized cron execution" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    // Automated job discovery payload simulation
    const sampleJobs = [
      {
        title: "QA Reviewer & Documentation Specialist",
        company: "Torrent Pharmaceuticals",
        location: "Ahmedabad, Gujarat",
        track: "Pharmaceutical" as const,
        remoteEligibility: "On-site",
        jobUrl: "https://www.linkedin.com/jobs/view/torrent-pharma-qa",
        description: "Checking BMR, line clearance, IPQA, and manufacturing compliance records.",
      },
      {
        title: "Backend Python & LLM Engineer",
        company: "AI Remote Labs",
        location: "Remote (India Eligible)",
        track: "AI & Python" as const,
        remoteEligibility: "Remote - India eligible",
        jobUrl: "https://www.linkedin.com/jobs/view/ai-labs-python-engineer",
        description: "Building Python AI agents, workflow automation pipelines, and RAG systems.",
      }
    ];

    const profileRes = await db.select().from(profiles).limit(1);
    const profile = profileRes[0] || {
      summary: "Pharmaceutical QA and Python Automation Specialist",
      skills: "QA, IPQA, GMP, Python, AI, Automation",
      matchThreshold: 75
    };

    let addedCount = 0;
    for (const sj of sampleJobs) {
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
            userId: profile.userId || 1,
            title: `Automated Discovery Match (${scoring.matchScore}%)`,
            message: `${sj.title} at ${sj.company} scored ${scoring.matchScore}% match.`,
            isRead: 0,
          });
        }
      }
    }

    await db.insert(automationLogs).values({
      runTime: new Date(),
      status: "Success",
      jobsFound: addedCount,
      details: `Scheduled Heartbeat cron successfully executed. Discovered ${addedCount} new jobs.`,
      scheduleCronTaskUid: user.taskUid,
    });

    return res.json({ ok: true, jobsFound: addedCount });
  } catch (error: any) {
    console.error("Scheduled discovery error:", error);
    try {
      const db = await getDb();
      if (db) {
        await db.insert(automationLogs).values({
          runTime: new Date(),
          status: "Failed",
          jobsFound: 0,
          errorMessage: error?.message || String(error),
        });
      }
    } catch {}
    return res.status(500).json({ error: error?.message || String(error) });
  }
}
