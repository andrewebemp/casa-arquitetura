# Task: Triage Incoming User Request and Route to Correct Agent

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | triage-request |
| **status** | `pending` |
| **responsible_executor** | @decorai-chief |
| **execution_type** | `Agent` |
| **input** | Raw user request (text, photo, or combination) |
| **output** | Classified request with routing decision to the appropriate agent |
| **action_items** | 7 steps |
| **acceptance_criteria** | 7 criteria |

## Purpose

Triage incoming user requests and route them to the correct DecorAI agent for execution. As the squad orchestrator, @decorai-chief receives all initial user interactions and must quickly determine what the user needs and which agent can best serve them. This task handles the critical first-contact moment: correct routing means fast value delivery; incorrect routing means wasted time and user frustration. The triage covers new projects, refinement requests, information queries, and account/billing inquiries.

## Inputs

- Raw user request: text message, uploaded photo, or combination
- User context: first-time vs returning user, active projects, subscription tier
- System state: which agents are available, any active pipeline jobs
- Conversation history: previous interactions (if returning user)

## Preconditions

- Request has been received from user (via chat interface, API, or portal integration)
- User identity available (at minimum session ID, ideally user account)
- Agent availability known (all agents in the squad are reachable)

## Steps

1. **Parse request content**
   - Identify input type: text only, photo only, text + photo, reference image
   - Extract intent signals from text:
     - Action verbs: "decorar", "mudar", "melhorar", "mostrar", "comparar", "remover"
     - Object references: "sala", "quarto", "cozinha", "sofa", "parede", "piso"
     - Style references: "moderno", "rustico", "minimalista"
     - Modifier references: "mais claro", "diferente", "parecido com"
   - Detect language and adjust processing (Portuguese primary, English secondary)

2. **Classify request category**
   - NEW PROJECT: user wants to stage a new room (photo + optional text)
   - REFINEMENT: user wants to adjust an existing render ("muda o sofa", "mais claro")
   - STYLE CONSULTATION: user wants style recommendations ("que estilo fica bom?")
   - INFORMATION: user wants to know about pricing, features, or capabilities
   - DIAGNOSTIC: user wants the saleability diagnostic (reverse staging funnel entry)
   - CONTINUATION: user is continuing a previously started project
   - ACCOUNT: billing, subscription, or technical support
   - UNCLEAR: cannot determine intent with confidence

3. **Determine routing target**
   - NEW PROJECT -> @spatial-analyst (always starts with spatial analysis)
   - REFINEMENT -> @conversational-designer (interpret and route refinement)
   - STYLE CONSULTATION -> @interior-strategist (style expertise)
   - INFORMATION -> @decorai-chief handles directly (no routing needed)
   - DIAGNOSTIC -> @staging-architect quick analysis + @proptech-growth funnel
   - CONTINUATION -> Resume with the agent that was last active
   - ACCOUNT -> @decorai-chief handles directly or escalates to support
   - UNCLEAR -> Ask clarifying question before routing

4. **Validate routing prerequisites**
   - For NEW PROJECT: is a photo provided? If not, ask for one
   - For REFINEMENT: is there an active render to refine? If not, check history
   - For STYLE CONSULTATION: is there a room context? If not, ask for room type
   - For CONTINUATION: is the previous session state available?
   - If prerequisites not met, guide user to provide missing information

5. **Prepare routing context**
   - Package the user request with relevant context for the target agent:
     - User request (original text + any uploaded files)
     - User profile (name, subscription tier, previous projects)
     - Active project state (if continuation)
     - Routing classification with confidence level
   - Set priority: free diagnostic < standard project < premium subscription

6. **Execute routing**
   - Hand off to the target agent with prepared context
   - Set a response timeout expectation for the user
   - If routing to multiple agents needed (e.g., style + spatial), coordinate sequence
   - Log routing decision for analytics and improvement

7. **Handle edge cases**
   - Multiple intents in one message: prioritize the primary intent, queue secondary
   - User explicitly asks for specific agent: honor the request if valid
   - All agents busy/unavailable: queue request and notify user of wait time
   - Abusive or inappropriate content: filter and respond appropriately
   - System error during routing: provide graceful fallback with apology and retry option

## Outputs

- **Request Classification** (category, confidence level)
- **Routing Decision** (target agent, rationale)
- **Routing Context Package** (request + user profile + state for target agent)
- **User Acknowledgment** (brief message confirming what's happening)
- **Routing Log** (for analytics and improvement)

## Acceptance Criteria

- [ ] Request content parsed correctly (input type identified, intent signals extracted)
- [ ] Request classified into one of 8 categories with confidence level
- [ ] Routing target determined based on classification
- [ ] Prerequisites validated for the routing target (photo for new project, render for refinement)
- [ ] Context package prepared with all relevant information for target agent
- [ ] User receives acknowledgment of what's happening within 2 seconds
- [ ] Edge cases handled gracefully (multiple intents, explicit agent request, unavailability)

## Quality Gate

- Routing decision must be made within 3 seconds of request receipt
- Misrouting rate must be < 5% (tracked via user correction signals)
- UNCLEAR classification should not exceed 10% of requests -- improve parsing if it does
- User must NEVER be left without acknowledgment -- always respond even if routing fails
- NEW PROJECT requests without photos must not be routed to spatial-analyst -- ask for photo first
- REFINEMENT requests without an active render must check history before declaring no context
- All routing decisions must be logged for analytics and triage improvement
