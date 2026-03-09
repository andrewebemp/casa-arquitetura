# Task: Validate Individual Render Meets Quality Threshold

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | validate-render-quality |
| **status** | `pending` |
| **responsible_executor** | @visual-quality-engineer |
| **execution_type** | `Agent` |
| **input** | Single render image + generation metadata + spatial data |
| **output** | Quality validation verdict (pass/fail) with score and issue list |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Validate that an individual render meets the minimum quality threshold before presenting it to the user. This is the quality gate between generation and delivery -- every render must pass this checkpoint. Unlike the comprehensive benchmark (run-quality-benchmark), this task is designed for speed: a quick automated check that catches obvious quality issues without the full benchmark suite. It serves as the primary quality assurance step in the staging pipeline, ensuring users never see substandard renders.

## Inputs

- Single render image from @staging-architect
- Generation metadata (prompt, parameters, ControlNet config)
- Spatial data from @spatial-analyst (for structural element verification)
- Style specification (for style adherence check)
- Quality thresholds (configurable, default: production thresholds)

## Preconditions

- Render image generated and available
- Generation metadata accessible
- Spatial data available for structural validation
- Quick-validation models loaded (CLIP, basic quality metrics)

## Steps

1. **Resolution and format check**
   - Verify output resolution >= 1024x1024
   - Verify correct color space (RGB, 8-bit per channel)
   - Check for corruption or incomplete rendering
   - Verify file size within expected range (not suspiciously small)

2. **Automated artifact scan**
   - Check for common generation artifacts:
     - Large uniform color patches (failed generation)
     - Excessive noise or grain
     - Visible seam lines (tiling artifacts)
     - Extreme brightness/darkness (> 90% pixels above 240 or below 15)
   - Use edge detection to verify structural coherence
   - Flag any detected issues with severity level

3. **Structural element verification**
   - Compare render against spatial data:
     - Are doors visible where the croqui shows them?
     - Are windows present at expected positions?
     - Is the room shape consistent with the croqui?
   - Use object detection or CLIP to verify element presence
   - Flag missing or extra structural elements

4. **Style adherence check**
   - Compute CLIP Score between render and style prompt
   - Verify color palette alignment with style specification
   - Check furniture style consistency (modern furniture in modern room)
   - Threshold: CLIP Score > 0.25 for acceptable style match

5. **Physical plausibility check**
   - Verify perspective consistency (vanishing points make sense)
   - Check gravity: no floating furniture or objects
   - Verify lighting consistency: shadows point in reasonable direction
   - Check furniture proportions: chair not taller than door, table not larger than room

6. **Generate quick quality score**
   - Compute lightweight quality score (0-100):
     - Resolution/format: 10 points
     - Artifact-free: 25 points
     - Structural accuracy: 25 points
     - Style adherence: 20 points
     - Physical plausibility: 20 points
   - Verdict thresholds:
     - PASS: >= 75 points, no critical issues
     - REVIEW: 50-74 points, minor issues present
     - FAIL: < 50 points or any critical issue

7. **Return validation result**
   - If PASS: approve for user presentation, log quality score
   - If REVIEW: flag issues, approve with caveats, suggest improvements
   - If FAIL: block presentation, return to @staging-architect with issue list
   - Include processing time in result (target: < 10 seconds total)

## Outputs

- **Quality Verdict** (PASS/REVIEW/FAIL) with numeric score (0-100)
- **Issue List** detailing any detected problems with severity
- **CLIP Score** for style adherence measurement
- **Structural Check Result** confirming element presence/absence
- **Processing Time** for performance tracking

## Acceptance Criteria

- [ ] Resolution and format verified against minimum requirements
- [ ] Automated artifact scan completed with no critical artifacts in PASS renders
- [ ] Structural elements verified against spatial data (doors, windows present)
- [ ] Style adherence measured with CLIP Score >= 0.25 for PASS verdict
- [ ] Physical plausibility checked (no floating objects, consistent perspective)
- [ ] Numeric quality score calculated (0-100) with clear thresholds
- [ ] Validation completed within 10 seconds processing time

## Quality Gate

- This check must run on EVERY render before user presentation -- no bypassing
- FAIL verdict must block presentation entirely -- never show a failed render to the user
- REVIEW verdict allows presentation but must include a note to @staging-architect about issues
- Processing time must not exceed 10 seconds (this is a quick gate, not full benchmark)
- If validation repeatedly fails for the same room/style combination, escalate to diagnose-artifacts
- Quality score must be logged for every render to track platform quality trends over time
