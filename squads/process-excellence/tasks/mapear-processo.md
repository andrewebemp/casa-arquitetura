# Mapear Processo (AS-IS)

**Task ID:** `PE-T-002`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Mapear Processo (AS-IS) |
| **status** | pending |
| **responsible_executor** | @otimizador-de-processos |
| **execution_type** | Agent |
| **input** | [nome do processo, descricao, stakeholders] |
| **output** | [mapa AS-IS completo do processo] |
| **action_items** | 6 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-002 |
| Rationale | Mapeamento requer visao sistemica e dominio de notacao BPMN/fluxograma |

## Overview
Recebe um processo (formal ou informal) e produz o mapa AS-IS completo: fluxo etapa a etapa, atores envolvidos, sistemas utilizados, tempos medios, volumes e pontos de dor. O resultado e a base para qualquer otimizacao ou auditoria posterior.

## Input
- **nome_processo** (string): Nome do processo a ser mapeado
- **descricao** (string): Descricao geral do processo, incluindo gatilho inicial e resultado final
- **stakeholders** (lista): Pessoas/areas envolvidas no processo

## Output
- **mapa-as-is** (documento): Mapa completo do processo usando template `templates/mapa-processo-tmpl.md`
- **lista-atores** (lista): Todos os atores e seus papeis no processo
- **metricas-base** (tabela): Tempos, volumes e frequencias atuais

## Action Items
### Step 1: Identificar Processo e Escopo
- [ ] Confirmar o nome e objetivo do processo
- [ ] Definir evento de inicio (trigger) e evento de fim
- [ ] Delimitar fronteiras (o que esta dentro e fora do escopo)
- [ ] Identificar versoes/variacoes do processo (se houver)

### Step 2: Listar Atores e Sistemas
- [ ] Mapear todos os atores (pessoas, areas, papeis)
- [ ] Listar sistemas e ferramentas utilizados em cada etapa
- [ ] Identificar integracao entre sistemas (manual ou automatica)
- [ ] Registrar responsabilidades de cada ator

### Step 3: Mapear Fluxo Etapa por Etapa
- [ ] Documentar cada etapa do processo na ordem de execucao
- [ ] Para cada etapa: entrada, acao, saida, responsavel
- [ ] Registrar decisoes/bifurcacoes (gateways)
- [ ] Documentar excecoes e caminhos alternativos
- [ ] Incluir loops e retrabalhos existentes

### Step 4: Registrar Tempos e Volumes
- [ ] Tempo medio de execucao por etapa
- [ ] Tempo de espera entre etapas
- [ ] Volume medio (quantidade de execucoes por periodo)
- [ ] Frequencia do processo (diario, semanal, sob demanda)

### Step 5: Identificar Handoffs e Pontos de Dor
- [ ] Marcar cada transicao entre atores/areas (handoffs)
- [ ] Identificar onde ocorrem atrasos frequentes
- [ ] Registrar reclamacoes e frustracao dos envolvidos
- [ ] Listar erros recorrentes e retrabalho
- [ ] Anotar onde falta informacao ou documentacao

### Step 6: Documentar e Validar
- [ ] Consolidar tudo no template de mapa de processo
- [ ] Criar diagrama visual do fluxo
- [ ] Revisar com pelo menos um stakeholder
- [ ] Ajustar com base no feedback recebido
- [ ] Registrar premissas e limitacoes do mapeamento

## Acceptance Criteria
- [ ] **AC-1:** Fluxo completo mapeado do inicio ao fim (incluindo excecoes)
- [ ] **AC-2:** Tempos medios registrados por etapa
- [ ] **AC-3:** Pontos de dor identificados e documentados
- [ ] **AC-4:** Todos os atores e sistemas listados com responsabilidades
- [ ] **AC-5:** Diagrama visual do fluxo criado

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| otimizar-processo | Processo mapeado, pronto para melhoria | @otimizador-de-processos |
| auditar-processo | Processo mapeado, precisa verificar conformidade | @auditor-de-processos |

## Error Handling
- Se processo nao tem dono claro -> registrar como ponto de dor e prosseguir
- Se stakeholders discordam do fluxo -> documentar ambas versoes e sinalizar
- Se nao ha dados de tempo/volume -> estimar com base em entrevistas e marcar como estimativa
