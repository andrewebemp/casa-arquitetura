# Story 2.1 - Chat de Refinamento API: NLU, Operacoes e Historico de Versoes

## Status: Draft

## Story
As a user, I want to send natural language commands in Brazilian Portuguese to refine my room render (e.g., "tira o tapete", "muda o piso para madeira clara") and receive an updated version without re-uploading or regenerating the full scene, so that I can iteratively perfect my design through conversation.

## Acceptance Criteria
- Given a project with at least one completed render, when the user sends a POST to `/projects/:id/chat` with a message in Portuguese (e.g., "deixa mais aconchegante"), then the system returns 202 Accepted with `chat_message_id`, `job_id`, and an `operations` array extracted by Claude API
- Given a chat message, when Claude API interprets the command, then it extracts structured operations (type: remove|change|add|adjust, target, params) that map to specific render pipeline actions, respecting the user's spatial specifications from `spatial_inputs`
- Given a refinement job dispatched to BullMQ, when the job completes, then a new `project_versions` row is created with incremented `version_number`, the `chat_messages.version_id` is updated to reference it, and a Supabase Realtime broadcast notifies the client with status "ready"
- Given an authenticated user, when they GET `/projects/:id/chat/history`, then they receive all chat messages for that project ordered by `created_at ASC`, each including the `operations` JSONB and linked `version_id`
- Given a project with multiple versions, when the user GET `/projects/:id/versions`, then they receive all versions ordered by `version_number`, enabling visual version history navigation
- Given a specific version, when the user POST `/projects/:id/versions/:versionId/revert`, then the system creates a NEW version (next `version_number`) with the same image as the reverted version, preserving full history (no destructive revert)
- Given an invalid project ID or a project not owned by the user, when any chat/version endpoint is called, then the API returns 403 Forbidden
- Given each refinement iteration, when the AI pipeline processes the job, then it applies only the requested changes (partial edit via inpainting/segmentation) without altering unrelated elements, completing in under 15 seconds for simple operations (NFR target)

## Tasks
- [ ] Task 1: Create `ChatModule` Fastify plugin with route registration (`/projects/:id/chat`, `/projects/:id/chat/history`)
- [ ] Task 2: Implement Claude API integration for NLU — parse Portuguese commands into structured operations array using Anthropic SDK with system prompt for DecorAI domain
- [ ] Task 3: Implement `POST /projects/:id/chat` endpoint — validate project ownership, call Claude NLU, save `chat_messages` row with operations, enqueue BullMQ refinement job, broadcast "refining" via Supabase Realtime, return 202
- [ ] Task 4: Implement `GET /projects/:id/chat/history` endpoint — fetch all messages for project with pagination (cursor-based), ordered by created_at ASC
- [ ] Task 5: Create `VersionModule` Fastify plugin with version routes (`/projects/:id/versions`, `/projects/:id/versions/:versionId`, `/projects/:id/versions/:versionId/revert`)
- [ ] Task 6: Implement `GET /projects/:id/versions` endpoint — list all versions for a project ordered by version_number
- [ ] Task 7: Implement `GET /projects/:id/versions/:versionId` endpoint — get single version with metadata
- [ ] Task 8: Implement `POST /projects/:id/versions/:versionId/revert` endpoint — create new version copying the target version's image, increment version_number
- [ ] Task 9: Create BullMQ job handler for refinement jobs — receive operations, dispatch to AI pipeline, on completion create new project_version, update chat_message.version_id, broadcast "ready"
- [ ] Task 10: Implement Supabase Realtime integration — broadcast job status changes (refining, progress, ready, error) on project channel
- [ ] Task 11: Write unit tests for NLU operation extraction (mock Claude API responses)
- [ ] Task 12: Write integration tests for all chat and version endpoints (CRUD, auth, edge cases)
- [ ] Task 13: Write integration tests for BullMQ refinement job flow (enqueue, process, version creation)

## Dependencies
- Story 7.2 — Database schema (`chat_messages`, `project_versions` tables)
- Story 7.3 — Auth middleware and Supabase client infrastructure
- Story 7.4 — Project CRUD API (project ownership validation)
- Story 7.5 — Render job queue and BullMQ infrastructure
- Story 7.6 — AI Pipeline core (generation engine, depth estimation)

## Technical Notes
- **ChatModule location:** `packages/api/src/modules/chat/` (Fastify plugin pattern matching existing modules)
- **VersionModule location:** `packages/api/src/modules/versions/` (or extend existing project module)
- **Claude API:** Use Anthropic SDK (`@anthropic-ai/sdk`) with structured output for operation extraction
- **NLU System Prompt:** Domain-specific prompt that understands interior design vocabulary in PT-BR, maps to operation types (remove, change, add, adjust), and preserves user spatial specifications
- **Operations schema:** `{ type: 'remove'|'change'|'add'|'adjust', target: string, params: Record<string, unknown> }`
- **BullMQ queue:** Reuse existing `render-jobs` queue from Story 7.5, job type = `refinement`
- **Realtime channels:** Use Supabase Realtime broadcast on `project:{projectId}` channel
- **Version revert:** Non-destructive — always creates a new version row, never deletes history
- **Pagination:** Cursor-based using `created_at` + `id` for chat history (supports infinite scroll)

## PRD Traceability
| Requirement | Coverage |
|-------------|----------|
| FR-04 (chat conversacional) | POST /projects/:id/chat + NLU pipeline |
| FR-05 (edicoes pontuais <15s) | BullMQ refinement job with partial edit dispatch |
| FR-06 (interpretar PT-BR via LLM) | Claude API NLU with domain-specific prompt |
| FR-27 (iteracoes ilimitadas + historico) | Chat history + version listing + revert |
| FR-28 (respeitar especificacoes) | NLU prompt includes spatial_inputs context |

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log

## Testing
- Unit tests for NLU operation extraction with various PT-BR commands
- Integration tests for all REST endpoints (happy path + error cases)
- Integration tests for BullMQ job flow (enqueue -> process -> version creation)
- Auth tests verifying project ownership enforcement (403 on foreign projects)
- Edge case tests: empty message, malformed operations, concurrent refinements

## File List

## QA Results
