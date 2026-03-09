# Story 1.4 - Staging UI: Wizard de Novo Projeto, Upload, Selecao de Estilo e Geracao com Progresso

## Status: Done

## Story
As a corretor de imoveis ou arquiteto autenticado, I want a step-by-step wizard to create a new staging project — choosing input type, uploading a photo or providing spatial description, adding reference items, selecting a decoration style, reviewing the ASCII croqui, and watching the render generate in real-time — so that I can go from idea to photorealistic staging in under 3 minutes.

## PRD Requirements
| Requirement | Description | Coverage |
|-------------|-------------|----------|
| FR-01 | Upload de foto e geracao de versao decorada fotorrealista em 10-30s | Full (UI layer) |
| FR-02 | 10 estilos predefinidos de decoracao | Full (style selection step) |
| FR-03 | Variacoes de estilo com 1 clique | Partial (initial style selection) |
| FR-24 | Input alternativo: descricao textual com medidas | Full (text input variant) |
| FR-25 | Itens especificos com medidas e/ou fotos de referencia | Full (reference items step) |
| FR-26 | Combinar inputs: foto + descricao + referencias | Full (combined input mode) |
| FR-29 | Croqui/planta baixa ASCII de confirmacao | Full (croqui step) |
| FR-30 | Tecnica de 3 turnos (gerar, iterar, confirmar) no croqui | Full (croqui iteration) |
| FR-31 | Aprovacao explicita do croqui antes da geracao | Full (approve button) |
| FR-32 | Interpretacao de foto via IA para gerar croqui | Full (photo input -> croqui) |
| NFR-01 | Render em menos de 30 segundos | Full (progress UI) |
| NFR-03 | Time-to-value < 3 minutos | Full (wizard flow) |
| NFR-12 | Web responsiva desktop + mobile | Full (responsive wizard) |
| NFR-14 | Interface em PT-BR | Full (all labels) |
| NFR-16 | Feedback visual em tempo real via WebSocket | Full (progress bar + stage updates) |

## Acceptance Criteria

### AC-1: Wizard com 5 Steps e Navegacao
- Given um usuario autenticado acessa `/app/novo`
- When a pagina carrega
- Then o sistema exibe um wizard com 5 steps indicados por um stepper horizontal: (1) Tipo de Input, (2) Detalhes, (3) Estilo, (4) Croqui, (5) Geracao
- And cada step mostra indicador visual de progresso (ativo, completo, pendente)
- And botoes "Voltar" e "Proximo" permitem navegacao entre steps (exceto step 5 que e automatico apos aprovacao do croqui)

### AC-2: Step 1 — Selecao do Tipo de Input
- Given o usuario esta no Step 1 do wizard
- When a pagina renderiza
- Then 3 opcoes sao exibidas como cards selecionaveis: "Foto do Local" (icone camera), "Descricao com Medidas" (icone regua), "Combinado" (icone combo)
- And ao selecionar uma opcao, o botao "Proximo" e habilitado
- And a opcao selecionada determina a variante do Step 2

### AC-3: Step 2 — Variante Foto (Upload)
- Given o usuario selecionou "Foto do Local" ou "Combinado" no Step 1
- When o Step 2 renderiza
- Then uma area de drag-and-drop e exibida com texto "Arraste a foto aqui ou clique para enviar" e indicacao "JPEG/PNG ate 20MB"
- And o usuario pode arrastar um arquivo ou clicar para abrir o seletor de arquivos
- And apos upload bem-sucedido, um preview da foto e exibido com opcao de remover e reenviar
- And arquivos invalidos (>20MB, formato errado) mostram mensagem de erro em PT-BR
- And um select de "Tipo de ambiente" (Sala, Quarto, Cozinha, Banheiro, Escritorio, Varanda, Outro) e exibido ao lado

### AC-4: Step 2 — Variante Descricao Textual
- Given o usuario selecionou "Descricao com Medidas" ou "Combinado" no Step 1
- When o Step 2 renderiza
- Then um formulario estruturado e exibido com: tipo de ambiente (select), largura (m), comprimento (m), pe-direito (m), aberturas (lista dinamica: tipo, parede, largura, altura), e descricao adicional (textarea)
- And validacao impede avancar sem dimensoes obrigatorias preenchidas (largura, comprimento)
- And no modo "Combinado", tanto o upload de foto quanto o formulario de medidas sao exibidos lado a lado

