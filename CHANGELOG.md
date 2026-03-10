# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.7.0] - 2026-03-08

### Adicionado
- **Synapse Session Engine** — pipeline de injecao de contexto com 8 layers (L0-L2+L5 ativos). 35 arquivos core, manifests de dominio, squad discovery automatico via L5
- **7 hooks de governanca** — mind-clone-governance, enforce-architecture-first, enforce-git-push-authority, read-protection, write-path-validation, sql-governance, slug-validation
- **Precompact session digest** — hook PreCompact para captura de conhecimento antes de compactacao de contexto
- **Graph Dashboard** (`aios-graph` CLI) — visualizacao de progresso em ASCII tree, JSON, DOT, Mermaid e HTML. Entry point em `bin/aios-graph.js`
- **Code Intel** — enrichment de contexto de codigo baseado em entity registry. 14 arquivos com providers, helpers e hook-runtime
- **IDS Enhancement** — gates G1-G4 (epic-creation, story-creation, story-validation, dev-context), FrameworkGovernor, circuit-breaker, layer-classifier, registry-healer
- **Entity Registry generator** — script `generate-entity-registry.js` que cataloga 305 entidades automaticamente
- **Squad claude-code-mastery** — 8 agentes especializados em Claude Code (hooks-architect, mcp-integrator, swarm-orchestrator, config-engineer, skill-craftsman, project-integrator, roadmap-sentinel)
- **GotchasMemory state files** — `.aios/gotchas.json` e `.aios/gotchas.md` para captura automatica de padroes de erro
- **Release Automation** — `scripts/release.sh` para release completo, validacao de docs obrigatorios em `version-bump.js`

### Aprimorado
- **IDS <-> Conselho** — gate advisory para decisoes CREATE de alto impacto (>30%), `run_ids_conselho_gate()` em common.sh
- **BOB <-> Conselho/PE** — merge gate advisory antes de merge, decomposicao PE na fase plan
- **Squad Creator Premium** — enforcement via mind-clone-governance hook
- **Todos os squads** descobriveis via Synapse L5 (manifest + rules)
- **claude-code-mastery** registrado no Conselho cross-squad e em PREEXISTING_SQUADS
- **Gotchas Memory** integrada no template `{{LEARNINGS}}` do autonomous runner

## [1.6.0] - 2026-03-04

### Adicionado
- **Integração Squad Conselho Deliberativo no Autonomous Runner** — decision gates automáticos em fases críticas via flag `--conselho-gates`
- **Integração Squad Process Excellence no Autonomous Runner** — hooks de decomposição, otimização e auditoria via flag `--process-excellence`
- **8 slash commands do Process Excellence** — registrados em `.claude/commands/process-excellence/agents/` (orquestrador, decompositor, otimizador, auditor, documentador, analista, gestor, caçador)
- Função `run_conselho_gate()` em `common.sh` — invoca Conselho com modos full/quick/audit, extrai confiança e gate automático (>=60% = aprovado)
- Função `run_process_excellence()` em `common.sh` — invoca agentes PE por nome com verificação de sinais PE_COMPLETE/PE_FAILED
- Squad Consultation Points em 6 phase prompts (fases 2, 5, 7, 8-dev, 8-story, 9) — orientações de quando e como consultar cada squad
- Phase hooks em 4 executors (phase-2, phase-5, phase-7, phase-8-dev-cycle) — invocação automática opt-in dos squads

### Atualizado
- `autonomous-runner.sh`: flags `--conselho-gates` e `--process-excellence` com export de variáveis de ambiente
- `common.sh`: variáveis CONSELHO_GATES, PROCESS_EXCELLENCE, paths de squad, e seções de integração
- `phase-2-prd.sh`: Conselho FULL gate para escopo + PE Decompositor para épicos
- `phase-5-architecture.sh`: Conselho FULL gate para decisões arquiteturais + PE Otimizador para fluxo de dados
- `phase-7-validation.sh`: Conselho AUDIT para fases 2-6 + PE Auditor (aderência) + PE Analista (baseline métricas)
- `phase-8-dev-cycle.sh`: PE Decompositor antes do loop de implementação por story
- `package.json`: versão 1.4.0 -> 1.6.0
- Documentação: README.md, CLAUDE.md, guia-pratico.md, passos.md atualizados

## [1.5.0] - 2026-03-03

### Adicionado
- **Squad Creator Premium como default na Fase 4** do autonomous runner
- Integração do squad-chief como executor padrão da fase 4 no modo autônomo

### Atualizado
- `phase-4-squads.sh`: Squad Creator Premium como opção default
- README.md e documentação com referência à integração

## [1.4.0] - 2026-03-02

### Adicionado
- **Autonomous Runner Nativo** (`*run-autonomous`) — executa fases do AIOS dentro do Claude Code via Task tool, sem sair para o terminal
- Task definition completa em `.aios-core/development/tasks/run-autonomous.md` com suporte a fase única, lista (`2,4,5`), range (`2-5`) e `all`
- Opções: `--max-retries`, `--skip-on-fail`, `--pause-between`, `--resume`
- Contexto isolado por fase via subagent (equivalente ao Ralph loop, mas nativo ao Claude Code)
- Fase 0 (Bootstrap) via Bash; fases padrão (2,3,4,5,6,7,9) via Task tool; Fase 8 (Dev Cycle) com loop story + subagentes dev/QA
- State persistence compatível com `plan/autonomous-state.json` (mesmo schema do shell runner)
- Learnings acumulados em `plan/autonomous-learnings.md` com substituição de `{{LEARNINGS}}` nos templates

