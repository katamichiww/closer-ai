import type { Company, Prospect, GensparkDossier, ProposalSections } from "@/types/database";

export const PROPOSAL_SYSTEM_PREAMBLE = `You are an expert proposal writer for a B2B services company. Your proposals are:
- Specific to each prospect's situation — never generic
- Written in the company's brand voice (see Brand Voice Guide below)
- Grounded in real prospect intelligence (see Prospect Dossier)
- Structured for maximum impact and conversion

You will generate a complete, client-ready proposal. Each section must be wrapped in XML tags:
<section name="SECTION_NAME">content</section>

Required sections in order:
1. executive_summary
2. understanding_of_needs
3. proposed_approach
4. deliverables
5. timeline
6. pricing
7. why_us
8. next_steps

Rules:
- Make every sentence earn its place. Cut filler.
- Reference specific details from the prospect dossier in every section.
- The executive summary should open with the prospect's specific challenge or goal.
- Pricing should include clear tiers or options with justification.
- Next steps should include a clear call to action with proposed dates.`;

export function buildBrandVoiceBlock(company: Company): string {
  const brandKit = company.brand_kit_json as Record<string, unknown>;
  return `# BRAND VOICE GUIDE — ${company.name}

${company.voice_guide_text ?? "Write in a confident, direct, and client-focused voice."}

Brand Colors: ${(brandKit.primary_color as string) ?? "Not specified"}
Company Name: ${company.name}`;
}

export function buildFewShotExamplesBlock(
  proposals: Array<{ title: string; raw_text: string | null; content_json: Record<string, unknown> }>
): string {
  if (proposals.length === 0) return "# WINNING PROPOSAL EXAMPLES\nNo examples available yet.";

  const examples = proposals
    .map(
      (p, i) => `## Example ${i + 1}: ${p.title}
${(p.raw_text ?? JSON.stringify(p.content_json)).slice(0, 3000)}`
    )
    .join("\n\n---\n\n");

  return `# WINNING PROPOSAL EXAMPLES
These are real proposals that closed deals for this company. Study their structure, voice, and approach.

${examples}`;
}

export function buildGenerationRequest(prospect: Prospect, dossier: GensparkDossier): string {
  const quiz = prospect.quiz_data_json;
  return `# PROSPECT INTELLIGENCE DOSSIER
${JSON.stringify(dossier, null, 2)}

# INTAKE QUIZ DATA
Company: ${quiz.company_name}
Industry: ${quiz.industry}
Website: ${quiz.website}
Project Type: ${quiz.project_type}
Budget Range: ${quiz.budget_range}
Timeline: ${quiz.timeline}
Pain Points: ${quiz.pain_points}
Desired Outcomes: ${quiz.desired_outcomes}
Contact: ${quiz.contact_name} (${quiz.contact_email})

# TASK
Generate a complete proposal for ${quiz.company_name}.
Use the brand voice guide, winning examples, and prospect intelligence above.
Be specific. Reference their actual situation, industry, and goals throughout.
Wrap each section in <section name="SECTION_NAME">...</section> tags.`;
}

export function parseSectionsFromText(text: string): ProposalSections {
  const sections: ProposalSections = {};
  const sectionNames = [
    "executive_summary",
    "understanding_of_needs",
    "proposed_approach",
    "deliverables",
    "timeline",
    "pricing",
    "why_us",
    "next_steps",
  ] as const;

  for (const name of sectionNames) {
    const regex = new RegExp(`<section name="${name}">([\s\S]*?)<\/section>`, "i");
    const match = text.match(regex);
    if (match) {
      sections[name] = match[1].trim();
    }
  }

  return sections;
}
