# DecorAI Brasil Squad

**AI Interior Design & Virtual Staging para o Mercado Imobiliario Brasileiro**

Squad de 8 agentes especializados baseados em mind clones de 12 elite minds reais, projetado para construir e operar a plataforma DecorAI Brasil.

---

## Quick Start

```bash
# Ativar o orchestrator
/decorai:agents:decorai-chief

# Ou ativar agent especifico
/decorai:agents:staging-architect
/decorai:agents:spatial-analyst
```

---

## Agents

| Tier | Agent | Mind Clone | Foco |
|------|-------|------------|------|
| **Orchestrator** | `decorai-chief` | Composite | Triage, routing, coordenacao |
| **Tier 0** | `spatial-analyst` | Fei-Fei Li + Saining Xie | Interpretacao espacial, croqui, dimensoes |
| **Tier 1** | `staging-architect` | Lvmin Zhang + Junming Chen | Pipeline SDXL+ControlNet, staging AI |
| **Tier 1** | `interior-strategist` | Gilberto Rangel + Miriam Gurgel | Estilos BR, materiais, metodologia MEPI |
| **Tier 2** | `conversational-designer` | Robert J. Moore + Erika Hall | Chat visual, refinamento NL, NCF patterns |
| **Tier 2** | `proptech-growth` | Pete Flint + Mike DelPrete | Growth, funil, pricing, network effects |
| **Tier 3** | `visual-quality-engineer` | Ben Mildenhall + Shuzhe Wang | Qualidade visual, 3D, NeRF, DUSt3R |
| **Tools** | `pipeline-optimizer` | Composite GPU expert | GPU routing, custo, cache, infra |

---

## Cobertura do PRD

| Epic | Agents Responsaveis | FRs |
|------|-------------------|-----|
| Epic 1 - Geracao e Staging | spatial-analyst, staging-architect, interior-strategist | FR-01 a FR-03, FR-24 a FR-32 |
| Epic 2 - Chat Refinamento | conversational-designer, staging-architect | FR-04 a FR-06, FR-27, FR-28 |
| Epic 3 - Edicao e Personalizacao | staging-architect, visual-quality-engineer | FR-07 a FR-09 |
| Epic 4 - Compartilhamento | decorai-chief | FR-10, FR-11 |
| Epic 5 - Reverse Staging | proptech-growth | FR-12, FR-13 |
| Epic 6 - Auth e Billing | proptech-growth | FR-14 a FR-18 |
| Epic 7 - Pipeline IA | staging-architect, pipeline-optimizer, visual-quality-engineer | FR-19 a FR-23 |

---

## Pipeline de Staging

```
User Input (foto/texto/medidas)
       |
       v
  spatial-analyst (Tier 0)
  - Interpreta dimensoes
  - Gera croqui ASCII
  - Valida consistencia
       |
       v  (croqui aprovado)
  staging-architect (Tier 1)
  - Recebe specs do spatial-analyst
  - Consulta interior-strategist (estilo)
  - Executa pipeline SDXL+ControlNet
  - Gera render fotorrealista
       |
       v  (render gerado)
  conversational-designer (Tier 2)
  - Chat de refinamento
  - "Troca o piso", "mais aconchegante"
  - Loop iterativo ilimitado
       |
       v  (refinamento aplicado)
  visual-quality-engineer (Tier 3)
  - Valida qualidade (FID, SSIM, LPIPS)
  - Upscale para HD (2048x2048)
  - Benchmark automatico
       |
       v
  Output Final
```

---

## Ferramentas Integradas

### Geracao
- FLUX.2 (fal.ai), SDXL + ControlNet, ControlNet Interior Design (ml6team)

### Segmentacao
- SAM 2, OneFormer ADE20K, Grounded-SAM-2

### Depth
- Depth Anything V2, ZoeDepth, Marigold

### Enhancement
- Real-ESRGAN, LaMa/Inpaint-Anything, IC-Light

### Estilo
- CLIP, IP-Adapter

### LLM
- Claude API (Anthropic)

### GPU Platforms
- fal.ai, Replicate, Modal.com

### Pagamentos BR
- Stripe, Asaas

---

## Tasks (34 tasks)

