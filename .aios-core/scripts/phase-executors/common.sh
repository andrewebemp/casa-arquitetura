#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Common Functions
#
# Shared functions used by all phase executor scripts.
# Provides logging, state management, prompt building, and Claude execution.
#
# This file is sourced by every phase executor. Do NOT execute it directly.
#
# Dependencies:
#   - jq (for JSON operations on autonomous-state.json)
#   - claude CLI (for AI execution via --print --dangerously-skip-permissions)
#
# Author: AIOS Autonomous Runner
# ============================================================================

# Guard against direct execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  echo "ERROR: common.sh should be sourced, not executed directly."
  echo "Usage: source common.sh"
  exit 1
fi

# ============================================================================
#                          PATH RESOLUTION
# ============================================================================

# Resolve project root (two levels up from phase-executors/)
# Each executor sets SCRIPT_DIR before sourcing this file
if [[ -z "${SCRIPT_DIR:-}" ]]; then
  echo "ERROR: SCRIPT_DIR must be set before sourcing common.sh"
  exit 1
fi

# Project root is the repository root (up from .aios-core/scripts/phase-executors/)
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# Key directories
AIOS_CORE_DIR="${PROJECT_ROOT}/.aios-core"
TEMPLATES_DIR="${AIOS_CORE_DIR}/templates/phase-prompts"
PLAN_DIR="${PROJECT_ROOT}/plan"
DOCS_DIR="${PROJECT_ROOT}/docs"
STORIES_DIR="${DOCS_DIR}/stories"

# State files
STATE_FILE="${PLAN_DIR}/autonomous-state.json"
LEARNINGS_FILE="${PLAN_DIR}/autonomous-learnings.md"

# Claude CLI command (configurable via environment)
CLAUDE_CMD="${CLAUDE_CMD:-claude}"

# Squad integration flags (opt-in via autonomous-runner flags)
CONSELHO_GATES="${AIOS_CONSELHO_GATES:-false}"
PROCESS_EXCELLENCE="${AIOS_PROCESS_EXCELLENCE:-false}"

# Squad paths
CONSELHO_ENTRY="${PROJECT_ROOT}/squads/conselho/agents/conselheiro-mor.md"
PE_ENTRY="${PROJECT_ROOT}/squads/process-excellence/agents/orquestrador-de-processos.md"
CONSELHO_DECISIONS="${PROJECT_ROOT}/squads/conselho/decisions"

# Maximum retries for dev/QA cycle (configurable via environment)
MAX_RETRIES="${AIOS_MAX_RETRIES:-3}"

# ============================================================================
#                          LOGGING
# ============================================================================

# ANSI color codes (works in both Linux and Git Bash on Windows)
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_GRAY='\033[0;90m'
readonly COLOR_RESET='\033[0m'

# Log informational message (blue prefix)
log_info() {
  echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $*" >&2
}

# Log error message (red prefix)
log_error() {
  echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $*" >&2
}

# Log success message (green prefix)
log_success() {
  echo -e "${COLOR_GREEN}[OK]${COLOR_RESET} $*" >&2
}

# Log warning message (yellow prefix)
log_warn() {
  echo -e "${COLOR_YELLOW}[WARN]${COLOR_RESET} $*" >&2
}

# Log debug message (gray prefix, only when AIOS_DEBUG=true)
log_debug() {
  if [[ "${AIOS_DEBUG:-false}" == "true" ]]; then
    echo -e "${COLOR_GRAY}[DEBUG]${COLOR_RESET} $*" >&2
  fi
}

# Log phase header (cyan, prominent)
log_phase() {
  local phase_name="$1"
  local phase_num="${2:-}"
  echo "" >&2
  echo -e "${COLOR_CYAN}================================================================${COLOR_RESET}" >&2
  if [[ -n "$phase_num" ]]; then
    echo -e "${COLOR_CYAN}  Phase ${phase_num}: ${phase_name}${COLOR_RESET}" >&2
  else
    echo -e "${COLOR_CYAN}  ${phase_name}${COLOR_RESET}" >&2
  fi
  echo -e "${COLOR_CYAN}================================================================${COLOR_RESET}" >&2
  echo "" >&2
}

