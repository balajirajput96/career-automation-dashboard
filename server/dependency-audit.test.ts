import { describe, expect, it } from "vitest";
import { summarizeAudit } from "../scripts/maintenance/dependency-audit.mjs";

describe("dependency audit summary", () => {
  it("normalizes pnpm audit severity metadata without preserving raw advisory details", () => {
    const report = summarizeAudit(
      JSON.stringify({
        metadata: { vulnerabilities: { info: 0, low: 1, moderate: 2, high: 3, critical: 4 } },
        advisories: { "example-advisory": { title: "Sensitive advisory details stay out of the summary" } },
      }),
      1,
    );

    expect(report).toEqual({
      schemaVersion: 1,
      command: "pnpm audit --json",
      auditExitCode: 1,
      auditStatus: "vulnerabilities-detected",
      vulnerabilityCount: 10,
      vulnerabilities: { info: 0, low: 1, moderate: 2, high: 3, critical: 4 },
    });
    expect(JSON.stringify(report)).not.toContain("example-advisory");
  });
});