| Agent | Tasks | Qty |
|-------|-------|-----|
| @spatial-analyst | analyze-photo, parse-dimensions, generate-croqui, validate-spatial-consistency, estimate-room-dimensions | 5 |
| @staging-architect | generate-staging, apply-style, segment-element, remove-object, enhance-lighting, upscale-render | 6 |
| @interior-strategist | create-style-guide, generate-style-prompt, recommend-materials, analyze-brazilian-trends | 4 |
| @conversational-designer | interpret-refinement, manage-version-history, resolve-ambiguity, validate-specification-compliance | 4 |
| @proptech-growth | design-reverse-staging-funnel, create-pricing-strategy, analyze-market-metrics, plan-portal-integration | 4 |
| @visual-quality-engineer | run-quality-benchmark, diagnose-artifacts, configure-depth-pipeline, validate-render-quality | 4 |
| @pipeline-optimizer | analyze-cost-per-render, configure-cache-strategy, benchmark-gpu-providers, design-async-pipeline | 4 |
| @decorai-chief | triage-request, coordinate-staging-pipeline, generate-project-report | 3 |

---

## Workflows (4 workflows)

| Workflow | Fases | Descricao |
|----------|-------|-----------|
| `wf-staging-pipeline.yaml` | 6 | Pipeline principal: Spatial → Croqui → Estilo → Render → Quality → Delivery |
| `wf-refinement-loop.yaml` | 5 | Loop iterativo: Interpret → Map → Execute → Validate → Present (max 10x) |
| `wf-reverse-staging.yaml` | 5 | Funil freemium: Receive → Analyze → Diagnostic → Preview → CTA |
| `wf-element-swap.yaml` | 5 | Troca de elemento: Identify → Segment → Specify → Generate → Quality |

---

## Templates (6 templates)

| Template | Agent | Descricao |
|----------|-------|-----------|
| `tmpl-render-report.yaml` | @staging-architect | Relatorio completo do render gerado |
| `tmpl-spatial-analysis.yaml` | @spatial-analyst | Analise espacial com croqui ASCII |
| `tmpl-quality-dashboard.md` | @visual-quality-engineer | Dashboard de metricas de qualidade |
| `tmpl-style-guide.yaml` | @interior-strategist | Guia de estilo com prompts ControlNet |
| `tmpl-pricing-analysis.md` | @proptech-growth | Analise de pricing com unit economics |
| `tmpl-reverse-staging-diagnostic.md` | @proptech-growth | Diagnostico reverse staging com CTA |

---

## Checklists (5 checklists)

| Checklist | QG | Level | Descricao |
|-----------|----|-------|-----------|
| `render-quality-gate.md` | QG-DA-003 | blocking | Valida qualidade do render (FID, SSIM, LPIPS) |
| `spatial-analysis-validation.md` | QG-DA-002 | blocking | Valida croqui e dimensoes antes da geracao |
| `pipeline-performance-audit.md` | - | recommended | Auditoria de custo, latencia e cache |
| `style-fidelity-check.md` | - | blocking | Verifica aderencia ao estilo selecionado |
| `squad-integration-check.md` | - | blocking | Valida integracao completa do squad |

---

## Data (5 knowledge bases)

| Arquivo | Descricao |
|---------|-----------|
| `brazilian-styles-kb.md` | 10 estilos BR com paletas hex, materiais, prompts ControlNet |
| `tool-registry.yaml` | 22 ferramentas em 8 categorias |
| `pricing-guide.md` | 3 tiers, unit economics, comparativo competidores |
| `pipeline-architecture.md` | Diagrama pipeline, budget de latencia, custo |
| `decision-tree.md` | Arvores de decisao: routing, estilo, qualidade, pricing |

---

## Docs (2 documentos)

| Documento | Descricao |
|-----------|-----------|
| `mind-clone-validation.md` | Validacao dos 12 elite minds pesquisados |
| `creation-report.md` | Relatorio de criacao do squad |

---

## Documentos de Referencia

- [Project Brief](../../docs/project-brief.md)
- [PRD v1.2](../../docs/prd.md)
- [Tools Research](../../docs/research/decorai-tools-research.md)

---

## Metricas do Squad

- **66 arquivos** totais
- **19.348 linhas** de definicao total
- **8 agents** (12 elite minds clonados)
- **34 tasks** (Task Anatomy, 8 campos obrigatorios)
- **4 workflows** (21 fases, checkpoints, veto conditions)
- **6 templates** (outputs estruturados)
- **5 checklists** (quality gates blocking/recommended)
- **5 data files** (knowledge bases do dominio)
- **2 docs** (validacao e relatorio)
- **32 FRs** cobertos | **7 Epics** mapeados
- **4 quality gates** definidos
- **Modo:** YOLO (60-75% fidelidade)

---

*Criado por Squad Architect — Clone minds > create bots.*
