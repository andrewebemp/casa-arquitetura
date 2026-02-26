#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 3: UX/UI Specification
#
# Generates UX/UI specification based on the PRD and project brief.
#
# Precondition: docs/prd.md must exist
# Template:     .aios-core/templates/phase-prompts/phase-3-ux.md
# Output:       docs/ux-spec.md (or similar UX specification file)
#
# Usage: ./phase-3-ux.sh
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

PHASE_NAME="UX/UI Specification"
PHASE_NUM="3"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-3-ux.md"

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify the PRD exists (produced by phase 2)
  check_file_exists "${DOCS_DIR}/prd.md" "PRD document" || return 1

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-3 prompt template" || return 1

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
  # The UX spec could be saved under various names depending on Claude's output.
  # Check the most common locations.
  local ux_found=false

  # Check common UX spec file locations
  local ux_candidates=(
    "docs/ux-spec.md"
    "docs/ux-specification.md"
    "docs/frontend-spec.md"
    "docs/ui-spec.md"
    "docs/design-system.md"
  )

  for candidate in "${ux_candidates[@]}"; do
    local full_path="${PROJECT_ROOT}/${candidate}"
    if [[ -f "$full_path" ]]; then
      local size
      size=$(wc -c < "$full_path" | tr -d ' ')
      if [[ "$size" -gt 0 ]]; then
        log_success "UX specification found: ${candidate} (${size} bytes)"
        ux_found=true
        break
      fi
    fi
  done

  # Also check if any new .md file was created in docs/ that might be the UX spec
  if [[ "$ux_found" == "false" ]]; then
    # Look for any recently created markdown files in docs/
    local new_files
    new_files=$(find "${DOCS_DIR}" -maxdepth 1 -name "*.md" -newer "${DOCS_DIR}/prd.md" 2>/dev/null || true)
    if [[ -n "$new_files" ]]; then
      log_success "New documentation files detected (likely UX spec):"
      echo "$new_files" | while read -r f; do
        log_info "  - $(basename "$f")"
      done
      ux_found=true
    fi
  fi

  if [[ "$ux_found" == "false" ]]; then
    log_error "No UX specification file found in docs/"
    log_error "Expected one of: ${ux_candidates[*]}"
    return 1
  fi

  return 0
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"

  # Summarize what the UX phase produced
  local ux_files
  ux_files=$(find "${DOCS_DIR}" -maxdepth 1 -name "*ux*" -o -name "*ui*" -o -name "*design*" -o -name "*frontend*" 2>/dev/null | head -5)
  if [[ -n "$ux_files" ]]; then
    echo "UX specification files created: $(echo "$ux_files" | wc -l | tr -d ' ') file(s)."
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
