# DecorAI Pipeline Architecture Reference

Arquitetura tecnica completa do pipeline de geracao de interiores decorados.
Referencia para os agentes staging-architect, pipeline-optimizer, e visual-quality-engineer.

---

## 1. Pipeline Diagram

```
                    +-----------------------+
                    |   USER INPUT          |
                    |   (foto / texto /     |
                    |    foto + texto)      |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   INPUT ROUTER        |
                    |   Classifica tipo:    |
                    |   photo | text | multi|
                    +-----------+-----------+
                                |
          +---------------------+---------------------+
          |                     |                     |
    +-----v------+     +-------v-------+     +-------v-------+
    | PHOTO PATH |     | TEXT PATH     |     | MULTI PATH    |
    | (foto)     |     | (descricao)   |     | (foto+texto)  |
    +-----+------+     +-------+-------+     +-------+-------+
          |                     |                     |
          v                     v                     v
+---------+----------+ +-------+--------+ +-----------+---------+
| STAGE 1: ANALYSIS  | | STAGE 1b: NLP  | | STAGE 1c: COMBINED  |
| Depth Anything V2  | | Claude API     | | Depth + NLP parsing |
| SAM 2 / OneFormer  | | Intent parsing | | Merge spatial +     |
| Edge detection     | | Style extract  | | textual context     |
+---------+----------+ +-------+--------+ +-----------+---------+
          |                     |                     |
          +---------------------+---------------------+
                                |
                    +-----------v-----------+
                    |   STAGE 2:            |
                    |   CONDITIONING        |
                    |                       |
                    |   - ControlNet Depth  |
                    |   - ControlNet Canny  |
                    |   - ControlNet Seg    |
                    |   - Prompt assembly   |
                    |   - Negative prompt   |
                    |   - Style tokens      |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   CACHE CHECK         |
                    |   L1: Exact match     |
                    |   L2: Semantic match  |
                    |   L3: Style template  |
                    |                       |
                    |   HIT? -> Skip to     |
                    |   Stage 5 (deliver)   |
                    +-----------+-----------+
                                |
                           MISS |
                                |
                    +-----------v-----------+
                    |   STAGE 3:            |
                    |   GENERATION          |
                    |                       |
                    |   SDXL + ControlNet   |
                    |   (ml6team/IDCN)      |
                    |                       |
                    |   GPU: A10G/A100      |
                    |   Steps: 25-35        |
                    |   CFG: 7-9.5          |
                    |   Scheduler: DPM++    |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   STAGE 4:            |
                    |   POST-PROCESSING     |
                    |                       |
                    |   4a. Quality Gate    |
                    |       - CLIP score    |
                    |       - FID check     |
                    |       - Artifact det  |
                    |                       |
                    |   4b. Enhancement     |
                    |       - Real-ESRGAN   |
                    |       - IC-Light (opt)|
                    |       - Color correct |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   STAGE 5:            |
                    |   DELIVERY            |
                    |                       |
                    |   - Upload to CDN     |
                    |   - Generate metadata |
                    |   - Cache store       |
                    |   - WebSocket notify  |
                    |   - Analytics event   |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   OUTPUT              |
                    |   Image URL + metadata|
                    |   via WebSocket       |
                    +-----------------------+
```

---

## 2. Stage-by-Stage Description

### Stage 1: Input Analysis

**Objetivo:** Extrair informacoes espaciais e contextuais do input do usuario.

| Sub-stage | Modelo | Input | Output | GPU |
|-----------|--------|-------|--------|-----|
| Depth estimation | Depth Anything V2 (Large) | Foto do ambiente | Depth map (grayscale) | T4 |
| Segmentacao semantica | OneFormer ADE20K | Foto do ambiente | Seg map (150 classes) | T4 |
| Segmentacao de instancia | SAM 2 | Foto + prompts | Instance masks | T4 |
| Edge detection | Canny (OpenCV) | Foto do ambiente | Edge map (binary) | CPU |
| Dimensao estimation | ZoeDepth (opcional) | Foto do ambiente | Metric depth (metros) | T4 |
| NLP parsing | Claude API | Texto do usuario | Intent + style + params | Cloud |

