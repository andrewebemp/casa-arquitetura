# Task: Run Autonomous

> **Command:** `*run-autonomous {phases} [options]`
> **Agent:** @aios-master
> **Description:** Native Task-tool autonomous runner for AIOS development phases. Runs entirely within Claude Code using the Task tool — each phase executes as an isolated subagent with a clean context window. Alternative to `autonomous-runner.sh` that does not require leaving Claude Code.

---

## Purpose

Execute AIOS development phases autonomously without leaving the Claude Code session. Unlike `autonomous-runner.sh` (which calls `claude --print` as an external subprocess), this task uses Claude Code's native **Task tool** to spawn each phase as a subagent with isolated context.

**Key differences from shell fallback:**
- Runs entirely within Claude Code — no terminal required
- Each phase gets a clean context window (zero compaction)
- State and learnings persist across phases via files
- You can monitor progress in the same session

**Shell fallback still works:** `bash .aios-core/scripts/autonomous-runner.sh --phases N`

---

## Usage

```bash
*run-autonomous 2                          # Single phase
*run-autonomous 2,4,5                      # Multiple specific phases
*run-autonomous 2-5                        # Range (phases 2, 3, 4, 5)
*run-autonomous all                        # All phases (0,2,3,4,5,6,7,8,9)
*run-autonomous --resume                   # Resume from plan/autonomous-state.json
*run-autonomous 8 --max-retries=5          # Phase 8 with more retries
*run-autonomous 2,4 --skip-on-fail         # Skip failed phases, continue
*run-autonomous 2,4 --pause-between        # Checkpoint between phases
```

### Arguments

| Argument | Required | Description |
| -------- | -------- | ----------- |
| phases   | Yes*     | Single int `2`, comma-list `2,4,5`, range `2-5`, or `all` |

*Not required when using `--resume`

### Options

| Option           | Default | Description |
| ---------------- | ------- | ----------- |
| --max-retries=N  | 3       | Max retry attempts per phase before marking failed |
| --skip-on-fail   | false   | Continue to next phase when current fails (after max retries) |
| --pause-between  | false   | Show checkpoint after each phase; wait for `*run-autonomous --resume` |
| --resume         | false   | Resume from last saved state in plan/autonomous-state.json |

---

## Phase Reference

| Phase | Name              | Template File                                          |
| ----- | ----------------- | ------------------------------------------------------ |
| 0     | Bootstrap         | (no Task tool — Bash env check only)                   |
| 2     | PRD Creation      | `.aios-core/templates/phase-prompts/phase-2-prd.md`    |
| 3     | UX/UI Spec        | `.aios-core/templates/phase-prompts/phase-3-ux.md`     |
| 4     | Squad Creation    | `.aios-core/templates/phase-prompts/phase-4-squads.md` |
| 5     | Architecture      | `.aios-core/templates/phase-prompts/phase-5-architecture.md` |
| 6     | Data Modeling     | `.aios-core/templates/phase-prompts/phase-6-data.md`   |
| 7     | Validation        | `.aios-core/templates/phase-prompts/phase-7-validation.md` |
| 8     | Dev Cycle         | `.aios-core/templates/phase-prompts/phase-8-*.md` (3-part loop) |
| 9     | Deploy            | `.aios-core/templates/phase-prompts/phase-9-deploy.md` |

---

## Execution Algorithm

### Step 1 — Parse Arguments

```
IF "--resume" in args:
  READ plan/autonomous-state.json
  phases = all phases where status != "complete"
  options = original options from state (or defaults)

ELSE parse phases from first arg:
  "all"     → [0, 2, 3, 4, 5, 6, 7, 8, 9]
  "N-M"     → range(N, M+1) — e.g. "2-5" → [2, 3, 4, 5]
  "N,M,O"   → split by comma → [N, M, O]
  "N"       → [N]

parse options:
  --max-retries=N  → maxRetries = N (default 3)
  --skip-on-fail   → skipOnFail = true (default false)
  --pause-between  → pauseBetween = true (default false)
```

### Step 2 — Initialize State

