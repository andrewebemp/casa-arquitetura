# Synkra AIOS - Fluxo Completo: Da Ideia ao Deploy

## Visao Geral

O Synkra AIOS orquestra **12 agentes especializados** atraves de um fluxo estruturado
que transforma uma ideia em produto pronto para producao. Cada agente tem autoridade
exclusiva sobre seu dominio e trabalha em contexto limpo (chat separado).

```
IDEIA ──► DISCOVERY ──► PRD ──► UX ──► SQUADS ──► ARCHITECTURE ──► DATA ──► VALIDATION ──► DEV CYCLE ──► DEPLOY
```

---

## FASE 0 - Bootstrap do Ambiente

**Agente:** `@devops` (Gage)
**Comando:** `*environment-bootstrap`
**Duracao estimada:** 15-30 min

### O que acontece:
1. Instala CLIs necessarias: `git`, `gh`, `node`, `npm`, `supabase`, `railway`
2. Autentica servicos: GitHub (`gh auth login`), Supabase, Railway
3. Cria repositorio GitHub (local + remoto)
4. Gera estrutura inicial do projeto:

```
projeto/
├── .aios/
├── docs/
│   ├── stories/
│   ├── prd/
│   ├── architecture/
│   └── framework/
├── package.json
├── .gitignore
└── README.md
```

### Criterios de saida:
- [ ] Todas as CLIs instaladas e funcionais
- [ ] Repositorio criado no GitHub
- [ ] Estrutura base do projeto gerada
- [ ] `git push` inicial realizado

---

## FASE 1 - Pesquisa e Ideacao

**Agente:** `@analyst` (Atlas)
**Comandos:** `*brainstorm`, `*research {topico}`, `*create-project-brief`
**Duracao estimada:** 30-60 min

### O que acontece:
1. Facilita sessao de brainstorming estruturada
2. Pesquisa de mercado e analise competitiva
3. Identifica publico-alvo, dores e oportunidades
4. Analise de viabilidade tecnica inicial

### Saida:
- `docs/project-brief.md` — Brief do projeto com pesquisa, insights e recomendacoes

### Criterios de saida:
- [ ] Brief do projeto documentado
- [ ] Pesquisa de mercado/competidores realizada
- [ ] Publico-alvo e proposta de valor definidos

### Handoff:
> "Brief completo. Salve como `docs/project-brief.md`, depois crie o PRD com `@pm`"

---

## FASE 2 - Criacao do PRD (Product Requirements Document)

**Agente:** `@pm` (Morgan)
**Comandos:** `*create-prd`, `*gather-requirements`, `*write-spec`
**Duracao estimada:** 30-60 min

### O que acontece:
1. Le o project brief do Analyst
2. Elicita requisitos adicionais (perguntas interativas)
3. Define requisitos funcionais (FR-*) e nao-funcionais (NFR-*)
4. Estrutura epicos e features
5. Define restricoes (CON-*)
6. Gera PRD completo usando template `prd-tmpl.yaml`

### Saida:
- `docs/prd.md` — PRD completo com epicos, requisitos e restricoes

### Regra Constitucional - "No Invention":
> Toda especificacao DEVE derivar de requisitos. Nunca inventar funcionalidades.

### Criterios de saida:
- [ ] Todos os requisitos funcionais documentados (FR-*)
- [ ] Requisitos nao-funcionais definidos (NFR-*)
- [ ] Restricoes mapeadas (CON-*)
- [ ] Epicos estruturados
- [ ] PRD salvo em `docs/prd.md`

### Handoff:
> "PRD pronto. Salve como `docs/prd.md`, depois crie a especificacao UI/UX com `@ux-design-expert`"

---

## FASE 3 - Especificacao UX/UI

**Agente:** `@ux-design-expert` (Uma)
**Comandos:** `*create-spec`, `*wireframe`, `*research`, `*setup-design-system`
**Duracao estimada:** 30-45 min

### O que acontece:
1. Le PRD e project brief
2. Pesquisa de usuario e referencias visuais
3. Cria wireframes e fluxos de navegacao
4. Define design system (Atomic Design):
   - Atomos (botoes, inputs, icones)
   - Moleculas (formularios, cards)
   - Organismos (headers, sidebars)
   - Templates (layouts de pagina)
   - Paginas (composicao final)
5. Define tokens de design (cores, tipografia, espacamento)
6. Gera prompts para ferramentas AI (v0, Lovable) se necessario

### Saida:
- Especificacao UI/UX completa
- Wireframes e fluxos
- Design system (se aplicavel)

### Criterios de saida:
- [ ] Wireframes de todas as telas principais
- [ ] Fluxos de navegacao definidos
- [ ] Design tokens documentados
- [ ] Especificacao acessivel (WCAG)

### Handoff:
> "Spec UI/UX completa. Prossiga com a arquitetura do sistema com `@architect`"

---

## FASE 4 - Design de Squads (Agentes Especificos do Projeto)

### O que e um Squad?
Um Squad e uma colecao **especifica do dominio** contendo agentes, tasks, workflows
e templates customizados para o projeto. Diferente dos **teams** (bundles de agentes
core pre-configurados), squads sao **criados sob medida** para cada projeto.

