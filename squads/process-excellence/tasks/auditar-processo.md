# Auditar Processo

**Task ID:** `PE-T-004`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Auditar Processo |
| **status** | pending |
| **responsible_executor** | @auditor-de-processos |
| **execution_type** | Agent |
| **input** | [processo a auditar, SOP/documentacao existente] |
| **output** | [relatorio de auditoria completo] |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-004 |
| Rationale | Auditoria requer rigor analitico, imparcialidade e dominio de frameworks de conformidade |

## Overview
Realiza auditoria completa de um processo, comparando a execucao real com a documentacao existente (SOP, politicas, normas). Produz relatorio com score de aderencia, desvios classificados por severidade, avaliacao de riscos e plano de acao corretiva.

## Input
- **processo** (string): Nome e descricao do processo a ser auditado
- **documentacao** (documento, opcional): SOP, politica, norma ou padrao de referencia
- **escopo_auditoria** (string, opcional): Foco especifico da auditoria (conformidade, eficiencia, risco)

## Output
- **relatorio-auditoria** (documento): Relatorio completo usando template `templates/relatorio-auditoria-tmpl.md`
- **score-aderencia** (numero): Percentual de conformidade do processo (0-100%)
- **plano-acao** (lista): Acoes corretivas priorizadas com responsaveis e prazos

## Action Items
### Step 1: Planejar Auditoria
- [ ] Definir objetivo e escopo da auditoria
- [ ] Identificar criterios de referencia (SOP, norma, politica)
- [ ] Listar areas e etapas a serem auditadas
- [ ] Definir metodologia de coleta de evidencias
- [ ] Estabelecer escala de classificacao de desvios

### Step 2: Coletar Evidencias
- [ ] Revisar documentacao existente (SOPs, manuais, registros)
- [ ] Analisar dados de execucao (logs, metricas, historico)
- [ ] Entrevistar executores e stakeholders
- [ ] Observar execucao real do processo (quando possivel)
- [ ] Registrar todas as evidencias de forma estruturada

### Step 3: Analisar Aderencia
- [ ] Comparar cada etapa documentada com a execucao real
- [ ] Identificar onde a pratica diverge do padrao
- [ ] Verificar se controles estao funcionando
- [ ] Avaliar completude da documentacao
- [ ] Calcular score de aderencia por etapa e geral

### Step 4: Classificar Desvios por Severidade
Para cada desvio encontrado:
- [ ] **Critico:** Risco imediato, pode causar dano significativo
- [ ] **Maior:** Nao-conformidade significativa, requer acao urgente
- [ ] **Menor:** Desvio pontual, baixo impacto, correcao simples
- [ ] **Observacao:** Oportunidade de melhoria, sem desvio formal

### Step 5: Avaliar Riscos
- [ ] Para cada desvio, avaliar probabilidade de ocorrencia
- [ ] Avaliar impacto potencial (financeiro, operacional, reputacional)
- [ ] Calcular nivel de risco (probabilidade x impacto)
- [ ] Identificar riscos sistemicos vs. pontuais
- [ ] Priorizar riscos por criticidade

### Step 6: Gerar Recomendacoes
- [ ] Propor acao corretiva para cada desvio
- [ ] Propor acoes preventivas para riscos identificados
- [ ] Sugerir melhorias na documentacao
- [ ] Recomendar treinamentos quando aplicavel
- [ ] Priorizar recomendacoes por urgencia e impacto

### Step 7: Criar Plano de Acao Corretiva
- [ ] Listar todas as acoes necessarias
- [ ] Definir responsavel por cada acao
- [ ] Estabelecer prazo para cada acao
- [ ] Definir criterio de verificacao de eficacia
- [ ] Agendar auditoria de follow-up (se aplicavel)

## Acceptance Criteria
- [ ] **AC-1:** Score de aderencia calculado com metodologia clara
- [ ] **AC-2:** Todos os desvios classificados por severidade com evidencia
- [ ] **AC-3:** Riscos avaliados com matriz probabilidade x impacto
- [ ] **AC-4:** Recomendacoes priorizadas por urgencia e impacto
- [ ] **AC-5:** Plano de acao corretiva com responsaveis e prazos definidos

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| otimizar-processo | Gaps significativos requerem redesenho do processo | @otimizador-de-processos |
| planejar-mudanca | Mudancas estruturais necessarias para correcao | @gestor-de-mudanca |

## Error Handling
- Se nao existe documentacao de referencia -> auditar contra boas praticas e sinalizar ausencia de padrao
- Se executores nao colaboram -> registrar como limitacao e basear em evidencias documentais
- Se processo e informal (nao documentado) -> recomendar mapeamento antes de auditoria formal
