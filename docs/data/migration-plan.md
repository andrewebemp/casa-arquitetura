# DecorAI Brasil — Migration Plan

**Versao:** 1.0
**Data:** 2026-03-09
**Autora:** Dara (@data-engineer)

---

## Migration Order

| # | File | Description | Dependencies | Rollback |
|---|------|-------------|-------------|----------|
| 1 | `00001_initial_schema.sql` | Enums, tables, indexes, triggers | auth.users (Supabase built-in) | `00001_initial_schema_rollback.sql` |
| 2 | `00002_rls_policies.sql` | RLS enable + all policies | Migration 1 | `00002_rls_policies_rollback.sql` |
| 3 | `00003_seed_data.sql` | Initial seed (styles, tier config) | Migration 1 | Idempotent (safe to re-run) |

## Execution Strategy

### Development
```bash
# Apply all migrations
supabase db reset           # Fresh reset + apply all
supabase db push            # Apply pending migrations
```

### Staging / Production
```bash
# 1. Create snapshot BEFORE migration
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Dry-run (review SQL output)
supabase db diff --local

# 3. Apply migration
supabase db push

# 4. Verify
supabase db lint
```

### Rollback Procedure
```bash
# If migration fails:
# 1. Run the corresponding rollback script
psql $DATABASE_URL -f supabase/migrations/0000X_rollback.sql

# 2. Or restore from snapshot
psql $DATABASE_URL -f backup_YYYYMMDD_HHMMSS.sql
```

## Safety Checklist

- [ ] Snapshot created before migration
- [ ] Dry-run reviewed
- [ ] Rollback script tested
- [ ] RLS policies verified with positive/negative tests
- [ ] Indexes verified with EXPLAIN ANALYZE
- [ ] Triggers tested (user creation → profile → subscription)

## Future Migrations (Planned)

| Migration | Description | When |
|-----------|-------------|------|
| `00004_storage_buckets.sql` | Supabase Storage buckets + policies | Before Epic 1 dev |
| `00005_realtime_config.sql` | Realtime channels configuration | Before Epic 7 dev |
| `00006_functions.sql` | Database functions (render quota check, etc.) | Before Epic 6 dev |
