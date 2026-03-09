# Story 3.2 - Lighting Correction API: IC-Light Auto-Enhancement e Correcao de Exposicao

## Status: Done

## Story
As a real estate professional, I want the system to automatically detect and correct dark or poorly exposed photos, improving natural and artificial lighting, so that my listing images look professional and well-lit without manual photo editing.

## Acceptance Criteria

### AC1: Lighting Analysis Endpoint
- Given an authenticated user with a project that has an uploaded or rendered image, when they POST to `/api/projects/:projectId/enhance-lighting` with `{ "image_version_id": "..." }`, then the system analyzes the image exposure and lighting conditions, returning a lighting assessment with metrics (brightness_score 0-100, exposure_level: underexposed|normal|overexposed, lighting_issues: array of detected problems)
- Given a well-lit image (brightness_score > 70), when the analysis completes, then the system returns the assessment with a `needs_enhancement: false` flag but still allows the user to proceed with enhancement if desired
- Given an image that does not belong to the user's project, when the request is sent, then the system returns 403 Forbidden

### AC2: IC-Light Auto-Enhancement
- Given an image flagged as underexposed or poorly lit, when the user confirms enhancement (or `auto_enhance: true` is sent), then the system calls IC-Light V2 via fal.ai to relight the image with improved natural lighting, preserving the original scene composition and returning the enhanced image URL
- Given the enhancement completes, when the result is stored, then a new project version is created with type `lighting_enhancement`, the enhanced image URL, metadata (original_brightness, enhanced_brightness, lighting_mode used), and the version is linked to the project history
- Given the IC-Light processing takes time, when processing, then progress events are broadcast via Supabase Realtime (analyzing: 20%, enhancing: 50%, blending: 75%, storage: 100%)

### AC3: Lighting Enhancement Modes
- Given the enhance-lighting endpoint, when the user specifies a `mode` parameter, then the system supports three modes:
  - `auto` (default): IC-Light analyzes and applies optimal lighting correction
  - `natural`: Emphasizes natural daylight simulation (window light, ambient)
  - `warm`: Applies warm interior lighting (evening ambiance, accent lights)
- Given a mode is selected, when the enhancement runs, then IC-Light uses the corresponding text-conditioned prompt for relighting

### AC4: Batch Enhancement on Upload
- Given a user uploads a new photo to a project (via existing upload endpoint from Story 7.4), when the system detects brightness_score < 40 (severely underexposed), then it automatically suggests lighting enhancement via the response with `lighting_suggestion: { needs_enhancement: true, brightness_score: N, recommended_mode: "auto" }` — but does NOT auto-apply without user consent
- Given the upload analysis, when the user's photo is too dark to generate quality staging, then the suggestion message includes a PT-BR explanation: "Sua foto parece estar escura. Recomendamos melhorar a iluminacao antes de gerar o staging para melhores resultados."

### AC5: Version Integration and Undo
- Given a user has applied lighting enhancement, when they query project versions (GET `/api/projects/:projectId/versions`), then the enhanced version appears in the version history with type `lighting_enhancement` and can be reverted to the original
- Given a user applies lighting enhancement and then requests staging generation, when the staging pipeline runs, then it uses the enhanced (most recent) image version as input — not the original dark photo

### AC6: Quota and Quality Controls
- Given a user on any tier, when they request lighting enhancement, then the operation counts as 1 render credit against their quota (same as other render operations)
- Given the IC-Light result, when the enhanced image is produced, then quality validation ensures: brightness improved (delta > 10 points), no color cast artifacts, no loss of detail in highlights/shadows, and the image dimensions match the original

## Technical Notes
- IC-Light V2 is available on fal.ai (see research/decorai-tools-research.md) — use fal.ai API endpoint
- IC-Light supports text-conditioned relighting: prompt describes desired lighting conditions
- Brightness analysis can use simple histogram analysis (no external API needed) — calculate mean luminance from image
- The endpoint follows the same patterns as Story 3.1 (Fastify plugin route, service layer, Zod schemas, BullMQ queue)
- Reuse existing services: render-queue (Story 7.5), ai-pipeline client (Story 7.6), quota-service (Story 7.5), realtime progress (Story 7.5)
- RefinementEngine component in ai-pipeline handles IC-Light orchestration (architecture/fullstack/components.md)
- Job type for render queue: `lighting_enhancement` (extends existing render_job_type enum)
- API endpoint defined in architecture: POST `/projects/:id/enhance-lighting` (api-spec.md)
- Lighting analysis prompts for IC-Light modes:
  - `auto`: "Professional real estate photography lighting, well-balanced exposure"
  - `natural`: "Bright natural daylight from windows, soft ambient light, clean exposure"
  - `warm`: "Warm evening interior lighting, accent lights, cozy ambiance"

