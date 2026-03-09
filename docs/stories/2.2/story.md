# Story 2.2 - Chat de Refinamento UI: Interface Conversacional, Historico Visual e Navegacao de Versoes

## Status: Done

## Story
As a corretor de imoveis ou arquiteto autenticado, I want a conversational chat interface where I can type natural language commands in Portuguese to refine my room render (e.g., "deixa mais aconchegante", "tira o tapete", "muda o piso para madeira clara"), see real-time progress as the AI processes each refinement, browse through visual version history, and revert to any previous version — so that I can iteratively perfect my staging design through an intuitive dialogue.

## PRD Requirements
| Requirement | Description | Coverage |
|-------------|-------------|----------|
| FR-04 | Chat conversacional para refinamento em linguagem natural | Full (chat input + message rendering) |
| FR-05 | Edicoes pontuais sem regenerar cena inteira, <15s por iteracao | Full (real-time progress + partial update display) |
| FR-06 | Interpretar comandos em PT-BR usando LLM | Full (input field sends to NLU API from Story 2.1) |
| FR-27 | Iteracoes ilimitadas com historico visual de versoes e navegacao | Full (version timeline + revert) |
| FR-28 | Respeitar especificacoes do usuario rigorosamente | Full (operations display shows what AI interpreted) |
| NFR-02 | Refinamento via chat <15 segundos por iteracao | Full (progress indicator) |
| NFR-12 | Web responsiva desktop + mobile | Full (responsive chat layout) |
| NFR-14 | Interface em PT-BR | Full (all labels and placeholders) |
| NFR-16 | Feedback visual em tempo real via WebSocket | Full (Supabase Realtime for refinement progress) |
| NFR-17 | Disclaimer "imagem ilustrativa gerada por IA" | Full (disclaimer on rendered images) |

## Acceptance Criteria

### AC-1: Layout do Workspace do Projeto com Chat
- Given um usuario autenticado acessa `/app/projeto/:id`
- When a pagina carrega com um projeto que tem pelo menos 1 render completado
- Then o sistema exibe um layout de 2 paineis: painel esquerdo com a imagem do render atual (ocupando ~60% da largura) e painel direito com o chat de refinamento (~40%)
- And o render exibido e a versao mais recente do projeto
- And abaixo da imagem, uma barra de ferramentas mostra acoes: "Trocar Estilo", "Editar Elementos", "Comparar Antes/Depois", "Compartilhar"
- And a imagem exibe o disclaimer "Imagem ilustrativa gerada por IA" como overlay discreto (NFR-17)

### AC-2: Interface do Chat com Historico de Mensagens
- Given o painel de chat esta visivel
- When o historico carrega via `GET /api/projects/:id/chat/history`
- Then as mensagens sao exibidas em formato de chat: mensagens do usuario alinhadas a direita (bolha azul), respostas do sistema alinhadas a esquerda (bolha cinza)
- And cada mensagem do sistema inclui: texto de confirmacao da operacao, thumbnail da versao gerada (clicavel para exibir no painel principal), e badges com as operacoes extraidas pelo NLU (ex: "remover: tapete", "mudar: piso -> madeira clara")
- And o chat faz scroll automatico para a mensagem mais recente
- And mensagens antigas sao carregadas via scroll infinito (paginacao cursor-based)

### AC-3: Input de Mensagem e Envio
- Given o chat esta visivel e nenhum refinamento esta em andamento
- When o usuario digita uma mensagem no campo de input (placeholder: "Descreva a alteracao desejada...")
- Then o campo aceita texto livre em portugues
- And o usuario pode enviar via botao "Enviar" ou pressionando Enter
- And apos envio, a mensagem aparece imediatamente na bolha do usuario
- And o campo de input e desabilitado durante o processamento (com indicador de loading)
- And o sistema envia POST para `/api/projects/:id/chat` com a mensagem

