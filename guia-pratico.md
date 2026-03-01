# Synkra AIOS -- Guia Pratico Simplificado

> **UM caminho. SEM desvios. Da ideia ao deploy.**
>
> O AIOS tem dezenas de caminhos possiveis. Aqui voce segue UM fluxo testado.
>
> **Premissas:** Claude Code como IDE. Funciona para projetos **greenfield** (novo) e **brownfield** (existente).
> **Brownfield?** Se voce esta trabalhando em um projeto existente, este guia marca os pontos de divergencia com **[BF]**. Para o guia brownfield completo, consulte `.aios-core/working-in-the-brownfield.md`.
> **Referencia detalhada:** Consulte `passos.md` para versao completa com todos os criterios.

---

## Greenfield ou Brownfield?

Antes de comecar, identifique o tipo do seu projeto:

| | Greenfield (novo) | Brownfield (existente) |
|---|---|---|
| **Quando** | Projeto do zero, sem codigo existente | Adicionar features, corrigir bugs, modernizar |
| **Config** | `project.type: greenfield` em `core-config.yaml` | `project.type: brownfield` em `core-config.yaml` |
| **Fluxo** | Siga este guia linearmente (Partes 1-7) | Siga este guia com as notas **[BF]** ou use o guia dedicado |
| **Guia dedicado** | Este documento | `.aios-core/working-in-the-brownfield.md` |

> **Dica:** Para mudancas pequenas em projetos existentes, voce NAO precisa do fluxo completo. Use diretamente:
> - `@pm → *brownfield-create-story` (bug fix, < 4 horas)
> - `@pm → *brownfield-create-epic` (feature pequena, 1-3 stories)

---

## Indice