### AC-5: Step 2 — Itens de Referencia (Todas as Variantes)
- Given o usuario esta no Step 2 de qualquer variante
- When a secao "Itens especificos" e visivel
- Then o usuario pode clicar "+ Adicionar item" para abrir um mini-formulario com: nome do item (text), medida (text, opcional), foto de referencia (upload, opcional)
- And itens adicionados aparecem como uma lista com preview da foto (se houver) e botao de remover
- And o sistema permite adicionar multiplos itens

### AC-6: Step 3 — Selecao de Estilo
- Given o usuario avancou para o Step 3
- When a pagina renderiza
- Then os 10 estilos predefinidos sao exibidos como uma grade de cards visuais (2x5): moderno, industrial, minimalista, classico, escandinavo, rustico, tropical, contemporaneo, boho, luxo
- And cada card mostra: nome do estilo em PT-BR, imagem de preview representativa, e borda/destaque visual quando selecionado
- And ao clicar em um estilo, ele fica selecionado e o botao "Proximo" e habilitado
- And os estilos sao carregados via `GET /api/staging/styles` (Story 1.3)

### AC-7: Step 4 — Croqui de Confirmacao com Iteracao
- Given o usuario avancou para o Step 4
- When o step carrega
- Then o sistema envia os dados do projeto para a API de croqui (`POST /api/projects/:id/croqui/generate` — Story 1.2) e exibe loading enquanto aguarda
- And o croqui ASCII gerado e renderizado em uma area com fonte monoespacada, mostrando: dimensoes do espaco, posicao de portas/janelas, itens de mobilia com medidas
- And abaixo do croqui, um campo de texto permite ao usuario digitar ajustes (ex: "mova o sofa para a parede sul")
- And o botao "Ajustar" envia a iteracao para `POST /api/projects/:id/croqui/iterate` e atualiza o croqui exibido
- And o botao "Aprovar e Gerar Imagem" finaliza a aprovacao (`POST /api/projects/:id/croqui/approve`) e avanca para Step 5
- And o fluxo de 3 turnos e respeitado: o usuario pode iterar quantas vezes quiser antes de aprovar

### AC-8: Step 5 — Geracao com Progresso em Tempo Real
- Given o usuario aprovou o croqui e o sistema iniciou a geracao
- When o Step 5 esta ativo
- Then uma barra de progresso animada e exibida com porcentagem e descricao do estagio atual (ex: "Estimando profundidade... 25%", "Aplicando estilo industrial... 75%")
- And os updates de progresso vem via Supabase Realtime (WebSocket) conectados ao render job (Story 7.5)
- And uma mensagem contextual/dica sobre staging aparece durante a espera (ex: "Voce sabia? Imoveis com staging profissional recebem 47% mais consultas")
- And quando a geracao completa (100%), o wizard redireciona automaticamente para `/app/projeto/:id` (workspace do projeto)
- And se a geracao falhar, uma mensagem de erro amigavel e exibida com botao "Tentar Novamente"

### AC-9: Persistencia e Criacao do Projeto
- Given o usuario avanca no wizard
- When os dados sao preenchidos em cada step
- Then o projeto e criado na API (`POST /api/projects` — Story 7.4) ao final do Step 2, com os dados de input (foto, medidas, itens de referencia)
- And o `project_id` retornado e usado nos steps seguintes (croqui, geracao)
- And se o usuario sair do wizard antes de completar, o projeto fica com status "draft" e pode ser retomado

### AC-10: Responsividade Mobile
- Given um usuario acessa `/app/novo` em dispositivo mobile (viewport < 768px)
- When o wizard renderiza
- Then os cards de selecao de input (Step 1) empilham verticalmente
- And o upload e formulario (Step 2) ocupam largura total, um abaixo do outro no modo Combinado
- And os estilos (Step 3) exibem em grade 2x5 com scroll
- And o croqui (Step 4) e scrollavel horizontalmente se necessario
- And todos os botoes e campos sao tocaveis com tamanho minimo de 44px

## Technical Notes

### Architecture References
- Wireframes: `docs/architecture/ux-ui/wireframes.md` — Section 4.2 (Wizard de Novo Projeto)
- User flows: `docs/architecture/ux-ui/user-flows.md` — Flow 1 (Primeiro Render), Flow 3 (Input Multi-Formato)
- Information architecture: `docs/architecture/ux-ui/information-architecture.md` — /app/novo
- Frontend arch: `docs/architecture/fullstack/frontend-arch.md`

