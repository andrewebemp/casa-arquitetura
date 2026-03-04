# Analise Completa de Processo (Meta-Task)

**Task ID:** `PE-T-009`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Analise Completa de Processo |
| **status** | pending |
| **responsible_executor** | @orquestrador-de-processos |
| **execution_type** | Agent |
| **input** | [processo a analisar, nivel de profundidade desejado] |
| **output** | [pacote completo: mapa, diagnostico, proposta, documentacao, plano de mudanca] |
| **action_items** | 11 steps |
| **acceptance_criteria** | 5 criteria |

**Estimated Time:** 4-8h (dependendo da complexidade do processo)

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-001 |
| Rationale | Orquestracao requer visao sistemica da Matriz 9-Cell de Rummler, capacidade de coordenar multiplos agentes especializados e consolidar artefatos de diferentes perspectivas em um diagnostico coerente |

### META-TASK: Orquestracao Multi-Agente
Esta task NAO e executada por um unico agente. O @orquestrador-de-processos coordena a execucao de multiplas tasks especializadas, cada uma delegada ao agente mais qualificado. O fluxo segue 5 fases distintas com checkpoints de aprovacao do usuario.

**Agentes envolvidos:**
| Agente | Tasks Delegadas | Fase |
|--------|----------------|------|
| @orquestrador-de-processos | Classificacao, consolidacao, entrega | 1, 3, 5 |
| @otimizador-de-processos | mapear-processo, otimizar-processo | 2, 3 |
| @analista-de-metricas | definir-metricas | 2 |
| @auditor-de-processos | auditar-processo | 3 |
| @cacador-de-automacao | identificar-automacoes | 3 |
| @decompositor-de-tarefas | decompor-tarefa | 4 |
| @gestor-de-mudanca | planejar-mudanca | 4 |
| @documentador-sop | criar-sop | 4 |

## Overview
Executa o ciclo completo de analise de processo: da classificacao inicial ate a entrega do pacote final com todos os artefatos. O orquestrador coordena 8 agentes especializados em 5 fases, com checkpoints de aprovacao do usuario entre fases criticas. Aplicavel a processos de negocio, desenvolvimento de software e processos pessoais.

## Input
- **processo** (string): Nome e descricao do processo a ser analisado
- **nivel_profundidade** (enum): Nivel de analise desejado:
  - **Completa:** Todas as 5 fases (4-8h)
  - **Rapida:** Fases 1-3 apenas (2-4h)
  - **Diagnostico:** Fases 1-2 apenas (1-2h)
- **contexto** (string, opcional): Informacoes sobre a organizacao, area, stakeholders
- **objetivo_especifico** (string, opcional): Foco principal (reduzir custo, acelerar, melhorar qualidade)
- **restricoes** (lista, opcional): Limitacoes conhecidas (orcamento, tecnologia, pessoas, prazo)

## Output
- **pacote-analise-completa** (diretorio): Conjunto de artefatos organizados por fase:
  - Mapa AS-IS do processo
  - Catalogo de KPIs com baseline e metas
  - Relatorio de auditoria (aderencia e riscos)
  - Proposta TO-BE com melhorias priorizadas
  - Relatorio de oportunidades de automacao
  - Diagnostico consolidado
  - Micro-tarefas para implementacao
  - Plano de gestao de mudanca
  - SOP do processo redesenhado
  - Resumo executivo para stakeholders

## Action Items

---
### FASE 1: Classificacao e Planejamento
---

### Step 1: Classificar Demanda via Matriz 9-Cell de Rummler
- [ ] Identificar nivel de analise (Organizacao / Processo / Atividade)
- [ ] Identificar perspectiva (Objetivos / Design / Gestao)
- [ ] Posicionar na Matriz 9-Cell (celula especifica)
- [ ] Determinar quais agentes serao necessarios
- [ ] Definir sequencia de execucao baseada na classificacao
- [ ] Apresentar plano ao usuario para aprovacao

> **CHECKPOINT 1:** Apresentar classificacao e plano ao usuario. Aguardar aprovacao antes de prosseguir.

---
### FASE 2: Mapeamento e Metricas (Paralelo)
---

### Step 2: Acionar mapear-processo (Otimizador)
- [ ] Delegar task `PE-T-002` ao @otimizador-de-processos
- [ ] Fornecer: nome do processo, descricao, stakeholders
- [ ] Aguardar: mapa AS-IS completo com fluxo, atores, tempos e pontos de dor
- [ ] Validar output: fluxo completo, metricas base, diagrama visual

### Step 3: Acionar definir-metricas (Analista) — Em Paralelo com Step 2
- [ ] Delegar task `PE-T-006` ao @analista-de-metricas
- [ ] Fornecer: processo/area, objetivos de negocio
- [ ] Aguardar: catalogo de KPIs com baseline, metas e dashboard proposto
- [ ] Validar output: KPIs SMART, baseline medido, metas definidas

> **CHECKPOINT 2:** Apresentar mapa AS-IS e KPIs ao usuario. Coletar feedback antes de diagnosticar.

---
### FASE 3: Diagnostico e Oportunidades
---

