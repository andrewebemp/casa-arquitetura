# Story 7.4 - Project CRUD API e Upload de Imagens

## Status: Done

## Story
As a authenticated user, I want to create, view, update and delete decoration projects and upload room photos so that I can manage my renovation projects and provide images for AI-powered staging.

## Context
With the API infrastructure (Story 7.3), auth routes (Story 6.1), and database schema (Story 7.2) in place, the next step is implementing the core Project CRUD endpoints and image upload functionality. This is a prerequisite for all product features — AI generation, chat refinement, and sharing all depend on projects existing.

## PRD Requirements Covered
| Requirement | Coverage |
|---|---|
| FR-01 (photo upload) | Partial — upload endpoint, file validation, Supabase Storage integration |
| FR-15 (perfil com historico) | Full — list user projects with pagination, project details |
| FR-03 (style variations) | Partial — project style field, update endpoint for style changes |
| NFR-08 (LGPD) | RLS enforcement — users only access own projects |
| NFR-10 (rate limiting) | Foundation — subscription-aware project limits |

## Acceptance Criteria

### AC-01: Create Project
- Given an authenticated user with valid JWT
- When POST /projects with body `{ name: "Sala de Estar", input_type: "photo", style: "moderno", room_type: "sala" }`
- Then a new project is created with status "draft", returns 201 with project data
- And the project is owned by the authenticated user (user_id from JWT)

### AC-02: List User Projects
- Given an authenticated user with 3+ projects
- When GET /projects with optional query params `?limit=20&cursor=<id>&status=draft`
- Then returns paginated list of user's own projects (newest first)
- And response includes `{ data: [...], pagination: { cursor, has_more, total } }`
- And only the authenticated user's projects are returned (RLS enforced)

### AC-03: Get Project Details
- Given an authenticated user who owns project with id X
- When GET /projects/:id
- Then returns project with related data (versions count, spatial_input status, latest_version thumbnail)
- And returns 404 if project doesn't exist or belongs to another user

### AC-04: Update Project
- Given an authenticated user who owns project with id X
- When PATCH /projects/:id with body `{ name: "Nova Sala", style: "industrial", is_favorite: true }`
- Then updates only provided fields, returns 200 with updated project
- And returns 404 if project doesn't belong to user

### AC-05: Delete Project
- Given an authenticated user who owns project with id X
- When DELETE /projects/:id
- Then soft-deletes the project (or cascades), returns 204 No Content
- And associated storage files are cleaned up asynchronously
- And returns 404 if project doesn't belong to user

### AC-06: Upload Room Photo
- Given an authenticated user with an existing project in "draft" status
- When POST /projects/:id/upload with multipart file (JPEG/PNG, max 20MB)
- Then file is validated (MIME type, size, magic bytes)
- And file is uploaded to Supabase Storage at `projects/{projectId}/original.{ext}`
- And project's `original_image_url` is updated with the storage URL
- And project status changes to "draft" (ready for analysis)
- And returns 201 with `{ data: { image_url, file_size, mime_type } }`

### AC-07: Upload Validation Errors
- Given a user attempts to upload an invalid file
- When file is >20MB, returns 413 with error code `FILE_TOO_LARGE`
- When file is not JPEG/PNG, returns 400 with error code `INVALID_FILE_TYPE`
- When project doesn't exist or isn't owned by user, returns 404

### AC-08: Input Validation
- Given invalid input on any endpoint
- When name is empty or >100 chars, returns 400 VALIDATION_ERROR
- When style is not one of 10 valid styles, returns 400 VALIDATION_ERROR
- When input_type is not photo|text|combined, returns 400 VALIDATION_ERROR
- All validation uses Zod schemas with descriptive error messages

### AC-09: Test Coverage
- Given the implementation is complete
- Then all endpoints have unit tests covering success and error paths
- And integration tests verify RLS isolation between users
- And `npm run lint`, `npm run typecheck`, and `npm test` all pass

## Tasks
- [x] Task 1: Create Zod validation schemas for project endpoints (`packages/api/src/schemas/project.schema.ts`)
- [x] Task 2: Implement project service with CRUD operations (`packages/api/src/services/project.service.ts`)
- [x] Task 3: Implement storage service for Supabase Storage file upload (`packages/api/src/services/storage.service.ts`)
- [x] Task 4: Create project routes with all endpoints (`packages/api/src/routes/project.routes.ts`)
- [x] Task 5: Register project routes in server and add multipart support (`packages/api/src/server.ts`)
- [x] Task 6: Write unit tests for project service (`packages/api/src/__tests__/project.service.test.ts`)
- [x] Task 7: Write unit tests for storage service (`packages/api/src/__tests__/storage.service.test.ts`)
- [x] Task 8: Write route integration tests (`packages/api/src/__tests__/project.routes.test.ts`)
- [x] Task 9: Verify lint, typecheck, and all tests pass

## Technical Notes

### API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /projects | Create new project | Required |
| GET | /projects | List user's projects (paginated) | Required |
| GET | /projects/:id | Get project details | Required |
| PATCH | /projects/:id | Update project metadata | Required |
| DELETE | /projects/:id | Delete project | Required |
| POST | /projects/:id/upload | Upload room photo | Required |

