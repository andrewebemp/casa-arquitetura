# Story 1.2 - Croqui ASCII: Geracao, Refinamento 3-Turn e Aprovacao API

## Status: Done

## Story
As a user who uploaded a room photo or provided spatial input data,
I want the system to generate an ASCII floor plan (croqui) showing dimensions, doors, windows, and furniture positions,
so that I can review, adjust, and approve the layout before photorealistic image generation begins.

## Context
This story bridges the spatial input system (Story 1.1) with the render pipeline (Story 7.5/7.6).
The croqui serves as a confirmation step — the user MUST explicitly approve it before any render is queued.
When input is a photo, computer vision (ZoeDepth from Story 7.6) extracts spatial data first.

## Acceptance Criteria

### AC1: Photo Analysis and Spatial Extraction (FR-32)
- Given a project with an uploaded photo (via Story 7.4),
  when the user calls `POST /projects/:id/analyze`,
  then the system uses ZoeDepth depth estimation (Story 7.6) to extract estimated dimensions,
  identifies existing elements (doors, windows, pillars),
  and stores the extracted spatial data in the project's spatial_input record.

### AC2: ASCII Croqui Generation (FR-29)
- Given a project with spatial input data (from Story 1.1 manual input OR from AC1 photo analysis),
  when the system generates a croqui,
  then it produces an ASCII floor plan showing:
    - Space dimensions (width x height in meters)
    - Door positions (marked with `D`)
    - Window positions (marked with `W`)
    - Furniture items with approximate positions (labeled with item names)
  and stores the croqui in the `croqui_ascii` column of the `spatial_inputs` table.

### AC3: Croqui Retrieval (FR-29)
- Given a project with a generated croqui,
  when the user calls `GET /projects/:id/croqui`,
  then the API returns the current ASCII croqui, spatial dimensions, element list,
  and a `turn_number` (1, 2, or 3) indicating the current refinement iteration.

### AC4: 3-Turn Croqui Refinement (FR-30)
- Given a generated croqui on turn 1 or 2,
  when the user calls `POST /projects/:id/croqui/adjust` with adjustment instructions
  (e.g., "move the sofa to the left wall", "add a window on the north wall"),
  then the system applies the adjustments using LLM interpretation (Claude API),
  generates an updated ASCII croqui,
  increments the turn number,
  and returns the updated croqui for review.

### AC5: Croqui Approval Gate (FR-31)
- Given a croqui on any turn (1, 2, or 3),
  when the user calls `POST /projects/:id/croqui/approve`,
  then the system marks the croqui as approved,
  creates a project_version record with type 'croqui_approved',
  and returns a confirmation with the approved croqui data.

### AC6: Approval Required Before Generation
- Given a project WITHOUT an approved croqui,
  when the user attempts to call `POST /projects/:id/generate` (from Story 7.5),
  then the API returns `409 Conflict` with message "Croqui must be approved before generating render".

### AC7: Auto-Generation from Photo Upload (FR-32)
- Given a project with an uploaded photo but NO spatial input,
  when `POST /projects/:id/analyze` is called,
  then the system automatically:
    1. Calls the AI pipeline `/analyze/depth` endpoint for spatial extraction
    2. Stores extracted spatial data
    3. Generates the initial ASCII croqui (turn 1)
  and returns both spatial data and croqui in the response.

### AC8: Validation and Error Handling
- Given invalid input (missing spatial data, invalid adjustment text, project not found),
  when any croqui endpoint is called,
  then the API returns appropriate error codes (400, 404, 422) with descriptive messages.

### AC9: Turn Limit Enforcement (FR-30)
- Given a croqui already on turn 3,
  when the user calls `POST /projects/:id/croqui/adjust`,
  then the API returns `422 Unprocessable Entity` with message
  "Maximum 3 refinement turns reached. Please approve or restart the croqui."

## Technical Notes

### LLM Integration for Croqui Generation
- Use Claude API (claude-sonnet-4-20250514) via Anthropic SDK
- System prompt instructs Claude to generate ASCII floor plans from spatial data
- The prompt includes room dimensions, openings (doors/windows), and furniture items
- Output is a structured ASCII grid with labeled elements
- Adjustment prompts include the current croqui + user instructions

### AI Pipeline Integration for Photo Analysis
- Reuse `POST /analyze/depth` from Story 7.6 (ZoeDepth)
- Add a new `/analyze/spatial` endpoint in ai-pipeline OR
  handle spatial interpretation in the Node.js API using depth map + Claude

### Data Flow
```
Photo Upload (7.4) ──→ POST /analyze ──→ ZoeDepth depth map
                                        ──→ Claude interprets spatial data
                                        ──→ Generates ASCII croqui (turn 1)
                                        ──→ Stores in spatial_inputs.croqui_ascii

Manual Input (1.1) ──→ POST /croqui/generate ──→ Claude generates ASCII croqui
                                               ──→ Stores in spatial_inputs.croqui_ascii

User Reviews ──→ GET /croqui ──→ Returns current croqui + turn number

User Adjusts ──→ POST /croqui/adjust ──→ Claude refines croqui
                                       ──→ Increments turn (max 3)

User Approves ──→ POST /croqui/approve ──→ Marks approved
                                        ──→ Creates project_version
                                        ──→ Unlocks POST /generate
```

