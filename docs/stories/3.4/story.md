# Story 3.4 - Editing UI: Segmentacao de Elementos, Correcao de Iluminacao e Remocao de Objetos

## Status: Done

## Story
As a corretor de imoveis ou arquiteto autenticado, I want an intuitive visual editing interface where I can click on elements to swap materials (wall paint, floor type, countertop texture), enhance lighting with one click, and select objects to remove from the scene — so that I can fine-tune my staging design without needing external photo editing tools, completing the creative workflow entirely within the platform.

## PRD Requirements
| Requirement | Description | Coverage |
|-------------|-------------|----------|
| FR-07 | Segmentacao e troca individual de elementos: parede, piso, bancada, armario usando SAM | Full (click-to-segment UI + material picker) |
| FR-08 | Correcao automatica de fotos escuras ou mal expostas, melhorando iluminacao | Full (lighting panel with mode selection) |
| FR-09 | Remocao de objetos indesejados usando inpainting AI | Full (click/bbox object selection + removal) |
| NFR-02 | Refinamento <15 segundos por iteracao | Full (progress indicator during operations) |
| NFR-12 | Web responsiva desktop + mobile | Full (responsive editing layout) |
| NFR-14 | Interface em PT-BR | Full (all labels, tooltips, and feedback in Portuguese) |
| NFR-16 | Feedback visual em tempo real via WebSocket | Full (Supabase Realtime progress for all edit operations) |
| NFR-17 | Disclaimer "imagem ilustrativa gerada por IA" | Full (disclaimer overlay on edited images) |

## Acceptance Criteria

### AC-1: Toolbar de Edicao no Workspace do Projeto
- Given um usuario autenticado acessa `/app/projeto/:id` com um render completado
- When o usuario clica no botao "Editar Elementos" na barra de ferramentas abaixo da imagem (ja existente em Story 2.2)
- Then o sistema entra no modo de edicao, exibindo uma toolbar lateral com 3 ferramentas: "Segmentar Elementos" (icone de grid), "Iluminacao" (icone de sol), "Remover Objetos" (icone de borracha)
- And a toolbar destaca a ferramenta ativa com cor primaria
- And um botao "Sair da Edicao" permite voltar ao modo de visualizacao/chat

### AC-2: Segmentacao de Elementos — Click-to-Select
- Given o usuario ativou a ferramenta "Segmentar Elementos"
- When o usuario clica em um ponto da imagem (ex: no piso, na parede, no armario)
- Then o sistema chama POST `/api/projects/:projectId/segment` com as coordenadas (x, y) normalizadas
- And exibe um spinner overlay na imagem enquanto processa
- And ao receber a resposta, destaca o elemento segmentado com overlay semi-transparente colorido (mascara) e exibe o label classificado em PT-BR (ex: "Piso", "Parede", "Armario", "Bancada")
- And um painel lateral de materiais abre automaticamente mostrando materiais sugeridos para aquele tipo de elemento

### AC-3: Auto-Segmentacao (Detectar Todos os Elementos)
- Given o usuario ativou a ferramenta "Segmentar Elementos"
- When o usuario clica no botao "Detectar Todos" na toolbar
- Then o sistema chama POST `/api/projects/:projectId/segment/all`
- And exibe progresso em tempo real via Supabase Realtime
- And ao completar, todos os elementos detectados sao destacados com overlays coloridos distintos (cada tipo de elemento com cor unica) e labels em PT-BR
- And o usuario pode clicar em qualquer elemento destacado para abrir o painel de materiais

### AC-4: Painel de Materiais e Aplicacao de Troca
- Given um elemento foi segmentado e selecionado (via AC-2 ou AC-3)
- When o painel de materiais abre
- Then exibe uma lista de materiais sugeridos obtidos via GET `/api/projects/:projectId/segment/:segmentId/materials`, cada um com nome em PT-BR, thumbnail de preview, e descricao curta
- And o usuario pode tambem digitar uma descricao customizada de material (ex: "marmore carrara branco")
- When o usuario seleciona um material ou submete descricao customizada e clica "Aplicar"
- Then o sistema chama POST `/api/projects/:projectId/segment/apply` com segment_id e material descriptor
- And exibe barra de progresso em tempo real (segmentando: 25%, pintando: 50%, mesclando: 75%, salvando: 100%) via Supabase Realtime
- And ao completar, a imagem atualiza para mostrar o resultado com o novo material aplicado
- And um toast de sucesso aparece: "Material atualizado com sucesso!"