# ============================================================================
#                          FILE CHECKS
# ============================================================================

# Verify a file exists; log error and return 1 if not
# Usage: check_file_exists "path/to/file" "description"
check_file_exists() {
  local file_path="$1"
  local description="${2:-file}"

  if [[ ! -f "$file_path" ]]; then
    log_error "Required ${description} not found: ${file_path}"
    return 1
  fi

  log_debug "Found ${description}: ${file_path}"
  return 0
}

# Verify a directory exists; log error and return 1 if not
# Usage: check_dir_exists "path/to/dir" "description"
check_dir_exists() {
  local dir_path="$1"
  local description="${2:-directory}"

  if [[ ! -d "$dir_path" ]]; then
    log_error "Required ${description} not found: ${dir_path}"
    return 1
  fi

  log_debug "Found ${description}: ${dir_path}"
  return 0
}

# Check if a directory has content (at least one file or subdirectory)
# Usage: check_dir_has_content "path/to/dir" "description"
check_dir_has_content() {
  local dir_path="$1"
  local description="${2:-directory}"

  if [[ ! -d "$dir_path" ]]; then
    log_error "Required ${description} not found: ${dir_path}"
    return 1
  fi

  # Check if directory is non-empty (compatible with both Linux and Git Bash)
  local count
  count=$(ls -A "$dir_path" 2>/dev/null | wc -l)
  if [[ "$count" -eq 0 ]]; then
    log_error "${description} exists but is empty: ${dir_path}"
    return 1
  fi

  log_debug "${description} has content: ${dir_path} (${count} entries)"
  return 0
}

# ============================================================================
#                          STATE MANAGEMENT
# ============================================================================

# Ensure the plan directory exists
ensure_plan_dir() {
  if [[ ! -d "$PLAN_DIR" ]]; then
    mkdir -p "$PLAN_DIR"
    log_debug "Created plan directory: ${PLAN_DIR}"
  fi
}

# Initialize state file if it does not exist
# Creates a fresh autonomous-state.json with default structure
init_state() {
  ensure_plan_dir

  if [[ ! -f "$STATE_FILE" ]]; then
    cat > "$STATE_FILE" << 'INIT_STATE'
{
  "version": "1.0.0",
  "created_at": "",
  "updated_at": "",
  "current_phase": null,
  "phases": {},
  "stories": {},
  "dev_cycles": {
    "total_stories_completed": 0,
    "total_qa_passes": 0,
    "total_qa_failures": 0,
    "total_retries": 0
  },
  "errors": []
}
INIT_STATE

    # Set creation timestamp
    local now
    now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    local tmp
    tmp=$(jq --arg ts "$now" '.created_at = $ts | .updated_at = $ts' "$STATE_FILE")
    echo "$tmp" > "$STATE_FILE"

    log_info "Initialized state file: ${STATE_FILE}"
  fi
}

# Update a field in the autonomous-state.json using jq
# Usage: update_state '.current_phase' '"phase-2"'
# Usage: update_state '.phases["phase-2"].status' '"complete"'
update_state() {
  local jq_path="$1"
  local jq_value="$2"

  ensure_plan_dir
  init_state

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  local tmp
  tmp=$(jq "${jq_path} = ${jq_value} | .updated_at = \"${now}\"" "$STATE_FILE")
  echo "$tmp" > "$STATE_FILE"

  log_debug "State updated: ${jq_path} = ${jq_value}"
}

# Read a value from autonomous-state.json using jq
# Usage: value=$(get_state '.current_phase')
# Usage: value=$(get_state '.phases["phase-2"].status')
get_state() {
  local jq_path="$1"

  if [[ ! -f "$STATE_FILE" ]]; then
    echo "null"
    return
  fi

  jq -r "${jq_path} // empty" "$STATE_FILE" 2>/dev/null || echo "null"
}

