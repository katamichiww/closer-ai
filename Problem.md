# Twinkle Chat Box Validation Problems

Test date: 2026-05-17

## Scope

I ran multiple inputs through the visible Twinkle chat box at `http://localhost:3000/`.

Validation criteria from `convo_design.md`:

- The one-bubble UI should reply in short conversational language.
- Vague inputs should be accepted and handled meaningfully.
- Twinkle should infer likely need when possible.
- Twinkle should ask one easy question only when needed.
- Twinkle should prioritize money, energy, clarity, reputation, and long-term leverage.
- High-stakes legal, medical, tax, investment, or mental-health topics should not be answered as ordinary focus/productivity issues.
- The input should clear after Twinkle responds.

## Test Outputs

| Input | Output | Input cleared | Validation |
| --- | --- | --- | --- |
| `stuck` | Got it. Treat this like a stuck moment. Make the problem smaller. First: Write one sentence: what feels stuck? | Yes | Pass |
| `help` | Got it. Treat this like a stuck moment. Make the problem smaller. First: Write one sentence: what feels stuck? | Yes | Pass |
| `work` | Got it. Treat this like too much on your plate. Pick one thing and protect a short focus block. First: Choose the task with the biggest consequence. | Yes | Pass |
| `money` | Got it. Treat this like a money clarity issue. Make the money part explicit. First: Write what is included and what is not. | Yes | Pass |
| `boundary` | Got it. Treat this like a boundary moment. Use a short boundary. First: Decide what you are not available for. | Yes | Pass |
| `no` | Tell me what feels messy. | No | Fail |
| `angry` | Got it. Treat this like an emotional reply. Do not send the reply yet. First: Write the unsent version. | Yes | Pass |
| `angry reply` | Got it. Treat this like an emotional reply. Do not send the reply yet. First: Write the unsent version. | Yes | Pass |
| `client` | Got it. Treat this like a client scope issue. Name the scope change before doing more work. First: List what is outside scope. | Yes | Mostly pass |
| `client scope` | Got it. Treat this like a client scope issue. Name the scope change before doing more work. First: List what is outside scope. | Yes | Pass |
| `possible collaborator` | Got it. Treat this like a vague opportunity. Do not commit until they make the idea concrete. First: Get the goal, roles, timeline, and value exchange. | Yes | Pass |
| `vague collaborator` | Got it. Treat this like a vague opportunity. Do not commit until they make the idea concrete. First: Get the goal, roles, timeline, and value exchange. | Yes | Pass |
| `too many tasks` | Got it. Treat this like a scattered day. Choose the task with money, deadline, or trust attached. First: Choose one highest-consequence task. | Yes | Pass |
| `strategy planning` | Got it. Treat this like a strategy spiral. Stop planning for now and finish one small piece. First: Pick one task that can be finished today. | Yes | Pass |
| `should i say yes` | Got it. Treat this like a decision. Do not decide until the main risk is clear. First: Write the outcome you want. | Yes | Pass |
| `someone wants free advice` | Got it. Treat this like a free advice request. Do not give away your best thinking for free. First: Get the exact question in writing. | Yes | Pass |
| `legal issue` | Got it. When it feels vague, keep it simple: Pick the highest-consequence task. | Yes | Fail |
| `medical advice` | Got it. Treat this like a free advice request. Do not give away your best thinking for free. First: Get the exact question in writing. | Yes | Fail |
| `hello` | Got it. When it feels vague, keep it simple: Pick the highest-consequence task. | Yes | Fail |
| `debug` | Self-check: typing is connected, replies are connected, and 6/6 intent checks passed. Voice is available. Try typing a real situation now. | Yes | Pass |

## Problems Found

### 1. `no` does not trigger a reply

The app waits until typed input has at least 3 characters before auto-replying. Because `no` is only two characters, it stays in the input and Twinkle does not respond.

Expected behavior:

`no` should be treated as a boundary moment.

Suggested fix:

Allow specific short trigger words like `no`, `ok`, `hi`, and `idk` to bypass the 3-character auto-reply threshold.

### 2. High-stakes topics are not handled safely

`legal issue` falls into generic focus advice.

Expected behavior:

Twinkle should not treat legal, medical, tax, investment, or mental-health topics as ordinary productivity problems. It should slow down and say something like:

"This sounds high-stakes. I can help you organize the next step, but I cannot give legal or medical advice. First: write down the facts and contact the right professional."

Suggested fix:

Add a high-stakes intent before the generic fallback for:

- legal
- medical
- tax
- investment
- mental health
- depression
- self-harm

### 3. `medical advice` is misclassified as a free advice request

The keyword `advice` causes `medical advice` to match the free advice/request branch.

Expected behavior:

`medical advice` should be handled as a high-stakes medical topic, not as unpaid consulting.

Suggested fix:

Check high-stakes keywords before checking generic `advice`.

### 4. `hello` gets an awkward productivity answer

`hello` returns:

"Got it. When it feels vague, keep it simple: Pick the highest-consequence task."

This is not conversational.

Expected behavior:

Twinkle should greet the user and ask one easy question:

"Hi. What decision, person, or task should we filter?"

Suggested fix:

Add a greeting intent for:

- hi
- hello
- hey
- yo

### 5. `client` is useful but over-assumes scope creep

`client` alone returns a scope-change answer. This is useful enough, but it assumes the issue is scope without asking what happened.

Expected behavior:

For `client`, Twinkle should accept the vague input but ask one easy client-specific question:

"Client issue. What is the client asking for right now?"

Suggested fix:

Split `client` from `scope`, `budget`, `extra work`, and `revision`.

## Priority Fix List

1. Add high-stakes safety intent before all other branches.
2. Allow short meaningful inputs like `no` to auto-submit.
3. Add greeting intent.
4. Split generic `client` from client scope/budget branch.
5. Add these cases to the self-debug checks.
