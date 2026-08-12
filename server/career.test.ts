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
});
