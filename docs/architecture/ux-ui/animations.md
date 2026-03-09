# Especificacao UX/UI — DecorAI Brasil
## 9. Microinteracoes e Feedback

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

### 9.1 Upload de Foto

- **Dragover:** Borda tracejada animada (pulse), fundo sutil de cor primaria
- **Uploading:** Progress bar linear, percentage textual
- **Success:** Checkmark animado, preview da foto
- **Error:** Shake do container, mensagem em vermelho

### 9.2 Geracao do Render

- **Loading:** Progress bar com etapas textuais ("Analisando foto...", "Aplicando estilo...", "Refinando detalhes...")
- **Preview progressivo:** Imagem aparecendo de borrado para nitido (via WebSocket)
- **Completo:** Transicao suave para o workspace

### 9.3 Chat de Refinamento

- **Enviando:** Indicador de digitacao (3 dots pulsando) na bolha da IA
- **Processando:** Overlay sutil no canvas + spinner
- **Resultado:** Canvas atualiza com fade-in, nova versao aparece no historico com animacao de slide

### 9.4 Slider Antes/Depois

- **Drag:** Handle segue o cursor/dedo com suavidade (requestAnimationFrame)
- **Snap:** Se solto perto de 50%, volta para o centro
- **Touch:** Suporta swipe em mobile

### 9.5 Segmentacao

- **Hover sobre elemento:** Contorno sutil aparece
- **Selecao:** Elemento fica destacado, resto da imagem com opacidade reduzida
- **Aplicacao:** Transicao suave do material antigo para o novo

### 9.6 Troca de Estilo

- **Selecao:** Card sobe com sombra, borda primaria
- **Gerando:** Skeleton da imagem + spinner no canvas
- **Resultado:** Crossfade entre estilos

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
