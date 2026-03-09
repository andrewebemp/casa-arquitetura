# Story 7.3 - Supabase Client, Auth Middleware e Infraestrutura da API

## Status: Done

## Story
As a developer, I want the Fastify API package configured with typed environment variables, Supabase client library (admin + per-user), JWT auth middleware, global error handler, Pino logger, and Zod validation middleware so that all future API routes can be built on a solid, secure, and consistent foundation.

## Acceptance Criteria
- Given the api package, when I inspect `src/config/env.ts`, then all environment variables are typed and validated at startup using envalid (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, REDIS_URL, PORT, NODE_ENV, CORS_ORIGINS)
- Given the api package, when the server starts with missing required env vars, then it fails fast with a descriptive error listing the missing variables
- Given the api package, when I inspect `src/lib/supabase.ts`, then it exports `supabaseAdmin` (service role client, bypasses RLS) and `createUserClient(accessToken)` (per-request client, respects RLS) both typed with the Database type from shared package
- Given the api package, when I inspect `src/middleware/auth.middleware.ts`, then it extracts the Bearer token from the Authorization header, validates it via `supabaseAdmin.auth.getUser(token)`, and attaches the user to `request.user`
- Given an API request without a Bearer token, when auth middleware runs, then it returns 401 with `{ error: { code: "UNAUTHORIZED", message: "Token ausente" } }`
- Given an API request with an invalid/expired JWT, when auth middleware runs, then it returns 401 with `{ error: { code: "UNAUTHORIZED", message: "Token invalido" } }`
- Given the api package, when I inspect `src/middleware/error-handler.ts`, then it exports a global Fastify error handler that catches all errors, logs them with context via Pino, and returns a standardized error response `{ error: { code, message, details? } }` with appropriate HTTP status
- Given the api package, when I inspect `src/lib/logger.ts`, then it exports a configured Pino logger instance with appropriate log levels for dev (debug) and production (info)
- Given the api package, when I inspect `src/middleware/validation.middleware.ts`, then it provides a Zod-based validation utility that can validate request body, params, and querystring against Zod schemas
- Given the api package, when I inspect `src/lib/errors.ts`, then it exports an `AppError` class with `code`, `message`, `statusCode`, and optional `details` properties
- Given the api package, when I run `pnpm turbo lint` and `pnpm turbo typecheck`, then the api package passes without errors
- Given the api package, when I run `pnpm turbo test`, then all unit tests pass covering auth middleware, error handler, validation middleware, env config, and AppError class

## Tasks
- [x] Task 1: Create `packages/api/src/config/env.ts` — typed environment variables validated at startup with envalid (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, REDIS_URL, PORT, NODE_ENV, CORS_ORIGINS)
- [x] Task 2: Create `packages/api/src/lib/errors.ts` — AppError class with code, message, statusCode, and details
- [x] Task 3: Create `packages/api/src/lib/logger.ts` — Pino logger configured for dev (pretty, debug) and production (json, info)
- [x] Task 4: Create `packages/api/src/lib/supabase.ts` — supabaseAdmin (service role) and createUserClient(accessToken) with Database typing from shared
- [x] Task 5: Augment Fastify types to include `request.user` with Supabase User type (declaration merging in `src/types/fastify.d.ts`)
- [x] Task 6: Create `packages/api/src/middleware/auth.middleware.ts` — JWT extraction, validation via Supabase, user attachment to request
- [x] Task 7: Create `packages/api/src/middleware/validation.middleware.ts` — Zod-based validation for body, params, and querystring
- [x] Task 8: Create `packages/api/src/middleware/error-handler.ts` — global error handler with AppError recognition, Pino logging, and standardized error responses
- [x] Task 9: Update `packages/api/src/server.ts` — integrate error handler, logger, CORS, and env config into Fastify server setup
- [x] Task 10: Add `@supabase/supabase-js`, `envalid`, `pino`, `pino-pretty`, and `zod` as dependencies to api package
- [x] Task 11: Generate `packages/shared/src/types/database.types.ts` — Database type stub matching Supabase schema (tables, columns) for typed queries
- [x] Task 12: Write unit tests for auth middleware (valid token, missing token, invalid token)
- [x] Task 13: Write unit tests for error handler (AppError, unknown error, validation error)
- [x] Task 14: Write unit tests for validation middleware (valid body, invalid body, missing params)
- [x] Task 15: Write unit tests for env config (missing vars, valid config)
- [x] Task 16: Write unit tests for AppError class (construction, properties, inheritance)
- [x] Task 17: Verify `pnpm turbo lint`, `pnpm turbo typecheck`, and `pnpm turbo test` pass

