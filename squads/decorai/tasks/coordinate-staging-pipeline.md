# Task: Coordinate Multi-Agent Staging Workflow

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | coordinate-staging-pipeline |
| **status** | `pending` |
| **responsible_executor** | @decorai-chief |
| **execution_type** | `Agent` |
| **input** | Triaged user request + project state |
| **output** | Completed staging workflow with render delivered to user |
| **action_items** | 10 steps |
| **acceptance_criteria** | 9 criteria |

## Purpose

Coordinate the full multi-agent staging workflow from spatial analysis through render delivery. This is the orchestration backbone of DecorAI -- the @decorai-chief manages the sequential handoffs between agents: @spatial-analyst (space understanding) -> @interior-strategist (style definition) -> @staging-architect (render generation) -> @visual-quality-engineer (quality validation) -> delivery to user. The coordinator manages state, enforces quality gates between transitions, handles errors, and ensures the user receives a quality render within the target SLA.

## Inputs

- Triaged user request (from triage-request, classified as NEW PROJECT or DIAGNOSTIC)
- User-provided inputs: photo(s), text description, style preference
- Project state: new or continuation
- User subscription tier (affects priority and features available)

## Preconditions

- Request has been triaged and classified
- At least a photo OR text description is available
- All pipeline agents are operational
- GPU provider is available for generation

## Steps

1. **Initialize project state**
   - Create project record with unique ID
   - Register user context: subscription tier, previous projects, preferences
   - Initialize pipeline state tracker: { step, status, agent, started_at, output }
   - Set SLA timer based on subscription tier:
     - Free diagnostic: 3 minutes
     - Standard: 2 minutes
     - Premium: 90 seconds

2. **Phase 1: Spatial Analysis (@spatial-analyst)**
   - Route photo and/or text to @spatial-analyst
   - Invoke appropriate task: analyze-photo, parse-dimensions, or both
   - Monitor for 3-turn croqui protocol compliance
   - Wait for user approval of croqui (FR-31 -- blocking gate QG-DA-002)
   - Capture output: handoff package with spatial data + approved croqui
   - If spatial analysis fails: provide error context and suggest corrections

3. **Phase 2: Style Selection (@interior-strategist)**
   - If user specified a style: load that style guide
   - If no style specified: present top 3 style recommendations based on room type and trends
   - Route to @interior-strategist for style guide generation
   - Invoke generate-style-prompt to create ControlNet-ready prompt package
   - Capture output: style guide + prompt package
   - This phase can run partially in parallel with Phase 1 (style research while croqui is being approved)

4. **Phase 3: Render Generation (@staging-architect)**
   - Compile inputs: spatial handoff + style prompt package
   - Route to @staging-architect generate-staging task
   - Monitor generation progress (from async pipeline WebSocket events)
   - Report progress to user: "Generating your design... 60% complete"
   - Capture output: generated render + depth map + segmentation mask + metadata

5. **Quality Gate: Render Validation (@visual-quality-engineer)**
   - Route render to @visual-quality-engineer validate-render-quality task
   - Enforce QG-DA-003: render must pass quality threshold
   - If PASS: proceed to delivery
   - If REVIEW: deliver with note, log for improvement
   - If FAIL: route to diagnose-artifacts, then re-generate (max 2 retries)

6. **Phase 4: Delivery**
   - Present render to user with:
     - Before/after comparison (original photo vs staged render)
     - Style description and key design choices
     - Material recommendations summary (from @interior-strategist)
   - Initialize version history (v1.0 -- initial render)
   - Offer refinement options: change style, swap elements, adjust colors

7. **Handle refinement loop**
   - If user requests refinement: route to @conversational-designer interpret-refinement
   - @conversational-designer maps instruction to pipeline operation
   - Route operation to @staging-architect for execution
   - Repeat quality gate (validate-render-quality)
   - Deliver refined render, update version history
   - Loop continues until user is satisfied or session ends

8. **Monitor SLA compliance**
   - Track elapsed time from request to first render delivery
   - If approaching SLA limit: escalate priority, notify user of delay
   - Log SLA performance for each project
   - Identify bottleneck steps for optimization

9. **Handle errors and fallbacks**
   - GPU provider failure: trigger failover to secondary provider
   - Agent failure: retry with same agent, then escalate
   - User disconnection: save state for resumption
   - Timeout: notify user and offer to continue asynchronously
   - Graceful degradation: deliver lower-quality result rather than nothing

10. **Finalize project**
    - Log project completion metrics: total time, steps executed, refinements, quality score
    - Store final render and version history
    - Trigger satisfaction survey if applicable
    - Update user profile with project completion
    - Archive project state for potential future reuse

## Outputs

- **Completed Render** delivered to user (first render + any refinements)
- **Before/After Comparison** showing original vs staged
- **Project Record** with all pipeline step logs and metrics
- **Version History** tracking all iterations
- **Quality Metrics** per render (FID, SSIM, CLIP Score from quality gate)
- **SLA Performance Log** (time from request to delivery)

## Acceptance Criteria

- [ ] Project initialized with unique ID and state tracker
- [ ] Phase 1 (spatial analysis) completed with user-approved croqui (3-turn protocol)
- [ ] Phase 2 (style selection) completed with style guide and prompt package
- [ ] Phase 3 (render generation) completed with image delivered
- [ ] Quality gate enforced: render validated before delivery (QG-DA-003)
- [ ] Before/after comparison presented to user
- [ ] Refinement loop operational: user can request changes and receive updated renders
- [ ] SLA tracked and compliance reported
- [ ] Project finalized with metrics logged for analytics

## Quality Gate

- Croqui approval (QG-DA-002) is a BLOCKING gate -- no generation without approved croqui
- Render quality validation (QG-DA-003) is a BLOCKING gate -- no delivery of failed renders
- Maximum 2 re-generation attempts on quality failure before human escalation
- SLA breach must be logged and analyzed (never silently ignored)
- All inter-agent handoffs must be validated: receiving agent confirms it has required inputs
- Error recovery must be automatic where possible (failover) and transparent to user
- No user should experience a dead-end -- every error must have a recovery path
