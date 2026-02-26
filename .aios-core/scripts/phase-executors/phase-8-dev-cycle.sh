#!/bin/bash
# ============================================================================
# AIOS Autonomous Runner - Phase 8: Development Cycle (Ralph-Style Loop)
#
# This is the SPECIAL phase executor that implements the iterative
# development loop:
#
#   1. If no pending stories exist, run story creation
#   2. For each pending story:
#      a. Run dev implementation
#      b. Run QA review
#      c. If QA PASS: mark story done, commit
#      d. If QA FAIL: retry dev with QA feedback (up to max-retries)
#   3. Record learnings after each story
#
# Uses story-parser.js to discover and parse stories.
#
# Precondition: docs/stories/ has content OR docs/prd/ has sharded epics
# Templates:
#   - .aios-core/templates/phase-prompts/phase-8-story-creation.md
#   - .aios-core/templates/phase-prompts/phase-8-dev.md
#   - .aios-core/templates/phase-prompts/phase-8-qa.md
#
# Usage: ./phase-8-dev-cycle.sh
#
# Environment Variables:
#   AIOS_MAX_RETRIES   - Max dev/QA retry cycles per story (default: 3)
#   AIOS_MAX_STORIES   - Max stories to process in one run (default: 50)
#   AIOS_STOP_ON_FAIL  - Stop entirely on unrecoverable failure (default: false)
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

PHASE_NAME="Development Cycle"
PHASE_NUM="8"

# Templates for the three sub-phases
TEMPLATE_STORY_CREATION="${TEMPLATES_DIR}/phase-8-story-creation.md"
TEMPLATE_DEV="${TEMPLATES_DIR}/phase-8-dev.md"
TEMPLATE_QA="${TEMPLATES_DIR}/phase-8-qa.md"

# Story parser utility
STORY_PARSER="${AIOS_CORE_DIR}/core/execution/story-parser.js"

# Configurable limits
MAX_RETRIES="${AIOS_MAX_RETRIES:-3}"
MAX_STORIES="${AIOS_MAX_STORIES:-50}"
STOP_ON_FAIL="${AIOS_STOP_ON_FAIL:-false}"

# Counters for the run
STORIES_COMPLETED=0
STORIES_FAILED=0
QA_PASSES=0
QA_FAILURES=0
TOTAL_RETRIES=0

# ============================================================================
#                          PRECONDITIONS
# ============================================================================

