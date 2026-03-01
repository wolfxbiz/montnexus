-- ════════════════════════════════════════════════════════════════════════
-- CRM Schema — Montnexus
-- Run in Supabase SQL Editor (safe to re-run — uses IF NOT EXISTS)
-- ════════════════════════════════════════════════════════════════════════

-- ── Leads ────────────────────────────────────────────────────────────────
create table if not exists public.crm_leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  company     text,
  message     text,
  source      text not null default 'manual'
              check (source in ('website_form','instagram','facebook','linkedin','referral','manual','csv_import')),
  status      text not null default 'new'
              check (status in ('new','contacted','qualified','proposal_sent','won','lost')),
  tags        text[],
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Clients ───────────────────────────────────────────────────────────────
create table if not exists public.crm_clients (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references public.crm_leads(id) on delete set null,
  name        text not null,
  email       text not null,
  phone       text,
  company     text,
  address     text,
  city        text,
  country     text default 'India',
  gst_number  text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Proposals ─────────────────────────────────────────────────────────────
create table if not exists public.crm_proposals (
  id           uuid primary key default gen_random_uuid(),
  lead_id      uuid references public.crm_leads(id) on delete set null,
  client_id    uuid references public.crm_clients(id) on delete set null,
  title        text not null,
  content      text not null default '',
  status       text not null default 'draft'
               check (status in ('draft','sent','viewed','accepted','rejected')),
  currency     text not null default 'INR',
  total_value  numeric(12,2),
  valid_until  date,
  sent_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Invoices ──────────────────────────────────────────────────────────────
create table if not exists public.crm_invoices (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid references public.crm_clients(id) on delete restrict,
  invoice_number  text not null unique,
  line_items      jsonb not null default '[]',
  currency        text not null default 'INR',
  subtotal        numeric(12,2) not null default 0,
  tax_label       text default 'GST',
  tax_rate        numeric(5,2) default 0,
  tax_amount      numeric(12,2) default 0,
  total           numeric(12,2) not null default 0,
  status          text not null default 'draft'
                  check (status in ('draft','sent','paid','overdue','cancelled')),
  due_date        date,
  paid_at         timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Campaigns ─────────────────────────────────────────────────────────────
create table if not exists public.crm_campaigns (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  subject          text not null,
  content          text not null default '',
  recipient_type   text not null default 'all_leads'
                   check (recipient_type in ('all_leads','qualified_leads','all_clients','custom')),
  custom_emails    text[],
  status           text not null default 'draft'
                   check (status in ('draft','sent')),
  sent_at          timestamptz,
  recipients_count int default 0,
  created_at       timestamptz not null default now()
);

-- ── Activity log ──────────────────────────────────────────────────────────
create table if not exists public.crm_activities (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null check (entity_type in ('lead','client')),
  entity_id    uuid not null,
  type         text not null
               check (type in ('note','email_sent','status_change','proposal_sent','invoice_sent','call','meeting')),
  content      text,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────
alter table public.crm_leads       enable row level security;
alter table public.crm_clients     enable row level security;
alter table public.crm_proposals   enable row level security;
alter table public.crm_invoices    enable row level security;
alter table public.crm_campaigns   enable row level security;
alter table public.crm_activities  enable row level security;

-- Authenticated users (admin) have full access
-- (drop first so this script is safe to re-run)
drop policy if exists "admin_all_leads"      on public.crm_leads;
drop policy if exists "admin_all_clients"    on public.crm_clients;
drop policy if exists "admin_all_proposals"  on public.crm_proposals;
drop policy if exists "admin_all_invoices"   on public.crm_invoices;
drop policy if exists "admin_all_campaigns"  on public.crm_campaigns;
drop policy if exists "admin_all_activities" on public.crm_activities;

create policy "admin_all_leads"      on public.crm_leads      for all using (auth.role() = 'authenticated');
create policy "admin_all_clients"    on public.crm_clients    for all using (auth.role() = 'authenticated');
create policy "admin_all_proposals"  on public.crm_proposals  for all using (auth.role() = 'authenticated');
create policy "admin_all_invoices"   on public.crm_invoices   for all using (auth.role() = 'authenticated');
create policy "admin_all_campaigns"  on public.crm_campaigns  for all using (auth.role() = 'authenticated');
create policy "admin_all_activities" on public.crm_activities for all using (auth.role() = 'authenticated');

-- ── Indexes ───────────────────────────────────────────────────────────────
create index if not exists crm_leads_status_idx      on public.crm_leads(status);
create index if not exists crm_leads_source_idx      on public.crm_leads(source);
create index if not exists crm_leads_created_idx     on public.crm_leads(created_at desc);
create index if not exists crm_clients_lead_idx      on public.crm_clients(lead_id);
create index if not exists crm_proposals_lead_idx    on public.crm_proposals(lead_id);
create index if not exists crm_proposals_client_idx  on public.crm_proposals(client_id);
create index if not exists crm_invoices_client_idx   on public.crm_invoices(client_id);
create index if not exists crm_invoices_status_idx   on public.crm_invoices(status);
create index if not exists crm_activities_entity_idx on public.crm_activities(entity_type, entity_id);
