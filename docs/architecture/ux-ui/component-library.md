# Especificacao UX/UI — DecorAI Brasil
## 5. Design System (Atomic Design)

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 5.1 Atoms

#### Botoes

| Variante | Uso | Estilo |
|----------|-----|--------|
| Primary | Acao principal (CTA) | Background solido, cor primaria, texto branco, border-radius 8px |
| Secondary | Acao secundaria | Borda solida, fundo transparente, texto cor primaria |
| Ghost | Acoes terciarias | Sem borda, sem fundo, texto com hover underline |
| Danger | Acoes destrutivas | Background vermelho, texto branco |
| Icon Button | Acoes compactas | Apenas icone, tooltip no hover |

Tamanhos: `sm` (32px height), `md` (40px height), `lg` (48px height)

**Ref:** NFR-12 (responsivo — toque minimo 44px em mobile)

#### Inputs

| Tipo | Uso |
|------|-----|
| Text Input | Campos de texto simples (email, nome) |
| Number Input | Campos numericos com unidade (metros, centimetros) |
| Textarea | Descricao de ambiente, chat |
| File Upload | Upload de fotos (drag & drop + click) |
| Select | Selecao de estilo, tipo de ambiente |
| Slider Control | Slider antes/depois |

Estados: `default`, `focus`, `error`, `disabled`, `loading`

#### Icones

- Set: Lucide Icons (MIT license, consistente, leve)
- Tamanhos: 16px, 20px, 24px
- Icones customizados: estilos de decoracao (10 icones tematicos)

#### Badges

| Variante | Uso |
|----------|-----|
| Status | Indicar estado (gerando, pronto, erro) |
| Tier | Indicar plano (Free, Pro, Business) |
| Count | Contador de versoes, renders restantes |

#### Imagens e Thumbnails

| Tipo | Tamanho | Uso |
|------|---------|-----|
| Thumbnail grid | 200x200 | Dashboard de projetos |
| Preview | 400x400 | Selecao de estilo, historico |
| Canvas | Responsivo | Workspace principal |
| Avatar | 32x32, 40x40 | Perfil do usuario |

### 5.2 Molecules

#### Upload Card

```
┌─────────────────────────────────────┐
│                                     │
│     [icone upload / camera]         │
│                                     │
│  Arraste a foto aqui ou clique      │
│  JPEG/PNG, ate 20MB                 │
│                                     │
│  [Ou tire uma foto] (mobile only)   │
│                                     │
└─────────────────────────────────────┘
```

- Estados: empty, dragover (borda tracejada animada), uploading (progress), uploaded (preview), error
- **Ref:** FR-01

#### Item Reference Card

```
┌──────────────────────────────────────┐
│  [thumbnail]  Sofa de couro         │
│               2.20m x 0.90m         │
│               Posicao: Parede Sul    │
│               [Editar] [Remover]     │
└──────────────────────────────────────┘
```

- Para especificacao de itens com medidas e foto de referencia
- **Ref:** FR-25

#### Chat Message

```
┌──────────────────────────────────────┐
│  [Avatar IA]                        │
│  Seu ambiente industrial esta        │
│  pronto! O que gostaria de ajustar? │
│                              14:32   │
└──────────────────────────────────────┘

                ┌──────────────────────┐
                │  Tira o tapete e     │
                │  muda o piso para    │
                │  madeira clara       │
                │              14:33   │
                └──────────────────────┘
```

- IA: alinhado a esquerda, com avatar e fundo sutil
- Usuario: alinhado a direita, fundo cor primaria
- **Ref:** FR-04, FR-06

#### Style Card

```
┌──────────────────┐
│                  │
│  [foto exemplo]  │
│                  │
│  Industrial      │
│  ○ (nao selecionado)
└──────────────────┘
```

- Estado selecionado: borda cor primaria + checkmark
- Hover: sombra elevada
- **Ref:** FR-02

#### Version Thumbnail

```
┌────────┐
│ v3     │
│ [mini] │
│ 14:35  │
└────────┘
```

- Ativo: borda colorida
- Click: restaura versao
- **Ref:** FR-27

#### Pricing Card

```
┌══════════════════════════════╗
║  PRO                        ║
║  Mais Popular               ║
║                             ║
║  R$ 79-149/mes              ║
║                             ║
║  ✓ Renders ilimitados       ║
║  ✓ Sem marca d'agua         ║
║  ✓ Chat de refinamento      ║
║  ✓ Todos os estilos         ║
║  ✓ Exportar HD              ║
║                             ║
║  [Assinar Agora]            ║
╚══════════════════════════════╝
```

- Plano destacado: borda dupla + badge "Mais Popular"
- **Ref:** FR-16

### 5.3 Organisms

#### Header (Logado)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]   Projetos    [+ Novo Projeto]     [Badge Tier] [Avatar ▼] │
└─────────────────────────────────────────────────────────────────┘
```

- Logo: clicavel, volta para dashboard
- Novo Projeto: botao primary sempre visivel
- Badge Tier: indica plano atual (Free/Pro/Business)
- Avatar: dropdown com Perfil, Plano, Sair

#### Header (Publico)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]      Como Funciona   Estilos   Precos      [Login]     │
└─────────────────────────────────────────────────────────────────┘
```

