import OpenAI from "openai";

const fallbackDesires = [
  "I want more calm today.",
  "I want to know what to do first.",
  "I want to make more money.",
  "I want to protect my time.",
  "I want to feel brave enough to say no.",
];

function parseSuggestions(text: string) {
  try {
    const parsed = JSON.parse(text) as { suggestions?: unknown };

    if (Array.isArray(parsed.suggestions)) {
      return parsed.suggestions
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 5);
    }
  } catch {
    return [];
  }

  return [];
}

export async function GET() {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ suggestions: fallbackDesires, modelSource: "local" });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.7,
      input:
        'Give 5 short input placeholder suggestions for Twinkle AI. They should be things people may desire today, written like a simple first-person sentence a five-year-old can understand. Return JSON only: {"suggestions":["..."]}.',
    });

    const suggestions = parseSuggestions(result.output_text);

    return Response.json({
      suggestions: suggestions.length ? suggestions : fallbackDesires,
      modelSource: suggestions.length ? "openai" : "local",
    });
  } catch {
    return Response.json({ suggestions: fallbackDesires, modelSource: "local" });
  }
}
