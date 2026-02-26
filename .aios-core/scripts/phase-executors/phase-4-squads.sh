#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 4: Squad Creation (YOLO Mode)
#
# Creates domain-specific squads with agents, tasks, and workflows
# based on the PRD entities and requirements.
#
# Precondition: docs/prd.md must exist
# Template:     .aios-core/templates/phase-prompts/phase-4-squads.md
# Output:       squads/ directory with content
#
# Usage: ./phase-4-squads.sh
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

PHASE_NAME="Squad Creation"
PHASE_NUM="4"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-4-squads.md"

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify the PRD exists (produced by phase 2)
  check_file_exists "${DOCS_DIR}/prd.md" "PRD document" || return 1

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-4 prompt template" || return 1

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
  local squads_dir="${PROJECT_ROOT}/squads"

  # Verify squads/ directory exists
  check_dir_exists "$squads_dir" "squads directory" || return 1

  # Verify squads/ directory has content
  check_dir_has_content "$squads_dir" "squads directory" || return 1

  # Look for at least one squad subdirectory with structure
  local squad_count=0
  for squad_dir in "${squads_dir}"/*/; do
    if [[ -d "$squad_dir" ]]; then
      squad_count=$((squad_count + 1))
      local squad_name
      squad_name="$(basename "$squad_dir")"

      # Check for expected squad structure files
      local has_structure=false
      if [[ -f "${squad_dir}config.yaml" ]] || [[ -f "${squad_dir}config.yml" ]]; then
        has_structure=true
      fi
      if [[ -f "${squad_dir}README.md" ]]; then
        has_structure=true
      fi
      if [[ -d "${squad_dir}agents" ]]; then
        has_structure=true
      fi

      if [[ "$has_structure" == "true" ]]; then
        log_success "Squad found with structure: ${squad_name}"
      else
        log_warn "Squad directory exists but may lack structure: ${squad_name}"
      fi
    fi
  done

  if [[ "$squad_count" -eq 0 ]]; then
    log_error "No squad subdirectories found in squads/"
    return 1
  fi

  log_info "Total squads found: ${squad_count}"
  return 0
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"

  local squads_dir="${PROJECT_ROOT}/squads"
  if [[ -d "$squads_dir" ]]; then
    local squad_names
    squad_names=$(ls -d "${squads_dir}"/*/ 2>/dev/null | xargs -I{} basename {} | tr '\n' ', ')
    if [[ -n "$squad_names" ]]; then
      echo "Squads created: ${squad_names%. }. Each squad has domain-specific agents and workflows."
    fi
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
