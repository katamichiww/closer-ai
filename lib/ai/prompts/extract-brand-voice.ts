export const EXTRACT_BRAND_VOICE_SYSTEM = `You are a brand voice analyst. Given a brand style guide or writing guidelines document, extract:
1. Specific tone rules (e.g., "Write in second person, addressing the client as 'you'")
2. Forbidden phrases or patterns (e.g., "Never use passive voice", "Avoid corporate buzzwords like 'synergy'")
3. Structural preferences (e.g., "Lead with the client's problem, not our company's features")
4. Vocabulary preferences (e.g., "Use 'partnership' not 'vendor relationship'")

Be specific and actionable. These rules will be injected into proposal generation prompts.
Respond ONLY with valid JSON.`;

export const BRAND_VOICE_SCHEMA = {
  type: "object",
  properties: {
    tone_rules: { type: "array", items: { type: "string" } },
    forbidden_phrases: { type: "array", items: { type: "string" } },
    structural_preferences: { type: "array", items: { type: "string" } },
    vocabulary_preferences: { type: "array", items: { type: "string" } },
    summary: { type: "string", description: "One paragraph summary of brand voice" },
  },
  required: ["tone_rules", "forbidden_phrases", "structural_preferences", "vocabulary_preferences", "summary"],
  additionalProperties: false,
};

export interface BrandVoiceResult {
  tone_rules: string[];
  forbidden_phrases: string[];
  structural_preferences: string[];
  vocabulary_preferences: string[];
  summary: string;
}
