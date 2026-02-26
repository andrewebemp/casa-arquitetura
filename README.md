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
