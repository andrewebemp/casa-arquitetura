# Checklist: Squad Integration Check

> Usado apos: validacao de config.yaml e integracao geral da squad
> Agente responsavel: @decorai-chief
> Nivel: blocking
> Relacionado: config.yaml, todos os agentes, tasks, workflows e templates da squad

---

## Criterios Obrigatorios (todos devem passar)

- [ ] **Handoffs definidos** - Todos os handoffs entre agentes estao definidos no config.yaml (handoff_map) com agente de origem, agente de destino, dados transferidos e condicao de trigger
- [ ] **Tasks tem agentes** - Toda task na pasta tasks/ tem um agente responsavel definido e o agente referencia a task no seu arquivo de definicao
- [ ] **Workflows tem checkpoints** - Todos os workflows na pasta workflows/ tem checkpoints/quality gates definidos entre fases criticas
- [ ] **Comandos funcionando** - Todos os comandos do @decorai-chief (*stage, *refine, *analyze, *style, *reverse-staging, *pipeline-status) estao mapeados para os agentes e tasks corretos
- [ ] **config.yaml valido** - O arquivo config.yaml esta sintaticamente correto (YAML valido), com todos os campos obrigatorios preenchidos, e referencia agentes que existem na pasta agents/

---

## Criterios de Qualidade (score 0-3 cada)

| Criterio | 0 (Ausente) | 1 (Basico) | 2 (Bom) | 3 (Excelente) |
|----------|-------------|-----------|---------|----------------|
| **Completude dos agentes** | < 50% dos agentes definidos | 50-70% dos agentes com definicao completa | 70-90% dos agentes completos com mind clones e tasks | 100% dos agentes completos com DNA, tasks, templates e checklists |
| **Cobertura de tasks** | < 50% das tasks criadas | Tasks basicas criadas sem detalhamento | Tasks com elicitation points e output definitions | Tasks completas com steps, elicitation, validation e error handling |
| **Qualidade dos handoffs** | Handoffs nao definidos ou circulares | Handoffs definidos mas sem dados de transferencia | Handoffs com dados e condicoes de trigger | Handoffs completos com validacao de pre/pos-condicao e fallback |
| **Quality gates** | Nenhum quality gate definido | QGs basicos sem criterios claros | QGs com criterios, thresholds e scores | QGs completos com checklists, automacao e correcao documentada |
| **Templates** | Nenhum template definido | Templates basicos sem campos detalhados | Templates com campos, tipos e validacao | Templates completos com exemplos, enums e mapeamento para tasks |
| **Workflows** | Nenhum workflow definido | Workflows basicos lineares | Workflows com branching e error handling | Workflows completos com quality gates, rollback e telemetria |
| **Synapse manifest** | Sem manifest .synapse | Manifest com STATE apenas | Manifest com STATE e RECALL keywords | Manifest completo com STATE, RECALL, AGENT_TRIGGER e workflows |
| **Documentacao** | Sem README ou documentacao | README basico com listagem de agentes | README com descricao de agentes e fluxos | README completo com exemplos, diagramas e guia de uso |

---

## Validacao Estrutural

### Arquivos Obrigatorios

- [ ] `config.yaml` - Configuracao central da squad
- [ ] `README.md` - Documentacao da squad
- [ ] `agents/decorai-chief.md` - Orchestrator
- [ ] `agents/staging-architect.md` - Tier 1
- [ ] `agents/interior-strategist.md` - Tier 1
- [ ] `agents/spatial-analyst.md` - Tier 0
- [ ] `agents/conversational-designer.md` - Tier 2
- [ ] `agents/proptech-growth.md` - Tier 2
- [ ] `agents/visual-quality-engineer.md` - Tier 3
- [ ] `agents/pipeline-optimizer.md` - Tools tier

### Diretorios

- [ ] `agents/` - Definicoes de agentes (8 arquivos)
- [ ] `tasks/` - Tasks executaveis
- [ ] `workflows/` - Workflows multi-step
- [ ] `templates/` - Templates de output
- [ ] `checklists/` - Checklists de validacao
- [ ] `data/` - Frameworks de decisao e dados de referencia
- [ ] `.synapse/` - Manifest para Synapse Engine

### Consistencia de Referencia Cruzada

- [ ] Todos os agentes referenciados em config.yaml existem em agents/
- [ ] Todas as tasks referenciadas nos agentes existem (ou estao planejadas) em tasks/
- [ ] Todos os templates referenciados nos agentes existem em templates/
- [ ] Todos os checklists referenciados nos agentes existem em checklists/
- [ ] Todos os workflows referenciados existem (ou estao planejados) em workflows/
- [ ] Quality gates em config.yaml referenciam checklists existentes
- [ ] Handoff map referencia agentes com IDs corretos

