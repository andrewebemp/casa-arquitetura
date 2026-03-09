# Task: Handle Ambiguous Instructions Using NCF Clarification Patterns

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | resolve-ambiguity |
| **status** | `pending` |
| **responsible_executor** | @conversational-designer |
| **execution_type** | `Agent` |
| **input** | Ambiguous user instruction + current design context |
| **output** | Clarified instruction ready for pipeline execution |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Handle ambiguous or underspecified user instructions using Natural Conversation Framework (NCF) clarification patterns. When a user says "make it better", "I don't like it", or "something more lively", the system cannot execute a pipeline operation without understanding the specific intent. This task uses structured clarification techniques to efficiently resolve ambiguity while maintaining natural conversation flow, minimizing the number of questions needed and maximizing information gained per interaction.

## Inputs

- Ambiguous instruction from user (classified as ambiguous by interpret-refinement)
- Current render image and metadata
- Conversation history (prior instructions and responses)
- User specification history (stated preferences and constraints)
- Ambiguity classification from interpret-refinement (what is unclear)

## Preconditions

- Instruction has been classified as ambiguous by interpret-refinement
- At least one render exists as context
- Conversation history available for context analysis

## Steps

1. **Classify ambiguity type**
   - Vague modifier: "make it better", "more interesting" (what dimension to change?)
   - Missing target: "change the color" (which element? which color?)
   - Subjective judgment: "I don't like it" (what specifically? style, colors, layout?)
   - Contradictory: "modern but cozy and rustic" (which aspects of each?)
   - Incomplete: "like that other one" (which reference?)
   - Scope unclear: "change everything" vs "small adjustments" ambiguity

2. **Select NCF clarification pattern**
   - For vague modifiers: Dimensional clarification
     - "When you say 'better', which aspect would you like to improve: the colors, the furniture style, the lighting, or the overall layout?"
   - For missing targets: Constrained choice
     - "Which element would you like to change? [show numbered elements in the render]"
   - For subjective judgment: Laddering technique
     - "What specifically bothers you? Is it the colors, the furniture placement, or the overall mood?"
   - For contradictory: Priority resolution
     - "Modern and rustic can blend, but I need to know: should the room feel more modern with rustic accents, or more rustic with modern touches?"
   - For incomplete references: Context reconstruction
     - "Can you describe which design you're referring to, or was it from an earlier version?"

3. **Formulate clarification question**
   - Keep questions specific and bounded (2-4 options, not open-ended)
   - Include visual references where possible (point to elements in the render)
   - Offer the most likely interpretation as a default option
   - Frame questions positively ("What would you like?" not "What's wrong?")
   - Maximum 2 questions per clarification round

4. **Analyze clarification response**
   - Parse the user's response for actionable information
   - Extract: target element, desired change, scope, intensity
   - If still ambiguous after 1 round, try a different clarification pattern
   - If clear after response, proceed to instruction structuring

5. **Apply contextual inference**
   - Use conversation history to fill remaining gaps
   - Apply user preference patterns: if they consistently choose warm tones, default to warm
   - Use render metadata to constrain possibilities
   - Apply "most common intent" heuristics for common phrases:
     - "make it warmer" -> increase warm tones in color palette (80% probability)
     - "looks fake" -> quality/realism issue, not style preference (90% probability)
     - "more plants" -> add decorative plants, keep everything else (95% probability)

6. **Validate resolved interpretation**
   - Present interpreted instruction back to user for confirmation:
     - "I understood: change the wall color from grey to warm beige, keeping furniture and floor. Is that right?"
   - If confirmed, proceed to structured operation
   - If corrected, incorporate correction and re-validate

7. **Hand off clarified instruction**
   - Convert resolved instruction to structured format
   - Route back to interpret-refinement for pipeline mapping
   - Log the ambiguity type and resolution pattern for learning
   - Update user preference model with new data points

## Outputs

- **Ambiguity Classification** (type and severity)
- **Clarification Question(s)** using appropriate NCF pattern
- **Resolved Instruction** in clear, actionable language
- **Validation Confirmation** from user
- **Structured Operation** ready for interpret-refinement pipeline mapping

## Acceptance Criteria

- [ ] Ambiguity correctly classified into one of 6 types
- [ ] Appropriate NCF clarification pattern selected and applied
- [ ] Clarification question is specific, bounded (2-4 options), and actionable
- [ ] Maximum 2 clarification rounds before resolution (not interrogation)
- [ ] Resolved instruction validated with user before execution
- [ ] Contextual inference applied using conversation history and preference patterns
- [ ] Clarified instruction structured for interpret-refinement consumption

## Quality Gate

- Never guess when ambiguity exists -- always clarify before executing
- Questions must feel natural, not like a form filling exercise
- Maximum 2 clarification rounds -- if still ambiguous after 2 rounds, offer 3 concrete options and ask user to pick
- Default options should be provided based on most-likely interpretation
- Conversation tone must remain helpful and supportive, not frustrating
- Log ambiguity patterns for future system improvement (common ambiguities should become auto-resolved)