### API Endpoints Consumed
- `POST /api/projects` — Create project with spatial data (Story 7.4)
- `POST /api/projects/:id/spatial-input` — Submit spatial description (Story 1.1)
- `POST /api/projects/:id/reference-items` — Add reference items (Story 1.1)
- `GET /api/staging/styles` — Fetch 10 decoration styles (Story 1.3)
- `POST /api/projects/:id/croqui/generate` — Generate ASCII croqui (Story 1.2)
- `POST /api/projects/:id/croqui/iterate` — Iterate on croqui (Story 1.2)
- `POST /api/projects/:id/croqui/approve` — Approve croqui (Story 1.2)
- `POST /api/projects/:id/staging/generate` — Start staging generation (Story 1.3)
- Supabase Realtime — Subscribe to render job progress (Story 7.5)

### State Management
- Wizard state: `useState` / `useReducer` for multi-step form state (input type, files, measurements, items, selected style)
- Server state: React Query (`useMutation` for project creation, croqui operations, staging generation)
- Real-time: Supabase Realtime subscription for render progress updates
- URL state: `/app/novo?step=1` for step tracking (enables browser back/forward)

### Key Components
- `NewProjectWizard` — Main wizard container with step navigation
- `StepIndicator` — Horizontal stepper showing 5 steps with progress states
- `InputTypeSelector` — 3 selectable cards for input type
- `PhotoUploader` — Drag-and-drop + click file upload with preview
- `SpatialForm` — Structured form for room dimensions and openings
- `ReferenceItemList` — Dynamic list for adding items with photos and measurements
- `StyleGrid` — 2x5 grid of selectable decoration style cards
- `CroquiPreview` — Monospace rendering of ASCII croqui with iteration controls
- `GenerationProgress` — Progress bar with real-time WebSocket updates

### Existing Foundation
- Dashboard layout with protected routes (Story 7.7)
- React Query setup with QueryClientProvider (Story 6.4)
- Supabase client utilities (Story 7.7)
- API service pattern (Story 6.4 — `services/project-service.ts`)
- UI atoms: Button, Input, Badge (Story 7.7)
- Molecule components: EmptyState, SkeletonCard (Story 6.4)

### Key Packages (may need to add)
- `react-dropzone` — Drag-and-drop file upload (or custom implementation)

## Tasks
- [x] Task 1: Create wizard state management hook (`hooks/use-new-project-wizard.ts`) — useReducer for multi-step form state (inputType, files, measurements, openings, referenceItems, selectedStyle, projectId, currentStep)
- [x] Task 2: Create `StepIndicator` component (`components/molecules/StepIndicator.tsx`) — horizontal stepper with 5 labeled steps showing active/complete/pending states
- [x] Task 3: Create `InputTypeSelector` component (`components/molecules/InputTypeSelector.tsx`) — 3 selectable cards (Foto, Descricao, Combinado) with icons and descriptions in PT-BR
- [x] Task 4: Create `PhotoUploader` component (`components/molecules/PhotoUploader.tsx`) — drag-and-drop area with click fallback, file validation (JPEG/PNG, max 20MB), preview with remove, PT-BR labels
- [x] Task 5: Create `SpatialForm` component (`components/molecules/SpatialForm.tsx`) — structured form with room type select, dimensions (width, length, ceiling height), dynamic openings list (type, wall, width, height), and additional description textarea
- [x] Task 6: Create `ReferenceItemList` component (`components/molecules/ReferenceItemList.tsx`) — dynamic list with "Add Item" button, each item: name input, measurement input, photo upload, remove button
- [x] Task 7: Create `StyleGrid` component (`components/molecules/StyleGrid.tsx`) — fetch styles from API, display 2x5 grid of selectable style cards with name, preview image, and selection highlight
- [x] Task 8: Create `CroquiPreview` component (`components/molecules/CroquiPreview.tsx`) — monospace ASCII renderer, iteration input field, "Ajustar" button, "Aprovar e Gerar Imagem" button, loading state during generation/iteration
- [x] Task 9: Create `GenerationProgress` component (`components/molecules/GenerationProgress.tsx`) — animated progress bar with stage labels, percentage, contextual tip messages, error state with retry, auto-redirect on completion
- [x] Task 10: Create API service functions (`services/staging-wizard-service.ts`) — createProject, submitSpatialInput, addReferenceItems, generateCroqui, iterateCroqui, approveCroqui, startGeneration, subscribeToProgress
- [x] Task 11: Implement wizard page (`app/(dashboard)/projects/new/page.tsx`) — compose all components with step navigation, validation per step, "Voltar"/"Proximo" buttons, responsive layout
- [x] Task 12: Implement Supabase Realtime subscription for render progress updates in GenerationProgress component (hook into render job channel from Story 7.5)
- [x] Task 13: Write unit tests for wizard state hook (step transitions, validation, data persistence across steps)
- [x] Task 14: Write unit tests for all molecule components (StepIndicator, InputTypeSelector, PhotoUploader, SpatialForm, ReferenceItemList, StyleGrid, CroquiPreview, GenerationProgress)
- [x] Task 15: Write integration tests for wizard page (full flow: select input → upload → select style → croqui → generate, error states, mobile responsiveness)
- [x] Task 16: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.7 (Frontend Shell — layouts, auth, Supabase client, atoms) ✅
- Story 6.4 (Dashboard UI — React Query setup, API service pattern) ✅
- Story 7.4 (Project CRUD API — project creation, file upload) ✅
- Story 1.1 (Spatial Input API — spatial description, reference items) ✅
- Story 1.2 (Croqui ASCII API — generate, iterate, approve) ✅
- Story 1.3 (Staging Generation API — styles, generate, progress) ✅
- Story 7.5 (Render Job Queue — Supabase Realtime progress updates) ✅

