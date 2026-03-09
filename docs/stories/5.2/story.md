# Story 5.2 - Reverse Staging UI: Diagnostico Gratuito, Resultados de Analise AI e CTA Freemium

## Status: Done

## Story
As a corretor de imoveis ou proprietario visitando o site pela primeira vez, I want to access a free diagnostic tool where I upload a photo of my property listing, see an AI-powered analysis showing what value my property is losing due to lack of professional staging, and receive a clear call-to-action to upgrade to a paid plan so that I understand the benefit of staging and consider hiring the paid service.

## PRD Requirements
| Requirement | Description | Coverage |
|-------------|-------------|----------|
| FR-12 | O sistema deve oferecer uma ferramenta gratuita de diagnostico onde o usuario faz upload da foto do anuncio e a IA analisa mostrando o valor estimado que o imovel esta perdendo por falta de staging profissional | Full (upload page + analysis results display) |
| FR-13 | O diagnostico deve apresentar CTA (call-to-action) direcionando para plano pago | Full (dynamic CTA section based on score) |
| NFR-12 | A plataforma deve ser web responsiva (desktop + mobile browsers) | Full (responsive layout) |
| NFR-14 | Toda a interface deve ser em portugues brasileiro (PT-BR) | Full (all labels and messages) |
| NFR-17 | O sistema deve incluir disclaimer de imagem ilustrativa gerada por IA | Full (disclaimer on staged preview) |

## Acceptance Criteria

### AC-1: Pagina Publica de Diagnostico Gratuito
- Given um usuario (anonimo ou autenticado) acessa /diagnostico
- When a pagina carrega
- Then o sistema exibe uma landing section com titulo "Descubra quanto seu imovel esta perdendo", subtitulo explicando o servico gratuito, e uma area de upload de foto centralizada
- And a pagina e acessivel sem autenticacao (rota publica)
- And o layout e responsivo para desktop e mobile

### AC-2: Upload de Foto do Anuncio
- Given o usuario esta na pagina de diagnostico
- When o usuario arrasta uma imagem para a area de upload ou clica para selecionar arquivo (JPEG/PNG, max 10MB)
- Then o sistema exibe preview da imagem selecionada com opcao de trocar
- And ao confirmar, o sistema envia POST /api/diagnostics para criar o diagnostico, seguido de POST /api/diagnostics/:id/upload com a imagem
- And durante o upload, um indicador de progresso e exibido
- And se a imagem excede 10MB ou formato invalido, uma mensagem de erro em PT-BR e exibida: "Imagem deve ser JPEG ou PNG com ate 10MB"

### AC-3: Estado de Processamento (Loading)
- Given o upload foi concluido com sucesso
- When o sistema esta processando a analise AI
- Then uma animacao de loading e exibida com mensagem "Analisando seu imovel..." em PT-BR
- And a animacao sugere progresso (ex: barra ou spinner com etapas: "Analisando iluminacao...", "Avaliando composicao...", "Calculando potencial...")
- And o usuario nao pode enviar outra foto durante o processamento

### AC-4: Resultado da Analise - Score e Perda Estimada
- Given a analise AI foi concluida
- When o resultado e exibido via GET /api/diagnostics/:id
- Then o sistema mostra um card principal com: overall_score exibido como gauge/meter visual (0-100), estimated_loss_percent formatado como "Seu imovel pode estar perdendo ate X% do valor potencial", e a foto original lado a lado com staged_preview_url (se disponivel)
- And o score e colorido por faixa: 0-40 vermelho (critico), 41-70 amarelo (moderado), 71-100 verde (bom)
- And o disclaimer "Imagem ilustrativa gerada por IA" e exibido junto ao staged preview

### AC-5: Resultado da Analise - Issues Detalhadas
- Given o resultado da analise esta visivel
- When o usuario visualiza a secao de detalhes
- Then cada issue do array analysis.issues e exibida como um card com: icone por category (lighting, staging, composition, quality, clutter), severity como badge colorido (low=verde, medium=amarelo, high=vermelho), e description com texto descritivo em PT-BR
- And as issues sao ordenadas por severidade (high primeiro)

