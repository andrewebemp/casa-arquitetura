# Task: Analyze Uploaded Photo for Spatial Information

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | analyze-photo |
| **status** | `pending` |
| **responsible_executor** | @spatial-analyst |
| **execution_type** | `Agent` |
| **input** | Uploaded photo of a room/environment |
| **output** | Structured spatial report with dimensions, layout, structural elements |
| **action_items** | 10 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Analyze an uploaded photo of a room or environment to extract spatial information including estimated dimensions, layout configuration, and structural elements (doors, windows, columns). This is the primary entry point for photo-based projects in the DecorAI pipeline and must produce a reliable spatial model before any design work begins.

## Inputs

- Uploaded photo of a room (any angle, any resolution)
- Optional: additional photos of the same room from different angles
- Optional: user-provided context (room type, approximate size)

## Preconditions

- At least one photo must be provided
- Photo must show an interior space (not exterior)
- Photo must have sufficient lighting to identify elements
- No croqui or staging work has started for this space (Tier 0 must run first)

## Steps

1. **Receive and validate photo input**
   - Confirm photo shows an interior space
   - Assess photo quality (lighting, resolution, angle)
   - If quality is insufficient, request a better photo with specific guidance

2. **Stage 1 - Semantic Perception (Saining Xie)**
   - Identify ALL visible elements: walls, doors, windows, furniture, fixtures
   - Classify each element as structural (immutable) or movable (relocatable)
   - Record position of each element relative to visible walls
   - Note materials and textures where identifiable

3. **Stage 2 - Streaming Event Cognition**
   - If multiple photos provided, cross-reference elements across photos
   - Build cumulative model enriching understanding with each additional photo
   - Maintain context between analysis rounds

4. **Stage 3 - Implicit 3D Spatial Cognition**
   - Identify reference objects for scale estimation (doors, outlets, baseboards)
   - Prioritize reference objects: door > outlet/switch > baseboard > furniture
   - Calculate pixels-per-meter scale factor from best reference object
   - Estimate dimensions not directly visible (depth, wall continuations)

5. **Estimate room dimensions**
   - Apply scale factor to estimate length, width, ceiling height
   - Estimate opening dimensions (doors, windows)
   - Calculate sill heights for windows
   - Assign confidence level (%) to each measurement

6. **Stage 4 - Predictive World Modeling**
   - Construct coherent spatial model of the complete room
   - Fill in non-visible areas with plausible estimates
   - Verify physical plausibility (no dimension > 20m residential, ceiling 2.4m-4.0m)

7. **Detect orientation**
   - Analyze natural lighting direction if visible
   - Infer probable cardinal orientation (strong light = north/east morning, west afternoon)
   - Mark orientation as confirmed or inferred with "(?)"

8. **Generate structured spatial report**
   - Create element inventory table with type, position, confidence
   - Create dimension estimation table with measurements and method used
   - Flag uncertain elements with "?"

9. **Generate preliminary ASCII croqui**
   - Create draft floor plan based on extracted data
   - Annotate dimensions on borders
   - Mark structural elements (doors, windows)
   - Include legend explaining symbols

10. **Present findings and request validation**
    - Show spatial report and preliminary croqui to user
    - Ask specific validation questions about uncertain elements
    - Explain confidence levels and request corrections

## Outputs

- **Spatial Report** containing:
  - Element inventory table (type, classification, position, confidence)
  - Dimension estimation table (measurement, confidence, method)
  - Reference object used for scale
  - Orientation assessment
- **Preliminary ASCII croqui** (draft, not yet confirmed)
- **Validation questions** for the user to confirm/correct estimates
- **Confidence score** (weighted average of all dimension confidences)

## Acceptance Criteria

- [ ] All visible structural elements (doors, windows, columns) identified and classified
- [ ] At least one reference object identified for scale estimation
- [ ] All dimensions estimated with explicit confidence percentage declared
- [ ] Confidence levels use correct ranges: photo with door ref (75-85%), photo without clear ref (50-65%)
- [ ] Physical plausibility validated (no residential dimension > 20m, ceiling 2.4-4.0m)
- [ ] Preliminary ASCII croqui generated with annotated dimensions
- [ ] Uncertain elements marked with "?" symbol
- [ ] Specific validation questions presented to user for confirmation

## Quality Gate

- Spatial report must contain at minimum: room type, 2 dimension estimates, 1 structural element
- Confidence score must be calculated and displayed
- No dimension may be presented without an associated confidence level
- If photo quality is too poor for reliable analysis (average confidence < 50%), task must request additional photos before proceeding
- Report format must match the output_examples defined in spatial-analyst agent definition