### Patterns to Follow
- Route pattern: `packages/api/src/routes/auth.routes.ts`
- Service pattern: `packages/api/src/services/auth.service.ts`
- Schema pattern: `packages/api/src/schemas/auth.schema.ts`
- Test pattern: `packages/api/src/__tests__/routes/auth.routes.test.ts`
- Use `supabaseAdmin` for server operations, `createUserClient` for RLS-respecting queries
- Use `AppError` for error handling with proper error codes
- Use `validate()` middleware for Zod schema validation
- Use `authMiddleware` for JWT authentication on all endpoints

### Supabase Storage Setup
- Bucket: `project-images` (authenticated access)
- Path pattern: `{userId}/{projectId}/original.{ext}`
- Signed URLs with 1-hour expiry for reads
- File validation: JPEG/PNG only, max 20MB, magic bytes check

### Zod Schemas
```typescript
// Create Project
{ name: string(1-100), input_type: enum, style: DecorStyle, room_type?: enum }

// Update Project
{ name?: string(1-100), style?: DecorStyle, room_type?: enum, is_favorite?: boolean }

// List Projects Query
{ limit?: number(1-50, default 20), cursor?: uuid, status?: ProjectStatus }
```

### Pagination
- Cursor-based using project `id` (UUID, ordered by created_at DESC)
- Default limit: 20, max: 50
- Response: `{ data: Project[], pagination: { cursor, has_more, total } }`

## Dependencies
- Story 7.1 (Monorepo scaffolding) - Done
- Story 7.2 (Database schema - projects table, RLS policies) - Done
- Story 7.3 (API infrastructure - auth middleware, error handler, validation) - Done
- Story 6.1 (Auth routes - JWT authentication) - Done

## Dev Agent Record
### Implementation Plan
Implemented following existing auth patterns: schema -> service -> routes -> server registration.

### Debug Log
- Fixed Database type stub: added `Relationships: []` to all table definitions for supabase-js v2.98.0 compatibility
- Fixed `@fastify/multipart` version: v9.x requires Fastify 5, downgraded to v8.x for Fastify 4 compat
- Fixed pre-existing type errors in reference.service.ts by adding `ReferenceItemRow` type casts

### Change Log
- 2026-03-09: Implemented all 9 tasks, all quality gates pass (158 API tests, 121 shared tests)

## Testing
- Unit tests for project service (CRUD operations, error handling) - 10 tests
- Unit tests for storage service (upload, validation, cleanup) - 10 tests
- Route tests for all 6 endpoints (success + error cases) - 23 tests
- RLS isolation tests (user A cannot access user B's projects) - via createUserClient
- File validation tests (size, type, magic bytes) - covered in storage service tests
- Pagination tests (cursor, limit, empty results) - covered in project service tests

## File List
- [x] `packages/api/src/schemas/project.schema.ts` (new)
- [x] `packages/api/src/services/project.service.ts` (new)
- [x] `packages/api/src/services/storage.service.ts` (new)
- [x] `packages/api/src/routes/project.routes.ts` (new)
- [x] `packages/api/src/server.ts` (modified - register routes + multipart)
- [x] `packages/api/src/__tests__/project.service.test.ts` (new)
- [x] `packages/api/src/__tests__/storage.service.test.ts` (new)
- [x] `packages/api/src/__tests__/project.routes.test.ts` (new)
- [x] `packages/api/package.json` (modified - added @fastify/multipart)
- [x] `packages/shared/src/types/database.types.ts` (modified - added Relationships, render_url)
- [x] `packages/api/src/services/reference.service.ts` (modified - type cast fixes)
- [x] `packages/api/src/__tests__/reference.service.test.ts` (modified - lint fix)

## QA Results

### Verdict: CONCERNS (Pass with documented concerns)

**Reviewed by:** Quinn (@qa) — 2026-03-09

### Quality Gates
| Gate | Status |
|------|--------|
| `npm run lint` | PASS (0 errors) |
| `npm run typecheck` | PASS (0 errors) |
| `npm test` | PASS (158 API + 121 shared = 279 tests) |

### Phase Results

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Code Quality | PASS | Clean, readable, follows project patterns |
| 2. Test Coverage | PASS | 43 tests (10 service + 10 storage + 23 routes) |
| 3. Acceptance Criteria | PASS | All 9 ACs verified (AC-01 through AC-09) |
| 4. Regressions | PASS | All pre-existing tests pass (auth, spatial, reference) |
| 5. Performance | PASS | Cursor pagination, async cleanup, no N+1 |
| 6. Security | PASS | Auth on all routes, RLS enforced, Zod validation, magic bytes |
| 7. Documentation | PASS | Story fully updated, dev record complete |
| 8. Technical Debt | CONCERN | File validation code duplicated (see below) |
| 9. Architecture | PASS | Follows schema->service->routes pattern |
| 10. Accessibility | N/A | Backend API only |

### Documented Concerns (non-blocking)

1. **Code duplication (minor):** File validation logic (magic bytes, MIME check, size limit, `getExtension`) is duplicated between `storage.service.ts` and `reference.service.ts`. Recommend extracting a shared `file-validation.util.ts` in a future story.

2. **getById sequential queries (minor):** `projectService.getById` makes 4 sequential Supabase queries (project, versions count, latest version, spatial input). Acceptable for MVP but could be optimized with joins in a future optimization pass.

3. **Test assertion pattern (minor):** Some tests in `storage.service.test.ts` use try/catch without `expect.unreachable()` — if the function doesn't throw, the test would silently pass. Not a bug but a test robustness concern.
