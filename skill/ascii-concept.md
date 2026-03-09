---
name: ascii-concept
description: Generate ASCII flowcharts and diagrams for workflows, pipelines, and processes before building. Use when the user wants to build an n8n workflow, automation pipeline, API flow, state machine, decision tree, or any multi-step process.
---

# ASCII Concept — Sketch Flows Before Building Them

Plan any workflow, pipeline, or process by drawing it in ASCII before writing a single node or line of code. This catches missing branches, error paths, and edge cases before they become bugs.

## When to Use

User says: "build a workflow", "create an automation", "n8n workflow", "API pipeline", "state machine", "decision tree", "data flow", or any request involving a multi-step process with branching logic.

## The 3-Turn Technique

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

```
[1-2 specific fixes]. Redraw. Nothing else changes.
```

**Examples of good Turn 2 prompts:**
- "Both branches should end symmetrically with Log to DB then END. Add (HubSpot POST) beside Create New Contact."
- "Add a retry loop on the API call — max 3 attempts with exponential backoff, then fail to error handler."
- "The 'not found' path is missing. If the user doesn't exist, create them first, then merge back into the main flow."

**Key rules for Turn 2:**
- Focus on missing branches and error paths — these are what Claude skips
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

## Example: Lead Qualification Workflow

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

## Process Types This Covers

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

## ASCII Flow Notation

Use this consistent notation:

```
[Node Name]          — a step/action
(annotation)         — clarifying detail on a node
→                    — flow direction
CONDITION →          — branch label (e.g., VALID →, score < 50 →)
merge                — branches rejoin
END                  — terminal node
```

## Why This Works

Without a flowchart, Claude builds the happy path and stops. The error branch, the "not found" path, the logging step — gone. The ASCII makes every branch visible before you build a single node. You catch missing paths in 30 seconds instead of discovering them in production.
