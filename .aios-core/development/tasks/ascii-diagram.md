# ASCII Diagram — Sketch Structures Before Building

> **Task ID:** ascii-diagram
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
task: asciiDiagram()
responsável: Aria (Visionary)
responsavel_type: Agente
atomic_layer: Template

**Entrada:**
- campo: system_description
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Description of the database schema, system, or infrastructure to diagram

- campo: diagram_type
  tipo: string
  origem: User Input
  obrigatório: false
  validação: ER diagram | system architecture | API structure | microservices | infrastructure | event-driven | auth flow

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: ascii_diagram
  tipo: string
  destino: Memory
  persistido: false

- campo: implementation
  tipo: object
  destino: File (SQL migration, config, infrastructure code)
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
  - [ ] User has described the system/schema to diagram
    tipo: pre-condition
    blocker: true
    validação: |
      User provided a description of the database, system, or infrastructure
    error_message: "Describe the system you want to diagram first"
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] ASCII diagram generated and approved by user
    tipo: post-condition
    blocker: true
    validação: |
      Diagram exists and user confirmed via Turn 2
    error_message: "Diagram must be approved before building"
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Diagram uses proper box-drawing and arrow notation
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Entities as labelled boxes, relationships as arrows
    error_message: "Diagram must use proper ASCII notation"
  - [ ] All entities/components explicitly named with fields/details
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Every entity has a name and relevant fields listed
    error_message: "All entities must be named with fields"
  - [ ] All relationships/connections shown with arrows
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Relationships between entities are visible
    error_message: "All relationships must be shown"
  - [ ] Implementation matches diagram exactly (if Turn 3 executed)
    tipo: acceptance-criterion
    blocker: false
    validação: |
      SQL/config matches the diagram specification
    error_message: "Code must match diagram exactly"
```

---

## 📋 Description

Plan any database schema, system architecture, or technical structure by drawing it in ASCII before writing SQL, config, or infrastructure code. This catches missing tables, broken relationships, and architectural gaps before they become expensive refactors. Uses the **3-Turn Technique**: Diagram → Add What You Forgot → Build.

**When to use:** User says "design a database", "create a schema", "Supabase migration", "ER diagram", "system architecture", "API structure", "microservice layout", or any request for technical structure/infrastructure.

**Relation to `*create-full-stack-architecture`:** The architecture command creates the full document (ADRs, trade-offs, deployment strategy). `*ascii-diagram` is the **quick visual** — 3 turns, see every entity, catch the missing table.

---

## 🔄 The 3-Turn Technique

### Turn 1 — Generate the Diagram

```
Before writing any [SQL / config / code], create an ASCII [ER diagram / architecture diagram / system diagram] for [the system].
Show tables/components as labelled boxes with fields/details inside.
Use arrows (→ ← ▼ ▲) for relationships/data flow.
Show [relationships / connections / dependencies] between all components.
No code yet.
```

**Key rules for Turn 1:**
- Name every entity/component explicitly
- Specify the relationships you know about (1:many, many:many)
- Mention ALL tables/services you can think of — even if you're not sure
- Include the fields that matter to you (PKs, FKs, status fields, timestamps)

### Turn 2 — Add What You Forgot

This is where the magic happens. Seeing the diagram triggers "oh wait, I also need..."

```
[Add / change 1-2 things]. Redraw the full diagram. Nothing else changes.
```

**Examples of good Turn 2 prompts:**
- "I need a subscriptions table too: id PK, user_id FK->users, product_id FK->products, status, started_at, ends_at. Add it with proper arrows."
- "Add a message queue between the API gateway and the worker service. Show retry flow."
- "The audit_logs table should CASCADE delete from purchases, not users. Fix the arrow."

**Key rules for Turn 2:**
- This is where you catch the table/service you forgot
- Specify exact fields, relationships, and constraints
- Ask for a full redraw so you see the complete picture

### Turn 3 — Build to Spec

```
[Write the SQL migration / Build the infrastructure / Generate the config] using this diagram as the exact specification:

[Paste the final ASCII diagram]

