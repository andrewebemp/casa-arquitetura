# Especificacao UX/UI — DecorAI Brasil
## 10-14. Performance, Estados, LGPD, Rastreabilidade e Squad

> Shard do documento principal [`../ux-ui-spec.md`](../ux-ui-spec.md) | [Indice](index.md)

---

## 10. Estados de Erro e Vazios

### 10.1 Estados Vazios

| Tela | Mensagem | CTA |
|------|----------|-----|
| Dashboard (sem projetos) | "Ainda nao tem projetos. Que tal decorar seu primeiro ambiente?" | [Criar Primeiro Projeto] |
| Favoritos (vazio) | "Nenhum projeto favoritado ainda. Favorite projetos para acessar rapidamente." | — |
| Historico de versoes (v1) | "Esta e a primeira versao. Use o chat para refinar!" | Focus no campo de chat |

### 10.2 Estados de Erro

| Erro | Mensagem | Acao |
|------|----------|------|
| Upload falhou | "Nao foi possivel enviar a foto. Verifique o formato (JPEG/PNG) e tamanho (ate 20MB)." | [Tentar Novamente] |
| Geracao falhou | "Ocorreu um erro na geracao. Seu credito nao foi consumido." | [Tentar Novamente] |
| Chat sem resposta | "A IA esta temporariamente indisponivel. Tente novamente em instantes." | [Reenviar] |
| Limite de renders | "Voce atingiu o limite de 3 renders do plano Free." | [Fazer Upgrade] |
| Pagamento falhou | "Nao foi possivel processar o pagamento. Verifique os dados do cartao." | [Tentar Novamente] |
| Sessao expirada | "Sua sessao expirou. Faca login novamente." | [Login] |

### 10.3 Notificacoes (Toast)

- **Sucesso:** Verde, icone checkmark, auto-dismiss em 5s
- **Erro:** Vermelho, icone X, persistente (dismiss manual)
- **Info:** Azul, icone info, auto-dismiss em 5s
- **Warning:** Amarelo, icone alerta, auto-dismiss em 8s
- Posicao: topo-direita (desktop), topo-centro (mobile)

---

## 11. Consentimento e LGPD [NFR-08, NFR-09]

### 11.1 Primeiro Acesso (Cadastro)

- Checkbox obrigatorio: "Li e concordo com os Termos de Uso e a Politica de Privacidade"
- Checkbox opcional: "Autorizo o uso das minhas imagens para melhoria do servico (treinamento de IA)"
- Link para Politica de Privacidade e Termos de Uso
- **Ref:** NFR-08, NFR-09

### 11.2 Cookie Banner

```
┌─────────────────────────────────────────────────────────────────┐
│  Usamos cookies para melhorar sua experiencia.                  │
│  [Aceitar Todos] [Configurar] [Apenas Essenciais]               │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 Disclaimer de IA [NFR-17]

- Toda imagem gerada exibe footer: "Imagem ilustrativa gerada por IA — DecorAI Brasil"
- Na exportacao/download: marca d'agua com disclaimer
- Na pagina de compartilhamento: disclaimer visivel

---

## 12. Matriz de Rastreabilidade UX <- PRD

| Req. PRD | Elemento UX | Wireframe/Secao |
|----------|-------------|-----------------|
| FR-01 | Upload Card, Wizard Step 2 (Foto) | §4.2 |
| FR-02 | Style Cards, Wizard Step 3 | §4.2 |
| FR-03 | Dropdown Estilo na Toolbar | §4.3 |
| FR-04 | Chat Panel | §4.3 |
| FR-05 | Chat Panel (resposta < 15s) | §4.3, §9.3 |
| FR-06 | Chat Panel (PT-BR) | §4.3 |
| FR-07 | Toolbar > Segmentar | §4.3, §3.5 |
| FR-08 | Toolbar > Iluminar | §4.3 |
| FR-09 | Toolbar > Remover | §4.3 |
| FR-10 | Slider Antes/Depois | §4.4 |
| FR-11 | Modal Compartilhar + Pagina Publica | §3.6, §4.3 |
| FR-12 | Pagina Diagnostico | §4.7, §3.4 |
| FR-13 | CTA no Diagnostico | §4.7, §3.4 |
| FR-14 | Pagina Login/Cadastro | §4.6 |
| FR-15 | Dashboard + Perfil | §4.5 |
| FR-16 | Pricing Cards + Billing | §4.1, §5.2 |
| FR-17 | Marca d'agua, Disclaimer | §11.3 |
| FR-18 | Billing Page (Asaas/Pagar.me/Stripe) | §2.1 |
| FR-19 | Tela de Loading com WebSocket | §4.2 (Step 5) |
| FR-20 | Download com resolucao HD | §4.3 (Toolbar) |
| FR-24 | Wizard Step 2 (Descricao Textual) | §4.2 |
| FR-25 | Item Reference Cards | §4.2, §5.2 |
| FR-26 | Wizard Step 1 (Combinado) | §4.2 |
| FR-27 | Version History Strip + Chat | §4.3, §5.3 |
| FR-28 | Chat respeitando specs | §9.3 |
| FR-29 | Wizard Step 4 (Croqui) | §4.2 |
| FR-30 | Croqui iteravel (3 turnos) | §4.2, §3.1 |
| FR-31 | Botao Aprovar no Croqui | §4.2 |
| FR-32 | Interpretacao de foto para croqui | §3.1, §3.3 |
| NFR-01 | Progress bar < 30s | §4.2 (Step 5) |
| NFR-02 | Chat response < 15s | §9.3 |
| NFR-03 | Time-to-value < 3 min | §3.1 |
| NFR-08 | LGPD checkboxes | §11.1 |
| NFR-09 | Opt-in treinamento | §11.1 |
| NFR-12 | Responsivo | §8 |
| NFR-13 | Browser support | §8 |
| NFR-14 | Toda UI em PT-BR | Todas as telas |
| NFR-16 | WebSocket progress | §4.2 (Step 5), §9.2 |
| NFR-17 | Disclaimer IA | §11.3, §5.3 (Footer) |

---

## 13. Checklist de Qualidade

- [x] Todas as telas rastreaveis para requisitos do PRD (§12)
- [x] User flows cobrem todas as jornadas principais (§3)
- [x] Design system segue metodologia Atomic Design (§5)
- [x] Acessibilidade considerada — WCAG AA minimo (§7)
- [x] Estrategia responsiva definida com breakpoints (§8)
- [x] Design tokens documentados (§6)
- [x] Estados de erro e vazios cobertos (§10)
- [x] Consentimento LGPD especificado (§11)
- [x] Microinteracoes e feedback definidos (§9)
- [x] Croqui de confirmacao integrado ao flow (§4.2 Step 4, §3.1, §3.3)

---

## 14. Mapeamento Squad DecorAI — Agentes x Telas/Fluxos

Esta secao conecta cada agente do squad DecorAI aos elementos UX que ele suporta durante o desenvolvimento e operacao da plataforma.

### 14.1 Visao Geral do Pipeline

```
[Input do Usuario] → spatial-analyst → staging-architect → conversational-designer → visual-quality-engineer → [Output Final]
                                              ↑                       ↑
                                    interior-strategist        pipeline-optimizer
                                        (estilos)              (infra/cache)
