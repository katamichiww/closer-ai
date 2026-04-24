import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { QuizShell } from "@/components/quiz/quiz-shell";
import type { Company } from "@/types/database";

export default async function QuizPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = await params;
  const admin = createSupabaseAdminClient();

  const { data } = await admin.from("companies").select("id, name, brand_kit_json").eq("slug", companySlug).single();
  if (!data) notFound();

  const company = data as Pick<Company, "id" | "name" | "brand_kit_json">;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">{company.name}</h1>
          <p className="text-sm text-muted mt-1">Tell us about your project — takes under 3 minutes</p>
        </div>
        <QuizShell companyId={company.id} companyName={company.name} />
      </div>
    </div>
  );
}
