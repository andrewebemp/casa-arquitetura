# Especificacao UX/UI — DecorAI Brasil
## 8. Estrategia Responsiva

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 8.1 Abordagem

**Mobile-first** no CSS, com progressive enhancement para desktop.

**Rationale:** O publico primario (corretores) usa muito celular (fotografam imoveis e publicam em portais). A experiencia mobile deve ser de primeira classe.

**Ref:** NFR-12, Brief §Target Users (corretores com uso moderado a alto de mobile)

### 8.2 Breakpoints

| Breakpoint | Largura | Dispositivos | Abordagem |
|------------|---------|-------------|-----------|
| Base | 0-639px | Celulares (portrait) | Layout single column, chat como bottom sheet |
| sm | 640px+ | Celulares (landscape) | Ajustes de espacamento |
| md | 768px+ | Tablets | Grid de 2 colunas, sidebar aparece |
| lg | 1024px+ | Desktop | Layout completo, split canvas/chat |
| xl | 1280px+ | Desktop largo | Max-width containers, mais espaco |
| 2xl | 1536px+ | Ultra-wide | Canvas maior, painel de ferramentas expandido |

### 8.3 Comportamento por Breakpoint

#### Workspace do Projeto

| Componente | Mobile (< 768px) | Tablet (768px-1023px) | Desktop (1024px+) |
|-----------|-------------------|----------------------|-------------------|
| Canvas | Full width | Full width | Area esquerda (~65%) |
| Chat | Bottom sheet (deslizavel) | Painel lateral colapsavel | Painel direito fixo (360px) |
| Toolbar | Barra inferior fixa (icones only) | Barra horizontal (icones + texto curto) | Barra horizontal completa |
| Version History | Scroll horizontal abaixo do canvas | Scroll horizontal | Strip horizontal |
| Slider | Touch/swipe | Touch/swipe + mouse | Mouse drag |

#### Wizard de Novo Projeto

| Componente | Mobile | Desktop |
|-----------|--------|---------|
| Step indicator | Numeros minimos (1/5, 2/5...) | Stepper horizontal completo |
| Upload | Full width + botao camera | Drag & drop area + click |
| Style grid | 2 colunas | 5 colunas |
| Croqui | Scroll horizontal/vertical | Visualizacao completa |
| Formulario de medidas | Campos empilhados | Campos lado a lado |

#### Landing Page

| Componente | Mobile | Desktop |
|-----------|--------|---------|
| Hero | Stack vertical (texto > imagem) | Split 50/50 |
| Como funciona | Cards empilhados | 3 colunas |
| Estilos | Grid 2 colunas, scroll | Grid 5 colunas |
| Pricing | Cards empilhados, destaque Pro no topo | 3 colunas |
| Nav | Hamburger menu | Links horizontais |

#### Dashboard

| Componente | Mobile | Desktop |
|-----------|--------|---------|
| Project cards | 1 coluna, full width | Grid 3-4 colunas |
| Filtros | Modal/drawer | Barra horizontal |
| Tier status | Fixo no topo | Barra inferior da area de conteudo |

### 8.4 Imagens Responsivas

- Servir imagens em multiplas resolucoes via `srcset`
- Thumbnails: 200px (mobile), 400px (desktop)
- Canvas: resolucao maxima conforme plano (1024px Free, 2048px Pro/Business)
- Formato: WebP com fallback JPEG
- Lazy loading para galeria de estilos e dashboard

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
