# Task: Analyze and Optimize Cost Per Render Across GPU Providers

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | analyze-cost-per-render |
| **status** | `pending` |
| **responsible_executor** | @pipeline-optimizer |
| **execution_type** | `Agent` |
| **input** | GPU provider pricing data + render pipeline steps + usage metrics |
| **output** | Cost breakdown per render with optimization recommendations |
| **action_items** | 8 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Analyze the complete cost structure of producing a single virtual staging render across all GPU providers and pipeline steps. Each render involves multiple GPU-intensive operations: depth estimation, segmentation, generation (the most expensive), post-processing, and upscaling. Understanding the cost per render is critical for pricing strategy (feeds @proptech-growth create-pricing-strategy), margin management, and infrastructure optimization. This task produces a detailed cost breakdown and identifies optimization opportunities to reduce cost while maintaining quality.

## Inputs

- GPU provider pricing: fal.ai, Replicate, Modal, RunPod rate cards
- Pipeline step inventory with GPU requirements per step
- Current usage metrics: renders per day, average refinements per project
- Model specifications: SDXL, FLUX.2, Depth Anything V2, SAM 2, Real-ESRGAN
- API costs: Claude API, CLIP API, storage, bandwidth

## Preconditions

- GPU provider accounts active with billing access
- Pipeline architecture defined (which steps use which models)
- At least baseline render count estimates available

## Steps

1. **Inventory all pipeline steps**
   - Map each step in the full render pipeline:
     - Depth estimation (Depth Anything V2 or ZoeDepth)
     - Segmentation (SAM 2 or OneFormer)
     - Generation (SDXL or FLUX.2 via ControlNet)
     - Post-processing (color correction, enhancement)
     - Upscaling (Real-ESRGAN)
     - Quality validation (CLIP, quality metrics)
   - For each step: GPU type required, VRAM needed, typical execution time
   - Note optional steps (upscaling only if requested)

2. **Collect provider pricing**
   - fal.ai: per-second GPU pricing, serverless model pricing
   - Replicate: per-prediction pricing for hosted models
   - Modal: per-second GPU compute, cold start costs
   - RunPod: per-hour GPU rental, serverless endpoint pricing
   - For each: price per GPU-second by GPU type (A100, H100, T4, A10G)
   - Note cold start penalties and minimum billing increments

3. **Calculate cost per pipeline step**
   - For each step, at each provider:
     - GPU time (seconds) x price per GPU-second = GPU cost
     - Add API overhead (invocation fee if applicable)
     - Add data transfer cost (input image upload, result download)
   - Create a matrix: steps (rows) x providers (columns)
   - Identify cheapest provider for each step

4. **Calculate total cost per render**
   - Sum all pipeline steps for a standard render (no upscale, no refinement)
   - Calculate render + 1 refinement (common scenario)
   - Calculate render + upscale (premium scenario)
   - Calculate full pipeline: render + 2 refinements + upscale
   - Add non-GPU costs: Claude API (conversation), storage, bandwidth

5. **Analyze cost optimization opportunities**
   - Provider mixing: use cheapest provider for each step
   - Batch processing: run multiple renders to amortize cold starts
   - Model distillation: use lighter models where quality permits
   - Caching: skip steps when inputs haven't changed (e.g., reuse depth map)
   - Resolution optimization: generate at lower res and upscale vs generate at high res
   - Step elimination: which steps can be skipped without quality impact?

6. **Model cost at scale**
   - Cost per render at different volumes:
     - 100 renders/month (startup phase)
     - 1,000 renders/month (growth phase)
     - 10,000 renders/month (scale phase)
   - Volume discounts and committed-use pricing
   - Cost curve: how cost per render decreases with scale
   - Break-even volume for dedicated GPU vs serverless

7. **Calculate margin analysis**
   - At each pricing tier (from create-pricing-strategy):
     - Revenue per render - Cost per render = Gross margin per render
     - Gross margin percentage
     - Contribution to fixed costs
   - Identify minimum viable price per render for each scenario
   - Flag any scenarios where margin is negative

8. **Compile cost optimization report**
   - Current cost per render (baseline)
   - Optimized cost per render (recommended configuration)
   - Savings percentage from optimization
   - Provider recommendations per pipeline step
   - Scale projections with cost curves
   - Margin analysis at each pricing tier
   - Action items for cost reduction (prioritized by impact)

## Outputs

- **Cost Breakdown Matrix** (pipeline steps x providers)
- **Total Cost Per Render** for 4 scenarios (basic, refinement, premium, full)
- **Optimization Recommendations** with estimated savings per item
- **Scale Cost Model** at 100, 1K, 10K renders/month
- **Margin Analysis** at each pricing tier
- **Provider Recommendation** per pipeline step

## Acceptance Criteria

- [ ] All pipeline steps inventoried with GPU requirements
- [ ] At least 3 GPU providers analyzed with current pricing
- [ ] Cost per render calculated for at least 4 scenarios
- [ ] Cost optimization opportunities identified with estimated savings
- [ ] Scale model projected for at least 3 volume levels
- [ ] Margin analysis completed against pricing tiers
- [ ] Provider recommendations documented per pipeline step

## Quality Gate

- Pricing data must be current (within 30 days) -- GPU pricing changes frequently
- Cost calculations must include ALL costs (GPU, API, storage, bandwidth, cold starts)
- Optimization recommendations must not sacrifice quality below minimum thresholds
- Margin analysis must use realistic pricing from create-pricing-strategy, not optimistic estimates
- Scale projections must account for volume discounts AND increased support/infrastructure costs
- Report must clearly distinguish between variable costs (per-render) and fixed costs (per-month)
