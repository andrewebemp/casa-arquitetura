# DecorAI Brasil — Domain Model

**Versao:** 1.0
**Data:** 2026-03-09
**Autora:** Dara (@data-engineer)
**Status:** Draft
**Baseado em:** [Fullstack Architecture v1.0](../architecture/fullstack-architecture.md), [PRD v1.2](../prd.md)

---

## 1. Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DecorAI Domain Map                               │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  IDENTITY     │  │  PROJECT     │  │  AI PIPELINE │                  │
│  │  Context      │  │  Context     │  │  Context     │                  │
│  │              │  │              │  │              │                  │
│  │  UserProfile  │  │  Project     │  │  RenderJob   │                  │
│  │  Subscription │  │  Version     │  │              │                  │
│  │              │  │  SpatialInput│  │              │                  │
│  │              │  │  ChatMessage │  │              │                  │
│  │              │  │  Reference   │  │              │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                 │                           │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐                  │
│  │  BILLING      │  │  DIAGNOSTIC  │  │  SHARING     │                  │
│  │  Context      │  │  Context     │  │  Context     │                  │
│  │              │  │              │  │              │                  │
│  │  Subscription │  │  Diagnostic  │  │  ShareLink   │                  │
│  │  PaymentEvent │  │              │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Aggregates

### 2.1 UserProfile Aggregate (Identity Context)

**Root:** `user_profiles`
**Invariants:**
- Every user has exactly one profile (1:1 with auth.users)
- LGPD consent must be recorded with timestamp
- training_opt_in defaults to false

**Entities:** UserProfile
**Value Objects:** preferred_style (DecorStyle enum)

### 2.2 Project Aggregate (Project Context)

**Root:** `projects`
**Invariants:**
- A project always belongs to a user
- Status transitions follow: draft → analyzing → croqui_review → generating → ready | error
- A project cannot have more than one active SpatialInput

**Entities:** Project, ProjectVersion, SpatialInput, ChatMessage, ReferenceItem
**Value Objects:** InputType, ProjectStatus, DecorStyle, RoomDimensions, Opening, PositionedItem, PhotoInterpretation, RefinementOperation, QualityScores, VersionMetadata

### 2.3 Subscription Aggregate (Billing Context)

**Root:** `subscriptions`
**Invariants:**
- A user has at most one active subscription
- renders_used cannot exceed renders_limit (enforced at API level)
- Tier limits: Free=3, Pro=100, Business=500

**Entities:** Subscription
**Value Objects:** SubscriptionTier, SubscriptionStatus, PaymentGateway

### 2.4 Diagnostic Aggregate (Diagnostic Context)

**Root:** `diagnostics`
**Invariants:**
- Can be created without authentication (anonymous)
- Anonymous diagnostics use session_token (7-day cookie)
- Analysis is immutable once created

**Entities:** Diagnostic
**Value Objects:** DiagnosticAnalysis, DiagnosticIssue

### 2.5 RenderJob Aggregate (AI Pipeline Context)

**Root:** `render_jobs`
**Invariants:**
- Job status transitions: queued → processing → completed | failed | canceled
- Priority mapped from tier: 0=free, 1=pro, 2=business
- Max 3 retry attempts

**Entities:** RenderJob
**Value Objects:** RenderJobType, RenderJobStatus

### 2.6 ShareLink Aggregate (Sharing Context)

**Root:** `share_links`
**Invariants:**
- Share link is unique per project+version combination
- Public access does not require authentication

**Entities:** ShareLink

---

## 3. Entity Relationship Summary

```
auth.users (Supabase managed)
  │
  ├──── 1:1 ──── user_profiles
  │                  │
  │                  ├──── 1:N ──── projects
  │                  │                │
  │                  │                ├──── 1:N ──── project_versions
  │                  │                │                │
  │                  │                │                └──── 1:N ──── share_links
  │                  │                │
  │                  │                ├──── 1:1 ──── spatial_inputs
  │                  │                │
  │                  │                ├──── 1:N ──── chat_messages ──→ project_versions (FK)
  │                  │                │
  │                  │                ├──── 1:N ──── reference_items
  │                  │                │
  │                  │                └──── 1:N ──── render_jobs ──→ project_versions (FK)
  │                  │
  │                  ├──── 0:1 ──── subscriptions
  │                  │
  │                  └──── 1:N ──── diagnostics
  │
  └──── (diagnostics can also be anonymous via session_token)
```

---

## 4. Enum Definitions

| Enum | Values | Used By |
|------|--------|---------|
| `input_type` | photo, text, combined | projects |
| `project_status` | draft, analyzing, croqui_review, generating, ready, error | projects |
| `decor_style` | moderno, industrial, minimalista, classico, escandinavo, rustico, tropical, contemporaneo, boho, luxo | projects, user_profiles |
| `chat_role` | user, assistant, system | chat_messages |
| `refinement_op_type` | add, remove, change, move, resize | chat_messages (JSONB) |
| `subscription_tier` | free, pro, business | subscriptions |
| `subscription_status` | active, canceled, past_due, trialing | subscriptions |
| `payment_gateway` | stripe, asaas | subscriptions |
| `render_job_type` | initial, refinement, style_change, segmentation, diagnostic, upscale | render_jobs |
| `render_job_status` | queued, processing, completed, failed, canceled | render_jobs |
| `diagnostic_issue_category` | lighting, staging, composition, quality, clutter | diagnostics (JSONB) |
| `diagnostic_issue_severity` | low, medium, high | diagnostics (JSONB) |
| `opening_type` | door, window, archway | spatial_inputs (JSONB) |
| `wall_position` | north, south, east, west | spatial_inputs (JSONB) |

---

## 5. Access Patterns (from API Spec)

| Pattern | Query | Frequency | Tables |
|---------|-------|-----------|--------|
| List user projects | WHERE user_id = $1 ORDER BY updated_at DESC | High | projects |
| Get project with versions | JOIN project_versions ON project_id | High | projects, project_versions |
| Get chat history | WHERE project_id = $1 ORDER BY created_at | High | chat_messages |
| Check render quota | WHERE user_id = $1 AND status = 'active' | High | subscriptions |
| Get active render jobs | WHERE project_id = $1 AND status IN ('queued','processing') | High | render_jobs |
| Public share page | JOIN share_links ON version_id | Medium | share_links, project_versions |
| Diagnostic (anonymous) | WHERE session_token = $1 | Medium | diagnostics |
| List favorites | WHERE user_id = $1 AND is_favorite = true | Medium | projects |
| Version comparison | WHERE project_id = $1 ORDER BY version_number | Medium | project_versions |
| Render cost analytics | GROUP BY gpu_provider, date | Low | render_jobs |
