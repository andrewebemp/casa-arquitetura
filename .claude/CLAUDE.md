# Synkra AIOS Development Rules for Claude Code

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

<!-- AIOS-MANAGED-START: core-framework -->
## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.
<!-- AIOS-MANAGED-END: core-framework -->

<!-- AIOS-MANAGED-START: agent-system -->
## Agent System

### Agent Activation
- Agents are activated with @agent-name syntax: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- The master agent is activated with @aios-master
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction
<!-- AIOS-MANAGED-END: agent-system -->

## Development Methodology

### Story-Driven Development
1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: [ ] → [x]
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements
- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck`
- Add tests for new features
- Test edge cases and error scenarios

<!-- AIOS-MANAGED-START: framework-structure -->
## AIOS Framework Structure

```
.aios-core/
├── constitution.md             # 6 princípios invioláveis
├── core-config.yaml            # Configuração do framework
├── user-guide.md               # Handbook completo
├── core/
│   ├── execution/              # BOB Build Orchestrator (12 arquivos)
│   ├── synapse/                # Synapse Session Engine (35 arquivos)
│   ├── ids/                    # IDS + gates G1-G4 + FrameworkGovernor
│   ├── code-intel/             # Code Intel (14 arquivos)
│   ├── graph-dashboard/        # Graph Dashboard CLI (12 arquivos)
│   ├── memory/                 # GotchasMemory
│   ├── quality-gates/          # Quality gates automáticos
│   └── utils/                  # 70+ utilitários
├── hooks/unified/              # Unified hook system
├── development/
│   ├── agents/                 # 12 definições de agentes
│   ├── tasks/                  # 115+ tarefas executáveis
│   ├── workflows/              # Workflows multi-step
│   ├── templates/              # Templates de documentos
│   ├── checklists/             # Checklists de validação
│   └── data/                   # Frameworks de decisão
├── data/
│   ├── entity-registry.yaml   # 305 entidades catalogadas
│   └── tech-presets/           # Presets de tecnologia
├── scripts/
│   ├── autonomous-runner.sh    # Orquestrador autônomo
│   ├── phase-executors/        # Executores por fase (0-9)
│   └── update-aios.sh          # Script de atualização
└── templates/
    └── phase-prompts/          # Prompts por fase

docs/
├── stories/                    # Development stories
├── prd/                        # PRD fragmentado por épico
├── architecture/               # Arquitetura fragmentada
└── framework/                  # Guias de dev (source-tree, tech-stack)

squads/                         # Squads de agentes por domínio
  ├── conselho/                 # Conselho Deliberativo (4 agentes)
  ├── process-excellence/       # Process Excellence (8 agentes)
  ├── claude-code-mastery/      # Claude Code Mastery (8 agentes)
  └── squad-creator/            # Squad Creator Premium (3 agentes)