[Requirements: UUID PKs, RLS policies, indexes, CASCADE rules, etc.]
```

**Key rules for Turn 3:**
- Paste the diagram INTO the build prompt
- Be explicit about conventions: UUID vs serial, RLS, indexes, cascades
- Say "exact specification" — no invented tables or fields

---

## 📊 Architecture Types This Covers

| Architecture Type | Key diagram elements |
|------------------|---------------------|
| Database / ER diagram | Tables as boxes, fields listed, FK arrows, cardinality |
| Supabase schema | Tables + RLS policies + indexes + triggers |
| API structure | Endpoints as boxes, request/response flow, auth middleware |
| Microservices | Services as boxes, message queues, API gateways, databases |
| Infrastructure | Load balancers, servers, databases, CDN, DNS flow |
| Event-driven system | Event producers, queues/topics, consumers, dead letter queues |
| Auth flow | Login → Token → Validate → Refresh → Revoke paths |

---

## 🎨 ASCII Notation for Architecture

```
┌──────────┐
│  Table   │     — entity / component
│ field    │     — attribute / detail
│ field FK │     — foreign key reference
└──────────┘

────►            — relationship / data flow (one direction)
◄───►            — bidirectional relationship
──┤├──           — many-to-many through junction table

PK               — primary key
FK→table         — foreign key pointing to table
(jsonb)          — type annotation
CASCADE          — delete behavior
```

---

## 🎨 Example: SaaS Database Schema

**Turn 1:**
```
Before writing any SQL, create an ASCII ER diagram for a SaaS app — users, products, purchases, and audit logs. Show the relationships. No SQL yet.
```

**Turn 2:**
```
I need a subscriptions table too: id PK, user_id FK->users, product_id FK->products, status, started_at, ends_at. Add it with proper arrows. Redraw full diagram.
```

**Turn 3:**
```
Write the Supabase SQL migration using this schema as the exact specification:

┌──────────────────┐              ┌──────────────────┐
│      users       │              │     products     │
│ id (PK)          │              │ id (PK)          │
│ email, name      │              │ name, price      │
│ plan             │              │ stripe_price_id  │
│ stripe_id        │              │ active           │
│ created_at       │              └────────┬─────────┘
└────────┬─────────┘                       │
         │       ┌──────────────────┐      │
         └──────►│    purchases     │◄─────┘
                 │ id PK            │
                 │ user_id FK       │
                 │ product_id FK    │
                 │ amount, currency │
                 │ status           │
                 └────────┬─────────┘
                          ▼
                 ┌──────────────────┐
                 │   audit_logs     │
                 │ id PK            │
                 │ purchase_id FK   │
                 │ event_type       │
                 │ payload (jsonb)  │
                 └──────────────────┘

         ┌──────────────────┐
         │  subscriptions   │
         │ id PK            │
         │ user_id FK→users │
         │ product_id FK→products │
         │ status           │
         │ started_at       │
         │ ends_at          │
         └──────────────────┘

UUID PKs, RLS on user-owned tables (users see only their rows), indexes on FK + status columns, CASCADE delete audit_logs from purchases. Single migration file.
```

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Incomplete Entity List
   - **Cause:** User forgot to mention some tables/services
   - **Resolution:** Turn 2 naturally catches these gaps
   - **Recovery:** Show diagram, ask "anything missing?"

2. **Error:** Ambiguous Relationships
   - **Cause:** User didn't specify 1:many vs many:many
   - **Resolution:** Ask for cardinality clarification
   - **Recovery:** Present options, let user choose

---

## Performance

```yaml
duration_expected: 2-5 min
cost_estimated: $0.001-0.003
token_usage: ~500-2,000 tokens
```

---

## ✅ Success Criteria

- [ ] ASCII diagram generated with proper notation
- [ ] All entities explicitly named with fields
- [ ] All relationships shown with arrows
- [ ] User had opportunity to add missing pieces (Turn 2)
- [ ] Implementation matches diagram exactly (if Turn 3 executed)

---

## 🔄 Integration with Other Tasks

**Previous Steps:**
- `*create-full-stack-architecture` - Use architecture decisions as context

**Next Steps:**
- `*ascii-flowchart` - Diagram the processes that operate on these structures
- `*create-plan` - Create implementation plan from the diagram

**State Management:**
Updates `.state.yaml` with:
- `ascii_diagrams_created: [list of diagram names]`
- `ascii_diagram_date: [ISO date]`

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - ascii
  - diagram
  - architecture
  - database
  - ER
updated_at: 2026-03-08
```
