import OpenAI from "openai";
import { env } from "@/config/env";

let _client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return _client;
}

// Max tokens for text-embedding-3-small is 8191
const MAX_CHARS = 24000;

export async function embedText(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const truncated = text.slice(0, MAX_CHARS);
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: truncated,
    dimensions: 1536,
  });
  return response.data[0].embedding;
}
