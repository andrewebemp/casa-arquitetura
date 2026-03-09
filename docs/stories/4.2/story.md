# Story 4.2 - Before/After Slider UI, Modal de Compartilhamento e Pagina Publica de Share

## Status: Draft

## Story
As a corretor de imoveis ou arquiteto, I want an interactive before/after slider to visually compare the original photo with the AI-decorated version, share the result via a public link (WhatsApp, Instagram, email) with a modal that generates and manages share links, and have a public share page with proper OG metadata so recipients can see the slider without logging in — so that I can effectively present staging results to clients and increase property engagement.

## PRD Requirements
| Requirement | Description | Coverage |
|-------------|-------------|----------|
| FR-10 | Slider antes/depois para comparar ambiente original e decorado | Full (interactive drag slider component) |
| FR-11 | Slider antes/depois compartilhavel via link para redes sociais e WhatsApp | Full (share modal + public page) |
| FR-17 | Marca d'agua nas imagens do tier Free | Full (watermark indicator on share, clean for paid) |
| NFR-12 | Web responsiva desktop + mobile | Full (touch/swipe slider, responsive share page) |
| NFR-14 | Interface em PT-BR | Full (all labels) |
| NFR-17 | Disclaimer "imagem ilustrativa gerada por IA" | Full (disclaimer on public share page) |

## Acceptance Criteria

### AC-1: Before/After Slider Component
- Given o workspace do projeto esta aberto e o usuario clica no botao "Comparar" na toolbar
- When o slider e ativado
- Then a imagem original e a imagem decorada sao exibidas lado a lado com um divisor vertical arrastavel
- And o label "ANTES" aparece sobre a foto original (lado esquerdo) e "DEPOIS" sobre a foto decorada (lado direito)
- And o divisor (handle) pode ser arrastado horizontalmente com mouse (desktop) ou touch/swipe (mobile)
- And a posicao inicial do divisor e no centro (50%)
- And o slider usa as imagens da versao atualmente ativa no workspace (ou a mais recente)

### AC-2: Slider Interacao e Responsividade
- Given o slider esta ativo
- When o usuario arrasta o handle
- Then a divisao entre as imagens acompanha o handle suavemente (sem lag)
- And em mobile, o slider suporta gestos de toque e swipe
- And clicar fora do slider ou no botao "Fechar" volta para a visualizacao normal do canvas
- And o slider mantem o aspect ratio correto em qualquer viewport

### AC-3: Botao Compartilhar na Toolbar (Workspace)
- Given a toolbar do workspace esta visivel
- When o usuario clica no botao "Compartilhar"
- Then um modal de compartilhamento e aberto
- And se nenhum share link existe para a versao atual, o sistema cria um automaticamente via `POST /api/projects/:id/share`
- And se ja existe um share link ativo, o link existente e exibido

