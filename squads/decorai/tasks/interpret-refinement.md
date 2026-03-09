# Task: Interpret Natural Language Refinement Instruction

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | interpret-refinement |
| **status** | `pending` |
| **responsible_executor** | @conversational-designer |
| **execution_type** | `Agent` |
| **input** | Natural language refinement instruction from user + current render context |
| **output** | Structured pipeline operation mapped from the instruction |
| **action_items** | 8 steps |
| **acceptance_criteria** | 8 criteria |

## Purpose

Interpret natural language refinement instructions from users and map them to specific pipeline operations that @staging-architect can execute. Users express design changes in varied, often ambiguous ways ("make it warmer", "the sofa looks weird", "more plants please", "try something more modern"). This task translates human intent into actionable technical operations: element replacement, style adjustment, object addition/removal, or full regeneration. Implements FR-04 (visual chat refinement), FR-05 (natural language element changes), FR-06 (selective editing via chat).

## Inputs

- Natural language instruction from user (text)
- Current render image and its metadata (style, parameters, generation seed)
- Current spatial data (room dimensions, structural elements)
- Version history of previous refinements (if any)
- User specification history (preferences, constraints expressed earlier)

## Preconditions

- At least one render exists for the current room
- Render metadata available (style, prompt, ControlNet parameters)
- User has provided a refinement instruction (not a new project request)

## Steps

1. **Classify instruction type**
   - Style change: "make it more modern", "try boho style"
   - Element replacement: "change the floor to wood", "swap the sofa"
   - Object addition: "add some plants", "put a rug there"
   - Object removal: "remove the chair", "take away the lamp"
   - Color adjustment: "warmer tones", "less blue", "brighter walls"
   - Lighting change: "more natural light", "make it cozier"
   - Composition change: "move the sofa to the left", "rearrange furniture"
   - Quality complaint: "looks fake", "proportions are wrong"
   - Ambiguous: cannot determine intent -> route to resolve-ambiguity

2. **Extract specific parameters**
   - Target element: what exactly to change (wall, floor, sofa, lighting)
   - Desired state: what it should become (wood floor, white walls, warmer)
   - Scope: entire room vs specific area vs single element
   - Intensity: subtle change vs dramatic change ("a bit warmer" vs "completely different")
   - Constraints: what should NOT change ("keep the floor but change the walls")

3. **Map to pipeline operation**
   - Style change -> `apply-style` task on @staging-architect
   - Element replacement -> `segment-element` task on @staging-architect
   - Object addition -> partial regeneration with modified prompt
   - Object removal -> `remove-object` task on @staging-architect
   - Color adjustment -> prompt modification + regeneration
   - Lighting change -> `enhance-lighting` or prompt modification
   - Composition change -> full regeneration with layout guidance
   - Quality complaint -> `diagnose-artifacts` on @visual-quality-engineer

4. **Determine modification scope**
   - Full regeneration: style change, composition change, major overhaul
   - Partial regeneration: element replacement, object add/remove
   - Post-processing only: color adjustment, lighting enhancement
   - Select the minimum-scope operation that achieves the desired result

5. **Validate against user specifications**
   - Check if refinement conflicts with previously stated preferences (FR-28)
   - If conflict detected, inform user: "You mentioned you wanted wood floors, but this change would replace them. Proceed?"
   - Maintain specification history across refinement rounds

6. **Compose operation instruction for @staging-architect**
   - Structured operation object with:
     - Operation type (replace, add, remove, restyle, regenerate)
     - Target element(s)
     - New specification
     - Scope (full, partial, post-process)
     - Constraints (preserve these elements)
     - Modified prompt (if applicable)
     - Modified parameters (if applicable)

7. **Estimate operation impact**
   - Time estimate: quick (< 30s for post-process), medium (30-90s for partial), long (90s+ for full)
   - Cost impact: low (reuse existing), medium (partial generation), high (full regeneration)
   - Quality impact: preserves quality, may affect quality, improves quality
   - Inform user of expected time before executing

8. **Route to executing agent**
   - Send structured operation to @staging-architect
   - Include current render metadata for continuity
   - Include version history for tracking
   - Set expectation with user ("Adjusting the floor to oak wood, this will take about 30 seconds")

## Outputs

- **Classified instruction type** with confidence level
- **Extracted parameters** (target, desired state, scope, intensity, constraints)
- **Mapped pipeline operation** (structured instruction for @staging-architect)
- **Specification compliance check** (conflicts with prior preferences noted)
- **Operation impact estimate** (time, cost, quality)

## Acceptance Criteria

- [ ] Instruction correctly classified into one of 8 types
- [ ] Target element and desired state extracted from natural language
- [ ] Operation scope determined (full/partial/post-process)
- [ ] Pipeline operation mapped to specific @staging-architect task
- [ ] Structured operation instruction generated with all required fields
- [ ] Specification compliance checked against user history (FR-28)
- [ ] Operation impact estimated (time, cost)
- [ ] If instruction is ambiguous, correctly routed to resolve-ambiguity task

## Quality Gate

- Never execute an operation without interpreting it first -- raw NL instructions do not go to staging
- If classification confidence < 70%, route to resolve-ambiguity instead of guessing
- Specification compliance check is mandatory for every refinement (FR-28)
- Prefer minimum-scope operations (partial over full regeneration) to save time and cost
- Maintain and update version history after each refinement
- User must be informed of expected time before operation begins