## Dependencies
- Story 7.1 — Monorepo scaffolding (provides api package structure and shared types)
- Story 7.2 — Database schema (provides table definitions for Database type generation)

## Technical Notes
- **Auth pattern:** Supabase Auth handles JWT issuance; API validates JWTs server-side via `supabase.auth.getUser(token)` — Ref: backend-arch.md §11.3
- **Service client:** `supabaseAdmin` uses SERVICE_ROLE_KEY (bypasses RLS) for server-side operations — Ref: backend-arch.md §11.2
- **Per-user client:** `createUserClient(token)` uses ANON_KEY + user JWT for RLS-respecting queries — Ref: backend-arch.md §11.2
- **Error format:** Standardized `{ error: { code, message, details? } }` across all error responses — Ref: api-spec.md
- **Logger:** Pino for structured JSON logging in production, pino-pretty for development — Ref: backend-arch.md §11.1
- **Security:** httpOnly cookies, CORS whitelist, Zod validation on all inputs — Ref: security-performance.md §15.2, §15.3
- **Database types:** Supabase CLI can generate types from migrations, but for this story a manual type stub aligned with the 10 tables from Story 7.2 is sufficient
- **Architecture ref:** [backend-arch.md](../../architecture/fullstack/backend-arch.md), [api-spec.md](../../architecture/fullstack/api-spec.md), [security-performance.md](../../architecture/fullstack/security-performance.md)

## PRD Traceability
| Requirement | Coverage |
|-------------|----------|
| FR-14 (login Google/email) | Auth middleware validates Supabase JWT (prerequisite for auth routes) |
| NFR-08 (LGPD) | RLS-respecting per-user client, secure token handling |
| NFR-10 (rate limiting) | Error handler foundation for rate limit middleware (future story) |
| CON-07 (stack definida) | Fastify + Supabase + Pino + Zod as defined in tech stack |

## Dev Agent Record
### Implementation Plan
Implemented all 17 tasks sequentially: env config, errors, logger, database types, supabase clients, fastify type augmentation, auth middleware, validation middleware, error handler, server integration, dependencies, and 19 unit tests.

### Debug Log
- Zod v4 uses `.issues` instead of `.errors` on ZodError — fixed in validation.middleware.ts

### Change Log
- 2026-03-09: Implemented complete API infrastructure (env, auth, errors, logger, supabase, validation, error handler) with 19 passing unit tests

## Testing
- Auth middleware: Unit tests with mocked Supabase client (valid token returns user, missing token returns 401, invalid token returns 401)
- Error handler: Unit tests for AppError, generic Error, and Zod validation errors
- Validation middleware: Unit tests with valid/invalid payloads against Zod schemas
- Env config: Unit tests verifying fail-fast behavior with missing vars
- AppError: Unit tests for construction, Error inheritance, property access

## File List
- `packages/api/package.json` — Updated with new dependencies and test script
- `packages/api/src/config/env.ts` — Typed env vars with envalid
- `packages/api/src/lib/errors.ts` — AppError class
- `packages/api/src/lib/logger.ts` — Pino logger (dev/production)
- `packages/api/src/lib/supabase.ts` — supabaseAdmin + createUserClient
- `packages/api/src/types/fastify.d.ts` — Fastify request.user augmentation
- `packages/api/src/middleware/auth.middleware.ts` — JWT auth middleware
- `packages/api/src/middleware/validation.middleware.ts` — Zod validation middleware
- `packages/api/src/middleware/error-handler.ts` — Global error handler
- `packages/api/src/server.ts` — Updated with env, logger, CORS, error handler
- `packages/shared/src/types/database.types.ts` — Database type stub (10 tables)
- `packages/shared/src/types/index.ts` — Added Database export
- `packages/api/src/__tests__/errors.test.ts` — AppError tests (4)
- `packages/api/src/__tests__/env.test.ts` — Env config tests (2)
- `packages/api/src/__tests__/auth.middleware.test.ts` — Auth middleware tests (4)
- `packages/api/src/__tests__/error-handler.test.ts` — Error handler tests (4)
- `packages/api/src/__tests__/validation.middleware.test.ts` — Validation tests (5)
- `packages/api/vitest.config.ts` — Vitest configuration
- `packages/api/tsconfig.json` — Updated to exclude test files

## QA Results
- `pnpm turbo lint --filter=@decorai/api` — PASS
- `pnpm turbo typecheck --filter=@decorai/api` — PASS
- `pnpm turbo test --filter=@decorai/api` — PASS (5 test files, 19 tests)
- `pnpm turbo test --filter=@decorai/shared` — PASS (7 test files, 121 tests)