Existem **duas abordagens** para criar squads:

| Abordagem | Agente | Quando usar | Resultado |
|-----------|--------|-------------|-----------|
| **Premium (recomendado)** | `/squad-creator/agents/squad-chief` | Precisa de expertise de dominio (copy, vendas, juridico) | Agentes clonados de mentes elite reais com DNA extraido |
| **Basico** | `/AIOS/agents/squad-creator` | Precisa de agentes funcionais baseados no PRD | Agentes genericos baseados em entidades do projeto |

---

### OPCAO A: Squad Creator Premium (Recomendado)

**Agentes:** Squad Chief (orquestrador) + OalaNicolas (mind cloning) + Pedro Valerio (process design)
**Slash commands:**
- `/squad-creator/agents/squad-chief` — Orquestrador principal
- `/squad-creator/agents/oalanicolas` — Especialista em extracao de DNA
- `/squad-creator/agents/pedro-valerio` — Especialista em design de processos
**Duracao estimada:** 30-90 min (dependendo do modo)

O Squad Creator Premium cria agentes baseados em **mentes elite reais** — pessoas com frameworks
documentados e metodologias comprovadas. Em vez de um agente generico "checkout-agent", voce
obtem um agente que pensa e escreve como Gary Halbert, Alex Hormozi ou qualquer expert do dominio.

#### Passo 4A.1 - Escolher Modo de Execucao

Chat novo, ative o squad-chief:

```
/squad-creator/agents/squad-chief
```

Descreva o que precisa:

```
Quero um squad de copywriting para criar landing pages e emails de venda
```

O sistema apresenta tres modos de execucao:

| Modo | Materiais | Fidelidade | Tempo | Quando usar |
|------|-----------|------------|-------|-------------|
| **YOLO** | Nenhum (pesquisa web) | 60-75% | 30-45 min | Prototipacao rapida, sem materiais |
| **QUALITY** | Livros, PDFs, transcricoes | 85-95% | 60-90 min | Maximo de precisao, tem materiais |
| **HYBRID** | Parcial (alguns experts) | Variavel | 45-75 min | Materiais de alguns experts |

Escolha o modo conforme seus recursos disponiveis.

#### Passo 4A.2 - Fornecer Materiais (QUALITY/HYBRID apenas)

Se escolheu QUALITY ou HYBRID, o sistema solicita materiais para cada expert:

```
┌─────────────────────────────────────────────┐
│ Gary Halbert                                │
│                                             │
│ Voce tem materiais deste expert?            │
│ □ Sim - Path/links: _______________         │
│ □ Nao - Use pesquisa web                    │
│                                             │
│ Tipos aceitos:                              │
│ □ Livros (PDF)                              │
│ □ Transcricoes de cursos                    │
│ □ Entrevistas/podcasts                      │
│ □ Artigos/newsletters                       │
└─────────────────────────────────────────────┘
```

Materiais de maior qualidade = maior fidelidade do agente criado.

#### Passo 4A.3 - Pesquisa e Aprovacao de Elite Minds

O squad-chief pesquisa automaticamente (3-5 iteracoes) e apresenta os experts encontrados:

```
┌──────────────────┬──────────┬───────────────────────────┐
│ Mind             │ Tier     │ Framework Principal       │
├──────────────────┼──────────┼───────────────────────────┤
│ Eugene Schwartz  │ Tier 0   │ 5 Levels of Awareness     │
│ Gary Halbert     │ Tier 1   │ A-Pile Method             │
│ Dan Kennedy      │ Tier 1   │ No B.S. Marketing         │
│ David Ogilvy     │ Tier 1   │ Ogilvy Framework          │
│ Ry Schwartz      │ Tier 1   │ Email Mastery             │
└──────────────────┴──────────┴───────────────────────────┘

Viabilidade: 8/10
Tier 0 coberto: Sim (Eugene Schwartz)
```

Aprove para prosseguir. O sistema automaticamente:

1. **Extrai Voice DNA** (via @oalanicolas): vocabulario, tom, frases-assinatura, anti-patterns
2. **Extrai Thinking DNA** (via @oalanicolas): frameworks, heuristicas, arvore de decisao
3. **Cria artefatos** (via @pedro-valerio): agentes, tasks, workflows, veto conditions
4. **Roda smoke tests**: 3 testes por agente (conhecimento, decisao, objecao)
5. **Valida qualidade**: score minimo 7/10 para aprovar

#### Passo 4A.4 - Receber o Squad

Estrutura gerada:

```
squads/{nome-do-squad}/
├── agents/
│   ├── orchestrator.md          # Orquestrador do squad
│   ├── eugene-schwartz.md       # Tier 0 - Diagnostico
│   ├── gary-halbert.md          # Tier 1 - Execucao
│   ├── dan-kennedy.md           # Tier 1 - Execucao
│   └── ...
├── tasks/                       # Tasks especificas do dominio
├── workflows/                   # Workflows multi-fase com checkpoints
├── templates/                   # Templates de output
├── checklists/                  # Checklists de validacao
├── data/                        # Knowledge base do dominio
├── config.yaml                  # Configuracao do squad
├── README.md                    # Documentacao e guia de uso
└── docs/
    └── quality-dashboard.md     # Metricas de qualidade por agente
```

