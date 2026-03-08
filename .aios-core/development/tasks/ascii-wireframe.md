# ASCII Wireframe — Sketch UI Before Building

> **Task ID:** ascii-wireframe
> **Agent:** UX-Design Expert
> **Phase:** 1 - UX Design
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
task: asciiWireframe()
responsável: Uma (Empathizer)
responsavel_type: Agente
atomic_layer: Template

**Entrada:**
- campo: ui_description
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Description of the UI to wireframe

- campo: tech_stack
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Target tech stack (React, HTML, Next.js, etc.)

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: ascii_wireframe
  tipo: string
  destino: Memory
  persistido: false

- campo: implementation_code
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
  - [ ] User has described the UI they want to build
    tipo: pre-condition
    blocker: true
    validação: |
      User provided a description of screens, layout, or components
    error_message: "Describe the UI you want to wireframe first"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] ASCII wireframe generated and approved by user
    tipo: post-condition
    blocker: true
    validação: |
      Wireframe exists and user confirmed it via Turn 2
    error_message: "Wireframe must be approved before building"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Wireframe uses box-drawing characters (┌ ─ ┬ ┐ │ ├ └ ┘)
    tipo: acceptance-criterion
    blocker: true
    validação: |
      ASCII wireframe uses proper notation
    error_message: "Wireframe must use box-drawing characters"
  - [ ] All sections explicitly named and positioned
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Every section in wireframe has a label
    error_message: "All wireframe sections must be labelled"
  - [ ] Code matches wireframe exactly (if Turn 3 executed)
    tipo: acceptance-criterion
    blocker: false
    validação: |
      Implementation matches the wireframe specification
    error_message: "Code must match wireframe layout"
```

---

## 📋 Description

Plan any UI by drawing it in ASCII before writing a single line of code. This eliminates the gap between what's in the user's head and what gets built. Uses the **3-Turn Technique**: Generate → Iterate → Build.

**When to use:** User says "build me a dashboard", "make a landing page", "create a settings page", "design a form", "build a UI", or any request for a visual interface.

**Relation to `*wireframe`:** The `*wireframe` command runs the full UX wireframe workflow (8 steps, research, handoff, atomic design). `*ascii-wireframe` is the **quick sketch** — 3 turns, visual-first, fast iteration.

---

## 🔄 The 3-Turn Technique

### Turn 1 — Generate the Wireframe

**Prompt the user or generate based on context:**

```
Before writing any code, create a detailed ASCII wireframe of [the UI].
Use box-drawing characters (┌ ─ ┬ ┐ │ ├ └ ┘).

The layout should have:
- [List every section: navbar, sidebar, cards, charts, tables, forms, etc.]
- [Specify relationships: "three stat cards side by side", "two charts below the cards"]
- [Note any specific elements: search bar, avatar, status dots, buttons]

Do not write any code. Output only the ASCII wireframe.
```

**Key rules for Turn 1:**
- Be specific about what goes WHERE (side by side vs stacked, left vs right)
- Name every section explicitly
- Specify proportions if they matter ("line chart 60% width, pie chart 40%")

### Turn 2 — Iterate (Free Refinement)

**Present wireframe to user and ask for changes:**

```
[1-2 specific changes only]. Redraw the full wireframe. Nothing else changes.
```

**Examples of good Turn 2 prompts:**
- "Make the line chart noticeably wider than the pie chart. Add status dots in the table: filled for active, empty for inactive."
- "Add a pricing section between features and footer: three tier cards side by side, Pro tier highlighted with double border."
- "Swap the sidebar to the right. Add a hamburger toggle for mobile."

**Key rules for Turn 2:**
- Maximum 2 changes per iteration
- Say "Nothing else changes" to prevent drift
- Ask for a full redraw so you see the complete picture
- You can do multiple Turn 2s — iteration is free (no code wasted)

### Turn 3 — Build to Spec

```
Build this [thing] using the wireframe as the exact specification.

[Paste the final ASCII wireframe here]

