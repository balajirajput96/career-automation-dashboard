# Operations Guide

## Purpose

This repository preserves the deployable Career Automation Dashboard and its operational history. The GitHub repository is private, while the published dashboard remains available at `https://balajidash-epamvccj.manus.space`.

## Automated validation

The `Continuous Integration` workflow runs on changes to `main`, pull requests, and manual dispatch. It installs the locked dependencies, performs TypeScript checks, executes the Vitest suite, and builds the production bundle.

The `Hourly Maintenance` workflow starts at minute 17 of each hour. It is intentionally bounded to **2,400 recorded cycles**. Before each cycle it checks `ops/maintenance-state.json`; after the limit is reached, later scheduled invocations exit without running validation. For each permitted cycle, the workflow retries dependency installation up to three times, performs the repository checks, verifies that the public dashboard responds, and appends a JSON line to `ops/maintenance-history.jsonl`.

Each permitted maintenance cycle also generates a normalized `pnpm audit` summary and uploads it as a 30-day GitHub Actions artifact. The summary preserves aggregate severity counts only; raw advisory details stay out of the repository history.

## State records

`ops/maintenance-state.json` is the current machine-readable summary. `ops/maintenance-history.jsonl` is an append-only cycle ledger. Both files contain workflow metadata and check outcomes only; they must never contain credentials, cookies, personal access tokens, database URLs, or application-session values.

## Safe recovery behavior

The automated workflow makes only deterministic, bounded repairs: transient dependency installation is retried and public availability is rechecked with bounded retries. Failed type checks, tests, builds, or production checks are recorded instead of being silently bypassed. Source-code repairs, dependency upgrades, schema changes, connector changes, and production configuration changes require an explicit reviewed change and normal validation before they are committed.

## GitHub operations

Use the `main` branch as the repository source of truth. Before changing source code, run `pnpm run check`, `pnpm test`, and `pnpm run build`. Keep environment files untracked. The repository already contains an active Dependabot workflow managed by GitHub; review dependency update pull requests before merging them.

## Manus-specific operations

The production application retains its platform-managed daily discovery callback at `/api/scheduled/discovery`. GitHub Actions does not receive Manus runtime credentials and does not alter that callback. The hourly workflow only verifies the public dashboard endpoint and the checked-in source. This separation keeps platform credentials server-side and repository automation reproducible.

The configured n8n API endpoint was independently probed and returned HTTP 404. It is therefore not used by either the dashboard or the GitHub maintenance workflows. Do not add retry loops around this unavailable endpoint; restore it only after a legitimate n8n instance is available and its API health is verified.