---

## Validacao de config.yaml

### Campos Obrigatorios

- [ ] `squad.id` - ID unico da squad (decorai)
- [ ] `squad.name` - Nome da squad
- [ ] `squad.version` - Versao semantica
- [ ] `squad.domain` - Dominio de atuacao
- [ ] `agents[]` - Lista de agentes com id, name, tier, role
- [ ] `orchestrator` - Referencia ao agente orchestrator
- [ ] `quality_gates[]` - Lista de quality gates com id, level, trigger
- [ ] `handoff_map[]` - Mapa de handoffs entre agentes

### Consistencia

- [ ] IDs de agentes sao unicos e seguem convencao (kebab-case)
- [ ] Tiers estao corretos (0: foundation, 1: core, 2: enhancement, 3: quality, tools: infrastructure)
- [ ] Quality gates tem nivel correto (blocking vs non-blocking)
- [ ] Handoff map nao tem ciclos infinitos (A->B->C->A sem exit condition)
- [ ] Tools registry referencia ferramentas reais e acessiveis

---

## Validacao de Integracao com AIOS

- [ ] Squad segue convencoes do Synkra AIOS (estrutura de pastas, naming)
- [ ] Agentes podem ser ativados via @agent-name no AIOS
- [ ] Tasks seguem o padrao AIOS (YAML frontmatter com id, agent, elicit)
- [ ] Workflows seguem o padrao AIOS (phases, steps, gates)
- [ ] Synapse manifest permite descoberta automatica da squad
- [ ] Squad nao conflita com squads existentes (IDs unicos, sem overlap de dominio)

---

## Threshold

- **Minimo para aprovar:** 10/24 no score de qualidade E todos os criterios obrigatorios passando E todos os arquivos obrigatorios presentes
- **Score maximo possivel:** 24/24 (8 criterios x 3 pontos)
- **Condicao de veto:** config.yaml invalido OU agente orchestrator ausente OU handoffs nao definidos OU < 50% dos arquivos obrigatorios presentes

### Classificacao

| Score | Classificacao | Acao |
|-------|--------------|------|
| 21-24 | Excelente | Squad pronta para producao |
| 16-20 | Bom | Squad funcional, melhorias incrementais |
| 10-15 | Aceitavel | Squad operacional com lacunas documentadas |
| 6-9 | Insuficiente | Squad incompleta, planejar sprint de completude |
| 0-5 | Critico | Squad nao operacional, completar arquivos essenciais |

---

## Correcao

If failed:

1. **Se handoffs nao definidos:**
   - Abrir config.yaml e adicionar secao handoff_map
   - Para cada par de agentes que interagem, definir: from, to, data_transferred, trigger_condition
   - Validar que nao ha ciclos infinitos
   - Testar handoff mais critico: @spatial-analyst -> @staging-architect (QG-DA-002)

2. **Se tasks sem agentes:**
   - Listar todas as tasks em tasks/ e verificar agent: field no frontmatter
   - Para cada task sem agente, identificar o agente mais adequado pelo dominio
   - Atualizar o arquivo do agente para referenciar a task
   - Atualizar config.yaml se necessario

3. **Se workflows sem checkpoints:**
   - Para cada workflow, identificar pontos criticos entre fases
   - Adicionar quality gate reference nos pontos identificados
   - Garantir que o quality gate referenciado tem checklist associado
   - Documentar criterios de passa/nao-passa

4. **Se comandos nao funcionando:**
   - Verificar mapeamento no @decorai-chief entre comandos e agentes/tasks
   - Validar que cada comando tem: trigger, target_agent, target_task, expected_output
   - Testar cada comando com input de exemplo
   - Documentar comandos que dependem de tasks ainda nao criadas

5. **Se config.yaml invalido:**
   - Validar YAML syntax (pode usar yamllint ou parser online)
   - Verificar campos obrigatorios conforme lista acima
   - Corrigir referencias a agentes/tasks inexistentes
   - Garantir que version segue semantic versioning

6. **Escalacao:**
   - Se > 3 criterios obrigatorios falharam: acionar @decorai-chief para revisao completa
   - Se problemas de integracao AIOS: consultar @aios-master para alinhamento de padroes
   - Se conflito com outra squad: usar Conselho Deliberativo para resolucao

---

*Checklist v1.0.0 | Squad Integration | DecorAI Squad*
