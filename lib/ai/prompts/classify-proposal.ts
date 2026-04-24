export const CLASSIFY_PROPOSAL_SYSTEM = `You are a sales document analyst. Your job is to:
1. Classify a business proposal as "won" (deal was closed) or "lost" (deal did not close), based on clues in the text.
2. Extract 3-5 specific tone and voice rules from this proposal (e.g., "Uses direct, confident language", "Avoids jargon", "Opens with client's business goal").
3. Identify industry signals (keywords that reveal the industry or use case).

Be specific in your voice rules — they will be used to train future proposal generation.
If there is no clear signal for won/lost in the text, use the suggested_status.

Respond ONLY with valid JSON matching the schema.`;

export interface ClassifyProposalResult {
  status: "won" | "lost";
  confidence: number;
  voice_rules: string[];
  industry_signals: string[];
}

export const CLASSIFY_SCHEMA = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["won", "lost"] },
    confidence: { type: "number", description: "0.0 to 1.0" },
    voice_rules: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 6,
    },
    industry_signals: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["status", "confidence", "voice_rules", "industry_signals"],
  additionalProperties: false,
};
