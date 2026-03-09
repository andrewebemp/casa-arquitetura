# Task: Generate ASCII Floor Plan Using 3-Turn Technique

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | generate-croqui |
| **status** | `pending` |
| **responsible_executor** | @spatial-analyst |
| **execution_type** | `Agent` |
| **input** | Validated spatial data (from analyze-photo or parse-dimensions) |
| **output** | User-approved ASCII floor plan with annotated dimensions |
| **action_items** | 9 steps |
| **acceptance_criteria** | 9 criteria |

## Purpose

Generate an ASCII floor plan (croqui) of the analyzed space using the mandatory 3-turn technique: draft, iterate with user corrections, and confirm final version. The croqui serves as the spatial contract between the user and the pipeline -- no rendering proceeds without an approved croqui (FR-29, FR-30, FR-31). This is the critical validation checkpoint before handoff to @staging-architect.

## Inputs

- Spatial data from `analyze-photo` or `parse-dimensions` tasks (dimension table, element inventory)
- Room type classification
- Structural elements list with positions
- Furniture list with positions (if any)
- Orientation data (confirmed or inferred)

## Preconditions

- At least one spatial analysis task has been completed (analyze-photo OR parse-dimensions)
- Minimum data available: room length, room width, at least 1 structural element
- No unresolved conflicts between data sources (conflicts must be resolved first via validate-spatial-consistency)

## Steps

1. **Prepare spatial data for rendering**
   - Collect all validated dimensions from prior analysis
   - Sort elements by type: structural first, then furniture
   - Calculate proportional scale for ASCII representation
   - Determine optimal character grid size (min 40x20, max 80x40)

2. **TURN 1: Generate draft croqui**
   - Draw room perimeter using box-drawing characters
   - Annotate external dimensions on borders (length, width)
   - Place structural elements (doors, windows) with correct symbols
   - Place furniture items with labels and dimensions
   - Add orientation indicator (N arrow) if known
   - Mark uncertain elements with "?" symbol
   - Add ceiling height annotation below the croqui
   - Include legend explaining all symbols used
   - Character set: horizontal, vertical, corners (TL/TR/BL/BR), door (----), window (====)

3. **Present draft to user**
   - Display the draft croqui clearly
   - Highlight elements marked as uncertain
   - List specific validation questions:
     - Are estimated dimensions close to reality?
     - Is orientation correct?
     - Are there elements not shown that exist in the room?
     - Are furniture positions correct?
   - State average confidence level of the spatial model

4. **TURN 2: Collect and apply corrections**
   - Receive user feedback on the draft
   - Parse corrections: dimension changes, element additions/removals, position adjustments
   - Apply ALL corrections to the spatial model
   - Resolve any remaining "?" elements based on user input
   - If new conflicts arise, resolve immediately with follow-up questions

5. **Generate corrected croqui**
   - Redraw the croqui with all corrections applied
   - Update dimension annotations
   - Remove resolved "?" markers
   - Add any new elements specified by the user
   - Recalculate confidence score (should increase after corrections)

6. **Present corrected version**
   - Display the corrected croqui
   - Show a diff summary of what changed from draft
   - Ask if any further corrections are needed
   - If minor corrections, apply and re-present
   - If major corrections, loop back to step 4

7. **TURN 3: Generate final croqui**
   - Produce clean, final version of the croqui
   - All dimensions confirmed, no "?" markers remaining
   - Formatting polished and aligned
   - Complete legend included

8. **Request explicit approval**
   - Present final croqui to user
   - Request explicit confirmation ("Confirma este croqui?")
   - Do NOT proceed without affirmative response (FR-31)
   - If user requests changes, loop back to step 4

9. **Prepare handoff package**
   - Generate structured YAML handoff data containing:
     - Room type, dimensions, area, ceiling height, orientation
     - All structural elements with positions and dimensions
     - All furniture with positions and dimensions
     - Confidence score
     - Number of croqui turns completed
     - User approval status
   - Mark task as ready for @staging-architect handoff

## Outputs

- **Draft croqui** (Turn 1) with validation questions
- **Corrected croqui** (Turn 2) with diff summary
- **Final approved croqui** (Turn 3) with clean formatting
- **Handoff YAML package** for @staging-architect containing all spatial data
- **Validation summary table** confirming all checks passed

## Acceptance Criteria

- [ ] 3-turn protocol completed: draft generated, corrections applied, final confirmed
- [ ] All structural elements (doors, windows, columns) present in the croqui
- [ ] Dimensions annotated on external borders of the croqui
- [ ] Box-drawing characters used correctly for walls, doors, windows
- [ ] No unresolved "?" markers remain in the final croqui
- [ ] Ceiling height annotated below the croqui
- [ ] Legend included explaining all symbols
- [ ] Explicit user approval obtained before marking as complete (FR-31)
- [ ] Handoff YAML package generated with all spatial data for @staging-architect

## Quality Gate

- The 3-turn protocol is MANDATORY and cannot be skipped (FR-30)
- If user says "skip the croqui", explain it is required (FR-29) and generate quickly
- Final croqui must pass the "marceneiro test": a carpenter should be able to understand where every wall, door, window, and piece of furniture is, with sufficient dimensions
- Handoff package must contain minimum fields: room type, dimensions, ceiling_height, structural_elements, confidence, user_approval
- Confidence of final croqui should be >= 85% (user corrections elevate from photo-only estimates)
