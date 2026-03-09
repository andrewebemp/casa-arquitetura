# DecorAI Brasil — Security and Performance

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 15

---

## 15. Security and Performance

### 15.1 Frontend Security

- **CSP Headers:** `default-src 'self'; img-src 'self' blob: data: *.supabase.co *.cloudflare.com; script-src 'self' 'unsafe-inline'; connect-src 'self' *.supabase.co *.decorai.com.br` — Ref: OWASP
- **XSS Prevention:** React auto-escaping + CSP + no `dangerouslySetInnerHTML` — Ref: OWASP
- **Secure Storage:** JWT em httpOnly cookie (Supabase PKCE flow), nunca em localStorage — Ref: NFR-08
- **Input Sanitization:** Zod validation em formularios, file type validation (MIME + magic bytes) — Ref: FR-01

### 15.2 Backend Security

- **Input Validation:** Zod schemas em TODAS as rotas, Fastify schema validation nativa — Ref: OWASP
- **Rate Limiting:** Por tier via Redis: Free (10 req/min), Pro (60 req/min), Business (120 req/min) — Ref: NFR-10
- **CORS Policy:** Whitelist de origens: `decorai.com.br`, `staging.decorai.com.br`, `localhost:3000`
- **File Upload Security:** Validacao MIME type (JPEG/PNG only), max 20MB, magic bytes check, antivirus scan opcional — Ref: FR-01
- **Webhook Security:** Stripe signature verification (`stripe.webhooks.constructEvent`), Asaas IP whitelist

### 15.3 Authentication Security

- **Token Storage:** httpOnly secure cookies via Supabase PKCE — Ref: FR-14
- **Session Management:** JWT com refresh token rotation, 1h access / 7d refresh
- **Password Policy:** Min 8 chars, email verification required

### 15.4 LGPD Compliance

- **Consentimento explicito:** Modal de consentimento no primeiro login, armazenado em `lgpd_consent_at` — Ref: NFR-08
- **Opt-in treinamento:** `training_opt_in` false por padrao, nunca usar dados sem consentimento — Ref: NFR-09
- **Direito ao esquecimento:** `DELETE /profile/data` apaga todos os dados do usuario (cascade) — Ref: NFR-08
- **RLS (Row Level Security):** Todas as tabelas com RLS habilitado, usuarios veem APENAS seus proprios dados
- **Disclaimer IA:** "Imagem ilustrativa gerada por inteligencia artificial" em TODAS as imagens geradas — Ref: NFR-17

### 15.5 Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** < 200KB gzipped (initial load) — Ref: Front-End Spec §10
- **Loading Strategy:** Route-based code splitting (Next.js automatic), lazy load workspace components, LQIP image placeholders
- **Image Strategy:** WebP + JPEG fallback (`<picture>`), `srcset` (400w/800w/1200w), `loading="lazy"` para galeria, CDN com Cloudflare — Ref: NFR-11
- **Rendering Strategy:** SSG (landing, login, diagnostico), SSR (dashboard), CSR (workspace) — Ref: Front-End Spec §10.2
- **Client Caching:** React Query 5min stale time para projetos, Zustand persist para preferencias
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1 — Ref: Front-End Spec §10.1

**Backend Performance:**
- **Response Time Target:** API < 200ms (exceto render jobs), render < 30s (NFR-01), chat < 15s (NFR-02)
- **Database Optimization:** Indexes em user_id, project_id, status, created_at; connection pooling via Supabase
- **Cache Strategy:**
  - Redis semantic cache: hash de input params → render URL (TTL 24h) — Ref: NFR-07
  - Redis session cache (TTL 7d)
  - CDN cache para imagens geradas (TTL 30d) — Ref: NFR-11
  - React Query client cache (TTL 5min)

**GPU Pipeline Performance:**
- **Cold start mitigation:** fal.ai warm instances para modelos frequentes (SDXL, SAM)
- **Cost optimization:** Tier-based routing — Free/Pro para fal.ai (barato), Business para Replicate (custom models) — Ref: NFR-04, CON-06
- **Estimated costs:** R$ 0.50-1.50/render (target < R$ 2.00) — Ref: NFR-04, CON-01
