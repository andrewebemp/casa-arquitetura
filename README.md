# Casa Arquitetura

> Transforme fotos de ambientes vazios em projetos de decoracao fotorrealistas usando inteligencia artificial.

## O que e

Casa Arquitetura (DecorAI) e uma plataforma que usa IA para gerar renders decorados a partir de fotos reais de ambientes. Envie a foto, escolha um estilo e receba uma versao decorada em segundos.

**Para quem:**
- Corretores de imoveis (staging virtual)
- Arquitetos e designers de interiores
- Incorporadoras e construtoras
- Proprietarios planejando reformas

## Como funciona

```
1. Upload da foto  ->  2. Escolha o estilo  ->  3. Render em 10-30s  ->  4. Refine pelo chat
```

### Estilos disponiveis

Moderno | Industrial | Minimalista | Classico | Escandinavo | Rustico | Tropical | Contemporaneo | Boho | Luxo

### Funcionalidades

- **Render fotorrealista** — IA gera decoracao realista mantendo a estrutura do ambiente
- **Chat de refinamento** — Peca ajustes em linguagem natural ("troca o sofa", "muda o piso")
- **Edicao por elementos** — Selecione e modifique parede, piso, movel, iluminacao
- **Comparacao antes/depois** — Slider interativo para apresentar ao cliente
- **Links de compartilhamento** — Envie ao cliente sem precisar de conta
- **Diagnostico gratuito** — Analise rapida de ambientes sem cadastro

## Planos

| | Free | Pro | Business |
|--|------|-----|----------|
| Renders/mes | 3 | Ilimitado | Ilimitado |
| Resolucao | 1024px | 2048px HD | 2048px HD |
| Marca d'agua | Sim | Nao | Nao |
| Chat refinamento | Basico | Completo | Completo |
| Edicao elementos | Nao | Sim | Sim |
| Compartilhamento | Nao | Sim | Sim |
| Preco | R$ 0 | R$ 79-149/mes | R$ 299-499/mes |

## Stack tecnica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, React 18, TailwindCSS |
| Backend | Fastify, Node.js 20+ |
| Banco de dados | Supabase (PostgreSQL + Auth + Storage) |
| IA/GPU | fal.ai, Replicate (fallback) |
| Pagamentos | Asaas (PIX/Boleto), Stripe (cartao) |
| Deploy | Vercel (web + API) |
| Monorepo | pnpm + Turborepo |

## Estrutura do projeto

```
packages/
  web/          # Frontend Next.js (decorai-chi.vercel.app)
  api/          # Backend Fastify (decorai-api-theta.vercel.app)
  shared/       # Tipos e utilitarios compartilhados
supabase/       # Migrations, seeds, config
```

## Desenvolvimento local

```bash
# 1. Clonar
git clone https://github.com/andrewebemp/casa-arquitetura.git
cd casa-arquitetura

# 2. Instalar dependencias
pnpm install

# 3. Configurar variaveis de ambiente
cp .env.example .env
# Preencher com suas chaves (Supabase, fal.ai, etc.)

# 4. Supabase local
npx supabase start

# 5. Rodar
pnpm dev
```

**URLs locais:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Supabase Studio: http://localhost:54323

## Variaveis de ambiente essenciais

| Variavel | Descricao |
|----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave publica do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave admin do Supabase |
| `FAL_KEY` | Chave da fal.ai (GPU compute) |
| `OPENROUTER_API_KEY` | Chave do OpenRouter (chat IA) |
| `ASAAS_API_KEY` | Chave do Asaas (pagamentos BR) |
| `STRIPE_SECRET_KEY` | Chave do Stripe (pagamentos cartao) |
| `REDIS_URL` | URL do Redis (rate limiting) |

Veja `.env.example` para a lista completa.

## Deploy

O projeto faz deploy automatico via Vercel quando ha push no branch `master`:

| Projeto Vercel | Pacote | URL |
|---------------|--------|-----|
| decorai | `packages/web` | decorai-chi.vercel.app |
| decorai-api | `packages/api` | decorai-api-theta.vercel.app |

## Documentacao

- [como-usar.md](como-usar.md) — Guia completo para usuarios da plataforma
- [CHANGELOG.md](CHANGELOG.md) — Historico de versoes

## Licenca

Projeto privado. Todos os direitos reservados.

---

*Casa Arquitetura — Transforme espacos vazios em ambientes dos sonhos*
