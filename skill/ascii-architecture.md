---
name: ascii-architecture
description: Generate ASCII diagrams for database schemas, system architecture, and technical structures before building. Use when the user wants to design a database, API structure, system diagram, ER diagram, microservice layout, or any technical architecture.
---

# ASCII Architecture — Sketch Structures Before Building Them

Plan any database schema, system architecture, or technical structure by drawing it in ASCII before writing SQL, config, or infrastructure code. This catches missing tables, broken relationships, and architectural gaps before they become expensive refactors.

## When to Use

User says: "design a database", "create a schema", "Supabase migration", "ER diagram", "system architecture", "API structure", "microservice layout", or any request for technical structure/infrastructure.

## The 3-Turn Technique

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

## Example: SaaS Database Schema

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

## Architecture Types This Covers

| Architecture Type | Key diagram elements |
|------------------|---------------------|
| Database / ER diagram | Tables as boxes, fields listed, FK arrows, cardinality |
| Supabase schema | Tables + RLS policies + indexes + triggers |
| API structure | Endpoints as boxes, request/response flow, auth middleware |
| Microservices | Services as boxes, message queues, API gateways, databases |
| Infrastructure | Load balancers, servers, databases, CDN, DNS flow |
| Event-driven system | Event producers, queues/topics, consumers, dead letter queues |
| Auth flow | Login → Token → Validate → Refresh → Revoke paths |

## ASCII Notation for Architecture

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

## Why This Works

Without a diagram, Claude writes a schema based on what you mentioned. The subscriptions table you hadn't thought to say yet? Missing. The audit_logs cascade rule? Claude's best guess. The ASCII diagram forces you to see every table and relationship before a single line of SQL is written. You catch the missing table in 30 seconds instead of discovering it after building your API against the wrong schema.
