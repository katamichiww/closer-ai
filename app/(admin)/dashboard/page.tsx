import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/ui/page-header";
import type { Company } from "@/types/database";
import Link from "next/link";

async function getStats(companyId: string) {
  const admin = createSupabaseAdminClient();
  const [prospects, proposals, generated] = await Promise.all([
    admin.from("prospects").select("id", { count: "exact" }).eq("company_id", companyId),
    admin.from("proposals").select("id", { count: "exact" }).eq("company_id", companyId),
    admin.from("generated_proposals").select("id", { count: "exact" }).eq("company_id", companyId),
  ]);
  return {
    prospects: prospects.count ?? 0,
    proposals: proposals.count ?? 0,
    generated: generated.count ?? 0,
  };
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseAdminClient();
  const { data } = await admin.from("companies").select("*").eq("owner_id", user!.id).single();
  const company = data as Company | null;

  const stats = company ? await getStats(company.id) : { prospects: 0, proposals: 0, generated: 0 };

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={`Welcome back${company ? `, ${company.name}` : ""}`}
        description="Your proposal intelligence workspace. Generate winning proposals in under 5 minutes."
      />

      {!company && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-1">Set up your workspace</h2>
          <p className="text-sm text-muted mb-4">
            Upload past proposals to train Closer AI on what closes deals for your company.
          </p>
          <Link
            href="/onboarding/proposals"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Get started →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Prospects", value: stats.prospects, href: "/prospects", icon: "👥" },
          { label: "Proposals in Library", value: stats.proposals, href: "/onboarding/proposals", icon: "📚" },
          { label: "Proposals Generated", value: stats.generated, href: "/proposals", icon: "⚡" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="block rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm font-medium text-muted">{stat.label}</span>
            </div>
            <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/prospects"
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🚀</span>
            <h3 className="text-sm font-semibold text-foreground">Generate a proposal</h3>
          </div>
          <p className="text-sm text-muted">Pick a prospect and generate a brand-perfect proposal in under 5 minutes.</p>
        </Link>

        <Link
          href="/onboarding/proposals"
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📤</span>
            <h3 className="text-sm font-semibold text-foreground">Upload winning proposals</h3>
          </div>
          <p className="text-sm text-muted">Train Closer AI on your best-performing work to improve future generation.</p>
        </Link>
      </div>
    </div>
  );
}
