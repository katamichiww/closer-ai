export type TwinkleMode = "decision" | "today" | "boundary";

export type TwinkleResponse = {
  mode: TwinkleMode;
  kind: string;
  bubble: string;
  realGoal: string;
  signal: string[];
  noise: string[];
  failureTraps: string[];
  humanRisk: string;
  recommendation: string;
  nextActions: [string, string, string];
  boundaryScript: string;
  modelSource: "openai" | "local";
};

export const twinkleModes: Array<{
  id: TwinkleMode;
  label: string;
  description: string;
  prompt: string;
}> = [
  {
    id: "decision",
    label: "Decision Filter",
    description: "Sort a decision, person, opportunity, or messy task.",
    prompt: "What decision, person, opportunity, or task do you want me to filter today?",
  },
  {
    id: "today",
    label: "Daily Signal Check-In",
    description: "Find the highest-signal move for the day.",
    prompt: "What is pulling at your attention today?",
  },
  {
    id: "boundary",
    label: "Boundary Script Generator",
    description: "Protect time, money, attention, reputation, or energy.",
    prompt: "What request, person, or situation needs a cleaner boundary?",
  },
];

export const sampleInputs = [
  "I have too many tasks today and I do not know where to start.",
  "Someone wants to pick my brain for free.",
  "A possible collaborator is exciting but vague.",
  "A client is pushing scope without talking about budget.",
  "I want to reply while angry.",
  "I keep planning the big strategy instead of finishing today's work.",
];

export const twinkleSystemPrompt = `You are Twinkle AI, a focused decision and prioritization agent.

Use the Signal-to-Noise Framework from the product brief:
- Separate Signal from Noise.
- Name Failure Traps.
- Include Human Risk whenever people, clients, partners, collaborators, prospects, or requests are involved.
- Protect money, energy, clarity, reputation, and long-term leverage.
- If the user seems emotionally activated, slow the decision down before recommending action.
- Ask at most one clarifying question only if missing information would materially change the recommendation. Otherwise make a reasonable assumption and continue.
- Do not give legal, medical, tax, investment, or mental health advice as fact.
- Do not behave like a generic chatbot or project management suite.
- The visible bubble is for a very young reader. Use tiny, plain words. No jargon.
- The bubble must answer the user's exact question or situation, not a random generic prompt.

Return concise JSON only with this exact shape:
{
  "kind": "short everyday label",
  "bubble": "one short conversational speech bubble in very plain language: acknowledge, answer the situation, give one clear next move",
  "realGoal": "A. The Real Goal",
  "signal": ["1-3 concise signal items"],
  "noise": ["1-3 concise noise items"],
  "failureTraps": ["1-3 concise failure traps"],
  "humanRisk": "Human Risk assessment, or 'Low unless another person controls the outcome.'",
  "recommendation": "Clear recommendation: do it, don't do it, pause, clarify, negotiate, delegate, automate, ignore, or exit.",
  "nextActions": ["exactly action 1", "exactly action 2", "exactly action 3"],
  "boundaryScript": "Short plain-language script, or a brief protective script if time, money, attention, reputation, or energy is involved."
}`;

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function hasPeopleRisk(text: string) {
  return includesAny(text, [
    "someone",
    "client",
    "partner",
    "collaborator",
    "collaboration",
    "prospect",
    "customer",
    "friend",
    "boss",
    "team",
    "they",
    "person",
    "people",
    "reply",
    "message",
    "call",
    "scope",
    "budget",
  ]);
}

function response(
  mode: TwinkleMode,
  data: Omit<TwinkleResponse, "mode" | "modelSource">,
): TwinkleResponse {
  return { mode, modelSource: "local", ...data };
}

