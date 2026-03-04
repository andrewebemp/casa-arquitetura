# Identificar Oportunidades de Automacao

**Task ID:** `PE-T-008`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Identificar Oportunidades de Automacao |
| **status** | pending |
| **responsible_executor** | @cacador-de-automacao |
| **execution_type** | Agent |
| **input** | [processo mapeado ou descricao de atividades repetitivas] |
| **output** | [relatorio de oportunidades de automacao usando template relatorio-automacao-tmpl.md] |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-008 |
| Rationale | Identificacao de automacoes requer conhecimento pratico de RPA, no-code/low-code, APIs e capacidade de calcular ROI tecnico e de negocio |

## Overview
Recebe um processo mapeado (ou descricao de atividades repetitivas) e faz uma varredura sistematica para identificar oportunidades de automacao. Cada oportunidade e classificada por tipo (RPA, integracao, no-code, script, IA), avaliada em viabilidade tecnica, tem ROI calculado e recebe recomendacao de ferramenta especifica. O resultado e um relatorio priorizado com plano de implementacao ordenado por dependencias.

## Input
- **processo_mapeado** (documento): Mapa do processo (output de mapear-processo) ou descricao detalhada das atividades
- **atividades_repetitivas** (lista, opcional): Lista especifica de atividades candidatas a automacao
- **ferramentas_disponiveis** (lista, opcional): Ferramentas ja disponiveis na organizacao (Zapier, Power Automate, n8n, etc.)
- **orcamento** (string, opcional): Orcamento disponivel para ferramentas de automacao
- **restricoes_tecnicas** (string, opcional): Limitacoes tecnicas (sistemas legados, falta de API, seguranca)

## Output
- **relatorio-automacao** (documento): Relatorio completo usando template `templates/relatorio-automacao-tmpl.md`
- **catalogo-oportunidades** (tabela): Cada oportunidade com tipo, viabilidade, ROI e prioridade
- **plano-implementacao** (documento): Ordem de implementacao com dependencias e timeline estimado
- **referencia**: Utiliza `data/catalogo-automacoes.md` como base de padroes de automacao

## Action Items
### Step 1: Varrer o Processo (Identificar Etapas Automatizaveis)
- [ ] Revisar cada etapa do processo buscando caracteristicas de automacao:
  - Atividade repetitiva (executada multiplas vezes com mesma logica)
  - Atividade deterministica (regras claras, sem julgamento subjetivo)
  - Atividade baseada em dados (copia, transformacao, validacao de dados)
  - Atividade de integracao (mover dados entre sistemas)
  - Atividade de notificacao (alertas, lembretes, escalamentos)
- [ ] Listar todas as etapas candidatas com justificativa
- [ ] Registrar volume e frequencia de cada atividade (vezes por dia/semana)
- [ ] Estimar tempo gasto manualmente por execucao
- [ ] Identificar taxa de erro atual (erros por execucao)

### Step 2: Classificar Cada Oportunidade por Tipo
- [ ] Para cada oportunidade identificada, classificar:
  - **RPA (Robotic Process Automation):** Automacao de interface (cliques, formularios, copiar/colar)
  - **Integracao via API:** Conexao direta entre sistemas via API
  - **No-Code/Low-Code:** Fluxos automatizados via plataformas visuais (Zapier, n8n, Make)
  - **Script/Codigo:** Automacao via script personalizado (Python, JS, Shell)
  - **IA/ML:** Automacao que requer classificacao, extracao ou decisao inteligente
  - **Hibrido:** Combinacao de dois ou mais tipos
- [ ] Documentar por que aquele tipo e o mais adequado
- [ ] Identificar se a oportunidade e parcial (assiste humano) ou total (elimina etapa)

### Step 3: Avaliar Viabilidade Tecnica
- [ ] Para cada oportunidade, avaliar:
  - Sistema tem API disponivel? (sim/nao/parcial)
  - Dados estao estruturados? (sim/parcialmente/nao)
  - Ha restricoes de seguranca? (dados sensiveis, compliance)
  - Infraestrutura necessaria existe? (servidores, licencas, acessos)
  - Complexidade de implementacao (baixa/media/alta)
- [ ] Classificar viabilidade: alta (pronto para automatizar), media (requer preparacao), baixa (barreira significativa)
- [ ] Documentar pre-requisitos tecnicos para viabilidade media/baixa

