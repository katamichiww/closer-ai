import OpenAI from "openai";
import {
  normalizeTwinkleResponse,
  runLocalTwinkleAgent,
  twinkleSystemPrompt,
  type TwinkleMode,
} from "@/lib/twinkle";

export const runtime = "nodejs";

const validModes: TwinkleMode[] = ["decision", "today", "boundary"];

function getMode(value: unknown): TwinkleMode {
  return validModes.includes(value as TwinkleMode) ? (value as TwinkleMode) : "decision";
}

function parseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    input?: unknown;
    mode?: unknown;
  } | null;

  const input = typeof body?.input === "string" ? body.input.slice(0, 4000) : "";
  const mode = getMode(body?.mode);
  const fallback = runLocalTwinkleAgent(input, mode);

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(fallback);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.2,
      input: [
        {
          role: "system",
          content: twinkleSystemPrompt,
        },
        {
          role: "user",
          content: `Mode: ${mode}
User input: ${input}

Local Twinkle draft to preserve unless you can make it sharper:
${JSON.stringify(fallback)}

Use the local draft as the truth for risk and next actions. Rewrite the visible bubble so it sounds like kind, simple speech a five-year-old could understand. Keep the answer about the user's exact situation. Keep exactly 3 nextActions.`,
        },
      ],
    });

    const parsed = parseJson(result.output_text);
    const normalized = normalizeTwinkleResponse(parsed, fallback);

    return Response.json({
      ...normalized,
      kind: fallback.kind,
      realGoal: normalized.realGoal || fallback.realGoal,
      signal: normalized.signal.length ? normalized.signal : fallback.signal,
      noise: normalized.noise.length ? normalized.noise : fallback.noise,
      failureTraps: normalized.failureTraps.length ? normalized.failureTraps : fallback.failureTraps,
      humanRisk: fallback.humanRisk,
      recommendation: normalized.recommendation || fallback.recommendation,
      nextActions: fallback.nextActions,
      boundaryScript: normalized.boundaryScript || fallback.boundaryScript,
      modelSource: "openai",
    });
  } catch (error) {
    console.error("Twinkle OpenAI route failed", error);
    return Response.json(fallback);
  }
}