### AC-5: Painel de Iluminacao
- Given o usuario ativou a ferramenta "Iluminacao"
- When o painel de iluminacao abre
- Then exibe 3 cards de modo: "Automatico" (recomendado, com badge), "Luz Natural", "Luz Quente" — cada um com icone representativo e descricao curta em PT-BR
- And exibe o score de brilho atual da imagem (obtido via POST `/api/projects/:projectId/enhance-lighting` com analise) como barra visual (0-100)
- And se o score < 40, exibe aviso amarelo: "Sua foto parece estar escura. Recomendamos melhorar a iluminacao."
- When o usuario seleciona um modo e clica "Melhorar Iluminacao"
- Then o sistema chama POST `/api/projects/:projectId/enhance-lighting` com `{ mode, auto_enhance: true }`
- And exibe barra de progresso em tempo real (analisando: 20%, melhorando: 50%, mesclando: 75%, salvando: 100%)
- And ao completar, a imagem atualiza com a versao iluminada e um toast aparece: "Iluminacao melhorada!"

### AC-6: Remocao de Objetos — Click-to-Remove
- Given o usuario ativou a ferramenta "Remover Objetos"
- When o usuario clica em um objeto na imagem (entulho, movel velho, item pessoal)
- Then o sistema chama POST `/api/projects/:projectId/remove-object` com coordenadas (x, y)
- And exibe o objeto detectado com overlay vermelho semi-transparente (mascara de preview) e label classificado
- And dois botoes aparecem sobre o overlay: "Remover" (primario) e "Cancelar" (secundario)
- When o usuario clica "Remover"
- Then o sistema chama POST `/api/projects/:projectId/remove-object/apply` com mask_id
- And exibe progresso em tempo real (segmentando: 20%, mascarando: 40%, preenchendo: 60%, mesclando: 80%, salvando: 100%)
- And ao completar, a imagem atualiza mostrando a area limpa sem o objeto
- And um toast aparece: "Objeto removido com sucesso!"

### AC-7: Remocao em Lote (Multi-Selecao)
- Given o usuario esta no modo "Remover Objetos"
- When o usuario clica em multiplos objetos (ate 10) sem confirmar remocao individual
- Then cada objeto selecionado e destacado com overlay vermelho e adicionado a uma lista de "Objetos Selecionados" na sidebar
- And a sidebar exibe miniaturas dos objetos selecionados com botao "X" para desselecionar individualmente
- When o usuario clica "Remover Todos" na sidebar
- Then o sistema chama POST `/api/projects/:projectId/remove-object/batch` com array de mask_ids
- And exibe progresso unificado em tempo real
- And ao completar, todos os objetos sao removidos em uma unica operacao

### AC-8: Historico de Edicoes e Undo
- Given o usuario realizou uma ou mais edicoes (troca de material, iluminacao, remocao)
- When o usuario olha para o painel inferior do workspace
- Then ve uma timeline horizontal de versoes (thumbnails pequenos) mostrando cada edicao aplicada com icone indicando o tipo (material swap, lighting, object removal)
- And cada thumbnail mostra tooltip com detalhes: tipo de edicao, data/hora, descricao
- When o usuario clica em uma versao anterior na timeline
- Then a imagem principal atualiza para mostrar aquela versao
- And um botao "Reverter para esta versao" aparece
- When o usuario clica "Reverter"
- Then o sistema reverte para a versao selecionada e as edicoes subsequentes ficam marcadas como revertidas (mas nao excluidas) na timeline

### AC-9: Indicadores de Quota e Creditos
- Given o usuario esta no modo de edicao
- When qualquer operacao de edicao e iniciada
- Then o sistema verifica creditos de render restantes antes de processar
- And exibe na toolbar o contador: "Creditos restantes: X"
- And se creditos = 0, as ferramentas de edicao ficam desabilitadas com tooltip: "Seus creditos de render acabaram. Faca upgrade do plano para continuar editando."
- And um botao "Upgrade" direciona para a pagina de pricing

