# Task: Generate Complete Style Guide for Interior Design Style

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | create-style-guide |
| **status** | `pending` |
| **responsible_executor** | @interior-strategist |
| **execution_type** | `Agent` |
| **input** | Style name + room type + spatial constraints |
| **output** | Complete style guide with colors, materials, forms, lighting, furniture types |
| **action_items** | 8 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Generate a comprehensive interior design style guide tailored to a specific room type and spatial constraints. The style guide defines the complete visual language: color palette (primary, secondary, accent), materials (walls, floors, surfaces), furniture forms and proportions, lighting strategy, and textile/accessory specifications. This guide serves as the authoritative reference for @staging-architect when generating renders, ensuring stylistic consistency and professional quality adapted to the Brazilian market.

## Inputs

- Selected interior design style (one of 10 predefined or custom)
- Room type (sala, quarto, cozinha, banheiro, escritorio, varanda)
- Spatial constraints from @spatial-analyst (dimensions, structural elements, orientation)
- Optional: user preferences (color preferences, material restrictions, budget tier)
- Optional: reference images provided by the user

## Preconditions

- Style selection made by user or recommended based on room characteristics
- Room type and basic dimensions available
- Knowledge of Brazilian material market and availability

## Steps

1. **Analyze style-room compatibility**
   - Evaluate if selected style suits the room dimensions (e.g., Classic needs larger rooms)
   - Consider structural constraints (low ceiling affects certain styles)
   - Account for natural light orientation (warm styles benefit from south-facing rooms)
   - If compatibility is poor, recommend alternatives while honoring user choice

2. **Define color palette**
   - Primary color (60% of room): walls, large surfaces
   - Secondary color (30% of room): furniture, large textiles
   - Accent color (10% of room): accessories, art, small details
   - Specify exact color references (Pantone or NCS where possible)
   - Include warm/cool tone classification
   - Adapt palette to Brazilian light conditions (strong tropical light affects color perception)

3. **Specify materials**
   - Walls: paint type, texture, accent wall treatment
   - Floors: material (porcelanato, madeira, vinilico), pattern, format
   - Countertops/surfaces: material (granito, quartzo, marmore, madeira)
   - Cabinetry: finish type (lacquer, laminate, natural wood)
   - Note Brazilian-market availability and standard formats
   - Include sustainability considerations where relevant

4. **Define furniture forms and proportions**
   - Sofa/seating: form language (angular, organic, structured), scale relative to room
   - Tables: shape (round, rectangular, organic), material, leg style
   - Storage: type (open shelving, closed cabinets), proportions
   - Bed (if bedroom): headboard style, frame material
   - Scale guidelines: minimum circulation space, proportion rules
   - Brazilian furniture market references (brands, typical price ranges)

5. **Design lighting strategy**
   - Natural light optimization: window treatments, light filtering
   - General/ambient lighting: type (pendente, plafon, trilho), color temperature (K)
   - Task lighting: reading lamps, kitchen under-cabinet, vanity
   - Accent lighting: spot, fita LED, luminaria de piso
   - Color temperature range: 2700K (warm) to 5000K (daylight)
   - Dimming recommendations

6. **Specify textiles and accessories**
   - Curtains/blinds: fabric weight, opacity, color
   - Rugs: material, size relative to room, pattern permission
   - Cushions/throws: texture, pattern, color from palette
   - Art/decor: style guidelines (abstract, botanical, geometric)
   - Plants: suitable types for the style and room conditions
   - Maximum accessory density (minimalist vs maximalist spectrum)

7. **Create style mood description**
   - One-paragraph prose description capturing the style's essence
   - Key emotional words for prompt generation
   - What makes this style specifically Brazilian or adapted to Brazil
   - Reference designers or projects that exemplify this style

8. **Compile style guide document**
   - Structured format with all sections above
   - Include visual reference keywords for AI generation
   - Provide DO and DO NOT lists for the style
   - Add style-specific ControlNet parameter recommendations
   - Include prompt fragment ready for @staging-architect use

## Outputs

- **Complete Style Guide** with 7 sections: palette, materials, furniture, lighting, textiles, mood, parameters
- **Color Palette Specification** with primary/secondary/accent colors and Pantone references
- **Material Specification** with Brazilian market availability notes
- **Prompt Fragment** ready for ControlNet generation
- **DO/DON'T List** for style adherence validation

## Acceptance Criteria

- [ ] Color palette defined with primary (60%), secondary (30%), accent (10%) ratios
- [ ] Materials specified for all major surfaces (walls, floor, countertops, cabinetry)
- [ ] Furniture forms defined with scale proportions relative to room dimensions
- [ ] Lighting strategy includes natural, ambient, task, and accent layers
- [ ] Brazilian market adaptations included (materials, brands, price ranges)
- [ ] Style mood description written with emotional/visual keywords for AI generation
- [ ] DO/DON'T list provided for style validation
- [ ] Prompt fragment generated ready for @staging-architect consumption

## Quality Gate

- Style guide must be room-type specific (kitchen guide differs from bedroom guide)
- All recommended materials must be available in the Brazilian market
- Color palette must account for Brazilian tropical light intensity
- If room dimensions conflict with style requirements, document adaptations made
- Prompt fragment must be tested conceptually against ControlNet parameter ranges
- Style guide must be consistent with the predefined style definitions in the DecorAI system
