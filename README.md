# Career Automation Dashboard

Private source repository for the Career Automation Dashboard, a two-track workspace for Pharmaceutical QA/Production and AI & Python/Automation job discovery, profile-based AI matching, and application tracking.

## Production

The deployed dashboard is available at [balajidash-epamvccj.manus.space](https://balajidash-epamvccj.manus.space).

## Local checks

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm run build
```

## Repository automation

GitHub Actions provides change-based continuous integration and a bounded hourly maintenance run. The maintenance workflow performs deterministic health checks, records up to 2,400 cycles in machine-readable files, and stops further validation once that limit is reached. See [the operations guide](docs/OPERATIONS.md) for the exact boundaries and recovery behavior.

## Security

Do not commit environment files, API keys, session cookies, passwords, database connection strings, or application-user data. Production secrets remain server-side in the deployed application.
