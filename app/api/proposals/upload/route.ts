import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { extractTextFromFile, detectMimeType } from "@/lib/ingestion/file-router";
import { classifyAndExtractVoice } from "@/lib/ai/haiku";
import { embedText } from "@/lib/ai/embeddings";
import type { Company } from "@/types/database";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const companyId = formData.get("company_id") as string | null;
  const suggestedStatus = (formData.get("status") as "won" | "lost") ?? "won";
  const title = (formData.get("title") as string) || file?.name || "Untitled Proposal";

  if (!file || !companyId) {
    return NextResponse.json({ error: "file and company_id are required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = detectMimeType(file.name, file.type);

  const rawText = await extractTextFromFile(buffer, mimeType);
  const classification = await classifyAndExtractVoice(rawText, suggestedStatus);
  const embedding = await embedText(rawText);

  const admin = createSupabaseAdminClient();

  const fileExt = file.name.split(".").pop() ?? "pdf";
  const storagePath = `proposals/${companyId}/${crypto.randomUUID()}.${fileExt}`;
  await admin.storage.from("closer-ai").upload(storagePath, buffer, { contentType: mimeType });
  const { data: fileData } = admin.storage.from("closer-ai").getPublicUrl(storagePath);

  const { data: proposal, error } = await admin
    .from("proposals")
    .insert({
      company_id: companyId,
      title,
      status: classification.status,
      raw_text: rawText,
      storage_path: storagePath,
      content_json: {
        voice_rules: classification.voice_rules,
        industry_signals: classification.industry_signals,
        confidence: classification.confidence,
        file_url: fileData.publicUrl,
        embedding,
      },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Append extracted voice rules to company voice guide
  const { data: companyData } = await admin.from("companies").select("voice_guide_text").eq("id", companyId).single();
  const company = companyData as Pick<Company, "voice_guide_text"> | null;

  if (company && classification.voice_rules.length > 0) {
    const newRules = classification.voice_rules.map((r) => `• ${r}`).join("\n");
    const updated = company.voice_guide_text ? `${company.voice_guide_text}\n${newRules}` : newRules;
    await admin.from("companies").update({ voice_guide_text: updated }).eq("id", companyId);
  }

  return NextResponse.json({ proposal, classification });
}
