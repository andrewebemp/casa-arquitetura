# Task: Upscale Render to HD Resolution Using Real-ESRGAN

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | upscale-render |
| **status** | `pending` |
| **responsible_executor** | @staging-architect |
| **execution_type** | `Agent` |
| **input** | Render at 1024x1024 resolution |
| **output** | Upscaled render at 2048x2048 (or higher) resolution |
| **action_items** | 6 steps |
| **acceptance_criteria** | 6 criteria |

## Purpose

Upscale generated room renders from base resolution (1024x1024) to HD resolution (2048x2048) using Real-ESRGAN for professional presentation and marketing use. High-resolution renders are essential for real estate listings, printed materials, and detailed client presentations. The upscaling must enhance detail without introducing artifacts or altering the design intent.

## Inputs

- Rendered room image at base resolution (1024x1024)
- Target resolution (default: 2048x2048, option for 4096x4096)
- Upscale factor (2x default, 4x optional)
- Optional: face restoration toggle (if people visible in render)

## Preconditions

- Base render has passed quality validation (FID < 150, SSIM > 0.65)
- Render is free of visible artifacts at base resolution
- Real-ESRGAN model available via GPU provider
- Sufficient GPU memory for target resolution

## Steps

1. **Validate input render quality**
   - Confirm base render meets quality thresholds
   - Check for artifacts that would be amplified by upscaling
   - If artifacts detected, recommend fixing at base resolution first
   - Verify input dimensions and format

2. **Configure Real-ESRGAN parameters**
   - Model: Real-ESRGAN x4plus (best for photorealistic interiors)
   - Scale factor: 2x for 2048x2048, 4x for 4096x4096
   - Tile size: 512 (for memory-efficient processing)
   - Face enhancement: enable if people visible (GFPGAN)
   - Denoise strength: 0.3-0.5 (preserve AI-generated texture without amplifying noise)

3. **Execute upscaling**
   - Process through Real-ESRGAN
   - Monitor for out-of-memory errors (reduce tile size if needed)
   - If 4x requested, process in two 2x passes for better quality
   - Log processing time and GPU cost

4. **Validate upscaled output**
   - Compare detail enhancement: textures should be sharper, not blurry
   - Check for upscaling artifacts: checkerboard patterns, over-sharpening, ringing
   - Verify color fidelity: no color shifts from upscaling
   - Confirm structural elements remain crisp at higher resolution
   - Validate that design details (materials, textures) are enhanced, not distorted

5. **Apply post-upscale refinement**
   - Subtle sharpening on architectural edges (windows, doors, furniture edges)
   - Texture enhancement for materials (wood grain, fabric weave, stone surface)
   - Preserve soft areas (shadows, ambient lighting transitions)
   - Final color consistency check

6. **Deliver HD render**
   - Save in appropriate format (PNG for lossless, JPEG quality 95 for web)
   - Generate both formats if needed
   - Create thumbnail version for fast preview
   - Record upscale metadata (model, scale, processing time)

## Outputs

- **HD render** at 2048x2048 (or 4096x4096) resolution
- **PNG** (lossless) and **JPEG** (optimized) versions
- **Thumbnail** for quick preview
- **Upscale metadata** (model, scale factor, processing time, file sizes)

## Acceptance Criteria

- [ ] Output resolution matches target (2048x2048 default or 4096x4096)
- [ ] Detail enhancement visible: sharper textures, crisper edges
- [ ] No upscaling artifacts: no checkerboard, no over-sharpening, no ringing
- [ ] Color fidelity maintained: no color shifts from the base render
- [ ] Structural elements (doors, windows, furniture) remain geometrically accurate
- [ ] Both PNG and JPEG formats delivered

## Quality Gate

- Input render MUST pass quality validation before upscaling -- never upscale a defective render
- If upscaling amplifies previously invisible artifacts, report back to @visual-quality-engineer
- Processing time target: < 30 seconds for 2x upscale, < 90 seconds for 4x upscale
- File size must be reasonable: PNG < 25MB, JPEG < 5MB for 2048x2048
- If 4x upscale shows diminishing returns (over-smoothing), recommend staying at 2x
