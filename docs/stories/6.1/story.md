# Story 6.1 - Auth Routes: Signup, Login, Google OAuth e Sessao

## Status: Done

## Story
As a user, I want to sign up with email/password or Google OAuth, log in, and access my authenticated session so that I can use all protected features of the DecorAI platform.

## Acceptance Criteria
- Given the API, when I send `POST /auth/signup` with valid email and password (min 8 chars), then the system creates a Supabase Auth user, returns the session (access_token, refresh_token), and the `handle_new_user` trigger auto-provisions `user_profiles` and `subscriptions` rows
- Given the API, when I send `POST /auth/signup` with an email that already exists, then it returns 409 with `{ error: { code: "USER_ALREADY_EXISTS", message: "Email ja cadastrado" } }`
- Given the API, when I send `POST /auth/signup` with invalid email or short password, then it returns 400 with validation errors from Zod
- Given the API, when I send `POST /auth/login` with valid credentials, then it returns the session (access_token, refresh_token, expires_in, user)
- Given the API, when I send `POST /auth/login` with wrong password or nonexistent email, then it returns 401 with `{ error: { code: "INVALID_CREDENTIALS", message: "Email ou senha invalidos" } }`
- Given the API, when I send `POST /auth/google` with a valid Google OAuth id_token, then the system creates or links the user via Supabase Auth and returns the session
- Given the API, when I send `POST /auth/google` with an invalid id_token, then it returns 401 with `{ error: { code: "INVALID_TOKEN", message: "Token Google invalido" } }`
- Given the API, when I send `GET /auth/me` with a valid Bearer token, then it returns the authenticated user's profile data (id, email, full_name, avatar_url, created_at)
- Given the API, when I send `GET /auth/me` without a Bearer token or with an expired token, then it returns 401 (handled by existing auth middleware from Story 7.3)
- Given the API, when I send `POST /auth/refresh` with a valid refresh_token, then it returns a new session with rotated tokens
- Given the API, when I send `POST /auth/logout`, then the session is invalidated server-side via Supabase Auth
- Given all auth routes, when I inspect the code, then all request bodies are validated with Zod schemas and all errors use the standardized AppError format from Story 7.3
- Given the API, when I run `pnpm turbo lint`, `pnpm turbo typecheck`, and `pnpm turbo test`, then all pass without errors including new auth tests

## Tasks
- [x] Task 1: Create `packages/api/src/schemas/auth.schema.ts` — Zod schemas for signup (email, password min 8), login (email, password), google auth (id_token), and refresh (refresh_token)
- [x] Task 2: Create `packages/api/src/services/auth.service.ts` — Auth service wrapping Supabase Auth operations: signUpWithEmail, signInWithEmail, signInWithGoogle (using `signInWithIdToken` provider 'google'), refreshSession, signOut, and getUser
- [x] Task 3: Create `packages/api/src/routes/auth.routes.ts` — Fastify plugin registering: POST /auth/signup, POST /auth/login, POST /auth/google, GET /auth/me (with authMiddleware), POST /auth/refresh, POST /auth/logout
- [x] Task 4: Register auth routes in `packages/api/src/server.ts` under the `/auth` prefix (no auth middleware on signup/login/google/refresh, authMiddleware on /me and /logout)
- [x] Task 5: Write unit tests for auth service (mock Supabase client) — signup success, signup duplicate email, login success, login wrong credentials, Google OAuth success, Google OAuth invalid token, refresh success, logout success
- [x] Task 6: Write integration tests for auth routes (mock auth service) — all endpoints with valid/invalid payloads, status codes, error response format
- [x] Task 7: Write unit tests for auth schemas — valid/invalid email formats, password length validation, id_token presence
- [x] Task 8: Verify `pnpm turbo lint`, `pnpm turbo typecheck`, and `pnpm turbo test` all pass

## Dependencies
- Story 7.1 — Monorepo scaffolding (api package structure)
- Story 7.2 — Database schema (user_profiles, subscriptions tables, handle_new_user trigger)
- Story 7.3 — Supabase client (supabaseAdmin), auth middleware, error handler (AppError), validation middleware, logger

## Technical Notes
- **Supabase Auth:** All auth operations delegate to Supabase Auth SDK — no custom JWT generation or password hashing
- **Signup flow:** `supabaseAdmin.auth.signUp({ email, password })` → Supabase creates auth.users row → `handle_new_user` trigger creates user_profiles + subscriptions
- **Google OAuth:** Uses `supabaseAdmin.auth.signInWithIdToken({ provider: 'google', token: id_token })` — client sends the Google id_token obtained via Google Sign-In on the frontend
- **Session tokens:** Supabase returns `access_token` (JWT, 1h), `refresh_token` (7d rotation) — frontend stores in httpOnly cookies (PKCE flow managed client-side)
- **Error mapping:** Map Supabase Auth errors to standardized AppError codes (e.g., `user_already_exists` → 409, `invalid_credentials` → 401)
- **No email verification in MVP:** Email verification is deferred to a future story (noted in PRD as enhancement)
- **Architecture ref:** [backend-arch.md §11.3](../../architecture/fullstack/backend-arch.md), [api-spec.md §5.2 Epic 6](../../architecture/fullstack/api-spec.md), [security-performance.md §15.3](../../architecture/fullstack/security-performance.md)

## PRD Traceability
| Requirement | Coverage |
|-------------|----------|
| FR-14 (login Google/email) | Full — signup, login, Google OAuth, session management |
| NFR-08 (LGPD) | Partial — auth foundation; LGPD consent modal is a future story |
| CON-07 (stack definida) | Supabase Auth as defined in tech stack |

## Dev Agent Record
### Implementation Plan
1. Created Zod schemas for all auth request bodies
2. Created auth service wrapping Supabase Auth SDK operations
3. Created Fastify route plugin with all 6 auth endpoints
4. Registered auth routes in server.ts under /auth prefix
5. Wrote comprehensive tests (schemas, service, routes)
6. Fixed Fastify generic type issues for route handlers

### Debug Log
- TypeScript error: Fastify route handlers with `FastifyRequest<{ Body: T }>` as handler param type don't match Fastify's route method signature. Fix: use `server.post<{ Body: T }>()` generic on the method instead.

### Change Log
| Date | Change |
|------|--------|
| 2026-03-09 | Initial implementation of all auth routes, service, schemas, and tests |

## Testing
- Auth service: Unit tests with mocked Supabase Auth client (8+ test cases)
- Auth routes: Integration tests verifying HTTP status codes, response format, Zod validation (12+ test cases)
- Auth schemas: Unit tests for Zod schema validation (6+ test cases)

## File List
- `packages/api/src/schemas/auth.schema.ts` — NEW — Zod schemas for auth request bodies
- `packages/api/src/services/auth.service.ts` — NEW — Auth service wrapping Supabase Auth
- `packages/api/src/routes/auth.routes.ts` — NEW — Fastify plugin with 6 auth endpoints
- `packages/api/src/server.ts` — MODIFIED — Registered auth routes under /auth prefix
- `packages/api/src/__tests__/auth.schema.test.ts` — NEW — 15 tests for schema validation
- `packages/api/src/__tests__/auth.service.test.ts` — NEW — 14 tests for auth service
- `packages/api/src/__tests__/auth.routes.test.ts` — NEW — 17 tests for auth routes
- `docs/stories/6.1/story.md` — MODIFIED — Updated status, tasks, file list

## QA Results
- `pnpm turbo lint`: PASS
- `pnpm turbo typecheck`: PASS
- `pnpm turbo test`: PASS (8 files, 65 tests, 0 failures)
