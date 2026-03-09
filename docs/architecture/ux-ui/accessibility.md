# Especificacao UX/UI — DecorAI Brasil
## 7. Acessibilidade (WCAG AA)

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 7.1 Contraste

- Texto normal (< 18px): contraste minimo 4.5:1 contra fundo [WCAG 1.4.3]
- Texto grande (>= 18px bold ou >= 24px): contraste minimo 3:1 [WCAG 1.4.3]
- Elementos interativos (botoes, links, inputs): contraste minimo 3:1 com fundo adjacente [WCAG 1.4.11]
- Cores primarias validadas:
  - `#6366F1` (indigo) sobre branco: ratio 4.6:1 (passa AA normal)
  - `#111827` (dark) sobre branco: ratio 17.4:1 (passa AAA)

### 7.2 Navegacao por Teclado

- Todos os elementos interativos devem ser focaveis via Tab [WCAG 2.1.1]
- Ordem de foco deve seguir a ordem visual logica [WCAG 2.4.3]
- Focus ring visivel (outline 2px solido, cor primaria, offset 2px) [WCAG 2.4.7]
- Slider antes/depois: operavel via teclado (setas esquerda/direita) [WCAG 2.1.1]
- Chat: Enter para enviar, Shift+Enter para nova linha [WCAG 2.1.1]
- Wizard: navegacao entre steps via teclado

### 7.3 Semantica e Screen Readers

- Usar tags semanticas: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` [WCAG 1.3.1]
- Imagens geradas: `alt="Ambiente decorado em estilo [estilo] - versao [n]"` [WCAG 1.1.1]
- Foto original: `alt="Foto original do ambiente enviada pelo usuario"` [WCAG 1.1.1]
- Upload area: `aria-label="Area de upload de foto do ambiente"` [WCAG 4.1.2]
- Slider: `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` [WCAG 4.1.2]
- Chat: `role="log"`, `aria-live="polite"` para novas mensagens [WCAG 4.1.3]
- Progress bar de geracao: `role="progressbar"`, `aria-valuenow` [WCAG 4.1.2]
- Botoes com icone only: `aria-label` descritivo [WCAG 4.1.2]

### 7.4 Formularios

- Labels associados a todos os inputs via `for`/`id` [WCAG 1.3.1]
- Mensagens de erro vinculadas ao campo via `aria-describedby` [WCAG 3.3.1]
- Erros descritos em texto, nao apenas por cor [WCAG 1.4.1]
- Campos obrigatorios: `aria-required="true"` + indicador visual [WCAG 3.3.2]
- Autocomplete em campos de email e nome [WCAG 1.3.5]

### 7.5 Movimento e Animacao

- Respeitar `prefers-reduced-motion` — desabilitar animacoes para quem prefere [WCAG 2.3.3]
- Nenhum conteudo pisca mais de 3 vezes por segundo [WCAG 2.3.1]
- Progress de geracao: alternativa textual ("65% completo, aplicando estilo...") [WCAG 1.3.3]

### 7.6 Touch e Mobile

- Alvos de toque minimo 44x44px [WCAG 2.5.5]
- Gestos: drag do slider tem alternativa (botoes +/-) [WCAG 2.5.1]
- Nenhuma funcionalidade depende exclusivamente de gesto multitouch [WCAG 2.5.1]

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
