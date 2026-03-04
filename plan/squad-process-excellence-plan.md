# Plano de Criação: Squad Process Excellence

## Visão Geral

**Nome do Squad:** `process-excellence`
**slashPrefix:** `processExcellence`
**Tipo:** hybrid (automação de processos com heurísticas)
**Modo de Criação:** Squad Creator Premium (YOLO — sem materiais de especialistas reais)
**Idioma:** Português (nomes, comandos, outputs)
**Entry Agent:** orquestrador-de-processos

---

## 1. Estrutura de Diretórios

```
squads/process-excellence/
├── config.yaml
├── README.md
├── agents/
│   ├── orquestrador-de-processos.md    # Master — roteia demandas
│   ├── decompositor-de-tarefas.md      # Quebra tarefas em micro-tarefas
│   ├── otimizador-de-processos.md      # Analisa e melhora processos
│   ├── auditor-de-processos.md         # Avalia aderência e riscos
│   ├── documentador-sop.md             # Cria SOPs e checklists
│   ├── analista-de-metricas.md         # Define e mede KPIs
│   ├── gestor-de-mudanca.md            # Gestão de mudança e adoção
│   └── cacador-de-automacao.md         # Identifica oportunidades de automação
├── tasks/
│   ├── decompor-tarefa.md              # Decomposição completa de tarefa
│   ├── mapear-processo.md              # Mapeamento de processo atual (AS-IS)
│   ├── otimizar-processo.md            # Análise e proposta de melhoria
│   ├── auditar-processo.md             # Auditoria de aderência
│   ├── criar-sop.md                    # Criação de SOP completa
│   ├── definir-metricas.md             # Definição de KPIs e baseline
│   ├── planejar-mudanca.md             # Plano de gestão de mudança
│   ├── identificar-automacoes.md       # Varredura de automações
│   └── analise-completa.md             # Ciclo completo (multi-agente)
├── workflows/
│   ├── wf-analise-completa.yaml        # Fluxo completo: mapear → otimizar → implementar
│   ├── wf-melhoria-rapida.yaml         # Fluxo rápido: otimizar → documentar
│   └── wf-decomposicao.yaml           # Fluxo de decomposição de tarefa
├── templates/
│   ├── micro-tarefa-tmpl.md            # Template de micro-tarefa detalhada
│   ├── mapa-processo-tmpl.md           # Template de mapeamento de processo
│   ├── sop-tmpl.md                     # Template de SOP
│   ├── relatorio-auditoria-tmpl.md     # Template de relatório de auditoria
│   ├── plano-mudanca-tmpl.md           # Template de plano de mudança
│   └── relatorio-automacao-tmpl.md     # Template de oportunidades de automação
├── checklists/
│   ├── checklist-processo.md           # Checklist de qualidade de processo
│   └── checklist-sop.md               # Checklist de qualidade de SOP
└── data/
    ├── frameworks-processos.md         # Lean, Six Sigma, TOC, BPM
    ├── catalogo-automacoes.md          # Ferramentas e plataformas de automação
    └── kpis-referencia.md              # KPIs de referência por tipo de processo
```

---

## 2. Definição dos 8 Agentes

### 2.1 Orquestrador de Processos (Master)
- **Papel:** Recebe qualquer demanda relacionada a processos e roteia para o(s) agente(s) correto(s)
- **Tier:** 1 (fundamental)
- **Referência para clonagem (YOLO):** Geary Rummler (Rummler-Brache Group)
- **Frameworks inline:**
  - Rummler-Brache 3 Níveis de Performance (Organização, Processo, Executor)
  - Rummler-Brache 3 Dimensões (Objetivos, Design, Gestão)
  - Matriz 9-Cell (3 níveis × 3 dimensões) para diagnóstico e triagem
- **Heurísticas de triagem (baseadas em Rummler):**
  - Se problema está no nível Organização → envolver Analista de Métricas + Otimizador
  - Se problema está no nível Processo → envolver Otimizador + Auditor
  - Se problema está no nível Executor → envolver Decompositor + Documentador SOP
  - Se problema cruza níveis → workflow de Análise Completa
