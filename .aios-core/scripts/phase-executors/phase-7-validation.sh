#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 7: Validation and Document Sharding
#
# Validates all project artifacts and shards large documents into
# consumable pieces for the development phase.
#
# Preconditions: docs/prd.md AND docs/architecture.md must exist
# Template:      .aios-core/templates/phase-prompts/phase-7-validation.md
# Output:        docs/prd/ directory, docs/framework/ files
#
# Usage: ./phase-7-validation.sh
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

PHASE_NAME="Validation and Sharding"
PHASE_NUM="7"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-7-validation.md"

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify the PRD exists (produced by phase 2)
  check_file_exists "${DOCS_DIR}/prd.md" "PRD document" || return 1

  # Verify the architecture document exists (produced by phase 5)
  check_file_exists "${DOCS_DIR}/architecture.md" "architecture document" || return 1

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-7 prompt template" || return 1

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
  local all_ok=true

  # --- Check docs/prd/ directory (sharded PRD) ---
  local prd_dir="${PROJECT_ROOT}/docs/prd"
  if [[ -d "$prd_dir" ]]; then
    local epic_count
    epic_count=$(ls -1 "${prd_dir}"/*.md 2>/dev/null | wc -l)
    if [[ "$epic_count" -gt 0 ]]; then
      log_success "Sharded PRD directory found with ${epic_count} epic file(s)"
    else
      log_warn "docs/prd/ directory exists but contains no .md files"
      all_ok=false
    fi
  else
    log_error "docs/prd/ directory not found (expected sharded PRD epics)"
    all_ok=false
  fi

  # --- Check docs/framework/ files ---
  local framework_dir="${PROJECT_ROOT}/docs/framework"
  local expected_framework_files=(
    "source-tree.md"
    "tech-stack.md"
    "coding-standards.md"
  )

  if [[ -d "$framework_dir" ]]; then
    log_success "docs/framework/ directory exists"

    for file in "${expected_framework_files[@]}"; do
      local full_path="${framework_dir}/${file}"
      if [[ -f "$full_path" ]]; then
        local size
        size=$(wc -c < "$full_path" | tr -d ' ')
        if [[ "$size" -gt 0 ]]; then
          log_success "Framework file found: ${file} (${size} bytes)"
        else
          log_warn "Framework file is empty: ${file}"
        fi
      else
        log_warn "Expected framework file not found: ${file}"
        # Not a hard failure - Claude might have named them differently
      fi
    done
  else
    log_error "docs/framework/ directory not found"
    all_ok=false
  fi

  # --- Check docs/architecture/ (sharded architecture, optional) ---
  local arch_dir="${PROJECT_ROOT}/docs/architecture"
  if [[ -d "$arch_dir" ]]; then
    local arch_file_count
    arch_file_count=$(ls -1 "${arch_dir}"/*.md 2>/dev/null | wc -l)
    if [[ "$arch_file_count" -gt 0 ]]; then
      log_success "Sharded architecture directory found with ${arch_file_count} file(s)"
    fi
  else
    log_info "docs/architecture/ directory not found (sharded architecture is optional)"
  fi

  if [[ "$all_ok" == "true" ]]; then
    return 0
  else
    return 1
  fi
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"

  local prd_dir="${PROJECT_ROOT}/docs/prd"
  local framework_dir="${PROJECT_ROOT}/docs/framework"

  local epic_count=0
  if [[ -d "$prd_dir" ]]; then
    epic_count=$(ls -1 "${prd_dir}"/*.md 2>/dev/null | wc -l)
  fi

  local framework_count=0
  if [[ -d "$framework_dir" ]]; then
    framework_count=$(ls -1 "${framework_dir}"/*.md 2>/dev/null | wc -l)
  fi

  echo "Validation phase sharded PRD into ${epic_count} epic files and generated ${framework_count} framework guide files."
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
