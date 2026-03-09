# Task: Configure and Optimize Depth Estimation Pipeline

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | configure-depth-pipeline |
| **status** | `pending` |
| **responsible_executor** | @visual-quality-engineer |
| **execution_type** | `Agent` |
| **input** | Room photos + available depth models + spatial analysis data |
| **output** | Optimized depth estimation configuration with model selection and parameter tuning |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Configure and optimize the depth estimation pipeline that converts 2D room photographs into depth maps used for ControlNet spatial conditioning. Accurate depth maps are foundational to render quality -- they ensure generated furniture respects room geometry, walls maintain correct perspective, and spatial proportions remain realistic. This task selects the optimal depth model (Depth Anything V2, ZoeDepth, or Marigold), tunes parameters for interior photography, and validates depth accuracy against known spatial dimensions from @spatial-analyst.

## Inputs

- Room photographs (the same used for spatial analysis and staging)
- Available depth models: Depth Anything V2, ZoeDepth, Marigold
- Spatial analysis data from @spatial-analyst (known dimensions for validation)
- GPU provider capabilities and latency requirements
- Quality requirements (depth accuracy vs processing speed trade-off)

## Preconditions

- At least one room photo available for depth estimation
- Spatial analysis completed (known dimensions available for validation)
- At least one depth model accessible via GPU provider

## Steps

1. **Assess input photo characteristics**
   - Analyze photo properties: resolution, field of view, lens distortion
   - Detect wide-angle distortion (common in smartphone interior photos)
   - Identify challenging areas: reflective surfaces, glass, mirrors, dark corners
   - Classify photo complexity: simple (one room, clear geometry) vs complex (open plan, multiple levels)

2. **Select optimal depth model**
   - Depth Anything V2: best general-purpose, fast, good for most interiors
   - ZoeDepth: best for metric depth (absolute distances), slower but more accurate
   - Marigold: best for fine detail and edges, diffusion-based, highest quality but slowest
   - Selection criteria:
     - Speed priority -> Depth Anything V2
     - Accuracy priority -> ZoeDepth
     - Detail priority -> Marigold
     - Recommend default: Depth Anything V2 for standard renders, Marigold for premium

3. **Configure depth model parameters**
   - Resolution: match input photo resolution (or downscale to model optimal: 518px for DA-V2)
   - Ensemble passes: 1 for speed, 5-10 for accuracy
   - Output format: 16-bit depth map (preserve precision)
   - Normalization: relative depth (0-1 range) or metric depth (meters)
   - For ControlNet: relative depth normalized to 0-1 range

4. **Execute depth estimation**
   - Run selected model on the input photo
   - Generate depth map and confidence map
   - Process time logging for optimization metrics
   - If confidence is low in certain areas, flag for manual review

5. **Validate depth against spatial analysis**
   - Compare estimated depth ratios with known dimensions from @spatial-analyst
   - Check proportionality: if room is 4m x 3m, depth ratios should reflect ~4:3
   - Validate structural element positions: doors/windows at correct depth planes
   - Calculate depth accuracy metric: correlation with known dimensions
   - If accuracy < 80% correlation, try alternative model or parameters

6. **Optimize for ControlNet consumption**
   - Adjust depth map contrast for optimal ControlNet conditioning
   - Apply mild gaussian blur to reduce noise without losing edges
   - Enhance depth edges at structural boundaries (walls, doors, windows)
   - Generate depth map at ControlNet target resolution (same as generation target)
   - Test with a quick low-resolution generation to verify conditioning effect

7. **Document configuration and results**
   - Record optimal model and parameters for this room type
   - Document depth accuracy metrics
   - Create configuration profile that can be reused for similar rooms
   - Recommend model upgrades or changes based on quality results
   - Log processing time for @pipeline-optimizer cost analysis

## Outputs

- **Optimized depth map** ready for ControlNet conditioning
- **Configuration profile** (model, parameters, resolution, processing)
- **Accuracy validation report** (correlation with known dimensions)
- **Depth confidence map** highlighting uncertain areas
- **Performance metrics** (processing time, GPU utilization)
- **Configuration recommendation** for similar room types

## Acceptance Criteria

- [ ] Depth model selected with documented rationale (speed vs accuracy vs detail)
- [ ] Parameters configured for interior photography use case
- [ ] Depth map generated at appropriate resolution for ControlNet
- [ ] Depth accuracy validated against @spatial-analyst known dimensions (> 80% correlation)
- [ ] Structural element positions correct in depth map (doors, windows at right planes)
- [ ] Depth map optimized for ControlNet consumption (contrast, edge enhancement)
- [ ] Configuration profile documented for reuse with similar rooms

## Quality Gate

- Depth maps with < 70% correlation to known dimensions must NOT be used for generation
- Wide-angle distortion must be corrected before depth estimation (or model must handle it)
- Reflective surfaces (mirrors, glass) are known failure modes -- document and handle gracefully
- Processing time must be logged for every depth estimation (feeds @pipeline-optimizer)
- If all available models produce poor depth for a specific photo, recommend re-photography guidelines
- Configuration profiles must be versioned to track improvements over time
