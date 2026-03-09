# Especificacao UX/UI — DecorAI Brasil
## 6. Design Tokens

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 6.1 Cores

```
Cores Primarias:
  --color-primary-50:   #EEF2FF   (fundo sutil)
  --color-primary-100:  #E0E7FF
  --color-primary-500:  #6366F1   (cor principal — indigo)
  --color-primary-600:  #4F46E5   (hover)
  --color-primary-700:  #4338CA   (active)

Cores Secundarias:
  --color-secondary-500: #EC4899  (pink — acentos, badges Pro)

Cores de Superficie:
  --color-surface-bg:      #FFFFFF
  --color-surface-subtle:  #F9FAFB
  --color-surface-muted:   #F3F4F6
  --color-surface-border:  #E5E7EB
  --color-surface-dark:    #111827  (texto primario)

Cores de Feedback:
  --color-success:  #10B981  (verde)
  --color-warning:  #F59E0B  (amarelo)
  --color-error:    #EF4444  (vermelho)
  --color-info:     #3B82F6  (azul)

Cores de Chat:
  --color-chat-user:  #6366F1  (fundo msg usuario)
  --color-chat-ai:    #F3F4F6  (fundo msg IA)

Cores de Tier:
  --color-tier-free:     #9CA3AF  (cinza)
  --color-tier-pro:      #6366F1  (indigo)
  --color-tier-business: #F59E0B  (dourado)
```

**Rationale:** Indigo transmite profissionalismo e tecnologia. Pink como secundaria traz calor e modernidade. Paleta neutra garante que as imagens geradas sejam o foco visual.

### 6.2 Tipografia

```
Familia:
  --font-family-sans:  'Inter', system-ui, -apple-system, sans-serif
  --font-family-mono:  'JetBrains Mono', 'Fira Code', monospace

Tamanhos:
  --font-size-xs:    0.75rem   (12px)
  --font-size-sm:    0.875rem  (14px)
  --font-size-base:  1rem      (16px)
  --font-size-lg:    1.125rem  (18px)
  --font-size-xl:    1.25rem   (20px)
  --font-size-2xl:   1.5rem    (24px)
  --font-size-3xl:   1.875rem  (30px)
  --font-size-4xl:   2.25rem   (36px)

Pesos:
  --font-weight-regular:  400
  --font-weight-medium:   500
  --font-weight-semibold: 600
  --font-weight-bold:     700

Line Heights:
  --line-height-tight:   1.25
  --line-height-normal:  1.5
  --line-height-relaxed: 1.75
```

**Rationale:** Inter e altamente legivel em telas, suporta caracteres PT-BR, e e gratis (Google Fonts). Monospace para croquis ASCII.

### 6.3 Espacamento

```
Base: 4px (0.25rem)

  --space-1:   0.25rem   (4px)
  --space-2:   0.5rem    (8px)
  --space-3:   0.75rem   (12px)
  --space-4:   1rem      (16px)
  --space-5:   1.25rem   (20px)
  --space-6:   1.5rem    (24px)
  --space-8:   2rem      (32px)
  --space-10:  2.5rem    (40px)
  --space-12:  3rem      (48px)
  --space-16:  4rem      (64px)
  --space-20:  5rem      (80px)
```

### 6.4 Border Radius

```
  --radius-sm:    4px
  --radius-md:    8px
  --radius-lg:    12px
  --radius-xl:    16px
  --radius-full:  9999px  (pills, avatares)
```

### 6.5 Sombras

```
  --shadow-sm:    0 1px 2px rgba(0,0,0,0.05)
  --shadow-md:    0 4px 6px rgba(0,0,0,0.07)
  --shadow-lg:    0 10px 15px rgba(0,0,0,0.10)
  --shadow-xl:    0 20px 25px rgba(0,0,0,0.10)
```

### 6.6 Breakpoints (ver secao 8)

```
  --breakpoint-sm:   640px   (mobile landscape)
  --breakpoint-md:   768px   (tablet)
  --breakpoint-lg:   1024px  (desktop)
  --breakpoint-xl:   1280px  (desktop largo)
  --breakpoint-2xl:  1536px  (ultra-wide)
```

### 6.7 Transicoes

```
  --transition-fast:    150ms ease
  --transition-normal:  250ms ease
  --transition-slow:    350ms ease
```

### 6.8 Z-Index

```
  --z-dropdown:   10
  --z-sticky:     20
  --z-modal:      30
  --z-tooltip:    40
  --z-toast:      50
```

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
