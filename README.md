# Synkra AIOS - Pessoal

> Fork personalizado do **Synkra AIOS** (AI-Orchestrated System) para desenvolvimento full-stack orquestrado por agentes de IA.

## O que e o Synkra AIOS?

Um meta-framework que orquestra **12 agentes de IA especializados** para transformar ideias em software pronto para producao. Cada agente tem autoridade exclusiva sobre seu dominio, seguindo uma constituicao com 6 principios inviolaveis.

## Agentes

| Agente | ID (Nome) | Papel | Slash Command |
|--------|-----------|-------|---------------|
| AIOS Master | `@aios-master` (Orion) | Orquestrador do framework | `/AIOS/agents/aios-master` |
| Analyst | `@analyst` (Atlas) | Pesquisa de mercado, brainstorming | `/AIOS/agents/analyst` |
| Architect | `@architect` (Aria) | Design de sistema, tech stack, APIs | `/AIOS/agents/architect` |
| Data Engineer | `@data-engineer` (Dara) | Modelagem de dados, banco de dados | `/AIOS/agents/data-engineer` |
| Developer | `@dev` (Dex) | Implementacao full-stack (SEM push) | `/AIOS/agents/dev` |
| DevOps | `@devops` (Gage) | Infra, git/GitHub, deploys (UNICO push) | `/AIOS/agents/devops` |
| Product Manager | `@pm` (Morgan) | PRD, requisitos, specs | `/AIOS/agents/pm` |
| Product Owner | `@po` (Pax) | Backlog, validacao, sharding | `/AIOS/agents/po` |
| QA Engineer | `@qa` (Quinn) | Testes, quality gates | `/AIOS/agents/qa` |
| Scrum Master | `@sm` (River) | Historias, sprints | `/AIOS/agents/sm` |
| UX Designer | `@ux-design-expert` (Uma) | Experiencia do usuario, design | `/AIOS/agents/ux-design-expert` |
| Squad Creator | `@squad-creator` (Craft) | Cria squads de agentes por dominio | `/AIOS/agents/squad-creator` |
| Conselheiro-Mor | `@conselheiro-mor` | Conselho Deliberativo (analise de decisoes) | `/conselho/agents/conselheiro-mor` |

## Fluxo de Desenvolvimento (10 Fases)

```
0. Bootstrap (@devops)           -> Setup do ambiente
1. Pesquisa & Ideacao (@analyst) -> Pesquisa de mercado e brief
2. PRD (@pm)                     -> Requisitos, epicos e specs
3. UX/UI (@ux-design-expert)     -> Wireframes, design system
4. Squads (@squad-creator)       -> Agentes de dominio (opcional)
5. Arquitetura (@architect)      -> Design do sistema e APIs
6. Modelagem de Dados (@data-engineer) -> Schema, migrations, RLS
7. Validacao & Sharding (@po)    -> Validar docs e fragmentar
8. Dev Cycle (loop: @sm->@dev->@qa) -> Stories, codigo, testes
9. Release & Deploy (@devops)    -> Push, PR, release, deploy
```

### Fluxo Brownfield (Projetos Existentes)

Para projetos existentes, o AIOS oferece workflows especializados:

```
Tamanho da mudanca:
  Bug fix (< 4h)       → @pm → *brownfield-create-story → @dev → @qa → Done
  Feature (1-3 stories) → @pm → *brownfield-create-epic → Dev Cycle loop
  Enhancement grande    → Fluxo completo com templates brownfield
  Divida tecnica        → Workflow brownfield-discovery
```

**Workflows:** `brownfield-fullstack`, `brownfield-discovery`, `brownfield-ui`, `brownfield-service`
**Guia completo:** `.aios-core/working-in-the-brownfield.md`

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

## Conselho Deliberativo

Sistema de deliberacao multi-agente que analisa decisoes com rigor antes de recomendar um caminho. Inspirado no conceito de "Conclave", mas com melhorias significativas: deteccao de vieses cognitivos, pre-mortem, confianca decomposta, memoria de decisoes, e consulta cross-squad.

### Como funciona

```
/conselho/agents/conselheiro-mor  →  "Devo migrar minha stack para Next.js?"
```

O Conselheiro-Mor classifica a decisao, sugere o modo de deliberacao, e orquestra o processo:

