#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 6: Data Modeling
#
# Generates database schema, migrations, and security policies
# based on the system architecture.
#
# Precondition: docs/architecture.md must exist
# Template:     .aios-core/templates/phase-prompts/phase-6-data.md
# Output:       Schema files (SQL, Prisma, Drizzle, etc.)
#
# Usage: ./phase-6-data.sh
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

PHASE_NAME="Data Modeling"
PHASE_NUM="6"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-6-data.md"

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify the architecture document exists (produced by phase 5)
  check_file_exists "${DOCS_DIR}/architecture.md" "architecture document" || return 1

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-6 prompt template" || return 1

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
  # Schema files can be in many formats. Check common locations.
  local schema_found=false

  # Common schema file locations and patterns
  local schema_candidates=(
    # SQL migrations
    "supabase/migrations"
    "migrations"
    "db/migrations"
    "sql"
    # ORM schema files
    "prisma"
    "drizzle"
    "src/db"
    "src/database"
    "database"
    # Documentation-based data model
    "docs/data-model.md"
    "docs/database.md"
    "docs/schema.md"
    "docs/data"
  )

  for candidate in "${schema_candidates[@]}"; do
    local full_path="${PROJECT_ROOT}/${candidate}"

    # Check if it is a file
    if [[ -f "$full_path" ]]; then
      local size
      size=$(wc -c < "$full_path" | tr -d ' ')
      if [[ "$size" -gt 0 ]]; then
        log_success "Schema artifact found: ${candidate} (${size} bytes)"
        schema_found=true
      fi
    fi

    # Check if it is a directory with content
    if [[ -d "$full_path" ]]; then
      local file_count
      file_count=$(ls -A "$full_path" 2>/dev/null | wc -l)
      if [[ "$file_count" -gt 0 ]]; then
        log_success "Schema directory found: ${candidate} (${file_count} files)"
        schema_found=true
      fi
    fi
  done

  # Also look for common schema file extensions anywhere in the project
  if [[ "$schema_found" == "false" ]]; then
    local schema_files
    schema_files=$(find "$PROJECT_ROOT" \
      \( -name "*.prisma" -o -name "schema.ts" -o -name "schema.js" \
         -o -name "*.sql" -o -name "drizzle.config.*" \) \
      -not -path "*/node_modules/*" \
      -not -path "*/.git/*" \
      2>/dev/null | head -10)

    if [[ -n "$schema_files" ]]; then
      log_success "Schema files found in project:"
      echo "$schema_files" | while read -r f; do
        log_info "  - ${f#${PROJECT_ROOT}/}"
      done
      schema_found=true
    fi
  fi

  if [[ "$schema_found" == "false" ]]; then
    log_error "No schema files or data model artifacts found"
    log_error "Expected schema files (SQL, Prisma, Drizzle) or docs/data-model.md"
    return 1
  fi

  return 0
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"

  # Count schema artifacts created
  local sql_count
  sql_count=$(find "$PROJECT_ROOT" -name "*.sql" -not -path "*/node_modules/*" 2>/dev/null | wc -l)
  local prisma_exists="no"
  if [[ -f "${PROJECT_ROOT}/prisma/schema.prisma" ]]; then
    prisma_exists="yes"
  fi

  echo "Data modeling produced ${sql_count} SQL file(s). Prisma schema: ${prisma_exists}."
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
