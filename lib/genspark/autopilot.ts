import { gensparkFetch } from "./client";
import type { GensparkDossier } from "@/types/database";

interface AutopilotResponse {
  enriched: Partial<GensparkDossier>;
}

export async function runAutopilotEnrichment(
  dossier: GensparkDossier,
  companyName: string
): Promise<GensparkDossier> {
  const query = `Enrich and verify this company dossier for ${companyName}. Check for latest funding rounds, leadership changes, product launches, and strategic initiatives.

Current dossier:
${JSON.stringify(dossier, null, 2)}`;

  try {
    const response = await gensparkFetch<AutopilotResponse>("/agent/autopilot", {
      query,
      context: dossier,
    });

    return { ...dossier, ...response.enriched };
  } catch {
    // Autopilot is best-effort — return original dossier if it fails
    return dossier;
  }
}