**Outputs combinados para Stage 2:**
- `depth_map`: Mapa de profundidade normalizado (0-1)
- `seg_map`: Mapa semantico com classes de interiores
- `edge_map`: Mapa de bordas binarizado
- `instance_masks`: Mascaras individuais por objeto
- `spatial_context`: Dimensoes estimadas, layout, tipo de comodo
- `user_intent`: Estilo, instrucoes especificas, restricoes

### Stage 2: Conditioning

**Objetivo:** Preparar todos os inputs de conditioning para o modelo generativo.

| Operacao | Descricao | Recurso |
|----------|-----------|---------|
| ControlNet Depth prep | Normalizar depth map para range esperado pelo ControlNet | CPU |
| ControlNet Canny prep | Aplicar threshold no edge map (low=50, high=150) | CPU |
| ControlNet Seg prep | Remapear classes ADE20K para cores do conditioning | CPU |
| Prompt assembly | Montar prompt positivo (estilo + qualidade + tokens especificos) | CPU |
| Negative prompt | Montar negative prompt (anti-estilo + qualidade negativa) | CPU |
| Style tokens | Selecionar tokens do brazilian-styles-kb.md | CPU |
| Weight calibration | Ajustar pesos de cada ControlNet conforme estilo | CPU |
| IP-Adapter prep | Se referencia visual fornecida, extrair style embedding | A10G |

**Output:** Pacote de conditioning pronto para geracao.

### Stage 3: Generation

**Objetivo:** Gerar a imagem de interior decorado via diffusion model.

| Parametro | Valor padrao | Range |
|-----------|-------------|-------|
| Modelo base | SDXL 1.0 | - |
| ControlNet | ml6team/IDCN | ControlNet 1.1 como fallback |
| Scheduler | DPM++ 2M Karras | Euler a como alternativa |
| Steps | 30 | 20-40 (trade-off velocidade/qualidade) |
| CFG Scale | 7.5 | 6.5-10 (por estilo, ver KB) |
| Denoising strength | 0.60 | 0.45-0.80 (por estilo) |
| Resolucao base | 1024x768 | 768x1024 para ambientes verticais |
| ControlNet Canny weight | 0.75 | 0.60-1.00 |
| ControlNet Depth weight | 0.65 | 0.50-0.90 |
| ControlNet Seg weight | 0.50 | 0.40-0.80 |
| Seed | Aleatorio | Fixo para reproducibilidade |
| Batch size | 1 | 2-4 para opcoes de escolha |

**Provider routing (por tier):**
- Free: RunPod Spot (A10G) -- custo minimo, tolerante a interrupcao
- Pro: Modal (A10G) -- controle + custo otimizado
- Enterprise: fal.ai (A100) -- latencia minima, SLA

### Stage 4: Post-Processing

**Objetivo:** Validar qualidade e melhorar imagem gerada.

#### 4a. Quality Gate (automatico)

| Metrica | Threshold | Acao se falhar |
|---------|-----------|----------------|
| CLIP score (prompt alignment) | >= 0.85 | Re-gerar com seed diferente |
| FID (fidelidade visual) | < 150 | Re-gerar com CFG ajustado |
| Artifact detection | Nenhum critical | Re-gerar regiao com inpainting |
| Resolucao | >= especificada pelo tier | Upscale antes de entregar |
| Aspect ratio | Consistente com input | Crop/pad se necessario |

#### 4b. Enhancement

| Operacao | Modelo | Quando | GPU |
|----------|--------|--------|-----|
| Upscale 2x | Real-ESRGAN | Tier Pro (1024->2048) | T4 |
| Upscale 4x | Real-ESRGAN | Tier Enterprise (1024->4096) | A10G |
| Relighting | IC-Light | Quando iluminacao insuficiente | A10G |
| Color correction | Algoritmo proprio | Sempre (normalize WB) | CPU |
| Compression | WebP/AVIF | Sempre (otimizar delivery) | CPU |

