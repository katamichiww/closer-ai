import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import type { Company, GeneratedProposal } from "@/types/database";
import Link from "next/link";

export default async function ProposalsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();
  const { data: companyData } = await admin.from("companies").select("id").eq("owner_id", user!.id).single();
  const company = companyData as Pick<Company, "id"> | null;

  const { data: proposalsData } = company
    ? await admin
        .from("generated_proposals")
        .select("id, created_at, sparkpage_url, model_used, prospects(quiz_data_json)")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  type ProposalRow = Pick<GeneratedProposal, "id" | "created_at" | "sparkpage_url" | "model_used"> & {
    prospects: { quiz_data_json: { company_name?: string } } | { quiz_data_json: { company_name?: string } }[] | null;
  };

  const proposals = (proposalsData ?? []) as unknown as ProposalRow[];

  return (
    <div className="animate-fade-up">
      <PageHeader title="Generated Proposals" description="All proposals you have generated with Closer AI." />

      {!proposals.length && (
        <div className="text-center py-16 text-muted text-sm">
          No proposals generated yet. Go to a prospect and click Generate.
        </div>
      )}

      <div className="space-y-3">
        {proposals.map((p) => (
          <Link
            key={p.id}
            href={`/proposals/${p.id}`}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/30 transition-colors"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {(Array.isArray(p.prospects) ? p.prospects[0] : p.prospects)?.quiz_data_json?.company_name ?? "Unnamed"}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {new Date(p.created_at).toLocaleDateString()} · {p.model_used}
              </p>
            </div>
            {p.sparkpage_url && (
              <span className="text-xs text-primary font-medium">Sparkpage active</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
