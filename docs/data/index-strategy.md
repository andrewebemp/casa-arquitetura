# DecorAI Brasil — Index Strategy

**Versao:** 1.0
**Data:** 2026-03-09
**Autora:** Dara (@data-engineer)

---

## Design Principles

1. **Access pattern first** — Every index serves a documented query pattern
2. **No redundant indexes** — UNIQUE and PK constraints already create indexes
3. **Partial indexes** — Use WHERE clauses to reduce index size
4. **Composite indexes** — Column order matches query filter + sort order

---

## Index Map

### projects

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single project lookup | — |
| idx_projects_user_id | user_id | B-tree | All user projects | FR-15 |
| idx_projects_user_updated | user_id, updated_at DESC | B-tree (composite) | Recent projects list | FR-15 |
| idx_projects_user_favorites | user_id WHERE is_favorite=true | B-tree (partial) | Favorites list | FR-15 |

### project_versions

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single version lookup | — |
| UQ | project_id, version_number | B-tree (unique) | Version by number | FR-27 |
| idx_versions_project_id | project_id | B-tree | All versions for project | FR-27 |
| idx_versions_project_number | project_id, version_number DESC | B-tree (composite) | Latest version first | FR-27 |

### spatial_inputs

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single lookup | — |
| UQ | project_id | B-tree (unique) | Spatial data by project | FR-24 |

### reference_items

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single lookup | — |
| idx_reference_items_project | project_id | B-tree | Items by project | FR-25 |

### chat_messages

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single message | — |
| idx_chat_messages_project | project_id, created_at | B-tree (composite) | Chat history ordered | FR-27 |

### subscriptions

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single lookup | — |
| UQ | user_id | B-tree (unique) | User's subscription | FR-16 |

### diagnostics

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single diagnostic | — |
| idx_diagnostics_session | session_token WHERE NOT NULL | B-tree (partial) | Anonymous lookup | FR-12 |
| idx_diagnostics_user | user_id WHERE NOT NULL | B-tree (partial) | User's diagnostics | FR-12 |

### render_jobs

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single job | — |
| idx_render_jobs_project | project_id | B-tree | Jobs by project | FR-19 |
| idx_render_jobs_active | project_id, status WHERE IN ('queued','processing') | B-tree (partial) | Active jobs | FR-19 |
| idx_render_jobs_status_priority | status, priority DESC WHERE status='queued' | B-tree (partial, composite) | Queue worker pickup | NFR-06 |

### share_links

| Index | Columns | Type | Access Pattern | Ref |
|-------|---------|------|---------------|-----|
| PK | id | B-tree (unique) | Single lookup | — |
| UQ | slug | B-tree (unique) | Public page by slug | FR-11 |
| idx_share_links_project | project_id | B-tree | Links by project | FR-11 |

---

## Total: 10 tables, 9 PKs, 4 unique constraints, 12 custom indexes

Estimated overhead: minimal — all indexes serve high/medium frequency access patterns.
