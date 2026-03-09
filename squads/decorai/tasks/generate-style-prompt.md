# Task: Convert Style Guide into ControlNet-Ready Prompt

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | generate-style-prompt |
| **status** | `pending` |
| **responsible_executor** | @interior-strategist |
| **execution_type** | `Agent` |
| **input** | Style guide + room spatial data + generation parameters |
| **output** | Complete prompt package with positive/negative prompts and ControlNet parameters |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Convert a complete style guide into a ControlNet-ready prompt package that @staging-architect can directly use for image generation. This is the translation layer between design intent and AI generation parameters. The prompt must encode style, materials, lighting, and mood into text that SDXL/FLUX models interpret correctly, while ControlNet parameters ensure spatial fidelity to the approved croqui.

## Inputs

- Style guide (from create-style-guide task)
- Room spatial data (dimensions, structural elements from @spatial-analyst handoff)
- Target generation model (SDXL or FLUX.2)
- Optional: reference images for IP-Adapter conditioning
- Optional: user-specified emphasis ("focus on the living area", "make it cozy")

## Preconditions

- Complete style guide available for the selected style
- Room spatial data validated and approved
- Knowledge of target model prompt syntax (SDXL vs FLUX differ)

## Steps

1. **Analyze style guide for prompt keywords**
   - Extract primary visual descriptors from each style guide section
   - Map color palette to prompt-effective color terms
   - Convert material specifications to model-recognizable texture keywords
   - Identify lighting keywords that translate well to generation models
   - Note which keywords are high-impact (model responds well) vs low-impact

2. **Compose positive prompt**
   - Structure: `[Quality] [Room type] [Style name] [Key materials] [Colors] [Lighting] [Mood] [Details]`
   - Quality prefix: "professional interior photography, photorealistic, high resolution, 8k"
   - Room context: "spacious living room, 5m x 4m, high ceiling"
   - Style core: "modern minimalist design, clean lines, neutral palette"
   - Materials: "oak wood flooring, white marble countertop, matte walls"
   - Lighting: "warm natural daylight from large window, soft ambient"
   - Mood: "serene, sophisticated, inviting"
   - Details: specific furniture, accessories, plants as per style guide
   - Token budget: keep under 150 tokens for optimal model performance

3. **Compose negative prompt**
   - Universal negatives: "deformed, blurry, low quality, artifacts, unrealistic proportions"
   - Style-specific negatives: exclude elements that conflict with the style
   - Room-specific negatives: "cluttered" for minimalist, "cold" for rustico
   - Structural negatives: "missing walls, floating furniture, incorrect perspective"
   - Quality negatives: "oversaturated, cartoon, painting, sketch, rendering artifacts"

4. **Configure ControlNet parameters**
   - Depth conditioning weight: 0.8-1.0 (higher for strict spatial adherence)
   - Segmentation conditioning weight: 0.4-0.7 (style-dependent)
   - Canny/edge conditioning weight: 0.3-0.5 (if architectural preservation needed)
   - Model selection: depth_v2, seg_ofade20k, or canny based on needs
   - Resolution: match target output (1024x1024)

5. **Set generation parameters**
   - CFG Scale: style-dependent (minimalist 7-8, classic 8.5-9.5, boho 7-8.5)
   - Steps: SDXL 35-50, FLUX 25-35
   - Sampler: DPM++ 2M Karras (SDXL) or default (FLUX)
   - Scheduler: Karras
   - Seed: -1 for random, preserve after successful generation
   - Optional: IP-Adapter weight if reference images provided (0.4-0.7)

6. **Create prompt variations**
   - Generate 3 prompt variations emphasizing different aspects:
     - Variation A: material-focused (emphasizes textures and surfaces)
     - Variation B: lighting-focused (emphasizes mood and ambiance)
     - Variation C: furniture-focused (emphasizes layout and furnishing)
   - Each variation uses the same ControlNet parameters for spatial consistency

7. **Package prompt for @staging-architect**
   - Compile all elements into a structured handoff:
     - Positive prompt (primary + 2 variations)
     - Negative prompt
     - ControlNet configuration (models, weights, resolution)
     - Generation parameters (CFG, steps, sampler, scheduler)
     - IP-Adapter configuration (if reference images provided)
     - Style validation keywords (for CLIP Score checking)

## Outputs

- **Primary positive prompt** (under 150 tokens, optimized for model)
- **2 prompt variations** (material-focused, lighting-focused, furniture-focused)
- **Negative prompt** (universal + style-specific + room-specific)
- **ControlNet configuration** (models, weights, resolution)
- **Generation parameters** (CFG, steps, sampler, seed strategy)
- **Style validation keywords** for post-generation CLIP Score verification

## Acceptance Criteria

- [ ] Positive prompt structured correctly: quality + room + style + materials + lighting + mood
- [ ] Positive prompt under 150 tokens for optimal model performance
- [ ] Negative prompt includes universal, style-specific, and room-specific exclusions
- [ ] ControlNet weights set appropriately for the style (documented rationale)
- [ ] CFG Scale and steps configured for the target model (SDXL vs FLUX)
- [ ] At least 3 prompt variations generated for different emphasis
- [ ] Complete package structured for direct consumption by @staging-architect

## Quality Gate

- Prompt must NOT contain contradictory keywords (e.g., "warm" and "cold" simultaneously)
- ControlNet depth weight must be >= 0.7 to ensure spatial structure preservation
- Token count must be verified -- overly long prompts degrade generation quality
- Each prompt variation must be meaningfully different, not trivially altered
- Style validation keywords must match the style guide core descriptors
- If model is FLUX, prompt syntax must adapt (FLUX uses natural language, not keyword stacking)
