# Template: Reverse Staging Diagnostic

<!--
template:
  id: tmpl-reverse-staging-diagnostic
  name: "Reverse Staging Diagnostic"
  agent: "@proptech-growth"
  task: reverse-staging.md
  version: "1.0.0"
-->

> **Agente:** @proptech-growth (Venture)
> **Task:** reverse-staging.md
> **Descrição:** Diagnóstico de reverse staging para imóveis com decoração existente. Analisa o impacto visual da decoração atual, estima perda de valor percebido, gera comparativo com render otimizado e apresenta melhorias-chave com CTA para conversão.

---

## Informações do Imóvel

| Campo | Valor |
|-------|-------|
| **Diagnostic ID** | `{diagnostic_id}` |
| **Data** | `{timestamp}` |
| **Endereço** | {address} |
| **Tipo** | {property_type} |
| **Área** | {area_m2} m² |
| **Dormitórios** | {bedrooms} |
| **Vagas** | {parking} |
| **Preço de Listagem** | R$ {listing_price} |
| **Portal** | {portal_name} |
| **URL do Anúncio** | {listing_url} |

---

## Current Listing Score

### Avaliação Geral do Anúncio Atual

```
Score Atual: {current_score}/100
             ████████░░░░░░░░░░░░  {current_score}%

Potencial com Staging: {potential_score}/100
             ████████████████░░░░  {potential_score}%

Ganho Estimado: +{score_delta} pontos
```

### Breakdown por Critério

| Critério | Score Atual | Score Potencial | Gap |
|----------|------------|-----------------|-----|
| Primeira impressão (hero image) | {first_impression_current}/20 | {first_impression_potential}/20 | +{fi_gap} |
| Qualidade fotográfica | {photo_quality_current}/15 | {photo_quality_potential}/15 | +{pq_gap} |
| Decoração e staging | {decor_current}/20 | {decor_potential}/20 | +{dc_gap} |
| Iluminação | {lighting_current}/15 | {lighting_potential}/15 | +{lt_gap} |
| Organização/limpeza visual | {org_current}/10 | {org_potential}/10 | +{or_gap} |
| Atratividade do estilo | {style_current}/10 | {style_potential}/10 | +{st_gap} |
| Sensação de espaço | {space_current}/10 | {space_potential}/10 | +{sp_gap} |
| **Total** | **{current_score}/100** | **{potential_score}/100** | **+{score_delta}** |

---

## Estimated Value Loss

### Impacto Financeiro da Apresentação Atual

| Métrica | Valor |
|---------|-------|
| **Preço de listagem** | R$ {listing_price} |
| **Valor percebido atual** | R$ {perceived_value_current} |
| **Valor percebido com staging** | R$ {perceived_value_staged} |
| **Perda estimada** | R$ {value_loss} ({value_loss_pct}%) |
| **Tempo médio de venda estimado** | {current_time_to_sell} dias |
| **Tempo com staging** | {staged_time_to_sell} dias |
| **Redução de tempo** | {time_reduction} dias ({time_reduction_pct}%) |

### Custo de Oportunidade

```
Cada dia adicional no mercado custa:
  Condomínio:  R$ {condo_daily}/dia
  IPTU:        R$ {iptu_daily}/dia
  Oportunidade: R$ {opportunity_daily}/dia (CDI sobre capital parado)
  ─────────────────────────────────
  Total:       R$ {daily_cost}/dia

Economia estimada com staging:
  {time_reduction} dias x R$ {daily_cost}/dia = R$ {total_savings}

ROI do staging virtual:
  Investimento: R$ {staging_cost} (1 render Pro)
  Retorno: R$ {total_savings}
  ROI: {roi}x
```

---

## Comparison Render (Watermarked)

### Antes (Atual)

```
+──────────────────────────────────────────+
|                                          |
|    [Foto atual do anúncio]               |
|                                          |
|    Problemas identificados:              |
|    ❌ {problem_1}                        |
|    ❌ {problem_2}                        |
|    ❌ {problem_3}                        |
|    ❌ {problem_4}                        |
|                                          |
+──────────────────────────────────────────+
```

**URL da foto original:** `{original_photo_url}`

### Depois (Render com Staging Virtual) - MARCA D'AGUA

```
+──────────────────────────────────────────+
|                                          |
|    [Render com staging virtual]          |
|         ╔══════════════╗                 |
|         ║  DECORAI.AI  ║                 |
|         ║   PREVIEW    ║                 |
|         ╚══════════════╝                 |
|    Melhorias aplicadas:                  |
|    ✅ {improvement_1}                    |
|    ✅ {improvement_2}                    |
|    ✅ {improvement_3}                    |
|    ✅ {improvement_4}                    |
|                                          |
+──────────────────────────────────────────+
```

**URL do render (watermarked):** `{render_watermarked_url}`
**Estilo aplicado:** {style_applied}
**Resolução do preview:** {preview_resolution}

### Comparativo Side-by-Side

