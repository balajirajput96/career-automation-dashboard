#!/usr/bin/env node

import { appendFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const command = process.argv[2] ?? "can-run";

function option(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const maximumCycles = positiveInteger(option("max", "2400"), 2400);
const statePath = resolve(repositoryRoot, option("state", "ops/maintenance-state.json"));
const historyPath = resolve(repositoryRoot, option("history", "ops/maintenance-history.jsonl"));

function createInitialState() {
  return {
    schemaVersion: 1,
    maximumCycles,
    cycleCount: 0,
    completed: false,
    status: "idle",
    startedAt: null,
    updatedAt: null,
    lastCycle: null,
  };
}

async function loadState() {
  try {
    const raw = await readFile(statePath, "utf8");
    return { ...createInitialState(), ...JSON.parse(raw), maximumCycles };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return createInitialState();
    }
    throw error;
  }
}

async function loadHistory() {
  try {
    const raw = await readFile(historyPath, "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    return lines.map((line) => JSON.parse(line));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeJsonAtomically(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, path);
}

function print(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

async function canRun() {
  const state = await loadState();
  const proceed = state.cycleCount < maximumCycles;
  print({
    command: "can-run",
    proceed,
    cycleCount: state.cycleCount,
    maximumCycles,
    remainingCycles: Math.max(maximumCycles - state.cycleCount, 0),
  });
}

async function record() {
  const state = await loadState();
  const now = new Date().toISOString();
  const status = option("status", "success");
  const workflowRunId = option("run-id", "local");
  const allowedStatuses = new Set(["success", "failure", "cancelled", "skipped"]);

  if (!allowedStatuses.has(status)) {
    throw new Error(`Unsupported maintenance status: ${status}`);
  }

  const history = await loadHistory();
  const existingEntry = history.find((entry) => entry.workflowRunId === workflowRunId);
  if (existingEntry) {
    print({
      command: "record",
      recorded: false,
      reason: "workflow-run-already-recorded",
      cycleCount: state.cycleCount,
      maximumCycles,
      existingEntry,
    });
    return;
  }

  if (state.cycleCount >= maximumCycles) {
    print({ command: "record", recorded: false, reason: "maximum-cycles-reached", cycleCount: state.cycleCount, maximumCycles });
    return;
  }

  const cycle = state.cycleCount + 1;
  const entry = {
    cycle,
    status,
    timestamp: now,
    workflowRunId,
    commit: option("commit", "local"),
    workflow: option("workflow", "local"),
  };

  state.cycleCount = cycle;
  state.status = status;
  state.startedAt ??= now;
  state.updatedAt = now;
  state.lastCycle = entry;
  state.completed = cycle >= maximumCycles;

  await mkdir(dirname(historyPath), { recursive: true });
  await appendFile(historyPath, `${JSON.stringify(entry)}\n`, "utf8");
  await writeJsonAtomically(statePath, state);
  print({ command: "record", recorded: true, ...entry, maximumCycles, completed: state.completed });
}

if (command === "can-run") {
  await canRun();
} else if (command === "record") {
  await record();
} else {
  throw new Error(`Unknown command: ${command}`);
}
