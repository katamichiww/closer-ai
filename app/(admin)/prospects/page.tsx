import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import type { Company, Prospect } from "@/types/database";
import Link from "next/link";

export default async function ProspectsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();
  const { data: companyData } = await admin.from("companies").select("id, name, slug").eq("owner_id", user!.id).single();
  const company = companyData as Pick<Company, "id" | "name" | "slug"> | null;

  const { data: prospectsData } = company
    ? await admin
        .from("prospects")
        .select("id, quiz_data_json, research_data_json, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const prospects = (prospectsData ?? []) as Pick<Prospect, "id" | "quiz_data_json" | "research_data_json" | "created_at">[];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Prospects"
        description="Prospects who have filled in your intake quiz."
        actions={
          company && (
            <a
              href={`/quiz/${company.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
            >
              Share quiz link ↗
            </a>
          )
        }
      />

      {!prospects.length && (
        <div className="text-center py-16 text-muted text-sm">
          No prospects yet. Share your quiz link to get started.
        </div>
      )}

      <div className="space-y-3">
        {prospects.map((p) => {
          const quiz = p.quiz_data_json;
          const hasResearch = Object.keys(p.research_data_json ?? {}).length > 0;

          return (
            <Link
              key={p.id}
              href={`/prospects/${p.id}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/30 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{quiz.company_name ?? "Unknown"}</p>
                <p className="text-xs text-muted mt-0.5">
                  {quiz.industry} · {quiz.project_type}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {hasResearch ? (
                  <span className="text-xs text-success font-medium">Research ready</span>
                ) : (
                  <span className="text-xs text-muted animate-pulse-dot">Researching...</span>
                )}
                <span className="text-muted text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