check_preconditions() {
  # We need either existing stories OR sharded PRD epics to create stories from
  local has_stories=false
  local has_epics=false

  # Check for existing stories
  if [[ -d "$STORIES_DIR" ]]; then
    local story_count
    story_count=$(find "$STORIES_DIR" -name "*.md" 2>/dev/null | wc -l)
    if [[ "$story_count" -gt 0 ]]; then
      has_stories=true
      log_info "Found ${story_count} story file(s) in docs/stories/"
    fi
  fi

  # Check for sharded PRD epics
  local prd_dir="${PROJECT_ROOT}/docs/prd"
  if [[ -d "$prd_dir" ]]; then
    local epic_count
    epic_count=$(ls -1 "${prd_dir}"/*.md 2>/dev/null | wc -l)
    if [[ "$epic_count" -gt 0 ]]; then
      has_epics=true
      log_info "Found ${epic_count} sharded epic(s) in docs/prd/"
    fi
  fi

  # Also accept the monolithic PRD for story creation
  if [[ -f "${DOCS_DIR}/prd.md" ]]; then
    has_epics=true
    log_info "Found monolithic PRD at docs/prd.md"
  fi

  if [[ "$has_stories" == "false" ]] && [[ "$has_epics" == "false" ]]; then
    log_error "No stories found in docs/stories/ and no PRD epics found in docs/prd/"
    log_error "Run phase-7 (validation/sharding) first, or create stories manually."
    return 1
  fi

  # Check templates exist
  check_file_exists "$TEMPLATE_STORY_CREATION" "story creation template" || return 1
  check_file_exists "$TEMPLATE_DEV" "dev implementation template" || return 1
  check_file_exists "$TEMPLATE_QA" "QA review template" || return 1

  # Check story parser exists
  check_file_exists "$STORY_PARSER" "story parser (story-parser.js)" || return 1

  # Verify node is available (for story-parser.js)
  check_dependencies "node" "${CLAUDE_CMD}" || return 1

  return 0
}

# ============================================================================
#                          STORY DISCOVERY
# ============================================================================

# Get list of pending stories as JSON array using story-parser.js
# Returns: JSON array of story objects, or empty array
get_pending_stories() {
  local stories_json
  stories_json=$(node "$STORY_PARSER" --dir "$STORIES_DIR" --pending 2>/dev/null) || {
    log_warn "Story parser returned no pending stories or failed"
    echo "[]"
    return
  }

  # Validate it is valid JSON
  if ! echo "$stories_json" | jq empty 2>/dev/null; then
    log_warn "Story parser output is not valid JSON"
    echo "[]"
    return
  fi

  echo "$stories_json"
}

# Get count of pending stories
get_pending_count() {
  local stories_json="$1"
  echo "$stories_json" | jq 'length'
}

# Extract story ID from JSON at given index
get_story_id() {
  local stories_json="$1"
  local index="$2"
  echo "$stories_json" | jq -r ".[$index].id"
}

# Extract story path from JSON at given index
get_story_path() {
  local stories_json="$1"
  local index="$2"
  echo "$stories_json" | jq -r ".[$index].path"
}

# Extract story title from JSON at given index
get_story_title() {
  local stories_json="$1"
  local index="$2"
  echo "$stories_json" | jq -r ".[$index].title"
}

# ============================================================================
#                          STORY CREATION SUB-PHASE
# ============================================================================

# Create new stories from PRD epics when no pending stories exist
run_story_creation() {
  log_info "--- Story Creation Sub-Phase ---"
  log_info "No pending stories found. Creating stories from PRD epics..."

  local prompt
  prompt=$(build_prompt "$TEMPLATE_STORY_CREATION") || return 1

  local output
  output=$(run_claude "$prompt") || {
    log_error "Story creation failed"
    return 1
  }

  # Check for completion signal
  if check_phase_complete "$output"; then
    local created_story_id
    created_story_id=$(extract_signal_value "$output" "STORY_ID")
    if [[ -n "$created_story_id" ]]; then
      log_success "Story created: ${created_story_id}"

      # Update state with new story
      update_state ".stories[\"${created_story_id}\"].status" '"created"'
      update_state ".stories[\"${created_story_id}\"].created_at" "\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""
    else
      log_success "Story creation completed (ID not extracted from signal)"
    fi
    return 0
  fi

  log_warn "Story creation did not return PHASE_COMPLETE signal"
  # Still might have created the story file - check on next discovery pass
  return 0
}

# ============================================================================
#                          DEV IMPLEMENTATION SUB-PHASE
# ============================================================================

# Run development implementation for a single story
# Args: story_id, story_path
# Returns: 0 on success, 1 on failure
# Stdout: Claude's output
run_dev_implementation() {
  local story_id="$1"
  local story_path="$2"

  log_info "--- Dev Implementation: Story ${story_id} ---"

  local prompt
  prompt=$(build_prompt "$TEMPLATE_DEV" \
    "STORY_ID=${story_id}" \
    "STORY_PATH=${story_path}") || return 1

  local output
  output=$(run_claude "$prompt") || {
    log_error "Dev implementation failed for story ${story_id}"
    return 1
  }

  echo "$output"

  # Check for completion
  if check_phase_complete "$output"; then
    log_success "Dev implementation complete for story ${story_id}"
    return 0
  fi

  # Check for blocked
  if check_phase_blocked "$output"; then
    local reason
    reason=$(extract_signal_value "$output" "REASON")
    log_warn "Story ${story_id} is BLOCKED: ${reason:-unknown reason}"
    return 1
  fi

  # No explicit signal but didn't fail - consider it success
  log_warn "Dev implementation did not emit completion signal for story ${story_id}"
  return 0
}

# ============================================================================
#                          QA REVIEW SUB-PHASE
# ============================================================================

# Run QA review for a single story
# Args: story_id, story_path
# Returns: 0 on PASS, 1 on FAIL
# Stdout: Claude's QA output (includes feedback if FAIL)
run_qa_review() {
  local story_id="$1"
  local story_path="$2"

  log_info "--- QA Review: Story ${story_id} ---"

  local prompt
  prompt=$(build_prompt "$TEMPLATE_QA" \
    "STORY_ID=${story_id}" \
    "STORY_PATH=${story_path}") || return 1

  local output
  output=$(run_claude "$prompt") || {
    log_error "QA review execution failed for story ${story_id}"
    return 1
  }

  echo "$output"

  # Check for PASS verdict
  if echo "$output" | grep -q "VERDICT=PASS"; then
    log_success "QA PASS for story ${story_id}"
    return 0
  fi

  # Check for explicit FAIL
  if check_phase_failed "$output"; then
    local issues
    issues=$(extract_signal_value "$output" "ISSUES")
    log_warn "QA FAIL for story ${story_id}: ${issues:-see QA output}"
    return 1
  fi

  # Check for PHASE_COMPLETE with PASS (alternative signal format)
  if check_phase_complete "$output"; then
    local verdict
    verdict=$(extract_signal_value "$output" "VERDICT")
    if [[ "$verdict" == "PASS" ]] || [[ "$verdict" == "CONCERNS" ]]; then
      log_success "QA ${verdict} for story ${story_id}"
      return 0
    fi
  fi

  # No clear signal - treat as failure to be safe
  log_warn "QA review did not return a clear verdict for story ${story_id}. Treating as FAIL."
  return 1
}

# ============================================================================
#                          DEV RETRY WITH QA FEEDBACK
# ============================================================================

# Run dev implementation with QA feedback appended to the prompt
# This is used when QA fails and we need to retry
# Args: story_id, story_path, qa_feedback
run_dev_with_feedback() {
  local story_id="$1"
  local story_path="$2"
  local qa_feedback="$3"

  log_info "--- Dev Retry (with QA feedback): Story ${story_id} ---"

  local prompt
  prompt=$(build_prompt "$TEMPLATE_DEV" \
    "STORY_ID=${story_id}" \
    "STORY_PATH=${story_path}" \
    "QA_FEEDBACK=${qa_feedback}") || return 1

  # If template does not have {{QA_FEEDBACK}} placeholder, append it manually
  if ! echo "$prompt" | grep -q "QA_FEEDBACK"; then
    prompt="${prompt}

## QA Feedback from Previous Attempt

The QA review found the following issues. Fix ALL of them before marking complete:

${qa_feedback}
"
  fi

  local output
  output=$(run_claude "$prompt") || {
    log_error "Dev retry failed for story ${story_id}"
    return 1
  }

  echo "$output"

  if check_phase_complete "$output"; then
    return 0
  fi

  return 1
}

# ============================================================================
#                          SINGLE STORY CYCLE
# ============================================================================

# Process a single story through the dev -> QA -> retry cycle
# Args: story_id, story_path, story_title
# Returns: 0 if story completed successfully, 1 if failed after all retries
process_story() {
  local story_id="$1"
  local story_path="$2"
  local story_title="$3"

  log_phase "Processing Story ${story_id}: ${story_title}"

  # Update state: story in progress
  update_state ".stories[\"${story_id}\"].status" '"in-progress"'
  update_state ".stories[\"${story_id}\"].started_at" "\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""

  local attempt=0
  local qa_feedback=""
  local dev_output=""
  local qa_output=""

  while [[ $attempt -lt $MAX_RETRIES ]]; do
    attempt=$((attempt + 1))

    log_info "Attempt ${attempt}/${MAX_RETRIES} for story ${story_id}"

    # --- Dev Phase ---
    if [[ $attempt -eq 1 ]]; then
      # First attempt: normal dev implementation
      dev_output=$(run_dev_implementation "$story_id" "$story_path") || {
        log_error "Dev implementation failed on attempt ${attempt}"
        continue
      }
    else
      # Retry: dev with QA feedback
      TOTAL_RETRIES=$((TOTAL_RETRIES + 1))
      dev_output=$(run_dev_with_feedback "$story_id" "$story_path" "$qa_feedback") || {
        log_error "Dev retry failed on attempt ${attempt}"
        continue
      }
    fi

    # --- QA Phase ---
    qa_output=$(run_qa_review "$story_id" "$story_path")
    local qa_exit=$?

    if [[ $qa_exit -eq 0 ]]; then
      # QA PASSED
      QA_PASSES=$((QA_PASSES + 1))

      # Mark story as done in state
      update_state ".stories[\"${story_id}\"].status" '"done"'
      update_state ".stories[\"${story_id}\"].completed_at" "\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\""
      update_state ".stories[\"${story_id}\"].attempts" "$attempt"

      # Commit the work
      git_commit "feat: implement Story ${story_id} - ${story_title}"

      # Record learnings
      record_learnings "phase-8" "Story ${story_id} (${story_title}) completed in ${attempt} attempt(s)."

      STORIES_COMPLETED=$((STORIES_COMPLETED + 1))
      log_success "Story ${story_id} completed successfully! (${attempt} attempt(s))"
      return 0
    else
      # QA FAILED - capture feedback for retry
      QA_FAILURES=$((QA_FAILURES + 1))
      qa_feedback="$qa_output"

      log_warn "QA failed for story ${story_id} (attempt ${attempt}/${MAX_RETRIES})"

      # Update state with failure info
      update_state ".stories[\"${story_id}\"].qa_failures" "$((QA_FAILURES))"

      if [[ $attempt -lt $MAX_RETRIES ]]; then
        log_info "Will retry with QA feedback..."
      fi
    fi
  done

  # All retries exhausted
  STORIES_FAILED=$((STORIES_FAILED + 1))

  update_state ".stories[\"${story_id}\"].status" '"failed"'
  update_state ".stories[\"${story_id}\"].error" "\"QA failed after ${MAX_RETRIES} attempts\""

  record_learnings "phase-8" "Story ${story_id} (${story_title}) FAILED after ${MAX_RETRIES} attempts. Last QA feedback: ${qa_feedback:0:500}"

  log_error "Story ${story_id} failed after ${MAX_RETRIES} attempts"
  return 1
}

# ============================================================================
#                          MAIN EXECUTION (Override standard pattern)
# ============================================================================

# Phase 8 overrides the standard execute_phase/validate_output pattern
# because it has its own complex loop logic.

execute_phase() {
  local stories_processed=0

  # ========================================================================
  # MAIN DEV CYCLE LOOP
  # ========================================================================

  while [[ $stories_processed -lt $MAX_STORIES ]]; do

    # --- Step 1: Discover pending stories ---
    log_info "Discovering pending stories..."
    local pending_json
    pending_json=$(get_pending_stories)
    local pending_count
    pending_count=$(get_pending_count "$pending_json")

    log_info "Found ${pending_count} pending story(ies)"

    # --- Step 2: If no pending stories, create new ones ---
    if [[ "$pending_count" -eq 0 ]]; then
      log_info "No pending stories. Attempting story creation..."

      run_story_creation || {
        log_info "Story creation did not produce new stories. Dev cycle complete."
        break
      }

      # Re-discover after creation
      pending_json=$(get_pending_stories)
      pending_count=$(get_pending_count "$pending_json")

      if [[ "$pending_count" -eq 0 ]]; then
        log_info "No new stories created. All epics may be covered. Dev cycle complete."
        break
      fi

      log_success "Created new stories. Now ${pending_count} pending."
    fi

    # --- Step 3: Process each pending story ---
    local i=0
    while [[ $i -lt $pending_count ]] && [[ $stories_processed -lt $MAX_STORIES ]]; do
      local story_id
      story_id=$(get_story_id "$pending_json" "$i")
      local story_path
      story_path=$(get_story_path "$pending_json" "$i")
      local story_title
      story_title=$(get_story_title "$pending_json" "$i")

      # Process this story through the dev/QA cycle
      if process_story "$story_id" "$story_path" "$story_title"; then
        log_success "Story ${story_id} cycle complete (PASS)"
      else
        log_error "Story ${story_id} cycle complete (FAIL)"

        if [[ "$STOP_ON_FAIL" == "true" ]]; then
          log_error "AIOS_STOP_ON_FAIL is set. Halting dev cycle."
          break 2
        fi
      fi

      stories_processed=$((stories_processed + 1))
      i=$((i + 1))
    done

  done

  # ========================================================================
  # SUMMARY
  # ========================================================================

  # Update aggregate state
  update_state '.dev_cycles.total_stories_completed' "$STORIES_COMPLETED"
  update_state '.dev_cycles.total_qa_passes' "$QA_PASSES"
  update_state '.dev_cycles.total_qa_failures' "$QA_FAILURES"
  update_state '.dev_cycles.total_retries' "$TOTAL_RETRIES"

  log_info ""
  log_info "========================================="
  log_info "  Dev Cycle Summary"
  log_info "========================================="
  log_info "  Stories completed:  ${STORIES_COMPLETED}"
  log_info "  Stories failed:     ${STORIES_FAILED}"
  log_info "  QA passes:          ${QA_PASSES}"
  log_info "  QA failures:        ${QA_FAILURES}"
  log_info "  Total retries:      ${TOTAL_RETRIES}"
  log_info "========================================="
  log_info ""

  # Emit completion signal if at least one story was completed
  if [[ $STORIES_COMPLETED -gt 0 ]]; then
    echo "PHASE_COMPLETE"
  else
    if [[ $stories_processed -eq 0 ]]; then
      # No stories to process at all - this is still a valid completion
      log_info "No stories were processed (all may be already done)"
      echo "PHASE_COMPLETE"
    else
      log_error "No stories completed successfully"
      echo "PHASE_FAILED"
      return 1
    fi
  fi
}

# ============================================================================
#                          VALIDATION
# ============================================================================

validate_output() {
  # For the dev cycle, validation means at least one story reached "done" status,
  # OR all stories were already done.

  # Check state for completed stories
  local done_count
  done_count=$(jq '[.stories | to_entries[] | select(.value.status == "done")] | length' "$STATE_FILE" 2>/dev/null || echo "0")

  if [[ "$done_count" -gt 0 ]]; then
    log_success "${done_count} story(ies) with status 'done' in state"
    return 0
  fi

  # Check if stories directory has any completed stories (via story-parser)
  local all_stories
  all_stories=$(node "$STORY_PARSER" --dir "$STORIES_DIR" 2>/dev/null || echo "[]")
  local completed_in_files
  completed_in_files=$(echo "$all_stories" | jq '[.[] | select(.status == "Done" or .status == "Completed" or .status == "done")] | length' 2>/dev/null || echo "0")

  if [[ "$completed_in_files" -gt 0 ]]; then
    log_success "${completed_in_files} completed story(ies) found in story files"
    return 0
  fi

  # No stories processed is valid if there were none to process
  if [[ $STORIES_COMPLETED -eq 0 ]] && [[ $STORIES_FAILED -eq 0 ]]; then
    log_info "No stories were processed - this may be expected if all are already complete"
    return 0
  fi

  log_error "No completed stories found after dev cycle"
  return 1
}

# ============================================================================
#                          LEARNINGS EXTRACTION
# ============================================================================

extract_learnings() {
  local output="$1"
  echo "Dev cycle: ${STORIES_COMPLETED} stories completed, ${STORIES_FAILED} failed, ${QA_PASSES} QA passes, ${QA_FAILURES} QA failures, ${TOTAL_RETRIES} retries."
}

# ============================================================================
#                          ENTRY POINT
# ============================================================================

run_executor
