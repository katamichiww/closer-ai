create type public.proposal_status as enum ('won', 'lost', 'draft');
create type public.brand_asset_type as enum ('logo', 'color_palette', 'guidelines', 'other');

-- One company per admin account / workspace
create table public.companies (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null check (char_length(trim(name)) > 0),
  slug             text        not null unique check (slug ~ '^[a-z0-9-]+$'),
  brand_kit_json   jsonb       not null default '{}',
  voice_guide_text text,
  owner_id         uuid        references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger trg_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

-- Brand assets: logos, palettes, style guides
create table public.brand_assets (
  id                   uuid                    primary key default gen_random_uuid(),
  company_id           uuid                    not null references public.companies(id) on delete cascade,
  type                 public.brand_asset_type not null,
  file_url             text                    not null,
  storage_path         text                    not null,
  extracted_rules_json jsonb                   not null default '{}',
  created_at           timestamptz             not null default now()
);

create index idx_brand_assets_company on public.brand_assets(company_id);

-- Prospects: one row per intake quiz submission
create table public.prospects (
  id                 uuid        primary key default gen_random_uuid(),
  company_id         uuid        not null references public.companies(id) on delete cascade,
  quiz_data_json     jsonb       not null default '{}',
  research_data_json jsonb       not null default '{}',
  sparkpage_url      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_prospects_company on public.prospects(company_id);

create trigger trg_prospects_updated_at
before update on public.prospects
for each row execute function public.set_updated_at();

-- Historical proposals: won/lost, embedded for retrieval
-- embedding: 1536 dims for text-embedding-3-small
create table public.proposals (
  id                 uuid                    primary key default gen_random_uuid(),
  company_id         uuid                    not null references public.companies(id) on delete cascade,
  title              text                    not null check (char_length(trim(title)) > 0),
  content_json       jsonb                   not null default '{}',
  status             public.proposal_status  not null default 'draft',
  prospect_data_json jsonb                   not null default '{}',
  raw_text           text,
  embedding          vector(1536),
  storage_path       text,
  created_at         timestamptz             not null default now(),
  updated_at         timestamptz             not null default now()
);

create index idx_proposals_company_status on public.proposals(company_id, status);

-- HNSW index for fast approximate cosine similarity search
create index idx_proposals_embedding_hnsw
  on public.proposals
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 128);

create trigger trg_proposals_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

-- AI-generated proposals: output from generation pipeline
create table public.generated_proposals (
  id            uuid        primary key default gen_random_uuid(),
  prospect_id   uuid        not null references public.prospects(id) on delete cascade,
  company_id    uuid        not null references public.companies(id) on delete cascade,
  content_json  jsonb       not null default '{}',
  sections_json jsonb       not null default '{}',
  pdf_url       text,
  sparkpage_url text,
  model_used    text        not null default 'claude-opus-4-7',
  tokens_used   int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_generated_company  on public.generated_proposals(company_id);
create index idx_generated_prospect on public.generated_proposals(prospect_id);

create trigger trg_generated_proposals_updated_at
before update on public.generated_proposals
for each row execute function public.set_updated_at();