```
Bash: mkdir -p plan

IF plan/autonomous-state.json does not exist:
  CREATE plan/autonomous-state.json with schema:
  {
    "version": "1.0.0",
    "created_at": "<ISO timestamp>",
    "updated_at": "<ISO timestamp>",
    "current_phase": null,
    "requestedPhases": [],
    "phases": {},
    "stories": {},
    "dev_cycles": {
      "total_stories_completed": 0,
      "total_qa_passes": 0,
      "total_qa_failures": 0,
      "total_retries": 0
    },
    "errors": []
  }

IF plan/autonomous-learnings.md does not exist:
  CREATE plan/autonomous-learnings.md with content:
  # Autonomous Runner - Learnings
  Accumulated learnings from autonomous phase execution.
  ---

Update state.requestedPhases = resolved phase list
Update state.updated_at = now()
Write state to plan/autonomous-state.json using Bash + node -e
```

**State write pattern (Bash tool):**
```bash
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('plan/autonomous-state.json','utf8'));
s.requestedPhases=[2,4,5];
s.updated_at=new Date().toISOString();
fs.writeFileSync('plan/autonomous-state.json',JSON.stringify(s,null,2));
"
```

### Step 3 — Display Banner

```
Show user:
=== AIOS Autonomous Runner (Native Task-Tool Mode) ===
Phases: [list]
Max retries: N
Skip on fail: yes/no
State: plan/autonomous-state.json
Learnings: plan/autonomous-learnings.md
```

### Step 4 — Sequential Phase Loop

**CRITICAL: Phases must run SEQUENTIALLY — each phase's output feeds the next.**

```
completed = []
failed = []

FOR EACH phase_num IN phases (ascending order):

  # Skip already-complete phases (resume scenario)
  READ state from plan/autonomous-state.json
  IF state.phases["phase-{phase_num}"].status == "complete":
    SHOW "[Phase {phase_num}] Already complete, skipping ✓"
    completed.append(phase_num)
    CONTINUE

  # Pause checkpoint
  IF pauseBetween AND (completed OR failed is non-empty):
    SHOW """
    --- CHECKPOINT ---
    Completed so far: {completed}
    About to start: Phase {phase_num}
    Type *run-autonomous --resume to continue, or stop here.
    """
    STOP — do not execute further phases until user resumes

  # Execute phase
  result = execute_phase(phase_num, maxRetries)

  IF result == "complete":
    completed.append(phase_num)
    SHOW "[Phase {phase_num} - {PHASE_NAMES[phase_num]}] COMPLETE ✓ (attempt {attempt})"
  ELSE:
    failed.append(phase_num)
    SHOW "[Phase {phase_num} - {PHASE_NAMES[phase_num]}] FAILED ✗ ({maxRetries}/{maxRetries} attempts)"
    IF NOT skipOnFail:
      SHOW "Stopping. Use *run-autonomous --resume or add --skip-on-fail to continue."
      BREAK

SHOW final summary:
=== Execution Report ===
Completed: {len(completed)} phases {completed}
Failed: {len(failed)} phases {failed}
State: plan/autonomous-state.json
Learnings: plan/autonomous-learnings.md
```

**Phase name reference:**
```
PHASE_NAMES = {
  0: "Bootstrap",
  2: "PRD Creation",
  3: "UX/UI Spec",
  4: "Squad Creation",
  5: "Architecture",
  6: "Data Modeling",
  7: "Validation",
  8: "Dev Cycle",
  9: "Deploy"
}
```

---

## Phase Execution: Standard Phases (2, 3, 4, 5, 6, 7, 9)

