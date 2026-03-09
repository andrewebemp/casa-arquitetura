# Story 7.6 - AI Pipeline Core: SDXL Generation, Depth Estimation e Style Extraction

## Status: Done

## Story
As a developer integrating the render pipeline, I want the AI Pipeline (FastAPI) to expose generation endpoints using fal.ai/Replicate for SDXL+ControlNet inference, ZoeDepth for depth estimation, and CLIP for style extraction, so that the Fastify render worker can delegate actual image generation instead of simulating it.

## Acceptance Criteria

### AC1 - Provider Abstraction Layer
- Given the ai-pipeline service, when a generation request arrives, then it routes to fal.ai as primary provider with automatic fallback to Replicate if fal.ai returns error or timeout (>30s)
- Provider selection is configurable via environment variable `AI_PROVIDER_PRIMARY`
- Each provider client implements a common `ImageProvider` interface with `generate()`, `get_status()`, and `get_result()` methods

### AC2 - Depth Estimation Service (ZoeDepth)
- Given a room photo URL, when `POST /analyze/depth` is called, then the service returns a depth map image URL and extracted spatial data (estimated dimensions, detected features)
- Depth estimation uses ZoeDepth model via fal.ai/Replicate
- Response includes `depth_map_url`, `estimated_dimensions`, and `detected_features` (doors, windows, structural elements)
- Ref: FR-22

### AC3 - Style Extraction Service (CLIP)
- Given a style name (one of the 10 predefined DecorStyle values) and optional reference image URL, when `POST /analyze/style` is called, then the service returns optimized prompt embeddings and style parameters for ControlNet conditioning
- Uses CLIP model for text-to-embedding and image-to-embedding when reference provided
- Response includes `style_prompt`, `negative_prompt`, `clip_embeddings`, and `controlnet_params`
- Ref: FR-23

### AC4 - Image Generation Endpoint (SDXL + ControlNet)
- Given a generation request with `source_image_url`, `depth_map_url`, `style_params`, and `output_resolution`, when `POST /generate` is called, then the service orchestrates multi-conditioning ControlNet (depth + edge) with SDXL to produce a decorated room image
- Supports resolutions: 1024x1024 (Free tier), 2048x2048 (paid tiers) via Real-ESRGAN upscale
- Returns `result_image_url` and `metadata` (model used, inference time, provider)
- Job progress is reported via callback URL (for render worker integration)
- Ref: FR-21, FR-20

### AC5 - Render Worker Integration
- Given the AI pipeline is running, when the Fastify render worker processes a job, then it calls the AI pipeline HTTP endpoints instead of simulating
- The render worker sends: source image URL, style, tier (for resolution), and a progress callback URL
- Pipeline stages map to progress percentages: depth (0-20%), style (20-30%), generation (30-80%), upscale (80-95%), upload (95-100%)
- Ref: FR-19

### AC6 - Health and Readiness
- Given the ai-pipeline service starts, when `GET /health` is called, then it returns provider connectivity status and model availability
- `GET /ready` returns 200 only when at least one provider (fal.ai or Replicate) is reachable
- All endpoints require API key authentication via `X-Pipeline-Key` header

### AC7 - Error Handling and Observability
- Given a provider error during generation, when the primary provider fails, then the service retries once on the same provider before falling back to the secondary
- All errors include structured context: `provider`, `model`, `error_code`, `retry_count`
- Request/response logging with timing metrics for each pipeline stage

## Technical Notes

### Architecture (from fullstack-architecture.md)
- AI Pipeline runs as standalone FastAPI service (`packages/ai-pipeline/`)
- Communicates with Fastify API via HTTP (internal network)
- Uses fal.ai as primary GPU provider, Replicate as fallback
- Provider endpoints:
  - fal.ai: `POST /fal-ai/fast-sdxl` (generation), `POST /fal-ai/real-esrgan` (upscale)
  - Replicate: `POST /predictions` (all models)

### Project Structure (per source-tree)
```
packages/ai-pipeline/src/
  api/
    routes.py              # FastAPI route definitions
    deps.py                # Dependency injection
  services/
    generation.py          # SDXL + ControlNet orchestration
    spatial.py             # ZoeDepth depth estimation
    style.py               # CLIP style extraction
    upscale.py             # Real-ESRGAN upscaling
  providers/
    base.py                # ImageProvider interface
    fal_provider.py        # fal.ai client
    replicate_provider.py  # Replicate client
    factory.py             # Provider factory with fallback
  models/
    schemas.py             # Pydantic request/response models
  utils/
    image.py               # Image processing utilities
  config.py                # Typed environment config
  main.py                  # FastAPI entry (update existing)
```

### Environment Variables
```
AI_PROVIDER_PRIMARY=fal          # fal | replicate
FAL_API_KEY=                     # fal.ai API key
REPLICATE_API_TOKEN=             # Replicate API token
PIPELINE_API_KEY=                # Internal auth key
SUPABASE_URL=                    # For storage operations
SUPABASE_SERVICE_KEY=            # Service role key
```

### Render Worker Changes (packages/api/)
- Update `render.worker.ts` to replace simulation with HTTP calls to ai-pipeline
- Add `ai-pipeline.client.ts` in `packages/api/src/lib/` as typed HTTP client
- Update render job data to include style, tier, and callback URL

