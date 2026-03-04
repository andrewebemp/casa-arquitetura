#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 2: PRD Creation
#
# Generates a Product Requirements Document (PRD) from the project brief.
#
# Precondition: docs/project-brief.md must exist
# Template:     .aios-core/templates/phase-prompts/phase-2-prd.md
# Output:       docs/prd.md
#
# Usage: ./phase-2-prd.sh
#
# Author: AIOS Autonomous Runner
# ============================================================================

set -euo pipefail

# ============================================================================
#                          SETUP
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

# ============================================================================
#                          PHASE CONFIGURATION
# ============================================================================

PHASE_NAME="PRD Creation"
PHASE_NUM="2"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-2-prd.md"

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify the project brief exists
  check_file_exists "${DOCS_DIR}/project-brief.md" "project brief" || return 1

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-2 prompt template" || return 1

  # Verify Claude CLI is available
  check_dependencies "${CLAUDE_CMD}" || return 1

  return 0
}

# ============================================================================
#                          EXECUTION
# ============================================================================

execute_phase() {
  # Build prompt from template with learnings substitution
  local prompt
  prompt=$(build_prompt "$PROMPT_TEMPLATE") || return 1

  # Execute Claude with the prompt
  local output
  output=$(run_claude "$prompt") || return 1

  echo "$output"
}

# ============================================================================
#                          VALIDATION
# ============================================================================

validate_output() {
  # Verify docs/prd.md was created and has content
  validate_file_created "docs/prd.md" "PRD document" || return 1

  # --- Squad Integration Hooks ---

  # Conselho Gate: Validate PRD scope (FULL mode - irreversible decisions)
  if [[ "$CONSELHO_GATES" == "true" ]]; then
    if ! run_conselho_gate \
      "O escopo definido no PRD (docs/prd.md) é viável, completo e alinhado com o brief?" \
      "full"; then
      log_warn "Conselho inconclusivo para PRD. Registrado nos learnings."
    fi
  fi

  # Process Excellence: Validate epic decomposability
  if [[ "$PROCESS_EXCELLENCE" == "true" ]]; then
    run_process_excellence "decompositor-de-tarefas" \
      "Analise os épicos definidos em docs/prd.md e valide que cada um é decomponível em stories independentes e testáveis." || true
  fi

  # Additional content checks
  local prd_path="${PROJECT_ROOT}/docs/prd.md"
  local line_count
  line_count=$(wc -l < "$prd_path" | tr -d ' ')

  if [[ "$line_count" -lt 10 ]]; then
    log_warn "PRD seems too short (${line_count} lines). Expected a comprehensive document."
  fi

  log_info "PRD has ${line_count} lines"
  return 0
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

# Optional: extract learnings from Claude's output for future phases
extract_learnings() {
  local output="$1"

  # Extract any notes about the project that might help future phases
  # Look for sections that mention key decisions or observations
  local prd_path="${PROJECT_ROOT}/docs/prd.md"
  if [[ -f "$prd_path" ]]; then
    # Count requirements as a learning metric
    local fr_count
    fr_count=$(grep -c "^FR-" "$prd_path" 2>/dev/null || echo "0")
    local nfr_count
    nfr_count=$(grep -c "^NFR-" "$prd_path" 2>/dev/null || echo "0")
    local epic_count
    epic_count=$(grep -c "^## Epic" "$prd_path" 2>/dev/null || echo "0")

    echo "PRD generated with ${fr_count} functional requirements, ${nfr_count} non-functional requirements, and ${epic_count} epics."
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
