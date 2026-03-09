# Task: Remove Unwanted Objects Using Inpainting

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | remove-object |
| **status** | `pending` |
| **responsible_executor** | @staging-architect |
| **execution_type** | `Agent` |
| **input** | Room image + object(s) to remove |
| **output** | Clean image with objects removed and background seamlessly filled |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Remove unwanted objects from room images using inpainting techniques (LaMa or Inpaint-Anything). Common use cases include removing existing furniture from empty-room staging photos, removing clutter before applying virtual staging, or cleaning up distracting elements. The removed area must be filled with contextually appropriate content (wall continuation, floor pattern, etc.) that blends seamlessly with the surrounding image.

## Inputs

- Room image containing objects to remove
- Identification of objects to remove (text description or point/region indication)
- Optional: specification of what should fill the removed area
- Original depth map (if available, helps with fill accuracy)

## Preconditions

- Image provided with at least one object identified for removal
- Object is visible and identifiable in the image
- Inpainting model available via GPU provider (LaMa or SDXL inpainting)

## Steps

1. **Identify objects for removal**
   - Parse user instruction to identify target objects
   - If description is vague ("remove the stuff on the table"), ask for clarification
   - List all objects identified for removal with positions
   - Confirm removal list with user if multiple objects detected

2. **Generate removal masks**
   - Use SAM 2 or Grounded-SAM-2 to segment each object
   - Create individual masks for each object
   - Expand masks slightly (2-5 pixels) for clean edge coverage
   - Handle overlapping objects: determine removal order
   - If objects are touching walls/floor, include small overlap for clean fill

3. **Analyze background context**
   - Identify what should fill each removed area based on surroundings
   - Wall continuation: match color, texture, and lighting
   - Floor continuation: match material pattern and perspective
   - Ceiling continuation: match color and lighting gradient
   - Use depth map to understand spatial structure behind removed objects

4. **Configure inpainting**
   - Model selection: LaMa for simple fills (walls, floors), SDXL inpainting for complex fills
   - Mask: combined or sequential masks depending on object proximity
   - For LaMa: no prompt needed (context-aware fill)
   - For SDXL inpainting: compose fill prompt based on surrounding context
   - Denoising strength: 0.7-0.9 for full replacement of removed area

5. **Execute removal (sequential for overlapping objects)**
   - Process objects in back-to-front order (farthest from camera first)
   - For each object: apply mask, run inpainting, validate fill
   - Preserve non-masked areas exactly (pixel-perfect)
   - If fill quality is poor, retry with adjusted parameters (max 2 retries per object)

6. **Post-process fills**
   - Blend edges using feathered transition
   - Match floor/wall patterns across fill boundaries
   - Correct lighting gradients in filled areas
   - Remove any residual shadows from removed objects
   - Ensure texture consistency (grain, pattern repeat)

7. **Validate removal quality**
   - Check for ghost artifacts (faint outlines of removed objects)
   - Verify fill pattern continuity (floor tiles align, wall color matches)
   - Confirm no new objects hallucinated in the fill area
   - Ensure overall image coherence (no uncanny-valley effect)

8. **Present clean image**
   - Show before/after comparison
   - Highlight what was removed and how the area was filled
   - Offer to remove additional objects
   - If image is now empty room, suggest proceeding to generate-staging

## Outputs

- **Clean image** with objects removed and areas filled (same resolution as input)
- **Removal masks** documenting what was removed
- **Before/after comparison** showing the changes
- **Fill documentation** explaining what was used to fill each area

## Acceptance Criteria

- [ ] All specified objects successfully removed from the image
- [ ] Filled areas match surrounding context (wall color, floor pattern, lighting)
- [ ] No ghost artifacts or faint outlines of removed objects
- [ ] No new objects hallucinated in the filled areas
- [ ] Edge blending is seamless with no visible mask boundaries
- [ ] Non-removed areas are pixel-perfect preserved
- [ ] Before/after comparison generated showing all changes

## Quality Gate

- Ghost artifacts are a critical failure -- if visible outlines remain, re-process with expanded mask
- Floor pattern alignment is mandatory -- misaligned tiles or planks must be fixed
- Shadow removal is required -- shadows from removed objects must be eliminated
- Maximum 3 inpainting attempts per object before escalating to manual mask adjustment
- Original image must be preserved (non-destructive) -- always work on a copy
- If object removal would expose structural inconsistencies (e.g., wall behind furniture was never rendered), document limitation
