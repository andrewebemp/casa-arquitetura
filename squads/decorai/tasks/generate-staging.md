# Task: Execute Full Staging Pipeline

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | generate-staging |
| **status** | `pending` |
| **responsible_executor** | @staging-architect |
| **execution_type** | `Agent` |
| **input** | Approved spatial data (handoff from @spatial-analyst) + selected style |
| **output** | Decorated room render (1024x1024 minimum) passing quality threshold |
| **action_items** | 12 steps |
| **acceptance_criteria** | 9 criteria |

## Purpose

Execute the full virtual staging pipeline from approved spatial analysis to decorated render. This is the core value-delivery task of DecorAI -- transforming an empty or existing room into a professionally designed interior visualization. The pipeline combines ControlNet for spatial conditioning, SDXL for generation, and style parameters from @interior-strategist to produce photorealistic results that respect the spatial constraints defined in the approved croqui.

## Inputs

- Approved handoff package from @spatial-analyst (YAML with dimensions, elements, croqui)
- Selected interior design style (from @interior-strategist or user choice)
- Style prompt with ControlNet parameters (from @interior-strategist generate-style-prompt)
- Original photo of the room (for ControlNet conditioning)
- Optional: reference images for style inspiration
- Optional: specific furniture/element requests from user

## Preconditions

- Spatial analysis handoff package received with `user_approval: true`
- Croqui has been approved through 3-turn protocol (FR-31)
- Interior style has been selected (one of 10 predefined styles or custom)
- GPU provider available and responsive (fal.ai, Replicate, or Modal)

## Steps

1. **Validate handoff package**
   - Confirm spatial data has `user_approval: true`
   - Verify all required fields present: room type, dimensions, structural_elements
   - Confirm croqui_turns_completed >= 3
   - If validation fails, return to @spatial-analyst for completion

2. **Generate depth map from spatial data**
   - Use Depth Anything V2 or ZoeDepth on the original photo
   - Validate depth map against known dimensions from spatial analysis
   - Ensure structural elements (doors, windows) are correctly represented in depth
   - Save depth map as ControlNet conditioning input

3. **Generate segmentation mask**
   - Use SAM 2 or OneFormer ADE20K to segment the room
   - Identify segments: walls, floor, ceiling, doors, windows, furniture
   - Create labeled segmentation map for targeted style application
   - Validate segments match spatial analysis element inventory

4. **Prepare ControlNet conditioning stack**
   - Depth map conditioning (spatial structure preservation)
   - Segmentation conditioning (element-specific styling)
   - Edge/canny conditioning (architectural line preservation) if needed
   - Set conditioning weights: depth 0.8-1.0, segmentation 0.4-0.7, canny 0.3-0.5

5. **Compose style-conditioned prompt**
   - Receive style prompt from @interior-strategist or generate from style preset
   - Include: room type, style name, key materials, lighting mood, color palette
   - Add negative prompt: deformations, artifacts, unrealistic proportions
   - Include spatial constraints: "room with [dimensions], [structural elements]"

6. **Configure generation parameters**
   - Model: SDXL or FLUX.2 via GPU provider
   - Resolution: 1024x1024 (will upscale later)
   - Steps: 30-50 for SDXL, 25-35 for FLUX
   - CFG Scale: 7.0-9.0 (higher for stronger style adherence)
   - Seed: random for first generation, preserve for iterations
   - ControlNet models: depth + segmentation stack

7. **Execute generation**
   - Submit generation job to GPU provider (fal.ai primary)
   - Monitor progress and handle timeouts (max 120s per generation)
   - Retry once on failure with adjusted parameters
   - Log generation time and cost for @pipeline-optimizer metrics

8. **Initial quality check**
   - Verify render resolution matches target (1024x1024)
   - Check for obvious artifacts: deformed furniture, floating objects, broken walls
   - Validate structural elements are preserved: doors and windows visible and correct
   - Verify style adherence: colors, materials match requested style
   - If quality fails, adjust parameters and re-generate (max 3 attempts)

9. **Apply post-processing**
   - Color correction and white balance adjustment
   - Contrast enhancement for photorealism
   - Sharpen details without introducing artifacts

10. **Submit to quality validation**
    - Send render to @visual-quality-engineer for benchmark scoring
    - Required scores: FID < 150, SSIM > 0.65, CLIP Score > 0.25
    - If scores fail, identify weak areas and re-generate with adjustments

11. **Prepare render for presentation**
    - Add subtle watermark (if applicable)
    - Generate before/after comparison if original photo available
    - Create render metadata: style, parameters, generation time, quality scores

12. **Present to user**
    - Display rendered image with style description
    - Show before/after comparison
    - Offer refinement options: "change furniture", "adjust colors", "try different style"
    - Route refinement requests to @conversational-designer

## Outputs

- **Rendered room image** (1024x1024 minimum, photorealistic quality)
- **Before/after comparison** (if original photo available)
- **Render metadata** (style, parameters, generation time, quality scores, cost)
- **Depth map** and **segmentation mask** (preserved for refinement iterations)
- **Generation seed** (preserved for reproducibility)

## Acceptance Criteria

- [ ] Handoff package validated with user_approval: true and croqui_turns >= 3
- [ ] Depth map generated and validated against spatial analysis dimensions
- [ ] ControlNet conditioning stack configured with appropriate weights
- [ ] Render generated at minimum 1024x1024 resolution
- [ ] Structural elements (doors, windows) preserved in the render
- [ ] Style matches the selected interior design style (colors, materials, mood)
- [ ] No visible artifacts: deformed furniture, floating objects, broken geometry
- [ ] Quality scores meet thresholds: FID < 150, SSIM > 0.65, CLIP Score > 0.25
- [ ] Render presented to user with refinement options

## Quality Gate

- Generation must NOT proceed without approved croqui (FR-31 enforcement)
- Maximum 3 generation attempts before escalating quality issues to @visual-quality-engineer
- Each generation must log time and cost for infrastructure optimization
- Structural elements from the croqui MUST be visible in the final render
- If GPU provider is unavailable, failover to secondary provider before reporting error
- Seed must be preserved so user can request variations on a successful generation
