# Task: Verify Refinement Respects User Specifications

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | validate-specification-compliance |
| **status** | `pending` |
| **responsible_executor** | @conversational-designer |
| **execution_type** | `Agent` |
| **input** | Proposed refinement operation + user specification history |
| **output** | Compliance verdict (pass/conflict) with conflict details if applicable |
| **action_items** | 6 steps |
| **acceptance_criteria** | 6 criteria |

## Purpose

Verify that a proposed refinement operation does not violate previously stated user specifications and preferences (FR-28). Users build up a set of preferences over the conversation ("I want wood floors", "no dark colors", "keep the plants"). Subsequent refinement instructions must be checked against this accumulated specification set to prevent contradictions. If a conflict is detected, the user is informed and asked to confirm whether to override the earlier specification.

## Inputs

- Proposed refinement operation (from interpret-refinement)
- User specification history (accumulated preferences and constraints)
- Current render metadata (style, elements present)
- Conversation history for context

## Preconditions

- At least one specification exists in user history
- A refinement operation has been proposed and structured
- Specification history is accessible from session state

## Steps

1. **Load specification history**
   - Retrieve all user specifications from the current session:
     - Explicit preferences: "I want X", "I like Y"
     - Explicit constraints: "No X", "Don't change Y", "Keep Z"
     - Implicit preferences: consistently chosen options, rejected alternatives
   - Organize by category: style, color, material, furniture, layout, lighting
   - Assign confidence to each specification: explicit (100%), consistent choice (80%), single mention (60%)

2. **Analyze proposed operation impact**
   - Identify which elements the operation will change
   - Identify which elements the operation will preserve
   - Determine the scope: which specification categories are affected
   - Map operation effects to specification categories

3. **Check for direct conflicts**
   - For each affected specification category:
     - Does the operation directly contradict a stated preference?
     - Example: Spec "wood floors" + Operation "change floor to marble" = CONFLICT
     - Example: Spec "no dark colors" + Operation "navy blue accent wall" = CONFLICT
   - Classify conflicts:
     - Hard conflict: directly contradicts explicit constraint ("No X" and operation does X)
     - Soft conflict: contradicts implicit preference (user chose warm tones 3 times, operation goes cool)

4. **Check for indirect conflicts**
   - Does the operation change something the user previously said to keep?
   - Does the operation's style implication conflict with chosen style?
   - Does the operation affect an element that was in a "favorite" version?
   - Example: User saved v1.2 as favorite (had green plants), operation removes plants

5. **Generate compliance verdict**
   - PASS: no conflicts detected, operation is compliant
   - SOFT WARNING: indirect or implicit conflicts detected, proceed with note
   - HARD CONFLICT: direct contradiction with explicit specification
   - For each conflict, provide:
     - The conflicting specification (with original user quote)
     - The conflicting operation detail
     - Suggested resolution options

6. **Handle conflicts**
   - For SOFT WARNING: inform user and proceed with acknowledgment
   - For HARD CONFLICT: present conflict to user and ask:
     - Option A: Override the earlier specification (update spec history)
     - Option B: Modify the operation to respect the specification
     - Option C: Cancel the operation
   - Update specification history based on user's decision

## Outputs

- **Compliance Verdict**: PASS, SOFT WARNING, or HARD CONFLICT
- **Conflict Details** (if applicable): specification vs operation comparison
- **Resolution Options** (if conflict): override, modify, or cancel
- **Updated Specification History** (after user decision on conflicts)

## Acceptance Criteria

- [ ] All user specifications loaded and organized by category
- [ ] Proposed operation impact correctly analyzed (what changes, what stays)
- [ ] Direct conflicts detected when operation contradicts explicit preferences
- [ ] Indirect conflicts detected when operation affects implicitly preferred elements
- [ ] Conflict verdict clearly communicated with original user quotes
- [ ] Resolution options provided for each conflict (override, modify, cancel)

## Quality Gate

- Every refinement operation MUST pass through specification compliance before execution (FR-28)
- Explicit user constraints ("No X", "Keep Y") have absolute priority -- cannot be silently overridden
- Specification history must be updated when user explicitly overrides a previous preference
- False positives (flagging conflicts that are not real) should be minimized -- only flag meaningful contradictions
- The compliance check must add minimal latency (< 2 seconds) to the refinement workflow
- Specification history should not grow unbounded -- consolidate redundant specifications
