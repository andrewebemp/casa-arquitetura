# Story 3.3 - Object Removal API: LaMa Inpainting para Remocao de Objetos Indesejados

## Status: Done

## Story
As a real estate professional, I want to select and remove unwanted objects from photos (clutter, old furniture, personal items) using AI inpainting so that listing images look clean and professionally staged without manual photo editing.

## Acceptance Criteria

### AC1: Object Selection for Removal (Point Mode)
- Given an authenticated user with a project that has an uploaded or rendered image, when they POST to `/api/projects/:projectId/remove-object` with a point coordinate `{ x, y }` on the object to remove, then the system uses SAM 2 to segment the object at that location and returns a preview of the detected mask (mask_id, mask_url, bounding_box, label, confidence) without performing removal yet
- Given invalid coordinates (outside image bounds), when the request is sent, then the system returns 400 with descriptive error
- Given no image exists for the project, when the request is sent, then the system returns 404 with "no image available for object removal"

### AC2: Object Selection for Removal (Bounding Box Mode)
- Given an authenticated user, when they POST to `/api/projects/:projectId/remove-object` with a bounding_box `{ x1, y1, x2, y2 }` instead of point coordinates, then the system segments the primary object within that bounding box using SAM 2 and returns the mask preview
- Given the bounding box contains multiple objects, when segmentation runs, then the system returns the most prominent object (highest confidence) within the box

### AC3: Object Removal via LaMa Inpainting
- Given a valid object mask from AC1 or AC2, when the user POSTs to `/api/projects/:projectId/remove-object/apply` with `{ mask_id }`, then the system uses LaMa inpainting (Large Mask Inpainting with Fourier Convolutions) to fill the masked region with contextually appropriate content (surrounding floor, wall, or background continuation), creating a clean seamless result
- Given the mask is generated, when LaMa processes the inpainting, then the mask is dilated by 5-10px before inpainting to ensure complete object coverage and smooth boundary transitions
- Given the removal completes, when the result is stored, then a new project version is created with type `object_removal`, the cleaned image URL, metadata (mask_id, object_label, removed_area_bbox, mask_url), and the version is linked to the project history

### AC4: Multi-Object Removal in Single Request
- Given a user wants to remove multiple objects, when they POST to `/api/projects/:projectId/remove-object/batch` with an array of mask_ids (up to 10), then the system generates a combined dilated mask covering all selected objects and performs a single LaMa inpainting pass, producing one clean result
- Given a batch removal, when the result is stored, then one project version is created containing metadata for all removed objects
- Given more than 10 mask_ids in a single batch request, when the request is sent, then the system returns 400 with "maximum 10 objects per batch removal"

### AC5: Cumulative Removal with Version History
- Given a user has already applied an object removal, when they request another remove-object on the latest version, then the system uses the most recent image version as the base, allowing cumulative edits
- Given multiple removals have been applied across versions, when the user queries project versions (GET `/api/projects/:projectId/versions`), then each removal appears in the version history with type `object_removal` and can be individually reverted

### AC6: Realtime Progress and Quota
- Given the object removal pipeline is processing, when inpainting runs, then progress events are broadcast via Supabase Realtime (segmenting: 20%, masking: 40%, inpainting: 60%, blending: 80%, storage: 100%)
- Given a user on any tier, when they request object removal (apply or batch), then the operation counts as 1 render credit against their quota
- Given the LaMa inpainting result, when the cleaned image is produced, then quality validation ensures: no visible seams at mask boundaries, fill region matches surrounding context (texture, color, perspective), and image dimensions match the original

## Technical Notes
- **LaMa is the primary inpainting engine** for object removal (architecture: tech-stack.md, research: decorai-tools-research.md) — NOT SDXL inpainting
- LaMa excels at large-mask inpainting with Fourier convolutions — ideal for furniture-sized object removal, resolution-robust
- LaMa available via fal.ai or Replicate as a managed API (no self-hosting needed for MVP)
- SAM 2 segmentation reuse: leverage existing `sam-client.ts` from Story 3.1 for object detection and mask generation
- Key difference from Story 3.1 (material swap): Story 3.1 uses SDXL inpainting to fill with specific material textures, Story 3.3 uses LaMa to fill with contextual background continuation. Different engines, different purpose
- Mask dilation: expand SAM mask by 5-10px before passing to LaMa for complete object coverage and smooth transitions
- Batch processing: combine all masks into a single composite mask, single LaMa pass (LaMa handles multi-region masks natively)
- API endpoint from architecture: POST `/projects/:id/remove-object` (api-spec.md)
- RefinementEngine component handles inpainting orchestration (architecture/fullstack/components.md — dependencies: SAM 2, LaMa)
- Job type for render queue: `object_removal` (new entry in render_job_type enum)
- Mask data stored in Supabase Storage as PNG with alpha channel
- Reuse existing services: render-queue (Story 7.5), ai-pipeline client (Story 7.6), quota-service (Story 7.5), realtime progress (Story 7.5), sam-client (Story 3.1)