### AC-4: Progresso em Tempo Real do Refinamento
- Given o usuario enviou uma mensagem de refinamento
- When o sistema esta processando a operacao
- Then uma mensagem do sistema com indicador de progresso aparece no chat (spinner + "Processando: trocando piso para madeira clara...")
- And o progresso e atualizado em tempo real via Supabase Realtime (canal `project:{projectId}`)
- And ao concluir (<15s alvo), a mensagem de progresso e substituida pela mensagem final com thumbnail da nova versao
- And a imagem no painel principal atualiza automaticamente para a nova versao
- And em caso de erro, a mensagem do sistema exibe "Nao foi possivel aplicar a alteracao. Tente novamente." com botao de retry

### AC-5: Historico Visual de Versoes (Timeline)
- Given o projeto tem multiplas versoes
- When o usuario clica no icone "Historico" na barra de ferramentas ou no header do chat
- Then um painel/drawer lateral exibe todas as versoes como uma timeline vertical
- And cada versao mostra: thumbnail da imagem, numero da versao (ex: "v3"), timestamp relativo (ex: "ha 5 minutos"), e a descricao da operacao que a gerou
- And a versao atual esta destacada visualmente
- And clicar em qualquer versao exibe essa imagem no painel principal (preview temporario)
- And as versoes sao carregadas via `GET /api/projects/:id/versions`

### AC-6: Reverter para Versao Anterior
- Given o usuario esta visualizando o historico de versoes
- When o usuario clica em "Restaurar esta versao" em uma versao que nao e a atual
- Then o sistema exibe um dialog de confirmacao: "Restaurar versao v{N}? Uma nova versao sera criada a partir desta."
- And ao confirmar, o sistema envia POST para `/api/projects/:id/versions/:versionId/revert`
- And uma nova versao e criada (non-destructive), o historico atualiza, e o painel principal exibe a versao restaurada
- And uma mensagem automatica aparece no chat: "Versao restaurada a partir de v{N}"

### AC-7: Sugestoes Rapidas de Refinamento
- Given o chat esta vazio ou o usuario acabou de gerar o primeiro render
- When o chat e exibido
- Then abaixo do campo de input, uma linha de chips de sugestao e exibida: "Mais aconchegante", "Mudar cor das paredes", "Trocar piso", "Remover tapete", "Adicionar plantas", "Mudar iluminacao"
- And clicar em um chip preenche o campo de input com o texto correspondente (usuario ainda precisa enviar)
- And as sugestoes desaparecem apos 3+ mensagens no chat

### AC-8: Responsividade Mobile
- Given um usuario acessa `/app/projeto/:id` em dispositivo mobile (viewport < 768px)
- When o workspace renderiza
- Then o layout muda de side-by-side para stacked: imagem em cima, chat embaixo
- And o chat pode ser expandido para tela cheia com gesto de swipe up ou botao de expandir
- And o historico de versoes abre como bottom sheet em vez de drawer lateral
- And o campo de input fica fixo na parte inferior da tela (acima do teclado virtual)
- And todos os elementos tocaveis tem tamanho minimo de 44px

## Technical Notes

### Architecture References
- Frontend arch: `docs/architecture/fullstack/frontend-arch.md`
- User flows: `docs/architecture/ux-ui/user-flows.md` — Flow 2 (Refinamento via Chat)
- Information architecture: `docs/architecture/ux-ui/information-architecture.md` — /app/projeto/:id

### API Endpoints Consumed
- `GET /api/projects/:id` — Fetch project details (Story 7.4)
- `GET /api/projects/:id/chat/history` — Chat history with cursor pagination (Story 2.1)
- `POST /api/projects/:id/chat` — Send refinement message (Story 2.1)
- `GET /api/projects/:id/versions` — List all versions (Story 2.1)
- `GET /api/projects/:id/versions/:versionId` — Get single version (Story 2.1)
- `POST /api/projects/:id/versions/:versionId/revert` — Revert to version (Story 2.1)
- Supabase Realtime — Subscribe to `project:{projectId}` channel for refinement progress (Story 7.5)

### State Management
- Server state: React Query for chat history (`useInfiniteQuery`), versions (`useQuery`), mutations (`useMutation`)
- Real-time: Supabase Realtime subscription for refinement job progress
- UI state: `useState` for active version preview, chat input, version panel visibility
- Optimistic updates: Chat message appears immediately in UI before API confirms