1. **Classifica** o tipo de decisao (negocio, tecnico, pessoal, conteudo, estrategico)
2. **Convoca consultores** cross-squad relevantes (AIOS Core, squads locais, ou repo externo)
3. **Coleta pareceres** tecnicos dos agentes convocados
4. **Critica** a qualidade do raciocinio (score 0-100 com deteccao de vieses)
5. **Ataca** a decisao com advogado do diabo (5 entregas + pre-mortem)
6. **Sintetiza** em recomendacao final com confianca decomposta

### Modos de deliberacao

| Modo | Fases | Quando usar |
|------|-------|-------------|
| **Full** (`*deliberar`) | 5 fases | Decisoes criticas ou irreversiveis |
| **Quick** (`*quick`) | 3 fases | Decisoes moderadas e reversiveis |
| **Audit** (`*audit`) | 3 fases | Auditoria de decisao ja tomada |

### Agentes do Conselho

| Agente | Slash Command | Papel |
|--------|---------------|-------|
| Conselheiro-Mor | `/conselho/agents/conselheiro-mor` | Orchestrator: triage, convocacao, moderacao |
| Critico Metodologico | `/conselho/agents/critico-metodologico` | Score 0-100, deteccao de vieses, quality gate |
| Advogado do Diabo | `/conselho/agents/advogado-do-diabo` | 5 entregas obrigatorias + exercicio de pre-mortem |
| Sintetizador | `/conselho/agents/sintetizador` | Confianca decomposta, matriz de stakeholders |

### Consulta cross-squad

O Conselho pode convocar agentes de **3 fontes** para enriquecer a analise:

| Fonte | Agentes | Acesso |
|-------|---------|--------|
| **AIOS Core** | 9 agentes (@architect, @dev, @qa, etc.) | Sempre disponivel |
| **Squads locais** | Qualquer squad em `squads/` | Leitura direta |
| **Squads externos** | 99 agentes em 13 squads (`andrewebemp/squads-criados`) | Via `gh api` |

### Resultado

Decisoes sao registradas em `squads/conselho/decisions/` com contexto, pareceres, scores, e proximos passos — criando memoria para aprendizado futuro.

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
.aios-core/                         # Framework core (NAO edite diretamente)
  ├── constitution.md               # Constituicao (6 principios inviolaveis)
  ├── core-config.yaml              # Configuracao do framework
  ├── user-guide.md                 # Handbook completo do usuario
  ├── core/
  │   ├── execution/                # Story parser, engine de execucao
  │   ├── quality-gates/            # Quality gates automaticos
  │   ├── utils/                    # 70+ utilitarios
  │   └── docs/                     # Documentacao tecnica do core
  ├── development/
  │   ├── agents/                   # 12 definicoes de agentes
  │   ├── tasks/                    # 115+ tarefas executaveis
  │   ├── templates/                # Templates de documentos
  │   ├── workflows/                # Workflows multi-step
  │   ├── checklists/               # Checklists de validacao
  │   └── data/                     # Frameworks de decisao e qualidade
  ├── data/
  │   ├── technical-preferences.md  # Preferencias de tech stack
  │   └── tech-presets/             # Presets de tecnologia (Next.js, etc)
  ├── scripts/
  │   ├── autonomous-runner.sh      # Orquestrador autonomo (Ralph Pattern)
  │   ├── phase-executors/          # Executores por fase (0-9)
  │   ├── pm.sh                     # Process manager para agentes
  │   └── update-aios.sh            # Script de atualizacao do framework
  └── templates/
      └── phase-prompts/            # Prompts por fase

.claude/                            # Integracao Claude Code
  ├── CLAUDE.md                     # Regras e configuracao do Claude Code
  ├── commands/AIOS/agents/         # Slash commands dos 12 agentes core
  ├── commands/conselho/agents/     # Slash commands do Conselho Deliberativo
  └── rules/                        # Regras MCP

docs/                               # Documentacao do projeto (gerada pelos agentes)
  ├── stories/                      # Stories de desenvolvimento
  ├── prd/                          # PRD fragmentado por epico
  ├── architecture/                 # Arquitetura fragmentada
  └── framework/                    # Guias de dev (source-tree, tech-stack, coding-standards)

squads/                             # Squads de agentes por dominio
  ├── conselho/                     # Conselho Deliberativo (analise de decisoes)
  └── squad-creator/                # Squad Creator Premium (meta-squad)