### AC-4: Modal de Compartilhamento
- Given o modal de compartilhamento esta aberto
- When o usuario visualiza o modal
- Then o modal exibe: preview do slider antes/depois (mini), o link de compartilhamento (ex: `decorai.com.br/s/abc123`), e botoes de acao
- And um botao "Copiar Link" copia o link para a area de transferencia com feedback visual ("Link copiado!")
- And botoes de compartilhamento rapido sao exibidos: [WhatsApp], [Instagram], [Email]
- And clicar em WhatsApp abre `https://wa.me/?text=Veja+a+transformacao...+{link}`
- And clicar em Email abre `mailto:?subject=...&body=...{link}`
- And para o tier Free, um aviso discreto informa que a imagem compartilhada tera marca d'agua
- And para tiers pagos, a imagem e limpa (sem marca d'agua)

### AC-5: Gerenciamento de Links Compartilhados
- Given o modal de compartilhamento esta aberto
- When o usuario clica em "Gerenciar links" (ou equivalente)
- Then a lista de share links ativos do projeto e exibida via `GET /api/projects/:id/shares`
- And cada link mostra: URL, versao associada, data de criacao, visualizacoes (view_count), e status (ativo/expirado)
- And o usuario pode deletar um link (com confirmacao) via `DELETE /api/projects/:id/shares/:shareId`
- And o usuario pode gerar um novo link para uma versao especifica

### AC-6: Pagina Publica de Compartilhamento (/compartilhar/:token)
- Given alguem acessa a URL publica de compartilhamento (ex: `/compartilhar/abc123`)
- When a pagina carrega
- Then a pagina exibe o slider antes/depois interativo com as imagens do share link (carregadas via `GET /api/share/:shareToken`)
- And o header exibe o logo DecorAI com link para a landing page
- And abaixo do slider: nome do projeto, estilo aplicado, e data de criacao
- And um CTA "Transforme seu imovel tambem — Comece Gratis" com link para `/login`
- And o disclaimer "Imagem ilustrativa gerada por IA" e exibido (NFR-17)
- And a pagina e server-side rendered (SSR) com meta tags OG para preview correto em WhatsApp, Facebook e Twitter

### AC-7: OG Meta Tags na Pagina Publica
- Given a URL publica e acessada por um crawler de redes sociais
- When o HTML e parseado
- Then as meta tags incluem: `og:title` (nome do projeto + "DecorAI Brasil"), `og:description` ("Veja a transformacao do ambiente com staging virtual"), `og:image` (URL da imagem renderizada), `og:url` (URL do share)
- And Twitter Card tags tambem estao presentes (`twitter:card=summary_large_image`)

### AC-8: Share Link Expirado ou Invalido
- Given a URL publica contem um token expirado ou invalido
- When a pagina carrega
- Then para token expirado (API retorna 410): exibe mensagem "Este link expirou. Solicite um novo link ao proprietario do projeto." com CTA para landing
- And para token invalido (API retorna 404): exibe mensagem "Link nao encontrado." com CTA para landing

### AC-9: Responsividade Mobile da Pagina Publica
- Given alguem acessa a pagina publica em dispositivo mobile
- When a pagina renderiza
- Then o slider ocupa a largura total da tela com suporte a touch/swipe
- And o CTA de cadastro e visivel sem scroll excessivo
- And a pagina carrega rapidamente (imagens otimizadas)

## Technical Notes

### Architecture References
- Wireframes: `docs/architecture/ux-ui/wireframes.md` — Section 4.4 (Slider Antes/Depois)
- User flows: `docs/architecture/ux-ui/user-flows.md` — Flow 6 (Compartilhamento)
- Component library: `docs/architecture/ux-ui/component-library.md` — Slider Control atom
- Information architecture: `docs/architecture/ux-ui/information-architecture.md` — /compartilhar/:id

### API Endpoints Consumed
- `GET /api/projects/:id/slider-data` — Before/after image URLs (Story 4.1)
- `POST /api/projects/:id/share` — Create share link (Story 4.1)
- `GET /api/projects/:id/shares` — List share links (Story 4.1)
- `DELETE /api/projects/:id/shares/:shareId` — Delete share link (Story 4.1)
- `GET /api/share/:shareToken` — Public share data (Story 4.1)

### State Management
- Slider state: `useState` for handle position (0-100%), drag state
- Share modal state: `useState` for open/close, share link data
- Public page: Server-side rendered via Next.js SSR (getServerSideProps or Server Components)
- Clipboard API for "Copiar Link" functionality

### Key Components
- `BeforeAfterSlider` — Interactive comparison slider with drag handle (desktop mouse + mobile touch)
- `ShareModal` — Modal with share link, copy button, social share buttons, link management
- `ShareLinkList` — List of active share links with stats and delete action
- `SocialShareButtons` — WhatsApp, Instagram (copy for stories), Email share buttons
- `PublicSharePage` — SSR page at `/compartilhar/:token` with slider, CTA, OG tags
- `ExpiredSharePage` — Error state for expired/invalid share tokens

### Existing Foundation
- Dashboard layout with protected routes (Story 7.7)
- Share link API endpoints (Story 4.1)
- Watermark service (Story 4.1)
- UI atoms: Button, Input, Badge (Story 7.7)
- Workspace toolbar placeholder for [Slider] and [Compartilhar] buttons (Story 2.2)

### Implementation Approach
- **Slider**: Pure CSS + JS approach using `clip-path` or dual-image overlay with `width` manipulation. No heavy library needed.
- **Touch support**: Use `onTouchStart`, `onTouchMove`, `onTouchEnd` alongside mouse events, or use `PointerEvents` for unified handling.
- **SSR for share page**: Use Next.js Server Components or `generateMetadata` for OG tags. The share page is public (no auth layout).
- **Clipboard**: Use `navigator.clipboard.writeText()` with fallback for older browsers.

## Tasks
- [ ] Task 1: Create share service functions (`services/share-service.ts`) — getSliderData, createShareLink, getShareLinks, deleteShareLink, getPublicShareData
- [ ] Task 2: Create `BeforeAfterSlider` component (`components/molecules/BeforeAfterSlider.tsx`) — dual-image overlay with draggable vertical divider, ANTES/DEPOIS labels, mouse + touch support, responsive aspect ratio
- [ ] Task 3: Create `SocialShareButtons` component (`components/molecules/SocialShareButtons.tsx`) — WhatsApp (wa.me link), Email (mailto), Copy Link (clipboard API with feedback toast)
- [ ] Task 4: Create `ShareLinkList` component (`components/molecules/ShareLinkList.tsx`) — list of share links with URL, view count, expiration, delete with confirmation
- [ ] Task 5: Create `ShareModal` component (`components/organisms/ShareModal.tsx`) — compose mini slider preview, share link display, SocialShareButtons, ShareLinkList, watermark tier warning
- [ ] Task 6: Integrate slider and share modal into workspace toolbar — enable [Comparar] button to activate slider overlay on canvas, enable [Compartilhar] button to open ShareModal (replacing "Em breve" placeholders from Story 2.2)
- [ ] Task 7: Create public share page (`app/compartilhar/[token]/page.tsx`) — SSR with `generateMetadata` for OG tags, BeforeAfterSlider, project info, CTA, disclaimer, error states (expired/invalid)
- [ ] Task 8: Create public share layout (`app/compartilhar/layout.tsx`) — public header with logo (no auth), footer with disclaimer
- [ ] Task 9: Write unit tests for BeforeAfterSlider (drag interaction, touch support, position state, label visibility)
- [ ] Task 10: Write unit tests for ShareModal (link generation, copy to clipboard, social buttons, link management)
- [ ] Task 11: Write unit tests for SocialShareButtons (WhatsApp URL format, email mailto format, clipboard feedback)
- [ ] Task 12: Write integration tests for workspace toolbar integration (slider activation, share modal opening)
- [ ] Task 13: Write integration tests for public share page (SSR rendering, OG meta tags, expired link, invalid link, CTA)
- [ ] Task 14: Run lint, typecheck, and all tests — fix any issues

## Dependencies
- Story 7.7 (Frontend Shell — layouts, auth, atoms) — Done
- Story 6.4 (Dashboard UI — React Query setup) — Done
- Story 4.1 (Before/After Slider API & Share API — all endpoints) — Done
- Story 2.2 (Project Workspace UI — toolbar with placeholder buttons) — Draft (toolbar integration will enable disabled buttons)
- Story 1.4 (Staging UI — project creation flow that produces renders) — Done

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log

## Testing
## File List
## QA Results
