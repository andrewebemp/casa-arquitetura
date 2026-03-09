# Story 6.6 - Image Post-Processing: Watermark Rendering no Free Tier e Disclaimer AI

## Status: Done

## Story
As a DecorAI platform operator, I want the system to automatically apply a visible watermark on images generated for Free tier users and embed an AI disclaimer on all generated images, so that Free tier output is clearly branded (incentivizing upgrade) and all images comply with the regulatory requirement of disclosing AI-generated content.

## PRD Requirements
- **FR-17**: O sistema deve aplicar marca d'agua nas imagens geradas no tier Free (Must Have — Brief §F10)
- **NFR-17**: O sistema deve incluir disclaimer de "imagem ilustrativa gerada por IA" nas imagens geradas (Must Have — Brief §Risks — Regulamentacao)

## Acceptance Criteria

### AC-1: Watermark Rendering no Free Tier
- Given a render job completes for a Free tier user, when the post-processing step runs, then the output image has a semi-transparent "DecorAI Brasil" watermark rendered diagonally across the center of the image (opacity 30%, white text with dark shadow for visibility on any background)
- The watermark must be resistant to simple cropping (centered and large enough to cover the main subject area)
- Paid tier users (Pro, Business) receive images WITHOUT watermark

### AC-2: AI Disclaimer Embedding
- Given any render job completes (any tier), when the post-processing step runs, then the output image has a small disclaimer bar at the bottom reading "Imagem ilustrativa gerada por IA | DecorAI Brasil" (semi-transparent dark background, white text, 12-16px equivalent)
- The disclaimer must be present on ALL generated images regardless of tier (regulatory compliance NFR-17)
- The disclaimer bar must not significantly obstruct the image content (max 3% of image height)

### AC-3: Post-Processing Pipeline Integration
- Given the render worker completes image generation (after AI pipeline returns result_image_url), when the image is ready, then a post-processing step downloads the image, applies watermark (if Free tier) and disclaimer, uploads the processed image to Supabase Storage, and updates the render job output with the processed image URL
- The original (unprocessed) image URL is preserved in render job metadata as `original_image_url` for potential future use
- Post-processing adds no more than 3 seconds to the total render time

### AC-4: Watermark Service Upgrade
- Given the existing `watermarkService` in `packages/api/src/services/watermark.service.ts`, when it is upgraded, then it provides an `applyPostProcessing(imageBuffer, options)` method that accepts a raw image buffer and returns a processed buffer with watermark and/or disclaimer applied
- Options include: `{ applyWatermark: boolean, applyDisclaimer: boolean, watermarkText: string, disclaimerText: string }`
- Uses `sharp` library for server-side image manipulation (no native canvas dependency)

### AC-5: Share Link Watermark Consistency
- Given a Free tier user creates a share link for a rendered image, when the shared page loads, then the displayed image already has the watermark baked in (server-side rendered, not client-side overlay)
- This replaces the current metadata-only approach in `share-link.service.ts` with actual image processing

### AC-6: Watermark Removal on Upgrade
- Given a Free tier user upgrades to Pro or Business, when they access previously generated images, then the system serves the original (non-watermarked) version by switching from `processed_image_url` to `original_image_url` in the render job output
- The disclaimer remains on all images regardless of tier change

### AC-7: Error Handling
- Given the post-processing step fails (e.g., image download error, sharp processing error), when the failure occurs, then the render job still completes successfully using the original unprocessed image URL, and the error is logged with context (`post_processing_failed: true` in job metadata)
- Post-processing failures must NEVER cause the entire render job to fail

## Technical Notes

### Architecture
- Post-processing runs as a step in the render worker AFTER the AI pipeline returns
- Uses `sharp` for image manipulation (high-performance, no native dependency issues)
- Watermark is rendered server-side (baked into the image) to prevent circumvention
- Original images are preserved for tier upgrade scenarios

### Existing Foundation
- `watermarkService` exists (`packages/api/src/services/watermark.service.ts`) — currently only returns metadata, needs upgrade to actually render watermarks
- `share-link.service.ts` tracks `include_watermark` flag per share link
- Render worker (`packages/api/src/queue/render.worker.ts`) has clear post-generation hook point
- `TIER_LIMITS` constants in `packages/shared/src/constants/tiers.ts`
- Supabase Storage for image upload/download

### Image Processing Approach
```
[AI Pipeline generates image]
  → Download image buffer
  → sharp(buffer)
    → If Free tier: composite watermark text (diagonal, centered, 30% opacity)
    → Always: add disclaimer bar at bottom (dark bg strip + white text)
  → Upload processed buffer to Supabase Storage
  → Store both original_image_url and processed_image_url
```

