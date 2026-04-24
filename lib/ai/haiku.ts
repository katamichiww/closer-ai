import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./anthropic";
import {
  CLASSIFY_PROPOSAL_SYSTEM,
  CLASSIFY_SCHEMA,
  type ClassifyProposalResult,
} from "./prompts/classify-proposal";
import {
  EXTRACT_BRAND_VOICE_SYSTEM,
  BRAND_VOICE_SCHEMA,
  type BrandVoiceResult,
} from "./prompts/extract-brand-voice";

type InputSchema = Anthropic.Tool["input_schema"];

export async function classifyAndExtractVoice(
  rawText: string,
  suggestedStatus: "won" | "lost"
): Promise<ClassifyProposalResult> {
  const client = getAnthropicClient();
  const truncated = rawText.slice(0, 20000);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: `${CLASSIFY_PROPOSAL_SYSTEM}\n\nSuggested status (use as fallback if text is ambiguous): ${suggestedStatus}`,
    messages: [{ role: "user", content: truncated }],
    tools: [
      {
        name: "classify_proposal",
        description: "Classify and analyze the proposal",
        input_schema: CLASSIFY_SCHEMA as InputSchema,
      },
    ],
    tool_choice: { type: "any" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return { status: suggestedStatus, confidence: 0.5, voice_rules: [], industry_signals: [] };
  }

  return toolUse.input as ClassifyProposalResult;
}

export async function extractBrandVoice(rawText: string): Promise<BrandVoiceResult> {
  const client = getAnthropicClient();
  const truncated = rawText.slice(0, 20000);

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: EXTRACT_BRAND_VOICE_SYSTEM,
    messages: [{ role: "user", content: truncated }],
    tools: [
      {
        name: "extract_brand_voice",
        description: "Extract brand voice rules from the guidelines",
        input_schema: BRAND_VOICE_SCHEMA as InputSchema,
      },
    ],
    tool_choice: { type: "any" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return {
      tone_rules: [],
      forbidden_phrases: [],
      structural_preferences: [],
      vocabulary_preferences: [],
      summary: "",
    };
  }

  return toolUse.input as BrandVoiceResult;
}