### AC-10: Responsividade e Layout Mobile
- Given o usuario acessa o modo de edicao em tela < 768px (mobile)
- When o modo de edicao ativa
- Then a toolbar de ferramentas move para a parte inferior da tela (bottom bar)
- And os paineis de materiais/iluminacao/remocao abrem como bottom sheets deslizantes
- And a timeline de versoes se torna scrollavel horizontalmente
- And gestos de pinch-to-zoom sao suportados na imagem para selecao precisa de elementos

## Technical Notes
- Integra com APIs existentes: Story 3.1 (segmentation), Story 3.2 (lighting), Story 3.3 (object removal)
- Coordenadas de click devem ser normalizadas (0-1 range) baseado nas dimensoes da imagem exibida vs dimensoes reais
- Overlay de mascaras: usar canvas overlay ou SVG sobre a imagem para renderizar poligonos de segmentacao
- Supabase Realtime para progresso: reutilizar pattern de subscription ja implementado em Story 1.4 e 2.2
- Labels em PT-BR para categorias de elementos: { wall: "Parede", floor: "Piso", countertop: "Bancada", cabinet: "Armario", ceiling: "Teto", window: "Janela", door: "Porta", furniture_large: "Movel Grande", furniture_small: "Movel Pequeno", decoration: "Decoracao", other: "Outro" }
- Material thumbnails: podem ser placeholders iniciais (cores solidas com label) — futuramente substituidos por imagens de texturas reais
- Pinch-to-zoom em mobile: usar biblioteca como `use-gesture` ou implementar com touch events nativos
- Reutilizar componentes existentes: ProgressBar (Story 1.4), VersionTimeline (Story 2.2), Toast notifications, Layout responsivo (Story 7.7)
- Estado de edicao gerenciado com Zustand store (pattern existente no projeto)

## Dependencies
- Story 3.1 (Segmentation API) — endpoints de segmentacao e material swap
- Story 3.2 (Lighting Correction API) — endpoint de enhance-lighting
- Story 3.3 (Object Removal API) — endpoints de remove-object
- Story 2.2 (Chat de Refinamento UI) — layout do workspace do projeto, toolbar de acoes
- Story 7.7 (Frontend Shell) — layout base, autenticacao UI, navegacao
- Story 1.4 (Staging UI) — componentes de progresso e feedback reutilizaveis
- Story 7.5 (Render Job Queue) — quota check e realtime progress

## Tasks
- [x] Task 1: Create EditingToolbar component with 3 tool buttons (Segment, Lighting, Remove) and edit mode state management in useReducer store
- [x] Task 2: Create ImageCanvas component with click coordinate normalization, overlay rendering (SVG for segmentation masks), and pinch-to-zoom for mobile
- [x] Task 3: Create SegmentOverlay component (integrated into ImageCanvas as SVG polygons with PT-BR labels)
- [x] Task 4: Create MaterialPicker panel component with suggested materials list (from API), custom material input field, and "Aplicar" action with loading state
- [x] Task 5: Create LightingPanel component with 3 mode cards (Auto/Natural/Warm), brightness score display bar, dark photo warning, and "Melhorar" action
- [x] Task 6: Create ObjectRemovalPanel component with click-to-select object preview (red overlay), confirm/cancel buttons, multi-select list sidebar, and "Remover Todos" batch action
- [x] Task 7: Create EditVersionTimeline component showing edit history as horizontal thumbnail strip with type icons, tooltips, click-to-preview, and revert functionality
- [x] Task 8: Create QuotaIndicator component showing remaining render credits, disabled state when credits = 0, and upgrade CTA
- [x] Task 9: Integrate all editing components into the project workspace page (`/app/projeto/:id`), connecting to the existing layout from Story 2.2
- [x] Task 10: Implement responsive layout for mobile (bottom bar toolbar, bottom sheet panels, horizontal scroll timeline, pinch-to-zoom)
- [x] Task 11: Connect all components to backend APIs (segmentation, lighting, object removal) with error handling, loading states, and Supabase Realtime progress subscriptions
- [x] Task 12: Write unit tests for editing components: coordinate normalization, overlay rendering, material selection, mode switching, quota checks, and version navigation