#### Toolbar do Workspace

```
┌─────────────────────────────────────────────────────────────────┐
│  [Slider On/Off] │ [Segmentar] │ [Iluminar] │ [Remover Objeto] │
│  [Estilo ▼ Industrial] │ [Compartilhar] │ [Download ▼]         │
└─────────────────────────────────────────────────────────────────┘
```

- Botoes com icone + texto em desktop; apenas icone em mobile
- Tooltip em hover
- Download: dropdown com opcoes de resolucao e formato
- **Ref:** FR-03, FR-07, FR-08, FR-09, FR-10, FR-11

#### Chat Panel

```
┌────────────────────────────┐
│  Chat de Refinamento       │
│  ─────────────────────     │
│                            │
│  [Mensagens scrollaveis]   │
│                            │
│  ─────────────────────     │
│  ┌────────────────────┐    │
│  │ Digite aqui...     │    │
│  └────────────────────┘    │
│  [Enviar]                  │
│                            │
│  Versao 5 de 5             │
│  [← Anterior] [Proxima →] │
└────────────────────────────┘
```

- Resizable: usuario pode expandir/recolher o painel
- Em mobile: modal fullscreen
- **Ref:** FR-04, FR-05, FR-06, FR-27

#### Version History Strip

```
┌──────────────────────────────────────────────────────────────┐
│  ◄  [v1] [v2] [v3] [v4] [v5●]  ►                           │
└──────────────────────────────────────────────────────────────┘
```

- Scroll horizontal
- Versao ativa: indicador visual
- Click: restaura versao no canvas
- **Ref:** FR-27

#### Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]                                                         │
│  DecorAI Brasil                                                 │
│                                                                 │
│  Produto       Legal          Contato                           │
│  Estilos       Termos         contato@decorai.com.br            │
│  Precos        Privacidade    WhatsApp                          │
│  Blog          LGPD                                             │
│                                                                 │
│  © 2026 DecorAI Brasil. Todas as imagens geradas por IA sao    │
│  ilustrativas. [NFR-17: disclaimer obrigatorio]                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Templates (Layouts)

#### Template 1 — Pagina Publica (Landing, Login, Diagnostico)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header Publico]                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Conteudo — full width, max-width 1200px, centralizado]        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  [Footer]                                                       │
└─────────────────────────────────────────────────────────────────┘
```

#### Template 2 — App (Dashboard, Perfil, Billing)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header Logado]                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Conteudo — max-width 1200px, padding lateral]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Sem footer na area logada. Navegacao simplificada via header.

#### Template 3 — Workspace (Editor de Projeto)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header Logado - compacto]                                     │
├─────────────────────────────────────────┬───────────────────────┤
│                                         │                       │
│  [Canvas Principal]                     │  [Chat Panel]         │
│  (ocupa toda a area disponivel)         │  (largura fixa 360px) │
│                                         │  (colapsavel)         │
│                                         │                       │
├─────────────────────────────────────────┤                       │
│  [Toolbar]                              │                       │
├─────────────────────────────────────────┤                       │
│  [Version History Strip]                │                       │
└─────────────────────────────────────────┴───────────────────────┘
```

Layout split: canvas a esquerda, chat a direita.
Em mobile: canvas full width + chat como bottom sheet.

#### Template 4 — Wizard (Novo Projeto)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Header Logado]                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ● Step 1  ○ Step 2  ○ Step 3  ○ Step 4  ○ Step 5              │
│  ───────────────────────────────────────────────────────        │
│                                                                 │
│  [Conteudo do Step Atual — max-width 800px, centralizado]       │
│                                                                 │
│  [← Voltar]                              [Proximo →]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Pages (Composicoes Finais)

Cada pagina e uma composicao de Template + Organisms + Molecules + Atoms:

| Pagina | Template | Organismos Chave | Rastreabilidade |
|--------|----------|------------------|-----------------|
| Landing Page | Template 1 | Header Publico, Footer, Pricing Cards, Style Cards | FR-02, FR-12, FR-13, FR-16 |
| Login/Cadastro | Template 1 | Header Publico, Login Form | FR-14, NFR-08 |
| Diagnostico (Reverse Staging) | Template 1 | Header Publico, Upload Card, Diagnostico Result | FR-12, FR-13 |
| Dashboard de Projetos | Template 2 | Header Logado, Project Cards, Tier Badge | FR-15, FR-16 |
| Novo Projeto (Wizard) | Template 4 | Upload Card, Style Cards, Item Reference Cards, Croqui | FR-01, FR-02, FR-24-FR-32 |
| Workspace do Projeto | Template 3 | Canvas, Chat Panel, Toolbar, Version History, Slider | FR-03-FR-11, FR-27, FR-28 |
| Perfil | Template 2 | Header Logado, Form Fields | FR-15 |
| Billing | Template 2 | Header Logado, Pricing Cards, Payment Form | FR-16, FR-17, FR-18 |
| Compartilhamento (publico) | Template 1 | Slider Antes/Depois, CTA Cadastro | FR-10, FR-11 |

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