**URL do comparativo interativo:** `{comparison_slider_url}`

---

## Key Improvements

### Top 5 Melhorias Identificadas

#### 1. {improvement_title_1}

| Aspecto | Detalhe |
|---------|---------|
| **Problema** | {problem_detail_1} |
| **Solução** | {solution_detail_1} |
| **Impacto no score** | +{impact_score_1} pontos |
| **Impacto no valor** | +R$ {impact_value_1} ({impact_pct_1}%) |
| **Complexidade** | {complexity_1} |

#### 2. {improvement_title_2}

| Aspecto | Detalhe |
|---------|---------|
| **Problema** | {problem_detail_2} |
| **Solução** | {solution_detail_2} |
| **Impacto no score** | +{impact_score_2} pontos |
| **Impacto no valor** | +R$ {impact_value_2} ({impact_pct_2}%) |
| **Complexidade** | {complexity_2} |

#### 3. {improvement_title_3}

| Aspecto | Detalhe |
|---------|---------|
| **Problema** | {problem_detail_3} |
| **Solução** | {solution_detail_3} |
| **Impacto no score** | +{impact_score_3} pontos |
| **Impacto no valor** | +R$ {impact_value_3} ({impact_pct_3}%) |
| **Complexidade** | {complexity_3} |

#### 4. {improvement_title_4}

| Aspecto | Detalhe |
|---------|---------|
| **Problema** | {problem_detail_4} |
| **Solução** | {solution_detail_4} |
| **Impacto no score** | +{impact_score_4} pontos |
| **Impacto no valor** | +R$ {impact_value_4} ({impact_pct_4}%) |
| **Complexidade** | {complexity_4} |

#### 5. {improvement_title_5}

| Aspecto | Detalhe |
|---------|---------|
| **Problema** | {problem_detail_5} |
| **Solução** | {solution_detail_5} |
| **Impacto no score** | +{impact_score_5} pontos |
| **Impacto no valor** | +R$ {impact_value_5} ({impact_pct_5}%) |
| **Complexidade** | {complexity_5} |

### Resumo de Impacto

| Categoria | Melhorias | Impacto Total Score | Impacto Total Valor |
|-----------|-----------|--------------------|--------------------|
| Staging/Decoração | {staging_count} | +{staging_impact} pts | +R$ {staging_value} |
| Iluminação | {lighting_count} | +{lighting_impact} pts | +R$ {lighting_value} |
| Organização | {org_count} | +{org_impact} pts | +R$ {org_value} |
| Fotografia | {photo_count} | +{photo_impact} pts | +R$ {photo_value} |
| **Total** | **{total_improvements}** | **+{total_impact} pts** | **+R$ {total_value_impact}** |

---

## Call to Action (CTA)

### Para o Corretor/Imobiliária

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   Seu imóvel está perdendo R$ {value_loss}             ║
║   em valor percebido.                                  ║
║                                                        ║
║   Com DecorAI Pro (R$ 89/mês), você pode:              ║
║                                                        ║
║   ✅ Gerar staging virtual em {generation_time}s       ║
║   ✅ Aumentar o score do anúncio em +{score_delta}pts  ║
║   ✅ Reduzir tempo de venda em {time_reduction} dias   ║
║   ✅ ROI de {roi}x sobre o investimento                ║
║                                                        ║
║   👉 {cta_primary_text}                                ║
║   🔗 {cta_primary_url}                                 ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

### CTAs por Contexto

| Contexto | CTA | URL | Tier Sugerido |
|----------|-----|-----|---------------|
| Primeiro contato | {cta_first_contact} | {cta_first_url} | Explorador |
| Após ver preview | {cta_after_preview} | {cta_preview_url} | Profissional |
| Múltiplos imóveis | {cta_multiple} | {cta_multiple_url} | Imobiliária |
| Portal integration | {cta_portal} | {cta_portal_url} | Imobiliária |

### Follow-up Automático

| Trigger | Ação | Timing |
|---------|------|--------|
| Abriu diagnóstico | Email com render HD (sem marca d'água do primeiro cômodo) | +24h |
| Não converteu em 3 dias | WhatsApp com caso de sucesso similar | +72h |
| Abriu mas não contratou | Retargeting com antes/depois | +7d |
| Expiração do trial | Oferta especial 30% off primeiro mês | +14d |

---

## Dados Técnicos

| Parâmetro | Valor |
|-----------|-------|
| **Modelo de scoring** | DecorAI Listing Score v{scoring_version} |
| **Benchmark dataset** | {benchmark_dataset} |
| **Margem de erro do score** | +/- {score_error_margin} pontos |
| **Render engine** | SDXL + ControlNet v{pipeline_version} |
| **Estilo aplicado no preview** | {style_preset_used} |
| **Quality gate** | {quality_gate_status} |

---

*Diagnóstico gerado por @proptech-growth (Venture) | Framework: Pete Flint (NFX) Marketplace Scoring | DecorAI v{version}*
