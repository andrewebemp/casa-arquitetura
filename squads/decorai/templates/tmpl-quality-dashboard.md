# Template: Quality Benchmark Dashboard

<!--
template:
  id: tmpl-quality-dashboard
  name: "Quality Benchmark Dashboard"
  agent: "@visual-quality-engineer"
  task: quality-benchmark.md
  version: "1.0.0"
-->

> **Agente:** @visual-quality-engineer (Lyra)
> **Task:** quality-benchmark.md
> **Descrição:** Dashboard consolidado de métricas de qualidade para renders gerados pelo pipeline DecorAI.

---

## Overall Quality Score

| Metric | Value | Status | Threshold |
|--------|-------|--------|-----------|
| **Overall Score** | `{overall_score}/100` | {status_emoji} | >= 70 |
| **Quality Gate** | `QG-DA-003` | {pass_fail} | BLOCKING |
| **Render ID** | `{render_id}` | - | - |
| **Timestamp** | `{timestamp}` | - | - |
| **Pipeline Version** | `{pipeline_version}` | - | - |

### Score Breakdown

```
Overall: ████████░░ {overall_score}/100

  Photorealism:  {photorealism_bar} {photorealism_score}/100
  Structural:    {structural_bar} {structural_score}/100
  Style Match:   {style_match_bar} {style_match_score}/100
  Lighting:      {lighting_bar} {lighting_score}/100
  Consistency:   {consistency_bar} {consistency_score}/100
```

---

## Per-Metric Analysis

### FID (Frechet Inception Distance)

| Parameter | Value |
|-----------|-------|
| **Score** | `{fid_score}` |
| **Rating** | {fid_rating} |
| **Reference Dataset** | {fid_reference_dataset} |
| **Sample Size** | {fid_sample_size} |

**Thresholds:**
- Excelente: < 30
- Bom: 30 - 50
- Aceitável: 50 - 80
- Reprovado: > 80

**Trend (últimos 10 renders):**
```
FID: {fid_trend_chart}
     ^
 80 -|
 50 -|- - - - - - - - - - (threshold bom)
 30 -|- - - - - - - - - - (threshold excelente)
  0 -+--+--+--+--+--+--+--+--+--+--> renders
     1  2  3  4  5  6  7  8  9  10
```

### SSIM (Structural Similarity Index)

| Parameter | Value |
|-----------|-------|
| **Score** | `{ssim_score}` |
| **Rating** | {ssim_rating} |
| **Comparison** | Original vs Render |

**Thresholds:**
- Excelente: > 0.90
- Bom: 0.85 - 0.90
- Aceitável: 0.75 - 0.85
- Reprovado: < 0.75

### LPIPS (Learned Perceptual Image Patch Similarity)

| Parameter | Value |
|-----------|-------|
| **Score** | `{lpips_score}` |
| **Rating** | {lpips_rating} |
| **Model** | AlexNet / VGG |

**Thresholds:**
- Excelente: < 0.10
- Bom: 0.10 - 0.20
- Aceitável: 0.20 - 0.35
- Reprovado: > 0.35

### CLIP Score (Alignment)

| Parameter | Value |
|-----------|-------|
| **Score** | `{clip_score}` |
| **Rating** | {clip_rating} |
| **Prompt Used** | `{clip_prompt_summary}` |

**Thresholds:**
- Excelente: > 0.35
- Bom: 0.30 - 0.35
- Aceitável: 0.25 - 0.30
- Reprovado: < 0.25

### PSNR (Peak Signal-to-Noise Ratio)

| Parameter | Value |
|-----------|-------|
| **Score** | `{psnr_db} dB` |
| **Rating** | {psnr_rating} |

---

## Artifact Analysis

### Artefatos Detectados

| ID | Tipo | Severidade | Localização | Descrição |
|----|------|-----------|-------------|-----------|
| {art_id} | {art_type} | {art_severity} | {art_location} | {art_description} |

**Tipos de artefato monitorados:**
- `floating_furniture` - Móvel flutuando (sem contato com piso)
- `perspective_break` - Quebra de perspectiva / distorção
- `texture_blur` - Textura borrada ou inconsistente
- `color_bleed` - Sangramento de cor entre elementos
- `edge_artifact` - Artefato nas bordas de objetos inseridos
- `shadow_mismatch` - Sombra inconsistente com iluminação
- `scale_error` - Escala incorreta de elemento
- `repetition_pattern` - Padrão repetitivo detectado (tiling artifact)

### Severity Distribution

```
Crítico  (bloqueia): {critical_count} ████
Alto     (revisar):  {high_count}     ███
Médio    (aceitável): {medium_count}  ██
Baixo    (ignorável): {low_count}     █
```

---

## Comparative Analysis

### Antes vs Depois

| Aspecto | Original | Render | Delta |
|---------|----------|--------|-------|
| Luminosidade média | {orig_brightness} | {render_brightness} | {delta_brightness} |
| Contraste | {orig_contrast} | {render_contrast} | {delta_contrast} |
| Saturação | {orig_saturation} | {render_saturation} | {delta_saturation} |
| Complexidade visual | {orig_complexity} | {render_complexity} | {delta_complexity} |

### Style Consistency Score

| Elemento | Aderência ao Style Guide | Score |
|----------|-------------------------|-------|
| Cores | {color_adherence} | {color_score}/10 |
| Materiais | {material_adherence} | {material_score}/10 |
| Mobiliário | {furniture_adherence} | {furniture_score}/10 |
| Iluminação | {lighting_adherence} | {lighting_score}/10 |
| **Total** | - | **{style_total}/40** |

---

## Recommendations

### Ações Imediatas (se reprovado)

1. {recommendation_1}
2. {recommendation_2}
3. {recommendation_3}

### Sugestões de Melhoria (se aprovado)

- {improvement_1}
- {improvement_2}

### Pipeline Tuning Suggestions

| Parameter | Current | Suggested | Expected Impact |
|-----------|---------|-----------|-----------------|
| {param_name} | {param_current} | {param_suggested} | {param_impact} |

---

## Quality Gate Decision

| Critério | Resultado | Peso |
|----------|-----------|------|
| FID < 50 | {fid_pass} | 25% |
| SSIM > 0.85 | {ssim_pass} | 20% |
| LPIPS < 0.20 | {lpips_pass} | 20% |
| CLIP > 0.30 | {clip_pass} | 15% |
| Zero artefatos críticos | {artifacts_pass} | 20% |

**Decisão Final:** `{final_decision}` (PASS / FAIL / CONDITIONAL)

**Condição de veto:** Qualquer artefato de severidade "crítico" reprova automaticamente, independente do score.

---

*Gerado por @visual-quality-engineer (Lyra) | DecorAI Quality Pipeline v{version}*
