# Task: Analyze Current Interior Design Trends in Brazil

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | analyze-brazilian-trends |
| **status** | `pending` |
| **responsible_executor** | @interior-strategist |
| **execution_type** | `Agent` |
| **input** | Market segment (residential/commercial) + room type + target audience |
| **output** | Trend analysis report with actionable design recommendations |
| **action_items** | 7 steps |
| **acceptance_criteria** | 6 criteria |

## Purpose

Analyze current interior design trends in the Brazilian market to inform style recommendations and ensure DecorAI renders reflect contemporary preferences. The Brazilian market has unique characteristics: tropical climate influences, strong color culture, integration of indoor/outdoor spaces, and specific material preferences. This task produces actionable trend intelligence that feeds into style guide creation and helps position DecorAI renders as current and market-relevant.

## Inputs

- Market segment: residential (apartamento, casa, studio) or commercial (escritorio, loja, clinica)
- Room type: sala, quarto, cozinha, banheiro, area gourmet, varanda, home office
- Target audience: jovens profissionais, familias, investidores, alto padrao
- Optional: specific city or region (SP, RJ, BH, POA, etc.)
- Optional: price segment (economico, medio, alto padrao, luxo)

## Preconditions

- Market segment and room type specified
- Access to trend data sources (design publications, CASACOR, Expo Revestir, social media trends)

## Steps

1. **Identify trend sources**
   - Brazilian design publications: Casa Vogue, Casa Claudia, Arquitetura & Construcao
   - Major events: CASACOR (all editions), Expo Revestir, Design Weekend SP
   - Social media: Instagram design accounts, Pinterest Brazil trends
   - International influences: Milan Design Week, Maison & Objet filtered for Brazil adaptation
   - Industry reports: ABRASCE, CBIC, Sinduscon market data

2. **Analyze macro trends**
   - Color trends: Coral da Natureza, terracotta, verdes, tons terrosos
   - Material trends: pedra natural, madeira certificada, concreto aparente, metal
   - Spatial trends: integracao, conceito aberto, home office permanente
   - Sustainability trends: materiais reciclados, certificacao, baixo VOC
   - Technology integration: automacao, smart home, iluminacao inteligente

3. **Map micro trends by room type**
   - For the specific room type requested, identify:
     - Top 3 trending styles currently popular
     - Materials gaining popularity
     - Colors in ascension vs declining
     - Layout preferences (open plan, defined zones)
     - Specific furniture/fixture trends

4. **Analyze regional variations**
   - Southeast (SP, RJ): internacional, cosmopolita, alto design
   - South (POA, Curitiba, Floripa): escandinavo-brasileiro, funcional, aconchegante
   - Northeast (Salvador, Recife, Fortaleza): cores vibrantes, materiais naturais, tropical
   - Central-West (Brasilia, Goiania): modernismo, clean, espacos amplos
   - Adapt recommendations to the specified region if provided

5. **Assess trend lifecycle stage**
   - For each identified trend, classify:
     - Emerging (< 1 year visible, growing interest)
     - Peak (1-2 years, maximum adoption)
     - Mature (2-4 years, mainstream adoption)
     - Declining (> 4 years, being replaced)
   - Recommend investing in emerging and peak trends
   - Flag declining trends for user awareness

6. **Generate actionable recommendations**
   - Top 3 trend-aligned style suggestions for the specific request
   - Material recommendations aligned with current trends
   - Color palette suggestions reflecting 2026 preferences
   - Layout recommendations based on spatial trends
   - What to AVOID: declining trends and potential trend traps

7. **Compile trend analysis report**
   - Executive summary with top 3 insights
   - Macro trend overview with Brazil-specific context
   - Room-specific micro trends
   - Regional variations (if applicable)
   - Lifecycle assessment per trend
   - Actionable recommendations with confidence levels

## Outputs

- **Trend Analysis Report** with macro and micro trends
- **Top 3 Style Recommendations** aligned with current trends
- **Material Trend Map** showing ascending/descending materials
- **Color Trend Palette** reflecting 2026 Brazilian preferences
- **Trend Lifecycle Assessment** classifying each trend's stage
- **Actionable Recommendations** for the specific request

## Acceptance Criteria

- [ ] At least 5 macro trends identified with Brazilian market context
- [ ] Room-specific micro trends mapped for the requested room type
- [ ] Each trend classified by lifecycle stage (emerging, peak, mature, declining)
- [ ] Regional variations acknowledged (at minimum national-level trends)
- [ ] Top 3 actionable style recommendations provided
- [ ] Declining trends flagged with "avoid" recommendation

## Quality Gate

- Trends must be Brazil-specific, not generic international trends without local adaptation
- Color and material recommendations must account for tropical climate
- All trend assertions should reference identifiable sources (publications, events, industry data)
- Trend lifecycle classifications must be justified with reasoning
- Recommendations must be actionable for DecorAI renders (not abstract design philosophy)
- Report must be useful for both @interior-strategist style guide creation and direct user consultation
