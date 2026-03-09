# DecorAI Pricing Strategy Knowledge Base

Guia completo de precificacao para a plataforma DecorAI Brasil.
Baseado nos frameworks de Pete Flint (NFX Network Effects) e Mike DelPrete (Evidence-Based PropTech Analysis).

---

## 1. Modelo de Tiers

### Tier 1: Explorador (Free)

| Atributo | Valor |
|----------|-------|
| Preco | R$ 0 |
| Renders/mes | 3 |
| Estilos disponiveis | 1 (Moderno) |
| Resolucao maxima | 512x512 |
| Marca d'agua | Sim (logo DecorAI) |
| Download HD | Nao |
| Refinamentos por render | 1 |
| Suporte | Comunidade (FAQ + forum) |
| API | Nao |
| Proposito estrategico | Volume, data network effects, viralidade organica |

### Tier 2: Profissional (R$ 89/mes)

| Atributo | Valor |
|----------|-------|
| Preco | R$ 89/mes (anual) / R$ 119/mes (mensal) |
| Renders/mes | 50 |
| Estilos disponiveis | Todos (10) |
| Resolucao maxima | 1024x1024 |
| Marca d'agua | Nao |
| Download HD | Sim |
| Refinamentos por render | Ilimitado |
| Suporte | Prioritario (chat + email, SLA 4h) |
| API | Nao |
| Proposito estrategico | Receita core, monetizacao do corretor individual |

### Tier 3: Imobiliaria (R$ 299-2.999/mes)

| Atributo | Valor |
|----------|-------|
| Preco base | R$ 299/mes (ate 5 usuarios) |
| Preco medio | R$ 899/mes (ate 20 usuarios) |
| Preco premium | R$ 2.999/mes (ilimitado + customizacao) |
| Renders/mes | Ilimitado |
| Estilos disponiveis | Todos + estilos customizados |
| Resolucao maxima | Ate 2048x2048 |
| Marca d'agua | White-label (logo da imobiliaria) |
| Download HD | Sim (bulk export) |
| Refinamentos por render | Ilimitado |
| Suporte | Dedicado + SLA 99.5% |
| API | Sim (REST + WebSocket) |
| Analytics | Dashboard avancado |
| Onboarding | Dedicado (CSM atribuido) |
| Proposito estrategico | Receita premium, protocol network effects, integracao com portais |

---

## 2. Unit Economics por Tier

### Tier Explorador (Free)

| Metrica | Valor | Nota |
|---------|-------|------|
| Custo medio/render | R$ 0.80 | Pipeline sem upscale, GPU mais barata |
| Renders/usuario/mes | ~2.1 (media) | 70% usam todos os 3 |
| Custo/usuario/mes | R$ 1.68 | 2.1 renders x R$ 0.80 |
| Receita/usuario/mes | R$ 0 | Free tier |
| Margem | -100% (investimento) | Custo subsidiado por data network effects |
| Valor estrategico | Dado de preferencia + marca d'agua como marketing | Cada render gera: estilo, regiao, tipo_imovel |

### Tier Profissional (R$ 89/mes)

| Metrica | Valor | Nota |
|---------|-------|------|
| ARPU | R$ 89/mes | Plano anual |
| Custo medio/render | R$ 1.20 | Pipeline completo com upscale |
| Renders/usuario/mes | ~28 (media) | 56% de utilizacao |
| Custo/usuario/mes | R$ 33.60 | 28 x R$ 1.20 |
| Margem bruta | 62% | (89 - 33.60) / 89 |
| CAC target | R$ 100 | Portfolio effect + referral |
| LTV (18 meses, 5% churn) | R$ 1.068 | 89 x 12 meses medio |
| LTV:CAC | 10.7:1 | Excelente (benchmark: >3:1) |
| Payback | 1.1 meses | 100 / 89 |

### Tier Imobiliaria (R$ 899/mes medio)

