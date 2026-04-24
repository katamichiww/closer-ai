import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import type { Prospect, GensparkDossier, QuizData, GeneratedProposal } from "@/types/database";
import Link from "next/link";

export default async function ProspectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();
  const { data: prospectData } = await admin.from("prospects").select("*").eq("id", id).single();
  if (!prospectData) notFound();

  const prospect = prospectData as Prospect;
  const quiz = prospect.quiz_data_json as QuizData;
  const dossier = prospect.research_data_json as GensparkDossier;
  const hasResearch = Object.keys(dossier ?? {}).length > 0;

  const { data: generatedData } = await admin
    .from("generated_proposals")
    .select("id, created_at, sparkpage_url, model_used")
    .eq("prospect_id", id)
    .order("created_at", { ascending: false });

  const generatedProposals = (generatedData ?? []) as Pick<GeneratedProposal, "id" | "created_at" | "sparkpage_url" | "model_used">[];

  return (
    <div className="animate-fade-up max-w-3xl">
      <PageHeader
        title={quiz.company_name}
        description={`${quiz.industry} · ${quiz.project_type}`}
        actions={
          <Link
            href={`/prospects/${id}/generate`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            ⚡ Generate proposal
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Quiz responses</h2>
          <dl className="space-y-2">
            {[
              ["Contact", `${quiz.contact_name} (${quiz.contact_email})`],
              ["Website", quiz.website],
              ["Budget", quiz.budget_range],
              ["Timeline", quiz.timeline],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Pain points</h2>
          <p className="text-sm text-foreground leading-relaxed">{quiz.pain_points}</p>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mt-4 mb-1">Desired outcomes</h2>
          <p className="text-sm text-foreground leading-relaxed">{quiz.desired_outcomes}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Prospect intelligence
          {!hasResearch && <span className="ml-2 text-muted font-normal normal-case animate-pulse-dot">Researching...</span>}
        </h2>
        {hasResearch ? (
          <div className="space-y-3 text-sm">
            {dossier.company_overview && (
              <p className="text-foreground">{dossier.company_overview}</p>
            )}
            {dossier.recent_news?.length ? (
              <div>
                <p className="text-xs text-muted mb-1">Recent news</p>
                <ul className="space-y-1">
                  {dossier.recent_news.slice(0, 3).map((n, i) => (
                    <li key={i} className="text-foreground">• {n}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {dossier.key_initiatives?.length ? (
              <div>
                <p className="text-xs text-muted mb-1">Key initiatives</p>
                <ul className="space-y-1">
                  {dossier.key_initiatives.map((n, i) => (
                    <li key={i} className="text-foreground">• {n}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted">Research is running in the background. Refresh to check status.</p>
        )}
      </div>

      {generatedProposals.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Generated proposals</h2>
          <div className="space-y-2">
            {generatedProposals.map((gp) => (
              <Link
                key={gp.id}
                href={`/proposals/${gp.id}`}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/30 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  {new Date(gp.created_at).toLocaleString()}
                </span>
                <span className="text-xs text-muted">{gp.model_used}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
