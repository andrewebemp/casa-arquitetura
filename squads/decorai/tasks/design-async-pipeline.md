# Task: Design Async Processing Pipeline with WebSocket Feedback

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | design-async-pipeline |
| **status** | `pending` |
| **responsible_executor** | @pipeline-optimizer |
| **execution_type** | `Agent` |
| **input** | Pipeline architecture + latency requirements + UX constraints |
| **output** | Async pipeline design with WebSocket feedback protocol and queue architecture |
| **action_items** | 8 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Design the asynchronous processing pipeline that handles render generation without blocking the user interface. Virtual staging renders take 30-120 seconds, which is too long for synchronous HTTP requests. The pipeline must queue jobs, process them through multiple GPU-dependent steps, and provide real-time progress feedback to the user via WebSocket connections. This creates the perception of speed and responsiveness even when GPU processing takes significant time. Key design goals: no lost jobs, graceful degradation, and accurate progress reporting.

## Inputs

- Pipeline architecture (steps, dependencies, GPU requirements)
- Latency requirements per step (from benchmark-gpu-providers)
- UX constraints: user must see progress, not a blank loading screen
- Infrastructure constraints: serverless vs long-running workers
- Reliability requirements: zero lost jobs, at-least-once delivery

## Preconditions

- Pipeline steps defined and tested individually
- GPU provider selected and accessible
- Message queue technology available (Redis, SQS, or similar)
- WebSocket infrastructure planned (Socket.io, native WS, or SSE)

## Steps

1. **Map pipeline as a directed acyclic graph (DAG)**
   - Define each step as a node:
     - Node 1: Photo validation & preprocessing
     - Node 2: Depth estimation (GPU)
     - Node 3: Segmentation (GPU)
     - Node 4: Prompt composition (CPU)
     - Node 5: Image generation (GPU, heaviest step)
     - Node 6: Quality validation (GPU, lightweight)
     - Node 7: Post-processing (CPU)
     - Node 8: Upscaling (GPU, optional)
   - Define edges (dependencies): 2 and 3 can run parallel, 5 depends on 2+3+4
   - Identify critical path: longest sequential chain determines minimum latency

2. **Design job queue architecture**
   - Job structure: `{ job_id, user_id, room_id, steps: [], status, created_at, metadata }`
   - Queue technology: Redis Streams (reliable, ordered, consumer groups)
   - Queue topology: one queue per pipeline step for independent scaling
   - Dead letter queue for failed jobs (max 3 retries per step)
   - Priority queues: paid users priority over free diagnostic users
   - Job TTL: expire unprocessed jobs after 15 minutes

3. **Design worker architecture**
   - Workers per step type:
     - CPU workers: photo validation, prompt composition, post-processing
     - GPU workers: depth estimation, segmentation, generation, upscaling
   - Worker scaling: auto-scale GPU workers based on queue depth
   - Worker concurrency: configurable per step (1 for GPU-bound, N for CPU-bound)
   - Worker health: heartbeat monitoring, auto-restart on failure
   - Worker isolation: each worker processes one job at a time (no GPU memory sharing)

4. **Design WebSocket feedback protocol**
   - Connection: user connects on render request, receives channel_id
   - Event types:
     - `job:queued` - { position_in_queue, estimated_wait }
     - `job:started` - { step_name, step_number, total_steps }
     - `step:progress` - { step_name, percent, elapsed_time }
     - `step:completed` - { step_name, thumbnail_preview } (if applicable)
     - `job:completed` - { render_url, quality_score, total_time }
     - `job:failed` - { error_type, message, retry_available }
   - Heartbeat: server sends ping every 15 seconds to keep connection alive
   - Reconnection: client auto-reconnects and receives missed events from buffer

5. **Design progress estimation**
   - Use historical timing data to estimate per-step duration
   - Calculate cumulative progress percentage:
     - Step 1 (validation): 0-5%
     - Step 2 (depth): 5-15%
     - Step 3 (segmentation): 5-15% (parallel with step 2)
     - Step 4 (prompt): 15-20%
     - Step 5 (generation): 20-80% (the big one)
     - Step 6 (quality): 80-90%
     - Step 7 (post-processing): 90-95%
     - Step 8 (upscaling): 95-100% (if requested)
   - Smooth progress bar: interpolate between events for perceived smoothness
   - Never let progress go backward

6. **Design error handling and recovery**
   - Per-step retry: automatic retry up to 3 times with exponential backoff
   - Step-level checkpointing: save intermediate results to resume from last successful step
   - GPU provider failover: if primary fails, route to secondary provider
   - Partial failure: deliver partially processed result with explanation if possible
   - User notification: clear error messages with actionable options (retry, try different style)
   - Dead letter queue monitoring: alert operations on recurring failures

7. **Design job lifecycle management**
   - Job states: created -> queued -> processing -> completed/failed
   - State transitions logged for debugging and analytics
   - Job cleanup: completed jobs archived after 24 hours, results stored in CDN
   - Cancellation: user can cancel a queued or in-progress job
   - Deduplication: prevent duplicate submissions within 5-second window

8. **Compile async pipeline design document**
   - Pipeline DAG diagram with timing estimates per step
   - Queue architecture with technology choices
   - Worker architecture with scaling policies
   - WebSocket protocol specification
   - Progress estimation algorithm
   - Error handling and recovery procedures
   - Job lifecycle state machine
   - Monitoring and alerting requirements

## Outputs

- **Pipeline DAG Diagram** with step dependencies and critical path
- **Queue Architecture Spec** (technology, topology, configuration)
- **Worker Architecture Spec** (types, scaling, concurrency)
- **WebSocket Protocol Spec** (events, payloads, reconnection)
- **Progress Estimation Algorithm** with per-step weights
- **Error Handling Spec** (retries, failover, recovery)
- **Job Lifecycle State Machine** with transitions
- **Monitoring Requirements** (metrics, alerts, dashboards)

## Acceptance Criteria

- [ ] Pipeline DAG defined with all steps, dependencies, and critical path
- [ ] Job queue architecture designed with reliable delivery (at-least-once)
- [ ] Worker architecture supports independent scaling per step type
- [ ] WebSocket protocol defined with all event types and payloads
- [ ] Progress estimation provides smooth, accurate (within 20%) time estimates
- [ ] Error handling covers retries, failover, and partial failure scenarios
- [ ] Job lifecycle includes all states with clean transitions
- [ ] Monitoring requirements defined for queue depth, worker health, and latency

## Quality Gate

- No job may be silently lost -- every submitted job must complete, fail with notification, or expire with notification
- WebSocket reconnection must recover state without duplicate events
- Progress must never decrease -- only forward movement is acceptable to users
- Queue depth alerts must fire before user experience degrades (queue wait > 2 minutes)
- Worker auto-scaling must react within 30 seconds of queue depth increase
- End-to-end latency (submit to deliver) must be < 120 seconds for standard renders in 95th percentile
- The design must work with serverless GPU providers (no assumption of persistent workers)