#### Passo 4A.5 - Validacao e Sync

Valide a estrutura:

```
*validate-squad {nome}
```

O squad-chief roda validacao em 9 fases com quality gates bloqueantes.

Para disponibilizar os agentes como slash commands no Claude Code, sincronize com o IDE:

```
python squads/squad-creator/scripts/sync-ide-command.py squad {nome-do-squad}
```

Apos a sync, os agentes ficam disponiveis:

```
/{nome-do-squad}/agents/{nome-do-expert}
```

#### Criterios de saida (Premium):
- [ ] Modo de execucao escolhido (YOLO/QUALITY/HYBRID)
- [ ] Elite minds pesquisadas e aprovadas (minimo 5)
- [ ] Voice DNA e Thinking DNA extraidos por expert
- [ ] Smoke tests passando (3/3 por agente)
- [ ] Quality score >= 7/10
- [ ] Squad validado sem erros
- [ ] Slash commands sincronizados com IDE

---

### OPCAO B: Squad Creator Basico (Alternativa)

**Agente:** `/AIOS/agents/squad-creator` (Craft)
**Comandos:** `*design-squad`, `*create-squad`, `*validate-squad`
**Duracao estimada:** 20-40 min

Use esta opcao quando precisar de agentes **funcionais** baseados nas entidades do PRD,
sem necessidade de clonar mentes reais. Ideal para agentes de processo (checkout-agent,
inventory-agent) em vez de agentes de expertise (copywriter, estrategista).

#### Passo 4B.1 - Design do Squad
**Comando:** `*design-squad --docs ./docs/prd.md`

O que acontece:
1. Analisa documentacao do projeto (PRD, brief, spec UI/UX)
2. Extrai entidades, workflows, integracoes e stakeholders
3. Recomenda agentes customizados com score de confianca
4. Recomenda tasks especificas com entrada/saida
5. Gera blueprint interativo para revisao

Pipeline de analise:
```
Input (PRD + docs) ──► Normalizacao ──► Extracao de Entidades ──► Deteccao de Workflows
                                                                          │
Blueprint (squad-design.yaml) ◄── Mapeamento de Stakeholders ◄── Mapeamento de Integracoes
```

Saida intermediaria - `squad-design.yaml`:
```yaml
squad:
  name: meu-projeto-squad
  domain: e-commerce   # exemplo

analysis:
  entities: [Produto, Pedido, Usuario, Pagamento]
  workflows: [checkout-flow, gestao-estoque, notificacoes]
  integrations: [Stripe API, SendGrid, S3]
  stakeholders: [Admin, Cliente, Vendedor]

recommendations:
  agents:
    - id: checkout-agent
      role: "Gerencia fluxo de checkout e pagamentos"
      commands: [process-payment, validate-cart, apply-coupon]
      confidence: 0.92
    - id: inventory-agent
      role: "Controle de estoque e reposicao"
      commands: [check-stock, reserve-items, update-inventory]
      confidence: 0.88
  tasks:
    - name: process-checkout
      agent: checkout-agent
      entrada: [cart-data, payment-info]
      saida: [order-confirmation, receipt]
      confidence: 0.90
```

#### Passo 4B.2 - Revisao do Blueprint
O usuario revisa as recomendacoes:
- **Accept** — aceita agente/task recomendado
- **Reject** — remove recomendacao
- **Modify** — ajusta nome, role, comandos
- **Skip** — pula para decidir depois
- Pode adicionar agentes/tasks nao recomendados

#### Passo 4B.3 - Criacao do Squad
**Comando:** `*create-squad meu-projeto --from-design ./squad-design.yaml`

Estrutura gerada:
```
squads/meu-projeto/
├── squad.yaml                    # Manifesto (referencia configs do projeto)
├── README.md                     # Documentacao do squad
├── config/
│   └── .gitkeep                  # Configs ficam em docs/framework/
├── agents/
│   ├── checkout-agent.md         # Agente de checkout
│   └── inventory-agent.md        # Agente de estoque
├── tasks/
│   ├── process-checkout.yaml     # Task de processamento
│   └── check-inventory.yaml     # Task de inventario
├── workflows/
│   └── checkout-flow.yaml        # Workflow do checkout
├── checklists/                   # Checklists de validacao
├── templates/                    # Templates especificos
├── tools/                        # Ferramentas customizadas
├── scripts/                      # Scripts de automacao
└── data/                         # Dados estaticos
```

#### Passo 4B.4 - Validacao do Squad
**Comando:** `*validate-squad meu-projeto`

Validacoes executadas:
1. **Manifesto** — `squad.yaml` conforme JSON Schema
2. **Estrutura** — Diretorios esperados existem
3. **Tasks** — Campos obrigatorios e convencao de nomes
4. **Agentes** — Formato valido de definicao
5. **Config References** — Caminhos de configuracao resolvem

