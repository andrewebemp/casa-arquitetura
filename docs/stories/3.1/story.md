# Story 3.1 - Segmentation API: SAM Element Segmentation, Material Swap e Inpainting por Elemento

## Status: Done

## Story
As a real estate professional, I want to select individual elements in a staged image (wall, floor, countertop, cabinet) and swap their material or texture so that I can fine-tune the decoration to match my client's preferences without regenerating the entire scene.

## Acceptance Criteria

### AC1: SAM Segmentation Endpoint
- Given an authenticated user with a project that has a completed render, when they POST to `/api/projects/:projectId/segment` with coordinates (x, y) or a bounding box on the rendered image, then the system calls SAM 2 to segment the element at that location and returns the segmentation mask (polygon data + mask image URL) with element classification (wall, floor, countertop, cabinet, ceiling, furniture, other)
- Given invalid coordinates (outside image bounds), when the request is sent, then the system returns 400 with descriptive error
- Given no completed render exists for the project, when the request is sent, then the system returns 404 with "no render available for segmentation"

### AC2: Full-Image Segmentation (Auto-detect All Elements)
- Given an authenticated user, when they POST to `/api/projects/:projectId/segment/all`, then the system runs SAM 2 in automatic mode to detect and classify all major elements in the image, returning an array of segments with id, label, mask_url, bounding_box, and confidence score
- Given the segmentation completes, when the results are returned, then each segment has a unique ID that can be referenced in subsequent apply operations

### AC3: Material/Texture Swap on Segment
- Given a valid segment from AC1 or AC2, when the user POST to `/api/projects/:projectId/segment/apply` with segment_id and a material descriptor (e.g., "dark hardwood floor", "white marble countertop", "light gray wall paint"), then the system uses ControlNet + SDXL inpainting to regenerate only the masked region with the new material while preserving the rest of the image
- Given the material swap completes, when the result is stored, then a new project version is created with the modified image URL, metadata (segment_id, original_material, new_material), and the version is linked to the project history
- Given the inpainting takes longer than expected, when processing, then progress events are broadcast via Supabase Realtime (segmenting: 25%, inpainting: 50%, blending: 75%, storage: 100%)

### AC4: Multiple Sequential Swaps
- Given a user has already applied a material swap, when they request another segment/apply on the latest version, then the system uses the most recent image version (not the original) as the base, allowing cumulative edits
- Given multiple swaps have been applied, when the user queries project versions, then each swap is tracked as an individual version with undo capability (reverting to previous version)

### AC5: Element Classification and Material Catalog
- Given the segmentation endpoint, when a segment is detected, then the system classifies it into one of the predefined categories: wall, floor, countertop, cabinet, ceiling, window, door, furniture_large, furniture_small, decoration, other
- Given a classified element, when the user queries GET `/api/projects/:projectId/segment/:segmentId/materials`, then the system returns a curated list of suggested materials appropriate for that element type (e.g., floor -> hardwood, tile, marble, vinyl, concrete)

### AC6: Quota and Quality Controls
- Given a user on the Free tier, when they attempt segmentation operations, then the operation counts against their render quota (each segment/apply = 1 render credit)
- Given the inpainting result, when the blended image is produced, then edge blending ensures seamless transitions between the new material and surrounding areas (no visible seams or artifacts at mask boundaries)

## Technical Notes
- SAM 2 runs via fal.ai or Replicate (see external-apis.md) — prefer fal.ai for latency
- Inpainting uses SDXL img2img with mask — ControlNet depth conditioning preserves 3D structure
- Material descriptors are converted to SDXL prompts using the existing style prompt system (staging-styles.registry.ts pattern)
- Mask data stored in Supabase Storage as PNG with alpha channel, keyed by project + version + segment
- Reuse existing services: render-queue (Story 7.5), ai-pipeline client (Story 7.6), quota-service (Story 7.5), realtime progress (Story 7.5)
- RefinementEngine component in ai-pipeline handles SAM + inpainting orchestration (architecture/fullstack/components.md)
- Job type for render queue: `segmentation` (already defined in domain model)

## Requirements Covered
| Requirement | Description | Coverage |
|------------|-------------|----------|
| FR-07 | Segmentacao e troca individual de elementos: parede, piso, bancada, armario usando SAM | Full |

