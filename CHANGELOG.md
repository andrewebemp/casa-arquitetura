# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

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

[1.3.0]: https://github.com/andrewebemp/aios-pessoal/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/andrewebemp/aios-pessoal/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/andrewebemp/aios-pessoal/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/andrewebemp/aios-pessoal/releases/tag/v1.0.0