# Record a phase start in state
# Usage: record_phase_start "phase-2" "PRD Creation"
record_phase_start() {
  local phase_id="$1"
  local phase_name="$2"

  init_state

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  local tmp
  tmp=$(jq \
    --arg id "$phase_id" \
    --arg name "$phase_name" \
    --arg ts "$now" \
    '.current_phase = $id |
     .phases[$id] = {
       "name": $name,
       "status": "running",
       "started_at": $ts,
       "completed_at": null,
       "error": null
     } |
     .updated_at = $ts' \
    "$STATE_FILE")
  echo "$tmp" > "$STATE_FILE"

  log_info "Phase started: ${phase_id} (${phase_name})"
}

# Record a phase completion in state
# Usage: record_phase_complete "phase-2"
record_phase_complete() {
  local phase_id="$1"

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  local tmp
  tmp=$(jq \
    --arg id "$phase_id" \
    --arg ts "$now" \
    '.phases[$id].status = "complete" |
     .phases[$id].completed_at = $ts |
     .updated_at = $ts' \
    "$STATE_FILE")
  echo "$tmp" > "$STATE_FILE"

  log_success "Phase completed: ${phase_id}"
}

# Record a phase failure in state
# Usage: record_phase_failure "phase-2" "PRD file was empty"
record_phase_failure() {
  local phase_id="$1"
  local error_msg="$2"

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  local tmp
  tmp=$(jq \
    --arg id "$phase_id" \
    --arg ts "$now" \
    --arg err "$error_msg" \
    '.phases[$id].status = "failed" |
     .phases[$id].completed_at = $ts |
     .phases[$id].error = $err |
     .errors += [{"phase": $id, "error": $err, "timestamp": $ts}] |
     .updated_at = $ts' \
    "$STATE_FILE")
  echo "$tmp" > "$STATE_FILE"

  log_error "Phase failed: ${phase_id} - ${error_msg}"
}

# ============================================================================
#                          LEARNINGS MANAGEMENT
# ============================================================================

# Initialize learnings file if it does not exist
init_learnings() {
  ensure_plan_dir

  if [[ ! -f "$LEARNINGS_FILE" ]]; then
    cat > "$LEARNINGS_FILE" << 'INIT_LEARNINGS'
# Autonomous Runner - Learnings

Accumulated learnings from autonomous phase execution.
Each entry is timestamped and tagged with the phase that produced it.

---

INIT_LEARNINGS
    log_info "Initialized learnings file: ${LEARNINGS_FILE}"
  fi
}

# Read all learnings and return as string
# Usage: learnings=$(read_learnings)
read_learnings() {
  if [[ ! -f "$LEARNINGS_FILE" ]]; then
    echo ""
    return
  fi

  cat "$LEARNINGS_FILE"
}

# Append a learning entry with timestamp and phase tag
# Usage: record_learnings "phase-2" "The project brief was very detailed, PRD covered 12 requirements."
record_learnings() {
  local phase_id="$1"
  local learning_text="$2"

  init_learnings

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  cat >> "$LEARNINGS_FILE" << EOF

### [${phase_id}] - ${now}

${learning_text}

---

EOF

  log_debug "Recorded learning for ${phase_id}"
}

# ============================================================================
#                          PROMPT BUILDING
# ============================================================================

# Build a prompt from a template file by substituting placeholders and appending learnings
# Supported placeholders:
#   {{LEARNINGS}}   - Replaced with accumulated learnings
#   {{STORY_ID}}    - Replaced with story ID (if provided)
#   {{STORY_PATH}}  - Replaced with story file path (if provided)
#   {{QA_FEEDBACK}} - Replaced with QA feedback (if provided)
#
# Usage: prompt=$(build_prompt "/path/to/template.md")
# Usage: prompt=$(build_prompt "/path/to/template.md" "STORY_ID=1.1" "STORY_PATH=docs/stories/1.1/story.md")
build_prompt() {
  local template_path="$1"
  shift

  # Verify template exists
  if [[ ! -f "$template_path" ]]; then
    log_error "Prompt template not found: ${template_path}"
    return 1
  fi

  # Read template content
  local content
  content="$(cat "$template_path")"

  # Process additional key=value substitutions
  for arg in "$@"; do
    local key="${arg%%=*}"
    local value="${arg#*=}"
    content="${content//\{\{${key}\}\}/${value}}"
  done

  # Always substitute learnings
  local learnings=""
  if [[ -f "$LEARNINGS_FILE" ]]; then
    learnings="$(read_learnings)"
  fi

  # Inject gotchas memory alongside learnings
  local gotchas_content=""
  local gotchas_file="${PROJECT_ROOT}/.aios/gotchas.md"
  if [[ -f "$gotchas_file" ]]; then
    gotchas_content="$(cat "$gotchas_file" 2>/dev/null || true)"
  fi

  if [[ -n "$learnings" || -n "$gotchas_content" ]]; then
    local learnings_section="## Previous Learnings

The following learnings were accumulated from previous phases. Use them to improve quality:

${learnings}"

    if [[ -n "$gotchas_content" ]]; then
      learnings_section="${learnings_section}

## Known Gotchas (Auto-captured)

${gotchas_content}"
    fi

    content="${content//\{\{LEARNINGS\}\}/${learnings_section}}"
  else
    content="${content//\{\{LEARNINGS\}\}/}"
  fi

  echo "$content"
}

# ============================================================================
#                          CLAUDE EXECUTION
# ============================================================================

# Execute Claude CLI with a prompt and capture output
# Runs: claude --print --dangerously-skip-permissions
# The prompt is piped via stdin using a heredoc
#
# Usage: output=$(run_claude "$prompt")
# Returns: Claude's output text on stdout; exit code 0 on success, 1 on failure
run_claude() {
  local prompt="$1"

  log_info "Executing Claude CLI..."
  log_debug "Prompt length: ${#prompt} characters"

  local output
  local exit_code=0

  # Execute Claude with prompt piped via stdin
  # --print: Output response to stdout (no interactive mode)
  # --dangerously-skip-permissions: Skip permission prompts for autonomous execution
  output=$("${CLAUDE_CMD}" --print --dangerously-skip-permissions <<< "$prompt" 2>&1) || exit_code=$?

  if [[ $exit_code -ne 0 ]]; then
    log_error "Claude CLI exited with code ${exit_code}"
    log_error "Output: ${output:0:500}"
    echo "$output"
    return 1
  fi

  log_debug "Claude output length: ${#output} characters"
  echo "$output"
  return 0
}

# ============================================================================
#                    SQUAD INTEGRATION: CONSELHO DELIBERATIVO
# ============================================================================

# Invoke Conselho Deliberativo as a decision gate.
# Spawns a fresh Claude instance with the Conselheiro-Mor persona.
#
# Usage: run_conselho_gate "decision question" "full|quick|audit"
# Returns: 0 if approved (confidence >= 60%), 1 if inconclusive
# Note: Non-blocking on execution errors (returns 0 to not halt pipeline)
run_conselho_gate() {
  local decision="$1"
  local mode="${2:-quick}"

  if [[ "$CONSELHO_GATES" != "true" ]]; then
    log_debug "Conselho gates disabled, skipping"
    return 0
  fi

  log_info "🏛️ Conselho Deliberativo Gate (modo: ${mode})"
  log_info "   Questão: ${decision}"

  # Build Conselho prompt
  local learnings_ctx
  learnings_ctx="$(read_learnings 2>/dev/null || echo 'Nenhum learning anterior.')"

  local conselho_prompt
  conselho_prompt="Você é o Conselheiro-Mor do Conselho Deliberativo.

Leia sua definição completa em: squads/conselho/agents/conselheiro-mor.md

Execute uma deliberação em modo ${mode} para a seguinte questão:
${decision}

Contexto do projeto (learnings acumulados):
${learnings_ctx}

IMPORTANTE:
- Siga TODAS as fases do modo ${mode} conforme squads/conselho/workflows/deliberacao.yaml
- Use os templates de output em squads/conselho/templates/
- Registre a decisão em squads/conselho/decisions/ usando o template registro-decisao.md
- Ao final, emita: CONSELHO_CONFIDENCE=XX (onde XX é o percentual de confiança)
- Se confiança >= 60%, emita: CONSELHO_APPROVED
- Se confiança < 60%, emita: CONSELHO_INCONCLUSIVE"

  local output
  output=$(run_claude "$conselho_prompt") || {
    log_warn "Conselho gate failed to execute, proceeding anyway"
    return 0
  }

  # Extract confidence from output
  local confidence
  confidence=$(echo "$output" | grep -oP 'CONSELHO_CONFIDENCE=\K[0-9]+' | tail -1)

  if [[ -z "$confidence" ]]; then
    log_warn "Could not extract Conselho confidence. Proceeding anyway."
    record_learnings "conselho-gate" "Conselho invocado para: ${decision}. Confiança não extraída."
    return 0
  fi

  record_learnings "conselho-gate" "Conselho (${mode}) para: ${decision}. Confiança: ${confidence}%."

  if echo "$output" | grep -q "CONSELHO_INCONCLUSIVE"; then
    log_warn "⚠️ Conselho INCONCLUSIVO (confiança: ${confidence}%)"
    log_warn "   Decisão requer intervenção humana."
    return 1
  fi

  log_success "✅ Conselho aprovou (confiança: ${confidence}%)"
  return 0
}

# ============================================================================
#                    IDS + CONSELHO INTEGRATION
# ============================================================================

# Invoke Conselho in quick mode when IDS detects a high-impact CREATE decision.
# This adds human-AI deliberation for significant creation decisions.
#
# Usage: run_ids_conselho_gate "entity_type" "entity_name" impact_percent
# Returns: 0 (always — advisory only, never blocks pipeline)
run_ids_conselho_gate() {
  local entity_type="$1"
  local entity_name="$2"
  local impact="${3:-0}"

  # Only trigger for high-impact decisions (>30%)
  if [[ "$impact" -le 30 ]]; then
    return 0
  fi

  # Only trigger if Conselho gates are enabled
  if [[ "$CONSELHO_GATES" != "true" ]]; then
    log_debug "IDS→Conselho gate: disabled, skipping"
    return 0
  fi

  log_info "🔗 IDS→Conselho: high-impact CREATE detected (${entity_type}: ${entity_name}, impact: ${impact}%)"

  run_conselho_gate \
    "IDS detectou criação de alto impacto: ${entity_type} '${entity_name}' (impacto estimado: ${impact}%). Avaliar se esta criação deve prosseguir considerando possíveis duplicatas e impacto na arquitetura." \
    "quick" || {
    log_warn "IDS→Conselho: INCONCLUSIVE, logging warning but proceeding (advisory)"
  }

  return 0
}

# ============================================================================
#                    SQUAD INTEGRATION: PROCESS EXCELLENCE
# ============================================================================

# Invoke a Process Excellence agent for a specific task.
# Spawns a fresh Claude instance with the specified agent persona.
#
# Usage: run_process_excellence "agent-name" "task description"
#   agent-name: one of decompositor-de-tarefas, otimizador-de-processos,
#               auditor-de-processos, documentador-sop, analista-de-metricas,
#               gestor-de-mudanca, cacador-de-automacao
# Returns: 0 on success, 1 on failure
# Note: Non-blocking on execution errors (returns 0 to not halt pipeline)
run_process_excellence() {
  local agent="$1"
  local task="$2"

  if [[ "$PROCESS_EXCELLENCE" != "true" ]]; then
    log_debug "Process Excellence disabled, skipping"
    return 0
  fi

  log_info "⚙️ Process Excellence: @${agent}"
  log_info "   Tarefa: ${task}"

  # Verify agent file exists
  local agent_file="${PROJECT_ROOT}/squads/process-excellence/agents/${agent}.md"
  if [[ ! -f "$agent_file" ]]; then
    log_warn "Agent file not found: ${agent_file}. Skipping."
    return 0
  fi

  local learnings_ctx
  learnings_ctx="$(read_learnings 2>/dev/null || echo 'Nenhum learning anterior.')"

  local pe_prompt
  pe_prompt="Você é o agente ${agent} do squad Process Excellence.

Leia sua definição completa em: squads/process-excellence/agents/${agent}.md

Execute a seguinte tarefa:
${task}

Contexto do projeto (learnings acumulados):
${learnings_ctx}

IMPORTANTE:
- Siga seus frameworks e metodologias conforme definido no seu agente
- Use os templates de output em squads/process-excellence/templates/
- Ao final, emita: PE_COMPLETE
- Se não conseguir completar, emita: PE_FAILED:REASON={motivo}"

  local output
  output=$(run_claude "$pe_prompt") || {
    log_warn "Process Excellence @${agent} failed to execute, proceeding anyway"
    return 0
  }

  if echo "$output" | grep -q "PE_FAILED"; then
    local reason
    reason=$(echo "$output" | grep -oP 'PE_FAILED:REASON=\K.*' | head -1)
    log_warn "Process Excellence @${agent} falhou: ${reason:-unknown}"
    record_learnings "pe-${agent}" "PE @${agent} falhou para: ${task}. Motivo: ${reason:-desconhecido}"
    return 1
  fi

  log_success "✅ Process Excellence @${agent} completou"
  record_learnings "pe-${agent}" "PE @${agent} completou: ${task}"
  return 0
}

# ============================================================================
#                          COMPLETION CHECKS
# ============================================================================

# Check if Claude's output contains the PHASE_COMPLETE signal
# Usage: if check_phase_complete "$output"; then ...
check_phase_complete() {
  local output="$1"

  if echo "$output" | grep -q "PHASE_COMPLETE"; then
    log_success "PHASE_COMPLETE signal detected"
    return 0
  fi

  log_warn "PHASE_COMPLETE signal NOT found in output"
  return 1
}

# Check if Claude's output contains the PHASE_FAILED signal
# Usage: if check_phase_failed "$output"; then ...
check_phase_failed() {
  local output="$1"

  if echo "$output" | grep -q "PHASE_FAILED"; then
    log_error "PHASE_FAILED signal detected"
    return 0
  fi

  return 1
}

# Check if Claude's output contains the PHASE_BLOCKED signal
# Usage: if check_phase_blocked "$output"; then ...
check_phase_blocked() {
  local output="$1"

  if echo "$output" | grep -q "PHASE_BLOCKED"; then
    log_warn "PHASE_BLOCKED signal detected"
    return 0
  fi

  return 1
}

# Extract a value from a PHASE_COMPLETE signal
# Example: PHASE_COMPLETE:STORY_ID=1.1 -> extracts "1.1"
# Usage: story_id=$(extract_signal_value "$output" "STORY_ID")
extract_signal_value() {
  local output="$1"
  local key="$2"

  echo "$output" | grep -oP "(?<=${key}=)[^:\s]+" | head -1
}

# ============================================================================
#                          OUTPUT VALIDATION
# ============================================================================

# Verify that an expected output file was created by Claude
# Usage: validate_file_created "docs/prd.md" "PRD document"
validate_file_created() {
  local file_path="$1"
  local description="${2:-output file}"

  # Handle both absolute and relative paths
  local full_path
  if [[ "$file_path" = /* ]]; then
    full_path="$file_path"
  else
    full_path="${PROJECT_ROOT}/${file_path}"
  fi

  if [[ ! -f "$full_path" ]]; then
    log_error "Expected ${description} was not created: ${full_path}"
    return 1
  fi

  # Check that the file has content (not empty)
  local size
  size=$(wc -c < "$full_path" | tr -d ' ')
  if [[ "$size" -eq 0 ]]; then
    log_error "Expected ${description} is empty: ${full_path}"
    return 1
  fi

  log_success "${description} created successfully: ${full_path} (${size} bytes)"
  return 0
}

# ============================================================================
#                          COMMON EXECUTOR PATTERN
# ============================================================================

# Standard executor flow used by all phase scripts.
# Each phase script defines these functions before calling run_executor:
#   - check_preconditions()  : Verify inputs exist
#   - execute_phase()        : Build prompt and run Claude
#   - validate_output()      : Verify expected outputs
#
# Usage: run_executor
run_executor() {
  # Validate that required functions are defined by the sourcing script
  for fn in check_preconditions execute_phase validate_output; do
    if ! declare -f "$fn" > /dev/null 2>&1; then
      log_error "Phase executor must define function: ${fn}"
      exit 1
    fi
  done

  # Validate required variables
  for var in PHASE_NAME PHASE_NUM; do
    if [[ -z "${!var:-}" ]]; then
      log_error "Phase executor must set variable: ${var}"
      exit 1
    fi
  done

  local phase_id="phase-${PHASE_NUM}"

  log_phase "${PHASE_NAME}" "${PHASE_NUM}"

  # Step 1: Initialize state
  init_state

  # Step 2: Check preconditions
  log_info "Checking preconditions..."
  if ! check_preconditions; then
    record_phase_failure "$phase_id" "Preconditions not met"
    log_error "Preconditions failed for ${PHASE_NAME}. Aborting."
    exit 1
  fi
  log_success "Preconditions met"

  # Step 3: Record phase start
  record_phase_start "$phase_id" "$PHASE_NAME"

  # Step 4: Execute phase
  log_info "Executing phase..."
  local phase_output=""
  if ! phase_output=$(execute_phase); then
    record_phase_failure "$phase_id" "Execution failed"
    log_error "Phase execution failed for ${PHASE_NAME}"
    exit 1
  fi

  # Step 5: Check for completion signal
  if check_phase_failed "$phase_output"; then
    record_phase_failure "$phase_id" "Claude reported PHASE_FAILED"
    log_error "Claude reported failure for ${PHASE_NAME}"
    exit 1
  fi

  if ! check_phase_complete "$phase_output"; then
    log_warn "No PHASE_COMPLETE signal detected. Proceeding with validation anyway..."
  fi

  # Step 6: Validate output
  log_info "Validating output..."
  if ! validate_output; then
    record_phase_failure "$phase_id" "Output validation failed"
    log_error "Output validation failed for ${PHASE_NAME}"
    exit 1
  fi
  log_success "Output validation passed"

  # Step 7: Record phase completion
  record_phase_complete "$phase_id"

  # Step 8: Record any learnings from the output (if the phase wants to)
  if declare -f extract_learnings > /dev/null 2>&1; then
    local learnings
    learnings=$(extract_learnings "$phase_output")
    if [[ -n "$learnings" ]]; then
      record_learnings "$phase_id" "$learnings"
    fi
  fi

  log_success "Phase ${PHASE_NUM} (${PHASE_NAME}) completed successfully!"
  echo ""
}

# ============================================================================
#                          DEPENDENCY CHECKS
# ============================================================================

# Verify that required external tools are available
# Usage: check_dependencies "jq" "claude" "git"
check_dependencies() {
  local missing=()

  for cmd in "$@"; do
    if ! command -v "$cmd" &> /dev/null; then
      missing+=("$cmd")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    log_error "Missing required tools: ${missing[*]}"
    log_error "Please install them before running the autonomous runner."
    return 1
  fi

  return 0
}

# ============================================================================
#                          GIT HELPERS
# ============================================================================

# Check if git is initialized in the project root
check_git_initialized() {
  if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
    log_warn "Git not initialized in project root: ${PROJECT_ROOT}"
    return 1
  fi
  return 0
}

# Create a git commit with a standardized message
# Usage: git_commit "feat: implement Story 1.1"
git_commit() {
  local message="$1"

  if ! check_git_initialized; then
    log_warn "Skipping git commit (git not initialized)"
    return 0
  fi

  cd "$PROJECT_ROOT" || return 1

  # Stage all changes
  git add -A

  # Check if there is anything to commit
  if git diff --cached --quiet; then
    log_info "No changes to commit"
    return 0
  fi

  git commit -m "$message"
  log_success "Committed: ${message}"
}

log_debug "common.sh loaded from ${SCRIPT_DIR}"
log_debug "PROJECT_ROOT: ${PROJECT_ROOT}"