- **Comandos:**
  - `*ajuda` — Lista comandos disponíveis
  - `*decompor` → Decompositor de Tarefas
  - `*otimizar` → Otimizador de Processos
  - `*auditar` → Auditor de Processos
  - `*documentar` → Documentador SOP
  - `*metricas` → Analista de Métricas
  - `*mudanca` → Gestor de Mudança
  - `*automatizar` → Caçador de Automação
  - `*analise-completa` → Workflow completo (multi-agente)
  - `*melhoria-rapida` → Workflow rápido
- **Lógica de roteamento:**
  - Classifica demanda em: decomposição, mapeamento, melhoria, auditoria, documentação, métricas, mudança, automação
  - Se ambíguo, pergunta ao usuário
  - Para demandas complexas, orquestra múltiplos agentes em sequência

### 2.2 Decompositor de Tarefas
- **Papel:** Quebra qualquer tarefa em micro-tarefas executáveis por alguém que nunca fez antes
- **Tier:** 1 (fundamental)
- **Referência para clonagem (YOLO):** David Allen (Getting Things Done), Tiago Forte (PARA/Building a Second Brain)
- **Frameworks inline:**
  - WBS (Work Breakdown Structure)
  - GTD Next Actions
  - Técnica do "Explain Like I'm 5" para instruções
- **Output por micro-tarefa:**
  - Nome da micro-tarefa
  - Pré-requisitos (o que precisa estar pronto antes)
  - Passo-a-passo detalhado (instruções para iniciante)
  - Ferramentas/recursos necessários
  - Tempo estimado
  - Critério de conclusão ("está feito quando...")
  - Dependências (quais micro-tarefas devem vir antes/depois)
  - Possíveis problemas e como resolver
- **Comandos:**
  - `*decompor` — Decomposição completa de uma tarefa
  - `*micro-tarefa` — Detalhar uma micro-tarefa específica
  - `*ajuda` — Listar comandos

### 2.3 Otimizador de Processos
- **Papel:** Analisa processos e propõe melhorias com base em frameworks reconhecidos
- **Tier:** 1 (fundamental)
- **Referência para clonagem (YOLO):** Taiichi Ohno (Toyota Production System/Lean), Eliyahu Goldratt (Theory of Constraints), Michael Hammer (Business Process Reengineering)
- **Frameworks inline:**
  - Lean (8 desperdícios: TIMWOODS)
  - Six Sigma (DMAIC)
  - Theory of Constraints (5 Focusing Steps)
  - Value Stream Mapping
- **Análise obrigatória:**
  1. Mapa do processo atual (AS-IS)
  2. Identificação de gargalos e desperdícios
  3. Análise de valor (atividades que agregam vs. não agregam valor)
  4. Proposta de processo futuro (TO-BE)
  5. Impacto esperado (tempo, custo, qualidade)
  6. Plano de implementação das melhorias
- **Comandos:**
  - `*otimizar` — Análise completa de um processo
  - `*gargalo` — Identificar gargalo principal
  - `*valor` — Análise de cadeia de valor
  - `*ajuda` — Listar comandos

### 2.4 Auditor de Processos
- **Papel:** Avalia se processos estão sendo seguidos e identifica riscos
- **Tier:** 2 (especialista)
- **Referência para clonagem (YOLO):** Frameworks ISO 9001, COSO, princípios de auditoria interna
- **Frameworks inline:**
  - Ciclo de auditoria (planejamento → execução → relatório → follow-up)
  - Matriz de risco (probabilidade × impacto)
  - Análise de gaps (definido vs. praticado)
- **Relatório obrigatório:**
  1. Score de aderência (0-100)
  2. Desvios encontrados (classificados por severidade)
  3. Riscos operacionais identificados
  4. Recomendações prioritizadas
  5. Plano de ação corretiva
- **Comandos:**
  - `*auditar` — Auditoria completa de um processo
  - `*risco` — Análise de risco focada
  - `*gap` — Análise de gaps
  - `*ajuda` — Listar comandos

