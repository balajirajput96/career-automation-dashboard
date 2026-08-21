import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const scriptPath = resolve(process.cwd(), "scripts/maintenance/run-cycle.mjs");

async function runCycle(tempDirectory: string, command: string, extraArgs: string[] = []) {
  const statePath = join(tempDirectory, "state.json");
  const historyPath = join(tempDirectory, "history.jsonl");
  const { stdout } = await execFileAsync(process.execPath, [
    scriptPath,
    command,
    "--state",
    statePath,
    "--history",
    historyPath,
    "--max",
    "1",
    ...extraArgs,
  ]);
  return { result: JSON.parse(stdout) as Record<string, unknown>, statePath, historyPath };
}

describe("maintenance cycle state", () => {
  it("records one bounded cycle and stops subsequent runs", async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), "career-maintenance-"));

    const before = await runCycle(tempDirectory, "can-run");
    expect(before.result).toMatchObject({ proceed: true, cycleCount: 0, maximumCycles: 1 });

    const recorded = await runCycle(tempDirectory, "record", ["--status", "success", "--run-id", "42"]);
    expect(recorded.result).toMatchObject({ recorded: true, cycle: 1, status: "success", completed: true });

    const after = await runCycle(tempDirectory, "can-run");
    expect(after.result).toMatchObject({ proceed: false, cycleCount: 1, remainingCycles: 0 });

    const state = JSON.parse(await readFile(recorded.statePath, "utf8"));
    const history = (await readFile(recorded.historyPath, "utf8")).trim().split("\n");
    expect(state.lastCycle.workflowRunId).toBe("42");
    expect(history).toHaveLength(1);
  });
});