## Dev Agent Record
### Implementation Plan
Wizard de 5 steps implementado com useReducer para state management, 8 molecule components, API service layer, e Supabase Realtime para progresso em tempo real.

### Debug Log
Nenhum bug encontrado durante implementacao.

### Change Log
- 2026-03-09: Implementacao completa de todos os 16 tasks da Story 1.4

## Testing
- 26 test suites, 132 tests passing
- Lint: 0 errors, 2 warnings (img elements for blob URLs - acceptable)
- Typecheck: passes with no errors

## File List
- `packages/web/src/hooks/use-new-project-wizard.ts` — Wizard state management hook (useReducer)
- `packages/web/src/components/molecules/StepIndicator.tsx` — Horizontal stepper (5 steps)
- `packages/web/src/components/molecules/InputTypeSelector.tsx` — 3 selectable cards (Foto, Descricao, Combinado)
- `packages/web/src/components/molecules/PhotoUploader.tsx` — Drag-and-drop upload with validation
- `packages/web/src/components/molecules/SpatialForm.tsx` — Room dimensions and openings form
- `packages/web/src/components/molecules/ReferenceItemList.tsx` — Dynamic reference items list
- `packages/web/src/components/molecules/StyleGrid.tsx` — 2x5 decoration style grid
- `packages/web/src/components/molecules/CroquiPreview.tsx` — ASCII croqui viewer with iteration
- `packages/web/src/components/molecules/GenerationProgress.tsx` — Progress bar with real-time updates
- `packages/web/src/services/staging-wizard-service.ts` — API service functions
- `packages/web/src/app/(dashboard)/projects/new/page.tsx` — Wizard page
- `packages/web/src/__tests__/hooks/use-new-project-wizard.test.ts` — Hook tests
- `packages/web/src/__tests__/molecules/step-indicator.test.tsx` — StepIndicator tests
- `packages/web/src/__tests__/molecules/input-type-selector.test.tsx` — InputTypeSelector tests
- `packages/web/src/__tests__/molecules/photo-uploader.test.tsx` — PhotoUploader tests
- `packages/web/src/__tests__/molecules/spatial-form.test.tsx` — SpatialForm tests
- `packages/web/src/__tests__/molecules/reference-item-list.test.tsx` — ReferenceItemList tests
- `packages/web/src/__tests__/molecules/style-grid.test.tsx` — StyleGrid tests
- `packages/web/src/__tests__/molecules/croqui-preview.test.tsx` — CroquiPreview tests
- `packages/web/src/__tests__/molecules/generation-progress.test.tsx` — GenerationProgress tests

## QA Results
