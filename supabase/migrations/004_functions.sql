-- Similarity search: find the most similar winning proposals for a given company.
-- Called from lib/vector/similarity-search.ts via supabase.rpc()
create or replace function public.match_winning_proposals(
  query_embedding  vector(1536),
  match_company_id uuid,
  match_count      int default 5
)
returns table (
  id           uuid,
  title        text,
  content_json jsonb,
  raw_text     text,
  similarity   float
)
language sql stable as $$
  select
    p.id,
    p.title,
    p.content_json,
    p.raw_text,
    1 - (p.embedding <=> query_embedding) as similarity
  from public.proposals p
  where
    p.company_id = match_company_id
    and p.status = 'won'
    and p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

-- Partial index: only index won proposals with embeddings for faster retrieval
create index if not exists idx_proposals_won_embedding
  on public.proposals(company_id)
  where status = 'won' and embedding is not null;