## Dev Agent Record
### Implementation Plan
- Created editing service layer with all API calls (segmentation, lighting, object removal, quota, edit history)
- Created useEditingProgress hook for Supabase Realtime subscriptions (reuses existing pattern)
- Created useEditingStore with useReducer for centralized editing state management
- Created Toast notification system (useToast hook + ToastContainer component)
- Built 8 editing UI components: EditingToolbar, ImageCanvas, MaterialPicker, LightingPanel, ObjectRemovalPanel, EditVersionTimeline, QuotaIndicator, ToastContainer
- Integrated all components into ProjectWorkspacePage with edit mode toggle
- Responsive layout: bottom bar toolbar, bottom sheet panels, horizontal scroll timeline, pinch-to-zoom on mobile
- Updated RenderViewer to support "Editar Elementos" action

### Debug Log
- Linter/hook auto-created `use-editing-store.ts` from inline state, renamed tool 'remove' to 'removal', used `EditingTool` type from store. Aligned all files accordingly.

### Change Log
- 2026-03-09: Implemented Story 3.4 — full editing UI with segmentation, lighting, and object removal

## Testing
- Test click-to-segment with various element types and verify correct overlay colors
- Test material swap flow end-to-end: select element -> pick material -> apply -> verify image update
- Test lighting enhancement flow: mode selection -> apply -> verify brightness improvement visual
- Test object removal flow: click object -> preview mask -> confirm -> verify clean result
- Test batch removal: select multiple objects -> batch remove -> verify single operation result
- Test version timeline: navigate versions, preview, revert
- Test quota indicator: verify disabled state at 0 credits, upgrade CTA visibility
- Test responsive layout on mobile breakpoints (< 768px)
- Test error states: API failures, network errors, quota exceeded
- Test coordinate normalization accuracy across different image sizes and viewport dimensions

## File List
### New Files
- `packages/web/src/services/editing-service.ts` — API calls for segmentation, lighting, object removal, quota, edit history, realtime
- `packages/web/src/hooks/use-editing-progress.ts` — Supabase Realtime progress subscription hook
- `packages/web/src/hooks/use-editing-store.ts` — useReducer-based editing state management
- `packages/web/src/hooks/use-toast.ts` — Toast notification state hook
- `packages/web/src/components/molecules/ToastContainer.tsx` — Toast notification UI
- `packages/web/src/components/molecules/EditingToolbar.tsx` — 3-tool editing toolbar with exit button
- `packages/web/src/components/molecules/ImageCanvas.tsx` — Click-to-segment canvas with SVG overlays, pinch-to-zoom
- `packages/web/src/components/molecules/MaterialPicker.tsx` — Material selection panel with suggested/custom materials
- `packages/web/src/components/molecules/LightingPanel.tsx` — Lighting enhancement panel with 3 modes
- `packages/web/src/components/molecules/ObjectRemovalPanel.tsx` — Object removal panel with multi-select
- `packages/web/src/components/molecules/EditVersionTimeline.tsx` — Horizontal edit history timeline
- `packages/web/src/components/molecules/QuotaIndicator.tsx` — Render credits counter with upgrade CTA
- `packages/web/src/__tests__/molecules/editing-toolbar.test.tsx` — EditingToolbar tests
- `packages/web/src/__tests__/molecules/image-canvas.test.tsx` — ImageCanvas + normalizeCoordinates tests
- `packages/web/src/__tests__/molecules/material-picker.test.tsx` — MaterialPicker tests
- `packages/web/src/__tests__/molecules/lighting-panel.test.tsx` — LightingPanel tests
- `packages/web/src/__tests__/molecules/object-removal-panel.test.tsx` — ObjectRemovalPanel tests
- `packages/web/src/__tests__/molecules/quota-indicator.test.tsx` — QuotaIndicator tests
- `packages/web/src/__tests__/molecules/toast-container.test.tsx` — ToastContainer tests
- `packages/web/src/__tests__/hooks/use-editing-store.test.ts` — useEditingStore tests
- `packages/web/src/__tests__/services/editing-service.test.ts` — editing-service API tests

### Modified Files
- `packages/web/src/components/molecules/RenderViewer.tsx` — Added onEditElements prop, enabled "Editar Elementos" button
- `packages/web/src/app/(dashboard)/projects/[id]/page.tsx` — Integrated full editing UI with edit mode toggle

## QA Results
