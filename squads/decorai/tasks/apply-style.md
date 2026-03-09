# Task: Apply Predefined Style to Room Render

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | apply-style |
| **status** | `pending` |
| **responsible_executor** | @staging-architect |
| **execution_type** | `Agent` |
| **input** | Existing render or spatial data + style selection (1 of 10 predefined) |
| **output** | Room render in the selected style |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Apply one of the 10 predefined interior design styles to a room render. This task handles style switching -- when a user wants to see the same room in a different style, or when generating the initial render with a specific style choice. Each style has a defined prompt template, color palette, material preferences, and lighting characteristics provided by @interior-strategist.

## Inputs

- Room spatial data (from approved handoff or existing render metadata)
- Style selection: one of the 10 predefined styles (e.g., Moderno, Contemporaneo, Industrial, Minimalista, Escandinavo, Boho, Classico, Rustico, Mid-Century, Tropical)
- Existing depth map and segmentation mask (if available from prior render)
- Optional: user-specified customizations within the style

## Preconditions

- Room spatial data available (either from handoff or from a previous render)
- Style selection made by user or recommended by @interior-strategist
- Style prompt template available for the selected style
- GPU provider available

## Steps

1. **Load style definition**
   - Retrieve style guide from @interior-strategist for the selected style
   - Load prompt template with: color palette, materials, furniture types, lighting mood
   - Load negative prompt additions specific to the style
   - Identify any style-specific ControlNet weight adjustments

2. **Adapt style to room constraints**
   - Check room dimensions against style requirements (e.g., minimalism works in small rooms, classic needs space)
   - Adjust furniture density based on room area
   - Adapt material choices for room type (bathroom vs living room)
   - Note structural constraints that affect style application

3. **Compose styled prompt**
   - Base: room type + dimensions + structural elements
   - Style layer: color palette + material keywords + furniture descriptors
   - Mood layer: lighting type + ambiance keywords
   - Quality layer: "photorealistic, interior photography, high quality"
   - Negative: style-specific exclusions + general artifact prevention

4. **Configure style-specific parameters**
   - CFG Scale: adjust for style (minimalist: 7.0-8.0, classic: 8.0-9.5)
   - ControlNet weights: may vary by style (preserve more structure for minimalist, allow more freedom for boho)
   - Color temperature: warm (rustico, boho) vs cool (moderno, escandinavo)
   - IP-Adapter: use if reference images provided for style

5. **Generate styled render**
   - Execute generation with style-specific parameters
   - Use same depth map and segmentation from original analysis
   - Preserve structural elements while changing decor
   - Log generation parameters for reproducibility

6. **Validate style adherence**
   - Check color palette matches the style definition
   - Verify furniture types are consistent with the style
   - Confirm materials visible in render match style guide
   - Use CLIP Score to measure style-text alignment (target > 0.25)

7. **Generate style comparison**
   - If user is comparing styles, create side-by-side view
   - Highlight key differences between styles
   - Note which style works better for the room size and type

8. **Present and offer alternatives**
   - Display the styled render to user
   - Suggest 2-3 related styles if user is undecided
   - Offer element-level customization ("keep this style but change the floor")
   - Route customization requests to @conversational-designer

## Outputs

- **Styled room render** (1024x1024 minimum)
- **Style metadata** (style name, prompt used, parameters, CLIP score)
- **Style comparison** (if applicable, side-by-side with other styles)
- **Customization options** for the user

## Acceptance Criteria

- [ ] Style definition loaded with correct color palette, materials, and mood
- [ ] Style adapted to room constraints (size, type, structural elements)
- [ ] Prompt composed with style-specific keywords and parameters
- [ ] Render generated preserving structural elements from spatial analysis
- [ ] Color palette in render visually matches the style definition
- [ ] CLIP Score for style-text alignment >= 0.25
- [ ] Render presented with style description and customization options

## Quality Gate

- Style application must NOT alter structural elements (doors, windows remain in correct positions)
- If room is too small for selected style (e.g., Classic in a 4m2 bathroom), warn user and suggest alternatives
- Style switching must reuse the same depth map and segmentation -- no re-analysis required
- Maximum generation time: 90 seconds per style application
- If CLIP Score < 0.20, style adherence is insufficient -- regenerate with stronger style keywords