### Stage 5: Delivery

**Objetivo:** Entregar resultado ao usuario e armazenar dados.

| Operacao | Destino | Latencia |
|----------|---------|----------|
| Upload imagem | S3/R2 + CDN (Cloudflare) | <500ms |
| Gerar thumbnail | CPU processing | <200ms |
| Gerar metadata | JSON (estilo, params, scores) | <100ms |
| Cache store | Redis (L1) + Vector DB (L2) | <300ms |
| WebSocket notify | Cliente (browser) | <100ms |
| Analytics event | PostHog/Mixpanel | Async |
| Billing event | Decrementar creditos/renders | <100ms |

---

## 3. Latency Budget

**Target total: < 15s para Tier Pro (p95)**

| Stage | Latencia target | % do total | Acumulado |
|-------|----------------|-----------|-----------|
| Stage 1: Analysis | 3.0s | 20% | 3.0s |
| Stage 2: Conditioning | 1.0s | 7% | 4.0s |
| Cache check | 0.2s | 1% | 4.2s |
| Stage 3: Generation | 8.0s | 53% | 12.2s |
| Stage 4: Post-processing | 2.0s | 13% | 14.2s |
| Stage 5: Delivery | 0.8s | 6% | 15.0s |
| **Total** | **15.0s** | **100%** | - |

**Nota:** Stage 3 (Generation) consome 53% do budget. Principal lever de otimizacao:
- Reduzir steps (30 -> 20 com LCM scheduler)
- Resolver em resolucao menor + upscale (768 -> gen -> 2x upscale)
- Pre-warming de GPU (eliminar cold start)

---

## 4. Cost Breakdown per Render

### Cenario otimizado (producao)

| Stage | Provider | GPU | Duracao | Custo | % Total |
|-------|----------|-----|---------|-------|---------|
| Analysis | Modal | T4 | 3.0s | R$ 0.03 | 4% |
| Conditioning | Modal | CPU | 1.0s | R$ 0.005 | 1% |
| Generation | Modal | A10G | 8.0s | R$ 0.35 | 50% |
| Post-processing | Modal | T4 | 2.0s | R$ 0.08 | 11% |
| Delivery | Cloud | - | 0.8s | R$ 0.02 | 3% |
| LLM (Claude) | Anthropic | - | - | R$ 0.05 | 7% |
| Infra overhead | - | - | - | R$ 0.04 | 6% |
| Cache amortizado | - | - | - | -R$ 0.12 | -17% |
| **Total (com cache 25%)** | - | - | - | **R$ 0.70** | **100%** |

### Cenario sem cache (worst case)

| Total sem cache | R$ 0.82 |
| Total sem cache + cold start | R$ 1.20 |
| Total premium pipeline (A100 + SUPIR upscale) | R$ 2.00 |

---

## 5. Cache Strategy (3 Layers)

### Layer 1: Exact Match Cache

| Atributo | Valor |
|----------|-------|
| Storage | Redis (in-memory) |
| Key | `hash(input_image_hash + style_id + all_params)` |
| TTL | 24 horas |
| Hit rate estimado | 10-15% |
| Latencia | <5ms |
| Invalidacao | Mudanca de parametros invalida entry |
| Custo | R$ 50/mes (Redis instance) |

### Layer 2: Semantic Match Cache

| Atributo | Valor |
|----------|-------|
| Storage | Redis + Qdrant (vector DB) |
| Key | `embedding_similarity(input) > 0.95 AND same_style` |
| TTL | 7 dias |
| Hit rate estimado | 15-25% |
| Latencia | <50ms (vector search) |
| Invalidacao | Mudanca de modelo invalida tudo |
| Custo | R$ 200/mes (Qdrant + Redis) |