```
<!-- AIOS-MANAGED-END: framework-structure -->

## Workflow Execution

### Task Execution Pattern
1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

### Interactive Workflows
- Workflows with `elicit: true` require user input
- Present options clearly
- Validate user responses
- Provide helpful defaults

## Best Practices

### When implementing features:
- Check existing patterns first
- Reuse components and utilities
- Follow naming conventions
- Keep functions focused and testable
- Document complex logic

### When working with agents:
- Respect agent boundaries
- Use appropriate agent for each task
- Follow agent communication patterns
- Maintain agent context

### When handling errors:
```javascript
try {
  // Operation
} catch (error) {
  console.error(`Error in ${operation}:`, error);
  // Provide helpful error message
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement IDE detection [Story 2.1]`
- Keep commits atomic and focused

### GitHub CLI Usage
- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

<!-- AIOS-MANAGED-START: aios-patterns -->
## AIOS-Specific Patterns

### Working with Templates
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

### Agent Command Handling
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

### Story Updates
```javascript
// Update story progress
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```
<!-- AIOS-MANAGED-END: aios-patterns -->

## Environment Setup

### Required Tools
- Node.js 20+
- GitHub CLI (gh)
- Git
- npm (package manager)

### Configuration Files
- `.aios-core/core-config.yaml` - Framework configuration
- `.env` - Environment variables (keys de API)
- `.env.example` - Template de variáveis de ambiente

<!-- AIOS-MANAGED-START: common-commands -->
## Common Commands

### AIOS Master Commands
- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow

### Development Commands
- `npm run dev` - Start development
- `npm test` - Run tests
- `npm run lint` - Check code style
- `npm run build` - Build project
<!-- AIOS-MANAGED-END: common-commands -->

<!-- AIOS-MANAGED-START: squad-creator -->
## Squad Creator Premium

The Squad Creator Premium creates domain-specific agents based on real elite minds.
Instead of generic agents, it clones experts with documented frameworks and methodologies.

### Key Agents
- `/squad-creator/agents/squad-chief` - Orchestrator: triage, research, creation
- `/squad-creator/agents/oalanicolas` - Mind cloning: Voice DNA + Thinking DNA extraction
- `/squad-creator/agents/pedro-valerio` - Process design: workflows, veto conditions

### Execution Modes
- **YOLO** (60-75% fidelity) - Web research only, no materials needed
- **QUALITY** (85-95% fidelity) - With books, PDFs, transcriptions
- **HYBRID** (variable) - Partial materials

### Output Structure
Squads are created in `squads/{squad-name}/` with agents, tasks, workflows, templates, and data.
<!-- AIOS-MANAGED-END: squad-creator -->

<!-- AIOS-MANAGED-START: conselho -->
## Conselho Deliberativo

O Conselho Deliberativo analisa decisões com rigor multi-perspectiva antes de recomendar um caminho.
Ativado via `/conselho/agents/conselheiro-mor`, orquestra 3 agentes especializados e pode consultar agentes de qualquer squad.

### Key Agents
- `/conselho/agents/conselheiro-mor` - Orchestrator: triage, classificação, convocação
- `/conselho/agents/critico-metodologico` - Avalia qualidade do raciocínio (score 0-100)
- `/conselho/agents/advogado-do-diabo` - Ataca a decisão (5 entregas obrigatórias + pré-mortem)
- `/conselho/agents/sintetizador` - Integra perspectivas (confiança decomposta)

### Deliberation Modes
- **Full** (5 fases) - Decisões críticas/irreversíveis, com pareceres cross-squad
- **Quick** (3 fases) - Decisões moderadas e reversíveis
- **Audit** (3 fases) - Auditoria de decisão já tomada

### Cross-Squad Consultation
O Conselho pode convocar agentes de 3 fontes: AIOS Core, squads locais, e repositório externo `andrewebemp/squads-criados` (13 squads, 99 agentes).

### Output Structure
Decisões são registradas em `squads/conselho/decisions/` para memória e aprendizado futuro.
<!-- AIOS-MANAGED-END: conselho -->

<!-- AIOS-MANAGED-START: process-excellence -->
## Process Excellence

Squad de otimização de processos com 8 agentes especializados baseados em mind clones de experts reais.
Ativado via `/process-excellence/agents/orquestrador-de-processos` ou automaticamente com `--process-excellence`.

### Key Agents
- `/process-excellence/agents/orquestrador-de-processos` - Triage e delegação
- `/process-excellence/agents/decompositor-de-tarefas` - Quebra tarefas em micro-steps (David Allen + Tiago Forte)
- `/process-excellence/agents/otimizador-de-processos` - Theory of Constraints, VSM (Taiichi Ohno + Goldratt)
- `/process-excellence/agents/auditor-de-processos` - Score de aderência 0-100 (ISO 9001/COSO)
- `/process-excellence/agents/analista-de-metricas` - KPIs, Balanced Scorecard, OKRs
- `/process-excellence/agents/documentador-sop` - Criação de SOPs e documentação
- `/process-excellence/agents/gestor-de-mudanca` - Change management (Kotter + ADKAR)
- `/process-excellence/agents/cacador-de-automacao` - Oportunidades de automação (RPA)

### Autonomous Integration
When `--process-excellence` flag is active, PE agents are invoked at phases 2, 5, 7, and 8.
Functions `run_process_excellence()` in `common.sh` handle invocation and signal extraction.
<!-- AIOS-MANAGED-END: process-excellence -->

<!-- AIOS-MANAGED-START: autonomous-mode -->
## Autonomous Mode

### Overview
The AIOS Autonomous Runner enables automated execution of development phases.
It uses the Ralph pattern: fresh Claude Code instances per phase/story with
accumulated learnings and quality gates. Each task runs in its own context
window (zero compaction, maximum performance).

### Key Files
- `.aios-core/scripts/autonomous-runner.sh` - Main orchestrator
- `.aios-core/scripts/phase-executors/` - Per-phase executor scripts
- `.aios-core/templates/phase-prompts/` - Prompt templates per phase
- `.aios-core/core/execution/story-parser.js` - Story markdown parser
- `plan/autonomous-state.json` - Execution state (generated)
- `plan/autonomous-learnings.md` - Accumulated learnings (generated)

### When Running Autonomously
- Each phase spawns a fresh Claude Code instance (prevents context drift)
- Respect the same constitutional principles as manual mode
- Quality gates run automatically between phases
- Only @devops can git push, even in autonomous mode
- State persists in `plan/autonomous-state.json` for resume capability

### Autonomous Runner Commands
- `bash .aios-core/scripts/autonomous-runner.sh --phase N` - Run single phase
- `bash .aios-core/scripts/autonomous-runner.sh --phases N,M,O` - Run multiple phases
- `bash .aios-core/scripts/autonomous-runner.sh --phases all` - Run all phases
- `bash .aios-core/scripts/autonomous-runner.sh --resume` - Resume interrupted run

### Squad Integration Flags (opt-in)
- `--conselho-gates` - Enable Conselho Deliberativo decision gates at critical phases (2, 5, 7)
- `--process-excellence` - Enable Process Excellence hooks (decomposition, optimization, audit at phases 2, 5, 7, 8)
- Both flags export env vars (`AIOS_CONSELHO_GATES`, `AIOS_PROCESS_EXCELLENCE`) consumed by `common.sh`
<!-- AIOS-MANAGED-END: autonomous-mode -->

<!-- AIOS-MANAGED-START: synapse-engine -->
## Synapse Session Engine

Context injection pipeline with 8 layers (L0-L7). Active layers: L0 (Constitution), L1 (Global), L2 (Agent), L5 (Squad).

### Key Files
- `.aios-core/core/synapse/engine.js` - Main engine (DEFAULT_ACTIVE_LAYERS = [0, 1, 2, 5])
- `.aios-core/core/synapse/runtime/hook-runtime.js` - Hook entry point
- `.aios-core/core/synapse/layers/l5-squad.js` - Squad discovery (60s cache)
- `.synapse/manifest` - Root manifest with agent/workflow triggers
- `squads/*/.synapse/manifest` - Per-squad manifests (KEY=VALUE format)

### Manifest Format
```
{DOMAIN}_STATE=active
{DOMAIN}_RECALL=keyword1,keyword2,keyword3
{DOMAIN}_AGENT_TRIGGER=agent-id
```

### Hooks
- `UserPromptSubmit`: synapse-wrapper.cjs -> synapse-engine.cjs (context injection)
- `PreCompact`: precompact-wrapper.cjs -> precompact-session-digest.cjs (session digest)
<!-- AIOS-MANAGED-END: synapse-engine -->

<!-- AIOS-MANAGED-START: governance-hooks -->
## Governance Hooks

7 PreToolUse hooks protect project integrity:
- `mind-clone-governance.py` (Write|Edit) - Protects agent DNA files
- `enforce-architecture-first.py` (Write|Edit) - Architecture before implementation
- `enforce-git-push-authority.sh` (Bash) - Only @devops can push
- `read-protection.py` (Read) - Protects sensitive files
- `write-path-validation.py` (Write|Edit) - Validates write paths
- `sql-governance.py` (Bash) - SQL operation governance
- `slug-validation.py` (Bash) - Slug and naming validation
<!-- AIOS-MANAGED-END: governance-hooks -->

<!-- AIOS-MANAGED-START: graph-dashboard -->
## Graph Dashboard

CLI tool for project observability:
```bash
node bin/aios-graph.js --stats    # Project statistics
node bin/aios-graph.js --help     # Full usage
npm run graph                      # Package.json shortcut
```
Output formats: ASCII tree, JSON, DOT, Mermaid, HTML.
<!-- AIOS-MANAGED-END: graph-dashboard -->

<!-- AIOS-MANAGED-START: claude-code-mastery -->
## Claude Code Mastery Squad

8 specialized agents for Claude Code expertise:
- `/claude-code-mastery/agents/claude-mastery-chief` - Orchestrator (Orion)
- `/claude-code-mastery/agents/hooks-architect` - Hook events (Latch)
- `/claude-code-mastery/agents/mcp-integrator` - MCP servers (Piper)
- `/claude-code-mastery/agents/swarm-orchestrator` - Multi-agent (Nexus)
- `/claude-code-mastery/agents/config-engineer` - Settings (Sigil)
- `/claude-code-mastery/agents/skill-craftsman` - Skills (Anvil)
- `/claude-code-mastery/agents/project-integrator` - CI/CD (Conduit)
- `/claude-code-mastery/agents/roadmap-sentinel` - Roadmap (Vigil)
<!-- AIOS-MANAGED-END: claude-code-mastery -->

<!-- AIOS-MANAGED-START: release-protocol -->
### Release Protocol (OBRIGATORIO)

Apos QUALQUER alteracao relevante (insercao, edicao ou exclusao de funcionalidades):

1. Atualizar documentacao obrigatoria:
   - `CHANGELOG.md` (via version-bump.js ou manual)
   - `README.md` (tabela de agentes, estrutura, funcionalidades)
   - `guia-pratico.md` (cartao de referencia, comandos)
   - `.claude/CLAUDE.md` (secoes AIOS-MANAGED afetadas)
2. Commitar com conventional commits
3. Executar `bash scripts/release.sh` ou manualmente:
   - `node scripts/version-bump.js`
   - `git tag -a vX.Y.Z -m "Release vX.Y.Z"`
   - `git push && git push --tags`
4. Criar GitHub Release: `gh release create vX.Y.Z --title "vX.Y.Z" --notes-from-tag`
<!-- AIOS-MANAGED-END: release-protocol -->

## Debugging

### Enable Debug Mode
```bash
export AIOS_DEBUG=true
```

### View Agent Logs
```bash
tail -f .aios/logs/agent.log
```

### Trace Workflow Execution
```bash
npm run trace -- workflow-name
```

## Claude Code Specific Configuration

### Performance Optimization
- Prefer batched tool calls when possible for better performance
- Use parallel execution for independent operations
- Cache frequently accessed data in memory during sessions

### Tool Usage Guidelines
- Always use the Grep tool for searching, never `grep` or `rg` in bash
- Use the Task tool for complex multi-step operations
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

### Session Management
- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

### Error Recovery
- Always provide recovery suggestions for failures
- Include error context in messages to user
- Suggest rollback procedures when appropriate
- Document any manual fixes required

### Testing Strategy
- Run tests incrementally during development
- Always verify lint and typecheck before marking complete
- Test edge cases for each new feature
- Document test scenarios in story files

### Documentation
- Update relevant docs when changing functionality
- Include code examples in documentation
- Keep README synchronized with actual behavior
- Document breaking changes prominently

---
*Synkra AIOS Claude Code Configuration v2.2*