```
PROCEDURE execute_phase(phase_num, maxRetries):
  phase_id = "phase-{phase_num}"

  # Mark as running in state
  UPDATE state.phases[phase_id] = {
    name: PHASE_NAMES[phase_num],
    status: "running",
    started_at: ISO timestamp,
    completed_at: null,
    error: null
  }
  UPDATE state.current_phase = phase_id
  WRITE state

  FOR attempt = 1 to maxRetries:
    IF attempt > 1:
      SHOW "Retry {attempt}/{maxRetries} for Phase {phase_num}..."

    result = execute_standard_phase(phase_num, attempt)

    IF result.status == "complete":
      UPDATE state.phases[phase_id].status = "complete"
      UPDATE state.phases[phase_id].completed_at = now()
      WRITE state
      RETURN "complete"
    ELSE:
      UPDATE state.phases[phase_id].error = result.error
      WRITE state

  UPDATE state.phases[phase_id].status = "failed"
  WRITE state
  RETURN "failed"


PROCEDURE execute_standard_phase(phase_num, attempt):
  # 1. Find template
  template_path = phase template from Phase Reference table above

  # 2. Read template content
  template_content = Read(template_path)

  # 3. Read learnings
  learnings_section = ""
  IF plan/autonomous-learnings.md exists:
    learnings_content = Read("plan/autonomous-learnings.md")
    IF learnings_content is not empty:
      # Truncate to last 3000 chars if very large to avoid token overflow
      learnings_section = """
## Previous Learnings

The following learnings were accumulated from previous phases. Use them to improve quality:

{learnings_content (last 3000 chars)}
"""

  # 4. Build final prompt
  final_prompt = template_content.replace("{{LEARNINGS}}", learnings_section)

  # 5. Add retry context if needed
  IF attempt > 1:
    final_prompt += """

## Retry Context

This is attempt {attempt}. The previous attempt did not complete successfully.
Review your work carefully and ensure you emit the PHASE_COMPLETE signal at the end.
"""

  # 6. Spawn subagent via Task tool
  subagent_result = Task(
    description: "AIOS Phase {phase_num}: {PHASE_NAMES[phase_num]} (attempt {attempt})",
    subagent_type: "general-purpose",
    prompt: final_prompt
  )

  # 7. Parse signals from result
  IF "PHASE_COMPLETE" in subagent_result:
    learning = extract_phase_learning(phase_num, subagent_result)
    append_learning("phase-{phase_num}", learning)
    RETURN {status: "complete"}

  ELIF "PHASE_FAILED" in subagent_result:
    error_line = line containing "PHASE_FAILED" from subagent_result
    RETURN {status: "failed", error: error_line}

  ELSE:
    RETURN {status: "failed", error: "No PHASE_COMPLETE or PHASE_FAILED signal in output"}
```

**Append learning pattern (Bash tool):**
```bash
printf "\n### [phase-2] - %s\n\nBrief summary of what was produced.\n\n---\n" \
  "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> plan/autonomous-learnings.md
```

---

## Phase Execution: Phase 0 (Bootstrap)

Phase 0 does NOT use the Task tool. It performs environment checks using the Bash tool:

```
1. Bash: ls .git/ → verify git is initialized
2. Bash: mkdir -p plan → ensure plan/ exists
3. Bash: mkdir -p docs → ensure docs/ exists
4. UPDATE state.phases["phase-0"] = {status: "complete", ...}
5. SHOW "[Phase 0 - Bootstrap] COMPLETE ✓"
```

---

## Phase Execution: Phase 8 (Dev Cycle — Story Loop)

Phase 8 is a loop with 3 sub-phases per story. The loop continues until all stories are complete or a stop condition is met.

