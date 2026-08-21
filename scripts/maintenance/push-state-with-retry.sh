#!/usr/bin/env bash
set -Eeuo pipefail

status="${1:?maintenance status is required}"
run_id="${2:?workflow run id is required}"
source_commit="${3:?source commit is required}"
workflow="${4:?workflow name is required}"
max_attempts="${MAINTENANCE_PUSH_ATTEMPTS:-3}"

for attempt in $(seq 1 "$max_attempts"); do
  echo "Preparing maintenance state push attempt $attempt/$max_attempts."
  git fetch origin main
  git reset --hard origin/main
  git clean -fd -- ops

  node scripts/maintenance/run-cycle.mjs record \
    --max "${MAXIMUM_MAINTENANCE_CYCLES:-2400}" \
    --status "$status" \
    --run-id "$run_id" \
    --commit "$source_commit" \
    --workflow "$workflow"

  git add ops/maintenance-state.json ops/maintenance-history.jsonl
  if git diff --cached --quiet; then
    echo "No maintenance state changes to commit."
    exit 0
  fi

  git commit -m "chore: record maintenance cycle $run_id"
  if git push origin HEAD:main; then
    echo "Maintenance state push succeeded on attempt $attempt."
    exit 0
  fi

  echo "Maintenance state push was rejected on attempt $attempt; refetching before retry." >&2
  git reset --hard origin/main
  if [ "$attempt" -lt "$max_attempts" ]; then
    sleep $((attempt * 2))
  fi
done

printf 'Maintenance state push failed after %s bounded attempts.\n' "$max_attempts" >&2
exit 1
