# Synkra AIOS - Pessoal

> Fork personalizado do **Synkra AIOS** (AI-Orchestrated System) para desenvolvimento full-stack orquestrado por agentes de IA.

## O que e o Synkra AIOS?

Um meta-framework que orquestra **12 agentes de IA especializados** para transformar ideias em software pronto para producao. Cada agente tem autoridade exclusiva sobre seu dominio, seguindo uma constituicao com 6 principios inviolaveis.

## Agentes

| Agente | ID | Papel |
|--------|-----|-------|
| AIOS Master | `@aios-master` | Orquestrador do framework |
| Analyst | `@analyst` | Pesquisa de mercado, brainstorming |
| Architect | `@architect` | Design de sistema, tech stack, APIs |
| Data Engineer | `@data-engineer` | Modelagem de dados, banco de dados |
| Developer | `@dev` | Implementacao full-stack |
| DevOps | `@devops` | Infra, git/GitHub, deploys |
| Product Manager | `@pm` | PRD, requisitos, specs |
| Product Owner | `@po` | Backlog, priorizacao |
| QA Engineer | `@qa` | Testes, quality gates |
| Scrum Master | `@sm` | Historias, sprints |
| UX Designer | `@ux-design-expert` | Experiencia do usuario, design |
| Squad Creator | `@squad-creator` | Cria squads de agentes por dominio |

## Fluxo de Desenvolvimento (12 Fases)

```
0. Bootstrap (@devops)       -> Setup do ambiente
1. Brainstorm (@analyst)     -> Pesquisa e brief
2. PRD (@pm)                 -> Requisitos e specs
3. Arquitetura (@architect)  -> Design do sistema
4. Squad (@po/@sm)           -> Composicao do time
5. Sharding (@pm/@architect) -> Quebra em epicos
6. Stories (@sm)             -> Historias de dev
7. Desenvolvimento (@dev)    -> Implementacao
8. Testes (@qa)              -> Validacao QA
9. Review (@qa/@architect)   -> Code review
10. Integracao (@devops)     -> PRs e merge
11. Deploy (@devops)         -> Release em producao
```

## Constituicao (6 Principios)

| # | Principio | Nivel |
|---|-----------|-------|
| I | **CLI First** — CLI e a fonte da verdade | NON-NEGOTIABLE |
| II | **Agent Authority** — Autoridade exclusiva por agente | NON-NEGOTIABLE |
| III | **Story-Driven** — Todo codigo requer historia associada | MUST |
| IV | **No Invention** — Specs derivam de requisitos documentados | MUST |
| V | **Quality First** — Lint, typecheck, tests, build devem passar | MUST |
| VI | **Absolute Imports** — Usar alias `@/`, evitar `../../../` | SHOULD |

## Squad Creator Premium

O diferencial de qualidade do AIOS. Em vez de agentes genericos, o Squad Creator Premium clona **mentes elite reais** — experts com frameworks documentados e metodologias comprovadas. Um agente de copywriting nao e "um copywriter generico", e um agente que pensa e escreve como Gary Halbert, Eugene Schwartz ou Alex Hormozi.

### Como funciona

```
/squad-creator/agents/squad-chief  →  "Quero um squad de copywriting para landing pages"
```

O sistema automaticamente:

1. **Pesquisa elite minds** do dominio (3-5 iteracoes, ranqueadas por tier)
2. **Extrai Voice DNA** — vocabulario, tom, frases-assinatura, anti-patterns
3. **Extrai Thinking DNA** — frameworks mentais, heuristicas, arvore de decisao
4. **Cria artefatos** — agentes, tasks, workflows, veto conditions
5. **Roda smoke tests** — 3 testes por agente (conhecimento, decisao, objecao)
6. **Valida qualidade** — score minimo 7/10 para aprovar

### Modos de execucao

| Modo | Materiais | Fidelidade | Tempo | Quando usar |
|------|-----------|------------|-------|-------------|
| **YOLO** | Nenhum (pesquisa web) | 60-75% | 30-45 min | Prototipacao rapida |
| **QUALITY** | Livros, PDFs, transcricoes | 85-95% | 60-90 min | Maximo de precisao |
| **HYBRID** | Parcial | Variavel | 45-75 min | Materiais de alguns experts |

