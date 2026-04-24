import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { runDeepResearch } from "@/lib/genspark/deep-research";
import { runAutopilotEnrichment } from "@/lib/genspark/autopilot";
import type { Prospect } from "@/types/database";

export async function POST(request: NextRequest) {
  const { prospect_id } = await request.json() as { prospect_id: string };
  if (!prospect_id) return NextResponse.json({ error: "prospect_id required" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("prospects").select("*").eq("id", prospect_id).single();

  if (error || !data) return NextResponse.json({ error: "Prospect not found" }, { status: 404 });

  const prospect = data as Prospect;
  const quiz = prospect.quiz_data_json;

  const dossier = await runDeepResearch(quiz.company_name, quiz.website, quiz.industry);
  const enriched = await runAutopilotEnrichment(dossier, quiz.company_name);

  await admin.from("prospects").update({ research_data_json: enriched }).eq("id", prospect_id);

  return NextResponse.json({ success: true, dossier: enriched });
}
