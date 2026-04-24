import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import type { GeneratedProposal, ProposalSections, QuizData } from "@/types/database";

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

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data } = await admin
    .from("generated_proposals")
    .select("*, prospects(quiz_data_json)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  type ProposalWithProspect = GeneratedProposal & {
    prospects: { quiz_data_json?: QuizData } | null;
  };

  const proposal = data as ProposalWithProspect;
  const sections = proposal.sections_json as ProposalSections;
  const quiz = proposal.prospects?.quiz_data_json;

  return (
    <div className="animate-fade-up max-w-4xl">
      <PageHeader
        title={`Proposal for ${quiz?.company_name ?? "Unknown"}`}
        description={`Generated ${new Date(proposal.created_at).toLocaleString()} · ${proposal.model_used}`}
        actions={
          <div className="flex items-center gap-2">
            {proposal.sparkpage_url && (
              <a
                href={proposal.sparkpage_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
              >
                Sparkpage ↗
              </a>
            )}
            <a
              href={`/api/export/pdf?proposal_id=${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              Export PDF
            </a>
          </div>
        }
      />

      <div className="space-y-6">
        {Object.entries(SECTION_LABELS).map(([key, label]) => {
          const content = sections[key as keyof ProposalSections];
          if (!content) return null;
          return (
            <div key={key} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">{label}</h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
            </div>
          );
        })}
      </div>

      {proposal.tokens_used && (
        <p className="mt-6 text-xs text-muted text-right">
          {proposal.tokens_used.toLocaleString()} output tokens
        </p>
      )}
    </div>
  );
}
