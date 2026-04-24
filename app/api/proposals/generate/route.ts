import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { embedText } from "@/lib/ai/embeddings";
import { findSimilarWinningProposals } from "@/lib/vector/similarity-search";
import { createSparkpage } from "@/lib/genspark/sparkpages";
import {
  PROPOSAL_SYSTEM_PREAMBLE,
  buildBrandVoiceBlock,
  buildFewShotExamplesBlock,
  buildGenerationRequest,
  parseSectionsFromText,
} from "@/lib/ai/prompts/generate-proposal";
import { createSSEStream } from "@/lib/utils/stream";
import type { Company, Prospect, GensparkDossier } from "@/types/database";
import type Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prospect_id } = await request.json() as { prospect_id: string };
  if (!prospect_id) return NextResponse.json({ error: "prospect_id required" }, { status: 400 });

  const admin = createSupabaseAdminClient();

  const { data: prospectData } = await admin.from("prospects").select("*").eq("id", prospect_id).single();
  if (!prospectData) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  const prospect = prospectData as Prospect;

  const { data: companyData } = await admin.from("companies").select("*").eq("id", prospect.company_id).single();
  if (!companyData) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  const company = companyData as Company;

  const { readable, send, close } = createSSEStream();

  // Fire generation async — stream response immediately
  (async () => {
    try {
      const quiz = prospect.quiz_data_json;
      const dossier = (prospect.research_data_json as GensparkDossier) ?? {};

      const prospectSummary = `${quiz.company_name} ${quiz.industry} ${quiz.project_type} ${quiz.pain_points}`;
      const embedding = await embedText(prospectSummary);

      const similarProposals = await findSimilarWinningProposals(company.id, embedding, 5);

      const anthropic = getAnthropicClient();

      const fullContent: string[] = [];
      let currentSection = "";
      let currentSectionContent = "";
      let tokensUsed = 0;

      type CacheableBlock = Anthropic.TextBlockParam & { cache_control?: { type: "ephemeral" } };

      const systemBlocks: CacheableBlock[] = [
        {
          type: "text",
          text: PROPOSAL_SYSTEM_PREAMBLE,
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: buildBrandVoiceBlock(company),
          cache_control: { type: "ephemeral" },
        },
      ];

      type CacheableContent = Anthropic.ContentBlockParam & { cache_control?: { type: "ephemeral" } };

      const userContent: CacheableContent[] = [
        {
          type: "text",
          text: buildFewShotExamplesBlock(similarProposals),
          cache_control: { type: "ephemeral" },
        },
        {
          type: "text",
          text: buildGenerationRequest(prospect, dossier),
        },
      ];

      const stream = anthropic.messages.stream({
        model: "claude-opus-4-7",
        max_tokens: 16000,
        system: systemBlocks,
        messages: [
          {
            role: "user",
            content: userContent,
          },
        ],
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          const text = event.delta.text;
          fullContent.push(text);
          currentSectionContent += text;

          const startMatch = text.match(/<section name="([^"]+)">/);
          if (startMatch) {
            currentSection = startMatch[1];
            currentSectionContent = "";
            send({ type: "section_start", section: currentSection });
          }

          if (text.includes("</section>") && currentSection) {
            const sectionText = currentSectionContent
              .replace(/<section name="[^"]+">/g, "")
              .replace(/<\/section>/g, "")
              .trim();
            send({ type: "section_complete", section: currentSection, content: sectionText });
            currentSection = "";
            currentSectionContent = "";
          } else if (currentSection) {
            const cleanText = text
              .replace(/<section name="[^"]+">/g, "")
              .replace(/<\/section>/g, "");
            if (cleanText) send({ type: "text_delta", text: cleanText });
          }
        }

        if (event.type === "message_delta" && event.usage) {
          tokensUsed = event.usage.output_tokens;
        }
      }

      const fullText = fullContent.join("");
      const sections = parseSectionsFromText(fullText);

      const { data: generatedProposal } = await admin
        .from("generated_proposals")
        .insert({
          prospect_id,
          company_id: company.id,
          sections_json: sections,
          content_json: { full_text: fullText },
          model_used: "claude-opus-4-7",
          tokens_used: tokensUsed,
        })
        .select()
        .single();

      const gp = generatedProposal as { id: string } | null;

      let sparkpageUrl: string | null = null;
      if (gp) {
        sparkpageUrl = await createSparkpage({
          title: `Proposal for ${quiz.company_name}`,
          content: fullText,
          companyName: company.name,
          prospectCompany: quiz.company_name,
        });

        if (sparkpageUrl) {
          await admin.from("generated_proposals").update({ sparkpage_url: sparkpageUrl }).eq("id", gp.id);
        }

        send({ type: "generation_complete", proposal_id: gp.id, sparkpage_url: sparkpageUrl });
      }
    } catch (err) {
      send({ type: "error", message: err instanceof Error ? err.message : "Generation failed" });
    } finally {
      close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