## Tasks
- [x] Task 1: Create SAM client service in ai-pipeline package (`sam-client.ts`) with point-based and automatic segmentation modes via fal.ai/Replicate
- [x] Task 2: Create element classifier module that maps SAM segments to predefined categories (wall, floor, countertop, cabinet, etc.) using CLIP or heuristics
- [x] Task 3: Create material catalog registry with curated materials per element type (similar pattern to `staging-styles.registry.ts`)
- [x] Task 4: Create segmentation service (`segmentation.service.ts`) orchestrating: SAM segmentation -> classification -> mask storage
- [x] Task 5: Implement POST `/api/projects/:projectId/segment` endpoint (point-based segmentation)
- [x] Task 6: Implement POST `/api/projects/:projectId/segment/all` endpoint (auto-detect all elements)
- [x] Task 7: Create inpainting service for material swap: mask + material prompt -> SDXL inpainting -> edge blending -> storage
- [x] Task 8: Implement POST `/api/projects/:projectId/segment/apply` endpoint (material swap on segment)
- [x] Task 9: Implement GET `/api/projects/:projectId/segment/:segmentId/materials` endpoint (suggested materials)
- [x] Task 10: Add segmentation job type to render worker and queue handler (extends Story 7.5 worker)
- [x] Task 11: Add Supabase Realtime progress broadcasting for segmentation pipeline stages
- [x] Task 12: Integrate with quota service (segment/apply counts as render credit)
- [x] Task 13: Write unit tests for SAM client, element classifier, material catalog, and segmentation service
- [x] Task 14: Write integration tests for all segmentation endpoints (segment, segment/all, apply, materials)

## Dependencies
- Story 7.4 (Project CRUD & Upload) — project management and file storage
- Story 7.5 (Render Job Queue) — BullMQ queue, quota service, realtime progress
- Story 7.6 (AI Pipeline Core) — AI client infrastructure, fal.ai/Replicate integration
- Story 1.3 (Staging Generation) — completed renders as input for segmentation

## Dev Agent Record
### Implementation Plan
Implemented segmentation API following existing codebase patterns (Fastify plugin routes, object-with-methods services, Zod schemas, BullMQ queue integration).

### Debug Log
No issues encountered during implementation.

### Change Log
- Created `sam-client.ts` - SAM 2 client with point, box, and auto segmentation modes
- Created `element-classifier.ts` - Heuristic classifier mapping labels to 11 element categories
- Created `material-catalog.registry.ts` - 33 curated materials across all element categories
- Created `segmentation.service.ts` - Orchestration service for segment, segment/all, apply, and processJob
- Created `inpainting.service.ts` - Material swap via SDXL inpainting with prompt building
- Created `segmentation.schema.ts` - Zod validation schemas for all endpoints
- Created `segmentation.routes.ts` - 4 Fastify route handlers (segment, segment/all, apply, materials)
- Created `segmentation.handler.ts` - BullMQ worker handler for segmentation jobs
- Extended `ai-pipeline.client.ts` with `segment()` and `inpaint()` methods
- Modified `render.worker.ts` to dispatch segmentation job type
- Registered segmentation routes in `server.ts`
- Created 6 test files with 47 total tests covering all acceptance criteria

## Testing
- Unit tests for SAM client (point-based and auto segmentation modes, error handling)
- Unit tests for element classifier (category mapping, confidence thresholds)
- Unit tests for material catalog (materials per element type, validation)
- Unit tests for segmentation service (orchestration flow, mask storage)
- Unit tests for inpainting service (mask + prompt -> result, edge blending)
- Integration tests for POST /segment (happy path + invalid coords + no render)
- Integration tests for POST /segment/all (auto-detect all elements)
- Integration tests for POST /segment/apply (material swap + version creation + cumulative edits)
- Integration tests for GET /segment/:id/materials (suggested materials by element type)
- Integration tests for quota enforcement (Free tier credit deduction)

## File List
- `packages/api/src/services/sam-client.ts` (new)
- `packages/api/src/services/element-classifier.ts` (new)
- `packages/api/src/services/material-catalog.registry.ts` (new)
- `packages/api/src/services/segmentation.service.ts` (new)
- `packages/api/src/services/inpainting.service.ts` (new)
- `packages/api/src/schemas/segmentation.schema.ts` (new)
- `packages/api/src/routes/segmentation.routes.ts` (new)
- `packages/api/src/queue/segmentation.handler.ts` (new)
- `packages/api/src/lib/ai-pipeline.client.ts` (modified)
- `packages/api/src/queue/render.worker.ts` (modified)
- `packages/api/src/server.ts` (modified)
- `packages/api/src/__tests__/sam-client.test.ts` (new)
- `packages/api/src/__tests__/element-classifier.test.ts` (new)
- `packages/api/src/__tests__/material-catalog.test.ts` (new)
- `packages/api/src/__tests__/segmentation.service.test.ts` (new)
- `packages/api/src/__tests__/inpainting.service.test.ts` (new)
- `packages/api/src/__tests__/segmentation.routes.test.ts` (new)

## QA Results
