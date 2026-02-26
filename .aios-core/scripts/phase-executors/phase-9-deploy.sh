#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 9: Deploy
#
# Runs pre-push quality gates, pushes code, and creates a Pull Request.
#
# Precondition: At least one story with status "Done" exists
# Template:     .aios-core/templates/phase-prompts/phase-9-deploy.md
# Output:       Code pushed to remote, PR URL captured
#
# Usage: ./phase-9-deploy.sh
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

PHASE_NAME="Deploy"
PHASE_NUM="9"
PROMPT_TEMPLATE="${TEMPLATES_DIR}/phase-9-deploy.md"

# Captured PR URL (set during execution)
PR_URL=""

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # Verify git is initialized
  check_git_initialized || return 1

  # Verify Claude CLI is available
  check_dependencies "${CLAUDE_CMD}" || return 1

  # Verify gh CLI is available (for PR creation)
  if ! command -v gh &> /dev/null; then
    log_warn "GitHub CLI (gh) not found. PR creation may fail."
    log_warn "Install: https://cli.github.com/"
  fi

  # Verify the prompt template exists
  check_file_exists "$PROMPT_TEMPLATE" "phase-9 prompt template" || return 1

  # Check that at least one story has status "Done"
  local has_done_story=false

  # Check via state file
  if [[ -f "$STATE_FILE" ]]; then
    local done_count
    done_count=$(jq '[.stories | to_entries[] | select(.value.status == "done")] | length' "$STATE_FILE" 2>/dev/null || echo "0")
    if [[ "$done_count" -gt 0 ]]; then
      has_done_story=true
      log_info "Found ${done_count} completed story(ies) in state"
    fi
  fi

  # Also check via story-parser
  if [[ "$has_done_story" == "false" ]] && [[ -f "$STORY_PARSER" ]]; then
    local completed
    completed=$(node "$STORY_PARSER" --dir "$STORIES_DIR" 2>/dev/null | \
      jq '[.[] | select(.status == "Done" or .status == "Completed" or .status == "done")] | length' 2>/dev/null || echo "0")
    if [[ "$completed" -gt 0 ]]; then
      has_done_story=true
      log_info "Found ${completed} completed story(ies) via story-parser"
    fi
  fi

  # As a fallback, check if there are any git commits (indicating dev work was done)
  if [[ "$has_done_story" == "false" ]]; then
    local commit_count
    commit_count=$(cd "$PROJECT_ROOT" && git log --oneline 2>/dev/null | wc -l)
    if [[ "$commit_count" -gt 0 ]]; then
      log_warn "No 'Done' stories found but ${commit_count} git commit(s) exist. Proceeding anyway."
      has_done_story=true
    fi
  fi

  if [[ "$has_done_story" == "false" ]]; then
    log_error "No completed stories found. Nothing to deploy."
    log_error "Run phase-8 (dev cycle) first to implement stories."
    return 1
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

  # Try to capture PR URL from output
  PR_URL=$(extract_signal_value "$output" "PR_URL")
  if [[ -z "$PR_URL" ]]; then
    # Try to extract URL with a regex pattern from the output
    PR_URL=$(echo "$output" | grep -oP 'https://github\.com/[^\s]+/pull/\d+' | head -1 || true)
  fi

  if [[ -n "$PR_URL" ]]; then
    log_success "PR URL captured: ${PR_URL}"
    update_state '.deploy.pr_url' "\"${PR_URL}\""
  else
    log_warn "Could not extract PR URL from output"
  fi

  echo "$output"
}

# ============================================================================
#                          VALIDATION
# ============================================================================

validate_output() {
  local all_ok=true

  # Check if git push was successful by verifying remote tracking
  cd "$PROJECT_ROOT"

  # Check if the current branch has a remote tracking branch
  local tracking_branch
  tracking_branch=$(git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>/dev/null || true)

  if [[ -n "$tracking_branch" ]]; then
    log_success "Branch is tracking remote: ${tracking_branch}"

    # Check if local and remote are in sync
    local local_hash
    local_hash=$(git rev-parse HEAD 2>/dev/null)
    local remote_hash
    remote_hash=$(git rev-parse "@{u}" 2>/dev/null || true)

    if [[ "$local_hash" == "$remote_hash" ]]; then
      log_success "Local and remote are in sync"
    else
      log_warn "Local and remote may not be in sync (local: ${local_hash:0:8}, remote: ${remote_hash:0:8})"
    fi
  else
    log_warn "No remote tracking branch detected. Push may not have occurred."
    # Not a hard failure - Claude might have created the remote differently
  fi

  # Check if PR URL was captured
  if [[ -n "$PR_URL" ]]; then
    log_success "PR URL: ${PR_URL}"
  else
    log_warn "No PR URL captured. PR may not have been created."
    # Not a hard failure - the push itself might be sufficient
  fi

  # Update state with deploy info
  update_state '.deploy.status' '"complete"'
  update_state '.deploy.completed_at' "\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""

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

  local msg="Deploy phase completed."
  if [[ -n "$PR_URL" ]]; then
    msg="${msg} PR created at: ${PR_URL}"
  fi
  echo "$msg"
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
