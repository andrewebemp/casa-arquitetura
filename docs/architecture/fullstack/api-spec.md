# DecorAI Brasil — API Specification

> **Parent document:** [fullstack-architecture.md](../fullstack-architecture.md) | [Index](./index.md)
> **Section:** 5

---

## 5. API Specification

### 5.1 REST API — OpenAPI 3.0

```yaml
openapi: 3.0.0
info:
  title: DecorAI Brasil API
  version: 1.0.0
  description: API REST para plataforma de virtual staging com IA generativa
servers:
  - url: https://api.decorai.com.br/v1
    description: Production
  - url: https://api-staging.decorai.com.br/v1
    description: Staging
```

### 5.2 Endpoints por Epic

#### Epic 1 — Geracao e Staging AI (FR-01, FR-02, FR-03, FR-24-FR-32)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| POST | `/projects` | Criar novo projeto | Required | FR-01 |
| POST | `/projects/:id/upload` | Upload de foto do local | Required | FR-01 |
| POST | `/projects/:id/spatial-input` | Enviar dados espaciais (medidas) | Required | FR-24 |
| POST | `/projects/:id/reference-items` | Upload de foto de referencia de item | Required | FR-25 |
| POST | `/projects/:id/analyze` | Analisar foto e gerar interpretacao espacial | Required | FR-32 |
| GET | `/projects/:id/croqui` | Obter croqui ASCII atual | Required | FR-29 |
| POST | `/projects/:id/croqui/adjust` | Solicitar ajuste no croqui | Required | FR-30 |
| POST | `/projects/:id/croqui/approve` | Aprovar croqui e iniciar geracao | Required | FR-31 |
| POST | `/projects/:id/generate` | Gerar render com estilo selecionado | Required | FR-01, FR-02 |
| POST | `/projects/:id/restyle` | Gerar variacao com novo estilo (sem re-upload) | Required | FR-03 |
| GET | `/styles` | Listar 10 estilos disponiveis | Public | FR-02 |

#### Epic 2 — Chat Visual de Refinamento (FR-04-FR-06, FR-27, FR-28)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| POST | `/projects/:id/chat` | Enviar mensagem de refinamento | Required | FR-04, FR-06 |
| GET | `/projects/:id/chat/history` | Historico de mensagens | Required | FR-27 |
| GET | `/projects/:id/versions` | Listar todas as versoes | Required | FR-27 |
| GET | `/projects/:id/versions/:versionId` | Obter versao especifica | Required | FR-27 |
| POST | `/projects/:id/versions/:versionId/revert` | Reverter para versao anterior | Required | FR-27 |

#### Epic 3 — Edicao e Personalizacao (FR-07, FR-08, FR-09)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| POST | `/projects/:id/segment` | Segmentar elemento via SAM | Required | FR-07 |
| POST | `/projects/:id/segment/apply` | Aplicar material ao segmento | Required | FR-07 |
| POST | `/projects/:id/enhance-lighting` | Melhorar iluminacao | Required | FR-08 |
| POST | `/projects/:id/remove-object` | Remover objeto via inpainting | Required | FR-09 |

#### Epic 4 — Compartilhamento e Visualizacao (FR-10, FR-11)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| POST | `/projects/:id/share` | Gerar link de compartilhamento | Required | FR-11 |
| GET | `/share/:shareId` | Obter dados da pagina publica | Public | FR-11 |
| GET | `/projects/:id/slider-data` | Dados para slider antes/depois | Required | FR-10 |

#### Epic 5 — Reverse Staging (FR-12, FR-13)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| POST | `/diagnostics` | Criar diagnostico (sem auth) | Optional | FR-12 |
| POST | `/diagnostics/:id/upload` | Upload foto para diagnostico | Optional | FR-12 |
| GET | `/diagnostics/:id` | Obter resultado do diagnostico | Optional | FR-12 |

#### Epic 6 — Autenticacao, Perfil e Billing (FR-14-FR-18)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| POST | `/auth/signup` | Cadastro email/password | Public | FR-14 |
| POST | `/auth/login` | Login email/password | Public | FR-14 |
| POST | `/auth/google` | Login Google OAuth | Public | FR-14 |
| GET | `/auth/me` | Dados do usuario logado | Required | FR-14 |
| GET | `/profile` | Perfil com preferencias | Required | FR-15 |
| PATCH | `/profile` | Atualizar perfil | Required | FR-15 |
| GET | `/profile/projects` | Projetos do usuario | Required | FR-15 |
| GET | `/subscription` | Assinatura atual | Required | FR-16 |
| POST | `/subscription/checkout` | Iniciar checkout Stripe/Asaas | Required | FR-18 |
| POST | `/subscription/portal` | Abrir portal de billing | Required | FR-18 |
| POST | `/webhooks/stripe` | Webhook Stripe | Signature | FR-18 |
| POST | `/webhooks/asaas` | Webhook Asaas | Signature | FR-18 |
| PATCH | `/profile/lgpd-consent` | Atualizar consentimento LGPD | Required | NFR-08 |
| DELETE | `/profile/data` | Direito ao esquecimento (LGPD) | Required | NFR-08 |

#### Epic 7 — Infraestrutura e Pipeline (FR-19-FR-23)

| Method | Path | Description | Auth | Ref |
|--------|------|-------------|------|-----|
| GET | `/jobs/:id` | Status do job de render | Required | FR-19 |
| GET | `/jobs/:id/progress` | Progresso via polling (fallback) | Required | NFR-16 |
| WebSocket | `/realtime/projects/:id` | Canal de progresso em tempo real | Required | FR-19, NFR-16 |

### 5.3 Request/Response Examples

**POST /projects/:id/chat** (FR-04)
```json
// Request
{
  "message": "tira o tapete e muda o piso para madeira clara"
}

// Response 202 Accepted
{
  "chat_message_id": "uuid",
  "job_id": "uuid",
  "operations": [
    { "type": "remove", "target": "tapete", "params": {} },
    { "type": "change", "target": "piso", "params": { "material": "madeira clara" } }
  ],
  "estimated_time_seconds": 12
}
```

**POST /diagnostics** (FR-12)
```json
// Request (multipart/form-data)
{
  "image": "<file>"
}

// Response 200
{
  "id": "uuid",
  "analysis": {
    "issues": [
      { "category": "staging", "severity": "high", "description": "Ambiente vazio sem mobilia" },
      { "category": "lighting", "severity": "medium", "description": "Iluminacao natural insuficiente" }
    ],
    "estimated_loss_percent": 30,
    "overall_score": 35,
    "recommendations": [
      "Virtual staging pode aumentar consultas em ate 47%",
      "Melhoria de iluminacao valoriza em 15-20%"
    ]
  },
  "staged_preview_url": "https://cdn.decorai.com.br/previews/uuid.webp"
}
```