### Atualizado
- `aios-master.md`: comando `run-autonomous` adicionado com `visibility: full`, dependência `run-autonomous.md` registrada, atalho na seção Quick Commands
- `README.md`: seção "Modo Autonomo" expandida com dois modos (nativo e shell fallback), exemplos de uso do `*run-autonomous`, modo nativo indicado como recomendado
- `package.json`: versão 1.2.0 → 1.4.0

### Mantido
- `autonomous-runner.sh` preservado sem alterações como fallback para execução via terminal

## [1.3.0] - 2026-03-01

### Adicionado
- **Squad Conselho Deliberativo** — sistema de deliberação multi-agente com 3 modos (Full, Quick, Audit)
- 4 agentes especializados: Conselheiro-Mor, Crítico Metodológico, Advogado do Diabo, Sintetizador
- Detecção de 12 vieses cognitivos (anchoring, confirmation bias, sunk cost, etc.)
- Exercício de pré-mortem no Advogado do Diabo (5 entregas obrigatórias)
- Confiança decomposta no Sintetizador (dados/modelo/execução)
- Scoring framework 0-100 com 5 critérios × 20 pontos
- Matriz de impacto por stakeholder
- Memória de decisões em `squads/conselho/decisions/`
- Consulta cross-squad: AIOS Core (9 agentes), squads locais, e repositório externo `andrewebemp/squads-criados` (13 squads, 99 agentes)
- Slash commands: `/conselho/agents/conselheiro-mor`, `critico-metodologico`, `advogado-do-diabo`, `sintetizador`
- Tasks: deliberar-full, deliberar-quick, deliberar-audit, consultar-especialista, registrar-decisao
- Templates de output: crítico, advogado, síntese, registro de decisão
- Data files: vieses-cognitivos, scoring-framework, tipos-decisao, consulta-cross-squad, conselho-kb
- Workflow formal de deliberação (deliberacao.yaml)
- Documentação completa do squad em `squads/conselho/docs/README.md`

### Atualizado
- CLAUDE.md: seção conselho adicionada com key agents e modos
- README.md: seção Conselho Deliberativo, tabela de agentes, árvore de estrutura, documentação
- passos.md: menção ao Conselho na Fase 4
- guia-pratico.md: Conselho no cartão de referência rápida
- squad-registry.yaml: registro do squad conselho

## [1.2.0] - 2026-02-27

### Adicionado
- Opcao brownfield integrada em toda a documentacao do usuario
- Secao "Greenfield ou Brownfield?" no guia-pratico.md com tabela comparativa
- Secao "Tipo de Projeto" no passos.md com arvore de roteamento por tamanho
- Secao "Fluxo Brownfield (Projetos Existentes)" no README.md
- Marcadores [BF] no guia-pratico.md para pontos de divergencia brownfield
- Subsecoes "Variante Brownfield" em todas as fases do passos.md (0-8)
- Comandos brownfield na referencia rapida do guia-pratico.md
- Planejamento brownfield alternativo (2-alt) no README.md
- Checklist brownfield adicional no passos.md
- Regra de ouro #8: documentar sistema existente antes de planejar
- Linha brownfield no fluxo visual do README.md
- Link para Brownfield Guide na tabela de documentacao do README.md
- Entrada de troubleshooting para projetos brownfield no guia-pratico.md

### Referenciado
- `.aios-core/working-in-the-brownfield.md` como guia dedicado
- Workflows: brownfield-fullstack, brownfield-discovery, brownfield-ui, brownfield-service
- Tasks: analyze-brownfield, brownfield-create-story, brownfield-create-epic, create-brownfield-story
- Templates: brownfield-prd-tmpl.yaml, brownfield-architecture-tmpl.yaml

## [1.1.0] - 2026-02-26

### Adicionado
- Seção Squad Creator Premium no README com documentação completa de mind cloning
- Guia passo a passo completo no README (Da Instalação ao Projeto Final)
- Seção Modo Autônomo (Ralph Pattern) no README com comandos e opções
- Tabela de modos de desenvolvimento (YOLO, Interactive, Pre-Flight) no README
- Tabela de MCP Servers opcionais no README
- Slash commands e nomes dos agentes na tabela de agentes

### Corrigido
- Fluxo de desenvolvimento corrigido de 12 fases para 10 fases (alinhado com passos.md)
- Estrutura do projeto expandida e detalhada com todos os diretórios relevantes
- Tabela de pré-requisitos com coluna de obrigatoriedade
- Seção de documentação atualizada com links corretos
- Tabela de provedores LLM com informações de configuração
- Rodapé com versão do fork (v1.1.0)

### Atualizado
- CLAUDE.md: Node.js mínimo corrigido de 18+ para 20+
- CLAUDE.md: Estrutura do framework atualizada com paths reais
- CLAUDE.md: Seção de Squad Creator Premium adicionada
- CHANGELOG.md: Histórico completo de mudanças

## [1.0.0] - 2026-02-26

### Adicionado
- Fork personalizado do Synkra AIOS v3.11.3
- 12 agentes especializados (aios-master, analyst, architect, data-engineer, dev, devops, pm, po, qa, sm, ux-design-expert, squad-creator)
- Sistema de execução autônoma (Ralph Pattern) com runner, executores por fase e prompts
- Constituição com 6 princípios invioláveis
- 115+ tarefas executáveis no sistema de desenvolvimento
- Squad Creator Premium para criação de agentes baseados em mentes elite
- Documentação completa em PT-BR (guia-pratico.md, passos.md)
- Controle de versões com semantic versioning
- Repositório privado no GitHub

[1.7.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/andrewebemp/casa-arquitetura/releases/tag/v1.0.0