### Step 4: Acionar auditar-processo (Auditor)
- [ ] Delegar task de auditoria ao @auditor-de-processos
- [ ] Fornecer: mapa AS-IS (output Step 2), KPIs (output Step 3)
- [ ] Aguardar: relatorio de aderencia, riscos e nao-conformidades
- [ ] Validar output: riscos classificados, recomendacoes priorizadas

### Step 5: Acionar otimizar-processo (Otimizador)
- [ ] Delegar task `PE-T-003` ao @otimizador-de-processos
- [ ] Fornecer: mapa AS-IS, relatorio de auditoria, objetivos
- [ ] Aguardar: proposta TO-BE, lista de melhorias, analise de impacto
- [ ] Validar output: desperdicios identificados, TO-BE desenhado, impacto quantificado

### Step 6: Acionar identificar-automacoes (Cacador)
- [ ] Delegar task `PE-T-008` ao @cacador-de-automacao
- [ ] Fornecer: mapa AS-IS, proposta TO-BE
- [ ] Aguardar: relatorio de automacoes, catalogo priorizado, plano de implementacao
- [ ] Validar output: ROI calculado, ferramentas recomendadas, priorizacao feita

### Step 7: Consolidar Diagnostico
- [ ] Integrar outputs de auditoria, otimizacao e automacao
- [ ] Criar diagnostico consolidado com:
  - Resumo do estado atual (AS-IS) com metricas
  - Principais problemas encontrados (ranking por impacto)
  - Oportunidades de melhoria (processo + automacao)
  - Proposta de estado futuro (TO-BE) com impacto esperado
- [ ] Apresentar diagnostico completo ao usuario

> **CHECKPOINT 3:** Apresentar diagnostico consolidado. Usuario aprova direcao antes de planejar implementacao.

---
### FASE 4: Planejamento da Implementacao (Paralelo)
---

### Step 8: Acionar decompor-tarefa (Decompositor)
- [ ] Delegar task `PE-T-001` ao @decompositor-de-tarefas
- [ ] Fornecer: lista de melhorias aprovadas, automacoes priorizadas
- [ ] Aguardar: micro-tarefas detalhadas para cada melhoria
- [ ] Validar output: micro-tarefas autocontidas, dependencias mapeadas

### Step 9: Acionar planejar-mudanca (Gestor)
- [ ] Delegar task `PE-T-007` ao @gestor-de-mudanca
- [ ] Fornecer: mudanca proposta (TO-BE), stakeholders, contexto
- [ ] Aguardar: plano de mudanca com comunicacao, treinamento e rollout
- [ ] Validar output: stakeholders mapeados, plano completo

### Step 10: Acionar criar-sop (Documentador)
- [ ] Delegar task de SOP ao @documentador-sop
- [ ] Fornecer: processo TO-BE aprovado, melhorias incorporadas
- [ ] Aguardar: SOP completo do novo processo
- [ ] Validar output: SOP claro, acessivel, com fluxograma

---
### FASE 5: Consolidacao e Entrega
---

### Step 11: Consolidar Pacote Final
- [ ] Reunir todos os artefatos das fases 1-4
- [ ] Criar resumo executivo com:
  - Situacao atual (AS-IS) em 3-5 bullet points
  - Diagnostico principal (o que esta errado/pode melhorar)
  - Proposta de melhoria (TO-BE) com impacto quantificado
  - Plano de implementacao (timeline, fases, responsaveis)
  - Investimento necessario vs. retorno esperado
  - Proximos passos imediatos
- [ ] Organizar artefatos em estrutura logica
- [ ] Revisar coerencia entre todos os documentos
- [ ] Entregar pacote completo ao usuario

> **CHECKPOINT FINAL:** Entrega formal do pacote. Coletar aprovacao e definir proximos passos.

## Acceptance Criteria
- [ ] **AC-1:** Todas as 5 fases completadas na sequencia correta com outputs validados
- [ ] **AC-2:** Todos os artefatos gerados (mapa, KPIs, auditoria, TO-BE, automacoes, micro-tarefas, plano de mudanca, SOP)
- [ ] **AC-3:** Aprovacao do usuario obtida em cada checkpoint (3 checkpoints + entrega final)
- [ ] **AC-4:** Diagnostico consolidado integra perspectivas de todos os agentes especializados
- [ ] **AC-5:** Resumo executivo criado com linguagem acessivel para stakeholders nao-tecnicos

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| (entrega final) | Pacote aprovado pelo usuario | Usuario |
| decompor-tarefa | Se usuario quer aprofundar uma melhoria especifica | @decompositor-de-tarefas |
| definir-metricas | Se usuario quer criar dashboard de acompanhamento | @analista-de-metricas |

## Error Handling
- Se usuario quer apenas diagnostico (sem implementacao) -> executar fases 1-3 e entregar diagnostico parcial
- Se um agente especializado falha -> documentar gap, prosseguir com agentes restantes e sinalizar
- Se usuario rejeita direcao no checkpoint -> voltar ao ponto de divergencia e ajustar
- Se processo e muito complexo para uma unica analise -> propor decomposicao em sub-processos
- Se falta informacao para alguma fase -> registrar premissas, prosseguir e sinalizar incertezas
- Se nivel de profundidade e "rapida" -> executar apenas fases 1-3 e consolidar diagnostico
- Se nivel de profundidade e "diagnostico" -> executar apenas fases 1-2 e entregar mapa + metricas