```
Validating squad: ./squads/meu-projeto/

Errors: 0
Warnings: 1
  - [MISSING_DIRECTORY]: Expected directory: checklists/

Result: VALID (with warnings)
```

#### Passo 4B.5 - Analise de Cobertura (Opcional)
**Comando:** `*analyze-squad meu-projeto`

```
Coverage:
  Agents:  ████████░░ 80% (4/5 com tasks)
  Tasks:   ██████████ 100% (8 tasks)
  Config:  ██████░░░░ 60% (README ok, falta tech-stack)
  Docs:    ████░░░░░░ 40% (documentacao incompleta)

Suggestions:
  1. Adicionar tasks para inventory-agent (apenas 1 task)
  2. Criar workflow para fluxo de notificacoes
  3. Adicionar checklist de validacao de pagamento
```

#### Passo 4B.6 - Extensao (conforme necessario)
**Comando:** `*extend-squad meu-projeto --add agent --name notification-agent`

Pode ser feito a qualquer momento para adicionar:
- Novos agentes
- Novas tasks
- Novos workflows
- Checklists, templates, tools, scripts, data

#### Criterios de saida (Basico):
- [ ] Blueprint gerado e revisado
- [ ] Squad criado com agentes e tasks especificos do dominio
- [ ] Validacao passou sem erros
- [ ] Cobertura analisada e gaps identificados

---

### Handoff (ambas as opcoes):
> "Squad criado e validado. Prossiga com a arquitetura do sistema com `/AIOS/agents/architect`"

---

## FASE 5 - Arquitetura do Sistema

**Agente:** `@architect` (Aria)
**Comandos:** `*create-full-stack-architecture`, `*create-backend-architecture`, `*create-front-end-architecture`
**Duracao estimada:** 30-60 min

### O que acontece:
1. Le PRD, spec UI/UX e squad design
2. Define stack tecnologico completo
3. Projeta arquitetura do sistema (monolito, microservicos, serverless)
4. Design de APIs (REST, GraphQL, tRPC, WebSocket)
5. Planejamento de infraestrutura
6. Arquitetura de seguranca
7. Estrategia de performance
8. Delega design de banco ao `@data-engineer`

### Saida:
- `docs/architecture.md` — Arquitetura completa do sistema

### Criterios de saida:
- [ ] Stack tecnologico definido e justificado
- [ ] Diagrama de arquitetura do sistema
- [ ] Design de APIs documentado
- [ ] Plano de infraestrutura
- [ ] Consideracoes de seguranca
- [ ] Estrategia de performance

### Handoff:
> "Arquitetura completa. Salve em `docs/architecture.md`. Se necessario, acione `@data-engineer` para schema do banco."

---

## FASE 6 - Modelagem de Dados

**Agente:** `@data-engineer` (Dara)
**Comandos:** `*domain-modeling`, `*create-schema`, `*rls-audit`
**Duracao estimada:** 20-40 min

### O que acontece:
1. Le arquitetura e PRD
2. Modela dominio (Domain-Driven Design)
3. Cria schema do banco de dados
4. Define RLS (Row Level Security) policies
5. Planeja migrations
6. Otimiza queries por access patterns

### Principios:
- Corretude antes de velocidade
- Tudo versionado e reversivel
- Seguranca por padrao (RLS, constraints, triggers)
- Idempotencia em tudo
- Access pattern first

### Saida:
- Schema do banco de dados
- Migrations planejadas
- Policies de seguranca (RLS)

### Criterios de saida:
- [ ] Schema modelado seguindo DDD
- [ ] RLS policies definidas
- [ ] Migrations planejadas
- [ ] Indices otimizados por access patterns

### Handoff:
> "Schema completo. Prossiga com validacao dos artefatos com `@po`"

---

## FASE 7 - Validacao e Fragmentacao dos Documentos

**Agente:** `@po` (Pax)
**Comandos:** `*validate`, `*shard-doc`, `*execute-checklist`
**Duracao estimada:** 30-60 min

### Passo 7.1 - Validacao de Artefatos
**Comando:** `*validate`

Checklist de 10 pontos aplicada a TODOS os documentos:
1. Titulo claro e objetivo
2. Descricao completa
3. Criterios de aceitacao testaveis
4. Escopo bem definido
5. Dependencias mapeadas
6. Estimativa de complexidade
7. Valor de negocio
8. Riscos documentados
9. Criterios de Done
10. Alinhamento com PRD/Epic

Se encontrar problemas → devolve ao agente responsavel para correcao.

### Passo 7.2 - Fragmentacao (Sharding)
**Comando:** `*shard-doc`

Quebra documentos grandes em pedacos gerenciaveis para os agentes consumirem:

```
docs/prd.md ──► docs/prd/
                ├── epic-1-autenticacao.md
                ├── epic-2-dashboard.md
                ├── epic-3-pagamentos.md
                └── epic-4-notificacoes.md

docs/architecture.md ──► docs/architecture/
                         ├── backend.md
                         ├── frontend.md
                         ├── database.md
                         └── infrastructure.md
```