[Tech stack]: React + Tailwind / HTML + Tailwind CDN / Next.js / etc.
Match the wireframe exactly. Every layout decision is already made.
[Any additional requirements: mock data, localhost port, responsive, etc.]
```

**Key rules for Turn 3:**
- Always paste the wireframe INTO the build prompt
- Say "exact specification" and "every layout decision is already made"
- Specify the stack
- Add annotations with circled numbers if needed:
  - `① Sidebar collapsible on mobile`
  - `② Line chart uses brand blue (#2563EB)`
  - `③ [+ New] opens a slide-in drawer`

---

## 📊 UI Types This Covers

| UI Type | Key wireframe elements |
|---------|----------------------|
| Dashboard | Sidebar, stat cards, charts, data tables |
| Landing page | Navbar, hero (50/50 split), features grid, pricing tiers, footer |
| Settings page | Tabbed sections, form groups, toggle switches, save bar |
| Form / wizard | Step indicators, field groups, validation states, submit flow |
| E-commerce | Product grid, filters sidebar, cart drawer, checkout steps |
| Admin panel | Nav, breadcrumbs, CRUD table, detail drawer, action buttons |
| Blog / content | Header, article body, sidebar widgets, related posts grid |

---

## 🎨 Example: SaaS Dashboard

**Turn 1:**
```
Before writing any code, create an ASCII wireframe of a SaaS analytics dashboard — sidebar, stat cards, two charts side by side, and a data table below. No code yet.
```

**Turn 2:**
```
Two changes only:
1. Make the line chart feel noticeably wider than the pie chart
2. Status column: filled dot for active, empty for inactive
Redraw the full wireframe. Nothing else changes.
```

**Turn 3:**
```
Build this as a React app with Tailwind CSS using the wireframe as the exact specification:

┌──────────┬──────────────────────────────────────────────┐
│ SIDEBAR  │  Dashboard                                   │
│          │                                              │
│ [Nav 1]  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ [Nav 2]  │  │ Metric 1 │ │ Metric 2 │ │ Metric 3 │    │
│ [Nav 3]  │  │ $12,450  │ │ 1,234    │ │ 89.2%    │    │
│ [Nav 4]  │  └──────────┘ └──────────┘ └──────────┘    │
│          │                                              │
│          │  ┌────────────────────┐ ┌──────────┐        │
│          │  │   Line Chart       │ │ Pie      │        │
│          │  │   (60% width)      │ │ Chart    │        │
│          │  └────────────────────┘ └──────────┘        │
│          │                                              │
│          │  ┌──────────────────────────────────┐        │
│          │  │ Name   │ Status │ Revenue │ Date  │       │
│          │  │ User 1 │ ●      │ $1,200  │ Today │       │
│          │  │ User 2 │ ○      │ $800    │ Yday  │       │
│          │  └──────────────────────────────────┘        │
└──────────┴──────────────────────────────────────────────┘

My annotations:
① Sidebar collapsible on mobile — add hamburger toggle
② Line chart uses brand blue (#2563EB)
③ [+ New] opens a slide-in drawer from the right

Mock data. Spin it up on localhost:3001.
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Vague UI Description
   - **Cause:** User didn't specify enough sections/elements
   - **Resolution:** Ask clarifying questions before generating wireframe
   - **Recovery:** Present UI type table, ask user to pick one

2. **Error:** Too Many Turn 2 Changes
   - **Cause:** User trying to change 3+ things at once
   - **Resolution:** Limit to 1-2 changes per iteration
   - **Recovery:** Split into multiple Turn 2 iterations

---

## Performance

```yaml
duration_expected: 2-5 min
cost_estimated: $0.001-0.003
token_usage: ~500-2,000 tokens
```

---

## ✅ Success Criteria

- [ ] ASCII wireframe generated with box-drawing characters
- [ ] All sections explicitly named
- [ ] User had opportunity to iterate (Turn 2)
- [ ] Code matches wireframe exactly (if Turn 3 executed)

---

## 🔄 Integration with Other Tasks

**Previous Steps:**
- `*research` - Use personas to inform layout decisions

**Next Steps:**
- `*wireframe` - Full wireframe workflow with handoff materials
- `*generate-ui-prompt` - Convert wireframe to AI prompts for v0/Lovable
- `*build` - Implement components from wireframe

**State Management:**
Updates `.state.yaml` with:
- `ascii_wireframes_created: [list of UI names]`
- `ascii_wireframe_date: [ISO date]`

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - ascii
  - wireframe
  - design
  - sketch
updated_at: 2026-03-08
```
