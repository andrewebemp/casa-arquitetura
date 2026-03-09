# Task: Configure Redis Semantic Cache for Render Reuse

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | configure-cache-strategy |
| **status** | `pending` |
| **responsible_executor** | @pipeline-optimizer |
| **execution_type** | `Agent` |
| **input** | Pipeline operation patterns + cache requirements + infrastructure constraints |
| **output** | Cache strategy configuration with TTL policies, invalidation rules, and cost savings projections |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Configure a Redis-based semantic caching layer to reuse intermediate pipeline results and reduce redundant GPU computation. Multiple users staging similar rooms with the same style produce overlapping pipeline outputs (especially depth maps, segmentation masks, and base renders). Semantic caching identifies "close enough" requests and serves cached results instead of recomputing, dramatically reducing cost and latency. This task designs the caching strategy including cache keys, similarity thresholds, TTL policies, and invalidation rules.

## Inputs

- Pipeline operation patterns (which steps produce cacheable outputs)
- Expected usage patterns (renders per day, refinement frequency, style distribution)
- Infrastructure constraints (Redis memory limits, persistence requirements)
- Quality requirements (when is a cached result "close enough"?)
- Cost targets (how much should caching save per render?)

## Preconditions

- Pipeline architecture defined and operational
- Redis instance available or planned
- Usage pattern estimates available (from market analysis)
- Understanding of which pipeline outputs are reusable

## Steps

1. **Identify cacheable pipeline outputs**
   - Depth maps: highly cacheable, same photo always produces same depth map
   - Segmentation masks: cacheable per photo, deterministic output
   - Style prompts: cacheable per style+room_type combination
   - Base renders: cacheable if same photo+style+seed combination
   - Quality scores: cacheable per render (static once computed)
   - NOT cacheable: user-specific refinements (unique instructions)
   - Classify each: exact-match cache vs semantic-similarity cache

2. **Design cache key strategy**
   - Exact-match keys: hash of input image + model version
     - `depth:{sha256(image)}:{model_version}` -> depth map
     - `segmentation:{sha256(image)}:{model_version}` -> segmentation mask
   - Semantic keys: embedding-based similarity for style lookups
     - `style_prompt:{room_type}:{style_name}:{variant}` -> prompt package
   - Composite keys for renders:
     - `render:{sha256(depth_map)}:{style_hash}:{seed}` -> generated render
   - Key namespace: prefix all with `decorai:cache:`

3. **Configure semantic similarity matching**
   - For similar (not identical) requests, use CLIP embedding similarity:
     - Embed the new request (photo + style + prompt)
     - Search cache for entries with cosine similarity > threshold
     - Threshold: 0.92 for depth maps, 0.85 for style prompts, 0.95 for renders
   - Use Redis vector search (RediSearch) for efficient similarity queries
   - Balance: higher threshold = more cache misses, lower threshold = quality risk

4. **Define TTL and eviction policies**
   - Depth maps: TTL 7 days (photo doesn't change, depth is deterministic)
   - Segmentation masks: TTL 7 days (same reasoning as depth maps)
   - Style prompts: TTL 30 days (styles don't change frequently)
   - Base renders: TTL 24 hours (more volatile, style preferences change)
   - Quality scores: TTL 30 days (static once computed)
   - Eviction policy: allkeys-lru (least recently used)
   - Max memory: configurable, recommended 2-8GB depending on volume

5. **Design cache invalidation rules**
   - Model version change -> invalidate all cached outputs for that model
   - Style definition update -> invalidate style prompts and associated renders
   - User requests "fresh render" -> bypass cache for this request
   - Quality threshold change -> invalidate quality scores
   - Manual purge command for operations team
   - Automatic invalidation on pipeline configuration changes

6. **Project cost savings**
   - Estimate cache hit rates per output type:
     - Depth maps: 80-90% hit rate (same photos reanalyzed)
     - Segmentation masks: 75-85% hit rate
     - Style prompts: 95%+ hit rate (finite style set)
     - Base renders: 20-40% hit rate (more unique combinations)
   - Calculate GPU cost saved per cache hit (from analyze-cost-per-render)
   - Calculate total monthly savings at projected volumes
   - Compare savings vs Redis infrastructure cost

7. **Compile cache configuration document**
   - Redis configuration recommendations (memory, persistence, replicas)
   - Cache key schema with examples
   - Similarity thresholds per output type
   - TTL policies table
   - Invalidation rules
   - Cost savings projection
   - Monitoring metrics (hit rate, miss rate, memory usage, latency)

## Outputs

- **Cache Configuration Spec** (Redis setup, memory, persistence)
- **Cache Key Schema** with naming conventions and examples
- **Similarity Threshold Matrix** per output type
- **TTL Policy Table** with durations and rationale
- **Invalidation Rules** document
- **Cost Savings Projection** with cache hit rate estimates
- **Monitoring Dashboard Spec** for cache performance

## Acceptance Criteria

- [ ] All cacheable pipeline outputs identified and classified (exact vs semantic)
- [ ] Cache key strategy defined with naming conventions and examples
- [ ] Semantic similarity thresholds set per output type with quality justification
- [ ] TTL policies defined for each cache category with rationale
- [ ] Invalidation rules cover model updates, config changes, and manual purge
- [ ] Cost savings projected with cache hit rate estimates
- [ ] Redis configuration recommendations provided (memory, persistence, eviction)

## Quality Gate

- Cached renders served to users must be indistinguishable from fresh renders
- Semantic similarity threshold must be validated: test that cache hits at threshold produce acceptable quality
- Cache must never serve stale results from outdated model versions
- Redis memory usage must be monitored with alerts at 80% capacity
- Cache miss latency overhead must be < 100ms (the lookup cost shouldn't slow down uncached requests)
- Cost savings must exceed Redis infrastructure costs by at least 3x to justify the caching layer
