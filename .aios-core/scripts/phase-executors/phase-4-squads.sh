#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 4: Squad Creation
#
# Creates domain-specific squads with agents, tasks, and workflows
# based on the PRD entities and requirements.
#
# Supports two modes via SQUAD_MODE env var:
#   premium (default) - @squad-chief YOLO with 6-phase workflow, mind cloning
#   core              - @squad-creator with simple template
#
# Precondition: docs/prd.md must exist
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

# Select template based on squad mode (default: premium)
SQUAD_MODE="${SQUAD_MODE:-premium}"
if [[ "$SQUAD_MODE" == "premium" ]]; then
  PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-4-squads-premium.md"
  log_info "Squad mode: premium (@squad-chief YOLO)"
else
  PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-4-squads.md"
  log_info "Squad mode: core (@squad-creator)"
fi

# Pre-existing squads to exclude from new squad validation
PREEXISTING_SQUADS="squad-creator|conselho|process-excellence"

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

  # Premium mode: verify the squad-creator premium infrastructure
  if [[ "$SQUAD_MODE" == "premium" ]]; then
    local sc_dir="${PROJECT_ROOT}/squads/squad-creator"
    check_dir_exists "$sc_dir" "squad-creator premium squad" || return 1
    check_file_exists "${sc_dir}/agents/squad-chief.md" "squad-chief agent" || return 1
    check_file_exists "${sc_dir}/workflows/wf-create-squad.yaml" "wf-create-squad workflow" || return 1
    check_file_exists "${sc_dir}/config/quality-gates.yaml" "quality-gates config" || return 1
    check_file_exists "${sc_dir}/config/heuristics.yaml" "heuristics config" || return 1
    log_success "Premium squad-creator infrastructure validated"
  fi

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

  # Look for new squad subdirectories with structure
  local new_squads=0
  for squad_dir in "${squads_dir}"/*/; do
    if [[ -d "$squad_dir" ]]; then
      local squad_name
      squad_name="$(basename "$squad_dir")"

      # Skip pre-existing squads
      if echo "$squad_name" | grep -qE "^(${PREEXISTING_SQUADS})$"; then
        continue
      fi

      new_squads=$((new_squads + 1))

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

      # Premium mode: enhanced validation (warnings, not hard failures)
      if [[ "$SQUAD_MODE" == "premium" ]]; then
        # Check agents/ with at least 2 agents
        if [[ -d "${squad_dir}agents" ]]; then
          local agent_count
          agent_count=$(ls -1 "${squad_dir}agents/"*.md 2>/dev/null | wc -l)
          if [[ "$agent_count" -ge 2 ]]; then
            log_success "  Agents: ${agent_count} (meets minimum of 2)"
          else
            log_warn "  Agents: ${agent_count} (premium expects minimum 2)"
          fi
        else
          log_warn "  Agents directory missing"
        fi

        # Check tasks/ directory
        if [[ -d "${squad_dir}tasks" ]]; then
          log_success "  Tasks directory present"
        else
          log_warn "  Tasks directory missing (expected for premium)"
        fi

        # Check workflows/ directory
        if [[ -d "${squad_dir}workflows" ]]; then
          log_success "  Workflows directory present"
        else
          log_warn "  Workflows directory missing (expected for premium)"
        fi
      fi
    fi
  done

  if [[ "$new_squads" -eq 0 ]]; then
    log_error "No new squad subdirectories found in squads/"
    return 1
  fi

  log_info "Total new squads created: ${new_squads}"
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
    squad_names=$(ls -d "${squads_dir}"/*/ 2>/dev/null | xargs -I{} basename {} | grep -vE "^(${PREEXISTING_SQUADS})$" | tr '\n' ', ')
    if [[ -n "$squad_names" ]]; then
      echo "Squads created (mode: ${SQUAD_MODE}): ${squad_names%, }. Each squad has domain-specific agents and workflows."
    fi
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
