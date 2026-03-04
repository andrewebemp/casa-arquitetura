#!/bin/bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# Synkra AIOS - Autonomous Runner
#
# Ralph-inspired autonomous execution engine for AIOS phases.
# Each phase/story runs in a FRESH Claude Code instance (zero compaction).
# Learnings accumulate between instances via plan/autonomous-learnings.md.
#
# Usage:
#   autonomous-runner.sh --phase 2              Run single phase
#   autonomous-runner.sh --phases 2,3,4,5,6,7   Run multiple phases
#   autonomous-runner.sh --phases all            Run all automatizable phases
#   autonomous-runner.sh --phase 8              Dev cycle (story loop)
#   autonomous-runner.sh --resume               Resume interrupted run
#
# Options:
#   --max-retries N           Max retries per phase (default: 3)
#   --pause-between-phases    Pause for inspection between phases
#   --skip-on-fail            Skip failed phase instead of stopping
#   --dry-run                 Show prompts without executing
#   --verbose                 Detailed output
#
# Version: 1.0.0
# ═══════════════════════════════════════════════════════════════════════════════

# Resolve script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
EXECUTORS_DIR="${SCRIPT_DIR}/phase-executors"

# Source common functions
source "${EXECUTORS_DIR}/common.sh"

# ═══════════════════════════════════════════════════════════════════════════════
#                              CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

MAX_RETRIES="${AIOS_MAX_RETRIES:-3}"
PAUSE_BETWEEN=false
SKIP_ON_FAIL=false
DRY_RUN=false
VERBOSE=false
RESUME=false
PHASES=()
SINGLE_PHASE=""
SQUAD_MODE="premium"  # premium | core

# All automatizable phases in order
ALL_PHASES=(0 2 3 4 5 6 7 8 9)

# Phase metadata
declare -A PHASE_NAMES=(
  [0]="Bootstrap"
  [1]="Ideation"
  [2]="PRD"
  [3]="UX/UI"
  [4]="Squads"
  [5]="Architecture"
  [6]="Data Modeling"
  [7]="Validation"
  [8]="Dev Cycle"
  [9]="Deploy"
)

declare -A PHASE_SCRIPTS=(
  [0]="phase-0-bootstrap.sh"
  [2]="phase-2-prd.sh"
  [3]="phase-3-ux.sh"
  [4]="phase-4-squads.sh"
  [5]="phase-5-architecture.sh"
  [6]="phase-6-data.sh"
  [7]="phase-7-validation.sh"
  [8]="phase-8-dev-cycle.sh"
  [9]="phase-9-deploy.sh"
)

# ═══════════════════════════════════════════════════════════════════════════════
#                              ARGUMENT PARSING
# ═══════════════════════════════════════════════════════════════════════════════