1. [Parte 1: Setup do Projeto](#parte-1-setup-do-projeto)
2. [Parte 2: Criando Squads de Dominio](#parte-2-criando-squads-de-dominio)
3. [Parte 3: Fase de Planejamento](#parte-3-fase-de-planejamento)
4. [Parte 4: Ciclo de Desenvolvimento](#parte-4-ciclo-de-desenvolvimento)
5. [Parte 5: Usando Agentes de Squad no Desenvolvimento](#parte-5-usando-agentes-de-squad-no-desenvolvimento)
6. [Parte 6: Cartao de Referencia Rapida](#parte-6-cartao-de-referencia-rapida)
7. [Parte 7: Modo Autonomo (Opcional)](#parte-7-modo-autonomo-opcional)

---

## Parte 1: Setup do Projeto

> Faca isso UMA VEZ por projeto, antes de qualquer planejamento.

### Passo 1.1 -- Bootstrap do Ambiente

Abra um chat novo no Claude Code e invoque o slash command:

```
/AIOS/agents/devops
```

Aguarde o greeting do Gage. Depois execute:

```
*environment-bootstrap
```

O agente verifica e instala CLIs (git, gh, node), autentica GitHub, cria o repositorio, e gera a estrutura base. Leva 15-30 minutos.

**Saida esperada:**
```
projeto/
├── .aios/
├── docs/
│   ├── stories/
│   ├── prd/
│   └── architecture/
├── package.json
└── README.md
```

**SE** o projeto ja tem `.aios/environment-report.json` → pule este passo.

> **[BF] Brownfield:** Se voce esta integrando o AIOS em um projeto existente, o bootstrap adiciona `.aios/` e `docs/` sem alterar a estrutura do projeto. Apos o bootstrap, rode `@architect → *analyze-brownfield` para mapear tech stack, padroes e constraints do sistema existente.

### Passo 1.2 -- Decidir Sobre Squads

**SE** seu projeto precisa de expertise que nao existe nos agentes core (ex: copywriting, vendas, juridico, nutricao) → va para a **Parte 2**.

**SE** seu projeto usa apenas desenvolvimento de software padrao → pule para a **Parte 3**.

**SE** voce esta trabalhando em um projeto existente (brownfield):
- **Mudanca pequena** (bug fix, < 4h) → `@pm → *brownfield-create-story` → va direto para a **Parte 4** (passo 4.2)
- **Feature isolada** (1-3 stories) → `@pm → *brownfield-create-epic` → va para a **Parte 4** (passo 4.1)
- **Enhancement grande** (multiplos epicos) → siga a **Parte 3** usando templates brownfield
- **Divida tecnica / migracao** → rode o workflow `brownfield-discovery` primeiro

---

## Parte 2: Criando Squads de Dominio

> Faca isso APENAS quando precisar de expertise que os agentes core nao cobrem.
> Exemplo: SaaS de marketing que precisa de copywriters baseados em experts reais.

### Passo 2.1 -- Ativar o Squad Chief

Chat novo no Claude Code:

```
/squad-creator/agents/squad-chief
```

Aguarde o greeting e as estatisticas do ecossistema.

### Passo 2.2 -- Descrever o Squad

Diga diretamente o que voce quer:

```
Quero um squad de copywriting para criar landing pages e emails de venda
```

O squad-chief inicia automaticamente a pesquisa de elite minds do dominio.

### Passo 2.3 -- Escolher o Modo de Execucao

O sistema apresenta tres modos:

| Modo | Quando usar | Fidelidade | Tempo | Materiais |
|------|------------|------------|-------|-----------|
| **YOLO** | Nao tem materiais dos experts | 60-75% | 30-45 min | Nenhum (pesquisa web) |
| **QUALITY** | Tem livros/PDFs/transcricoes | 85-95% | 60-90 min | Obrigatorio por expert |
| **HYBRID** | Tem materiais de alguns experts | Variavel | 45-75 min | Parcial |

**Como escolher:**
- **YOLO** → Voce so quer comecar rapido e nao tem materiais. Bom para prototipacao.
- **QUALITY** → Voce tem livros, cursos ou transcricoes dos experts. Maximo de fidelidade.
- **HYBRID** → Voce tem materiais de 2 experts mas nao de outros. O sistema usa web para os que faltam.

### Passo 2.4 -- Fornecer Materiais (QUALITY/HYBRID apenas)

Se escolheu QUALITY ou HYBRID, o sistema pede materiais para cada expert:

```
┌─────────────────────────────────────────────┐
│ Gary Halbert                                │
│                                             │
│ Voce tem materiais deste expert?            │
│ □ Sim - Path/links: _______________         │
│ □ Nao - Use pesquisa web                    │
│                                             │
│ Tipos:                                      │
│ □ Livros (PDF)                              │
│ □ Transcricoes de cursos                    │
│ □ Entrevistas/podcasts                      │
│ □ Artigos/newsletters                       │
└─────────────────────────────────────────────┘
```

Indique o path dos arquivos ou links. Quanto mais material, maior a fidelidade.

### Passo 2.5 -- Aprovar Elite Minds

Apos pesquisa, o sistema mostra os experts encontrados:

```
┌──────────────────┬──────────┬───────────────────────────┐
│ Mind             │ Tier     │ Framework Principal       │
├──────────────────┼──────────┼───────────────────────────┤
│ Alex Hormozi     │ Tier 0   │ Value Equation            │
│ Gary Halbert     │ Tier 1   │ Prince of Print           │
│ Ry Schwartz      │ Tier 1   │ Email Mastery             │
└──────────────────┴──────────┴───────────────────────────┘
```

Aprove para prosseguir. O sistema extrai Voice DNA, Thinking DNA, roda smoke tests, e gera todos os artefatos.

### Passo 2.6 -- Receber o Squad

Ao finalizar:

```
squads/{nome-do-squad}/
├── agents/          # Agentes clonados dos experts
├── tasks/           # Tasks do dominio
├── workflows/       # Workflows multi-fase
├── templates/       # Templates de output
├── data/            # Knowledge bases
├── config.yaml
└── README.md
```

Valide com `*validate-squad {nome}` para garantir integridade estrutural.

**Importante:** Para usar os agentes do squad criado, voce precisa sincronizar com o IDE. O script `sync-ide-command.py` copia os agentes para `.claude/commands/`. Apos a sync, os novos agentes ficam disponiveis como slash commands.

---

## Parte 3: Fase de Planejamento

> Faca isso UMA VEZ por projeto, DEPOIS do bootstrap.
> Cada passo gera um documento. SALVE antes de passar ao proximo agente.
> IMPORTANTE: Cada agente deve ser ativado em chat NOVO (contexto limpo).

### Passo 3.1 -- Project Brief

Chat novo:

```
/AIOS/agents/analyst
```

Depois:

```
*create-project-brief
```

O Atlas conduz perguntas sobre sua ideia, mercado, publico-alvo e proposta de valor. Responda com detalhes.

**Saida:** `docs/project-brief.md`

**SE** quiser brainstorming antes → rode `*brainstorm {topico}` primeiro.

### Passo 3.2 -- PRD (Product Requirements Document)

Chat novo:

```
/AIOS/agents/pm
```

Depois:

```
*create-prd
```

O Morgan le o brief, faz perguntas de esclarecimento, e gera o PRD com requisitos funcionais (FR-*), nao-funcionais (NFR-*), restricoes (CON-*), e epicos.

**Saida:** `docs/prd.md`

**Checkpoint:** Revise os epicos e requisitos. O PRD guia TODO o desenvolvimento.

> **[BF] Brownfield:** Em vez de `*create-prd`, use `*create-doc brownfield-prd` que gera um PRD focado na integracao com o sistema existente. O PM analisa o codebase atual antes de definir requisitos. Template: `brownfield-prd-tmpl.yaml`. Para mudancas menores: `*brownfield-create-epic` (1-3 stories) ou `*brownfield-create-story` (bug fix < 4h).

### Passo 3.3 -- Especificacao Frontend

Chat novo:

```
/AIOS/agents/ux-design-expert
```

Solicite:

```
Crie a especificacao de frontend baseada no PRD em docs/prd.md
```

A Uma cria wireframes, fluxos de navegacao, design system (Atomic Design) e tokens.

**Saida:** Especificacao UI/UX completa

**OPCIONAL:** Para gerar UI com v0/Lovable, peca: "Gere um prompt de AI frontend baseado na spec"

**SE** projeto sem frontend (API only) → pule este passo.

### Passo 3.4 -- Arquitetura

Chat novo:

```
/AIOS/agents/architect
```

Depois:

```
*create-full-stack-architecture
```

A Aria le PRD + spec UI/UX e gera: stack tecnologico, design de APIs, infraestrutura, seguranca.

**Saida:** `docs/architecture.md`

**SE** a arquitetura sugere mudancas no PRD → volte ao `/AIOS/agents/pm` para atualizar.

> **[BF] Brownfield:** Use `*create-doc brownfield-architecture` em vez de `*create-full-stack-architecture`. A Aria foca em estrategia de integracao, riscos de compatibilidade e plano de migracao. Template: `brownfield-architecture-tmpl.yaml`. Se a mudanca segue padroes existentes sem alteracao arquitetural, este passo pode ser pulado.

### Passo 3.5 -- Validacao e Sharding

Chat novo:

```
/AIOS/agents/po
```

**Primeiro -- Validar artefatos:**

```
*execute-checklist-po
```

O Pax aplica checklist de 10 pontos nos documentos. Se encontrar problemas, corrija com o agente indicado e volte ao PO.

**Segundo -- Fragmentar documentos:**

```
*shard-doc docs/prd.md
```

```
*shard-doc docs/architecture.md
```

**Saida:**
```
docs/prd/
├── epic-1-autenticacao.md
├── epic-2-dashboard.md
└── epic-3-pagamentos.md

docs/framework/
├── source-tree.md
├── tech-stack.md
└── coding-standards.md
```

**Checkpoint:** Confirme que `docs/framework/source-tree.md` e `docs/framework/tech-stack.md` existem. O dev depende deles.

---

## Parte 4: Ciclo de Desenvolvimento

> Repita este ciclo para CADA story ate completar todos os epicos.
> Cada agente em chat NOVO.

### Passo 4.1 -- Criar Story

Chat novo:

```
/AIOS/agents/sm
```

Depois:

```
*draft
```

O River le o PRD fragmentado, identifica a proxima story, e gera com criterios de aceitacao (Given/When/Then).

**Saida:** `docs/stories/{story-id}/story.md`

> **[BF] Brownfield:** O SM pode usar `*create-brownfield-story` em vez de `*draft` para criar stories com awareness de integracao. Essas stories incluem tasks de integracao e testes de regressao.

### Passo 4.2 -- Implementar

Chat novo:

```
/AIOS/agents/dev
```

Depois:

```
*develop {story-id}
```

O Dex le a story, planeja, codifica, escreve testes, faz commit local. Ele NUNCA faz push.

**Modos:**
- `*develop {story-id}` → Interativo (recomendado para aprendizado)
- `*develop {story-id} yolo` → Autonomo (rapido, tasks simples)
- `*develop {story-id} preflight` → Planejamento completo (tasks criticas)

**Saida:** Codigo + testes, story com status **In Review**

### Passo 4.3 -- Revisao de Qualidade

Chat novo:

```
/AIOS/agents/qa
```

Depois:

```
*review-build {story-id}
```

A Quinn executa revisao em 10 fases: codigo, testes, criterios de aceitacao, regressoes, performance, seguranca.

**Resultados:**
- **PASS** → Va para o passo 4.4
- **CONCERNS** → Aprovada com ressalvas, va para 4.4
- **FAIL** → Gera `QA_FIX_REQUEST.md`. Volte ao dev com `*apply-qa-fixes`, repita 4.3

### Passo 4.4 -- Push e PR

Chat novo:

```
/AIOS/agents/devops
```

Primeiro rode os quality gates:

```
*pre-push
```

Se tudo passar, crie o PR:

```
*create-pr
```

**Apenas o devops pode fazer push.** Nenhum outro agente tem essa permissao.

### Passo 4.5 -- Fechar Story

Chat novo:

```
/AIOS/agents/po
```

Depois:

```
*close-story {story-id}
```

O Pax valida que a implementacao atende o PRD e fecha a story.

**Decisao:**
- **Continuar** → Volte ao passo 4.1 para a proxima story
- **Pausar** → Salve o estado e pare
- **Revisar** → Veja resumo do que foi feito

---

## Parte 5: Usando Agentes de Squad no Desenvolvimento

> Como usar agentes de dominio (criados na Parte 2) durante o ciclo de desenvolvimento.

### 5.1 -- Quando Chamar

Durante a implementacao, voce pode precisar de expertise especializada. Exemplos:

| Situacao | Squad Agent | Quando |
|----------|-------------|--------|
| Story pede copy para landing page | Agente de copywriting | Antes do dev implementar |
| Story pede texto para email | Agente de email marketing | Antes do dev implementar |
| Story pede estrategia de vendas | Agente de vendas | Durante planejamento da story |

### 5.2 -- Fluxo Pratico

Imagine que a Story 3.2 e "Implementar Landing Page de Vendas" e voce tem um squad de copy.

**Passo A -- Gerar conteudo (chat novo):**

Ative o agente do squad (o path depende de como foi sincronizado com o IDE):

```
/{nome-do-squad}/agents/{nome-do-expert}
```

Solicite o que precisa:

```
Crie a copy para a landing page do produto X.
Contexto: [cole os criterios de aceitacao da story]
Publico-alvo: [informacao do PRD]
```

O agente gera conteudo usando frameworks reais do expert clonado.

**Passo B -- Salvar output:**

Salve como arquivo no projeto: `docs/content/landing-page-copy.md`

**Passo C -- Implementar com dev (chat novo):**

```
/AIOS/agents/dev
```

```
*develop 3.2
```

Instrua o dev a usar o conteudo:

```
Use a copy em docs/content/landing-page-copy.md para implementar o componente
```

### 5.3 -- Regras

1. **Chat separado** -- Sempre ative o agente de squad em chat separado
2. **Output como arquivo** -- Salve o output como arquivo no projeto
3. **Referencia na story** -- Instrua o dev a usar o arquivo
4. **QA valida tudo** -- O QA revisa tanto codigo quanto integracao do conteudo

---

## Parte 6: Cartao de Referencia Rapida

### Agentes Core

| Agente | Slash Command | Faz | Comando Principal |
|--------|---------------|-----|-------------------|
| Atlas (Analyst) | `/AIOS/agents/analyst` | Pesquisa, brief, brainstorming | `*create-project-brief` |
| Morgan (PM) | `/AIOS/agents/pm` | PRD, epicos, requisitos | `*create-prd` |
| Uma (UX Designer) | `/AIOS/agents/ux-design-expert` | Spec UI/UX, wireframes, design system | `*create-front-end-spec` |
| Aria (Architect) | `/AIOS/agents/architect` | Arquitetura, stack, APIs | `*create-full-stack-architecture` |
| Dara (Data Eng) | `/AIOS/agents/data-engineer` | Schema BD, migrations, RLS | `*create-schema` |
| Pax (PO) | `/AIOS/agents/po` | Validacao, backlog, sharding | `*shard-doc`, `*close-story` |
| River (SM) | `/AIOS/agents/sm` | Criacao de stories | `*draft` |
| Dex (Dev) | `/AIOS/agents/dev` | Implementacao (SEM push) | `*develop {id}` |
| Quinn (QA) | `/AIOS/agents/qa` | Review, quality gates | `*review-build {id}` |
| Gage (DevOps) | `/AIOS/agents/devops` | Push, PR, CI/CD (UNICO push) | `*pre-push`, `*create-pr` |
| Orion (Master) | `/AIOS/agents/aios-master` | Meta-operacoes do framework | `*create`, `*modify` |

### Squad Creator Premium

| Agente | Slash Command | Faz |
|--------|---------------|-----|
| Squad Chief | `/squad-creator/agents/squad-chief` | Triagem, criacao de squads, extracao de SOPs |
| OalaNicolas | `/squad-creator/agents/oalanicolas` | Mind cloning, extracao de DNA |
| Pedro Valerio | `/squad-creator/agents/pedro-valerio` | Design de processos, veto conditions |

### Conselho Deliberativo

| Agente | Slash Command | Faz |
|--------|---------------|-----|
| Conselheiro-Mor | `/conselho/agents/conselheiro-mor` | Orchestrator: triage, convocacao, moderacao |
| Critico Metodologico | `/conselho/agents/critico-metodologico` | Score 0-100, deteccao de vieses cognitivos |
| Advogado do Diabo | `/conselho/agents/advogado-do-diabo` | 5 entregas obrigatorias + pre-mortem |
| Sintetizador | `/conselho/agents/sintetizador` | Confianca decomposta, matriz stakeholders |

### Comandos Mais Usados

```bash
# === SETUP (uma vez) ===
/AIOS/agents/devops → *environment-bootstrap

# === PLANEJAMENTO (por projeto) ===
/AIOS/agents/analyst    → *create-project-brief
/AIOS/agents/pm         → *create-prd
/AIOS/agents/ux-design-expert → [descreva a spec]
/AIOS/agents/architect  → *create-full-stack-architecture
/AIOS/agents/po         → *execute-checklist-po
/AIOS/agents/po         → *shard-doc docs/prd.md

# === DESENVOLVIMENTO (loop por story) ===
/AIOS/agents/sm         → *draft
/AIOS/agents/dev        → *develop {story-id}
/AIOS/agents/qa         → *review-build {story-id}
/AIOS/agents/devops     → *pre-push → *create-pr
/AIOS/agents/po         → *close-story {story-id}

# === SQUADS ===
/squad-creator/agents/squad-chief → [descreva o dominio]

# === CONSELHO DELIBERATIVO ===
/conselho/agents/conselheiro-mor → *deliberar [questao]   # Full (5 fases)
/conselho/agents/conselheiro-mor → *quick [questao]       # Quick (3 fases)
/conselho/agents/conselheiro-mor → *audit [decisao]       # Auditoria
```

### Comandos Brownfield

```bash
# === ANALISE (projeto existente) ===
/AIOS/agents/architect  → *analyze-brownfield           # Analise do sistema existente
/AIOS/agents/analyst    → *document-project              # Documentar projeto existente

# === PLANEJAMENTO BROWNFIELD ===
/AIOS/agents/pm         → *create-doc brownfield-prd     # PRD com foco em integracao
/AIOS/agents/architect  → *create-doc brownfield-architecture  # Arquitetura de integracao
/AIOS/agents/pm         → *brownfield-create-epic        # Epic para feature isolada (1-3 stories)
/AIOS/agents/pm         → *brownfield-create-story       # Story para bug fix / mudanca pequena

# === DESENVOLVIMENTO BROWNFIELD ===
/AIOS/agents/sm         → *create-brownfield-story       # Story com awareness de integracao
```

### Estrutura de Pastas do Projeto

```
projeto/
├── .aios-core/              # Framework (NAO edite)
├── .aios/                   # Estado do projeto
├── .claude/commands/        # Slash commands (agentes)
│   ├── AIOS/agents/         # Agentes core
│   ├── conselho/agents/     # Conselho Deliberativo
│   └── squad-creator/agents/# Agentes premium
├── docs/
│   ├── project-brief.md     # Brief (Analyst)
│   ├── prd.md               # PRD (PM)
│   ├── prd/                 # PRD fragmentado (PO)
│   ├── architecture.md      # Arquitetura (Architect)
│   ├── framework/           # Guias de dev (PO)
│   │   ├── source-tree.md
│   │   ├── tech-stack.md
│   │   └── coding-standards.md
│   └── stories/             # Stories (SM → Dev → QA)
├── squads/                  # Squads de dominio
│   ├── conselho/            # Conselho Deliberativo
│   └── squad-creator/       # Squad Creator Premium
├── src/                     # Codigo fonte (Dev)
└── package.json
```

### Troubleshooting

| Problema | Solucao |
|----------|---------|
| Slash command nao aparece | Verifique se o `.md` existe em `.claude/commands/` |
| Agente nao encontra story | Confirme que a story esta em `docs/stories/{id}/story.md` |
| Dev tentou fazer push | PARE. Apenas `/AIOS/agents/devops` faz push |
| PRD vago demais | Volte ao PM e refine. O PRD e a base de tudo |
| QA reprovou story | Leia o `QA_FIX_REQUEST.md`, volte ao dev com `*apply-qa-fixes` |
| Squad nao ativa | Verifique se `squads/{nome}/config.yaml` existe |
| Agente ignora contexto | Rode `/AIOS/agents/po → *shard-doc` novamente |
| Precisa de ajuda | Em qualquer agente, digite `*help` |
| Projeto existente (brownfield) | Consulte `.aios-core/working-in-the-brownfield.md` e use os comandos `*brownfield-*` |

### Fluxo Visual

```
SETUP           PLANEJAMENTO                     DEV (loop por story)
─────           ────────────                     ────────────────────

/devops         /analyst → brief                 /sm → *draft
  │             /pm → PRD                           │
  │             /ux-design-expert → spec UI        /dev → *develop
  │             /architect → arquitetura             │
  │             /po → validar + fragmentar         /qa → *review-build
  │                                                  │
  │                                               /devops → *pre-push + *create-pr
  │                                                  │
  └────────────►└───────────────────────────────► /po → *close-story
                                                     │
                                                 proxima story (loop)
```

### Regras de Ouro

1. **Um agente por chat.** Sempre abra chat novo ao trocar de agente.
2. **Salve os documentos.** Cada agente gera output. Salve em `docs/` antes de passar ao proximo.
3. **Nunca pule o PO.** Validacao e fragmentacao sao essenciais para o dev funcionar bem.
4. **Apenas devops faz push.** Nenhum outro agente tem permissao.
5. **Story first.** O dev nao comeca sem story. O SM cria a story. Respeite a sequencia.
6. **Squads em chat separado.** Gere conteudo com o squad, salve como arquivo, depois passe ao dev.
7. **Modo autonomo e opcional.** Se preferir controle total, use o fluxo manual. Se quiser velocidade, use `autonomous-runner.sh`.
8. **Brownfield: documente primeiro.** Em projetos existentes, rode `*analyze-brownfield` ou `*document-project` ANTES de planejar. Os agentes precisam de contexto do sistema atual.

---

## Parte 7: Modo Autonomo (Opcional)

> **NOVO:** Execute fases inteiras automaticamente, sem abrir chats individuais.
> O fluxo manual (Partes 1-6) continua funcionando normalmente.
> Use o modo autonomo quando ja entender o fluxo e quiser velocidade.

### 7.1 -- Pre-requisitos

O modo autonomo exige que os documentos base existam. No minimo:
- `docs/project-brief.md` (criado na Parte 3, passo 3.1)

A partir dele, o runner pode gerar tudo automaticamente.

### 7.2 -- Rodar Fase Unica

Para executar apenas uma fase especifica:

```bash
# Exemplo: gerar PRD automaticamente a partir do brief
bash .aios-core/scripts/autonomous-runner.sh --phase 2
```

O runner le os inputs da fase, spawna Claude Code com o prompt do agente correto,
valida o output, e grava learnings.

### 7.3 -- Rodar Varias Fases em Cascata

Para executar multiplas fases sequencialmente:

```bash
# Gerar tudo: PRD -> UX -> Squads -> Arquitetura -> Dados -> Validacao
bash .aios-core/scripts/autonomous-runner.sh --phases 2,3,4,5,6,7

# Tudo incluindo dev e deploy:
bash .aios-core/scripts/autonomous-runner.sh --phases all
```

### 7.4 -- Ciclo de Dev Autonomo (Fase 8)

A Fase 8 e especial — roda um loop sobre todas as stories:

```bash
bash .aios-core/scripts/autonomous-runner.sh --phase 8
```

Para cada story:
1. Cria story automaticamente (@sm)
2. Implementa codigo + testes (@dev)
3. Roda QA automatico (@qa)
4. Se QA passa -> commit local
5. Se QA falha -> retry com contexto limpo
6. Proxima story

### 7.5 -- Opcoes Uteis

```bash
# Pausar entre fases para inspecionar:
bash .aios-core/scripts/autonomous-runner.sh --phases 2,3,4,5 --pause-between-phases

# Ver o que faria sem executar:
bash .aios-core/scripts/autonomous-runner.sh --phases all --dry-run

# Continuar mesmo se uma fase falhar:
bash .aios-core/scripts/autonomous-runner.sh --phases 2,3,4,5,6,7 --skip-on-fail
```

### 7.6 -- Retomar Execucao Interrompida

Se o runner for interrompido, ele salva estado em `plan/autonomous-state.json`.
Para retomar:

```bash
bash .aios-core/scripts/autonomous-runner.sh --resume
```

### 7.7 -- Quando NAO Usar

- **Primeiro projeto** — Use o fluxo manual (Partes 1-6) para aprender o AIOS
- **Decisoes criticas** — PRD de produto complexo merece revisao humana
- **Squads Premium** — Se precisa de modo QUALITY com materiais, use o fluxo manual
- **Debug de problemas** — Se algo falhou, volte ao fluxo manual para investigar

### Fluxo Visual (Manual vs Autonomo)

```
MANUAL (Partes 1-6):
  /devops -> /analyst -> /pm -> /ux -> /architect -> /po -> [/sm -> /dev -> /qa -> /devops -> /po] loop

AUTONOMO (Parte 7):
  bash autonomous-runner.sh --phases all
  -> Mesmas fases, mesmos agentes, mesmos quality gates
  -> Sem abrir chats individuais
  -> Instancia fresca por fase/story (zero compactacao)
  -> Learnings acumulados entre iteracoes
```

---

*Synkra AIOS -- Guia Pratico Simplificado v1.3*
*Baseado em: AIOS-Core v2.1.0, Squad Creator Premium v3.0.0, Autonomous Runner v1.0.0*
