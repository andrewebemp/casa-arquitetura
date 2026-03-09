# Task: Diagnose and Fix Visual Artifacts in Generated Renders

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | diagnose-artifacts |
| **status** | `pending` |
| **responsible_executor** | @visual-quality-engineer |
| **execution_type** | `Agent` |
| **input** | Render with visible artifacts + generation metadata |
| **output** | Artifact diagnosis with root cause and remediation plan |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Diagnose the root cause of visual artifacts in generated renders and prescribe specific fixes. AI-generated interior images can exhibit various artifact types: deformed furniture, floating objects, broken geometry, unrealistic textures, inconsistent lighting, and repetitive patterns. Each artifact type has specific causes (prompt issues, ControlNet misconfiguration, model limitations, insufficient conditioning) and specific remedies. This task systematically identifies, classifies, and resolves these quality issues.

## Inputs

- Render image with visible artifacts
- Generation metadata: prompt, negative prompt, ControlNet parameters, model, seed, steps, CFG
- Depth map and segmentation mask used during generation
- User complaint description (if available)
- Quality benchmark results (from run-quality-benchmark, if available)

## Preconditions

- Artifact has been reported (by user, by quality benchmark, or by staging-architect quality check)
- Generation metadata is available for analysis
- Access to the generation pipeline for re-generation with adjusted parameters

## Steps

1. **Visual artifact identification**
   - Scan render for common artifact categories:
     - Geometric: deformed furniture, impossible angles, broken walls
     - Physical: floating objects, interpenetrating objects, incorrect shadows
     - Texture: repetitive patterns, blurry areas, mismatched materials
     - Lighting: inconsistent light direction, unrealistic reflections, dark spots
     - Structural: missing doors/windows, extra doors/windows, broken floors
     - Human-specific: if people present, deformed hands/faces
   - Locate each artifact's position in the image
   - Classify severity: minor (subtle), moderate (noticeable), critical (unusable)

2. **Root cause analysis per artifact type**
   - Geometric deformation: usually CFG too high (> 10) or insufficient ControlNet depth weight
   - Floating objects: ControlNet depth map incorrect or weight too low
   - Repetitive textures: model limitation, try different seed or reduce repetition in prompt
   - Inconsistent lighting: multiple conflicting lighting keywords in prompt
   - Missing structural elements: ControlNet segmentation not properly applied
   - Blurry areas: insufficient steps or denoising strength too high for inpainting
   - Map each artifact to its most probable cause

3. **Analyze generation parameters**
   - Review prompt for contradictory or problematic keywords
   - Check ControlNet weights: too low = artifacts, too high = over-constrained
   - Evaluate CFG Scale: too high = oversaturated/deformed, too low = incoherent
   - Check step count: too few = undercooked, too many = overprocessed
   - Examine depth map accuracy: does it match the actual spatial data?
   - Compare segmentation mask with the actual render

4. **Prescribe remediation**
   - For each identified artifact, prescribe specific fix:
     - Parameter adjustment: change CFG, steps, ControlNet weight
     - Prompt modification: add/remove keywords, restructure prompt
     - Conditioning fix: regenerate depth map, fix segmentation mask
     - Post-processing: targeted inpainting on artifact region only
     - Model change: switch generation model (SDXL -> FLUX or vice versa)
     - Seed variation: keep parameters, change seed for different generation path

5. **Prioritize fixes by impact**
   - Rank fixes by: expected quality improvement vs effort/cost
   - Quick wins: seed change, minor prompt adjustment
   - Medium effort: ControlNet weight tuning, CFG adjustment
   - High effort: depth map regeneration, model switch
   - Recommend execution order: quick wins first

6. **Execute remediation (if authorized)**
   - Apply the highest-priority fix
   - Re-generate with adjusted parameters
   - Compare before/after to verify fix effectiveness
   - If artifact persists, escalate to next remediation option
   - Maximum 3 remediation attempts before declaring model limitation

7. **Document artifact pattern**
   - Log artifact type, cause, and effective fix
   - Build artifact knowledge base for future prevention
   - Identify recurring patterns that suggest systemic issues
   - Recommend pipeline-level changes to prevent future occurrences

8. **Generate diagnosis report**
   - Artifact inventory with locations, types, and severities
   - Root cause analysis for each artifact
   - Remediation applied and results
   - Recommendations for prevention
   - Updated quality benchmark after fixes

## Outputs

- **Artifact Inventory** with locations, types, severities, and root causes
- **Root Cause Analysis** mapping each artifact to generation parameters
- **Remediation Plan** with prioritized fixes
- **Before/After Comparison** (if fixes applied)
- **Prevention Recommendations** for pipeline-level improvements
- **Updated Quality Benchmark** (after remediation)

## Acceptance Criteria

- [ ] All visible artifacts identified, located, and classified by type and severity
- [ ] Root cause determined for each artifact (mapped to specific parameter or condition)
- [ ] Remediation prescribed for each artifact with expected impact
- [ ] Fixes prioritized by impact-to-effort ratio
- [ ] If remediation executed, before/after comparison shows measurable improvement
- [ ] Artifact pattern documented for future prevention
- [ ] Diagnosis report compiled with all findings and recommendations

## Quality Gate

- Every artifact must have a root cause hypothesis -- "unknown" is not acceptable without investigation
- Remediation must target the cause, not the symptom (don't inpaint over a depth map issue)
- Maximum 3 remediation cycles per artifact before escalating or accepting as model limitation
- If artifact is a model limitation (reproducible across seeds), document clearly and recommend workaround
- Artifact knowledge base must be updated with each new diagnosis
- Critical severity artifacts (unusable render) must trigger immediate re-generation
