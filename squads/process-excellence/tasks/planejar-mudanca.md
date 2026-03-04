# Planejar Gestao de Mudanca

**Task ID:** `PE-T-007`
**Pattern:** HO-TP-001
**Version:** 1.0.0

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Planejar Gestao de Mudanca |
| **status** | pending |
| **responsible_executor** | @gestor-de-mudanca |
| **execution_type** | Agent |
| **input** | [mudanca proposta, stakeholders, contexto organizacional] |
| **output** | [plano de gestao de mudanca usando template plano-mudanca-tmpl.md] |
| **action_items** | 7 steps |
| **acceptance_criteria** | 5 criteria |

## Executor Specification
| Attribute | Value |
|-----------|-------|
| Type | Agent |
| Pattern | PE-EP-007 |
| Rationale | Gestao de mudanca requer dominio dos frameworks de Kotter (8 passos) e ADKAR, alem de sensibilidade para resistencia humana e dinamica organizacional |

## Overview
Recebe uma mudanca proposta (novo processo, ferramenta, reorganizacao ou melhoria) e constroi um plano completo de gestao de mudanca. O plano cobre analise de stakeholders, comunicacao segmentada por publico, treinamento, estrategia de rollout e mecanismos de reforco pos-mudanca. O objetivo e maximizar adocao e minimizar resistencia, tratando o lado humano da mudanca com o mesmo rigor do lado tecnico.

## Input
- **mudanca_proposta** (string): Descricao clara da mudanca a ser implementada (o que muda, por que, quando)
- **stakeholders** (lista): Pessoas, areas ou papeis impactados pela mudanca
- **contexto_organizacional** (string): Cultura, historico de mudancas anteriores, restricoes politicas
- **urgencia** (string, opcional): Nivel de urgencia da mudanca (alta, media, baixa)
- **patrocinador** (string, opcional): Quem patrocina e tem autoridade para viabilizar a mudanca

## Output
- **plano-mudanca** (documento): Plano completo usando template `templates/plano-mudanca-tmpl.md`
- **mapa-stakeholders** (tabela): Stakeholders mapeados com impacto, influencia e resistencia esperada
- **plano-comunicacao** (documento): Cronograma de comunicacao segmentado por publico
- **plano-treinamento** (documento): Programa de capacitacao para cada grupo impactado
- **metricas-adocao** (lista): Indicadores para medir sucesso da mudanca

## Action Items
### Step 1: Definir a Mudanca e Justificativa
- [ ] Articular claramente O QUE muda (estado atual vs. estado futuro)
- [ ] Documentar POR QUE a mudanca e necessaria (dor, oportunidade, obrigacao)
- [ ] Definir ESCOPO da mudanca (o que esta incluido e excluido)
- [ ] Identificar o patrocinador executivo (sponsor)
- [ ] Avaliar urgencia e criar senso de urgencia (Kotter - Passo 1)
- [ ] Construir coalilzao orientadora (Kotter - Passo 2)

### Step 2: Analisar Stakeholders (Impacto e Resistencia)
- [ ] Listar todos os stakeholders impactados (direta e indiretamente)
- [ ] Para cada stakeholder, avaliar:
  - Nivel de impacto (alto/medio/baixo)
  - Nivel de influencia (alto/medio/baixo)
  - Disposicao atual (promotor/neutro/resistente)
  - Tipo de resistencia esperada (medo, perda de poder, conforto, desconfianca)
- [ ] Criar matriz de stakeholders (impacto x influencia)
- [ ] Identificar aliados-chave e resistentes criticos
- [ ] Definir estrategia especifica para cada quadrante da matriz
- [ ] Aplicar modelo ADKAR individual para stakeholders criticos:
  - **A**wareness (consciencia da necessidade)
  - **D**esire (desejo de participar)
  - **K**nowledge (conhecimento de como mudar)
  - **A**bility (habilidade de implementar)
  - **R**einforcement (reforco para sustentar)

### Step 3: Criar Plano de Comunicacao
- [ ] Definir mensagem-chave (por que mudar, o que muda, o que nao muda)
- [ ] Segmentar comunicacao por publico:
  - Lideranca (visao estrategica, ROI, timeline)
  - Gestores intermediarios (impacto no time, como apoiar)
  - Equipe operacional (o que muda no dia-a-dia, suporte disponivel)
  - Areas indiretamente impactadas (o que saber, o que esperar)
