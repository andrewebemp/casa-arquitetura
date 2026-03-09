# Task: Generate Project Summary Report with Metrics

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | generate-project-report |
| **status** | `pending` |
| **responsible_executor** | @decorai-chief |
| **execution_type** | `Agent` |
| **input** | Completed project data + pipeline logs + quality metrics |
| **output** | Comprehensive project report with metrics, learnings, and recommendations |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Generate a comprehensive project summary report after a staging project is completed or when an interim report is requested. The report aggregates data from all pipeline stages -- spatial analysis accuracy, style adherence, render quality scores, processing times, costs, and user satisfaction. This serves multiple audiences: the user (project summary with deliverables), the team (operational metrics and learnings), and @proptech-growth (business intelligence for pricing and growth optimization).

## Inputs

- Completed project record (from coordinate-staging-pipeline)
- Pipeline step logs (timing, parameters, results per step)
- Quality metrics per render (FID, SSIM, LPIPS, CLIP Score)
- Version history (all iterations and refinements)
- User feedback (if collected)
- Cost data (GPU time, API calls, total cost)

## Preconditions

- At least one render has been delivered to the user
- Project pipeline logs are available
- Quality metrics have been computed for final render(s)

## Steps

1. **Collect project data**
   - Gather from all pipeline stages:
     - @spatial-analyst: room dimensions, croqui turns, confidence scores
     - @interior-strategist: style applied, material recommendations
     - @staging-architect: generation parameters, render count, refinement count
     - @visual-quality-engineer: quality scores per render
     - @conversational-designer: refinement rounds, ambiguity resolution count
     - @pipeline-optimizer: cost per render, GPU provider used, cache hits
   - Compute project-level aggregates: total time, total renders, total cost

2. **Generate project timeline**
   - Map each step chronologically:
     - Request received -> spatial analysis -> croqui approved -> style selected
     - -> render generated -> quality validated -> delivered -> refinements (N rounds)
   - Calculate time per phase and identify bottlenecks
   - Compare actual timeline to SLA targets
   - Highlight any delays and their causes

3. **Compile quality metrics summary**
   - Quality scores for each render version:
     - FID, SSIM, LPIPS, CLIP Score
     - Overall quality verdict (PASS/CONDITIONAL/FAIL)
   - Quality trend across versions (improving or degrading with refinements?)
   - Comparison to platform average quality
   - Spatial accuracy: correlation between croqui and render structure

4. **Calculate project economics**
   - Total GPU cost across all renders and refinements
   - Total API costs (Claude, CLIP, storage)
   - Total cost (COGS)
   - Revenue from the project (if paid)
   - Gross margin for this specific project
   - Comparison to target margins from pricing strategy

5. **Extract learnings and patterns**
   - What worked well: high-quality outputs, fast processing
   - What needed improvement: re-generations, artifacts, user corrections
   - Room type insights: how this room type performs in the pipeline
   - Style insights: which style parameters produced best results
   - Refinement patterns: most common refinement types for this project type

6. **Generate user-facing summary**
   - Clean project summary for the user:
     - Room overview (dimensions, type, style applied)
     - Final render with key design highlights
     - Material recommendations summary
     - All render versions (gallery)
     - Optional: estimated cost to implement design physically
   - Format: clean, professional, suitable for sharing with clients (if user is a corretor)

7. **Generate operational summary**
   - Operational summary for internal analytics:
     - Pipeline performance: time, cost, quality per step
     - Error/retry count
     - User satisfaction indicators
     - Recommendations for pipeline optimization
     - Data points for @proptech-growth metrics
   - Feed into aggregate platform analytics

## Outputs

- **User-Facing Project Summary**: room overview, final renders, design highlights, material recommendations
- **Project Timeline**: chronological step breakdown with timing and bottlenecks
- **Quality Metrics Summary**: per-render scores and quality trend analysis
- **Project Economics**: cost breakdown, margin analysis
- **Learnings Document**: what worked, what needs improvement, patterns identified
- **Operational Metrics**: internal performance data for analytics pipeline

## Acceptance Criteria

- [ ] Data collected from all pipeline stages (spatial, style, generation, quality)
- [ ] Project timeline generated with phase durations and bottleneck identification
- [ ] Quality metrics summarized for all render versions
- [ ] Project economics calculated (total cost, revenue, margin)
- [ ] Learnings extracted with actionable observations
- [ ] User-facing summary generated in professional format
- [ ] Operational summary compiled for internal analytics

## Quality Gate

- All metrics must be factual and traceable to pipeline logs (no estimates for actual data)
- User-facing summary must NOT expose internal metrics (cost, error counts) -- only quality and design info
- Economic analysis must use actual costs from GPU provider billing, not estimates
- Timeline must accurately reflect user wait times (not just processing times)
- Learnings must be specific and actionable ("reduce CFG for bedroom renders" not "improve quality")
- Report generation must complete within 30 seconds (should not delay user experience)
- Reports must be stored and accessible for aggregate analysis by @proptech-growth
