import { gensparkFetch } from "./client";
import type { GensparkDossier } from "@/types/database";

interface DeepResearchResponse {
  result: {
    company_overview?: string;
    recent_news?: string[];
    decision_makers?: string[];
    tech_stack?: string[];
    company_size?: string;
    funding_stage?: string;
    key_initiatives?: string[];
    website_summary?: string;
    linkedin_summary?: string;
    [key: string]: unknown;
  };
}

export async function runDeepResearch(
  companyName: string,
  website: string,
  industry: string
): Promise<GensparkDossier> {
  const query = `Research this company for a sales proposal:
Company: ${companyName}
Website: ${website}
Industry: ${industry}

Find: company overview, recent news/announcements, key decision makers, tech stack signals, company size, funding stage, key strategic initiatives, LinkedIn summary.`;

  try {
    const response = await gensparkFetch<DeepResearchResponse>("/agent/deep-research", {
      query,
      output_format: "json",
    });

    return {
      ...response.result,
      raw: response.result,
    } as GensparkDossier;
  } catch (error) {
    console.error("Deep research failed:", error);
    return {
      company_overview: `${companyName} (${industry})`,
      website_summary: website,
      raw: {},
    };
  }
}
