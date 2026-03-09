# Task: Estimate Room Dimensions from Single Photo Using Depth Estimation

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | estimate-room-dimensions |
| **status** | `pending` |
| **responsible_executor** | @spatial-analyst |
| **execution_type** | `Agent` |
| **input** | Single photo of a room interior |
| **output** | Estimated room dimensions with confidence levels and reference object documentation |
| **action_items** | 8 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Estimate room dimensions from a single interior photograph using depth estimation techniques and reference object scaling. When users have no measurements and only a photo, this task applies the Spatial Intelligence framework (Fei-Fei Li) to extract dimensional data from visual cues. Reference objects with known standard dimensions (doors, outlets, baseboards) serve as scale anchors for converting pixel measurements to real-world meters.

## Inputs

- Single interior photo of the room
- Optional: user-stated room type (helps with plausibility validation)
- Optional: user identification of specific objects visible ("that's a standard door")

## Preconditions

- Photo shows at least one wall with identifiable reference objects
- Photo has sufficient resolution to distinguish elements (minimum ~640px on longest edge)
- Photo shows an interior residential or commercial space

## Steps

1. **Assess photo quality and angle**
   - Evaluate resolution, lighting, and distortion
   - Identify camera angle (straight, elevated, corner view)
   - Determine if wide-angle distortion is present (common in smartphone photos)
   - If quality is insufficient, request a better photo with guidance

2. **Identify reference objects (priority order)**
   - Priority 1: Standard residential door (2.10m height, 0.70-0.90m width) -- highest confidence
   - Priority 2: Electrical outlets/switches (outlet 0.30m from floor, switch 1.10m) -- high confidence
   - Priority 3: Baseboard/rodape (0.07-0.15m height) -- medium confidence
   - Priority 4: Standard windows (sill 1.00-1.20m from floor) -- medium confidence
   - Priority 5: Standard furniture (dining chair seat 0.45m, total 0.90-1.00m) -- medium confidence
   - Record all identified reference objects with pixel positions

3. **Establish scale factor**
   - Select the highest-priority reference object available
   - Measure reference object in pixels
   - Calculate scale factor: known_dimension_meters / pixel_measurement = meters_per_pixel
   - Apply perspective correction if object is not perpendicular to camera
   - Document: reference object, assumed dimension, calculated scale factor

4. **Estimate primary room dimensions**
   - Wall length (along camera axis): apply scale to visible wall span
   - Wall width (perpendicular): apply scale with perspective correction
   - Ceiling height: apply scale from floor to ceiling
   - Apply confidence based on reference object quality and perspective angle

5. **Estimate structural element dimensions**
   - Doors: width, height (if not used as reference)
   - Windows: width, height, sill height
   - Openings: archways, pass-throughs
   - Columns/pillars: width, depth

6. **Apply depth estimation heuristics**
   - Use perspective convergence to estimate room depth
   - Cross-reference with floor tile/plank patterns if visible (known standard sizes)
   - Use furniture proportions as secondary scale check
   - Apply human-scale heuristics if people visible in photo

7. **Validate physical plausibility**
   - Check all dimensions against residential ranges:
     - No single dimension > 20m
     - Ceiling height: 2.40m - 4.00m
     - Door width: 0.60m - 1.20m
     - Standard room proportions (length/width ratio typically 1.0 - 2.5)
   - Flag any dimension outside expected range for user confirmation

8. **Generate estimation report**
   - Dimension table with: measurement, estimated value, confidence %, method used
   - Reference object documentation: what was used, assumed standard dimension
   - Confidence explanation: why each estimate has its specific confidence level
   - Limitations disclaimer: margin of error for photo-based estimation (typically 15-25%)
   - Recommendations for improving accuracy (provide measurements, additional photos)

## Outputs

- **Dimension Estimation Table** with measurement, value, confidence, method
- **Reference Object Documentation** detailing which objects anchored the scale
- **Scale Factor Record** showing calculation methodology
- **Plausibility Validation** confirming all dimensions within expected ranges
- **Accuracy Improvement Recommendations** for the user

## Acceptance Criteria

- [ ] At least one reference object identified and documented with assumed standard dimension
- [ ] Scale factor calculated and documented with methodology
- [ ] Room length, width, and ceiling height estimated (minimum 3 dimensions)
- [ ] Each dimension has explicit confidence percentage (not vague qualifiers)
- [ ] Confidence ranges correctly applied: door-reference (75-85%), furniture-reference (65-80%), no-clear-reference (50-65%)
- [ ] All dimensions validated against physical plausibility ranges
- [ ] Perspective correction applied when reference object is not perpendicular to camera
- [ ] Estimation report includes limitations disclaimer with typical margin of error

## Quality Gate

- If no reference object is identifiable in the photo, confidence must be capped at 50% and user notified
- If wide-angle distortion detected, all estimates must note "corrected for wide-angle" or request undistorted photo
- Average confidence across all dimensions must be >= 60% to proceed; below 60% requires additional photos
- Dimensions flagged as implausible must be resolved with user before being passed to croqui generation
- Reference object priority order must be followed -- do not use lower-priority objects when higher-priority ones are available