```

### 14.2 Mapeamento Agente → Telas UX

| Agente | Tier | Telas/Componentes UX Impactados | Fluxos (§3) |
|--------|------|--------------------------------|-------------|
| **decorai-chief** | Orchestrator | Todas — orquestra handoffs entre agentes | Todos os fluxos |
| **spatial-analyst** | Tier 0 | Wizard Step 2 (upload/descricao), Step 4 (Croqui ASCII) | Flow 1 (§3.1), Flow 3 (§3.3) |
| **staging-architect** | Tier 1 | Wizard Step 5 (Geracao), Workspace Canvas, Toolbar (Segmentar, Iluminar, Remover) | Flow 1 (§3.1), Flow 5 (§3.5) |
| **interior-strategist** | Tier 1 | Wizard Step 3 (Selecao de Estilo), Style Cards, Dropdown Estilo na Toolbar | Flow 1 (§3.1) |
| **conversational-designer** | Tier 2 | Chat Panel, Version History Strip, Chat Messages | Flow 2 (§3.2) |
| **proptech-growth** | Tier 2 | Landing Page (Pricing Cards), Diagnostico (Reverse Staging), Billing Page | Flow 4 (§3.4) |
| **visual-quality-engineer** | Tier 3 | Workspace Canvas (validacao de qualidade), Download (resolucao HD) | Todos os fluxos de geracao |
| **pipeline-optimizer** | Tools | Wizard Step 5 (Loading/Progress Bar), WebSocket feedback | Flow 1 (§3.1) — performance |

### 14.3 Mapeamento Agente → Requisitos Funcionais

| Agente | FRs Cobertos | Ref. Wireframes |
|--------|-------------|-----------------|
| spatial-analyst | FR-24, FR-25, FR-26, FR-29, FR-30, FR-31, FR-32 | §4.2 (Steps 2, 4) |
| staging-architect | FR-01, FR-02, FR-03, FR-07, FR-08, FR-09, FR-20, FR-21, FR-22, FR-23 | §4.2 (Step 5), §4.3 |
| interior-strategist | FR-02 | §4.2 (Step 3), §4.3 (Toolbar) |
| conversational-designer | FR-04, FR-05, FR-06, FR-27, FR-28 | §4.3 (Chat Panel), §5.3 |
| proptech-growth | FR-12, FR-13, FR-16 | §4.1, §4.7 |
| visual-quality-engineer | FR-20 | §4.3 (Download) |
| pipeline-optimizer | NFR-01, NFR-02, NFR-04, NFR-05, NFR-06, NFR-07 | §4.2 (Step 5), §9.2 |

### 14.4 Quality Gates no Fluxo UX

| QG | Transicao UX | Agente Responsavel | Tipo |
|----|-------------|-------------------|------|
| QG-DA-001 | Wizard Step 1 → Step 2 | spatial-analyst | Routing (tipo de input) |
| QG-DA-002 | Wizard Step 4 → Step 5 | spatial-analyst | Blocking (croqui aprovado) |
| QG-DA-003 | Step 5 → Workspace | visual-quality-engineer | Blocking (qualidade minima) |
| QG-DA-004 | Chat → Re-render | conversational-designer | Non-blocking (mapeamento) |

### 14.5 Uso Durante Desenvolvimento

| Fase de Desenvolvimento | Agentes a Consultar | Objetivo |
|------------------------|-------------------|----------|
| Implementacao do Wizard (Epic 1) | spatial-analyst, interior-strategist | Validar logica de input, estilos brasileiros, croqui ASCII |
| Implementacao do Chat (Epic 2) | conversational-designer | Padroes NCF, interpretacao PT-BR, spec fidelity |
| Edicao granular (Epic 3) | staging-architect | Pipeline SAM + ControlNet, segmentacao |
| Reverse Staging (Epic 5) | proptech-growth | Funil de conversao, metricas de growth |
| Billing (Epic 6) | proptech-growth | Pricing strategy, unit economics |
| Pipeline AI (Epic 7) | staging-architect, pipeline-optimizer, visual-quality-engineer | Latencia, custo, qualidade |

---

*-- Uma (@ux-design-expert), UX/UI Designer -- Synkra AIOS*