### AC-6: Resultado da Analise - Recomendacoes
- Given o resultado da analise esta visivel
- When o usuario visualiza a secao de recomendacoes
- Then cada item do array analysis.recommendations e exibido como lista com bullet points e icone de check
- And a secao tem titulo "O que fazer para melhorar" em PT-BR

### AC-7: CTA Dinamico para Plano Pago
- Given o resultado da analise esta visivel
- When o campo cta do response e renderizado
- Then o sistema exibe um card CTA prominente com: cta.message como titulo principal, botao primario "Ver Planos" que navega para /app/plano ou /pricing, e cta.plan_recommended como badge indicando o tier recomendado (Pro ou Business)
- And o card CTA tem estilo visual que escala com a urgencia: score < 40 = fundo vermelho/urgente com texto enfatico, score 40-70 = fundo amarelo/moderado, score > 70 = fundo verde/sutil
- And se o usuario ja esta autenticado com tier pago, o CTA muda para "Criar Projeto com Esta Foto" redirecionando para /app/novo com a imagem pre-carregada

### AC-8: Fluxo Anonimo para Autenticado
- Given um usuario anonimo completou o diagnostico
- When o usuario clica no CTA "Ver Planos" ou "Criar Conta"
- Then o sistema armazena o session_token do diagnostico em cookie
- And apos login/signup, o diagnostico e automaticamente vinculado ao perfil do usuario (via endpoint existente na Story 5.1)
- And o usuario e redirecionado de volta para o resultado do diagnostico ou para o dashboard

### AC-9: Compartilhamento do Resultado
- Given o resultado da analise esta visivel
- When o usuario clica no botao "Compartilhar Resultado"
- Then o sistema exibe opcoes de compartilhamento: copiar link do diagnostico, compartilhar via WhatsApp com texto pre-formatado incluindo o score
- And o link compartilhado redireciona para /diagnostico/:id com o resultado visivel

### AC-10: Responsividade Mobile
- Given um usuario acessa /diagnostico em dispositivo mobile (viewport < 768px)
- When a pagina renderiza
- Then o upload funciona via camera do celular (accept="image/*" com capture)
- And os cards de resultado empilham verticalmente
- And o gauge de score redimensiona para caber na tela
- And o CTA ocupa largura total com botao grande para facilitar toque

### AC-11: Estados de Erro
- Given o usuario esta interagindo com o diagnostico
- When ocorre um erro de rede, timeout, ou falha da API
- Then uma mensagem amigavel em PT-BR e exibida: "Nao foi possivel completar a analise. Tente novamente."
- And um botao "Tentar Novamente" permite reiniciar o processo
- And erros sao logados no console para debug

## Tasks
- [x] Task 1: Criar componente DiagnosticUpload em packages/web/src/components/molecules/DiagnosticUploader.tsx com area de drag-and-drop para upload de foto com preview, validacao de formato/tamanho, e indicador de progresso
- [x] Task 2: Estado de loading implementado diretamente na pagina com Loader2 spinner, barra de progresso e mensagens de etapa
- [x] Task 3: Criar componente ScoreGauge em packages/web/src/components/molecules/ScoreGauge.tsx com gauge visual semicircular para exibir overall_score (0-100) com cores por faixa
- [x] Task 4: Criar componente DiagnosticResult em packages/web/src/components/organisms/DiagnosticResult.tsx com layout principal de resultados incluindo score, perda estimada, foto original vs staged preview (BeforeAfterSlider), issues e recomendacoes
- [x] Task 5: Criar componente IssueList em packages/web/src/components/molecules/IssueList.tsx com issues agrupadas por categoria, badges de severidade, e recomendacoes
- [x] Task 6: Criar componente DiagnosticCta em packages/web/src/components/molecules/DiagnosticCta.tsx com card CTA dinamico com estilo visual baseado no score, botao de acao, e tier recomendado
- [x] Task 7: Criar hook useDiagnostic em packages/web/src/hooks/use-diagnostic.ts para gerenciar estado do fluxo de diagnostico (upload, processing, result), chamadas API, e polling
- [x] Task 8: Criar pagina /diagnostico em packages/web/src/app/diagnostico/page.tsx como rota publica com layout proprio, QueryProvider, e orquestracao do fluxo upload -> loading -> resultado
- [x] Task 9: Criar service diagnostics-service.ts em packages/web/src/services/ com chamadas API (create, upload, getResult) usando credentials: include para cookies
- [x] Task 10: Escrever testes unitarios para componentes (DiagnosticUploader, ScoreGauge, IssueList, DiagnosticCta, DiagnosticResult)
- [x] Task 11: Escrever teste de integracao para o fluxo completo: upload -> loading -> resultado -> CTA
- [x] Task 12: Validar que npm run lint, npm run typecheck e npm test passam sem erros