### Agentes do Squad Creator

| Agente | Slash Command | Papel |
|--------|---------------|-------|
| Squad Chief | `/squad-creator/agents/squad-chief` | Orquestrador: triagem, pesquisa, criacao |
| OalaNicolas | `/squad-creator/agents/oalanicolas` | Mind cloning: extracao de Voice e Thinking DNA |
| Pedro Valerio | `/squad-creator/agents/pedro-valerio` | Process design: workflows, veto conditions |

### Resultado

```
squads/{nome-do-squad}/
├── agents/          # Agentes clonados dos experts (com DNA extraido)
├── tasks/           # Tasks especificas do dominio
├── workflows/       # Workflows multi-fase com checkpoints
├── templates/       # Templates de output
├── data/            # Knowledge base do dominio
└── config.yaml
```

### Usando squads no desenvolvimento

Durante o ciclo de dev, quando uma story precisa de expertise especializada:

```
# 1. Gere conteudo com o agente do squad (chat separado)
/{nome-do-squad}/agents/{nome-do-expert}  →  "Crie a copy para a landing page..."

# 2. Salve o output como arquivo
docs/content/landing-page-copy.md

# 3. Instrua o dev a usar o conteudo (chat separado)
/AIOS/agents/dev  →  *develop {story-id}
"Use a copy em docs/content/landing-page-copy.md"
```

> **Squads servem para qualquer dominio:** copywriting, vendas, juridico, nutricao, educacao, marketing — qualquer area com experts documentaveis.

## Modo Autonomo (Ralph Pattern)

Execucao automatizada onde cada fase roda em uma instancia fresh do Claude Code (zero compactacao, maximo desempenho):

```bash
# Rodar uma fase
bash .aios-core/scripts/autonomous-runner.sh --phase N

# Rodar todas as fases
bash .aios-core/scripts/autonomous-runner.sh --phases all

# Retomar execucao interrompida
bash .aios-core/scripts/autonomous-runner.sh --resume
```

## Estrutura do Projeto

```
.aios-core/
  ├── constitution.md        # Constituicao (6 principios)
  ├── core-config.yaml       # Configuracao do projeto
  ├── development/
  │   ├── agents/            # 12 definicoes de agentes
  │   ├── tasks/             # 115+ tarefas executaveis
  │   ├── templates/         # Templates de documentos
  │   ├── workflows/         # Workflows multi-step
  │   └── checklists/        # Checklists de validacao
  ├── scripts/
  │   ├── autonomous-runner.sh   # Orquestrador autonomo
  │   └── phase-executors/       # Executores por fase
  └── templates/
      └── phase-prompts/         # Prompts por fase

docs/                        # Documentacao do projeto
squads/                      # Squads de agentes por dominio
guia-pratico.md              # Guia rapido (PT-BR)
passos.md                    # Workflow completo (PT-BR)
```

## Quick Start

### Pre-requisitos

- Node.js 20+
- GitHub CLI (`gh`)
- Git
- Claude Code (IDE recomendada)

### Setup

```bash
# Clonar o repositorio
git clone https://github.com/andrewebemp/aios-pessoal.git
cd aios-pessoal

# Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves de API

# Instalar dependencias
npm install
```

### Uso

Ative um agente no Claude Code e use comandos com prefixo `*`:

```
@dev          # Ativar agente developer
*help         # Ver comandos disponiveis
*create-story # Criar nova historia
*task {nome}  # Executar tarefa especifica
```

## Passo a Passo: Da Instalacao ao Projeto Final

> Cada agente roda em **chat separado** no Claude Code. Abra um novo chat a cada troca de agente.

### 1. Setup (uma vez)

```
/AIOS/agents/devops  →  *environment-bootstrap
```
Instala CLIs, autentica GitHub, cria repo e estrutura base do projeto.

