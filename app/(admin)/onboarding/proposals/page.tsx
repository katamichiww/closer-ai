import { PageHeader } from "@/components/ui/page-header";
import { ProposalUploadForm } from "@/components/onboarding/proposal-upload-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Company, Proposal } from "@/types/database";

export default async function OnboardingProposalsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();
  const { data: companyData } = await admin.from("companies").select("id, name").eq("owner_id", user!.id).single();
  const company = companyData as Pick<Company, "id" | "name"> | null;

  const { data: proposalsData } = company
    ? await admin
        .from("proposals")
        .select("id, title, status, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  const proposals = (proposalsData ?? []) as Pick<Proposal, "id" | "title" | "status" | "created_at">[];

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Proposal Library"
        description="Upload your past proposals — both won and lost. Closer AI learns what closes deals from your history."
      />

      {!company && (
        <div className="mb-6 rounded-xl bg-accent border border-primary/20 p-4 text-sm text-primary">
          You need to complete company setup before uploading proposals.
        </div>
      )}

      {company && <ProposalUploadForm companyId={company.id} />}

      {proposals.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-foreground mb-4">Uploaded proposals</h2>
          <div className="space-y-2">
            {proposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <span className="text-sm font-medium text-foreground">{p.title}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  p.status === "won"
                    ? "bg-success/10 text-success"
                    : p.status === "lost"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/10 text-muted"
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
