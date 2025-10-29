# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/` organized by NestJS modules (e.g., `src/auth`, `src/users`, `src/analytics`, `src/before-meeting`, `src/after-meeting`, `src/kanban-ticket`, `src/form-builder`).
- Module patterns: `*.module.ts`, services `*.service.ts`, controllers `*.controller.ts`, DTOs `*.dto.ts`, entities `*.entities.ts`.
- Database: `db/data-source.ts`; migrations in `src/migrations/`.
- Tests: unit specs in `src/**/*.spec.ts`; e2e tests under `test/`.
- Config: `nest-cli.json`, `tsconfig*.json`, `eslint.config.mjs`.

## Build, Test, and Development Commands
- `npm run start:dev` — run API with watch mode.
- `npm run start` — run once (no watch).
- `npm run build` — compile to `dist/`.
- `npm run start:prod` — execute compiled app.
- `npm run test` — run unit tests.
- `npm run test:e2e` — run end‑to‑end tests (config: `test/jest-e2e.json`).
- `npm run test:cov` — generate coverage.
- `npm run lint` — ESLint with auto‑fix.
- `npm run format` — Prettier on `src/` and `test/`.

## Coding Style & Naming Conventions
- Language: TypeScript (NestJS 11, TypeORM).
- Formatting: Prettier defaults (2‑space indent, single quotes where applicable, semicolons).
- Linting: ESLint (`eslint.config.mjs`) with typescript‑eslint and prettier integration.
- Filenames: kebab‑case for folders (`before-meeting/`), Nest conventions for files (see patterns above).
- Avoid `any`; prefer typed DTOs and entities.

## Testing Guidelines
- Framework: Jest with `ts-jest`.
- Unit tests co‑locate with code: `*.spec.ts`.
- E2E tests: `test/*.e2e-spec.ts`.
- Aim for meaningful coverage (`npm run test:cov`).
- Name tests after SUT: e.g., `users.service.spec.ts`.

## Commit & Pull Request Guidelines
- Use Conventional Commits when possible: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- Keep messages imperative and concise (max 72 chars subject).
- PRs must include: summary, linked issue(s), test evidence (output or screenshots for E2E), and notes on breaking changes or migrations.
- Ensure `npm run lint` and all tests pass before requesting review.

## Security & Configuration Tips
- Use environment variables via `@nestjs/config`; do not commit secrets. Example: `.env` with database credentials for `pg`/TypeORM.
- Review SQL in `src/analytics/queries/` before deploying.

## Agent-Specific Notes
- Follow the structure and naming patterns above.
- Limit changes to the relevant module; avoid cross‑module refactors without discussion.

## Load/Stress Testing
- k6 scripts: `k6/k6-test.js`. Configure via env: `K6_BASE_URL`, `K6_VUS`, `K6_DURATION`, `K6_TYPE=load|stress`.
- Example:
  - `K6_BASE_URL=http://localhost:3000 K6_VUS=10 K6_DURATION=1m k6 run k6/k6-test.js`
  - `K6_TYPE=stress K6_VUS=25 k6 run k6/k6-test.js`
