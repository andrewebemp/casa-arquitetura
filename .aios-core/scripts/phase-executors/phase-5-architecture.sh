#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 5: System Architecture
#
# Generates system architecture documentation based on the PRD.
#
# Precondition: docs/prd.md must exist
# Template:     .aios-core/templates/phase-prompts/phase-5-architecture.md
# Output:       docs/architecture.md
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
  # Verify docs/architecture.md was created and has content
  validate_file_created "docs/architecture.md" "architecture document" || return 1

  # Additional content checks
  local arch_path="${PROJECT_ROOT}/docs/architecture.md"
  local line_count
  line_count=$(wc -l < "$arch_path" | tr -d ' ')

  if [[ "$line_count" -lt 20 ]]; then
    log_warn "Architecture document seems too short (${line_count} lines). Expected comprehensive coverage."
  fi

  # Check for key sections that a good architecture document should have
  local expected_sections=("Technology Stack" "API" "Security" "Infrastructure")
  for section in "${expected_sections[@]}"; do
    if grep -qi "$section" "$arch_path" 2>/dev/null; then
      log_debug "Found section: ${section}"
    else
      log_warn "Expected section not found in architecture doc: ${section}"
    fi
  done

  log_info "Architecture document has ${line_count} lines"
  return 0
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"

  local arch_path="${PROJECT_ROOT}/docs/architecture.md"
  if [[ -f "$arch_path" ]]; then
    # Extract tech stack mentions as learnings for future phases
    local tech_mentions
    tech_mentions=$(grep -i "stack\|framework\|database\|frontend\|backend" "$arch_path" 2>/dev/null | head -5 | tr '\n' '; ')
    if [[ -n "$tech_mentions" ]]; then
      echo "Architecture defines: ${tech_mentions}"
    fi
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
