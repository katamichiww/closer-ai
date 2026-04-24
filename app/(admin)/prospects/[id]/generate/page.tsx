import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProposalStreamViewer } from "@/components/proposals/proposal-stream-viewer";
import type { Prospect, QuizData } from "@/types/database";

export default async function GeneratePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data } = await admin.from("prospects").select("id, quiz_data_json, research_data_json").eq("id", id).single();
  if (!data) notFound();

  const prospect = data as Prospect;
  const quiz = prospect.quiz_data_json as QuizData;

  return (
    <div className="animate-fade-up max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Generate Proposal</h1>
        <p className="text-sm text-muted mt-1">
          Creating a brand-perfect proposal for <strong>{quiz.company_name}</strong>
        </p>
      </div>
      <ProposalStreamViewer prospectId={id} prospectName={quiz.company_name} />
    </div>
  );
}
