# Template: Pricing Strategy Analysis

<!--
template:
  id: tmpl-pricing-analysis
  name: "Pricing Strategy Analysis"
  agent: "@proptech-growth"
  task: pricing-strategy.md
  version: "1.0.0"
-->

> **Agente:** @proptech-growth (Venture)
> **Task:** pricing-strategy.md
> **Descrição:** Análise completa de estratégia de precificação para o DecorAI, incluindo breakdown por tier, unit economics, métricas CAC/LTV, comparação com concorrentes e recomendações.

---

## Executive Summary

**Data da Análise:** `{analysis_date}`
**Período de Referência:** `{reference_period}`
**Analista:** @proptech-growth (Venture)

{executive_summary_paragraph}

---

## Tier Breakdown

### Tier 1: Explorador (Freemium)

| Parâmetro | Valor |
|-----------|-------|
| **Preço** | R$ 0,00/mês |
| **Renders incluídos** | {explorer_renders}/mês |
| **Resolução máxima** | {explorer_resolution} |
| **Marca d'água** | Sim |
| **Estilos disponíveis** | {explorer_styles_count}/10 |
| **Suporte** | Autoatendimento |
| **Objetivo estratégico** | {explorer_objective} |
| **Taxa de conversão esperada** | {explorer_conversion_rate}% para Pro |

**Funcionalidades incluídas:**
- [ ] Upload de foto
- [ ] Análise espacial básica
- [ ] {explorer_styles_count} estilos pré-definidos
- [ ] Preview em baixa resolução
- [ ] Download com marca d'água
- [ ] 1 refinamento por render

**Limitações:**
- {explorer_limitation_1}
- {explorer_limitation_2}
- {explorer_limitation_3}

---

### Tier 2: Profissional

| Parâmetro | Valor |
|-----------|-------|
| **Preço** | R$ 89,00/mês |
| **Renders incluídos** | {pro_renders}/mês |
| **Render adicional** | R$ {pro_extra_render}/unidade |
| **Resolução máxima** | {pro_resolution} |
| **Marca d'água** | Não |
| **Estilos disponíveis** | 10/10 |
| **Suporte** | Chat + Email (SLA 24h) |
| **Latência alvo** | < 30s (p95 < 15s) |

**Funcionalidades adicionais (vs Explorador):**
- [ ] Todos os 10 estilos
- [ ] Resolução full HD sem marca d'água
- [ ] Refinamento conversacional (até {pro_refinements}x)
- [ ] Remoção de objetos
- [ ] Troca de iluminação (IC-Light)
- [ ] Comparativo antes/depois (slider)
- [ ] Histórico de versões
- [ ] Export para redes sociais

**Público-alvo:**
- {pro_target_1}
- {pro_target_2}
- {pro_target_3}

---

### Tier 3: Imobiliária

| Parâmetro | Valor |
|-----------|-------|
| **Preço base** | R$ 499,00/mês |
| **Preço enterprise** | Até R$ 2.999,00/mês |
| **Renders incluídos** | {enterprise_renders}/mês |
| **Render adicional** | R$ {enterprise_extra_render}/unidade |
| **Resolução máxima** | {enterprise_resolution} |
| **Marca d'água** | White-label disponível |
| **Suporte** | Dedicado (SLA 4h) |
| **Latência alvo** | < 15s (prioridade GPU) |

**Funcionalidades adicionais (vs Profissional):**
- [ ] API de integração
- [ ] White-label (marca própria)
- [ ] Integração com portais (ZAP, Viva Real, OLX)
- [ ] Staging em lote (batch processing)
- [ ] Dashboard de analytics
- [ ] Reverse staging (diagnóstico de imóvel)
- [ ] Relatório de valorização
- [ ] Múltiplos usuários/seats
- [ ] SLA garantido
- [ ] Suporte dedicado

**Sub-tiers Enterprise:**

| Sub-tier | Preço | Renders | Usuários | API Calls |
|----------|-------|---------|----------|-----------|
| Starter | R$ 499/mês | {ent_starter_renders} | {ent_starter_users} | {ent_starter_api} |
| Growth | R$ 999/mês | {ent_growth_renders} | {ent_growth_users} | {ent_growth_api} |
| Scale | R$ 1.999/mês | {ent_scale_renders} | {ent_scale_users} | {ent_scale_api} |
| Enterprise | R$ 2.999/mês | Ilimitado | Ilimitado | Ilimitado |

---

## Unit Economics

### Custo por Render

