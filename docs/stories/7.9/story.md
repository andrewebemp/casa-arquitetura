# Story 7.9 - Image CDN Delivery e Semantic Render Caching via Redis

## Status: Done

## Story
As a usuario do DecorAI Brasil, I want que imagens geradas sejam entregues via CDN com baixa latencia e que renders similares sejam cacheados semanticamente so that a experiencia de navegacao seja rapida, o custo por render diminua e renders repetidos sejam servidos instantaneamente sem reprocessamento GPU.

## PRD Requirements
- **NFR-07**: O sistema deve utilizar cache Redis para sessoes e cache semantico de renders
- **NFR-11**: Imagens devem ser armazenadas em S3 com entrega via CDN (CloudFront ou Cloudflare)
- **NFR-04** (suporte): Custo por render deve ser inferior a R$ 2,00 no MVP (cache reduz custo efetivo)

## Acceptance Criteria

### CDN Image Delivery (NFR-11)
- Given uma imagem gerada e armazenada no Supabase Storage, when um usuario requisita a imagem, then ela e servida via Cloudflare CDN com headers de cache apropriados (Cache-Control, ETag)
- Given uma imagem publica (share link), when acessada por qualquer visitante, then e servida via CDN sem autenticacao, com TTL de 30 dias
- Given uma imagem de usuario autenticado, when acessada via app, then e servida via CDN com signed URL e TTL de 24 horas

### Semantic Render Caching (NFR-07)
- Given um request de render com parametros identicos (estilo, dimensoes, prompt hash) a um render ja gerado, when o sistema processa o request, then retorna o render cacheado em < 500ms sem invocar o pipeline GPU
- Given um cache hit semantico, when o render e servido do cache, then o custo GPU e zero e o contador de quota do usuario nao e decrementado
- Given um render cacheado ha mais de 7 dias sem acesso, when o TTL expira, then a entrada e removida do Redis automaticamente
- Given um cache miss, when o render e gerado com sucesso, then o resultado e armazenado no Redis com hash semantico para futuros hits

### Cache Key Strategy
- Given parametros de render (style_id, dimensions, seed, prompt_hash, source_image_hash), when o cache key e computado, then usa SHA-256 dos parametros normalizados para garantir determinismo
- Given dois requests com mesma imagem source mas estilos diferentes, when processados, then geram cache keys distintos (sem colisao)

### Cache Management
- Given o endpoint GET /api/cache/stats (admin only), when chamado por um admin, then retorna metricas de hit rate, total entries, memory usage e top cached renders
- Given o endpoint DELETE /api/cache/render/:hash (admin only), when chamado, then invalida a entrada de cache especifica

## Technical Notes
- **CDN**: Cloudflare em frente ao Supabase Storage (conforme arquitetura)
- **Cache Store**: Upstash Redis (conforme tech stack)
- **Cache Key**: SHA-256 de `{source_image_hash}:{style_id}:{width}x{height}:{seed}:{prompt_hash}`
- **Cache Value**: URL da imagem no Storage + metadata (timestamp, dimensions, style)
- **TTL Strategy**: 7 dias sem acesso (sliding expiration), max 30 dias absoluto
- **Memory Budget**: ~50MB para cache semantico (estimativa: 10K entries x 5KB metadata)

## Tasks
- [x] Task 1: Implementar CDN configuration — Cloudflare proxy config para Supabase Storage URLs com cache rules
- [x] Task 2: Criar image-cdn-service com signed URL generation, cache headers e CDN URL rewriting
- [x] Task 3: Implementar semantic-cache-service com Redis — hash computation, get/set/invalidate operations
- [x] Task 4: Integrar semantic cache no render pipeline — check cache antes de invocar GPU, store apos geracao
- [x] Task 5: Criar endpoint GET /api/cache/stats e DELETE /api/cache/render/:hash para admin
- [x] Task 6: Atualizar render job queue para skip GPU quando cache hit (quota nao decrementada)
- [x] Task 7: Escrever testes unitarios para semantic-cache-service (hash computation, TTL, hit/miss)
- [x] Task 8: Escrever testes de integracao para CDN URL generation e cache flow end-to-end

## Dependencies
- Story 7.4 (Project CRUD API e Upload de Imagens) — Storage ja configurado
- Story 7.5 (Render Job Queue) — Pipeline de render ja funcional
- Story 7.6 (AI Pipeline Core) — Pipeline de geracao de imagens
- Story 7.8 (API Rate Limiting via Redis) — Redis ja configurado e acessivel

## Dev Agent Record
### Implementation Plan
- CDN delivery via Cloudflare proxy with signed URLs and cache headers
- Semantic render caching via Upstash Redis with SHA-256 hash keys
- Cache check before GPU invocation, cache store after successful render
- Admin-only endpoints for cache stats and invalidation

### Debug Log
- Fixed cache.routes.test.ts vitest hoisting issue (mockGetUser before initialization)

### Change Log
- 2026-03-09: Implemented all 8 tasks for Story 7.9

## Testing
- [x] Testes unitarios para hash computation (determinismo, sem colisao)
- [x] Testes unitarios para cache get/set/invalidate/TTL
- [x] Testes unitarios para signed URL generation
- [x] Testes de integracao para cache hit flow (render request -> cache hit -> return cached)
- [x] Testes de integracao para cache miss flow (render request -> cache miss -> generate -> store -> return)
- [x] Teste de cache stats endpoint
- [x] Teste de cache invalidation endpoint
- [x] npm run lint passa sem erros
- [x] npm run typecheck passa sem erros
- [x] npm test passa sem falhas

## File List
- `packages/api/src/services/semantic-cache.service.ts` — Semantic render cache with Redis (hash, get, set, invalidate, stats)
- `packages/api/src/services/image-cdn.service.ts` — CDN URL rewriting, signed URLs, cache headers, ETag generation
- `packages/api/src/schemas/cache.schema.ts` — Zod schema for cache hash param validation
- `packages/api/src/routes/cache.routes.ts` — Admin endpoints: GET /api/cache/stats, DELETE /api/cache/render/:hash
- `packages/api/src/config/env.ts` — Added CDN_BASE_URL env var
- `packages/api/src/server.ts` — Registered cacheRoutes
- `packages/api/src/services/render.service.ts` — Added computeCacheHash + cache check before quota
- `packages/api/src/queue/render.worker.ts` — Added storeInSemanticCache after render completion
- `packages/api/src/__tests__/semantic-cache.service.test.ts` — Unit tests for semantic cache (20 tests)
- `packages/api/src/__tests__/image-cdn.service.test.ts` — Unit tests for CDN service (10 tests)
- `packages/api/src/__tests__/cache.routes.test.ts` — Integration tests for cache endpoints (7 tests)

## QA Results
<!-- Preenchido pelo @qa -->
