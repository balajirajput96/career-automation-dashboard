#!/usr/bin/env bash
set -Eeuo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
temporary_directory="$(mktemp -d)"
trap 'rm -rf "$temporary_directory"' EXIT

remote="$temporary_directory/remote.git"
seed="$temporary_directory/seed"
runner="$temporary_directory/runner"
concurrent="$temporary_directory/concurrent"

git init --bare "$remote" >/dev/null
git clone "$remote" "$seed" >/dev/null
git -C "$seed" config user.name test
git -C "$seed" config user.email test@example.invalid
mkdir -p "$seed/scripts/maintenance" "$seed/ops"
cp "$repository_root/scripts/maintenance/run-cycle.mjs" "$seed/scripts/maintenance/run-cycle.mjs"
cp "$repository_root/scripts/maintenance/push-state-with-retry.sh" "$seed/scripts/maintenance/push-state-with-retry.sh"
chmod +x "$seed/scripts/maintenance/push-state-with-retry.sh"
cat > "$seed/ops/maintenance-state.json" <<'JSON'
{"schemaVersion":1,"maximumCycles":2400,"cycleCount":0,"completed":false,"status":"idle","startedAt":null,"updatedAt":null,"lastCycle":null}
JSON
: > "$seed/ops/maintenance-history.jsonl"
git -C "$seed" add .
git -C "$seed" commit -m seed >/dev/null
git -C "$seed" push origin HEAD:main >/dev/null
git -C "$remote" symbolic-ref HEAD refs/heads/main

git clone "$remote" "$runner" >/dev/null
git clone "$remote" "$concurrent" >/dev/null
for clone in "$runner" "$concurrent"; do
  git -C "$clone" config user.name test
  git -C "$clone" config user.email test@example.invalid
done

cat > "$runner/.git/hooks/pre-push" <<HOOK
#!/usr/bin/env bash
set -Eeuo pipefail
marker="$temporary_directory/race-triggered"
if [ ! -e "\$marker" ]; then
  touch "\$marker"
  printf 'concurrent writer\n' > "$concurrent/concurrent-writer.txt"
  git -C "$concurrent" add concurrent-writer.txt
  git -C "$concurrent" commit -m 'concurrent writer' >/dev/null
  git -C "$concurrent" push origin HEAD:main >/dev/null
  exit 1
fi
HOOK
chmod +x "$runner/.git/hooks/pre-push"

cd "$runner"
MAXIMUM_MAINTENANCE_CYCLES=2400 MAINTENANCE_PUSH_ATTEMPTS=3 \
  bash scripts/maintenance/push-state-with-retry.sh success race-test source-commit test-workflow

git fetch origin main >/dev/null
[ -f concurrent-writer.txt ]
[ "$(jq -r .cycleCount ops/maintenance-state.json)" = 1 ]
[ "$(jq -s length ops/maintenance-history.jsonl)" = 1 ]

echo 'PASS: maintenance state push recovers a concurrent non-fast-forward with bounded retries.'
