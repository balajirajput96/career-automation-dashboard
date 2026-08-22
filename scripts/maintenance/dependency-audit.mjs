#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readSeverityCounts(metadata) {
  const source = metadata?.vulnerabilities ?? metadata ?? {};
  return ["info", "low", "moderate", "high", "critical"].reduce((counts, severity) => {
    counts[severity] = Number(source[severity] ?? 0);
    return counts;
  }, {});
}

export function summarizeAudit(rawOutput, exitCode) {
  const parsed = JSON.parse(rawOutput);
  const vulnerabilities = readSeverityCounts(parsed.metadata);
  const total = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);

  return {
    schemaVersion: 1,
    command: "pnpm audit --json",
    auditExitCode: exitCode,
    auditStatus: exitCode === 0 ? "clean" : "vulnerabilities-detected",
    vulnerabilityCount: total,
    vulnerabilities,
  };
}

function runPnpmAudit() {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["audit", "--json"], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", chunk => {
      stdout += chunk;
    });
    child.stderr.on("data", chunk => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", code => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

const { code, stdout, stderr } = await runPnpmAudit();
if (code !== 0 && code !== 1) {
  throw new Error(`pnpm audit did not complete normally (exit ${code}): ${stderr.trim()}`);
}

const report = summarizeAudit(stdout, code);
const outputPath = option("output");
if (outputPath) {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
process.stdout.write(`${JSON.stringify(report)}\n`);