```
PROCEDURE execute_phase_8(maxRetries):
  stories_completed = 0
  stories_failed = 0
  MAX_STORIES = 50  # safety cap

  WHILE (stories_completed + stories_failed) < MAX_STORIES:

    # Discover pending stories
    Bash: node .aios-core/core/execution/story-parser.js --dir docs/stories --pending 2>/dev/null || echo "[]"
    IF above fails:
      Bash: grep -rl "Status: Draft\|status: draft" docs/stories/ 2>/dev/null | head -20

    pending_stories = result of discovery above

    IF pending_stories is empty:
      # Try creating a new story
      story_creation_result = spawn_subagent(
        description: "AIOS Phase 8.1: Story Creation",
        template: ".aios-core/templates/phase-prompts/phase-8-story-creation.md",
        learnings: current learnings content
      )
      IF "PHASE_COMPLETE" not in story_creation_result:
        SHOW "No more stories to create. Phase 8 complete."
        BREAK
      # Re-discover
      pending_stories = re-run discovery

    IF pending_stories is still empty:
      BREAK

    # Process each pending story
    FOR EACH story IN pending_stories:
      story_result = execute_story_cycle(story, maxRetries)
      IF story_result == "done":
        stories_completed++
        UPDATE state.dev_cycles.total_stories_completed++
      ELSE:
        stories_failed++
        IF NOT skipOnFail:
          BREAK both loops

  UPDATE state.dev_cycles in state file
  IF stories_completed > 0:
    RETURN "complete"
  ELSE:
    RETURN "failed"


PROCEDURE execute_story_cycle(story, maxRetries):
  FOR attempt = 1 to maxRetries:

    # Sub-phase 8.2: Dev Implementation
    dev_template = Read(".aios-core/templates/phase-prompts/phase-8-dev.md")
    dev_prompt = dev_template
      .replace("{{STORY_ID}}", story.id)
      .replace("{{STORY_PATH}}", story.path)
      .replace("{{LEARNINGS}}", current learnings section)

    IF attempt > 1 AND qa_feedback exists:
      dev_prompt += "\n## QA Feedback from Previous Attempt\n" + qa_feedback

    dev_result = Task(
      description: "AIOS Phase 8.2: Dev Implementation - {story.id} (attempt {attempt})",
      subagent_type: "general-purpose",
      prompt: dev_prompt
    )

    IF "PHASE_BLOCKED" in dev_result:
      UPDATE state.stories[story.id].status = "blocked"
      RETURN "failed"

    # Sub-phase 8.3: QA Review
    qa_template = Read(".aios-core/templates/phase-prompts/phase-8-qa.md")
    qa_prompt = qa_template
      .replace("{{STORY_ID}}", story.id)
      .replace("{{STORY_PATH}}", story.path)
      .replace("{{LEARNINGS}}", current learnings section)

    qa_result = Task(
      description: "AIOS Phase 8.3: QA Review - {story.id} (attempt {attempt})",
      subagent_type: "general-purpose",
      prompt: qa_prompt
    )

    IF "VERDICT=PASS" in qa_result OR "VERDICT=CONCERNS" in qa_result:
      # Git commit
      Bash: git add -A && git commit -m "feat: implement story {story.id} [autonomous]"
      UPDATE state.stories[story.id].status = "done"
      UPDATE state.dev_cycles.total_qa_passes++
      append_learning("phase-8", "Story {story.id} complete in {attempt} attempt(s)")
      RETURN "done"

    ELSE:
      qa_feedback = qa_result  # Pass to next dev attempt
      UPDATE state.dev_cycles.total_qa_failures++
      IF attempt < maxRetries:
        SHOW "QA failed for {story.id}. Retrying with feedback (attempt {attempt+1}/{maxRetries})..."

    UPDATE state.dev_cycles.total_retries++

  UPDATE state.stories[story.id].status = "failed"
  append_learning("phase-8", "Story {story.id} FAILED after {maxRetries} attempts")
  RETURN "failed"
```

---

## State Persistence

All state reads/writes use the Bash tool with Node.js:

**Read state:**
```bash
node -e "const s=require('./plan/autonomous-state.json');console.log(JSON.stringify(s,null,2));"
```

**Update a phase status:**
```bash
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('plan/autonomous-state.json','utf8'));
s.phases['phase-2']={name:'PRD Creation',status:'complete',started_at:'<ISO>',completed_at:'<ISO>',error:null};
s.current_phase='phase-2';
s.updated_at=new Date().toISOString();
fs.writeFileSync('plan/autonomous-state.json',JSON.stringify(s,null,2));
"
```

**Update requestedPhases:**
```bash
node -e "
const fs=require('fs');
const s=JSON.parse(fs.readFileSync('plan/autonomous-state.json','utf8'));
s.requestedPhases=[2,4,5];
s.updated_at=new Date().toISOString();
fs.writeFileSync('plan/autonomous-state.json',JSON.stringify(s,null,2));
"
```

