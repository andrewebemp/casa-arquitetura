# ASCII Flowchart — Sketch Flows Before Building

> **Task ID:** ascii-flowchart
> **Agent:** Architect
> **Phase:** 1 - Architecture Design
> **Interactive:** Yes (elicit=true)

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: asciiFlowchart()
responsável: Aria (Visionary)
responsavel_type: Agente
atomic_layer: Template

**Entrada:**
- campo: process_description
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Description of the workflow/pipeline/process to diagram

- campo: output_format
  tipo: string
  origem: User Input
  obrigatório: false
  validação: n8n JSON | Python | Node.js | shell script | etc.

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: ascii_flowchart
  tipo: string
  destino: Memory
  persistido: false

- campo: implementation
  tipo: object
  destino: File (project source)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] User has described the process/workflow to diagram
    tipo: pre-condition
    blocker: true
    validação: |
      User provided a description of the workflow, pipeline, or process
    error_message: "Describe the process you want to flowchart first"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] ASCII flowchart generated and approved by user
    tipo: post-condition
    blocker: true
    validação: |
      Flowchart exists and user confirmed via Turn 2
    error_message: "Flowchart must be approved before building"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Flowchart shows ALL branches (happy path, error path, edge cases)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Every branch has a clear path and termination
    error_message: "All branches must be visible in the flowchart"
  - [ ] Every node/step is explicitly named
    tipo: acceptance-criterion
    blocker: true
    validação: |
      No unnamed nodes in the flowchart
    error_message: "All flowchart nodes must be labelled"
  - [ ] Implementation matches flowchart exactly (if Turn 3 executed)
    tipo: acceptance-criterion
    blocker: false
    validação: |
      Every branch from flowchart present in code
    error_message: "Code must implement every branch from flowchart"
```

---

## 📋 Description

Plan any workflow, pipeline, or process by drawing it in ASCII before writing a single node or line of code. This catches missing branches, error paths, and edge cases before they become bugs. Uses the **3-Turn Technique**: Flowchart → Fix Gaps → Build.

**When to use:** User says "build a workflow", "create an automation", "n8n workflow", "API pipeline", "state machine", "decision tree", "data flow", or any request involving a multi-step process with branching logic.

---

## 🔄 The 3-Turn Technique

### Turn 1 — Generate the Flowchart

```
Before building anything, create an ASCII flowchart of [the process].
Show every step as a labelled box. Use arrows (→ ↓ ←) for flow.
Include ALL branches — happy path, error path, edge cases.
No code yet.
```

**Key rules for Turn 1:**
- Name every node/step explicitly
- Ask for ALL branches, not just the happy path
- Specify the trigger (webhook, cron, manual, event)
- Mention any external services (HubSpot, Slack, Supabase, etc.)

### Turn 2 — Fix Gaps

**Present flowchart to user and ask for changes:**

```
[1-2 specific fixes]. Redraw. Nothing else changes.
```

**Examples of good Turn 2 prompts:**
- "Both branches should end symmetrically with Log to DB then END. Add (HubSpot POST) beside Create New Contact."
- "Add a retry loop on the API call — max 3 attempts with exponential backoff, then fail to error handler."
- "The 'not found' path is missing. If the user doesn't exist, create them first, then merge back into the main flow."

**Key rules for Turn 2:**
- Focus on missing branches and error paths — these are what gets skipped
- Ensure symmetry: every branch should have a clear termination
- Add service annotations like `(Slack POST)` or `(Supabase INSERT)` for clarity

### Turn 3 — Build to Spec

```
Build this as [n8n workflow JSON / Python script / Node.js / etc.].
The flowchart is the complete specification — every branch must be present.

[Paste the final ASCII flowchart]

[Requirements: placeholder credentials, specific node types, error handling, etc.]
```

**Key rules for Turn 3:**
- Say "every branch must be present" — this is the whole point
- Paste the flowchart INTO the build prompt
- Specify the output format (n8n JSON, Python, shell script, etc.)

---

## 📊 Process Types This Covers

| Process Type | Key flowchart elements |
|-------------|----------------------|
| n8n / Zapier workflow | Trigger, branches, API calls, error handlers, termination |
| CI/CD pipeline | Build → Test → Deploy stages, rollback paths, approval gates |
| Data pipeline | Extract → Transform → Load, validation checks, retry logic |
| API request flow | Auth → Validate → Process → Respond, error codes per path |
| State machine | States as boxes, transitions as arrows, guards as labels |
| Decision tree | Root question → branching conditions → leaf actions |
| Onboarding flow | Step sequence, skip conditions, completion checks |
| Approval workflow | Submit → Review → Approve/Reject → Notify, escalation paths |

---

## 🎨 ASCII Flow Notation

```
[Node Name]          — a step/action
(annotation)         — clarifying detail on a node
→                    — flow direction
CONDITION →          — branch label (e.g., VALID →, score < 50 →)
merge                — branches rejoin
END                  — terminal node
```

---

## 🎨 Example: Lead Qualification Workflow

**Turn 1:**
```
Before building anything in n8n, create an ASCII flowchart of a lead qualification workflow — webhook in, validate, CRM lookup, score check, route to sales or nurture. No code yet.
```

**Turn 2:**
```
Both branches should end symmetrically with Log to DB → END. Also add "(HubSpot POST)" beside Create New Contact. Redraw.
```

**Turn 3:**
```
Build this as an n8n workflow JSON I can import directly. Every branch exactly as shown:

[WEBHOOK] → [Parse & Validate]
  INVALID → [Send Error Email] → END
  VALID → [Lookup Contact in CRM]
    NOT FOUND → [Create New Contact (HubSpot POST)] → merge
    FOUND → merge
  → [Check Lead Score]
    < 50  → [Add to Nurture Sequence] → [Log to DB] → END
    ≥ 50  → [Notify Sales Slack] → [Create CRM Task] → [Log to DB] → END

Every branch present. No missing paths.
Nodes: Webhook, Code JS, HTTP Request, IF, Slack, Supabase. Placeholder credentials.
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Missing Error Paths
   - **Cause:** User only described the happy path
   - **Resolution:** Explicitly ask "What happens if X fails?"
   - **Recovery:** Add error branches in Turn 2

2. **Error:** Asymmetric Branches
   - **Cause:** Some branches don't terminate cleanly
   - **Resolution:** Ensure every path ends with END or loops back
   - **Recovery:** Identify unterminated paths, fix in Turn 2

---

## Performance

```yaml
duration_expected: 2-5 min
cost_estimated: $0.001-0.003
token_usage: ~500-2,000 tokens
```

---

## ✅ Success Criteria

- [ ] ASCII flowchart generated with all branches visible
- [ ] Every node explicitly named
- [ ] Error paths and edge cases included
- [ ] User had opportunity to fix gaps (Turn 2)
- [ ] Implementation includes every branch (if Turn 3 executed)

---

## 🔄 Integration with Other Tasks

**Previous Steps:**
- `*create-full-stack-architecture` - Use architecture context to inform flow

**Next Steps:**
- `*ascii-diagram` - Diagram the data structures the flow operates on
- `*create-plan` - Create implementation plan from the flow

**State Management:**
Updates `.state.yaml` with:
- `ascii_flowcharts_created: [list of flow names]`
- `ascii_flowchart_date: [ISO date]`

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - ascii
  - flowchart
  - workflow
  - pipeline
  - architecture
updated_at: 2026-03-08
```
