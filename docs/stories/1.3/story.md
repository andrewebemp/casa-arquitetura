# Story 1.3 - Staging Generation API: Upload de Foto, Selecao de Estilo e Orquestracao do Pipeline

## Status: Done

## Story
As a real estate professional, I want to upload a photo of an environment and select a decoration style so that the system generates a photorealistic decorated version in 10-30 seconds, allowing me to quickly visualize staging options for my listings.

## Acceptance Criteria

### AC1: Photo Upload and Style Selection Endpoint
- Given an authenticated user with available render quota, when they POST to `/api/projects/:projectId/staging/generate` with a photo (JPEG/PNG, up to 20MB) and a style selection, then the system creates a render job and returns job ID with status 202 Accepted
- Given the upload exceeds 20MB, when the request is sent, then the system returns 400 with descriptive error

### AC2: 10 Predefined Decoration Styles
- Given the staging generation endpoint, when a user queries GET `/api/staging/styles`, then the system returns the 10 predefined styles: modern, industrial, minimalist, classic, scandinavian, rustic, tropical, contemporary, boho, and luxury
- Given each style, when returned, then it includes: id, name (pt-BR), description, preview_url, and prompt_modifier for SDXL generation

### AC3: Pipeline Orchestration (Photo → Depth → ControlNet → SDXL)
- Given a valid render job, when the worker processes it, then it executes the pipeline: (1) depth estimation via ZoeDepth, (2) ControlNet conditioning with depth map, (3) SDXL generation with style prompt, (4) result storage in Supabase Storage
- Given the pipeline completes, when the result is stored, then a new project version is created with the generated image URL and metadata (style, dimensions, generation_time_ms)

### AC4: Real-time Progress Updates
- Given a render job in progress, when each pipeline stage completes, then a progress event is broadcast via Supabase Realtime with stage name and percentage (depth: 25%, controlnet: 50%, generation: 75%, storage: 100%)
- Given the render completes or fails, when the final event is sent, then it includes status (completed/failed) and result URL or error message

### AC5: 1-Click Style Variation
- Given an existing project with a completed render, when the user POST to `/api/projects/:projectId/staging/variation` with a different style_id, then the system reuses the original photo and depth map (skipping re-upload and re-estimation) and generates a new variation in the selected style
- Given the variation completes, when stored, then it is linked to the same project as a new version with style metadata

### AC6: Quota and Tier Enforcement
- Given a user on the Free tier with 3 renders already used this month, when they attempt staging generation, then the system returns 403 with quota_exceeded error and upgrade CTA
- Given a user on Pro or Business tier, when they generate staging, then the output resolution follows their tier (Free: 1024x1024 with watermark placeholder, Pro: 2048x2048, Business: 2048x2048)

## Technical Notes
- Reuse existing services: `render-queue.js` (Story 7.5), `ai-pipeline` endpoints (Story 7.6), `quota-service.js` (Story 7.5)
- Depth map caching: store depth maps in Supabase Storage keyed by project+photo hash to enable fast style variations (AC5)
- Style prompts: each style maps to SDXL prompt modifiers + negative prompts for consistent aesthetics
- Pipeline timeout: 60s max per job (align with NFR-01 target of 10-30s generation)

## Requirements Covered
| Requirement | Description | Coverage |
|------------|-------------|----------|
| FR-01 | Upload photo and generate decorated version in 10-30s | Full |
| FR-02 | 10 predefined decoration styles | Full |
| FR-03 | Generate style variations with 1 click | Full |
| FR-20 | HD resolution (2048x2048) for paid tiers | Partial (tier-based) |

## Tasks
- [x] Task 1: Create styles registry module with 10 predefined styles (id, name, description, prompt_modifier, negative_prompt)
- [x] Task 2: Implement GET `/api/staging/styles` endpoint returning all available styles
- [x] Task 3: Implement POST `/api/projects/:projectId/staging/generate` endpoint with photo upload + style selection
- [x] Task 4: Create staging orchestrator service that coordinates: upload → depth estimation → ControlNet → SDXL → storage
- [x] Task 5: Integrate with existing render queue (BullMQ) and quota service for job submission
- [x] Task 6: Add pipeline progress broadcasting via Supabase Realtime (stage-by-stage updates)
- [x] Task 7: Implement POST `/api/projects/:projectId/staging/variation` for 1-click style change with depth map reuse
- [x] Task 8: Implement depth map caching in Supabase Storage (keyed by photo hash)
- [x] Task 9: Add version creation with style metadata after successful generation
- [x] Task 10: Write unit tests for styles registry, orchestrator service, and variation logic
- [x] Task 11: Write integration tests for staging endpoints (generate + variation + styles)

## Dependencies
- Story 7.4 (Project CRUD & Upload) — project management and file upload
- Story 7.5 (Render Job Queue) — BullMQ queue, quota service, realtime progress
- Story 7.6 (AI Pipeline Core) — SDXL generation, ZoeDepth, ControlNet endpoints
- Story 1.1 (Spatial Input API) — spatial data and reference items for the project

## Dev Agent Record
### Implementation Plan
Implemented full Staging Generation API with styles registry, orchestrator service, and three endpoints (styles, generate, variation). Reused existing render queue, quota service, AI pipeline client, and storage service.

### Debug Log
- Fixed typecheck error: `thumbnail_url` required in `project_versions` Insert type
- Fixed test: Fastify returns 406 for non-multipart requests to multipart endpoint

### Change Log
- 2026-03-09: Full implementation of Story 1.3 by @dev (Dex)

## Testing
- Unit tests for styles registry (10 styles with required fields)
- Unit tests for staging orchestrator (pipeline stage coordination)
- Unit tests for depth map cache (hit/miss scenarios)
- Integration tests for POST /staging/generate (happy path + quota exceeded + invalid file)
- Integration tests for POST /staging/variation (reuse depth map + new style)
- Integration tests for GET /staging/styles (returns 10 styles)

## File List
- `packages/api/src/services/staging-styles.registry.ts` — NEW: 10 predefined decoration styles with prompt modifiers
- `packages/api/src/schemas/staging.schema.ts` — NEW: Zod schemas for staging endpoints
- `packages/api/src/services/staging.service.ts` — NEW: Staging orchestrator (generate, variation, processJob, depth map cache)
- `packages/api/src/routes/staging.routes.ts` — NEW: Routes for GET /styles, POST /generate, POST /variation
- `packages/api/src/queue/staging.handler.ts` — NEW: Worker handler for staging/style_change job dispatch
- `packages/api/src/queue/render.worker.ts` — MODIFIED: Added staging job type routing
- `packages/api/src/server.ts` — MODIFIED: Register stagingStylesRoutes and stagingRoutes
- `packages/api/src/__tests__/staging-styles.registry.test.ts` — NEW: 8 unit tests for styles registry
- `packages/api/src/__tests__/staging.service.test.ts` — NEW: Unit tests for staging service (generate, variation, processJob, depth map cache)
- `packages/api/src/__tests__/staging.routes.test.ts` — NEW: Integration tests for staging endpoints

## QA Results