print_usage() {
  cat <<'EOF'
Synkra AIOS - Autonomous Runner v1.0.0
Ralph-inspired autonomous execution engine.

Usage:
  autonomous-runner.sh --phase <N>              Run single phase
  autonomous-runner.sh --phases <N,M,O>         Run multiple phases
  autonomous-runner.sh --phases all             Run all automatizable phases
  autonomous-runner.sh --resume                 Resume interrupted run

Options:
  --phase <N>               Single phase to execute (0-9)
  --phases <N,M,O|all>      Multiple phases (comma-separated or 'all')
  --max-retries <N>         Max retries per phase (default: 3)
  --pause-between-phases    Pause for human inspection between phases
  --skip-on-fail            Skip failed phase instead of stopping
  --dry-run                 Show what would happen without executing
  --verbose                 Detailed output
  --squad-mode <premium|core>  Squad creation mode (default: premium)
                               premium = @squad-chief YOLO (6-phase workflow)
                               core    = @squad-creator (simple template)
  --resume                  Resume from last saved state
  --help                    Show this help

Phases:
  0  Bootstrap       Setup environment, directories, git
  2  PRD             Generate Product Requirements Document
  3  UX/UI           Generate frontend specification
  4  Squads          Create domain-specific agent squads
  5  Architecture    Design system architecture
  6  Data            Model database schema and migrations
  7  Validation      Validate artifacts, shard documents
  8  Dev Cycle       Story creation → implementation → QA (loop)
  9  Deploy          Pre-push checks, git push, PR creation

Examples:
  # Generate all planning docs from a project brief:
  autonomous-runner.sh --phases 2,3,5,6,7

  # Full autonomous pipeline:
  autonomous-runner.sh --phases all

  # Just the dev cycle (story loop):
  autonomous-runner.sh --phase 8

  # Cautious mode - pause between each phase:
  autonomous-runner.sh --phases 2,3,4,5,6,7 --pause-between-phases
EOF
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --phase)
        SINGLE_PHASE="$2"
        shift 2
        ;;
      --phases)
        if [[ "$2" == "all" ]]; then
          PHASES=("${ALL_PHASES[@]}")
        else
          IFS=',' read -ra PHASES <<< "$2"
        fi
        shift 2
        ;;
      --max-retries)
        MAX_RETRIES="$2"
        shift 2
        ;;
      --pause-between-phases)
        PAUSE_BETWEEN=true
        shift
        ;;
      --skip-on-fail)
        SKIP_ON_FAIL=true
        shift
        ;;
      --dry-run)
        DRY_RUN=true
        shift
        ;;
      --verbose)
        VERBOSE=true
        export AIOS_VERBOSE=true
        shift
        ;;
      --squad-mode)
        SQUAD_MODE="$2"
        if [[ "$SQUAD_MODE" != "premium" && "$SQUAD_MODE" != "core" ]]; then
          log_error "Invalid squad mode: $SQUAD_MODE (must be 'premium' or 'core')"
          exit 1
        fi
        shift 2
        ;;
      --resume)
        RESUME=true
        shift
        ;;
      --help|-h)
        print_usage
        exit 0
        ;;
      *)
        log_error "Unknown argument: $1"
        print_usage
        exit 1
        ;;
    esac
  done

  # Validate
  if [[ -z "$SINGLE_PHASE" ]] && [[ ${#PHASES[@]} -eq 0 ]] && [[ "$RESUME" == false ]]; then
    log_error "Must specify --phase, --phases, or --resume"
    print_usage
    exit 1
  fi

  # Single phase -> array of 1
  if [[ -n "$SINGLE_PHASE" ]]; then
    PHASES=("$SINGLE_PHASE")
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              RESUME LOGIC
# ═══════════════════════════════════════════════════════════════════════════════

resume_from_state() {
  local state_file="${PROJECT_ROOT}/plan/autonomous-state.json"

  if [[ ! -f "$state_file" ]]; then
    log_error "No state file found at plan/autonomous-state.json. Nothing to resume."
    exit 1
  fi

  log_info "Resuming from saved state..."

  # Read requested phases from state
  local requested_phases
  requested_phases=$(jq -r '.requestedPhases // [] | .[]' "$state_file" 2>/dev/null)

  if [[ -z "$requested_phases" ]]; then
    log_error "No requested phases found in state file."
    exit 1
  fi

  # Find phases that are not yet completed
  PHASES=()
  while IFS= read -r phase; do
    local status
    status=$(jq -r ".phases[\"${phase}\"].status // \"pending\"" "$state_file" 2>/dev/null)
    if [[ "$status" != "completed" ]]; then
      PHASES+=("$phase")
    fi
  done <<< "$requested_phases"

  if [[ ${#PHASES[@]} -eq 0 ]]; then
    log_success "All phases already completed! Nothing to resume."
    exit 0
  fi

  log_info "Resuming phases: ${PHASES[*]}"
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              PHASE EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

run_phase() {
  local phase_num="$1"
  local phase_name="${PHASE_NAMES[$phase_num]:-Phase $phase_num}"
  local phase_script="${PHASE_SCRIPTS[$phase_num]:-}"

  if [[ -z "$phase_script" ]]; then
    log_error "No executor found for phase $phase_num"
    return 1
  fi

  local executor="${EXECUTORS_DIR}/${phase_script}"
  if [[ ! -f "$executor" ]]; then
    log_error "Executor script not found: ${executor}"
    return 1
  fi

  echo ""
  log_phase "═══════════════════════════════════════════════════════════"
  log_phase " PHASE $phase_num: $phase_name"
  log_phase "═══════════════════════════════════════════════════════════"
  echo ""

  # Dry run mode
  if [[ "$DRY_RUN" == true ]]; then
    log_info "[DRY RUN] Would execute: $executor"
    local template="${SCRIPT_DIR}/../templates/phase-prompts/phase-${phase_num}*.md"
    if ls $template 1>/dev/null 2>&1; then
      log_info "[DRY RUN] Prompt template:"
      for t in $template; do
        log_info "  - $t"
      done
    fi
    return 0
  fi

  # Execute with retries
  local attempt=0
  local success=false

  while [[ $attempt -lt $MAX_RETRIES ]]; do
    attempt=$((attempt + 1))

    if [[ $attempt -gt 1 ]]; then
      log_warn "Retry $attempt/$MAX_RETRIES for phase $phase_num ($phase_name)"
    fi

    # Run the executor
    # Each executor is sourced in a subshell for isolation
    if (
      export AIOS_DRY_RUN="$DRY_RUN"
      export AIOS_VERBOSE="$VERBOSE"
      export AIOS_MAX_RETRIES="$MAX_RETRIES"
      export PROJECT_ROOT="$PROJECT_ROOT"
      export SQUAD_MODE="$SQUAD_MODE"
      cd "$PROJECT_ROOT"
      bash "$executor"
    ); then
      success=true
      break
    else
      local exit_code=$?
      log_warn "Phase $phase_num ($phase_name) failed with exit code $exit_code (attempt $attempt/$MAX_RETRIES)"

      if [[ $attempt -lt $MAX_RETRIES ]]; then
        log_info "Waiting 5 seconds before retry..."
        sleep 5
      fi
    fi
  done

  if [[ "$success" == true ]]; then
    log_success "Phase $phase_num ($phase_name) completed successfully"
    return 0
  else
    log_error "Phase $phase_num ($phase_name) failed after $MAX_RETRIES attempts"
    return 1
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              MAIN ORCHESTRATION
# ═══════════════════════════════════════════════════════════════════════════════

main() {
  parse_args "$@"

  # Handle resume
  if [[ "$RESUME" == true ]]; then
    resume_from_state
  fi

  # Change to project root
  cd "$PROJECT_ROOT"

  # Initialize state and learnings
  init_state
  init_learnings

  # Save requested phases to state for resume
  local phases_json
  phases_json=$(printf '%s\n' "${PHASES[@]}" | jq -R . | jq -s .)
  if [[ -f "plan/autonomous-state.json" ]]; then
    local tmp
    tmp=$(jq --argjson p "$phases_json" '.requestedPhases = $p' plan/autonomous-state.json)
    echo "$tmp" > plan/autonomous-state.json
  fi

  # Banner
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║          Synkra AIOS - Autonomous Runner v1.0.0             ║"
  echo "║          Ralph-inspired | Fresh Instance Per Task           ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""

  log_info "Project root: $PROJECT_ROOT"
  log_info "Phases to execute: ${PHASES[*]}"
  log_info "Max retries per phase: $MAX_RETRIES"
  [[ "$PAUSE_BETWEEN" == true ]] && log_info "Pause between phases: enabled"
  [[ "$SKIP_ON_FAIL" == true ]] && log_info "Skip on fail: enabled"
  log_info "Squad mode: $SQUAD_MODE"
  [[ "$DRY_RUN" == true ]] && log_warn "DRY RUN MODE - no changes will be made"
  echo ""

  # Track results
  local total_phases=${#PHASES[@]}
  local completed=0
  local failed=0
  local skipped=0
  local start_time
  start_time=$(date +%s)

  # Execute each phase
  for phase_num in "${PHASES[@]}"; do
    # Check if phase was already completed (for resume)
    if [[ -f "plan/autonomous-state.json" ]]; then
      local current_status
      current_status=$(jq -r ".phases[\"${phase_num}\"].status // \"pending\"" plan/autonomous-state.json 2>/dev/null)
      if [[ "$current_status" == "completed" ]]; then
        log_info "Phase $phase_num already completed, skipping"
        completed=$((completed + 1))
        continue
      fi
    fi

    # Pause between phases if requested
    if [[ "$PAUSE_BETWEEN" == true ]] && [[ $completed -gt 0 || $failed -gt 0 ]]; then
      echo ""
      log_info "Paused before phase $phase_num (${PHASE_NAMES[$phase_num]:-Unknown})"
      log_info "Press ENTER to continue or Ctrl+C to abort..."
      read -r
    fi

    # Execute phase
    if run_phase "$phase_num"; then
      completed=$((completed + 1))
    else
      failed=$((failed + 1))

      if [[ "$SKIP_ON_FAIL" == true ]]; then
        log_warn "Skipping failed phase $phase_num and continuing..."
        skipped=$((skipped + 1))
      else
        log_error "Stopping execution due to phase $phase_num failure."
        log_info "Use --resume to continue from this point, or --skip-on-fail to skip failures."
        break
      fi
    fi
  done

  # Final report
  local end_time
  end_time=$(date +%s)
  local duration=$((end_time - start_time))
  local minutes=$((duration / 60))
  local seconds=$((duration % 60))

  echo ""
  echo "╔═══════════════════════════════════════════════════════════════╗"
  echo "║                    EXECUTION REPORT                         ║"
  echo "╚═══════════════════════════════════════════════════════════════╝"
  echo ""
  log_info "Total phases: $total_phases"
  log_success "Completed: $completed"
  [[ $failed -gt 0 ]] && log_error "Failed: $failed"
  [[ $skipped -gt 0 ]] && log_warn "Skipped: $skipped"
  log_info "Duration: ${minutes}m ${seconds}s"
  echo ""

  if [[ -f "plan/autonomous-learnings.md" ]]; then
    local learning_count
    learning_count=$(grep -c "^## \[" plan/autonomous-learnings.md 2>/dev/null || echo "0")
    log_info "Learnings recorded: $learning_count entries"
  fi

  log_info "State saved to: plan/autonomous-state.json"
  log_info "Learnings at: plan/autonomous-learnings.md"
  echo ""

  # Exit code
  if [[ $failed -gt 0 ]] && [[ "$SKIP_ON_FAIL" == false ]]; then
    exit 1
  fi

  exit 0
}

# ═══════════════════════════════════════════════════════════════════════════════
#                              ENTRYPOINT
# ═══════════════════════════════════════════════════════════════════════════════

main "$@"
