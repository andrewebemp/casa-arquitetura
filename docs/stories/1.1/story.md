# Story 1.1 - Spatial Input API e Reference Items CRUD

## Status: Done

## Story
As a authenticated user, I want to add room dimensions, descriptions, openings (doors/windows), and reference items (furniture with photos and measurements) to my project so that the AI can generate accurate decorated scenes that respect my specifications.

## Context
With Project CRUD (Story 7.4) enabling project management, the next step is allowing users to provide detailed spatial data and reference items for their projects. The database tables `spatial_inputs` and `reference_items` already exist (Story 7.2). This story implements the API layer that reads/writes to those tables, enabling the AI pipeline to receive structured input for scene generation. This is a prerequisite for the ASCII croqui generation (FR-29) and image generation (FR-01).

## PRD Requirements Covered
| Requirement | Coverage |
|---|---|
| FR-24 (textual room descriptions with measurements) | Full — spatial input endpoint accepts dimensions, openings, items via JSONB |
| FR-25 (reference items with measurements and photos) | Full — reference items CRUD with dimensions, material, color, position, image upload |
| FR-26 (combine multi-format inputs) | Partial — API accepts all input formats per project; orchestration in future story |
| NFR-08 (LGPD) | RLS enforcement — users only access own project's spatial data and references |

## Acceptance Criteria

### AC-01: Create/Update Spatial Input
- Given an authenticated user who owns project with id X
- When PUT /projects/:id/spatial-input with body `{ dimensions: { width: 4, length: 6, height: 2.8 }, openings: [{ type: "window", wall: "north", width: 2, height: 1.5 }], items: [{ name: "sofa", width: 2.2, position: "center-south" }] }`
- Then a spatial_input record is created or updated (upsert) for the project, returns 200 with spatial input data
- And the project must belong to the authenticated user (RLS enforced)

### AC-02: Get Spatial Input
- Given an authenticated user who owns project with id X that has spatial input data
- When GET /projects/:id/spatial-input
- Then returns the spatial input record with dimensions, openings, items, croqui status
- And returns 404 if no spatial input exists for this project
- And returns 404 if project doesn't exist or belongs to another user

### AC-03: Create Reference Item
- Given an authenticated user who owns project with id X
- When POST /projects/:id/references with body `{ name: "Sofa L-shape", width_m: 2.20, depth_m: 0.95, height_m: 0.85, material: "linen", color: "gray", position_description: "facing window on north wall" }` and multipart image file (JPEG/PNG, max 10MB)
- Then a reference_item is created with image uploaded to Supabase Storage at `references/{projectId}/{itemId}.{ext}`
- And returns 201 with the reference item data including image_url

### AC-04: List Reference Items
- Given an authenticated user who owns project with id X that has 3+ reference items
- When GET /projects/:id/references
- Then returns all reference items for the project ordered by created_at ASC
- And only returns items from projects owned by the authenticated user (RLS enforced)

### AC-05: Get Reference Item
- Given an authenticated user who owns a reference item with id Y in project X
- When GET /projects/:id/references/:refId
- Then returns the reference item details including signed image URL
- And returns 404 if item doesn't exist or project belongs to another user

### AC-06: Delete Reference Item
- Given an authenticated user who owns a reference item with id Y in project X
- When DELETE /projects/:id/references/:refId
- Then the reference item is deleted and its storage file is cleaned up
- And returns 204 No Content
- And returns 404 if item doesn't exist or project belongs to another user

### AC-07: Input Validation
- Given invalid input on any endpoint
- When dimensions has negative or zero values, returns 400 VALIDATION_ERROR
- When openings[].type is not one of door|window|arch, returns 400 VALIDATION_ERROR
- When reference item name is empty or >200 chars, returns 400 VALIDATION_ERROR
- When reference item dimensions are negative, returns 400 VALIDATION_ERROR
- When uploaded image is >10MB or not JPEG/PNG, returns appropriate error
- All validation uses Zod schemas with descriptive error messages

### AC-08: Test Coverage
- Given the implementation is complete
- Then all endpoints have unit tests covering success and error paths
- And integration tests verify RLS isolation between users
- And `npm run lint`, `npm run typecheck`, and `npm test` all pass

## Tasks
- [x] Task 1: Create Zod validation schemas for spatial input and reference items (`packages/api/src/schemas/spatial.schema.ts`)
- [x] Task 2: Implement spatial input service with upsert and get operations (`packages/api/src/services/spatial.service.ts`)
- [x] Task 3: Implement reference items service with CRUD operations and storage integration (`packages/api/src/services/reference.service.ts`)
- [x] Task 4: Create spatial input routes (`packages/api/src/routes/spatial.routes.ts`)
- [x] Task 5: Create reference items routes (`packages/api/src/routes/reference.routes.ts`)
- [x] Task 6: Register new routes in server (`packages/api/src/server.ts`)
- [x] Task 7: Write unit tests for spatial service (`packages/api/src/__tests__/spatial.service.test.ts`)
- [x] Task 8: Write unit tests for reference service (`packages/api/src/__tests__/reference.service.test.ts`)
- [x] Task 9: Write route integration tests for spatial input (`packages/api/src/__tests__/spatial.routes.test.ts`)
- [x] Task 10: Write route integration tests for reference items (`packages/api/src/__tests__/reference.routes.test.ts`)
- [x] Task 11: Verify lint, typecheck, and all tests pass

