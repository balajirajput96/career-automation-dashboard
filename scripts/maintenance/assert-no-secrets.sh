#!/usr/bin/env bash

set -euo pipefail

pattern='BEGIN (RSA |OPENSSH )?PRIVATE KEY|ghp_[A-Za-z0-9]|github_pat_[A-Za-z0-9]|sk-[A-Za-z0-9]|Bearer[[:space:]]+[A-Za-z0-9._-]{12,}|password[[:space:]]*[:=]|api[_-]?key[[:space:]]*[:=]'
matches="$(git grep -nEI "$pattern" -- ':!pnpm-lock.yaml' ':!scripts/maintenance/assert-no-secrets.sh' || true)"

if [[ -n "$matches" ]]; then
  echo "Credential-like content detected in tracked source files:" >&2
  echo "$matches" >&2
  exit 1
fi

echo "No credential-like content detected in tracked source files."
