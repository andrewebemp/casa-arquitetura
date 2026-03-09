# Story 6.2 - User Profile API: Favoritos, Preferencias e Historico

## Status: Done

## Story

As a authenticated user, I want to view and update my profile with preferences and manage favorite projects so that I have a personalized experience and can quickly access my preferred projects.

## PRD Requirements

| ID | Requisito | Cobertura |
|----|-----------|-----------|
| FR-15 | O sistema deve manter perfil do usuario com historico de projetos, favoritos e preferencias | Full |
| NFR-08 | LGPD — RLS isolation per user | Maintained |

## Acceptance Criteria

- Given an authenticated user, when GET /profile is called, then the system returns the full user profile from user_profiles table (display_name, avatar_url, preferred_style, lgpd_consent_at, training_opt_in, created_at, updated_at)
- Given an authenticated user, when PATCH /profile is called with valid fields, then the system updates only the provided fields in user_profiles and returns the updated profile
- Given an authenticated user, when PATCH /profile is called with an invalid preferred_style, then the system returns 400 with a validation error
- Given an authenticated user, when GET /projects?favorite=true is called, then the system returns only projects where is_favorite is true
- Given an authenticated user, when PATCH /projects/:id with is_favorite=true, then the project is marked as favorite (already exists via Story 7.4 — validate it works)
- Given a user trying to access another user's profile, then RLS prevents access and returns 404/403
- Given an unauthenticated request to /profile, then the system returns 401

## Technical Context

### Existing Infrastructure (from previous stories)
- `user_profiles` table with RLS — Story 7.2
- Auth middleware (JWT validation) — Story 7.3
- `authService.getUser()` returns auth data but NOT profile data — Story 6.1
- `is_favorite` column on projects table, togglable via PATCH /projects/:id — Story 7.4
- `listProjectsQuerySchema` has `status` filter but NO `favorite` filter — Story 7.4
- Supabase clients (admin + per-user) — Story 7.3
- Validation middleware (Zod) — Story 7.3

### Existing Types
```typescript
// packages/shared/src/types/user.ts
interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_style: DecorStyle | null;
  lgpd_consent_at: string | null;
  training_opt_in: boolean;
  created_at: string;
  updated_at: string;
}
```

### API Patterns to Follow
- Use `createUserClient(accessToken)` for RLS-enforced queries
- Use `AppError` for error responses with code, message, statusCode
- Use `logger.error` before throwing errors
- Use Zod schemas for request validation
- Follow existing service/route/schema pattern from project.service.ts

## Tasks

- [x] Task 1: Create profile schema (packages/api/src/schemas/profile.schema.ts) with updateProfileSchema validating display_name, avatar_url, preferred_style, lgpd_consent_at, training_opt_in
- [x] Task 2: Create profile service (packages/api/src/services/profile.service.ts) with getProfile(userId, accessToken) and updateProfile(userId, input, accessToken) methods
- [x] Task 3: Create profile routes (packages/api/src/routes/profile.routes.ts) with GET /profile and PATCH /profile endpoints
- [x] Task 4: Register profile routes in the Fastify server (packages/api/src/server.ts or equivalent)
- [x] Task 5: Add `favorite` filter to listProjectsQuerySchema and update projectService.list() to filter by is_favorite when favorite=true
- [x] Task 6: Write unit tests for profile service (packages/api/src/__tests__/profile.service.test.ts)
- [x] Task 7: Write route tests for profile endpoints (packages/api/src/__tests__/profile.routes.test.ts)
- [x] Task 8: Write tests for favorite filter in project listing (extend existing project route tests)
- [x] Task 9: Run npm run lint, npm run typecheck, npm test — all must pass

## Dependencies

- Story 7.2 (Database Schema) — user_profiles table and RLS policies
- Story 7.3 (Auth Middleware) — JWT validation, Supabase clients
- Story 6.1 (Auth Routes) — authentication flow
- Story 7.4 (Project CRUD) — is_favorite column, project listing

## Dev Agent Record

### Implementation Plan

