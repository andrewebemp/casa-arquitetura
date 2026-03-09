# Task: Improve Lighting in Dark or Underexposed Photos

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | enhance-lighting |
| **status** | `pending` |
| **responsible_executor** | @staging-architect |
| **execution_type** | `Agent` |
| **input** | Dark/underexposed room photo + desired lighting mood |
| **output** | Enhanced photo with improved, natural-looking lighting |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Improve lighting in dark or underexposed interior photographs using IC-Light and other enhancement techniques. Poor lighting is one of the most common problems in user-submitted room photos, especially in Brazilian apartments with limited natural light. Enhanced lighting improves both the spatial analysis accuracy and the quality of subsequent virtual staging renders. This task preserves the room's actual contents while dramatically improving illumination.

## Inputs

- Dark or underexposed room photograph
- Optional: desired lighting mood (natural daylight, warm evening, bright studio)
- Optional: light source positions known from spatial analysis
- Optional: window positions and orientations (for realistic natural light direction)

## Preconditions

- Photo is identified as underexposed or having poor lighting
- IC-Light model available via GPU provider
- Photo resolution sufficient for enhancement (minimum 512x512)

## Steps

1. **Assess lighting conditions**
   - Analyze current exposure level (histogram analysis)
   - Identify light sources in the image (windows, lamps, overhead)
   - Detect areas of deep shadow and blown highlights
   - Classify lighting problem: underexposed, uneven, color cast, or combination
   - Determine if enhancement is feasible or if new photo is needed

2. **Define target lighting profile**
   - If user specified mood, use that as target
   - If no specification, default to "natural daylight, balanced exposure"
   - Map target to IC-Light parameters:
     - Bright daylight: high exposure, cool temperature, strong directional
     - Warm evening: moderate exposure, warm temperature, soft ambient
     - Studio: high exposure, neutral temperature, even distribution
   - Consider window positions for realistic light directionality

3. **Apply IC-Light relighting**
   - Configure IC-Light with target lighting profile
   - Set light direction based on window positions (if known)
   - Apply relighting preserving room structure and contents
   - Generate 2-3 variations with slightly different intensities

4. **Apply complementary enhancements**
   - Adjust exposure curve for shadow recovery without blowing highlights
   - Correct white balance for natural color appearance
   - Reduce noise introduced by brightening dark areas
   - Apply subtle contrast enhancement for depth perception

5. **Validate enhancement quality**
   - Check for introduced artifacts (halos around objects, color shifts)
   - Verify furniture and structural elements remain unchanged
   - Confirm lighting direction is physically consistent (shadows match light sources)
   - Ensure no loss of detail in brightened areas
   - Compare enhanced version with original to verify improvement

6. **Preserve spatial analysis compatibility**
   - Verify enhanced photo still works for depth estimation
   - Confirm reference objects remain clearly identifiable
   - Check that structural elements are more visible (not less) after enhancement
   - Validate that the enhancement improves rather than hinders spatial analysis

7. **Present enhanced photo**
   - Show before/after comparison with brightness slider
   - Display the lighting mood applied
   - Offer to adjust intensity (brighter/darker)
   - Recommend proceeding with spatial analysis using the enhanced photo

## Outputs

- **Enhanced room photo** (same resolution as input, improved lighting)
- **2-3 lighting variations** for user choice
- **Before/after comparison** showing the improvement
- **Enhancement metadata** (IC-Light parameters, adjustments applied)
- **Recommendation** on using enhanced photo for spatial analysis

## Acceptance Criteria

- [ ] Lighting visibly improved with balanced exposure across the room
- [ ] No artifacts introduced: no halos, no color shifts, no detail loss
- [ ] Room contents (furniture, structural elements) remain unchanged
- [ ] Light direction is physically consistent with window/lamp positions
- [ ] Shadow and highlight recovery applied without clipping
- [ ] At least 2 lighting variations generated for user choice
- [ ] Before/after comparison provided showing measurable improvement

## Quality Gate

- Enhancement must NOT alter room geometry, furniture, or structural elements
- If original photo is too dark (near-black areas > 60% of image), request a new photo
- Enhanced photo must improve spatial analysis quality -- if it makes analysis harder, it fails
- Color temperature must remain realistic (no purple walls, no green-tinted lighting)
- Processing time target: < 30 seconds per lighting variation
- Original photo must be preserved alongside the enhanced version
