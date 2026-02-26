#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 0: Bootstrap
#
# Bootstraps the project environment:
#   - Verifies git is initialized
#   - Verifies npm is available
#   - Ensures .aios/ directory exists
#   - Ensures package.json exists
#   - Creates initial state files
#
# This phase does NOT call Claude. It is a pure environment check.
#
# Usage: ./phase-0-bootstrap.sh
#
# Author: AIOS Autonomous Runner
# ============================================================================

set -euo pipefail

# ============================================================================
#                          SETUP
# ============================================================================

# Resolve script directory (works in both Linux and Git Bash)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source common functions
source "${SCRIPT_DIR}/common.sh"

# ============================================================================
#                          PHASE CONFIGURATION
# ============================================================================

PHASE_NAME="Bootstrap"
PHASE_NUM="0"
# No prompt template needed - this phase is pure environment setup

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  log_info "Verifying bootstrap prerequisites..."

  # Check that git is available as a command
  if ! command -v git &> /dev/null; then
    log_error "git is not installed or not in PATH"
    return 1
  fi
  log_success "git is available: $(git --version)"

  # Check that npm is available
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed or not in PATH"
    return 1
  fi
  log_success "npm is available: $(npm --version)"

  # Check that jq is available (needed by all subsequent phases)
  if ! command -v jq &> /dev/null; then
    log_error "jq is not installed or not in PATH"
    log_error "Install jq: https://stedolan.github.io/jq/download/"
    return 1
  fi
  log_success "jq is available: $(jq --version)"

  # Check that claude CLI is available
  if ! command -v "${CLAUDE_CMD}" &> /dev/null; then
    log_warn "Claude CLI (${CLAUDE_CMD}) not found in PATH"
    log_warn "Other phases will fail without it. Set CLAUDE_CMD if using a custom path."
  else
    log_success "Claude CLI is available: ${CLAUDE_CMD}"
  fi

  return 0
}

# ============================================================================
#                          EXECUTION
# ============================================================================

execute_phase() {
  log_info "Bootstrapping project environment..."

  # --- Git initialization ---
  if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
    log_info "Initializing git repository..."
    cd "$PROJECT_ROOT"
    git init
    log_success "Git repository initialized"
  else
    log_success "Git repository already initialized"
  fi

  # --- .aios/ directory ---
  local aios_dir="${PROJECT_ROOT}/.aios"
  if [[ ! -d "$aios_dir" ]]; then
    mkdir -p "$aios_dir"
    log_success "Created .aios/ directory"
  else
    log_success ".aios/ directory already exists"
  fi

  # --- package.json ---
  local pkg_json="${PROJECT_ROOT}/package.json"
  if [[ ! -f "$pkg_json" ]]; then
    log_info "Initializing package.json..."
    cd "$PROJECT_ROOT"
    npm init -y > /dev/null 2>&1
    log_success "package.json created"
  else
    log_success "package.json already exists"
  fi

  # --- plan/ directory ---
  if [[ ! -d "$PLAN_DIR" ]]; then
    mkdir -p "$PLAN_DIR"
    log_success "Created plan/ directory"
  else
    log_success "plan/ directory already exists"
  fi

  # --- docs/ directory ---
  if [[ ! -d "$DOCS_DIR" ]]; then
    mkdir -p "$DOCS_DIR"
    log_success "Created docs/ directory"
  else
    log_success "docs/ directory already exists"
  fi

  # --- stories/ directory ---
  if [[ ! -d "$STORIES_DIR" ]]; then
    mkdir -p "$STORIES_DIR"
    log_success "Created docs/stories/ directory"
  else
    log_success "docs/stories/ directory already exists"
  fi

  # --- State files ---
  init_state
  init_learnings

  # --- Node.js version check ---
  local node_version
  node_version="$(node --version 2>/dev/null || echo "not found")"
  log_info "Node.js version: ${node_version}"

  # Emit PHASE_COMPLETE for the standard executor flow
  echo "PHASE_COMPLETE"
}

# ============================================================================
#                          VALIDATION
# ============================================================================

validate_output() {
  local all_ok=true

  # Check .git directory
  if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
    log_error ".git directory not found"
    all_ok=false
  fi

  # Check .aios directory
  if [[ ! -d "${PROJECT_ROOT}/.aios" ]]; then
    log_error ".aios/ directory not found"
    all_ok=false
  fi

  # Check package.json
  if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
    log_error "package.json not found"
    all_ok=false
  fi

  # Check plan directory
  if [[ ! -d "$PLAN_DIR" ]]; then
    log_error "plan/ directory not found"
    all_ok=false
  fi

  # Check state file
  if [[ ! -f "$STATE_FILE" ]]; then
    log_error "autonomous-state.json not found"
    all_ok=false
  fi

  # Check learnings file
  if [[ ! -f "$LEARNINGS_FILE" ]]; then
    log_error "autonomous-learnings.md not found"
    all_ok=false
  fi

  if [[ "$all_ok" == "true" ]]; then
    return 0
  else
    return 1
  fi
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