## Tasks
- [x] Task 1: Create provider abstraction — `ImageProvider` interface, fal.ai client, Replicate client, factory with fallback logic
- [x] Task 2: Implement depth estimation service — `spatial.py` with ZoeDepth via providers, `POST /analyze/depth` route
- [x] Task 3: Implement style extraction service — `style.py` with CLIP embeddings, `POST /analyze/style` route
- [x] Task 4: Implement image generation service — `generation.py` orchestrating depth + style + SDXL + ControlNet, `POST /generate` route
- [x] Task 5: Implement upscale service — `upscale.py` with Real-ESRGAN for 2048x2048 output
- [x] Task 6: Add Pydantic schemas, config, auth middleware, health/ready endpoints
- [x] Task 7: Create AI pipeline HTTP client in Fastify API (`ai-pipeline.client.ts`)
- [x] Task 8: Update render worker to delegate to AI pipeline with progress mapping
- [x] Task 9: Write unit tests for providers, services, and routes (Python pytest)
- [x] Task 10: Write integration tests for render worker ↔ AI pipeline flow (TypeScript)

## Dependencies
- Story 7.1 (Monorepo scaffolding) — monorepo structure ✅
- Story 7.2 (Database schema) — render_jobs, project_versions tables ✅
- Story 7.5 (Render Job Queue) — BullMQ queue and worker skeleton ✅
- Story 7.4 (Project CRUD + Upload) — project and image storage ✅

## Dev Agent Record
### Implementation Plan
Implemented all 10 tasks following the architecture spec. Created the full AI pipeline FastAPI service with provider abstraction (fal.ai + Replicate), depth estimation (ZoeDepth), style extraction (CLIP with 10 DecorStyle prompts), image generation (SDXL + ControlNet), and upscale (Real-ESRGAN). Updated the Fastify render worker to delegate to the AI pipeline via a typed HTTP client.

### Debug Log
- Fixed lint error: removed unused `defaultHeaders` function in ai-pipeline.client.ts
- Fixed pre-existing lint error: removed unused `FastifyRequest` import in subscription.routes.ts

### Change Log
- 2026-03-09: Implemented all acceptance criteria (AC1-AC7) with full test coverage

## Testing
- Unit tests: provider clients (mocked HTTP), services (mocked providers), routes (TestClient)
- Integration tests: render worker calling AI pipeline (mocked providers)
- Contract tests: verify request/response schemas match between Fastify client and FastAPI routes
- Manual test: end-to-end render with real fal.ai API key (optional, requires API credit)

## File List
- `packages/ai-pipeline/src/providers/base.py` (new) — ImageProvider interface + ProviderError
- `packages/ai-pipeline/src/providers/fal_provider.py` (new) — fal.ai client
- `packages/ai-pipeline/src/providers/replicate_provider.py` (new) — Replicate client
- `packages/ai-pipeline/src/providers/factory.py` (new) — ProviderFactory with fallback
- `packages/ai-pipeline/src/providers/__init__.py` (new)
- `packages/ai-pipeline/src/services/spatial.py` (new) — ZoeDepth depth estimation
- `packages/ai-pipeline/src/services/style.py` (new) — CLIP style extraction
- `packages/ai-pipeline/src/services/generation.py` (new) — SDXL + ControlNet generation
- `packages/ai-pipeline/src/services/upscale.py` (new) — Real-ESRGAN upscaling
- `packages/ai-pipeline/src/services/__init__.py` (new)
- `packages/ai-pipeline/src/models/schemas.py` (new) — Pydantic request/response models
- `packages/ai-pipeline/src/models/__init__.py` (new)
- `packages/ai-pipeline/src/api/routes.py` (new) — FastAPI route definitions
- `packages/ai-pipeline/src/api/deps.py` (new) — Dependency injection + auth
- `packages/ai-pipeline/src/api/__init__.py` (new)
- `packages/ai-pipeline/src/utils/image.py` (new) — Image processing utilities
- `packages/ai-pipeline/src/utils/__init__.py` (new)
- `packages/ai-pipeline/src/config.py` (new) — Typed environment config
- `packages/ai-pipeline/src/main.py` (modified) — Updated to include router
- `packages/ai-pipeline/requirements.txt` (modified) — Added pydantic, pytest
- `packages/ai-pipeline/pyproject.toml` (modified) — Added pytest config
- `packages/ai-pipeline/tests/test_providers.py` (new) — Provider unit tests
- `packages/ai-pipeline/tests/test_services.py` (new) — Service unit tests
- `packages/ai-pipeline/tests/test_routes.py` (new) — Route unit tests
- `packages/ai-pipeline/tests/__init__.py` (new)
- `packages/api/src/lib/ai-pipeline.client.ts` (new) — AI pipeline HTTP client
- `packages/api/src/queue/render.worker.ts` (modified) — Delegates to AI pipeline
- `packages/api/src/__tests__/ai-pipeline.client.test.ts` (new) — Client tests
- `packages/api/src/__tests__/render.worker.test.ts` (modified) — Updated for AI pipeline
- `packages/api/src/routes/subscription.routes.ts` (modified) — Fixed unused import