### Debug Log

### Change Log

- 2026-03-09: Implemented all tasks — profile schema, service, routes; favorite filter on projects; registered routes in server; all tests passing (181 tests, 17 files)

## Testing

### Test Scenarios
1. **Profile retrieval** — authenticated user gets own profile from user_profiles
2. **Profile update** — partial update of display_name, preferred_style
3. **Validation** — invalid preferred_style rejected, empty display_name rejected
4. **RLS isolation** — user cannot read/update another user's profile
5. **Favorites filter** — GET /projects?favorite=true returns only favorited projects
6. **Auth guard** — unauthenticated requests return 401

## File List

### New Files
- `packages/api/src/schemas/profile.schema.ts` — Zod schema for updateProfile validation
- `packages/api/src/services/profile.service.ts` — getProfile + updateProfile with RLS
- `packages/api/src/routes/profile.routes.ts` — GET /profile + PATCH /profile endpoints
- `packages/api/src/__tests__/profile.service.test.ts` — 7 unit tests for profile service
- `packages/api/src/__tests__/profile.routes.test.ts` — 12 route tests for profile endpoints

### Modified Files
- `packages/api/src/schemas/project.schema.ts` — add favorite filter to listProjectsQuerySchema
- `packages/api/src/services/project.service.ts` — add is_favorite filter to list()
- `packages/api/src/server.ts` — register profile routes at /profile prefix
- `packages/api/src/__tests__/project.routes.test.ts` — add favorite filter tests (2 new tests)
- `packages/api/src/__tests__/project.service.test.ts` — add favorite filter service tests (2 new tests), fix mockChain for thenable chains

## QA Results

### Verdict: PASS

**Reviewed by:** Quinn (@qa) — 2026-03-09

#### Phase 1: Code Quality — PASS
- Clean, readable code following established service/route/schema pattern
- No code smells or anti-patterns
- Consistent naming, error handling, and response format

#### Phase 2: Test Coverage — PASS
- 23 tests added/modified (7 service + 12 route + 4 project tests)
- Edge cases covered: null fields, empty strings, max length, invalid enum values
- Error paths tested: supabase errors, null data, auth failures
- Total suite: 181 tests passing across 17 files

#### Phase 3: Acceptance Criteria — PASS (7/7)
- [x] GET /profile returns full user profile (display_name, avatar_url, preferred_style, lgpd_consent_at, training_opt_in, created_at, updated_at)
- [x] PATCH /profile updates only provided fields (dynamic updateData with undefined checks)
- [x] PATCH /profile with invalid preferred_style returns 400 (Zod enum validation)
- [x] GET /projects?favorite=true returns only favorited projects (filter added to schema + service)
- [x] PATCH /projects/:id with is_favorite=true marks project as favorite (via Story 7.4 — confirmed working)
- [x] RLS prevents cross-user access (createUserClient with accessToken enforces isolation)
- [x] Unauthenticated requests return 401 (authMiddleware on both endpoints)

#### Phase 4: Regressions — PASS
- All 181 existing tests pass
- Changes to project.schema.ts and project.service.ts are additive (new optional field)

#### Phase 5: Performance — PASS
- Single query per operation, no N+1
- Cursor-based pagination maintained

#### Phase 6: Security — PASS
- Input validation via Zod schemas
- Parameterized queries via Supabase client
- RLS enforced via createUserClient(accessToken)
- Auth middleware on all profile routes
- LGPD: user can only access own profile

#### Phase 7: Documentation — PASS
- Story file complete: all tasks checked, file list accurate, change log updated

#### Phase 8: Technical Debt — PASS
- No shortcuts or hacks, follows established patterns

#### Phase 9: Architecture — PASS
- Proper separation: schema → service → routes
- Profile routes registered separately from project routes

#### Phase 10: Accessibility — N/A (API-only story)

#### Quality Gates
- `npm run lint` — PASS (0 errors)
- `npm run typecheck` — PASS (0 errors)
- `npm test` — PASS (181 tests, 17 files)
