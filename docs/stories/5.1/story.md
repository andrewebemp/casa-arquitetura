# Story 5.1 - Reverse Staging Diagnostico API: Analise de Valor e Funil Freemium

## Status: Done

## Story
As a corretor de imoveis ou proprietario, I want to upload a foto do meu anuncio e receber um diagnostico gratuito mostrando quanto valor o imovel esta perdendo por falta de staging profissional so that eu entenda o beneficio do staging e considere contratar o servico pago.

## PRD Requirements
- **FR-12**: O sistema deve oferecer uma ferramenta gratuita de diagnostico onde o usuario faz upload da foto do anuncio e a IA analisa mostrando o valor estimado que o imovel esta perdendo por falta de staging profissional (Must Have — Brief §F08)
- **FR-13**: O diagnostico deve apresentar CTA (call-to-action) direcionando para plano pago (Must Have — Brief §F08)

## Acceptance Criteria

### AC-1: Criacao de Diagnostico sem Autenticacao
- Given um usuario anonimo (sem login) acessa a ferramenta de diagnostico
- When ele envia um POST para `/diagnostics` com dados basicos
- Then o sistema cria um registro de diagnostico com `user_id = null` e retorna um `session_token` (cookie 7 dias) para rastreamento anonimo, junto com o `id` do diagnostico criado

### AC-2: Upload de Foto do Anuncio
- Given um diagnostico criado (com id valido)
- When o usuario envia POST para `/diagnostics/:id/upload` com uma imagem JPEG/PNG (max 10MB)
- Then o sistema armazena a imagem no Supabase Storage, atualiza `original_image_url` no registro, e retorna URL da imagem armazenada

### AC-3: Analise AI do Imovel
- Given um diagnostico com foto uploaded
- When o sistema processa a analise
- Then retorna um objeto `DiagnosticAnalysis` contendo: array de `issues` (cada uma com `category`, `severity`, `description`), `estimated_loss_percent` (0-100), `overall_score` (0-100), e array de `recommendations`
- And as categorias de issues incluem: `lighting`, `staging`, `composition`, `quality`, `clutter`
- And severidades sao: `low`, `medium`, `high`

### AC-4: Consulta de Resultado do Diagnostico
- Given um diagnostico processado
- When GET `/diagnostics/:id` e chamado (com session_token ou auth token)
- Then retorna o diagnostico completo incluindo `original_image_url`, `staged_preview_url` (se disponivel), e `analysis` com todos os campos

### AC-5: CTA para Plano Pago
- Given um diagnostico com analise concluida
- When o resultado e retornado via API
- Then o response inclui um campo `cta` com: `message` (texto persuasivo baseado no score), `plan_recommended` (tier recomendado: pro ou business), e `upgrade_url` (link para pagina de pricing)
- And o CTA escala com a severidade: score < 40 = urgente, 40-70 = moderado, > 70 = leve

### AC-6: Usuario Autenticado Vincula Diagnostico
- Given um usuario que fez diagnostico anonimo e depois faz login
- When o sistema detecta o `session_token` do cookie
- Then vincula todos os diagnosticos daquele `session_token` ao `user_id` autenticado

### AC-7: Validacao de Input
- Given um request com dados invalidos (imagem > 10MB, formato nao suportado, id inexistente)
- When qualquer endpoint de diagnostico e chamado
- Then retorna erro 400/404 com mensagem descritiva em PT-BR