## Dependencies
- Story 5.1 (Reverse Staging Diagnostico API) -- endpoints POST /diagnostics, POST /diagnostics/:id/upload, GET /diagnostics/:id
- Story 7.7 (Frontend Shell) -- layout base, autenticacao UI, navegacao
- Story 6.1 (Auth Routes) -- fluxo de login/signup para vinculacao de diagnostico anonimo
- Story 6.4 (Dashboard UI) -- padrao de componentes UI e estilos existentes

## Technical Notes
- API endpoints ja implementados na Story 5.1: POST /diagnostics, POST /diagnostics/:id/upload, GET /diagnostics/:id
- Tipos TypeScript em packages/shared/src/types/diagnostic.ts: DiagnosticCta, DiagnosticResponse
- Fluxo de session_token via cookie ja implementado no backend (Story 5.1 AC-1 e AC-6)
- Reutilizar componentes de UI existentes: Button, Card, Modal do frontend shell (Story 7.7)
- Upload pattern similar ao usado na Story 1.4 (Staging UI) para consistencia
- OG metadata na pagina compartilhavel seguir padrao da Story 4.2 (share page)
- A rota /diagnostico e publica (sem requireAuth middleware)
- Considerar pre-fetch do resultado via SSR para pagina compartilhavel /diagnostico/:id

## Dev Agent Record
### Implementation Plan
Implemented core Story 5.2 functionality following existing codebase patterns (atomic design with molecules/organisms, TanStack Query via QueryProvider, PT-BR UI, public route pattern from /compartilhar/).

### Debug Log
- Fixed test for DiagnosticResult where '30%' appeared in both score section and CTA (used getAllByText)
- Fixed integration test for loading state by using delayed mock to observe transient state

### Change Log
- 2026-03-09: Full implementation of Story 5.2 by @dev

## Testing
- Testes unitarios: componentes com React Testing Library, mock das APIs
- Testes integracao: fluxo completo de upload ate resultado com MSW (Mock Service Worker)
- Testes de responsividade: verificar layout em viewports mobile (375px) e desktop (1280px)
- Testes de erro: simular falha de rede, timeout, imagem invalida
- Testes de acessibilidade: verificar aria-labels nos componentes interativos

## File List
- `packages/web/src/services/diagnostics-service.ts` (new)
- `packages/web/src/hooks/use-diagnostic.ts` (new)
- `packages/web/src/components/molecules/DiagnosticUploader.tsx` (new)
- `packages/web/src/components/molecules/ScoreGauge.tsx` (new)
- `packages/web/src/components/molecules/IssueList.tsx` (new)
- `packages/web/src/components/molecules/DiagnosticCta.tsx` (new)
- `packages/web/src/components/organisms/DiagnosticResult.tsx` (new)
- `packages/web/src/app/diagnostico/layout.tsx` (new)
- `packages/web/src/app/diagnostico/page.tsx` (new)
- `packages/web/src/__tests__/molecules/diagnostic-uploader.test.tsx` (new)
- `packages/web/src/__tests__/molecules/score-gauge.test.tsx` (new)
- `packages/web/src/__tests__/molecules/issue-list.test.tsx` (new)
- `packages/web/src/__tests__/molecules/diagnostic-cta.test.tsx` (new)
- `packages/web/src/__tests__/organisms/diagnostic-result.test.tsx` (new)
- `packages/web/src/__tests__/integration/diagnostic-page.test.tsx` (new)

## QA Results