### Passo 7.3 - Geracao de Guias de Desenvolvimento
Gera documentos de referencia para os desenvolvedores:
- `docs/framework/source-tree.md` — Mapa da arvore de arquivos
- `docs/framework/tech-stack.md` — Stack tecnologico detalhado
- `docs/framework/coding-standards.md` — Padroes de codigo

### Criterios de saida:
- [ ] Todos os artefatos validados (10 pontos)
- [ ] PRD fragmentado por epicos
- [ ] Arquitetura fragmentada por dominio
- [ ] Guias de desenvolvimento gerados

### Handoff:
> "Documentos validados e fragmentados! source-tree.md, tech-stack.md criados. Crie stories com `@sm`"

---

## FASE 8 - Ciclo de Desenvolvimento (Iterativo)

Esta fase se repete para **cada story** ate completar todos os epicos.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   8.1 Criar Story ──► 8.2 Implementar ──► 8.3 QA Review       │
│        (@sm)              (@dev)              (@qa)             │
│         │                   │                   │               │
│         │                   │              ┌────┴────┐          │
│         │                   │              │         │          │
│         │                   │            PASS      FAIL         │
│         │                   │              │     (fix request)  │
│         │                   │              │         │          │
│         │                   ◄──────────────┘─────────┘          │
│         │                                                       │
│         ◄─── Proxima story (loop)                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Passo 8.1 - Criacao de Stories
**Agente:** `@sm` (River)
**Comando:** `*create-story`
**Duracao:** 10-20 min por story

O que acontece:
1. Le PRD fragmentado + arquitetura
2. Identifica proxima story nao implementada
3. Gera story detalhada com:
   - Descricao no formato "As a [user], I want [feature] so that [benefit]"
   - Criterios de aceitacao (Given/When/Then)
   - Tasks e subtasks
   - Plano de testes
   - Dependencias

Saida: `docs/stories/{story-id}/story.md`

Status da story: **Draft**

Estrutura da story:
```markdown
# Story X.Y.Z - [Titulo]

## Status: Draft

## Story
As a [usuario], I want [funcionalidade] so that [beneficio]

## Acceptance Criteria
- Given [contexto], when [acao], then [resultado]

## Tasks
- [ ] Task 1: Implementar feature X
- [ ] Task 2: Escrever testes
- [ ] Task 3: Atualizar documentacao

## Dev Agent Record
### Implementation Plan
### Debug Log
### Change Log

## Testing
## File List
## QA Results
```

### Passo 8.2 - Implementacao
**Agente:** `@dev` (Dex)
**Comando:** `*develop {story-id}`
**Duracao:** 1-4 horas por story

Modos de desenvolvimento:

| Modo | Autonomia | Prompts | Melhor para |
|------|-----------|---------|-------------|
| **YOLO** | Total | 0-1 | Tasks simples e deterministas |
| **Interactive** | Balanceada | 5-10 | Padrao, decisoes com checkpoints |
| **Pre-Flight** | Planejamento completo | 10-15 | Tasks complexas e criticas |

O que acontece:
1. Le story + criterios de aceitacao
2. Cria plano de implementacao
3. Implementa cada task/subtask
4. Escreve testes para cada requisito
5. Executa quality checks locais:
   - `npm run lint` ✅
   - `npm run typecheck` ✅
   - `npm test` ✅
6. CodeRabbit pre-commit review (auto-fix CRITICAL)
7. Atualiza File List na story
8. Commit local (NÃO faz push — exclusivo do @devops)
9. Muda status da story para **In Review**

**Regra Constitucional - CLI First:**
> Toda funcionalidade DEVE funcionar 100% via CLI ANTES de qualquer UI.

**Regra Constitucional - Agent Authority:**
> @dev NUNCA faz `git push`. Apenas `git add`, `commit`, `status`, `diff`, `log`, `branch`, `checkout`, `merge`.

Decisoes autonomas sao logadas em `.ai/decision-log-{story-id}.md`

### Passo 8.3 - Revisao de Qualidade
**Agente:** `@qa` (Quinn)
**Comando:** `*review-build {story}`
**Duracao:** 20-40 min por story

Revisao em **10 fases**:

| Fase | O que valida |
|------|-------------|
| 1 | Qualidade de codigo |
| 2 | Cobertura de testes |
| 3 | Criterios de aceitacao |
| 4 | Regressoes |
| 5 | Performance |
| 6 | Seguranca (OWASP 8 pontos) |
| 7 | Documentacao |
| 8 | Debito tecnico |
| 9 | Arquitetura |
| 10 | Acessibilidade |

Resultados possiveis:
- **PASS** — Story aprovada, status muda para **Done**
- **CONCERNS** — Aprovada com ressalvas documentadas
- **FAIL** — Gera `QA_FIX_REQUEST.md` → volta para @dev
- **WAIVED** — Dispensada com justificativa

Se FAIL:
1. QA gera `QA_FIX_REQUEST.md` com issues detalhadas
2. @dev aplica correcoes
3. @qa re-verifica (ate 3 iteracoes para CRITICAL/HIGH)
4. Self-healing automatico para issues criticas