### Key Components
- `ProjectWorkspace` — Main 2-panel layout (render view + chat panel)
- `RenderViewer` — Image display with zoom, disclaimer overlay, toolbar
- `ChatPanel` — Chat container with message list, input, suggestions
- `ChatMessage` — Individual message bubble (user vs system variants)
- `ChatInput` — Text input with send button, disabled state during processing
- `RefinementProgress` — In-chat progress indicator with real-time updates
- `OperationBadges` — Visual badges showing NLU-extracted operations
- `VersionTimeline` — Drawer/bottom sheet with version history timeline
- `VersionCard` — Individual version in timeline (thumbnail, number, timestamp, description)
- `QuickSuggestions` — Chips row with common refinement commands

### Existing Foundation
- Dashboard layout with protected routes (Story 7.7)
- React Query setup with QueryClientProvider (Story 6.4)
- Supabase client and Realtime utilities (Story 7.7)
- API service pattern (Story 6.4)
- UI atoms: Button, Input, Badge (Story 7.7)
- Wizard components and patterns (Story 1.4)

## Tasks
- [x] Task 1: Create chat service functions (`services/chat-service.ts`) — sendMessage, getChatHistory (cursor pagination), getVersions, getVersion, revertVersion, subscribeToRefinementProgress
- [x] Task 2: Create `ChatMessage` component (`components/molecules/ChatMessage.tsx`) — user bubble (right-aligned, blue) and system bubble (left-aligned, gray) variants, with thumbnail, operation badges, timestamp
- [x] Task 3: Create `OperationBadges` component (`components/atoms/OperationBadges.tsx`) — visual chips showing NLU operations (type + target) with color coding per operation type
- [x] Task 4: Create `ChatInput` component (`components/molecules/ChatInput.tsx`) — text input with send button, Enter to submit, disabled state during processing, PT-BR placeholder
- [x] Task 5: Create `QuickSuggestions` component (`components/molecules/QuickSuggestions.tsx`) — horizontal scrollable chips row with common refinement commands, auto-hides after 3+ messages
- [x] Task 6: Create `RefinementProgress` component (`components/molecules/RefinementProgress.tsx`) — in-chat loading indicator with operation description, real-time progress via Supabase Realtime
- [x] Task 7: Create `ChatPanel` component (`components/organisms/ChatPanel.tsx`) — compose ChatMessage list with infinite scroll, ChatInput, QuickSuggestions, auto-scroll to latest, empty state
- [x] Task 8: Create `RenderViewer` component (`components/molecules/RenderViewer.tsx`) — image display with AI disclaimer overlay, toolbar with action buttons (Trocar Estilo, Editar, Comparar, Compartilhar, Historico)
- [x] Task 9: Create `VersionCard` component (`components/molecules/VersionCard.tsx`) — version thumbnail, version number, relative timestamp, operation description, "Restaurar" button, active highlight
- [x] Task 10: Create `VersionTimeline` component (`components/organisms/VersionTimeline.tsx`) — drawer (desktop) / bottom sheet (mobile) with vertical timeline of VersionCards, confirmation dialog for revert
- [x] Task 11: Implement project workspace page (`app/(dashboard)/projects/[id]/page.tsx`) — 2-panel layout composing RenderViewer + ChatPanel, responsive stacked layout for mobile, version timeline integration
- [x] Task 12: Implement Supabase Realtime subscription hook (`hooks/use-refinement-progress.ts`) — subscribe to project channel, handle status events (refining, progress, ready, error), cleanup on unmount
- [x] Task 13: Write unit tests for chat service functions (mock API responses, cursor pagination, Realtime subscription)
- [x] Task 14: Write unit tests for all molecule/atom components (ChatMessage variants, ChatInput states, QuickSuggestions visibility, RefinementProgress states, OperationBadges rendering, VersionCard states)
- [x] Task 15: Write unit tests for organism components (ChatPanel infinite scroll + auto-scroll, VersionTimeline revert flow)
- [x] Task 16: Write integration tests for project workspace page (full flow: load project → send message → progress → new version, version history → revert, mobile responsiveness)
- [x] Task 17: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.7 (Frontend Shell — layouts, auth, Supabase client, atoms) - Done
- Story 6.4 (Dashboard UI — React Query setup, API service pattern) - Done
- Story 2.1 (Chat de Refinamento API — chat endpoints, version endpoints, NLU) - Done
- Story 7.4 (Project CRUD API — project details endpoint) - Done
- Story 7.5 (Render Job Queue — Supabase Realtime progress) - Done
- Story 1.4 (Staging UI — wizard creates the project that this workspace displays) - Done

