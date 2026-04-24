import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface SimilarProposal {
  id: string;
  title: string;
  content_json: Record<string, unknown>;
  raw_text: string | null;
  similarity: number;
}

export async function findSimilarWinningProposals(
  companyId: string,
  queryEmbedding: number[],
  limit = 5
): Promise<SimilarProposal[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("match_winning_proposals", {
    query_embedding: queryEmbedding,
    match_company_id: companyId,
    match_count: limit,
  });

  if (error) throw new Error(`Vector search failed: ${error.message}`);
  return (data ?? []) as SimilarProposal[];
}
