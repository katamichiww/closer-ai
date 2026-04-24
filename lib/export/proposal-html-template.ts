import type { ProposalSections } from "@/types/database";

const SECTION_LABELS: Record<string, string> = {
  executive_summary: "Executive Summary",
  understanding_of_needs: "Understanding of Needs",
  proposed_approach: "Proposed Approach",
  deliverables: "Deliverables",
  timeline: "Timeline",
  pricing: "Pricing",
  why_us: "Why Us",
  next_steps: "Next Steps",
};

export function buildProposalHtml(params: {
  companyName: string;
  prospectName: string;
  primaryColor: string;
  sections: ProposalSections;
  generatedAt: string;
}): string {
  const { companyName, prospectName, primaryColor, sections, generatedAt } = params;

  const sectionHtml = Object.entries(SECTION_LABELS)
    .map(([key, label]) => {
      const content = sections[key as keyof ProposalSections];
      if (!content) return "";
      return `
      <div class="section">
        <h2 class="section-title">${label}</h2>
        <div class="section-content">${content.replace(/\n/g, "<br/>")}</div>
      </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Proposal for ${prospectName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: "Georgia", serif; color: #1e293b; background: #fff; padding: 60px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid ${primaryColor}; padding-bottom: 32px; margin-bottom: 40px; }
    .company { font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 8px; }
    h1 { font-size: 28px; font-weight: 700; line-height: 1.2; color: #0f172a; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #64748b; }
    .section { margin-bottom: 36px; page-break-inside: avoid; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${primaryColor}; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    .section-content { font-size: 14px; line-height: 1.8; color: #334155; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="header">
    <p class="company">${companyName}</p>
    <h1>Proposal for ${prospectName}</h1>
    <p class="subtitle">Prepared ${new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
  </div>
  ${sectionHtml}
  <div class="footer">
    <span>${companyName}</span>
    <span>Generated with Closer AI</span>
  </div>
</body>
</html>`;
}
