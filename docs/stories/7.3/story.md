# Story 7.3 - Supabase Client, Auth Middleware e Infraestrutura da API

## Status: Draft

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
- [ ] Task 1: Create `packages/api/src/config/env.ts` — typed environment variables validated at startup with envalid (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, REDIS_URL, PORT, NODE_ENV, CORS_ORIGINS)
- [ ] Task 2: Create `packages/api/src/lib/errors.ts` — AppError class with code, message, statusCode, and details
- [ ] Task 3: Create `packages/api/src/lib/logger.ts` — Pino logger configured for dev (pretty, debug) and production (json, info)
- [ ] Task 4: Create `packages/api/src/lib/supabase.ts` — supabaseAdmin (service role) and createUserClient(accessToken) with Database typing from shared
- [ ] Task 5: Augment Fastify types to include `request.user` with Supabase User type (declaration merging in `src/types/fastify.d.ts`)
- [ ] Task 6: Create `packages/api/src/middleware/auth.middleware.ts` — JWT extraction, validation via Supabase, user attachment to request
- [ ] Task 7: Create `packages/api/src/middleware/validation.middleware.ts` — Zod-based validation for body, params, and querystring
- [ ] Task 8: Create `packages/api/src/middleware/error-handler.ts` — global error handler with AppError recognition, Pino logging, and standardized error responses
- [ ] Task 9: Update `packages/api/src/server.ts` — integrate error handler, logger, CORS, and env config into Fastify server setup
- [ ] Task 10: Add `@supabase/supabase-js`, `envalid`, `pino`, `pino-pretty`, and `zod` as dependencies to api package
- [ ] Task 11: Generate `packages/shared/src/types/database.types.ts` — Database type stub matching Supabase schema (tables, columns) for typed queries
- [ ] Task 12: Write unit tests for auth middleware (valid token, missing token, invalid token)
- [ ] Task 13: Write unit tests for error handler (AppError, unknown error, validation error)
- [ ] Task 14: Write unit tests for validation middleware (valid body, invalid body, missing params)
- [ ] Task 15: Write unit tests for env config (missing vars, valid config)
- [ ] Task 16: Write unit tests for AppError class (construction, properties, inheritance)
- [ ] Task 17: Verify `pnpm turbo lint`, `pnpm turbo typecheck`, and `pnpm turbo test` pass

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
### Debug Log
### Change Log

## Testing
- Auth middleware: Unit tests with mocked Supabase client (valid token returns user, missing token returns 401, invalid token returns 401)
- Error handler: Unit tests for AppError, generic Error, and Zod validation errors
- Validation middleware: Unit tests with valid/invalid payloads against Zod schemas
- Env config: Unit tests verifying fail-fast behavior with missing vars
- AppError: Unit tests for construction, Error inheritance, property access

## File List

## QA Results