guia-pratico.md                     # Guia rapido simplificado (PT-BR)
passos.md                           # Workflow completo das 10 fases (PT-BR)
CHANGELOG.md                        # Historico de versoes
```

## Instalacao

### Pre-requisitos

| Ferramenta | Versao Minima | Verificar | Obrigatorio |
|------------|---------------|-----------|-------------|
| **Node.js** | 20+ | `node --version` | Sim |
| **Git** | 2.x | `git --version` | Sim |
| **GitHub CLI** | 2.x | `gh --version` | Sim |
| **Claude Code** | latest | `claude --version` | Sim |
| **rsync** | qualquer | `rsync --version` | Para updates |

### Instalacao do Zero

```bash
# 1. Clonar o repositorio
git clone https://github.com/andrewebemp/aios-pessoal.git
cd aios-pessoal

# 2. Instalar dependencias
npm install

# 3. Configurar variaveis de ambiente
cp .env.example .env
# Editar .env com suas chaves de API (veja secao Configuracao abaixo)

# 4. Verificar se esta tudo certo
npm test
```

### Instalacao em Novo Projeto (usar como template)

Se voce quer usar o AIOS como base para um novo projeto:

```bash
# 1. Criar repositorio a partir do template no GitHub
# Acesse https://github.com/andrewebemp/aios-pessoal e clique "Use this template"

# OU clone manualmente e reconfigure o remote
git clone https://github.com/andrewebemp/aios-pessoal.git meu-projeto
cd meu-projeto
rm -rf .git
git init
git remote add origin https://github.com/SEU-USUARIO/meu-projeto.git

# 2. Instalar dependencias
npm install

# 3. Configurar ambiente
cp .env.example .env

# 4. Bootstrap automatico (dentro do Claude Code)
# Abre o Claude Code e executa:
#   /AIOS/agents/devops  →  *environment-bootstrap
```

### Configuracao (.env)

Copie `.env.example` para `.env` e preencha as chaves necessarias:

```bash
cp .env.example .env
```

| Variavel | Obrigatorio | Onde Obter |
|----------|-------------|------------|
| `ANTHROPIC_API_KEY` | Sim* | [console.anthropic.com](https://console.anthropic.com/) |
| `GITHUB_TOKEN` | Sim | [github.com/settings/tokens](https://github.com/settings/tokens) |
| `DEEPSEEK_API_KEY` | Nao | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| `OPENROUTER_API_KEY` | Nao | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `EXA_API_KEY` | Nao | [exa.ai](https://exa.ai/) |
| `SUPABASE_URL` | Nao | Projeto Supabase |

> *Nao necessario se usar Claude Max subscription diretamente.

---

## Atualizacao

### Atualizar o Framework AIOS Core (upstream)

Quando uma nova versao do AIOS Core for publicada, sincronize com:

```bash
bash .aios-core/scripts/update-aios.sh
```

**O que o script faz:**

| Cenario | Acao |
|---------|------|
| Arquivo so local (sua customizacao) | **Mantem** |
| Arquivo local + upstream | **Sobrescreve** (upstream vence) |
| Arquivo so no upstream (novo) | **Cria** |
| Removido no upstream | **Deleta** |

**Requisitos:** git tree limpa para `.aios-core/` e `rsync` instalado.

Apos o sync, revise o relatorio e aplique:

```bash
# Aceitar as mudancas
git add .aios-core && git commit -m "chore: sync AIOS framework"

# OU reverter se algo deu errado
git checkout -- .aios-core/
```

### Bump de Versao do Seu Projeto

Para criar uma nova versao do seu projeto, use o script de versionamento semantico:

```bash
# Detecta automaticamente pelo tipo dos commits
npm run version:bump

# Forcar tipo de bump
npm run version:bump -- --patch   # 1.0.0 → 1.0.1 (bugfixes)
npm run version:bump -- --minor   # 1.0.0 → 1.1.0 (features)
npm run version:bump -- --major   # 1.0.0 → 2.0.0 (breaking changes)

# Preview sem alterar nada
npm run version:bump -- --dry-run
```

**O que o script faz:**
1. Analisa commits convencionais desde a ultima tag
2. Atualiza `package.json` com a nova versao
3. Gera entrada no `CHANGELOG.md`
4. Exibe comandos para criar tag e fazer push

Apos o bump, finalize a release:

```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push && git push --tags
```

### Atualizar Dependencias Node

```bash
npm update          # Atualiza dentro do range do package.json
npm outdated        # Ver pacotes desatualizados
```

---

## Comandos Uteis

### NPM Scripts

| Comando | Descricao |
|---------|-----------|
| `npm test` | Rodar testes |
| `npm run lint` | Verificar code style |
| `npm run typecheck` | Verificar tipos TypeScript |
| `npm run build` | Build do projeto |
| `npm run version:bump` | Bump de versao semantico |

### AIOS CLI

```bash
npx aios-core doctor     # Diagnostico do ambiente
npx aios-core info       # Informacoes do projeto
npx aios-core init       # Inicializar novo projeto
npx aios-core config     # Gerenciar configuracao
npx aios-core migrate    # Migrar entre versoes do AIOS
npx aios-core mcp setup  # Configurar MCP servers
```

### Scripts de Automacao

```bash
# Atualizar framework AIOS
bash .aios-core/scripts/update-aios.sh

