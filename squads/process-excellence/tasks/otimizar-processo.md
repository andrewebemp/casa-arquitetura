# Otimizar Processo (TO-BE)

**Task ID:** `PE-T-003`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Otimizar Processo (TO-BE) |
| **status** | pending |
| **responsible_executor** | @otimizador-de-processos |
| **execution_type** | Agent |
| **input** | [mapa AS-IS do processo] |
| **output** | [proposta TO-BE, lista de melhorias, impacto esperado] |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-002 |
| Rationale | Otimizacao requer dominio de Lean, TOC e analise de valor agregado |

## Overview
Recebe o mapa AS-IS de um processo e aplica frameworks de melhoria continua (Lean/TIMWOODS, TOC, analise de valor) para produzir uma proposta de processo TO-BE. Inclui identificacao de desperdicios, gargalos, melhorias priorizadas e impacto quantificado.

## Input
- **mapa_as_is** (documento): Mapa AS-IS completo (output de mapear-processo ou descricao equivalente)
- **objetivos** (string, opcional): Objetivos especificos da otimizacao (reduzir tempo, custo, erros)
- **restricoes** (string, opcional): Limitacoes para a otimizacao (orcamento, tecnologia, pessoas)

## Output
- **proposta-to-be** (documento): Processo redesenhado com justificativa por mudanca
- **lista-melhorias** (lista): Melhorias priorizadas por impacto e esforco
- **analise-impacto** (tabela): Comparativo AS-IS vs TO-BE com metricas

## Action Items
### Step 1: Analisar Mapa AS-IS
- [ ] Revisar o fluxo completo do processo atual
- [ ] Entender metricas atuais (tempo, custo, volume, erros)
- [ ] Identificar os objetivos da otimizacao
- [ ] Confirmar restricoes e premissas

### Step 2: Identificar Desperdicios (TIMWOODS)
Analisar cada etapa buscando os 8 desperdicios:
- [ ] **T**ransporte: movimentacao desnecessaria de informacao/material
- [ ] **I**nventario: acumulo de trabalho em progresso (filas)
- [ ] **M**ovimentacao: passos desnecessarios do executor
- [ ] **W**aiting: tempo de espera entre etapas
- [ ] **O**verproduction: produzir mais do que o necessario
- [ ] **O**verprocessing: processar alem do necessario
- [ ] **D**efects: erros que geram retrabalho
- [ ] **S**kills: subutilizacao de competencias

### Step 3: Encontrar Gargalo (TOC)
- [ ] Identificar a etapa com maior tempo de ciclo
- [ ] Verificar onde trabalho se acumula (filas)
- [ ] Aplicar os 5 passos de focalizacao da TOC
- [ ] Determinar capacidade real vs. demanda

### Step 4: Analisar Valor Agregado
- [ ] Classificar cada etapa: agrega valor / necessaria / desperdicio
- [ ] Calcular percentual de tempo em atividades que agregam valor
- [ ] Identificar etapas candidatas a eliminacao ou automacao

### Step 5: Desenhar Processo TO-BE
- [ ] Eliminar etapas que nao agregam valor
- [ ] Simplificar etapas complexas
- [ ] Paralelizar atividades independentes
- [ ] Automatizar tarefas repetitivas
- [ ] Reduzir handoffs entre atores
- [ ] Documentar o novo fluxo completo

### Step 6: Calcular Impacto Esperado
- [ ] Estimar novo tempo de ciclo por etapa
- [ ] Calcular reducao percentual de tempo total
- [ ] Estimar reducao de erros/retrabalho
- [ ] Projetar economia de custo (se aplicavel)
- [ ] Criar tabela comparativa AS-IS vs TO-BE

### Step 7: Priorizar Melhorias
- [ ] Listar todas as melhorias propostas
- [ ] Classificar por impacto (alto/medio/baixo)
- [ ] Classificar por esforco de implementacao (alto/medio/baixo)
- [ ] Ordenar pela matriz impacto x esforco
- [ ] Recomendar quick wins e projetos maiores

## Acceptance Criteria
- [ ] **AC-1:** Desperdicios identificados com evidencia concreta do AS-IS
- [ ] **AC-2:** Gargalo principal identificado com dados de suporte
- [ ] **AC-3:** Processo TO-BE desenhado com justificativa por mudanca
- [ ] **AC-4:** Impacto quantificado (tempo, custo ou erros)
- [ ] **AC-5:** Melhorias priorizadas pela matriz impacto x esforco

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| decompor-tarefa | Quebrar implementacao das melhorias em micro-tarefas | @decompositor-de-tarefas |
| criar-sop | Documentar novo processo como SOP | @documentador-sop |

## Error Handling
- Se mapa AS-IS esta incompleto -> solicitar complemento via mapear-processo
- Se nao ha metricas quantitativas -> usar estimativas qualitativas e sinalizar
- Se restricoes impedem melhorias criticas -> documentar e escalar ao usuario