**Modelo de autoridade do QA:** Advisory only — QA revisa, nao bloqueia. Dev decide.

### Loop:
Volta ao Passo 8.1 para a proxima story, ate completar todas as stories de todos os epicos.

---

## FASE 9 - Release e Deploy

**Agente:** `@devops` (Gage)
**Comandos:** `*pre-push`, `*push`, `*create-pr`, `*release`
**Duracao estimada:** 15-30 min

### Passo 9.1 - Pre-Push Quality Gate
**Comando:** `*pre-push`

Quality gates obrigatorios (todos devem passar):
- [ ] `npm run lint` — Sem erros
- [ ] `npm run typecheck` — Sem erros de tipo
- [ ] `npm test` — Todos os testes passam
- [ ] `npm run build` — Build com sucesso
- [ ] CodeRabbit review — Sem issues CRITICAL

### Passo 9.2 - Push para Remoto
**Comando:** `*push {mensagem}`

**Regra Constitucional - Agent Authority:**
> `@devops` e o UNICO agente autorizado a fazer `git push` para o remoto.

O que acontece:
1. Confirma que todos os quality gates passaram
2. Aplica versionamento semantico
3. Atualiza changelog
4. Push para o repositorio remoto
5. Confirmacao obrigatoria antes de operacoes irreversiveis

### Passo 9.3 - Criacao de Pull Request
**Comando:** `*create-pr`

1. Cria PR com descricao detalhada
2. Referencia stories implementadas
3. Inclui checklist de review
4. Aguarda aprovacao

### Passo 9.4 - Release
**Comando:** `*release {version}`

1. Merge na branch principal (main/master)
2. Cria tag de release com versao semantica
3. Gera release notes
4. Deploy para producao (Railway, Vercel, etc.)

### Criterios de saida:
- [ ] Todos os quality gates passaram
- [ ] Codigo pushed para remoto
- [ ] PR criado e aprovado
- [ ] Release tag criada
- [ ] Deploy em producao funcionando
- [ ] Projeto no ar!

---

## Resumo Visual Completo

```
 FASE 0                    FASE 1                 FASE 2
┌──────────┐          ┌──────────────┐       ┌─────────────┐
│ @devops  │          │  @analyst    │       │    @pm      │
│ Bootstrap│──────────│  Pesquisa &  │───────│  Criacao    │
│ Ambiente │          │  Ideacao     │       │  do PRD     │
└──────────┘          └──────────────┘       └──────┬──────┘
                                                    │
                      ┌─────────────────────────────┤
                      │                             │
                      ▼                             ▼
                FASE 3                        FASE 4
          ┌──────────────┐              ┌──────────────────┐
          │ @ux-design   │              │  @squad-creator  │
          │ Spec UI/UX   │              │  Design & Criacao│
          │              │              │  de Squads       │
          └──────┬───────┘              └────────┬─────────┘
                 │                               │
                 └───────────┬───────────────────┘
                             │
                             ▼
                       FASE 5                    FASE 6
                 ┌──────────────┐          ┌──────────────┐
                 │  @architect  │──────────│@data-engineer│
                 │  Arquitetura │          │  Schema BD   │
                 │  do Sistema  │          │  & Migrations│
                 └──────┬───────┘          └──────┬───────┘
                        │                         │
                        └────────┬────────────────┘
                                 │
                                 ▼
                           FASE 7
                     ┌──────────────┐
                     │     @po      │
                     │  Validacao & │
                     │  Sharding    │
                     └──────┬───────┘
                            │
                            ▼
                      FASE 8 (Loop)
          ┌─────────────────────────────────┐
          │  8.1 @sm ──► Cria Story         │
          │       │                         │
          │  8.2 @dev ──► Implementa        │
          │       │                         │
          │  8.3 @qa ──► Revisa (10 fases)  │
          │       │                         │
          │    PASS? ──► Proxima story      │
          │    FAIL? ──► Fix ──► Re-review  │
          └─────────────────┬───────────────┘
                            │ (todas stories completas)
                            ▼
                       FASE 9
                 ┌──────────────┐
                 │   @devops    │
                 │  Pre-push    │
                 │  Push + PR   │
                 │  Release     │
                 │  Deploy      │
                 └──────┬───────┘
                        │
                        ▼
                   PROJETO NO AR
```

---

## Tabela de Referencia Rapida dos Agentes