### 2. Planejamento (uma vez por projeto)

```
/AIOS/agents/analyst          →  *create-project-brief     # Pesquisa e brief da ideia
/AIOS/agents/pm               →  *create-prd               # Gera PRD com requisitos e epicos
/AIOS/agents/ux-design-expert →  (descreva a spec)         # Wireframes e design system
/AIOS/agents/architect        →  *create-full-stack-architecture  # Arquitetura do sistema
/AIOS/agents/po               →  *execute-checklist-po     # Valida todos os docs
/AIOS/agents/po               →  *shard-doc docs/prd.md    # Fragmenta PRD por epico
```

**Saidas:** `docs/project-brief.md` → `docs/prd.md` → `docs/architecture.md` → `docs/prd/` (fragmentado)

### 2.5. Squads de Dominio (se necessario)

Se o projeto precisa de expertise alem de software (copy, vendas, juridico, etc.):

```
/squad-creator/agents/squad-chief  →  "Quero um squad de {dominio} para {objetivo}"
```

O sistema pesquisa elite minds, extrai DNA e gera agentes especializados. Ver seção [Squad Creator Premium](#squad-creator-premium).

### 3. Desenvolvimento (loop por story)

```
/AIOS/agents/sm      →  *draft                    # Cria story com criterios de aceitacao
/AIOS/agents/dev     →  *develop {story-id}       # Implementa codigo + testes (SEM push)
/AIOS/agents/qa      →  *review-build {story-id}  # QA em 10 fases (PASS/FAIL)
/AIOS/agents/devops  →  *pre-push → *create-pr    # Quality gates + push + PR
/AIOS/agents/po      →  *close-story {story-id}   # Fecha story, proxima iteracao
```

Repita ate completar todas as stories de todos os epicos.

### 4. Release

```
/AIOS/agents/devops  →  *release {version}        # Tag, release notes, deploy
```

### Alternativa: Modo Autonomo

Se os docs base ja existem, rode tudo automaticamente:

```bash
bash .aios-core/scripts/autonomous-runner.sh --phases all
```

### Fluxo Visual

```
SETUP              PLANEJAMENTO                          SQUADS (opcional)        DEV (loop)                    RELEASE
─────              ────────────                          ────────────────         ──────────                    ───────
@devops            @analyst → @pm → @ux → @architect     @squad-chief             @sm → @dev → @qa → @devops   @devops
bootstrap          brief → PRD → spec → arquitetura      elite minds → DNA        story → code → review → PR    release
                   @po valida + fragmenta                 → agentes dominio        @po fecha story
```

### Regras de Ouro

1. **Um agente por chat** — Sempre abra chat novo ao trocar de agente
2. **Salve os docs** — Cada agente gera output em `docs/`, salve antes de prosseguir
3. **Nunca pule o PO** — Validacao e fragmentacao sao essenciais pro dev funcionar
4. **Apenas @devops faz push** — Nenhum outro agente tem essa permissao
5. **Story first** — O dev nao comeca sem story criada pelo SM

## Documentacao

| Documento | Descricao |
|-----------|-----------|
| [guia-pratico.md](guia-pratico.md) | Guia rapido para comecar (PT-BR) |
| [passos.md](passos.md) | Workflow completo das 12 fases (PT-BR) |
| [Constituicao](.aios-core/constitution.md) | 6 principios do framework |
| [User Guide](.aios-core/user-guide.md) | Handbook completo do usuario |

## Modos de Desenvolvimento

| Modo | Tempo | Fidelidade | Descricao |
|------|-------|------------|-----------|
| **YOLO** | 30-45 min | 60-75% | Sem materiais expert, rapido |
| **QUALITY** | 60-90 min | 85-95% | Com materiais expert, completo |
| **HYBRID** | 45-75 min | Variavel | Materiais parciais |

## Provedores LLM Suportados

- Anthropic (Claude)
- DeepSeek
- OpenAI (GPT-4)
- OpenRouter (multi-model)

---

*Synkra AIOS v3.11.3 — Fork pessoal customizado*