### 2.5 Documentador SOP
- **Papel:** Transforma processos em documentação clara e acessível para iniciantes
- **Tier:** 2 (especialista)
- **Referência para clonagem (YOLO):** Princípios de Technical Writing, estilo Stripe/Notion docs
- **Tipos de output:**
  - SOP completa (Standard Operating Procedure)
  - Checklist de execução
  - Fluxograma textual/ASCII
  - Guia rápido (quick reference)
  - FAQ do processo
- **Regras de escrita:**
  - Linguagem simples, sem jargão
  - Cada passo deve ser uma ação concreta
  - Incluir screenshots/exemplos quando possível
  - Versionar toda documentação
  - Incluir "quando algo der errado" em cada seção
- **Comandos:**
  - `*sop` — Criar SOP completa
  - `*checklist` — Criar checklist de execução
  - `*fluxo` — Criar fluxograma do processo
  - `*guia-rapido` — Criar guia rápido (1 página)
  - `*ajuda` — Listar comandos

### 2.6 Analista de Métricas
- **Papel:** Define KPIs, mede performance e acompanha resultados de mudanças
- **Tier:** 2 (especialista)
- **Referência para clonagem (YOLO):** Frameworks OKR, Balanced Scorecard, princípios de Process Mining
- **Frameworks inline:**
  - SMART goals para KPIs
  - Balanced Scorecard (4 perspectivas)
  - Baseline → Intervenção → Medição
- **Entregas obrigatórias:**
  1. Definição de KPIs (nome, fórmula, fonte, frequência, meta)
  2. Baseline (medição antes da mudança)
  3. Dashboard proposto (quais métricas mostrar e como)
  4. Relatório de evolução (antes vs. depois)
- **Comandos:**
  - `*metricas` — Definir KPIs para um processo
  - `*baseline` — Medir estado atual
  - `*dashboard` — Propor dashboard
  - `*comparar` — Antes vs. depois
  - `*ajuda` — Listar comandos

### 2.7 Gestor de Mudança
- **Papel:** Planeja a adoção de novos processos considerando o fator humano
- **Tier:** 2 (especialista)
- **Referência para clonagem (YOLO):** John Kotter (8 Steps of Change), ADKAR model (Prosci), Kurt Lewin (Unfreeze-Change-Refreeze)
- **Frameworks inline:**
  - Kotter's 8 Steps
  - ADKAR (Awareness, Desire, Knowledge, Ability, Reinforcement)
  - Stakeholder Analysis
  - Resistance Management
- **Plano obrigatório:**
  1. Análise de stakeholders (quem é afetado, como, resistência esperada)
  2. Estratégia de comunicação (mensagens-chave por público)
  3. Plano de treinamento (o que ensinar, como, quando)
  4. Estratégia de rollout (big bang vs. gradual, piloto)
  5. Plano de reforço (como garantir que a mudança pegue)
  6. Métricas de adoção
- **Comandos:**
  - `*mudanca` — Plano completo de gestão de mudança
  - `*stakeholders` — Análise de stakeholders
  - `*comunicacao` — Plano de comunicação
  - `*treinamento` — Plano de treinamento
  - `*ajuda` — Listar comandos

### 2.8 Caçador de Automação
- **Papel:** Identifica oportunidades de automação em processos e recomenda ferramentas
- **Tier:** 2 (especialista)
- **Referência para clonagem (YOLO):** Princípios de RPA (UiPath), No-Code/Low-Code, filosofia "automate the boring stuff"
- **Frameworks inline:**
  - Matriz Esforço × Impacto para priorização
  - Automation Readiness Assessment
  - ROI de automação (tempo economizado × frequência × custo)
- **Análise obrigatória:**
  1. Varredura do processo (quais passos são repetitivos/determinísticos)
  2. Classificação por tipo (integração, notificação, geração, extração, decisão)
  3. Priorização por ROI (esforço de implementar vs. tempo economizado)
  4. Recomendação de ferramenta específica por automação
  5. Estimativa de ROI mensal
  6. Plano de implementação (ordem, dependências)