## Requirements Covered
| Requirement | Description | Coverage |
|------------|-------------|----------|
| FR-08 | O sistema deve corrigir automaticamente fotos escuras ou mal expostas, melhorando iluminacao natural e artificial | Full |

## Tasks
- [x] Task 1: Create IC-Light client service in api package (`ic-light.client.ts`) wrapping fal.ai IC-Light V2 endpoint with text-conditioned and background-conditioned modes
- [x] Task 2: Create lighting analysis module (`lighting-analysis.ts`) that computes brightness score (0-100) via histogram analysis, detects exposure level, and identifies lighting issues
- [x] Task 3: Create lighting enhancement service (`lighting.service.ts`) orchestrating: analyze -> IC-Light relight -> quality validation -> version creation -> storage
- [x] Task 4: Create Zod validation schemas for enhance-lighting endpoint (`lighting.schema.ts`)
- [x] Task 5: Implement POST `/api/projects/:projectId/enhance-lighting` route handler (`lighting.routes.ts`) with mode selection (auto/natural/warm) and lighting analysis response
- [x] Task 6: Add `lighting_enhancement` job type to render worker and BullMQ queue handler (`lighting.handler.ts`)
- [x] Task 7: Add Supabase Realtime progress broadcasting for lighting enhancement pipeline stages
- [x] Task 8: Integrate lighting suggestion into existing upload flow (extend Story 7.4 upload response with brightness analysis)
- [x] Task 9: Integrate with quota service (enhance-lighting = 1 render credit)
- [x] Task 10: Extend ai-pipeline client with `enhanceLighting()` method
- [x] Task 11: Write unit tests for IC-Light client, lighting analysis, and lighting service
- [x] Task 12: Write integration tests for enhance-lighting endpoint (all modes, quota, version creation, error cases)

## Dependencies
- Story 7.4 (Project CRUD & Upload) — project management, file storage, upload endpoint to extend
- Story 7.5 (Render Job Queue) — BullMQ queue, quota service, realtime progress
- Story 7.6 (AI Pipeline Core) — AI client infrastructure, fal.ai integration
- Story 1.3 (Staging Generation) — version management patterns, image pipeline patterns

## Dev Agent Record
### Implementation Plan
Followed Story 3.1 (Segmentation) patterns: Fastify plugin route, service layer, Zod schemas, BullMQ queue handler, AI pipeline client extension.

### Debug Log
No issues encountered. Previous attempt had all core files in place; only missing `lighting_enhancement` in render.schema.ts RENDER_JOB_TYPES.

### Change Log
- 2026-03-09: Implemented all 12 tasks. All quality gates pass (lint, typecheck, 464 tests).

## Testing
- `ic-light.client.test.ts` — 7 tests (prompt modes, fal.ai API calls, error handling)
- `lighting-analysis.test.ts` — 13 tests (buffer analysis, score analysis, quality validation)
- `lighting.service.test.ts` — 7 tests (analyze, create job, process pipeline, error cases)
- `lighting.routes.test.ts` — 8 tests (200/202 responses, auth, validation, modes, 403)

## File List
### New Files
- `packages/api/src/services/ic-light.client.ts` — IC-Light V2 fal.ai client
- `packages/api/src/services/lighting-analysis.ts` — Brightness analysis module
- `packages/api/src/services/lighting.service.ts` — Lighting enhancement orchestration
- `packages/api/src/schemas/lighting.schema.ts` — Zod validation schemas
- `packages/api/src/routes/lighting.routes.ts` — POST /enhance-lighting endpoint
- `packages/api/src/queue/lighting.handler.ts` — BullMQ job handler
- `packages/api/src/__tests__/ic-light.client.test.ts` — IC-Light client tests
- `packages/api/src/__tests__/lighting-analysis.test.ts` — Analysis module tests
- `packages/api/src/__tests__/lighting.service.test.ts` — Service tests
- `packages/api/src/__tests__/lighting.routes.test.ts` — Route integration tests

### Modified Files
- `packages/api/src/lib/ai-pipeline.client.ts` — Added `enhanceLighting()` method
- `packages/api/src/queue/render.worker.ts` — Added lighting_enhancement dispatch
- `packages/api/src/schemas/render.schema.ts` — Added lighting_enhancement to RENDER_JOB_TYPES
- `packages/api/src/server.ts` — Registered lightingRoutes

## QA Results
