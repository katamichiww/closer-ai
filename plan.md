# Twinkle AI Plan

## Product Goal

Build Twinkle as a focused AI decision and prioritization agent that helps the user reduce avoidable failure, protect energy, and choose the highest-signal next action.

Twinkle should not become a generic chatbot, productivity dashboard, or motivational companion. Its advantage is sharp filtering: Signal, Noise, Failure Traps, Human Risk, Recommendation, Next 3 Actions, and Boundary Script.

## Best MVP

The best first version is a simple daily and situational focus tool with three core modes:

1. Decision Filter
   - User gives a decision, opportunity, person, collaboration, task list, or problem.
   - Twinkle responds using the core structure from `convo_design.md`.
   - Output ends with exactly 3 next actions.

2. Daily Signal Check-In
   - User starts the day or says they feel scattered.
   - Twinkle identifies today's direction, signal tasks, noise to avoid, and the first protected action block.
   - Output is short enough to act on immediately.

3. Boundary Script Generator
   - User describes a risky person, vague request, free advice ask, unclear collaboration, or emotionally loaded situation.
   - Twinkle produces a direct message that protects time, money, clarity, or energy.

## Primary User Promise

"Tell Twinkle what is pulling at your attention. Twinkle will separate signal from noise and tell you the next three moves."

## Non-Goals

- Do not build a full project management suite.
- Do not optimize for long journaling by default.
- Do not encourage endless reflection when a clear action is available.
- Do not turn Twinkle into therapy, legal advice, financial advice, or a replacement for professional support.
- Do not add social features until the private user loop works.

## Core UX

### Home Screen

The first screen should be the actual Twinkle workspace, not a marketing page.

Recommended layout:

- A compact mode selector: Decision, Today, Boundary.
- One large input area with a direct prompt.
- A small context panel for active priorities, known traps, and saved boundaries.
- A response panel that renders Twinkle's structured output cleanly.
- A "Make this my next action" control for the chosen focus pick.

### Suggested First Prompt

"What decision, person, opportunity, or task do you want me to filter today?"

### Response Format

For most situational inputs, use:

A. The Real Goal  
B. Signal  
C. Noise  
D. Failure Traps  
E. Human Risk  
F. Twinkle's Recommendation  
G. Next 3 Actions  
H. Boundary Script

Optional add-ons from `convo_design.md` should appear only when useful:

- Inversion Check
- Scenario Tree
- Advantage Conversion
- Blind Spots
- Daily Check-In

## Data Model

Start with a minimal model:

- `twinkle_sessions`
  - `id`
  - `user_id`
  - `mode`
  - `title`
  - `created_at`
  - `updated_at`

- `twinkle_messages`
  - `id`
  - `session_id`
  - `role`
  - `content`
  - `created_at`

- `twinkle_user_context`
  - `id`
  - `user_id`
  - `active_goals`
  - `known_failure_traps`
  - `energy_rules`
  - `boundary_preferences`
  - `updated_at`

- `twinkle_actions`
  - `id`
  - `session_id`
  - `action_text`
  - `status`
  - `due_at`
  - `created_at`

Keep the schema small until repeated usage proves what should be saved.

## AI Behavior

Use `convo_design.md` as the canonical personality and response guide.

System behavior should enforce:

- Direct, concise answers.
- Exactly 3 next actions when the user needs a plan.
- Human-risk filtering whenever another person, client, partner, prospect, or collaborator is involved.
- A slowdown step when the user sounds emotionally activated.
- Clear recommendations instead of vague pros and cons.
- Boundary scripts when the next move involves protecting time, money, attention, or reputation.

Twinkle should ask at most one clarifying question when the missing information would materially change the recommendation. Otherwise, it should make a reasonable assumption and continue.

## Safety Boundaries

Twinkle can help with decision clarity, focus, boundaries, and risk detection.

Twinkle should not:

- Diagnose mental health conditions.
- Give legal, tax, investment, or medical advice as fact.
- Encourage harassment, revenge, deception, illegal action, or public escalation for drama.
- Push the user into irreversible decisions when they are clearly emotionally activated.

When stakes are high, Twinkle should recommend a pause, documentation, and professional advice where appropriate.

## Implementation Phases

### Phase 1: Local MVP

- Add a Twinkle page or route.
- Implement the three modes: Decision, Today, Boundary.
- Add a prompt builder that injects `convo_design.md`.
- Render structured responses with clear section headings.
- Save sessions and messages if auth/database wiring already exists.

### Phase 2: Memory and Context

- Add editable user context: current goals, known traps, energy rules, boundaries.
- Let Twinkle reference the context without over-personalizing.
- Add "save as known trap" and "save as boundary" actions.
- Add a daily check-in shortcut.

### Phase 3: Action Loop

- Convert recommendations into trackable next actions.
- Add lightweight completion states.
- Add "what changed?" follow-ups for unfinished actions.
- Add weekly review: repeated noise, repeated wins, repeated human-risk patterns.

### Phase 4: Automation

- Add optional reminders for protected focus blocks.
- Add templates for common boundary scripts.
- Add recurring daily check-in.
- Suggest automations only when they reduce repeated noise.

## Quality Bar

Twinkle is good when:

- The user feels calmer because the next action is obvious.
- The answer is shorter than the user's confusion.
- The recommendation protects money, energy, clarity, reputation, or long-term leverage.
- Risky people and vague opportunities get filtered before they consume prime attention.
- The user leaves with exactly 3 practical actions, not a bigger mental pile.

## Near-Term Build Checklist

1. Create a Twinkle route and first-screen workspace.
2. Build mode selector: Decision, Today, Boundary.
3. Implement prompt construction from `convo_design.md`.
4. Render Twinkle responses with the A-H structure.
5. Add copy-to-clipboard for Boundary Script.
6. Add "save next action" for the 3 actions.
7. Add basic session persistence.
8. Add user context fields for goals, known traps, energy rules, and boundary preferences.
9. Test with 10 realistic scenarios: scattered day, vague collaboration, free advice request, client pressure, bad actor, overthinking, emotional reply, too many tasks, shiny opportunity, and ignored deadline.

## First Test Scenarios

Use these to evaluate whether Twinkle sounds and acts correctly:

- "I have too many tasks today and I do not know where to start."
- "Someone wants to pick my brain for free."
- "A possible collaborator is exciting but vague."
- "A client is pushing scope without talking about budget."
- "I want to reply while angry."
- "I keep planning the big strategy instead of finishing today's work."

For each test, Twinkle should identify the real goal, separate signal from noise, name the failure trap, assess human risk when relevant, recommend one clear direction, and give only 3 next actions.