| Metrica | Valor | Nota |
|---------|-------|------|
| ARPU | R$ 899/mes | Tier medio (20 usuarios) |
| Custo medio/render | R$ 0.90 | Economia de escala + cache hit alto |
| Renders/equipe/mes | ~350 (media) | ~17.5 por usuario |
| Custo/cliente/mes | R$ 315 | 350 x R$ 0.90 |
| Margem bruta | 65% | (899 - 315) / 899 |
| CAC target | R$ 2.000 | Venda consultiva (sales cycle 30-60 dias) |
| LTV (24 meses, 3% churn) | R$ 14.384 | 899 x 16 meses medio |
| LTV:CAC | 7.2:1 | Saudavel |
| Payback | 2.2 meses | 2000 / 899 |

---

## 3. Break-Even Analysis

### Custo fixo mensal estimado (pos-MVP)

| Item | Custo/mes |
|------|-----------|
| Infraestrutura GPU (baseline) | R$ 5.000 |
| Armazenamento (S3/R2 + CDN) | R$ 800 |
| APIs (Claude, embeddings) | R$ 1.200 |
| Dominio + SSL + DNS | R$ 50 |
| Monitoramento (Sentry, Grafana) | R$ 300 |
| **Total fixo** | **R$ 7.350** |

### Break-even por cenario

| Cenario | Usuarios Pro | Usuarios Enterprise | Receita/mes | Custo variavel | Custo fixo | Lucro/mes |
|---------|-------------|-------------------|------------|----------------|-----------|-----------|
| Minimo viavel | 100 | 2 | R$ 10.698 | R$ 3.990 | R$ 7.350 | -R$ 642 |
| Break-even | 120 | 3 | R$ 13.377 | R$ 4.920 | R$ 7.350 | R$ 1.107 |
| Meta 6 meses | 300 | 10 | R$ 35.690 | R$ 12.060 | R$ 7.350 | R$ 16.280 |
| Meta 12 meses | 800 | 30 | R$ 98.170 | R$ 33.360 | R$ 12.000 | R$ 52.810 |

**Break-even point: ~120 usuarios Pro + 3 Enterprise** (~5 meses pos-lancamento)

---

## 4. Analise Competitiva de Pricing

### Competidores Internacionais

| Plataforma | Free | Pro | Enterprise | Foco |
|-----------|------|-----|-----------|------|
| **Virtual Staging AI** | Nao | $29/foto | Custom | Per-photo, sem subscription |
| **Staging Diva** | Nao | $39/foto | Custom | Premium, alta qualidade |
| **Apply Design** | 1 foto | $19/mes (3 fotos) | $99/mes | Subscription, baixo volume |
| **REimagineHome** | 3/mes | $29/mes | Custom | Subscription, mercado US |
| **DecorAI (nos)** | 3/mes | R$89/mes (~$17) | R$299-2999/mes | Subscription, foco BR |

### Posicionamento de Preco

- DecorAI e **50-65% mais barato** que competidores US (por render)
- Preco calibrado para **poder aquisitivo brasileiro** (R$ 89 = ~2 cafes/dia)
- Competidores internacionais nao tem: estilos BR, materiais BR, pagamento Pix/boleto
- **Diferencial:** subscription com volume generoso vs pay-per-photo

### Competidores Brasileiros (Diretos)

| Plataforma | Status | Modelo | Ameaca |
|-----------|--------|--------|--------|
| Home staging fisico | Ativo | R$ 5.000-30.000/imovel | Diferente (fisico vs digital) |
| Fotografos imobiliarios | Ativo | R$ 200-500/sessao | Complementar, nao competidor |
| Portais (ZAP, QuintoAndar) | Potencial | Feature interna | Alta (longo prazo) |
| Startups AI BR | Nascente | Ainda nao mapeadas | Media (first mover advantage) |

---

## 5. Willingness-to-Pay (WTP) no Brasil

### Dados de mercado imobiliario BR

| Segmento | Populacao | Ticket medio mensal em tools | WTP estimado para staging AI |
|----------|-----------|---------------------------|---------------------------|
| Corretores autonomos | ~400.000 | R$ 50-150 | R$ 49-99 |
| Corretores de imobiliaria | ~50.000 | R$ 100-300 (pago pela empresa) | R$ 89-149 |
| Imobiliarias pequenas (5-20 corretores) | ~15.000 | R$ 500-2.000 em tech | R$ 299-899 |
| Imobiliarias medias (20-100 corretores) | ~3.000 | R$ 2.000-8.000 em tech | R$ 899-2.999 |
| Incorporadoras | ~1.500 | R$ 5.000-50.000 em marketing | R$ 2.999+ |