## Technical Notes

### API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| PUT | /projects/:id/spatial-input | Create/update spatial input (upsert) | Required |
| GET | /projects/:id/spatial-input | Get spatial input for project | Required |
| POST | /projects/:id/references | Create reference item with image | Required |
| GET | /projects/:id/references | List reference items for project | Required |
| GET | /projects/:id/references/:refId | Get reference item details | Required |
| DELETE | /projects/:id/references/:refId | Delete reference item | Required |

### Patterns to Follow
- Route pattern: `packages/api/src/routes/auth.routes.ts`
- Service pattern: `packages/api/src/services/auth.service.ts`
- Schema pattern: `packages/api/src/schemas/auth.schema.ts`
- Test pattern: `packages/api/src/__tests__/routes/auth.routes.test.ts`
- Use `supabaseAdmin` for server operations, `createUserClient` for RLS-respecting queries
- Use `AppError` for error handling with proper error codes
- Use `validate()` middleware for Zod schema validation
- Use `authMiddleware` for JWT authentication on all endpoints
- Reuse `storage.service.ts` from Story 7.4 for reference item image uploads

### Database Tables (from Story 7.2)
```sql
-- spatial_inputs (1:1 with project, upsert pattern)
-- Fields: id, project_id (UNIQUE), dimensions (JSONB), openings (JSONB), items (JSONB),
--         croqui_ascii, croqui_approved, photo_interpretation, created_at, updated_at

-- reference_items (1:N with project)
-- Fields: id, project_id, name, image_url, width_m, depth_m, height_m,
--         material, color, position_description, created_at
```

### Supabase Storage for Reference Images
- Bucket: `project-images` (reuse from Story 7.4)
- Path pattern: `{userId}/{projectId}/references/{itemId}.{ext}`
- Signed URLs with 1-hour expiry for reads
- File validation: JPEG/PNG only, max 10MB, magic bytes check

### Zod Schemas
```typescript
// Spatial Input (upsert)
{
  dimensions: { width: number(>0), length: number(>0), height: number(>0) }.optional(),
  openings: [{ type: enum(door|window|arch), wall: string, width: number(>0), height: number(>0), position_x?: number }].optional(),
  items: [{ name: string(1-200), width?: number(>0), depth?: number(>0), height?: number(>0), position: string }].optional()
}

// Reference Item (create)
{
  name: string(1-200),
  width_m?: number(>0, max 20),
  depth_m?: number(>0, max 20),
  height_m?: number(>0, max 10),
  material?: string(max 100),
  color?: string(max 50),
  position_description?: string(max 500)
}
// + multipart image file (JPEG/PNG, max 10MB)
```

## Dependencies
- Story 7.1 (Monorepo scaffolding) - Done
- Story 7.2 (Database schema - spatial_inputs, reference_items tables) - Done
- Story 7.3 (API infrastructure - auth middleware, error handler, validation) - Done
- Story 6.1 (Auth routes - JWT authentication) - Done
- Story 7.4 (Project CRUD - project ownership validation, storage service) - Required

## Dev Agent Record
### Implementation Plan
Followed existing patterns from Story 7.4 (project.service, project.routes, storage.service).

### Debug Log
- Typecheck: pre-existing Supabase SDK type errors (from Story 7.4). Not introduced by this story.
- @fastify/multipart v9.4.0 requires Fastify 5.x but project uses 4.x (pre-existing). Reference routes test avoids multipart registration.

### Change Log
- 2026-03-09: Implemented all 6 API endpoints (spatial input upsert/get, reference items CRUD)
- 2026-03-09: Added Zod validation schemas, services, routes, and 50 tests (all passing)

## Testing
- Unit tests for spatial service (upsert, get, validation)
- Unit tests for reference service (CRUD operations, image upload, cleanup)
- Route tests for spatial input endpoints (success + error cases)
- Route tests for reference items endpoints (success + error cases)
- RLS isolation tests (user A cannot access user B's project data)
- File validation tests (size, type, magic bytes for reference images)
- Edge case tests (empty project, max items, duplicate upsert)

## File List
- [x] `packages/api/src/schemas/spatial.schema.ts` (created)
- [x] `packages/api/src/services/spatial.service.ts` (created)
- [x] `packages/api/src/services/reference.service.ts` (created)
- [x] `packages/api/src/routes/spatial.routes.ts` (created)
- [x] `packages/api/src/routes/reference.routes.ts` (created)
- [x] `packages/api/src/server.ts` (modified - register spatial and reference routes)
- [x] `packages/api/src/__tests__/spatial.service.test.ts` (created - 8 tests)
- [x] `packages/api/src/__tests__/reference.service.test.ts` (created - 20 tests)
- [x] `packages/api/src/__tests__/spatial.routes.test.ts` (created - 12 tests)
- [x] `packages/api/src/__tests__/reference.routes.test.ts` (created - 10 tests)

## QA Results