- [ ] Definir canais por publico (reuniao, email, documento, video)
- [ ] Criar cronograma de comunicacao (pre-mudanca, durante, pos-mudanca)
- [ ] Planejar mecanismo de feedback bidirecional (como ouvir preocupacoes)
- [ ] Preparar FAQ com respostas para objecoes previsiveis

### Step 4: Criar Plano de Treinamento
- [ ] Identificar gaps de conhecimento por grupo de stakeholders
- [ ] Definir formato de treinamento por grupo:
  - Treinamento presencial/sincrono (para mudancas complexas)
  - Treinamento assincrono (videos, documentos, tutoriais)
  - Job aids (guias rapidos, checklists para consulta no dia-a-dia)
  - Mentoria par-a-par (early adopters ajudando colegas)
- [ ] Definir cronograma de treinamento (antes do go-live)
- [ ] Identificar instrutores ou facilitadores
- [ ] Planejar material de suporte pos-treinamento
- [ ] Definir criterio de "prontidao" (quando o grupo esta apto)

### Step 5: Definir Estrategia de Rollout
- [ ] Escolher modelo de rollout:
  - **Big bang:** Todos ao mesmo tempo (rapido, maior risco)
  - **Faseado:** Grupo por grupo (menor risco, mais lento)
  - **Piloto:** Grupo pequeno primeiro, depois expandir (menor risco)
- [ ] Justificar a escolha com base no risco e urgencia
- [ ] Definir criterios de sucesso para cada fase
- [ ] Criar criterios de go/no-go para avancar entre fases
- [ ] Planejar rollback (como reverter se necessario)
- [ ] Definir suporte extra durante periodo de transicao (war room, helpdesk)

### Step 6: Planejar Reforco Pos-Mudanca
- [ ] Definir acoes de reforco nos primeiros 30/60/90 dias:
  - Celebrar quick wins publicamente
  - Reconhecer early adopters
  - Coletar feedback e ajustar
  - Reforcar treinamento onde necessario
- [ ] Planejar check-ins periodicos com stakeholders-chave
- [ ] Definir mecanismo para detectar regressao (volta ao comportamento antigo)
- [ ] Criar plano de sustentacao de longo prazo
- [ ] Incorporar mudanca em processos formais (SOPs, onboarding)

### Step 7: Definir Metricas de Adocao
- [ ] Definir indicadores de adocao (utilizacao, conformidade, satisfacao)
- [ ] Estabelecer baseline pre-mudanca
- [ ] Definir metas de adocao por fase (30/60/90 dias):
  - 30 dias: Conscientizacao e inicio de uso
  - 60 dias: Uso consistente pela maioria
  - 90 dias: Novo comportamento como padrao
- [ ] Definir como e quando medir cada indicador
- [ ] Criar mecanismo de alerta para baixa adocao

## Acceptance Criteria
- [ ] **AC-1:** Stakeholders mapeados com nivel de impacto, influencia e resistencia esperada para cada um
- [ ] **AC-2:** Plano de comunicacao segmentado por publico com cronograma, canais e mensagens especificas
- [ ] **AC-3:** Plano de treinamento definido com formato, cronograma e criterio de prontidao por grupo
- [ ] **AC-4:** Estrategia de rollout definida com criterios de go/no-go e plano de rollback
- [ ] **AC-5:** Metricas de adocao definidas com baseline, metas por fase e mecanismo de medicao

## Handoff
| Next Task | Trigger | Executor |
|-----------|---------|----------|
| definir-metricas | Para criar dashboard de metricas de adocao | @analista-de-metricas |
| criar-sop | Para documentar o novo processo pos-mudanca | @documentador-sop |
| decompor-tarefa | Para quebrar o plano de mudanca em micro-tarefas executaveis | @decompositor-de-tarefas |

## Error Handling
- Se patrocinador nao esta claro -> escalar ao usuario; sem sponsor, mudanca tende a falhar
- Se resistencia e maior que o esperado -> revisar estrategia de comunicacao e envolver aliados-chave
- Se historico de mudancas falhas e forte -> investir mais tempo em quick wins e construcao de confianca
- Se nao ha tempo para treinamento adequado -> priorizar job aids e mentoria par-a-par como alternativa
- Se rollout faseado nao e possivel -> documentar riscos adicionais do big bang e planejar suporte reforçado
