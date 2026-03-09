# DecorAI Brasil — Monitoring and Observability

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 19

---

## 19. Monitoring and Observability

### 19.1 Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics (Core Web Vitals) + Sentry (JS errors, breadcrumbs)
- **Backend Monitoring:** Sentry (error tracking + performance) + Pino structured logs
- **GPU Pipeline Monitoring:** Custom metrics via Pino + Supabase (render_jobs table analytics)
- **Error Tracking:** Sentry (unified for frontend + backend, source maps)
- **Performance Monitoring:** Vercel Speed Insights + Sentry Performance

### 19.2 Key Metrics

**Frontend Metrics:**
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- JS error rate: < 0.1% of sessions
- API response times (p50, p95, p99)
- User interactions: renders/session, chat messages/session

**Backend Metrics:**

| Metrica | Tipo | Fonte | Alerta |
|---------|------|-------|--------|
| `render_duration_ms` | Histogram | ai-pipeline | > 60s → Warning |
| `render_cost_cents` | Counter | render_jobs | > 200 cents → Warning |
| `render_failure_rate` | Gauge | render_jobs | > 5% → Critical |
| `queue_depth` | Gauge | BullMQ | > 100 → Warning |
| `active_users_daily` | Gauge | Supabase Auth | — |
| `quality_score_avg` | Gauge | project_versions | < 0.7 → Warning |
| `chat_nlu_latency_ms` | Histogram | Claude API | > 5s → Warning |
| `api_response_time_ms` | Histogram | Fastify | p95 > 500ms → Warning |
| `gpu_provider_errors` | Counter | ai-pipeline | > 3/hour → Critical |

### 19.3 Alerts

| Condicao | Severidade | Canal | Acao |
|----------|-----------|-------|------|
| `render_duration > 60s` | Warning | Slack | Investigar pipeline |
| `render_failure_rate > 5%` | Critical | Slack + PagerDuty | Verificar GPU providers |
| `queue_depth > 100` | Warning | Slack | Considerar scale up |
| `GPU provider down` | Critical | Slack + PagerDuty | Failover para provider alternativo |
| `API error rate > 1%` | Warning | Sentry | Investigar logs |
| `Claude API latency > 10s` | Warning | Slack | Verificar fallback GPT-4o |
| `Storage > 80% capacity` | Warning | Slack | Cleanup ou upgrade tier |