## Dev Agent Record
### Implementation Plan
Implemented all 17 tasks: chat service, 7 molecule/atom components, 2 organism components, 1 custom hook, 1 page, and comprehensive tests covering all acceptance criteria.

### Debug Log
- Fixed infinite re-render loop in useRefinementProgress by using refs for callback props instead of including them in useEffect dependencies.
- Fixed scrollIntoView not available in jsdom by adding typeof guard.
- Added has_more field to ChatHistoryResponse (aligned with API contract).

### Change Log
- 2026-03-09: Full implementation of Story 2.2 - all 17 tasks completed, all quality gates pass.

## Testing
- 39 test suites, 221 tests all passing
- New tests: 10 test files covering service, atoms, molecules, organisms, and integration page
- Quality gates: lint (0 errors), typecheck (0 errors), test (0 failures)

## File List
- `packages/web/src/services/chat-service.ts` — NEW: Chat service with API functions and Realtime subscription
- `packages/web/src/hooks/use-refinement-progress.ts` — NEW: Custom hook for Supabase Realtime refinement progress
- `packages/web/src/components/atoms/OperationBadges.tsx` — NEW: NLU operation badges with color coding
- `packages/web/src/components/molecules/ChatMessage.tsx` — NEW: Chat message bubble (user/system variants)
- `packages/web/src/components/molecules/ChatInput.tsx` — NEW: Text input with send button and disabled state
- `packages/web/src/components/molecules/QuickSuggestions.tsx` — NEW: Suggestion chips row
- `packages/web/src/components/molecules/RefinementProgress.tsx` — NEW: In-chat progress indicator
- `packages/web/src/components/molecules/RenderViewer.tsx` — NEW: Image display with disclaimer and toolbar
- `packages/web/src/components/molecules/VersionCard.tsx` — NEW: Version card with thumbnail and restore
- `packages/web/src/components/organisms/ChatPanel.tsx` — NEW: Chat container with infinite scroll
- `packages/web/src/components/organisms/VersionTimeline.tsx` — NEW: Version history drawer/bottom sheet
- `packages/web/src/app/(dashboard)/projects/[id]/page.tsx` — NEW: Project workspace page (2-panel layout)
- `packages/web/src/__tests__/services/chat-service.test.ts` — NEW: Chat service unit tests
- `packages/web/src/__tests__/atoms/operation-badges.test.tsx` — NEW: OperationBadges tests
- `packages/web/src/__tests__/molecules/chat-message.test.tsx` — NEW: ChatMessage tests
- `packages/web/src/__tests__/molecules/chat-input.test.tsx` — NEW: ChatInput tests
- `packages/web/src/__tests__/molecules/quick-suggestions.test.tsx` — NEW: QuickSuggestions tests
- `packages/web/src/__tests__/molecules/refinement-progress.test.tsx` — NEW: RefinementProgress tests
- `packages/web/src/__tests__/molecules/render-viewer.test.tsx` — NEW: RenderViewer tests
- `packages/web/src/__tests__/molecules/version-card.test.tsx` — NEW: VersionCard tests
- `packages/web/src/__tests__/organisms/chat-panel.test.tsx` — NEW: ChatPanel organism tests
- `packages/web/src/__tests__/organisms/version-timeline.test.tsx` — NEW: VersionTimeline organism tests
- `packages/web/src/__tests__/project-workspace-page.test.tsx` — NEW: Integration tests for workspace page

## QA Results
