#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 5: System Architecture
#
# Generates fullstack system architecture documentation based on PRD,
# UX/UI spec, front-end spec, and squad DecorAI agent definitions.
#
# Preconditions:
#   - docs/prd.md must exist
#   - docs/architecture/ux-ui-spec.md (recommended)
#   - docs/front-end-spec.md (recommended)
#   - squads/decorai/ (recommended for agent integration)
#
# Template:     .aios-core/templates/phase-prompts/phase-5-architecture.md
# Output:       docs/architecture/fullstack-architecture.md
#
# Usage: ./phase-5-architecture.sh
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

PHASE_NAME="System Architecture"
PHASE_NUM="5"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-5-architecture.md"

# Output path (updated to architecture/ subdirectory)
ARCH_OUTPUT_DIR="${DOCS_DIR}/architecture"
ARCH_OUTPUT_FILE="${ARCH_OUTPUT_DIR}/fullstack-architecture.md"

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify the PRD exists (produced by phase 2)
  check_file_exists "${DOCS_DIR}/prd.md" "PRD document" || return 1

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-5 prompt template" || return 1

  # Verify Claude CLI is available
  check_dependencies "${CLAUDE_CMD}" || return 1

  # Recommended inputs (warn if missing, don't block)
  if [[ ! -f "${ARCH_OUTPUT_DIR}/ux-ui-spec.md" ]]; then
    log_warn "UX/UI spec not found at docs/architecture/ux-ui-spec.md — architecture may be incomplete"
  fi

  if [[ ! -f "${DOCS_DIR}/front-end-spec.md" ]]; then
    log_warn "Front-end spec not found at docs/front-end-spec.md — frontend architecture may be incomplete"
  fi

  if [[ ! -d "${PROJECT_ROOT}/squads/decorai" ]]; then
    log_warn "Squad DecorAI not found at squads/decorai/ — agent integration will be skipped"
  else
    log_info "Squad DecorAI found — agents will be integrated into architecture"
  fi

  # Ensure output directory exists
  mkdir -p "$ARCH_OUTPUT_DIR"

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
  # Verify fullstack-architecture.md was created
  # Check both new and legacy paths
  if [[ -f "$ARCH_OUTPUT_FILE" ]]; then
    local arch_path="$ARCH_OUTPUT_FILE"
  elif [[ -f "${PROJECT_ROOT}/docs/architecture.md" ]]; then
    # Legacy path — move to new location
    log_warn "Architecture doc found at legacy path docs/architecture.md — moving to docs/architecture/"
    mkdir -p "$ARCH_OUTPUT_DIR"
    mv "${PROJECT_ROOT}/docs/architecture.md" "$ARCH_OUTPUT_FILE"
    local arch_path="$ARCH_OUTPUT_FILE"
  else
    log_error "Architecture document not found at ${ARCH_OUTPUT_FILE} or docs/architecture.md"
    return 1
  fi

  # --- Squad Integration Hooks ---

  # Conselho Gate: Architecture decisions (FULL mode - irreversible)
  if [[ "$CONSELHO_GATES" == "true" ]]; then
    if ! run_conselho_gate \
      "As decisões arquiteturais em ${arch_path} são sólidas? Avalie stack, padrões, trade-offs e integração com squad DecorAI." \
      "full"; then
      log_warn "Conselho inconclusivo para arquitetura. Revisão humana recomendada."
    fi
  fi

  # Process Excellence: Analyze data flow for bottlenecks
  if [[ "$PROCESS_EXCELLENCE" == "true" ]]; then
    run_process_excellence "otimizador-de-processos" \
      "Analise o fluxo de dados proposto em ${arch_path}. Identifique gargalos potenciais usando Theory of Constraints. Considere o pipeline DecorAI: spatial-analyst → staging-architect → conversational-designer → visual-quality-engineer." || true
  fi

  # Additional content checks
  local line_count
  line_count=$(wc -l < "$arch_path" | tr -d ' ')

  if [[ "$line_count" -lt 50 ]]; then
    log_warn "Architecture document seems too short (${line_count} lines). Expected comprehensive fullstack coverage."
  fi

  # Check for key sections (expanded for fullstack template)
  local expected_sections=(
    "Tech Stack"
    "API"
    "Security"
    "Infrastructure"
    "Frontend"
    "Backend"
    "Data Model"
    "Testing"
    "DecorAI"
  )
  local missing_count=0
  for section in "${expected_sections[@]}"; do
    if grep -qi "$section" "$arch_path" 2>/dev/null; then
      log_debug "Found section: ${section}"
    else
      log_warn "Expected section not found in architecture doc: ${section}"
      ((missing_count++))
    fi
  done

  if [[ "$missing_count" -gt 3 ]]; then
    log_warn "Multiple sections missing (${missing_count}/${#expected_sections[@]}). Document may need regeneration."
  fi

  log_info "Architecture document has ${line_count} lines"
  return 0
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"

  if [[ -f "$ARCH_OUTPUT_FILE" ]]; then
    local arch_path="$ARCH_OUTPUT_FILE"
  elif [[ -f "${PROJECT_ROOT}/docs/architecture.md" ]]; then
    local arch_path="${PROJECT_ROOT}/docs/architecture.md"
  else
    return 0
  fi

  # Extract tech stack mentions as learnings for future phases
  local tech_mentions
  tech_mentions=$(grep -i "stack\|framework\|database\|frontend\|backend\|pipeline\|gpu" "$arch_path" 2>/dev/null | head -8 | tr '\n' '; ')
  if [[ -n "$tech_mentions" ]]; then
    echo "Architecture defines: ${tech_mentions}"
  fi

  # Extract squad DecorAI integration notes
  local squad_mentions
  squad_mentions=$(grep -i "decorai\|spatial-analyst\|staging-architect\|pipeline-optimizer" "$arch_path" 2>/dev/null | head -3 | tr '\n' '; ')
  if [[ -n "$squad_mentions" ]]; then
    echo "Squad DecorAI integration: ${squad_mentions}"
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
