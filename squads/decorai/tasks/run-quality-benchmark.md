# Task: Execute Comprehensive Quality Benchmark

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | run-quality-benchmark |
| **status** | `pending` |
| **responsible_executor** | @visual-quality-engineer |
| **execution_type** | `Agent` |
| **input** | Generated render(s) + reference images (if available) + quality thresholds |
| **output** | Quality benchmark report with FID, SSIM, LPIPS, CLIP Score, and pass/fail verdict |
| **action_items** | 8 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Execute a comprehensive quality benchmark on generated renders using industry-standard image quality metrics: FID (Frechet Inception Distance), SSIM (Structural Similarity Index), LPIPS (Learned Perceptual Image Patch Similarity), and CLIP Score (text-image alignment). This benchmark provides an objective, quantitative assessment of render quality that supplements subjective user evaluation. Regular benchmarking establishes quality baselines, detects regression, and informs pipeline optimization decisions (FR-20).

## Inputs

- Generated render image(s) to evaluate
- Reference images: real interior photos of similar rooms (for FID, SSIM comparison)
- Text prompt used for generation (for CLIP Score evaluation)
- Quality thresholds: FID < 150, SSIM > 0.65, LPIPS < 0.35, CLIP Score > 0.25
- Optional: previous benchmark results for trend analysis

## Preconditions

- At least one render image available for evaluation
- Reference image dataset available (real interior photography collection)
- Quality metric computation models loaded (Inception for FID, VGG for LPIPS, CLIP)
- GPU available for metric computation

## Steps

1. **Prepare evaluation inputs**
   - Load generated render(s) in standard format (RGB, normalized)
   - Load reference image set (matched by room type and style if possible)
   - Load generation prompt for CLIP Score computation
   - Verify all images at consistent resolution for fair comparison
   - If reference set is style-matched, note the matching criteria

2. **Compute FID (Frechet Inception Distance)**
   - Extract Inception V3 features from generated render(s)
   - Extract Inception V3 features from reference image set
   - Calculate Frechet distance between feature distributions
   - Interpret: lower is better, < 150 is acceptable, < 100 is good, < 50 is excellent
   - Note: FID requires sufficient sample size (>= 50 images) for statistical reliability
   - For single-image evaluation, use reference-based alternatives

3. **Compute SSIM (Structural Similarity Index)**
   - Compare structural similarity between render and closest reference image
   - Evaluate across luminance, contrast, and structure channels
   - Calculate per-region SSIM (identify weak areas in the render)
   - Interpret: higher is better, > 0.65 acceptable, > 0.75 good, > 0.85 excellent
   - SSIM map: generate heatmap showing quality variation across the image

4. **Compute LPIPS (Learned Perceptual Image Patch Similarity)**
   - Use VGG-based LPIPS model
   - Compare render against closest reference image
   - Evaluate perceptual similarity as humans would perceive it
   - Interpret: lower is better, < 0.35 acceptable, < 0.25 good, < 0.15 excellent
   - Complement SSIM with perceptual (not just structural) quality assessment

5. **Compute CLIP Score (text-image alignment)**
   - Encode generation prompt with CLIP text encoder
   - Encode render image with CLIP image encoder
   - Calculate cosine similarity between embeddings
   - Interpret: higher is better, > 0.25 acceptable, > 0.30 good, > 0.35 excellent
   - Measures how well the render matches the intended style and content

6. **Compute supplementary metrics**
   - Sharpness score: Laplacian variance (detect blur)
   - Color distribution: histogram analysis (detect color casting)
   - Artifact detection: high-frequency analysis (detect generation artifacts)
   - Resolution quality: effective resolution after upscaling (detect over-upscale blur)

7. **Generate quality verdict**
   - Aggregate all metrics into overall quality score (weighted average)
   - Weights: FID 25%, SSIM 25%, LPIPS 20%, CLIP 20%, supplementary 10%
   - Verdict: PASS (all metrics above threshold), CONDITIONAL (1-2 metrics borderline), FAIL (any metric significantly below threshold)
   - If FAIL: identify the primary quality issue and recommend remediation
   - If CONDITIONAL: identify borderline areas and suggest improvements

8. **Compile benchmark report**
   - Score card with all metrics and their thresholds
   - SSIM heatmap showing per-region quality
   - Trend analysis if historical benchmarks available
   - Quality verdict with detailed reasoning
   - Remediation recommendations if applicable
   - Comparison to platform average (if benchmark history exists)

## Outputs

- **Quality Score Card** with FID, SSIM, LPIPS, CLIP Score, supplementary metrics
- **SSIM Heatmap** showing spatial quality distribution
- **Quality Verdict** (PASS/CONDITIONAL/FAIL) with reasoning
- **Remediation Recommendations** (if quality issues detected)
- **Trend Analysis** (if historical data available)
- **Benchmark Report** (complete document for archival)

## Acceptance Criteria

- [ ] FID computed and compared against threshold (< 150)
- [ ] SSIM computed with per-region heatmap and compared against threshold (> 0.65)
- [ ] LPIPS computed and compared against threshold (< 0.35)
- [ ] CLIP Score computed against generation prompt and compared against threshold (> 0.25)
- [ ] Supplementary metrics computed (sharpness, color distribution, artifact detection)
- [ ] Overall quality verdict generated (PASS/CONDITIONAL/FAIL)
- [ ] Remediation recommendations provided for any failing metrics
- [ ] Benchmark report compiled with all metrics, heatmaps, and verdict

## Quality Gate

- Benchmark must use consistent reference images for comparable results across renders
- FID computation requires minimum sample size -- for single renders, note statistical limitation
- CLIP Score must use the EXACT prompt used for generation (not a modified version)
- All metrics must be computed at the render's native resolution (no resizing artifacts)
- Benchmark computation should complete within 60 seconds per render
- Historical benchmark data must be stored for trend analysis over time
- If all metrics PASS but user reports dissatisfaction, escalate for subjective review
