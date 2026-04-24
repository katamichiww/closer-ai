import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { QuizData } from "@/types/database";

export async function POST(request: NextRequest) {
  const { company_id, quiz_data } = await request.json() as { company_id: string; quiz_data: QuizData };

  if (!company_id || !quiz_data) {
    return NextResponse.json({ error: "company_id and quiz_data required" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { data: company } = await admin.from("companies").select("id").eq("id", company_id).single();
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { data: prospect, error } = await admin
    .from("prospects")
    .insert({ company_id, quiz_data_json: quiz_data, research_data_json: {} })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const p = prospect as { id: string } | null;
  if (!p) return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });

  // Fire Genspark research in background
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/prospects/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prospect_id: p.id }),
  }).catch(console.error);

  return NextResponse.json({ success: true, prospect_id: p.id });
}
