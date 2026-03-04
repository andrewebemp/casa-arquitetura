# Decompor Tarefa em Micro-Tarefas

**Task ID:** `PE-T-001`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Decompor Tarefa em Micro-Tarefas |
| **status** | pending |
| **responsible_executor** | @decompositor-de-tarefas |
| **execution_type** | Agent |
| **input** | [descricao da tarefa, contexto, publico-alvo] |
| **output** | [lista de micro-tarefas detalhadas] |
| **action_items** | 6 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-001 |
| Rationale | Decomposicao requer analise estrutural e conhecimento de WBS/GTD |

## Overview
Recebe qualquer tarefa (negocio, dev, pessoal) e a decompoe em micro-tarefas executaveis por alguem que nunca fez antes. Cada micro-tarefa inclui passo-a-passo detalhado, ferramentas, tempo estimado e criterios de conclusao.

## Input
- **tarefa** (string): Descricao da tarefa a ser decomposta
- **contexto** (string): Informacoes sobre o ambiente, recursos disponiveis, restricoes
- **publico_alvo** (string): Quem vai executar (experiencia, conhecimento previo)

## Output
- **micro-tarefas** (lista): Lista ordenada de micro-tarefas usando template `templates/micro-tarefa-tmpl.md`
- **diagrama-dependencias** (texto): Mapa de dependencias entre micro-tarefas
- **resumo** (texto): Visao geral com contagem de micro-tarefas, tempo total estimado

## Action Items
### Step 1: Elicitar Contexto
Coletar informacoes sobre a tarefa:
- [ ] O que precisa ser feito (resultado esperado)?
- [ ] Quem vai executar (experiencia)?
- [ ] Que recursos/ferramentas estao disponiveis?
- [ ] Ha restricoes de tempo ou orcamento?
- [ ] Ja existe um processo similar?

### Step 2: Identificar Escopo
- [ ] Definir os limites da tarefa (o que esta incluido e excluido)
- [ ] Identificar entregas principais
- [ ] Listar premissas

### Step 3: Decompor via WBS
- [ ] Quebrar a tarefa em blocos principais (nivel 1)
- [ ] Quebrar cada bloco em sub-tarefas (nivel 2)
- [ ] Quebrar sub-tarefas em micro-tarefas atomicas (nivel 3)
- [ ] Garantir que cada micro-tarefa e uma "next action" clara (GTD)

### Step 4: Detalhar Cada Micro-Tarefa
Para cada micro-tarefa, preencher o template:
- [ ] Passo-a-passo detalhado (para iniciante)
- [ ] Ferramentas/recursos necessarios
- [ ] Tempo estimado
- [ ] Criterio de conclusao
- [ ] Possiveis problemas e solucoes

### Step 5: Mapear Dependencias
- [ ] Identificar sequencia obrigatoria vs. paralelizavel
- [ ] Criar diagrama de dependencias
- [ ] Identificar caminho critico

### Step 6: Validar e Entregar
- [ ] Revisar se cada micro-tarefa e autocontida
- [ ] Verificar se um iniciante conseguiria executar
- [ ] Calcular tempo total estimado
- [ ] Apresentar ao usuario para validacao

## Acceptance Criteria
- [ ] **AC-1:** Toda micro-tarefa tem passo-a-passo detalhado para iniciante
- [ ] **AC-2:** Toda micro-tarefa tem criterio de conclusao claro
- [ ] **AC-3:** Dependencias estao mapeadas
- [ ] **AC-4:** Tempo total estimado esta calculado
- [ ] **AC-5:** Nenhuma micro-tarefa requer conhecimento implicito

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| criar-sop | Se precisa documentar como SOP | @documentador-sop |
| planejar-mudanca | Se envolve mudanca de processo | @gestor-de-mudanca |

## Error Handling
- Se tarefa e muito vaga -> pedir mais contexto ao usuario
- Se tarefa e muito grande -> sugerir divisao em fases
- Se falta informacao sobre publico -> assumir iniciante e avisar