## Requirements Covered
| Requirement | Description | Coverage |
|------------|-------------|----------|
| FR-09 | O sistema deve remover objetos indesejados (entulho, moveis velhos, itens pessoais) usando inpainting AI | Full |

## Tasks
- [x] Task 1: Create LaMa client service (`lama-client.ts`) wrapping fal.ai/Replicate LaMa endpoint with mask-based inpainting (single mask and composite multi-region mask support)
- [x] Task 2: Create object removal service (`object-removal.service.ts`) orchestrating: SAM segmentation -> mask dilation -> preview return (detect phase), and apply: dilated mask -> LaMa inpaint -> quality validate -> version create -> storage (removal phase)
- [x] Task 3: Create mask utility module (`mask-utils.ts`) with mask dilation (5-10px expansion), mask combination (merge multiple masks into composite), and mask-to-PNG conversion for storage
- [x] Task 4: Create Zod validation schemas for all object removal endpoints (`object-removal.schema.ts`) — point/box input for detection, apply with mask_id, batch with array of mask_ids
- [x] Task 5: Implement POST `/api/projects/:projectId/remove-object` route handler (`object-removal.routes.ts`) — point and bounding box modes for object selection and mask preview
- [x] Task 6: Implement POST `/api/projects/:projectId/remove-object/apply` endpoint — single object removal via LaMa with version creation
- [x] Task 7: Implement POST `/api/projects/:projectId/remove-object/batch` endpoint — multi-object composite mask removal with single LaMa pass
- [x] Task 8: Add `object_removal` job type to render worker and BullMQ queue handler (`object-removal.handler.ts`)
- [x] Task 9: Add Supabase Realtime progress broadcasting for object removal pipeline stages
- [x] Task 10: Integrate with quota service (apply/batch = 1 render credit)
- [x] Task 11: Extend ai-pipeline client with `removeObject()` method calling LaMa client
- [x] Task 12: Write unit tests for LaMa client, object removal service, and mask utilities (dilation, combination)
- [x] Task 13: Write integration tests for all object removal endpoints (point detection, box detection, apply, batch, cumulative versions, quota enforcement, error cases)

## Dependencies
- Story 3.1 (Segmentation API) — SAM client (`sam-client.ts`), mask storage patterns, version creation patterns
- Story 7.4 (Project CRUD & Upload) — project management, file storage
- Story 7.5 (Render Job Queue) — BullMQ queue, quota service, realtime progress
- Story 7.6 (AI Pipeline Core) — AI client infrastructure, fal.ai/Replicate integration
- Story 1.3 (Staging Generation) — version management patterns

## Dev Agent Record
### Implementation Plan
Implemented object removal API using LaMa inpainting via fal.ai, SAM 2 segmentation for mask generation, and BullMQ for async job processing.

### Debug Log
- Fixed typecheck by adding `object_removal` to shared RenderJobType and database.types.ts
- Updated tests to mock lamaClient and maskUtils after hook-driven architecture refinement

### Change Log
- 2026-03-09: Story 3.3 implemented by @dev (Dex)

## Testing
- 54 test files, 511 tests passing
- `npm run lint` — passes
- `npm run typecheck` — passes
- `npm test` — passes

## File List
### New Files
- `packages/api/src/services/lama-client.ts` — LaMa inpainting client (fal.ai)
- `packages/api/src/services/mask-utils.ts` — Mask dilation, combination, bounds
- `packages/api/src/services/fill-mode.prompts.ts` — Fill mode prompt builder
- `packages/api/src/services/object-removal.service.ts` — Object removal orchestration
- `packages/api/src/schemas/object-removal.schema.ts` — Zod validation schemas
- `packages/api/src/routes/object-removal.routes.ts` — REST endpoints
- `packages/api/src/queue/object-removal.handler.ts` — Worker handler
- `packages/api/src/__tests__/fill-mode.prompts.test.ts` — Unit tests
- `packages/api/src/__tests__/object-removal.service.test.ts` — Service tests
- `packages/api/src/__tests__/object-removal.routes.test.ts` — Route tests
- `packages/api/src/__tests__/mask-utils.test.ts` — Mask utility tests
- `packages/api/src/__tests__/lama-client.test.ts` — LaMa client tests

### Modified Files
- `packages/api/src/server.ts` — Register objectRemovalRoutes
- `packages/api/src/queue/render.worker.ts` — Add object_removal job routing
- `packages/api/src/schemas/render.schema.ts` — Add object_removal to RENDER_JOB_TYPES
- `packages/api/src/lib/ai-pipeline.client.ts` — Add removeObject() method
- `packages/shared/src/types/render-job.ts` — Add object_removal to RenderJobType
- `packages/shared/src/types/database.types.ts` — Add object_removal to render_jobs type

## QA Results
