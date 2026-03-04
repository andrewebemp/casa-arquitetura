# Definir Metricas e KPIs

**Task ID:** `PE-T-006`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Definir Metricas e KPIs |
| **status** | pending |
| **responsible_executor** | @analista-de-metricas |
| **execution_type** | Agent |
| **input** | [processo ou area a medir, objetivos de negocio] |
| **output** | [definicao de KPIs com baseline, metas e dashboard proposto] |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-006 |
| Rationale | Definicao de metricas requer dominio de Balanced Scorecard, framework SMART e capacidade analitica para conectar indicadores a objetivos estrategicos |

## Overview
Recebe um processo, area funcional ou iniciativa e define o conjunto de KPIs necessarios para medir desempenho, saude e evolucao. Para cada KPI, estabelece formula de calculo, fonte de dados, baseline atual, metas progressivas (baseline, target, stretch) e propoe um dashboard para visualizacao. Tambem define os rituais de acompanhamento (frequencia de revisao, responsaveis, acoes de desvio).

## Input
- **processo_ou_area** (string): Nome do processo, area ou iniciativa a ser medida
- **objetivos_negocio** (lista): Objetivos estrategicos ou operacionais que os KPIs devem refletir
- **contexto** (string, opcional): Informacoes sobre ferramentas disponiveis, maturidade analitica, restricoes
- **kpis_existentes** (lista, opcional): KPIs ja utilizados (para avaliar relevancia e gaps)

## Output
- **catalogo-kpis** (documento): Lista completa de KPIs com formula, fonte, baseline e meta
- **dashboard-proposto** (documento): Layout e especificacao do dashboard de acompanhamento
- **plano-rituais** (documento): Cadencia de revisao, responsaveis e protocolo de desvio
- **referencia**: Utiliza `data/kpis-referencia.md` como catalogo de indicadores padrao

## Action Items
### Step 1: Entender Objetivos do Processo
- [ ] Confirmar o escopo da medicao (processo, area ou iniciativa)
- [ ] Identificar os objetivos estrategicos e operacionais envolvidos
- [ ] Mapear as perguntas-chave que os KPIs devem responder
- [ ] Entender o publico dos indicadores (quem vai consumir os dados)
- [ ] Verificar maturidade analitica atual (ferramentas, cultura de dados)

### Step 2: Selecionar KPIs Relevantes
- [ ] Consultar catalogo de referencia (`data/kpis-referencia.md`)
- [ ] Selecionar indicadores alinhados aos objetivos identificados
- [ ] Garantir cobertura das 4 perspectivas do Balanced Scorecard:
  - Financeira (custo, receita, ROI)
  - Cliente (satisfacao, NPS, tempo de resposta)
  - Processos internos (eficiencia, qualidade, throughput)
  - Aprendizado e crescimento (capacitacao, inovacao, melhoria)
- [ ] Limitar a 5-8 KPIs por area (evitar excesso de indicadores)
- [ ] Validar que cada KPI e acionavel (gera decisao ou acao)

### Step 3: Definir Formulas e Fontes de Dados
- [ ] Para cada KPI, documentar a formula de calculo exata
- [ ] Identificar a fonte de dados primaria (sistema, planilha, API)
- [ ] Verificar se a fonte de dados e confiavel e acessivel
- [ ] Definir unidade de medida (%, R$, horas, quantidade)
- [ ] Definir frequencia de coleta (real-time, diaria, semanal, mensal)
- [ ] Documentar premissas e exclusoes no calculo

### Step 4: Medir Baseline Atual
- [ ] Coletar dados historicos disponiveis (minimo 3 periodos)
- [ ] Calcular o valor atual (baseline) de cada KPI
- [ ] Identificar tendencia (melhorando, piorando, estavel)
- [ ] Registrar variabilidade (desvio padrao, min/max)
- [ ] Documentar limitacoes dos dados historicos

### Step 5: Definir Metas (Baseline, Target, Stretch)
- [ ] Para cada KPI, definir 3 niveis de meta:
  - **Baseline:** Valor atual (ponto de partida)
  - **Target:** Meta realista para o proximo ciclo (melhoria factivel)
  - **Stretch:** Meta ambiciosa (melhoria significativa)
- [ ] Justificar cada meta com base em benchmarks, historico ou objetivos
- [ ] Definir horizonte temporal para atingimento (30/60/90 dias ou trimestral)
- [ ] Validar que metas seguem o framework SMART:
  - Specific (especifica)
  - Measurable (mensuravel)
  - Achievable (alcancavel)
  - Relevant (relevante)
  - Time-bound (com prazo)

### Step 6: Propor Dashboard
- [ ] Definir layout do dashboard (hierarquia visual dos KPIs)
- [ ] Escolher tipo de visualizacao por KPI (gauge, linha, barra, numero)
- [ ] Definir semaforo de cores (verde/amarelo/vermelho) com thresholds
- [ ] Incluir comparativos (periodo anterior, meta, tendencia)
- [ ] Propor ferramenta de dashboard (planilha, Notion, Metabase, etc.)
- [ ] Documentar requisitos de atualizacao (manual vs. automatico)

### Step 7: Definir Rituais de Acompanhamento
- [ ] Definir frequencia de revisao (diaria, semanal, mensal)
- [ ] Atribuir responsavel por cada KPI (dono do indicador)
- [ ] Criar protocolo de desvio (o que fazer quando KPI sai da meta)
- [ ] Definir escalamento (quando e para quem escalar desvios criticos)
- [ ] Estabelecer cadencia de revisao estrategica dos proprios KPIs

## Acceptance Criteria
- [ ] **AC-1:** Todos os KPIs seguem o framework SMART (especifico, mensuravel, alcancavel, relevante, com prazo)
- [ ] **AC-2:** Baseline medido e documentado para cada KPI com dados historicos
- [ ] **AC-3:** Metas definidas em 3 niveis (baseline, target, stretch) com justificativa
- [ ] **AC-4:** Dashboard proposto com visualizacao, semaforo e ferramenta recomendada
- [ ] **AC-5:** Responsaveis atribuidos para cada KPI com ritual de acompanhamento definido

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| auditar-processo | Para monitorar aderencia aos KPIs definidos | @auditor-de-processos |
| criar-sop | Para documentar procedimento de coleta e revisao dos KPIs | @documentador-sop |

## Error Handling
- Se nao ha dados historicos para baseline -> usar estimativa qualitativa, marcar como "baseline estimado" e planejar coleta real
- Se objetivos de negocio sao vagos -> elicitar com perguntas direcionadas antes de selecionar KPIs
- Se fonte de dados nao e confiavel -> documentar risco e propor plano de melhoria de dados
- Se quantidade de KPIs excede 8 -> priorizar e mover excedentes para "indicadores complementares"
- Se stakeholder pede KPI de vaidade (nao acionavel) -> explicar diferenca e sugerir alternativa acionavel
