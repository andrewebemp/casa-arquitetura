# Task: Recommend Brazilian Materials with Price Ranges

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | recommend-materials |
| **status** | `pending` |
| **responsible_executor** | @interior-strategist |
| **execution_type** | `Agent` |
| **input** | Style guide + room specifications + budget tier |
| **output** | Material recommendation list with Brazilian brands, price ranges, and alternatives |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Recommend specific materials available in the Brazilian market for implementing a room design, including price ranges per square meter, brand suggestions, and budget-appropriate alternatives. This bridges the gap between the virtual staging render and real-world implementation, helping users (especially corretores and designers) understand the practical cost and sourcing of the design shown in the render. Material recommendations consider regional availability, tropical climate durability, and Brazilian construction standards.

## Inputs

- Style guide for the selected design (from create-style-guide)
- Room specifications (type, dimensions, area from @spatial-analyst)
- Budget tier: economico, intermediario, premium
- Optional: regional preference (Sudeste, Sul, Nordeste, etc.)
- Optional: specific material constraints (no carpet, no dark floors, etc.)

## Preconditions

- Style guide available with material specifications
- Room dimensions available for quantity estimation
- Budget tier selected by user or defaulted to intermediario

## Steps

1. **Map style materials to market categories**
   - For each material in the style guide, identify the Brazilian market category
   - Categories: revestimentos, pisos, bancadas, marcenaria, iluminacao, texteis
   - Map generic terms to specific products: "oak wood floor" -> "piso vinilico padrao carvalho" or "porcelanato madeira"
   - Consider tropical climate adaptations (humidity, heat)

2. **Research price ranges per category**
   - Economico tier: Leroy Merlin, C&C, Telhanorte price range
   - Intermediario tier: specialty stores, Portobello, Eliane mid-range
   - Premium tier: high-end imports, Silestone, Dekton, marcenaria sob medida
   - Prices in R$/m2 for surfaces, R$/unit for fixtures
   - Include installation cost estimates where relevant

3. **Select specific product recommendations**
   - For each surface/element, recommend:
     - Primary choice: best match for the style within budget
     - Budget alternative: similar look at lower cost
     - Premium upgrade: higher quality option if budget allows
   - Include brand names and product lines available in Brazil
   - Note regional availability differences

4. **Calculate quantity estimates**
   - Use room dimensions to estimate quantities needed:
     - Floor: room area + 10% waste
     - Walls: perimeter x ceiling height - openings + 10% waste
     - Countertops: linear meters x depth
   - Calculate estimated total cost per category
   - Calculate grand total for all materials

5. **Consider durability and maintenance**
   - Rate each material for Brazilian climate suitability
   - Note maintenance requirements (sealed vs unsealed surfaces)
   - Flag materials that perform poorly in high humidity
   - Recommend protective treatments where needed (impermeabilizante, selante)

6. **Prepare supplier guidance**
   - List major retail chains for each material category
   - Note online purchase options (MadeiraMadeira, Leroy Merlin online)
   - Mention professional discounts for designers/architects
   - Include typical lead times for special-order materials

7. **Compile material recommendation document**
   - Structured table per room surface
   - Three-tier pricing (economico, intermediario, premium)
   - Quantity estimates and total cost ranges
   - Supplier suggestions
   - Climate/durability notes
   - Installation considerations

## Outputs

- **Material Recommendation Table** per surface with 3 budget tiers
- **Quantity Estimate** based on room dimensions
- **Cost Summary** with ranges per tier (R$ total estimate)
- **Supplier Guide** with retail and online options
- **Durability Notes** for tropical climate suitability
- **Installation Considerations** and typical professional costs

## Acceptance Criteria

- [ ] Materials recommended for all major surfaces (floor, walls, countertops, cabinetry)
- [ ] Three budget tiers provided: economico, intermediario, premium with R$/m2 ranges
- [ ] Brazilian brand names and product lines included
- [ ] Quantity estimates calculated from room dimensions (with 10% waste factor)
- [ ] Total cost estimate provided per tier
- [ ] Climate/durability suitability assessed for each material
- [ ] At least one budget alternative provided for each primary recommendation

## Quality Gate

- All prices must reflect current Brazilian market (2026 ranges)
- Materials must be actually purchasable in Brazil (no exotic imports without noting lead time)
- Quantity calculations must use room dimensions from spatial analysis (not estimates)
- Economico tier must be genuinely affordable (not "cheap premium")
- If a style requires materials only available in premium tier, clearly communicate this
- Cost estimates are ranges (min-max), not precise quotes -- disclaimer required
