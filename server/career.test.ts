import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("careerRouter tests", () => {
  it("allows fetching career stats and profile", async () => {
    const user = {
      id: 1,
      openId: "test-balaji",
      email: "balaji@example.com",
      name: "Balaji Rajput",
      loginMethod: "manus",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };

    const ctx: TrpcContext = {
      user,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    };

    const caller = appRouter.createCaller(ctx);
    const stats = await caller.career.getStats();
    expect(stats).toBeDefined();
    expect(typeof stats.totalJobs).toBe("number");
  });

  it("requires a valid verified posting URL before adding a job", async () => {
    const user = {
      id: 1,
      openId: "test-balaji",
      email: "balaji@example.com",
      name: "Balaji Rajput",
      loginMethod: "manus",
      role: "user" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller({
      user,
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: () => {} } as any,
    });

    await expect(
      caller.career.addJob({
        title: "QA Officer",
        company: "Example Pharma",
        location: "Vadodara",
        track: "Pharmaceutical",
        remoteEligibility: "On-site",
        jobUrl: "not-a-valid-url",
        description: "Verified role details",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