---

## State File Schema

```json
{
  "version": "1.0.0",
  "created_at": "<ISO timestamp>",
  "updated_at": "<ISO timestamp>",
  "current_phase": "phase-2",
  "requestedPhases": [2, 4, 5],
  "phases": {
    "phase-2": {
      "name": "PRD Creation",
      "status": "running|complete|failed",
      "started_at": "<ISO timestamp>",
      "completed_at": null,
      "error": null
    }
  },
  "stories": {
    "story-1.1": {
      "status": "done|in-progress|failed|blocked",
      "started_at": "<ISO>",
      "completed_at": "<ISO>",
      "attempts": 2
    }
  },
  "dev_cycles": {
    "total_stories_completed": 0,
    "total_qa_passes": 0,
    "total_qa_failures": 0,
    "total_retries": 0
  },
  "errors": []
}
```

---

## Learnings File Format

```markdown
# Autonomous Runner - Learnings

Accumulated learnings from autonomous phase execution.

---

### [phase-2] - 2026-03-02T10:00:00Z

PRD generated with 12 functional requirements, 4 NFRs, and 3 epics.
Output: docs/prd.md

---

### [phase-4] - 2026-03-02T10:45:00Z

Squad "marketing" created with 5 agents.
Output: squads/marketing/

---
```

---

## Error Handling

| Error | Resolution |
| ----- | ---------- |
| Template file not found | SHOW error with path. If --skip-on-fail: mark failed and continue. Else: STOP. |
| Subagent returns no signal | Treat as failure. Retry up to --max-retries. |
| --resume but no state file | SHOW: "No state file found at plan/autonomous-state.json. Run a phase first." |
| Phase 8: no stories and no epics | SHOW: "No stories found and PRD epics may be exhausted. Consider running phase 7 first." |
| Git commit fails in Phase 8 | Log warning, continue to next story (commit failure is non-blocking). |
| Node.js unavailable for state | Fall back to writing JSON manually via Write tool. |

---

## Output Format

**During execution (per phase):**
```
[Phase 2 - PRD Creation] Starting (attempt 1)...
[Phase 2 - PRD Creation] COMPLETE ✓ (attempt 1)

[Phase 4 - Squad Creation] Starting (attempt 1)...
[Phase 4 - Squad Creation] FAILED ✗ — retrying (2/3)...
[Phase 4 - Squad Creation] COMPLETE ✓ (attempt 2)

[Phase 5 - Architecture] FAILED ✗ (3/3 attempts exhausted)
Stopping. Use *run-autonomous --resume or add --skip-on-fail to continue.
```

**Final summary:**
```
=== Execution Report ===
Completed: 2 phases [2, 4]
Failed:    1 phase  [5]
State:     plan/autonomous-state.json
Learnings: plan/autonomous-learnings.md
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Task tool must be available (Claude Code session)
      blocker: true
      error: "Task tool not available. Run *run-autonomous inside Claude Code."
  - [ ] For --resume: plan/autonomous-state.json must exist
      blocker: true (only when --resume used)
      error: "No state file found. Run a phase first to create state."
  - [ ] Phase templates must exist at .aios-core/templates/phase-prompts/
      blocker: true
      error: "Template not found: {path}"
```

---

## Tools Used

- **Task tool** — Spawn each phase as isolated subagent (Claude Code native)
- **Read tool** — Read phase templates and learnings file
- **Write tool** — Create state/learnings files if they don't exist
- **Bash tool** — mkdir, git commit, node -e for JSON state management, story discovery

---

## Related Commands

- `*run-autonomous --resume` — Resume from last saved state
- `bash .aios-core/scripts/autonomous-runner.sh --phases N` — Shell fallback (runs outside Claude Code)
- `*build-autonomous {story-id}` — Autonomous build for a single story (Story 8.1)
- `*build-resume {story-id}` — Resume interrupted story build
- `*workflow {name} --mode=engine` — Workflow execution via Task tool

---

_Native Task-tool autonomous runner for Synkra AIOS — alternative to autonomous-runner.sh_
