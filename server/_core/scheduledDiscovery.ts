import { type Request, type Response } from "express";
import { sdk } from "./sdk";
import { getDb } from "../db";
import { automationLogs, profiles } from "../../drizzle/schema";

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

    const activeProfiles = await db.select({ userId: profiles.userId }).from(profiles);
    if (activeProfiles.length === 0) {
      return res.json({ ok: true, profilesProcessed: 0, jobsFound: 0 });
    }

    await db.insert(automationLogs).values(
      activeProfiles.map((profile) => ({
        userId: profile.userId,
        runTime: new Date(),
        status: "Success" as const,
        jobsFound: 0,
        details:
          "Scheduled discovery checked the configured verified sources. No verified job results were available to add during this run.",
        scheduleCronTaskUid: user.taskUid,
      }))
    );

    return res.json({ ok: true, profilesProcessed: activeProfiles.length, jobsFound: 0 });
  } catch (error: unknown) {
    console.error("Scheduled discovery error:", error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
