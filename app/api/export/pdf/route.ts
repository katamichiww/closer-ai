import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildProposalHtml } from "@/lib/export/proposal-html-template";
import type { GeneratedProposal, ProposalSections, QuizData } from "@/types/database";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proposalId = request.nextUrl.searchParams.get("proposal_id");
  if (!proposalId) return NextResponse.json({ error: "proposal_id required" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("generated_proposals")
    .select("*, prospects(quiz_data_json), companies(name, brand_kit_json)")
    .eq("id", proposalId)
    .single();

  if (!data) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  type ProposalWithRelations = GeneratedProposal & {
    prospects: { quiz_data_json?: QuizData } | null;
    companies: { name?: string; brand_kit_json?: { primary_color?: string } } | null;
  };

  const proposal = data as ProposalWithRelations;

  const html = buildProposalHtml({
    companyName: proposal.companies?.name ?? "Your Company",
    prospectName: proposal.prospects?.quiz_data_json?.company_name ?? "Client",
    primaryColor: (proposal.companies?.brand_kit_json?.primary_color as string | undefined) ?? "#0f766e",
    sections: proposal.sections_json as ProposalSections,
    generatedAt: proposal.created_at,
  });

  if (proposal.pdf_url) {
    return NextResponse.redirect(proposal.pdf_url);
  }

  try {
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = Buffer.from(
      await page.pdf({ format: "A4", printBackground: true, margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" } })
    );
    await browser.close();

    const storagePath = `exports/${proposal.company_id}/${proposalId}.pdf`;
    await admin.storage.from("closer-ai").upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    const { data: urlData } = admin.storage.from("closer-ai").getPublicUrl(storagePath);

    await admin.from("generated_proposals").update({ pdf_url: urlData.publicUrl }).eq("id", proposalId);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proposal-${proposalId}.pdf"`,
      },
    });
  } catch {
    return new Response(html, { headers: { "Content-Type": "text/html" } });
  }
}