### API Endpoints
| Method | Path | Description | Ref |
|--------|------|-------------|-----|
| POST | `/projects/:id/analyze` | Analyze photo, extract spatial data, generate croqui | FR-32 |
| GET | `/projects/:id/croqui` | Get current croqui + turn number | FR-29 |
| POST | `/projects/:id/croqui/adjust` | Adjust croqui with user instructions | FR-30 |
| POST | `/projects/:id/croqui/approve` | Approve croqui, unlock generation | FR-31 |

## Tasks
- [x] Task 1: Create Zod schemas for croqui endpoints (analyze, adjust, approve request/response)
- [x] Task 2: Implement croqui generation service (`croqui.service.ts`) with Claude API integration
- [x] Task 3: Implement photo analysis service (`photo-analysis.service.ts`) integrating ZoeDepth + Claude spatial interpretation
- [x] Task 4: Implement croqui state management (turn tracking, approval status) in spatial_inputs table
- [x] Task 5: Create `POST /projects/:id/analyze` route — photo analysis + auto croqui generation
- [x] Task 6: Create `GET /projects/:id/croqui` route — retrieve current croqui
- [x] Task 7: Create `POST /projects/:id/croqui/adjust` route — 3-turn refinement
- [x] Task 8: Create `POST /projects/:id/croqui/approve` route — approval gate
- [x] Task 9: Add croqui approval check to existing `POST /projects/:id/generate` route (Story 7.5)
- [x] Task 10: Write unit tests for croqui service (generation, adjustment, turn limits)
- [x] Task 11: Write unit tests for photo analysis service
- [x] Task 12: Write route integration tests for all 4 endpoints
- [x] Task 13: Run lint, typecheck, and full test suite

## Dependencies
- **Story 7.1** (Done) — Monorepo structure, shared types
- **Story 7.2** (Done) — Database schema (`spatial_inputs.croqui_ascii` column, `project_versions` table)
- **Story 7.3** (Done) — Auth middleware, Supabase client, error handling infrastructure
- **Story 7.4** (Done) — Project CRUD, photo upload to Supabase Storage
- **Story 7.5** (Done) — Render job queue (`POST /projects/:id/generate` to add approval gate)
- **Story 7.6** (Done) — AI Pipeline with ZoeDepth depth estimation (`POST /analyze/depth`)
- **Story 1.1** (Done) — Spatial input API (manual spatial data + reference items)

## PRD Coverage
- **FR-29** (Must Have) — ASCII floor plan/croqui with dimensions, doors, windows, furniture
- **FR-30** (Must Have) — 3-turn technique (generate → iterate → confirm)
- **FR-31** (Must Have) — Explicit user approval before photorealistic generation
- **FR-32** (Must Have) — Computer vision to extract dimensions from photo and generate croqui

## Dev Agent Record
### Implementation Plan
Implemented croqui ASCII generation, 3-turn refinement, and approval API using Claude API (claude-sonnet-4-20250514) via @anthropic-ai/sdk. Photo analysis integrates ZoeDepth depth estimation from AI pipeline with Claude spatial interpretation.

### Debug Log
No issues encountered.

### Change Log
- 2026-03-09: Story 1.2 implementation complete — all 13 tasks done, 299 tests passing

## Testing
- Unit tests for croqui generation logic (ASCII rendering from spatial data)
- Unit tests for Claude API prompt construction and response parsing
- Unit tests for turn tracking and limit enforcement
- Unit tests for photo analysis pipeline (depth → spatial → croqui)
- Route tests for all 4 endpoints (happy path + error cases)
- Integration test: approval gate blocks generation without approved croqui
- Mock Claude API responses for deterministic testing

## File List
- `packages/api/src/schemas/croqui.schema.ts` — Zod schemas for adjust endpoint
- `packages/api/src/lib/anthropic.ts` — Anthropic client singleton
- `packages/api/src/services/croqui.service.ts` — Croqui generation, retrieval, adjustment, approval
- `packages/api/src/services/photo-analysis.service.ts` — Photo analysis with ZoeDepth + Claude
- `packages/api/src/routes/croqui.routes.ts` — All 4 croqui endpoints
- `packages/api/src/server.ts` — (modified) Registered croqui routes
- `packages/api/src/services/render.service.ts` — (modified) Added croqui approval gate (AC6)
- `packages/api/src/config/env.ts` — (modified) Added ANTHROPIC_API_KEY
- `packages/shared/src/types/spatial-input.ts` — (modified) Added croqui_turn_number
- `packages/shared/src/types/database.types.ts` — (modified) Added croqui_turn_number column
- `packages/api/package.json` — (modified) Added @anthropic-ai/sdk dependency
- `packages/api/src/__tests__/croqui.service.test.ts` — Croqui service unit tests
- `packages/api/src/__tests__/photo-analysis.service.test.ts` — Photo analysis unit tests
- `packages/api/src/__tests__/croqui.routes.test.ts` — Route integration tests
- `packages/api/src/__tests__/render.service.test.ts` — (modified) Added croqui approval gate test

## QA Results
- `npm run lint` ✅ — 0 errors
- `npm run typecheck` ✅ — 0 errors
- `npm test` ✅ — 299 tests passing (31 test files)