| Agente | ID | Papel | Autoridade Exclusiva | Comando Principal |
|--------|----|-------|---------------------|-------------------|
| Orion | `@aios-master` | Orquestrador | Criacao de componentes framework | `*create` |
| Atlas | `@analyst` | Analista de Negocios | Pesquisa de mercado, brainstorming | `*research` |
| Morgan | `@pm` | Product Manager | Criacao de PRD, estrutura de epicos | `*create-prd` |
| Uma | `@ux-design-expert` | UX/UI Designer | Design de interfaces, design system | `*create-spec` |
| Craft | `@squad-creator` | Arquiteto de Squads | Criacao e gestao de squads | `*design-squad` |
| Aria | `@architect` | Arquiteta de Sistemas | Arquitetura, selecao de tecnologia | `*create-full-stack-architecture` |
| Dara | `@data-engineer` | Arquiteta de Dados | Schema, migrations, RLS | `*create-schema` |
| Pax | `@po` | Product Owner | Gestao de backlog, validacao | `*validate` |
| River | `@sm` | Scrum Master | Criacao de stories, sprint planning | `*create-story` |
| Dex | `@dev` | Desenvolvedor Full Stack | Implementacao de codigo (SEM PUSH) | `*develop` |
| Quinn | `@qa` | Arquiteta de Testes | Code review, quality gates | `*review-build` |
| Gage | `@devops` | DevOps Manager | UNICO que faz push para remoto | `*push` |

---

## Regras Constitucionais (Inegociaveis)

| # | Principio | Regra | Gate |
|---|-----------|-------|------|
| I | **CLI First** | Funcionalidade CLI antes de qualquer UI | `dev-develop-story.md` |
| II | **Agent Authority** | Cada agente tem autoridade exclusiva | Definicoes dos agentes |
| III | **Story-Driven** | Zero codigo sem story associada | `dev-develop-story.md` |
| IV | **No Invention** | Specs derivam SOMENTE de requisitos | `spec-write-spec.md` |
| V | **Quality First** | Todos os quality gates devem passar | `pre-push.md` |
| VI | **Absolute Imports** | Usar `@/` alias, nunca imports relativos | ESLint |

---

## Times Pre-Configurados (Alternativos aos Squads)

Para projetos que nao precisam de squads customizados:

| Time | Agentes | Uso |
|------|---------|-----|
| `team-all` | Todos os 12 | Projeto completo |
| `team-fullstack` | analyst, pm, ux, architect, po | Planejamento full-stack |
| `team-qa-focused` | dev, qa, devops | Foco em qualidade |
| `team-ide-minimal` | po, sm, dev, qa | Setup minimo |
| `team-no-ui` | architect, dev, devops, data-engineer | Backend only |

---

## Distribuicao de Squads

Squads podem ser distribuidos em 3 niveis:

| Nivel | Local | Comando | Descricao |
|-------|-------|---------|-----------|
| **Local** | `./squads/` | `*create-squad` | Privado, especifico do projeto |
| **Publico** | `github.com/SynkraAI/aios-squads` | `*publish-squad` | Comunidade (gratuito) |
| **Marketplace** | `api.synkra.dev/squads` | `*sync-squad-synkra` | Premium via Synkra API |

---

## Checklist Completo: Da Ideia ao Deploy

### Pre-Desenvolvimento
- [ ] Fase 0: Ambiente bootstrapped (CLIs, repos, auth)
- [ ] Fase 1: Pesquisa e ideacao completas (project brief)
- [ ] Fase 2: PRD criado com requisitos e epicos
- [ ] Fase 3: Especificacao UI/UX pronta
- [ ] Fase 4: Squads desenhados, criados e validados
- [ ] Fase 5: Arquitetura do sistema documentada
- [ ] Fase 6: Schema do banco modelado
- [ ] Fase 7: Artefatos validados e fragmentados

### Durante Desenvolvimento (por story)
- [ ] Story criada com criterios de aceitacao (@sm)
- [ ] Todas as tasks implementadas (@dev)
- [ ] Testes escritos para cada criterio
- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] `npm test` passa
- [ ] `npm run build` sucesso
- [ ] CodeRabbit review executado
- [ ] File List atualizado na story
- [ ] QA review aprovado (@qa)

### Deploy
- [ ] Quality gates passaram
- [ ] Push para remoto (@devops)
- [ ] PR criado e aprovado
- [ ] Release tag criada
- [ ] Deploy em producao
- [ ] Projeto no ar e funcionando

---

## MODO AUTONOMO (Opcional)

> **O que e:** Uma forma alternativa de executar as fases do AIOS automaticamente,
> sem necessidade de abrir chats individuais para cada agente. O fluxo manual
> descrito acima continua funcionando normalmente — o modo autonomo e uma ADICAO.
>
> **Inspirado no Ralph** (github.com/snarktank/ralph): cada tarefa roda numa
> instancia FRESCA de Claude Code, com zero compactacao e performance maxima.

### Quando Usar

| Cenario | Recomendacao |
|---------|-------------|
| Primeiro projeto, aprendendo o AIOS | Use fluxo manual (fases acima) |
| Projeto com requisitos bem definidos | Modo autonomo fases 2-7, manual fase 8 |
| Stories simples e deterministicas | Modo autonomo fases 2-9 completo |
| Precisa de controle fino em cada decisao | Fluxo manual |
| Quer velocidade maxima | Modo autonomo --phases all |

### Como Funciona

Cada fase/story roda numa **instancia fresca de Claude Code** (processo independente):
- **Zero compactacao** — Cada instancia comeca com 0 tokens de historico
- **Isolamento total** — Uma story que falha nao polui o contexto da proxima
- **Learnings entre instancias** — `plan/autonomous-learnings.md` acumula padroes e gotchas

