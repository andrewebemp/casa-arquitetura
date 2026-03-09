---
name: ascii-design
description: Generate ASCII wireframes for UI layouts before building. Use when the user wants to build a dashboard, landing page, form, settings page, or any visual interface. Sketches the layout first in ASCII, iterates, then builds to spec.
---

# ASCII Design — Sketch First, Build Second

Plan any UI by drawing it in ASCII before writing a single line of code. This eliminates the gap between what's in your head and what Claude builds.

## When to Use

User says: "build me a dashboard", "make a landing page", "create a settings page", "design a form", "build a UI", or any request for a visual interface.

## The 3-Turn Technique

Every UI goes through three turns. Never skip straight to code.

### Turn 1 — Generate the Wireframe

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
- You can do multiple Turn 2s — iteration is free (no tokens wasted on code)

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
- Specify your stack
- Add annotations with circled numbers if needed:
  - `① Sidebar collapsible on mobile`
  - `② Line chart uses brand blue (#2563EB)`
  - `③ [+ New] opens a slide-in drawer`

## Example: SaaS Dashboard

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

[paste wireframe]

My annotations:
① Sidebar collapsible on mobile — add hamburger toggle
② Line chart uses brand blue (#2563EB)
③ [+ New] opens a slide-in drawer from the right

Mock data. Spin it up on localhost:3001.
```

## UI Types This Covers

| UI Type | Key wireframe elements |
|---------|----------------------|
| Dashboard | Sidebar, stat cards, charts, data tables |
| Landing page | Navbar, hero (50/50 split), features grid, pricing tiers, footer |
| Settings page | Tabbed sections, form groups, toggle switches, save bar |
| Form / wizard | Step indicators, field groups, validation states, submit flow |
| E-commerce | Product grid, filters sidebar, cart drawer, checkout steps |
| Admin panel | Nav, breadcrumbs, CRUD table, detail drawer, action buttons |
| Blog / content | Header, article body, sidebar widgets, related posts grid |

## Why This Works

When you describe a UI in text, Claude interprets it — it fills in gaps about layout, proportions, and hierarchy. When you show it an ASCII wireframe, there are no gaps to fill. It executes against a picture, not a description. First-try accuracy instead of 30 minutes of corrections.
