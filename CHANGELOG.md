# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.0.0] - 2026-03-10

### Adicionado — DecorAI Product (Full Stack)

#### Backend (packages/api)
- **Story 7.1** — Scaffolding do monorepo pnpm com Turborepo (web, api, shared, ai-pipeline)
- **Story 7.2** — Database schema e Supabase migrations (user_profiles, projects, subscriptions, render_jobs, etc.)
- **Story 7.3** — Supabase client, auth middleware e infraestrutura Fastify
- **Story 7.4** — Project CRUD API e upload de imagens para Supabase Storage
- **Story 7.5** — Render job queue, quota check e progresso em tempo real via Realtime
- **Story 7.6** — AI Pipeline core: SDXL generation, depth estimation, style extraction
- **Story 6.1** — Auth routes: signup, login, Google OAuth e sessao
- **Story 6.2** — User profile API: favoritos, preferencias e historico
- **Story 6.3** — Subscription e payment API: Stripe integration, tier management e webhooks
- **Story 6.5** — Pricing UI: pagina de planos, comparativo de features e checkout Stripe
- **Story 6.6** — Image post-processing: watermark rendering no free tier e disclaimer AI
- **Story 6.7** — Brazilian payment gateway: Asaas integration para PIX, boleto e cartao nacional
- **Story 7.8** — API rate limiting: per-tier request throttling via Redis
- **Story 7.9** — Image CDN delivery e semantic render caching via Redis
- **Story 1.1** — Spatial input API e reference items CRUD
- **Story 1.2** — Croqui ASCII: geracao, refinamento 3-turn e aprovacao API
- **Story 1.3** — Staging generation API: upload de foto, selecao de estilo e orquestracao do pipeline
- **Story 2.1** — Chat de refinamento API: NLU, operacoes e historico de versoes
- **Story 3.1** — Segmentation API: SAM element segmentation, material swap e inpainting
- **Story 3.2** — Lighting correction API: IC-Light auto-enhancement
- **Story 3.3** — Object removal API: LaMa inpainting para remocao de objetos
- **Story 4.1** — Before/after slider API e compartilhamento via link
- **Story 5.1** — Reverse staging diagnostico API: analise de valor e funil freemium

#### Frontend (packages/web)
- **Story 7.7** — Frontend shell: layout base Next.js 14, autenticacao UI e navegacao
- **Story 6.4** — Dashboard UI: listagem de projetos, favoritos e acoes rapidas
- **Story 1.4** — Staging UI: wizard de novo projeto, upload, selecao de estilo e geracao com progresso
- **Story 2.2** — Chat de refinamento UI: interface conversacional, historico visual e navegacao de versoes
- **Story 3.4** — Editing UI: segmentacao de elementos, correcao de iluminacao e remocao de objetos
- **Story 4.2** — Before/after slider UI, modal de compartilhamento e pagina publica de share
- **Story 5.2** — Reverse staging UI: diagnostico gratuito, upload de foto e resultado com CTA

#### Infraestrutura e Deploy
- **Vercel deploy** — Frontend (decorai-chi.vercel.app) e API (decorai-api-theta.vercel.app) como serverless functions
- **Image CDN proxy** — Rota `/api/images/*` com Vercel Edge cache headers (1 ano)
- **CDN URL resolution** — API responses resolvem storage paths para URLs assinadas em tempo de resposta
- **Supabase auth config** — site_url, autoconfirm, redirect URIs configurados para producao
- **Trigger handle_new_user** — Corrigido com SET search_path e fallback display_name
- **CI/CD** — GitHub Actions workflow (lint, typecheck, test, build)
- **LLM migration** — Anthropic Claude Sonnet para Gemini Flash via OpenRouter

### Corrigido
- Wizard step oscillation entre steps 1 e 2 (useEffects competindo)
- Serverless entry com todas as rotas exceto rateLimitMiddleware
- Signup error messages — mensagens especificas em vez de generico
- Auth middleware — redirect home para /login
- BullMQ worker_threads hang em serverless — shim lightweight

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

[2.0.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.7.0...v2.0.0
[1.7.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/andrewebemp/casa-arquitetura/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/andrewebemp/casa-arquitetura/releases/tag/v1.0.0