### Benchmarks de SaaS PropTech BR

| Metrica | Benchmark | Fonte |
|---------|-----------|-------|
| Ticket medio SaaS imobiliario | R$ 80-200/mes | Mercado BR 2025 |
| Churn mensal | 5-8% | Benchmark SaaS B2B BR |
| Free-to-paid conversion | 3-8% em 30 dias | Freemium SaaS BR |
| Payback period aceitavel | < 6 meses | VCs BR (Serie A) |
| LTV:CAC minimo | 3:1 | Padrao SaaS |

### Sensibilidade de Preco

| Preco mensal (Pro) | Conversao estimada | Receita estimada (1000 free users) |
|-------------------|-------------------|------------------------------------|
| R$ 49 | 8-10% | R$ 3.920-4.900 |
| R$ 89 | 5-7% | R$ 4.450-6.230 |
| R$ 119 | 3-5% | R$ 3.570-5.950 |
| R$ 149 | 2-3% | R$ 2.980-4.470 |

**Sweet spot:** R$ 89/mes maximiza receita esperada por cohort.

---

## 6. Network Effects e Pricing

### Framework NFX aplicado ao pricing (Pete Flint)

**Principio:** O tier gratuito nao e custo — e investimento em data network effects.

| Network Effect | Como o pricing alimenta | Score |
|---------------|------------------------|-------|
| **Data NE** | Free users geram dados de preferencia (estilo x regiao x preco x tipo) | 8/10 |
| **Marketplace NE** | Marca d'agua em renders free = marketing gratuito entre corretores | 7/10 |
| **Protocol NE** | Enterprise com API permite portais integrarem DecorAI como padrao | 9/10 |

### Growth loops por tier

**Loop 1 (Free):** Render com marca d'agua -> Corretor compartilha no portal -> Comprador ve -> Procura DecorAI -> Novo usuario free -> Mais dados

**Loop 2 (Pro):** Render HD sem marca -> Corretor usa em anuncio -> Imovel vende mais rapido -> Corretor recomenda para colegas -> Mais Pro users

**Loop 3 (Enterprise):** API integrada no portal -> Todos os anuncios tem staging -> Compradores esperam staging -> Mais portais integram -> Protocol NE

### Moat progression

```
Fase 1 (0-6 meses):  Data NE via free users -> Modelos melhores para BR
Fase 2 (6-18 meses): Marketplace NE via Pro users -> Corretores recomendam
Fase 3 (18+ meses):  Protocol NE via Enterprise -> Portais integram como padrao
```

---

## 7. Estrategia de Lancamento

### Pricing de lancamento (primeiros 90 dias)

| Acao | Detalhe |
|------|---------|
| Free tier | Lancamento com 5 renders/mes (temporario, depois volta a 3) |
| Pro tier | R$ 69/mes nos primeiros 90 dias (depois R$ 89) |
| Enterprise | Beta fechado, 5 imobiliarias selecionadas, preco negociado |
| Referral | Pro user que indica = +10 renders/mes para ambos |

### Metricas de sucesso por fase

| Fase | Periodo | Meta principal | KPI |
|------|---------|---------------|-----|
| Lancamento | Dia 1-30 | 500 free signups | Signups/dia |
| Ativacao | Dia 30-60 | 60% geram 1+ render | Activation rate |
| Conversao | Dia 60-90 | 5% convertem para Pro | Free-to-paid rate |
| Retencao | Dia 90-180 | Churn < 6%/mes | Monthly churn |
| Escala | Dia 180+ | 300 Pro + 10 Enterprise | MRR |

---

*DecorAI Brasil -- Pricing Strategy Knowledge Base v1.0*
*Frameworks: NFX (Pete Flint) + Evidence-Based PropTech (Mike DelPrete)*