export function runLocalTwinkleAgent(input: string, mode: TwinkleMode): TwinkleResponse {
  const lower = input.toLowerCase();
  const compactWords = lower.trim().split(/\s+/).filter(Boolean);

  if (!lower.trim()) {
    return response(mode, {
      kind: "missing situation",
      bubble: "Name one messy thing. One sentence is enough.",
      realGoal: "Turn a vague pull on your attention into a filterable situation.",
      signal: ["The decision, person, opportunity, or task in front of you."],
      noise: ["Trying to explain the whole backstory before starting."],
      failureTraps: ["Staying vague long enough that nothing moves."],
      humanRisk: "Unknown until a person or dependency is named.",
      recommendation: "Type one sentence and let Twinkle filter it.",
      nextActions: [
        "Name the messy thing in one sentence.",
        "Include the person or deadline if there is one.",
        "Run the filter.",
      ],
      boundaryScript: "Not needed yet.",
    });
  }

  if (includesAny(lower, ["angry", "mad", "furious", "annoyed", "upset", "heated", "reply while angry"])) {
    return response(mode, {
      kind: "emotional reply",
      bubble: "Got it. This is a reputation-risk moment. Do not send yet. First: write the unsent version.",
      realGoal: "Protect your reputation and leverage before reacting.",
      signal: ["Pause before sending anything permanent.", "Respond only to the factual next step."],
      noise: ["Winning the moment.", "Letting heat choose the wording."],
      failureTraps: ["A satisfying reply creates cleanup work.", "Tone becomes the issue instead of the real issue."],
      humanRisk: "High while emotionally activated. Slow the decision down before contacting them.",
      recommendation: "Pause, then send only the factual request if a reply is still needed.",
      nextActions: [
        "Write the version you will not send.",
        "Wait 20 minutes before replying.",
        "Send one factual request or wait until tomorrow.",
      ],
      boundaryScript: "I want to respond clearly, so I am going to pause and come back with the specific next step.",
    });
  }

  if (includesAny(lower, ["free", "pick my brain", "coffee chat", "quick call", "can i ask you", "advice"])) {
    return response(mode, {
      kind: "free advice request",
      bubble: "Got it. Treat this like a boundary moment. Protect the value. First: ask for the exact question in writing.",
      realGoal: "Protect expertise, time, and value exchange.",
      signal: ["Clear scope.", "A fair exchange.", "Written context before access."],
      noise: ["Vague access disguised as opportunity.", "People-pleasing because the request sounds small."],
      failureTraps: ["Giving away the valuable part too early.", "Letting a casual call become unpaid consulting."],
      humanRisk: "Medium to high until they show clarity and respect for value exchange.",
      recommendation: "Clarify first, then offer a paid option if it needs real thinking.",
      nextActions: [
        "Ask for the specific question and desired outcome in writing.",
        "Offer a paid consult if the answer needs a call.",
        "Decline if they resist scope or value exchange.",
      ],
      boundaryScript: "Send me the specific question and outcome you want. If it needs a call, I can share my paid consult options.",
    });
  }

  if (includesAny(lower, ["client", "scope", "budget", "invoice", "paid", "payment", "extra work", "revision"])) {
    return response(mode, {
      kind: "client scope issue",
      bubble: "Got it. This is a scope-and-money issue. Do not absorb it silently. First: name what changed.",
      realGoal: "Protect delivery quality, trust, and revenue.",
      signal: ["What changed from the original agreement.", "Budget, timeline, or tradeoff options.", "Written agreement before more work."],
      noise: ["Avoiding the money conversation.", "Doing extra work to keep things comfortable."],
      failureTraps: ["Normalizing unpaid scope expansion.", "Training the client that budget follows work instead of preceding it."],
      humanRisk: "Medium. The client may be unclear rather than malicious, but ambiguity currently benefits them.",
      recommendation: "Pause the extra work and clarify scope, budget, and timeline.",
      nextActions: [
        "List what is outside the agreed scope.",
        "Send budget or tradeoff options.",
        "Wait for written agreement before continuing.",
      ],
      boundaryScript: "This adds scope. I can add budget and timeline, or trade it against an existing item. Which option works best?",
    });
  }

  if (includesAny(lower, ["collaborator", "collaboration", "partner", "partnership", "vague", "exciting", "opportunity"])) {
    return response(mode, {
      kind: "vague opportunity",
      bubble: "Got it. Exciting but vague is not a yes. First: ask for goal, roles, timeline, and value exchange.",
      realGoal: "Find out whether the opportunity creates leverage or drains attention.",
      signal: ["Clear role.", "Clear scope and timeline.", "Fair value exchange."],
      noise: ["Excitement without commitments.", "Imagining upside before checking execution."],
      failureTraps: ["You become the project manager for someone else's fog.", "You commit before they prove follow-through."],
      humanRisk: "Medium until they demonstrate clarity, reliability, and a fair exchange.",
      recommendation: "Do not commit until they make the idea concrete.",
      nextActions: [
        "Ask for the goal, roles, timeline, and value exchange.",
        "Look for one proof they can execute.",
        "Decide only after they answer clearly.",
      ],
      boundaryScript: "This sounds interesting. Send the goal, roles, timeline, and value exchange first, then I can decide.",
    });
  }

  if (mode === "today" || includesAny(lower, ["too many", "overwhelmed", "where to start", "tasks", "todo", "to do", "busy", "scattered"])) {
    return response(mode, {
      kind: "scattered day",
      bubble: "Got it. This is a sorting problem. Pick the highest-consequence task first.",
      realGoal: "Get one clean win instead of touching everything.",
      signal: ["The task with money, deadline, trust, or real consequence attached.", "One protected work block."],
      noise: ["Re-sorting the list to feel in control.", "Answering low-value messages first."],
      failureTraps: ["You end the day tired but with nothing finished.", "You confuse motion with progress."],
      humanRisk: hasPeopleRisk(lower) ? "Check who is waiting on you today; prioritize money, trust, and deadline commitments." : "Low unless someone is waiting on you today.",
      recommendation: "Choose the task with the nearest real consequence and protect the first work block.",
      nextActions: [
        "Choose one highest-consequence task.",
        "Work on it for 45 minutes.",
        "Ignore everything else until that block is done.",
      ],
      boundaryScript: "I am in a focus block right now. I will reply after I move the priority forward.",
    });
  }

  if (compactWords.length <= 2 && includesAny(lower, ["stuck", "lost", "confused", "help", "idk", "unsure"])) {
    return response(mode, {
      kind: "stuck moment",
      bubble: "Got it. Make the problem smaller. First: write one sentence about what feels stuck.",
      realGoal: "Get out of fog with one small clarity move.",
      signal: ["The next action that makes the situation clearer."],
      noise: ["Trying to solve the whole thing at once."],
      failureTraps: ["Waiting until you feel fully clear before moving."],
      humanRisk: "Unknown until a person is named.",
      recommendation: "Make the problem smaller.",
      nextActions: [
        "Write one sentence about what feels stuck.",
        "Pick the smallest action you can finish in 10 minutes.",
        "Do that before thinking about the whole plan.",
      ],
      boundaryScript: "I need a little time to get clear before I answer.",
    });
  }

  if (mode === "boundary" || compactWords.length <= 2 && includesAny(lower, ["boundary", "no", "time", "energy", "drained"])) {
    return response(mode, {
      kind: "boundary moment",
      bubble: "Got it. Use a short boundary. First: decide what you are not available for.",
      realGoal: "Protect time, money, attention, reputation, or energy without overexplaining.",
      signal: ["A short no.", "One clear condition if you are open to it."],
      noise: ["Explaining so much that the boundary becomes negotiable."],
      failureTraps: ["Saying yes because the no feels uncomfortable.", "Letting access expand without agreement."],
      humanRisk: "Medium if someone keeps pushing after you are clear.",
      recommendation: "Set the boundary in one or two sentences.",
      nextActions: [
        "Decide what you are not available for.",
        "Write the boundary in one sentence.",
        "Send it without extra justification.",
      ],
      boundaryScript: "I cannot take that on right now. I will let you know if that changes.",
    });
  }

  if (includesAny(lower, ["strategy", "planning", "plan", "big picture", "overthinking", "thinking"])) {
    return response(mode, {
      kind: "strategy spiral",
      bubble: "Got it. This is strategy trying to dodge execution. First: finish one concrete piece today.",
      realGoal: "Turn thinking into visible progress today.",
      signal: ["One finished action that proves the strategy is real."],
      noise: ["More planning before the next concrete move.", "Reopening the big picture to avoid a small finish."],
      failureTraps: ["You confuse clarity-seeking with avoidance.", "The strategy gets smarter while the work stays unfinished."],
      humanRisk: "Low unless the delay affects a client, collaborator, or promise.",
      recommendation: "Stop planning for now and finish one small piece.",
      nextActions: [
        "Pick one task that can be finished today.",
        "Set a 30-minute timer.",
        "Only reopen strategy after the task is done.",
      ],
      boundaryScript: "I am not available for more planning until I finish the next concrete deliverable.",
    });
  }

  return response(mode, {
    kind: "general focus",
    bubble: "Got it. Keep it simple. Start with the action that creates the most clarity.",
    realGoal: "Protect momentum on the work with real consequence.",
    signal: ["The work tied to money, trust, deadline, clarity, or leverage."],
    noise: ["Sorting forever instead of starting.", "Treating every input as equally urgent."],
    failureTraps: ["Touching everything and finishing nothing.", "Saying yes before the cost is visible."],
    humanRisk: hasPeopleRisk(lower) ? "People are involved, so check clarity, incentives, reliability, and whether they respect boundaries." : "Low unless another person controls the outcome.",
    recommendation: "Start with the action that creates the most clarity and reduces the biggest risk.",
    nextActions: [
      "Name the outcome you need.",
      "Choose the highest-consequence action.",
      "Block 30 minutes and do only that.",
    ],
    boundaryScript: hasPeopleRisk(lower)
      ? "Before I decide, I need the goal, timeline, scope, and value exchange clear."
      : "I am protecting a focus block first. I can come back with a clear answer after that.",
  });
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function normalizeTwinkleResponse(
  value: unknown,
  fallback: TwinkleResponse,
): TwinkleResponse {
  if (!value || typeof value !== "object") {
    return fallback;
  }

  const data = value as Record<string, unknown>;
  const nextActions = asStringArray(data.nextActions, fallback.nextActions);

  while (nextActions.length < 3) {
    nextActions.push(fallback.nextActions[nextActions.length]);
  }

  return {
    mode: fallback.mode,
    modelSource: "openai",
    kind: typeof data.kind === "string" ? data.kind : fallback.kind,
    bubble: typeof data.bubble === "string" ? data.bubble : fallback.bubble,
    realGoal: typeof data.realGoal === "string" ? data.realGoal : fallback.realGoal,
    signal: asStringArray(data.signal, fallback.signal),
    noise: asStringArray(data.noise, fallback.noise),
    failureTraps: asStringArray(data.failureTraps, fallback.failureTraps),
    humanRisk: typeof data.humanRisk === "string" ? data.humanRisk : fallback.humanRisk,
    recommendation: typeof data.recommendation === "string" ? data.recommendation : fallback.recommendation,
    nextActions: [nextActions[0], nextActions[1], nextActions[2]],
    boundaryScript: typeof data.boundaryScript === "string" ? data.boundaryScript : fallback.boundaryScript,
  };
}