### Layer 3: Style Template Cache

| Atributo | Valor |
|----------|-------|
| Storage | S3/R2 + CDN |
| Key | `room_type + style + size_category` |
| TTL | 30 dias |
| Hit rate estimado | 5-10% |
| Latencia | <100ms (CDN) |
| Invalidacao | Mudanca de estilo config invalida L3 do estilo |
| Custo | R$ 30/mes (S3 storage) |

### Impacto combinado do cache

| Metrica | Sem cache | Com cache (L1+L2+L3) |
|---------|-----------|---------------------|
| Hit rate | 0% | 25-40% |
| Custo medio/render | R$ 0.82 | R$ 0.55-0.65 |
| Latencia de cache hit | N/A | <100ms |
| Reducao de custo mensal | 0% | 25-40% |

---

## 6. GPU Provider Comparison Matrix

| Criterio | fal.ai | Replicate | Modal | RunPod (Spot) |
|----------|--------|-----------|-------|---------------|
| **Tipo** | Serverless | Serverless | Serverless containers | GPU dedicada |
| **Custo A10G/h** | R$ 3.80 | R$ 5.00 | R$ 3.00 | R$ 1.20 (spot) |
| **Cold start** | 3-8s | 5-15s | 5-10s | 0s (dedicada) |
| **Controle** | Baixo | Baixo | Alto | Alto |
| **Autoscaling** | Auto | Auto | Configuravel | Manual |
| **Modelos custom** | Limitado | Via Cog | Qualquer | Qualquer |
| **Melhor para** | Burst/fallback | Prototipagem | Producao | Baseline barato |
| **Tier recomendado** | Enterprise | Dev/QA | Pro (primary) | Free |

### Estrategia hibrida de producao

```
[Request Queue (BullMQ/Redis)]
        |
        v
[GPU Router]
        |
        +-- Tier Free ---------> RunPod Spot A10G (custo minimo)
        |                        Fallback: Modal A10G
        |
        +-- Tier Pro ----------> Modal A10G (controle + custo)
        |                        Fallback: fal.ai A10G
        |
        +-- Tier Enterprise ---> fal.ai A100 (latencia minima)
        |                        Fallback: Modal A100
        |
        +-- Queue depth > 10 --> Burst para fal.ai (qualquer GPU disponivel)
```

---

## 7. Async Queue Design

### Arquitetura

```
[Client]
    |
    | HTTP POST /api/render
    v
[API Server (Next.js)]
    |
    | 1. Validate input
    | 2. Authorize (check credits/tier)
    | 3. Enqueue job with priority
    v
[BullMQ Queue (Redis)]
    |
    | Priority: P1(Enterprise) > P2(Pro) > P3(Free)
    v
[Worker Pool]
    |
    | Process stages 1-5
    | Report progress via Redis pub/sub
    v
[WebSocket Server]
    |
    | Push progress events to client
    v
[Client UI]
    - Queued (position: N)
    - Processing: depth (20%)
    - Processing: generating (50%)
    - Processing: generating (preview available)
    - Processing: upscaling (80%)
    - Complete (image_url, metadata)
```

### Priority tiers

| Priority | Tier | Max queue time | Max processing time | SLA |
|----------|------|---------------|--------------------|----|
| P1 | Enterprise | 5s | 15s | 99.5% < 20s |
| P2 | Pro | 30s | 15s | 95% < 45s |
| P3 | Free | 120s | 25s | Best effort |

### Retry e fallback

| Cenario | Acao | Max retries |
|---------|------|-------------|
| GPU provider timeout (30s) | Retry com provider alternativo | 2 |
| Spot instance preempted | Requeue automatico (on-demand) | 1 |
| Quality gate fail | Re-gerar com seed diferente | 3 |
| OOM (out of memory) | Reduzir resolucao e re-tentar | 1 |
| Rate limit | Exponential backoff | 5 |

---

*DecorAI Brasil -- Pipeline Architecture Reference v1.0*