### Watermark Specifications
- Text: "DecorAI Brasil"
- Style: Diagonal (45 degrees), centered, repeating pattern across image
- Opacity: 30% white text with 2px dark shadow
- Size: Proportional to image (approximately 5% of image width per character)

### Disclaimer Specifications
- Text: "Imagem ilustrativa gerada por IA | DecorAI Brasil"
- Position: Bottom of image, full width
- Style: Semi-transparent dark background (70% black), white text, centered
- Height: ~2.5% of image height (proportional)

## Tasks
- [x] Task 1: Add `sharp` dependency to `packages/api/package.json`
- [x] Task 2: Create image post-processing service (`packages/api/src/services/image-post-processing.service.ts`) — `applyWatermark(buffer, text)`, `applyDisclaimer(buffer, text)`, `processImage(buffer, options)` using sharp compositing
- [x] Task 3: Upgrade `watermarkService` to use the new post-processing service — add `applyPostProcessing(imageUrl, tier)` method that downloads, processes, and re-uploads the image
- [x] Task 4: Integrate post-processing into render worker — add post-processing step after AI pipeline returns in `processRenderJob`, `processStagingJob`, and other job handlers; store both `original_image_url` and `processed_image_url`
- [x] Task 5: Update render job output schema in `packages/shared/src/types/` to include `original_image_url` and `processed_image_url` fields
- [x] Task 6: Update share-link service to use `processed_image_url` for baked-in watermark instead of metadata-only approach
- [x] Task 7: Add tier-upgrade image URL switching logic — when serving images, use `processed_image_url` for Free tier and `original_image_url` (+ disclaimer only) for paid tiers
- [x] Task 8: Write unit tests for image post-processing service (watermark application, disclaimer application, combined processing, error handling)
- [x] Task 9: Write unit tests for render worker post-processing integration (Free tier gets watermark, paid tier no watermark, disclaimer always applied, fallback on error)
- [x] Task 10: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.5 (Render Job Queue — render worker infrastructure) - provides job processing pipeline
- Story 7.6 (AI Pipeline Core — image generation) - provides generated image URLs
- Story 6.3 (Subscription API — tier management) - provides tier information
- Story 4.1 (Share Links — include_watermark flag) - existing watermark metadata

## Dev Agent Record
### Implementation Plan
- Image post-processing service using sharp SVG compositing for watermark and disclaimer
- Watermark: diagonal repeating pattern, 30% opacity white text with dark shadow
- Disclaimer: bottom bar, 2.5% image height, 70% black bg, white centered text
- Post-processing integrated at render worker dispatcher level for all job types
- AC-7 error handling: try/catch wrapper returns original image on failure

### Debug Log
- All 613 tests passing, lint clean, typecheck clean

### Change Log
- Created `packages/api/src/services/image-post-processing.service.ts` (new)
- Created `packages/api/src/queue/post-processing.handler.ts` (new)
- Modified `packages/api/src/services/watermark.service.ts` (added applyPostProcessing, getImageUrlForTier)
- Modified `packages/api/src/queue/render.worker.ts` (integrated post-processing for all job types)
- Modified `packages/api/src/services/share-link.service.ts` (AC-5: baked-in watermark via render job output)
- Modified `packages/shared/src/types/render-job.ts` (added RenderJobOutputParams interface)
- Modified `packages/shared/src/types/index.ts` (exported RenderJobOutputParams)
- Modified `packages/api/package.json` (added sharp dependency)
- Created test files for all new functionality

## Testing
- Unit tests for image post-processing service: watermark text rendering with sharp, disclaimer bar rendering, combined processing, proportional sizing for different resolutions (1024x1024, 2048x2048)
- Unit tests for watermark service upgrade: download, process, upload flow; tier-based logic; error fallback
- Unit tests for render worker integration: post-processing step called after generation; Free tier receives watermark; paid tiers skip watermark; disclaimer always present; graceful fallback on processing error
- Integration pattern: mock sharp operations and Supabase Storage for isolated testing

## File List
- `packages/api/package.json` (modified — added sharp)
- `packages/api/src/services/image-post-processing.service.ts` (new)
- `packages/api/src/services/watermark.service.ts` (modified)
- `packages/api/src/queue/post-processing.handler.ts` (new)
- `packages/api/src/queue/render.worker.ts` (modified)
- `packages/api/src/services/share-link.service.ts` (modified)
- `packages/shared/src/types/render-job.ts` (modified)
- `packages/shared/src/types/index.ts` (modified)
- `packages/api/src/__tests__/image-post-processing.service.test.ts` (new)
- `packages/api/src/__tests__/watermark.service.test.ts` (new)
- `packages/api/src/__tests__/post-processing.handler.test.ts` (new)
- `docs/stories/6.6/story.md` (modified)
