# Task: Define Pricing Tiers with Unit Economics Analysis

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | create-pricing-strategy |
| **status** | `pending` |
| **responsible_executor** | @proptech-growth |
| **execution_type** | `Agent` |
| **input** | Cost structure (GPU, infrastructure, operations) + market benchmarks + target margins |
| **output** | Pricing tier definitions with unit economics model and break-even analysis |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Define the pricing tiers for DecorAI with a rigorous unit economics analysis. Pricing must balance three forces: competitive positioning in the Brazilian market (existing staging services charge R$50-200 per photo), cost structure (GPU inference is the primary variable cost), and perceived value (staged listings sell 30-50% faster). The pricing strategy covers individual renders, room packages, property packages, and subscription models for agencies, with break-even analysis for each tier.

## Inputs

- Cost per render data (from @pipeline-optimizer analyze-cost-per-render)
- Competitive pricing benchmark (BoxBrownie, VirtualStaging.com, local services)
- Brazilian market willingness-to-pay research
- Target user segments and their budget profiles
- Infrastructure fixed costs (servers, APIs, storage)
- Target gross margin: 60-75%

## Preconditions

- Cost per render estimated or benchmarked
- Competitive landscape analyzed
- Target market segments defined (corretores, imobiliarias, incorporadoras)

## Steps

1. **Calculate unit economics per render**
   - GPU inference cost (primary variable cost): $ per render at each provider
   - API costs (Claude for conversation, CLIP for validation): $ per session
   - Storage costs (renders, version history): $ per project
   - Bandwidth costs (image delivery): $ per render viewed
   - Total variable cost per render (COGS)
   - Target contribution margin: 65-75%

2. **Analyze competitive pricing landscape**
   - BoxBrownie: benchmark international pricing
   - VirtualStagingAI: international AI staging pricing
   - Local Brazilian services: Stalo, manual staging services
   - Map pricing: per-photo, per-room, per-property, subscription
   - Identify pricing gaps and opportunities in the Brazilian market
   - Convert all to BRL with current exchange rate considerations

3. **Define pricing tiers**
   - Tier 0 - Free: Saleability diagnostic (reverse staging funnel entry)
   - Tier 1 - Avulso (Pay-per-render): single room staging
   - Tier 2 - Pacote Imovel: full property package (3-6 rooms)
   - Tier 3 - Plano Corretor: monthly subscription for individual corretores
   - Tier 4 - Plano Imobiliaria: monthly subscription for agencies
   - Tier 5 - Enterprise: custom pricing for incorporadoras
   - For each tier: price, included renders, refinement rounds, resolution, features

4. **Model unit economics per tier**
   - For each tier, calculate:
     - Revenue per unit
     - Variable cost per unit (COGS)
     - Contribution margin (R$ and %)
     - Expected usage pattern (renders per month, refinements per render)
     - Effective revenue per render
   - Identify most and least profitable tiers

5. **Calculate break-even points**
   - Fixed costs: team, infrastructure, marketing, overhead
   - Monthly break-even in number of renders
   - Monthly break-even in revenue (R$)
   - Break-even by tier mix (optimistic, realistic, pessimistic scenarios)
   - Time-to-break-even with projected growth curves

6. **Design psychological pricing elements**
   - Anchor pricing: show premium tier first to make standard seem affordable
   - Decoy pricing: structure tiers so the "best value" tier is the target
   - Annual vs monthly: discount for annual commitment (15-20%)
   - Currency display: R$ values rounded to X9 or X7 endings
   - Free tier as conversion tool, not perpetual free usage

7. **Model growth scenarios**
   - Conservative: 100 paying users in month 3, 20% MoM growth
   - Moderate: 300 paying users in month 3, 30% MoM growth
   - Aggressive: 500 paying users in month 3, 40% MoM growth
   - For each scenario: monthly revenue, costs, burn rate, runway
   - Identify unit economics levers (which improvements have highest impact)

8. **Compile pricing strategy document**
   - Pricing table with all tiers, features, and prices
   - Unit economics model with all calculations
   - Break-even analysis with scenarios
   - Growth projections with revenue forecasts
   - Competitive positioning map
   - Pricing psychology rationale
   - Recommended launch pricing (may differ from long-term pricing)

## Outputs

- **Pricing Tier Table** with prices, features, limits for each tier
- **Unit Economics Model** with COGS, margins, effective RPR per tier
- **Break-Even Analysis** with 3 scenarios (conservative, moderate, aggressive)
- **Growth Projection Model** with monthly revenue/cost forecasts
- **Competitive Positioning Map** showing DecorAI vs alternatives
- **Launch Pricing Recommendation** with rationale for initial pricing

## Acceptance Criteria

- [ ] At least 5 pricing tiers defined with clear feature differentiation
- [ ] Unit economics calculated for each tier (COGS, margin, effective RPR)
- [ ] Break-even point calculated with at least 3 scenarios
- [ ] Competitive pricing benchmarks included (international + Brazilian)
- [ ] Psychological pricing elements documented with rationale
- [ ] Growth projections modeled for 12 months
- [ ] Launch pricing recommendation provided with justification

## Quality Gate

- Variable costs MUST be based on actual or benchmarked GPU inference costs, not estimates
- All prices in BRL with consideration for Brazilian purchasing power
- Subscription pricing must account for expected usage patterns (not assume 100% utilization)
- Free tier must have clear limits that prevent value extraction without conversion
- Pricing must be sustainable: contribution margin >= 60% on the target tier
- Enterprise tier must be flexible enough for custom negotiation
