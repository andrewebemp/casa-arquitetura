# Task: Segment and Replace Individual Element Using SAM

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | segment-element |
| **status** | `pending` |
| **responsible_executor** | @staging-architect |
| **execution_type** | `Agent` |
| **input** | Rendered image + element to replace (wall, floor, counter, cabinet) + replacement specification |
| **output** | Edited render with specified element replaced while preserving rest of scene |
| **action_items** | 9 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Segment a specific element from a rendered room image and replace it with a different material, color, or design while preserving the rest of the scene. Uses SAM 2 (Segment Anything Model) for precise segmentation and inpainting for seamless replacement. This enables targeted edits like "change the floor to wood" or "make the walls white" without regenerating the entire scene (FR-07, FR-08).

## Inputs

- Rendered room image (source for segmentation)
- Element to segment: wall, floor, ceiling, counter, cabinet, door, or custom region
- Replacement specification: new material, color, texture, or style description
- Optional: reference image for the replacement material
- Original depth map and segmentation mask from generation

## Preconditions

- A rendered image exists for the room (from generate-staging)
- Element to replace is identifiable in the image
- Replacement specification is clear (material and/or color)
- SAM model available via GPU provider

## Steps

1. **Identify target element**
   - Parse user instruction to identify which element to replace
   - Map to segmentation category: wall, floor, ceiling, counter, cabinet, door, window frame
   - If ambiguous (e.g., "change the surface"), ask for clarification
   - If multiple instances exist (e.g., multiple walls), confirm which one

2. **Generate precise segmentation mask**
   - Use SAM 2 to segment the target element from the image
   - If using prior segmentation mask, refine it for the specific element
   - Use Grounded-SAM-2 if element needs text-based identification
   - Validate mask covers the correct area (no under/over-segmentation)
   - Handle edge cases: element partially occluded by furniture

3. **Prepare replacement prompt**
   - Compose inpainting prompt describing the replacement:
     - Material: "oak wood flooring", "white marble countertop"
     - Color: "warm beige walls", "navy blue accent wall"
     - Texture: "matte finish", "polished surface"
   - Include context from surrounding elements for seamless blending
   - Add lighting consistency keywords matching the rest of the scene

4. **Configure inpainting parameters**
   - Mask: segmentation mask from step 2
   - Inpainting model: SDXL inpainting or specialized model
   - Denoising strength: 0.6-0.8 (preserve geometry, change surface)
   - Ensure ControlNet depth conditioning maintains spatial structure
   - CFG Scale aligned with original generation

5. **Execute element replacement**
   - Run inpainting on the masked region
   - Generate 2-3 variations for user choice
   - Ensure replacement blends seamlessly with surrounding elements
   - Preserve shadows and lighting consistent with the scene

6. **Validate replacement quality**
   - Check edge blending: no visible seams between replaced and original areas
   - Verify material appearance matches specification
   - Confirm lighting and shadow consistency
   - Ensure no artifacts introduced at mask boundaries
   - Verify surrounding elements are completely unchanged

7. **Apply post-processing**
   - Blend edges using feathered mask if needed
   - Match color temperature between replaced and original areas
   - Adjust brightness/contrast for consistency
   - Apply subtle grain/texture matching

8. **Generate comparison view**
   - Create before/after comparison highlighting the change
   - Annotate what was changed and what was preserved
   - Show the segmentation mask used (for transparency)

9. **Present result and offer further edits**
   - Display the edited render
   - Show variations if multiple were generated
   - Offer to adjust the replacement (lighter, darker, different material)
   - Offer to replace additional elements in the same image

## Outputs

- **Edited render** with element replaced (1024x1024 minimum)
- **Segmentation mask** used for the edit (for documentation and further edits)
- **Before/after comparison** highlighting the change
- **2-3 variations** of the replacement for user choice
- **Edit metadata** (element replaced, replacement spec, parameters)

## Acceptance Criteria

- [ ] Target element correctly identified and mapped to segmentation category
- [ ] SAM segmentation mask accurately covers the target element (no under/over-segmentation)
- [ ] Replacement material/color matches the user specification
- [ ] Edge blending is seamless with no visible seams at mask boundaries
- [ ] Lighting and shadows remain consistent with the rest of the scene
- [ ] Surrounding elements are completely unchanged (pixel-level preservation)
- [ ] At least 2 variations generated for user choice
- [ ] Before/after comparison generated showing the change

## Quality Gate

- Segmentation mask must be validated before inpainting -- if mask is incorrect, re-segment before proceeding
- Edge artifacts at mask boundaries are a critical failure -- must be resolved before presenting to user
- Color temperature of replacement must match the scene (no cold white wall in a warm-toned room)
- If the element to replace is partially occluded by furniture, document the limitation and handle gracefully
- Original render must be preserved (non-destructive editing) -- never overwrite the source image
