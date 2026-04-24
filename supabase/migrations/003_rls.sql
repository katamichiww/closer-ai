alter table public.companies          enable row level security;
alter table public.brand_assets       enable row level security;
alter table public.prospects          enable row level security;
alter table public.proposals          enable row level security;
alter table public.generated_proposals enable row level security;

-- Companies: owner reads and writes their own
create policy "company_owner_all"
  on public.companies for all
  using  (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Brand assets scoped to company owner
create policy "brand_assets_owner_all"
  on public.brand_assets for all
  using  (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));

-- Historical proposals
create policy "proposals_owner_all"
  on public.proposals for all
  using  (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));

-- Prospects: owner manages, public can insert (quiz submission)
create policy "prospects_owner_all"
  on public.prospects for all
  using  (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));

create policy "quiz_public_insert"
  on public.prospects for insert
  with check (true);

-- Generated proposals
create policy "generated_proposals_owner_all"
  on public.generated_proposals for all
  using  (company_id in (select id from public.companies where owner_id = auth.uid()))
  with check (company_id in (select id from public.companies where owner_id = auth.uid()));