- **Catálogo de ferramentas inline:**
  - n8n, Zapier, Make (integrações)
  - Scripts Python/Node.js (processamento)
  - Claude/GPT APIs (decisão e geração)
  - Cron/Task Scheduler (agendamento)
  - Google Apps Script (G Suite)
  - Power Automate (Microsoft)
- **Comandos:**
  - `*automatizar` — Varredura completa de automações
  - `*roi` — Cálculo de ROI de uma automação específica
  - `*ferramenta` — Recomendar ferramenta para um caso
  - `*ajuda` — Listar comandos

---

## 3. Workflows

### 3.1 wf-analise-completa.yaml (5 fases)
Ciclo completo de melhoria de processo:

```
FASE 1: Mapeamento
  → Otimizador mapeia processo AS-IS
  → Analista define baseline de métricas
  → Checkpoint: processo mapeado e baseline definido

FASE 2: Análise
  → Auditor avalia aderência e riscos
  → Otimizador identifica gargalos e desperdícios
  → Caçador identifica automações
  → Checkpoint: diagnóstico completo

FASE 3: Redesenho
  → Otimizador propõe processo TO-BE
  → Caçador detalha automações viáveis
  → Decompositor quebra implementação em micro-tarefas
  → Checkpoint: proposta aprovada pelo usuário

FASE 4: Planejamento
  → Gestor de Mudança cria plano de adoção
  → Documentador cria SOPs do novo processo
  → Analista define metas e dashboard
  → Checkpoint: documentação pronta

FASE 5: Entrega
  → Consolidação de todos os artefatos
  → Plano de implementação final
  → Handoff para execução
```

### 3.2 wf-melhoria-rapida.yaml (3 fases)
Para melhorias pontuais:

```
FASE 1: Diagnóstico rápido
  → Otimizador analisa o processo
  → Checkpoint: problemas identificados

FASE 2: Proposta
  → Otimizador propõe melhorias
  → Decompositor quebra em micro-tarefas
  → Checkpoint: proposta aprovada

FASE 3: Documentação
  → Documentador cria/atualiza SOP
  → Entrega final
```

### 3.3 wf-decomposicao.yaml (2 fases)
Para decomposição pura de tarefas:

```
FASE 1: Entendimento
  → Decompositor elicita contexto da tarefa
  → Checkpoint: escopo definido

FASE 2: Decomposição
  → Decompositor gera micro-tarefas completas
  → Entrega: lista de micro-tarefas detalhadas
```

---

## 4. Templates

| Template | Uso | Conteúdo principal |
|----------|-----|--------------------|
| `micro-tarefa-tmpl.md` | Output do Decompositor | Nome, pré-requisitos, passo-a-passo, ferramentas, tempo, critério de conclusão, dependências, troubleshooting |
| `mapa-processo-tmpl.md` | Output do Otimizador | Fluxo AS-IS, atores, sistemas, handoffs, tempos por etapa, pontos de dor |
| `sop-tmpl.md` | Output do Documentador | Objetivo, escopo, responsáveis, pré-requisitos, passos, troubleshooting, FAQ, versionamento |
| `relatorio-auditoria-tmpl.md` | Output do Auditor | Score, desvios, riscos, recomendações, plano de ação |
| `plano-mudanca-tmpl.md` | Output do Gestor de Mudança | Stakeholders, comunicação, treinamento, rollout, reforço, métricas |
| `relatorio-automacao-tmpl.md` | Output do Caçador | Oportunidades, priorização, ferramentas, ROI, plano de implementação |

---

## 5. Data (Knowledge Bases)

| Arquivo | Conteúdo |
|---------|----------|
| `frameworks-processos.md` | Lean (8 desperdícios TIMWOODS), Six Sigma (DMAIC), TOC (5 Focusing Steps), Value Stream Mapping, BPM lifecycle |
| `catalogo-automacoes.md` | Ferramentas por categoria com prós/contras, pricing, casos de uso ideais |
| `kpis-referencia.md` | KPIs padrão por tipo de processo (atendimento, vendas, dev, operações, financeiro) |

---

## 6. Ordem de Execução

