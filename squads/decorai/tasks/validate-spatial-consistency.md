# Task: Cross-Validate Dimensions Between Multiple Input Sources

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | validate-spatial-consistency |
| **status** | `pending` |
| **responsible_executor** | @spatial-analyst |
| **execution_type** | `Agent` |
| **input** | Spatial data from multiple sources (photo, text, reference) |
| **output** | Consistency report with conflict resolution recommendations |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Cross-validate dimensional data when multiple input sources are available (photo analysis + textual description + reference images). Divergences between sources are opportunities for clarification, not reasons to guess. This task ensures the spatial model is consistent and reliable before croqui generation, implementing FR-26 (combination of multiple inputs).

## Inputs

- Spatial data from photo analysis (analyze-photo output)
- Spatial data from textual parsing (parse-dimensions output)
- Optional: reference images or floor plans
- Optional: user-provided measurements from physical measurement tools

## Preconditions

- At least TWO different input sources have been processed
- Each source has produced structured dimensional data
- No prior cross-validation has been performed for this space

## Steps

1. **Collect all dimensional data sources**
   - Gather outputs from analyze-photo (if available)
   - Gather outputs from parse-dimensions (if available)
   - Gather any reference image data (if available)
   - Normalize all measurements to consistent units (meters)

2. **Build comparison matrix**
   - Create table with rows = dimensions, columns = sources
   - For each dimension, record: value, confidence, source
   - Identify dimensions present in multiple sources
   - Identify dimensions present in only one source

3. **Calculate divergence for overlapping dimensions**
   - For each dimension with multiple sources, calculate percentage divergence
   - Apply tolerance threshold: +/- 10% for estimated dimensions
   - Classify each comparison:
     - MATCH: divergence <= 10%
     - WARNING: divergence 10-20%
     - CONFLICT: divergence > 20%

4. **Analyze conflict patterns**
   - If systematic offset detected (all photo estimates smaller), identify probable cause:
     - Wide-angle lens distortion
     - Measurement includes/excludes specific elements (e.g., countertop area)
     - Conversion error (feet vs meters)
   - Document probable cause for each conflict

5. **Apply resolution priority rules**
   - Rule 1: User-provided measurement with tool > photo estimate
   - Rule 2: Photo evidence > vague text without numbers
   - Rule 3: When both have measurements and diverge > 20% -> ASK user
   - For each conflict, determine resolution action

6. **Generate consistency report**
   - Comparison table with all dimensions across sources
   - Divergence percentages with color-coded status (MATCH/WARNING/CONFLICT)
   - Probable causes for conflicts
   - Resolution recommendations
   - Overall consistency score (% of dimensions that match)

7. **Prepare clarification questions**
   - For each unresolved CONFLICT, formulate specific question for user
   - Provide both values and ask which is correct
   - Suggest verification methods (e.g., "measure with a step ~0.75m")
   - Maximum 4 questions per round to avoid overwhelming user

## Outputs

- **Comparison Matrix** showing all dimensions across all sources
- **Divergence Report** with percentage calculations and status classification
- **Conflict Analysis** with probable causes and resolution recommendations
- **Clarification Questions** (max 4) for unresolved conflicts
- **Overall Consistency Score** (percentage of matching dimensions)
- **Resolved Dimension Set** (unified data after applying priority rules)

## Acceptance Criteria

- [ ] All dimensions from all sources compared in a structured matrix
- [ ] Divergence percentages calculated for every overlapping dimension
- [ ] Tolerance threshold of +/- 10% correctly applied
- [ ] Each conflict has a documented probable cause
- [ ] Resolution priority rules applied correctly (user measurement > photo > vague text)
- [ ] Unresolved conflicts generate specific clarification questions (max 4)
- [ ] Overall consistency score calculated and reported

## Quality Gate

- NEVER assume which source is correct when divergence exceeds 20% -- always ask the user
- If a photo shows an element not mentioned in text, INFORM user and add to spatial model
- If text mentions an element not visible in photo, MARK with "?" in spatial model
- Consistency score below 60% should trigger a warning recommending additional measurements
- No conflicts may remain unresolved when this task is marked complete -- all must be resolved or escalated to user
- Output format must follow the cross-validation example in spatial-analyst agent definition
