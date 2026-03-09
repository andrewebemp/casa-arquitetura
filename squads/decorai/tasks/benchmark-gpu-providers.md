# Task: Compare GPU Inference Platforms

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | benchmark-gpu-providers |
| **status** | `pending` |
| **responsible_executor** | @pipeline-optimizer |
| **execution_type** | `Agent` |
| **input** | GPU provider APIs + test workloads + evaluation criteria |
| **output** | Provider comparison matrix with recommendation for each pipeline step |
| **action_items** | 8 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Compare GPU inference platforms (fal.ai, Replicate, Modal, RunPod) across the dimensions that matter for DecorAI's pipeline: latency, cost, reliability, model availability, cold start performance, and scaling behavior. Each provider has strengths for different workload types. This benchmark produces an evidence-based recommendation for which provider to use for each pipeline step, plus a failover strategy for high availability.

## Inputs

- GPU provider accounts: fal.ai, Replicate, Modal, RunPod
- Test workloads representing each pipeline step:
  - Depth estimation: Depth Anything V2 inference
  - Segmentation: SAM 2 inference
  - Generation: SDXL + ControlNet inference
  - Upscaling: Real-ESRGAN inference
- Evaluation criteria weights (latency, cost, reliability, availability)
- Target SLA requirements (99.5% uptime, < 90s generation time)

## Preconditions

- API access to all providers being benchmarked
- Test images and prompts prepared for consistent comparison
- Budget allocated for benchmark testing
- Monitoring infrastructure for capturing metrics

## Steps

1. **Define benchmark protocol**
   - Test workloads: one representative task per pipeline step
   - Repetitions: minimum 20 runs per provider per workload (statistical significance)
   - Timing: run benchmarks at different times (morning, afternoon, evening, weeknight, weekend)
   - Consistency: same input images, same prompts, same model versions across providers
   - Metrics captured: total latency, GPU execution time, cold start time, error rate

2. **Benchmark latency**
   - For each provider x workload combination:
     - Warm start latency (model already loaded): p50, p95, p99
     - Cold start latency (first invocation): p50, p95, p99
     - Time-to-first-byte (for streaming results)
   - Separate GPU execution time from overhead (API, serialization, transfer)
   - Identify latency outliers and their causes

3. **Benchmark cost efficiency**
   - For each provider x workload:
     - Cost per invocation (including minimum billing increments)
     - Cost per GPU-second (effective rate after overhead)
     - Cold start cost (paying for unused compute during startup)
     - Idle cost (if keeping warm instances, how much?)
   - Calculate cost per render for the complete pipeline at each provider
   - Calculate blended cost for mixed-provider strategy

4. **Benchmark reliability**
   - Error rate: % of invocations that fail
   - Timeout rate: % that exceed time limit
   - Retry success rate: % of failed invocations that succeed on retry
   - Downtime incidents: documented outages in the past 90 days
   - Consistency: variance in latency across runs (lower is better)

5. **Evaluate model availability**
   - Which models are natively available on each provider?
   - Custom model deployment: process, time, cost
   - Model version updates: how quickly are new versions available?
   - Concurrent model availability: can run multiple models simultaneously?
   - ControlNet support: native or requires custom deployment?

6. **Evaluate scaling behavior**
   - Concurrent request handling: how many simultaneous generations?
   - Auto-scaling: response time to traffic spikes
   - Queue management: behavior under load (queuing vs rejecting)
   - Rate limits: maximum requests per minute
   - Scale test: submit 50 concurrent requests, measure behavior

7. **Design failover strategy**
   - Primary provider recommendation per pipeline step
   - Secondary provider as failover for each step
   - Failover trigger: error count threshold, latency threshold, availability check
   - Failover latency: how quickly can traffic switch?
   - Cost of failover readiness (warm instances on secondary)

8. **Compile comparison matrix and recommendations**
   - Provider x metric comparison table
   - Radar chart per provider (latency, cost, reliability, availability, scaling)
   - Recommended primary provider per pipeline step
   - Failover assignments
   - Cost projection for recommended configuration
   - Migration plan if current provider needs changing

## Outputs

- **Provider Comparison Matrix** (metrics x providers)
- **Latency Benchmark Results** with percentile distributions
- **Cost Efficiency Ranking** per pipeline step
- **Reliability Assessment** per provider
- **Model Availability Matrix** (models x providers)
- **Failover Strategy** with primary/secondary assignments
- **Recommendation Summary** with provider per pipeline step

## Acceptance Criteria

- [ ] At least 4 GPU providers benchmarked (fal.ai, Replicate, Modal, RunPod)
- [ ] Latency measured with p50, p95, p99 for both warm and cold starts
- [ ] Cost per render calculated at each provider (complete pipeline)
- [ ] Reliability measured: error rate, timeout rate, retry success rate
- [ ] Model availability verified for all required models at each provider
- [ ] Scaling behavior tested with concurrent requests
- [ ] Failover strategy defined with primary/secondary per pipeline step
- [ ] Final recommendation documented with rationale per pipeline step

## Quality Gate

- Benchmark must have minimum 20 runs per data point for statistical validity
- Tests must be run at different times of day to account for load variation
- Cost calculations must include ALL charges (compute, API calls, storage, bandwidth)
- Recommendation must balance cost AND reliability -- cheapest is not always best
- Failover strategy must be tested, not just theoretical
- Benchmark results must be reproducible -- document exact test conditions
- Provider recommendation must be reviewed quarterly as pricing and features change
