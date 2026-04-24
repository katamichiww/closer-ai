import { env } from "@/config/env";

const GENSPARK_BASE_URL = "https://api.genspark.ai/v1";

export async function gensparkFetch<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${GENSPARK_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.GENSPARK_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Genspark API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}