### Step 4: Calcular ROI
- [ ] Para cada oportunidade, calcular:
  - **Tempo economizado** = (tempo manual por execucao) x (frequencia) x (periodo)
  - **Custo manual** = tempo economizado x custo/hora do executor
  - **Reducao de erros** = (taxa de erro atual) x (custo medio por erro)
  - **Custo de automacao** = licenca/ferramenta + implementacao + manutencao
  - **ROI** = (beneficio anual - custo anual) / custo de implementacao
  - **Payback** = custo de implementacao / beneficio mensal
- [ ] Consultar `data/catalogo-automacoes.md` para benchmarks de ROI por tipo
- [ ] Classificar ROI: alto (payback < 3 meses), medio (3-6 meses), baixo (> 6 meses)
- [ ] Incluir beneficios intangiveis (satisfacao, velocidade, compliance)

### Step 5: Priorizar por Esforco x Impacto
- [ ] Plotar cada oportunidade na matriz 2x2:
  - **Quick Win:** Alto impacto + baixo esforco (fazer primeiro)
  - **Projeto estrategico:** Alto impacto + alto esforco (planejar)
  - **Preenchimento:** Baixo impacto + baixo esforco (fazer se sobrar tempo)
  - **Evitar:** Baixo impacto + alto esforco (nao fazer agora)
- [ ] Ordenar oportunidades por prioridade dentro de cada quadrante
- [ ] Identificar dependencias entre automacoes (uma habilita outra)
- [ ] Recomendar sequencia de implementacao baseada em prioridade e dependencias

### Step 6: Recomendar Ferramenta Especifica
- [ ] Para cada oportunidade, recomendar ferramenta concreta:
  - Nome da ferramenta
  - Custo (free/freemium/pago - valor mensal/anual)
  - Curva de aprendizado (rapida/moderada/lenta)
  - Adequacao ao caso (por que esta e a melhor opcao)
- [ ] Considerar ferramentas ja disponiveis na organizacao (priorizar reuso)
- [ ] Apresentar alternativa para cada recomendacao (plano B)
- [ ] Avaliar vendor lock-in e portabilidade

### Step 7: Criar Plano de Implementacao
- [ ] Ordenar implementacoes por prioridade (quick wins primeiro)
- [ ] Definir fases de implementacao:
  - **Fase 1 (0-30 dias):** Quick wins - automacoes simples com ROI rapido
  - **Fase 2 (30-90 dias):** Projetos medios - integrações e fluxos no-code
  - **Fase 3 (90+ dias):** Projetos estrategicos - RPA complexo, IA/ML
- [ ] Mapear dependencias entre automacoes (diagrama)
- [ ] Estimar esforco de implementacao por oportunidade (horas/dias)
- [ ] Definir criterio de sucesso por automacao (metrica de validacao)
- [ ] Planejar monitoramento pos-implementacao

## Acceptance Criteria
- [ ] **AC-1:** Todas as oportunidades classificadas por tipo (RPA, API, no-code, script, IA, hibrido) com justificativa
- [ ] **AC-2:** ROI calculado para cada oportunidade com formula explicita e payback estimado
- [ ] **AC-3:** Ferramenta especifica recomendada para cada oportunidade com custo e alternativa
- [ ] **AC-4:** Priorizacao feita pela matriz esforco x impacto com quadrante atribuido
- [ ] **AC-5:** Plano de implementacao com fases, ordem, dependencias e criterios de sucesso

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| decompor-tarefa | Para quebrar implementacao de cada automacao em micro-tarefas | @decompositor-de-tarefas |
| definir-metricas | Para definir KPIs de monitoramento das automacoes | @analista-de-metricas |
| criar-sop | Para documentar procedimento de operacao das automacoes | @documentador-sop |

## Error Handling
- Se processo nao esta mapeado -> solicitar mapeamento via mapear-processo antes de prosseguir
- Se nao ha informacao de volume/frequencia -> estimar com base em entrevistas e marcar como estimativa
- Se sistema nao tem API -> avaliar alternativas (RPA de interface, export/import, webhooks)
- Se orcamento e zero -> focar em ferramentas gratuitas e scripts personalizados
- Se restricoes de seguranca bloqueiam automacao -> documentar e propor alternativa com aprovacao de TI/seguranca