### Fase 0: Setup
1. Criar `squads/process-excellence/config.yaml`
2. Criar estrutura de diretórios

### Fase 1: Knowledge Bases (data/)
3. Criar `frameworks-processos.md`
4. Criar `catalogo-automacoes.md`
5. Criar `kpis-referencia.md`

### Fase 2: Templates
6. Criar todos os 6 templates

### Fase 3: Tasks
7. Criar todas as 9 tasks

### Fase 4: Agentes (ordem por dependência)
8. Decompositor de Tarefas (independente)
9. Otimizador de Processos (independente)
10. Auditor de Processos (independente)
11. Documentador SOP (independente)
12. Analista de Métricas (independente)
13. Gestor de Mudança (independente)
14. Caçador de Automação (independente)
15. Orquestrador de Processos (depende de todos os outros)

### Fase 5: Workflows
16. Criar `wf-decomposicao.yaml`
17. Criar `wf-melhoria-rapida.yaml`
18. Criar `wf-analise-completa.yaml`

### Fase 6: Integração
19. Criar `README.md`
20. Criar checklists

### Fase 7: Registro no sistema
21. Registrar slash commands no `.claude/commands/`

---

## 7. Estimativa de Artefatos

| Tipo | Quantidade | Linhas estimadas (cada) |
|------|------------|------------------------|
| config.yaml | 1 | ~60 |
| Agentes (.md) | 8 | 400-800 cada |
| Tasks (.md) | 9 | 100-200 cada |
| Workflows (.yaml) | 3 | 300-500 cada |
| Templates (.md) | 6 | 50-100 cada |
| Knowledge bases (.md) | 3 | 200-400 cada |
| Checklists (.md) | 2 | 50-100 cada |
| README.md | 1 | 100-200 |
| **TOTAL** | **33 arquivos** | **~8.000-12.000 linhas** |

---

## 8. Mind Cloning (YOLO Mode)

Como estamos em modo YOLO (sem materiais), a pesquisa de cada "mente" será feita via web research. Os especialistas referenciados:

| Agente | Mente(s) de Referência | O que extrair |
|--------|----------------------|---------------|
| Orquestrador | Geary Rummler | 3 Níveis de Performance, Matriz 9-Cell, triagem sistêmica |
| Decompositor | David Allen, Tiago Forte | Filosofia GTD, next actions, WBS |
| Otimizador | Taiichi Ohno, Eliyahu Goldratt | TPS, Lean, TOC, 5 Focusing Steps |
| Auditor | ISO 9001, COSO framework | Ciclo de auditoria, matriz de risco |
| Documentador | Estilo Stripe/Notion | Clareza, acessibilidade, estrutura |
| Analista | Kaplan & Norton | Balanced Scorecard, OKR |
| Gestor de Mudança | John Kotter, Prosci ADKAR | 8 Steps, ADKAR, resistência |
| Caçador | Filosofia "automate boring stuff" | Critérios de automação, ROI |

Para cada clone, o agente @oalanicolas extrairá:
- **Voice DNA:** Como essa pessoa fala/escreve (padrões, vocabulário, ritmo)
- **Thinking DNA:** Como essa pessoa pensa/decide (frameworks, heurísticas, anti-patterns)

---

## 9. Modos de Operação do Squad

| Modo | Fases | Quando usar |
|------|-------|-------------|
| **Análise Completa** | 5 | Processo crítico, mudança significativa |
| **Melhoria Rápida** | 3 | Ajuste pontual, processo simples |
| **Decomposição** | 2 | Só precisa quebrar tarefa em micro-tarefas |
| **Comando direto** | 1 | Usar agente específico diretamente |

---

## 10. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Agentes muito genéricos (YOLO) | Baixa fidelidade | Compensar com frameworks operacionais fortes inline |
| Sobreposição entre agentes | Confusão no uso | Orquestrador com regras claras de roteamento + SCOPE explícito em cada agente |
| Squad muito grande (8 agentes) | Complexidade de manutenção | Workflows bem definidos + README claro |
| Contexto muito longo ao carregar agente | Performance | Manter agentes entre 400-800 linhas (curadoria > volume) |