# Modo autonomo (ver secao Modo Autonomo)
bash .aios-core/scripts/autonomous-runner.sh --phases all

# Spawnar agente em terminal separado
bash .aios-core/scripts/pm.sh <agente> <tarefa>
```

---

## Quick Start

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

#### 2-alt. Planejamento Brownfield (projetos existentes)

```
/AIOS/agents/architect        →  *analyze-brownfield                  # Analisa sistema existente
/AIOS/agents/pm               →  *create-doc brownfield-prd           # PRD focado em integracao
/AIOS/agents/architect        →  *create-doc brownfield-architecture  # Arquitetura de integracao (se necessario)
/AIOS/agents/po               →  *execute-checklist-po                # Valida todos os docs
/AIOS/agents/po               →  *shard-doc docs/prd.md               # Fragmenta PRD por epico
```

Para mudancas menores, pule o planejamento completo:
- `@pm → *brownfield-create-story` (bug fix, < 4h)
- `@pm → *brownfield-create-epic` (feature isolada, 1-3 stories)

Guia completo: `.aios-core/working-in-the-brownfield.md`

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

BROWNFIELD         ANALISE                                PLANEJAMENTO BF          DEV (loop)                    RELEASE
──────────         ───────                                ───────────────          ──────────                    ───────
                   @architect → analyze-brownfield         @pm → brownfield-prd     @sm → @dev → @qa → @devops   @devops
                   @analyst → document-project             @architect → bf-arch     story → code → review → PR    release
                                                           @po valida + fragmenta   @po fecha story
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
| [guia-pratico.md](guia-pratico.md) | Guia rapido simplificado para comecar (PT-BR) |
| [passos.md](passos.md) | Workflow completo das 10 fases (PT-BR) |
| [Constituicao](.aios-core/constitution.md) | 6 principios inviolaveis do framework |
| [User Guide](.aios-core/user-guide.md) | Handbook completo do usuario |
| [Brownfield Guide](.aios-core/working-in-the-brownfield.md) | Guia completo para projetos existentes |
| [CHANGELOG.md](CHANGELOG.md) | Historico de versoes e mudancas |
| [Conselho Deliberativo](squads/conselho/docs/README.md) | Documentacao do squad Conselho |

## Modos de Desenvolvimento

### Squad Creator Premium

| Modo | Tempo | Fidelidade | Descricao |
|------|-------|------------|-----------|
| **YOLO** | 30-45 min | 60-75% | Sem materiais expert, usa pesquisa web |
| **QUALITY** | 60-90 min | 85-95% | Com materiais expert (livros, PDFs, transcricoes) |
| **HYBRID** | 45-75 min | Variavel | Materiais parciais |

### Dev Agent

| Modo | Autonomia | Descricao |
|------|-----------|-----------|
| **YOLO** | Total | Tasks simples e deterministicas, 0-1 prompts |
| **Interactive** | Balanceada | Padrao, decisoes com checkpoints, 5-10 prompts |
| **Pre-Flight** | Planejamento completo | Tasks complexas e criticas, 10-15 prompts |

## Provedores LLM Suportados

| Provedor | Configuracao | Uso |
|----------|-------------|-----|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` ou Claude Max | Principal |
| DeepSeek | `DEEPSEEK_API_KEY` | Alternativo |
| OpenAI (GPT-4) | Via OpenRouter | Alternativo |
| OpenRouter | `OPENROUTER_API_KEY` | Multi-model |

## MCP Servers (Opcionais)

| Server | Funcao |
|--------|--------|
| Docker MCP | Operacoes com containers |
| Playwright | Automacao de browser |
| EXA | Pesquisa web via Docker |
| Context7 | Documentacao de bibliotecas |
| Apify | Web scraping e extracao de dados |

---

*Synkra AIOS v3.11.3 — Fork pessoal customizado v1.3.0*