## Tasks
- [x] Task 1: Criar tipos TypeScript para Diagnostic e DiagnosticAnalysis em `packages/shared/src/types/diagnostic.ts`
- [x] Task 2: Implementar `diagnostic.service.ts` em `packages/api/src/services/` com metodos: `createDiagnostic`, `uploadImage`, `analyzeDiagnostic`, `getDiagnostic`, `linkAnonymousDiagnostics`
- [x] Task 3: Implementar `diagnostic-analyzer.service.ts` em `packages/api/src/services/` com logica de analise AI (regras heuristicas para scoring)
- [x] Task 4: Criar schemas Zod para validacao dos endpoints em `packages/api/src/schemas/diagnostic.schema.ts`
- [x] Task 5: Implementar rota POST `/diagnostics` — criacao de diagnostico (auth opcional, session_token para anonimos)
- [x] Task 6: Implementar rota POST `/diagnostics/:id/upload` — upload de foto para Supabase Storage
- [x] Task 7: Implementar rota GET `/diagnostics/:id` — consulta de resultado com CTA dinamico
- [x] Task 8: Implementar logica de CTA dinamico baseado no `overall_score` e `estimated_loss_percent`
- [x] Task 9: Implementar vinculacao de diagnosticos anonimos ao user_id apos login
- [x] Task 10: Escrever testes unitarios para `diagnostic.service.ts` e `diagnostic-analyzer.service.ts`
- [x] Task 11: Escrever testes de integracao para os 3 endpoints (POST create, POST upload, GET result)
- [x] Task 12: Validar que npm run lint, npm run typecheck e npm test passam sem erros

## Dependencies
- Story 7.2 (Database Schema) — tabela `diagnostics` ja criada via migration 009
- Story 7.3 (Supabase Client e Infra API) — cliente Supabase e middleware de auth
- Story 7.4 (Upload de Imagens) — padrao de upload para Supabase Storage reutilizavel
- Story 7.6 (AI Pipeline Core) — CLIP para avaliacao visual de qualidade

## Technical Notes
- Tabela `diagnostics` ja existe: migration `009_diagnostics.sql` com RLS configurado
- Tipos base definidos em `docs/architecture/fullstack/data-models.md` secao 4.8
- API endpoints definidos em `docs/architecture/fullstack/api-spec.md`
- Auth opcional: usar middleware que permite requests sem token (session_token via cookie como fallback)
- Analise AI: combinar CLIP embeddings para avaliar qualidade visual + regras heuristicas para categorizar issues
- CTA: campo computado no response, nao armazenado no banco
- `staged_preview_url`: gerar preview rapido usando pipeline existente (Story 7.6) com estilo padrao para mostrar potencial

## Dev Agent Record
### Implementation Plan
Implemented diagnostic API with 3 public endpoints, analyzer service with heuristic scoring, and dynamic CTA logic.

### Debug Log
- Fixed lint: removed unused `authMiddleware` import, unused `SESSION_TOKEN_EXPIRY_DAYS` constant
- Fixed typecheck: added `original_image_url` to diagnostics Update type in database.types.ts
- Fixed typecheck: explicit object construction instead of spread in fallback issue

### Change Log
- 2026-03-09: Full implementation of Story 5.1 — all 12 tasks completed
- Fixed typecheck error in `diagnostic-analyzer.service.ts` (missing `category` in fallback issue)
- Fixed typecheck errors in `diagnostic.service.ts` (type casting for DB operations)
- All quality gates pass: lint, typecheck, 593 tests

## Testing
- Testes unitarios: service methods com mocks do Supabase client
- Testes integracao: endpoints com supertest, validar responses e status codes
- Casos edge: imagem invalida, diagnostico inexistente, session_token expirado, usuario anonimo vs autenticado

## File List
- `packages/shared/src/types/diagnostic.ts` — Added DiagnosticCta, DiagnosticResponse types
- `packages/shared/src/types/index.ts` — Export new types
- `packages/shared/src/types/database.types.ts` — Added original_image_url to diagnostics Update type
- `packages/api/src/schemas/diagnostic.schema.ts` — NEW: Zod schemas for diagnostic endpoints
- `packages/api/src/services/diagnostic.service.ts` — NEW: Main diagnostic service (CRUD, upload, link)
- `packages/api/src/services/diagnostic-analyzer.service.ts` — NEW: AI analysis with heuristic scoring
- `packages/api/src/routes/diagnostics.routes.ts` — NEW: 3 endpoints (POST create, POST upload, GET result)
- `packages/api/src/server.ts` — Registered diagnostics routes
- `packages/api/src/__tests__/diagnostic.service.test.ts` — NEW: Unit tests for diagnostic service
- `packages/api/src/__tests__/diagnostic-analyzer.service.test.ts` — NEW: Unit tests for analyzer
- `packages/api/src/__tests__/diagnostics.routes.test.ts` — NEW: Integration tests for routes

## QA Results