```
autonomous-runner.sh (bash leve, orquestrador)
  |
  |-- Fase 2: claude --print < prompt_prd.md     <- Processo 1 (contexto fresco)
  |-- Fase 3: claude --print < prompt_ux.md      <- Processo 2 (contexto fresco)
  |-- Fase 5: claude --print < prompt_arch.md    <- Processo 3 (contexto fresco)
  |-- Fase 8 (loop por story):
  |     |-- Story 1.1 dev: claude --print        <- Processo N (contexto fresco)
  |     |-- Story 1.1 qa:  claude --print        <- Processo N+1 (contexto fresco)
  |     |-- Story 1.2 dev: claude --print        <- Processo N+2 (contexto fresco)
  |
  |-- Estado entre processos: JSON + markdown (leve, sem memoria de processo)
```

### Comandos

```bash
# Rodar UMA fase especifica:
bash .aios-core/scripts/autonomous-runner.sh --phase 2

# Rodar VARIAS fases em cascata:
bash .aios-core/scripts/autonomous-runner.sh --phases 2,3,4,5,6,7

# Rodar TODAS as fases automatizaveis:
bash .aios-core/scripts/autonomous-runner.sh --phases all

# Rodar apenas o ciclo de dev (8.1->8.2->8.3 em loop):
bash .aios-core/scripts/autonomous-runner.sh --phase 8

# Com opcoes:
bash .aios-core/scripts/autonomous-runner.sh --phases 4,5,6,7,8 \
  --max-retries 3 \
  --pause-between-phases \
  --skip-on-fail
```

### Opcoes

| Flag | Descricao | Default |
|------|-----------|---------|
| `--phase N` | Executa uma fase especifica | - |
| `--phases N,M,O` | Executa multiplas fases em sequencia | - |
| `--phases all` | Executa todas as fases automatizaveis (0-9) | - |
| `--max-retries N` | Tentativas por fase antes de falhar | 3 |
| `--pause-between-phases` | Pausa para inspecao humana entre fases | false |
| `--skip-on-fail` | Pula fase que falha em vez de parar tudo | false |
| `--dry-run` | Mostra prompts sem executar | false |
| `--verbose` | Output detalhado | false |
| `--resume` | Retoma execucao interrompida | - |

### Fases Automatizaveis

| Fase | Automatizavel | Pre-requisito |
|------|--------------|---------------|
| 0 - Bootstrap | Sim | Config inicial do projeto |
| 1 - Ideacao | Parcial (precisa da ideia) | Ideia do usuario como argumento |
| 2 - PRD | Sim | project-brief.md existir |
| 3 - UX/UI | Sim | prd.md existir |
| 4 - Squads | Sim (modo YOLO) | prd.md existir |
| 5 - Arquitetura | Sim | prd.md + spec UI existir |
| 6 - Dados | Sim | architecture.md existir |
| 7 - Validacao | Sim | Docs das fases anteriores |
| 8 - Dev Cycle | Sim (loop) | Stories criadas + docs shardados |
| 9 - Deploy | Sim | Stories com status "Done" |

### Estado e Learnings

O modo autonomo mantem estado em:
- `plan/autonomous-state.json` — Progresso por fase/story (pode resumir se interrompido)
- `plan/autonomous-learnings.md` — Padroes e gotchas descobertos (alimenta iteracoes futuras)

### Regras do Modo Autonomo

1. **Nao altera o fluxo manual** — Todos os comandos `*` dos agentes continuam funcionando
2. **Respeita a Constituicao** — CLI First, Agent Authority, Story-Driven, Quality First
3. **Apenas @devops faz push** — Mesmo no modo autonomo, git push so na Fase 9
4. **Quality gates obrigatorios** — Cada fase/story passa pelos mesmos gates do fluxo manual
5. **Pode pausar e resumir** — O state file permite continuar de onde parou

### Arquivos do Modo Autonomo

```
.aios-core/
  scripts/
    autonomous-runner.sh              # Orquestrador principal
    phase-executors/
      common.sh                       # Funcoes compartilhadas
      phase-0-bootstrap.sh            # Executor fase 0
      phase-2-prd.sh                  # Executor fase 2
      phase-3-ux.sh                   # Executor fase 3
      phase-4-squads.sh               # Executor fase 4
      phase-5-architecture.sh         # Executor fase 5
      phase-6-data.sh                 # Executor fase 6
      phase-7-validation.sh           # Executor fase 7
      phase-8-dev-cycle.sh            # Executor fase 8 (loop Ralph-style)
      phase-9-deploy.sh               # Executor fase 9
  templates/
    phase-prompts/                    # Templates de prompt por fase
  core/execution/
    story-parser.js                   # Parser de stories markdown -> JSON

plan/                                 # Gerado automaticamente
  autonomous-state.json               # Estado da execucao
  autonomous-learnings.md             # Learnings acumulados
```

---

*Synkra AIOS - Da Ideia ao Deploy (10 Fases)*
*Fork pessoal v1.1.0 | Baseado em AIOS-Core v3.11.3*