| Componente | Custo (R$) | % do Total |
|------------|-----------|-----------|
| GPU compute (geração) | R$ {gpu_cost} | {gpu_pct}% |
| GPU compute (upscale) | R$ {upscale_cost} | {upscale_pct}% |
| Storage (imagens) | R$ {storage_cost} | {storage_pct}% |
| CDN (delivery) | R$ {cdn_cost} | {cdn_pct}% |
| API calls (modelos) | R$ {api_cost} | {api_pct}% |
| **Total por render** | **R$ {total_cost_per_render}** | **100%** |

**Target:** R$ 0,50 - R$ 1,50/render (máximo R$ 2,00)
**Atual:** R$ {current_cost}/render
**Status:** {cost_status}

### Margem por Tier

| Tier | Receita/mês | Custo estimado/mês | Margem bruta | Margem % |
|------|-------------|-------------------|--------------|----------|
| Explorador | R$ 0 | R$ {explorer_cost} | -R$ {explorer_cost} | N/A |
| Profissional | R$ 89 | R$ {pro_cost} | R$ {pro_margin} | {pro_margin_pct}% |
| Imobiliária (base) | R$ 499 | R$ {ent_cost} | R$ {ent_margin} | {ent_margin_pct}% |

---

## CAC / LTV Analysis

### Customer Acquisition Cost (CAC)

| Canal | CAC | Volume | % Aquisição |
|-------|-----|--------|-------------|
| Google Ads | R$ {cac_google} | {vol_google} | {pct_google}% |
| Meta Ads | R$ {cac_meta} | {vol_meta} | {pct_meta}% |
| Orgânico/SEO | R$ {cac_seo} | {vol_seo} | {pct_seo}% |
| Referral | R$ {cac_referral} | {vol_referral} | {pct_referral}% |
| Parcerias portais | R$ {cac_partners} | {vol_partners} | {pct_partners}% |
| **Blended CAC** | **R$ {cac_blended}** | - | **100%** |

### Lifetime Value (LTV)

| Tier | ARPU/mês | Churn/mês | Lifetime (meses) | LTV |
|------|----------|-----------|-------------------|-----|
| Profissional | R$ {pro_arpu} | {pro_churn}% | {pro_lifetime} | R$ {pro_ltv} |
| Imobiliária | R$ {ent_arpu} | {ent_churn}% | {ent_lifetime} | R$ {ent_ltv} |
| **Blended** | R$ {blended_arpu} | {blended_churn}% | {blended_lifetime} | **R$ {blended_ltv}** |

### LTV:CAC Ratio

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| LTV:CAC (Blended) | {ltv_cac_ratio}:1 | > 3:1 | {ltv_cac_status} |
| Payback Period | {payback_months} meses | < 12 meses | {payback_status} |

---

## Competitor Comparison

| Feature | DecorAI | {competitor_1} | {competitor_2} | {competitor_3} |
|---------|---------|----------------|----------------|----------------|
| Preço entrada | R$ 89/mês | {c1_price} | {c2_price} | {c3_price} |
| Renders/mês (base) | {pro_renders} | {c1_renders} | {c2_renders} | {c3_renders} |
| Mercado BR | Nativo | {c1_br} | {c2_br} | {c3_br} |
| Estilos BR | 10 | {c1_styles} | {c2_styles} | {c3_styles} |
| Refinamento conversacional | Sim | {c1_refine} | {c2_refine} | {c3_refine} |
| API | Sim | {c1_api} | {c2_api} | {c3_api} |
| Integração portais BR | Sim | {c1_portals} | {c2_portals} | {c3_portals} |
| Reverse staging | Sim | {c1_reverse} | {c2_reverse} | {c3_reverse} |
| Qualidade (FID) | {decorai_fid} | {c1_fid} | {c2_fid} | {c3_fid} |

### Positioning Map

```
                    Premium
                       ^
                       |
          {c3_name}    |    DecorAI
              *        |       *
                       |
  Generic <--------+---------> BR-Native
                       |
              *        |       *
          {c1_name}    |    {c2_name}
                       |
                    Budget
```

---

## Recommendation

### Estratégia Recomendada

**Modelo:** {recommended_model}
**Justificativa:** {recommendation_justification}

### Ações de Curto Prazo (0-3 meses)

1. {action_short_1}
2. {action_short_2}
3. {action_short_3}

### Ações de Médio Prazo (3-6 meses)

1. {action_mid_1}
2. {action_mid_2}
3. {action_mid_3}

### Ações de Longo Prazo (6-12 meses)

1. {action_long_1}
2. {action_long_2}

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| {risk_1} | {prob_1} | {impact_1} | {mitigation_1} |
| {risk_2} | {prob_2} | {impact_2} | {mitigation_2} |
| {risk_3} | {prob_3} | {impact_3} | {mitigation_3} |

---

*Análise gerada por @proptech-growth (Venture) | Framework: Pete Flint (NFX) + Mike DelPrete | DecorAI v{version}*
