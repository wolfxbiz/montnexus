-- ============================================================
-- Montnexus Page CMS — Schema + Seed Data
-- Run this AFTER supabase-schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

create table public.site_pages (
  id               uuid          primary key default uuid_generate_v4(),
  title            text          not null,
  slug             text          not null unique,
  status           text          not null default 'draft'
                   check (status in ('draft', 'published')),
  meta_title       text,
  meta_description text,
  og_image_url     text,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

create table public.page_sections (
  id             uuid          primary key default uuid_generate_v4(),
  page_id        uuid          not null references public.site_pages(id) on delete cascade,
  section_type   text          not null,
  display_order  int           not null default 0,
  content        jsonb         not null default '{}',
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

create table public.site_settings (
  key        text          primary key,
  value      text          not null,
  updated_at timestamptz   not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.site_pages    enable row level security;
alter table public.page_sections enable row level security;
alter table public.site_settings enable row level security;

create policy "Public read site_pages"    on public.site_pages    for select using (true);
create policy "Auth write site_pages"     on public.site_pages    for all    using (auth.role() = 'authenticated');
create policy "Public read page_sections" on public.page_sections for select using (true);
create policy "Auth write page_sections"  on public.page_sections for all    using (auth.role() = 'authenticated');
create policy "Public read site_settings" on public.site_settings for select using (true);
create policy "Auth write site_settings"  on public.site_settings for all    using (auth.role() = 'authenticated');

-- ============================================================
-- AUTO-UPDATE updated_at FUNCTION (safe to run even if already exists)
-- ============================================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- AUTO-UPDATE TRIGGERS
-- ============================================================

create trigger site_pages_updated
  before update on public.site_pages
  for each row execute function update_updated_at_column();

create trigger page_sections_updated
  before update on public.page_sections
  for each row execute function update_updated_at_column();

-- ============================================================
-- DEFAULT DESIGN SETTINGS
-- ============================================================

insert into public.site_settings (key, value) values
  ('primary_color', '#92D108'),
  ('dark_bg',       '#111111'),
  ('light_bg',      '#f4f4f5'),
  ('text_on_dark',  '#ffffff'),
  ('text_on_light', '#202020'),
  ('btn_radius',    '6'),
  ('font_display',  'Barlow Condensed'),
  ('font_body',     'Noto Sans'),
  ('site_name',     'Montnexus')
on conflict (key) do nothing;

-- ============================================================
-- SEED: HOME PAGE
-- ============================================================

with home_page as (
  insert into public.site_pages (title, slug, status, meta_title, meta_description)
  values (
    'Home',
    'home',
    'published',
    'Retail Automation & Web Engineering — Montnexus',
    'Montnexus — structured automation systems for retail operations and complete web solutions from design to deployment.'
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.page_sections (page_id, section_type, display_order, content)
select id, 'hero', 0, '{
  "tag": "Engineering · Automation · Growth",
  "headline": "RETAIL AUTOMATION & WEB ENGINEERING.",
  "subheadline": "Two structured capabilities — operational automation for retail businesses and complete web solutions built from design to deployment.",
  "cta_primary": {"text": "Retail Automation", "link": "/retail-automation-system"},
  "cta_secondary": {"text": "Web Development", "link": "/web-design-development"},
  "stats": [
    {"number": "2", "label": "Core Capabilities"},
    {"number": "IN · AE", "label": "Markets Served"},
    {"number": "100%", "label": "Custom Built"}
  ]
}'::jsonb from home_page
union all
select id, 'features_grid', 1, '{
  "tag": "What We Do",
  "title": "Two Core Capabilities",
  "body": "Focused on two things, done well.",
  "items": [
    {
      "number": "01",
      "tag": "Automation",
      "title": "Retail Automation & System Engineering",
      "description": "We analyze and improve daily retail workflows — reducing repetitive work and improving operational visibility across your business.",
      "features": ["Inventory tracking & stock alerts", "Sales monitoring & automated reporting", "Custom internal dashboards", "Workflow automation systems", "AI-assisted data processing"],
      "link": "/retail-automation-system"
    },
    {
      "number": "02",
      "tag": "Web",
      "title": "Web Design & Development",
      "description": "Custom business websites, CMS platforms, and web applications built from design to deployment — performance-focused and scalable.",
      "features": ["Business website design & development", "CMS-based websites (WordPress / Headless)", "Custom web applications & portals", "Backend development & API integration", "Deployment, analytics & hosting setup"],
      "link": "/web-design-development"
    }
  ]
}'::jsonb from home_page
union all
select id, 'about_strip', 2, '{
  "tag": "About",
  "title": "Engineering-first. No unnecessary complexity.",
  "body": "Montnexus is a focused engineering team working at the intersection of retail operations and web technology. We build structured systems — not broad agency solutions.\n\nCurrently in an early growth phase, working with select partners across India and UAE. No exaggerated claims. Just structured work built with intention.",
  "stats": [
    {"number": "India + UAE", "label": "Remote-first operations"},
    {"number": "Select Partners", "label": "Early growth phase"},
    {"number": "2 Capabilities", "label": "Done well"}
  ]
}'::jsonb from home_page
union all
select id, 'process_steps', 3, '{
  "tag": "Our Approach",
  "title": "How We Work",
  "body": "Consistent across both capabilities.",
  "steps": [
    {"number": "01", "title": "Understand First", "description": "We take time to understand your business, goals, and constraints before proposing anything."},
    {"number": "02", "title": "Structure Before Build", "description": "We design a clear system architecture before writing a single line of code."},
    {"number": "03", "title": "End-to-End Delivery", "description": "Frontend, backend, and deployment — handled entirely with clean, maintainable code."},
    {"number": "04", "title": "Long-Term Support", "description": "Structured support plans available after delivery to keep systems stable and evolving."}
  ]
}'::jsonb from home_page;

-- ============================================================
-- SEED: RETAIL AUTOMATION PAGE
-- ============================================================

with retail_page as (
  insert into public.site_pages (title, slug, status, meta_title, meta_description)
  values (
    'Retail Automation',
    'retail-automation-system',
    'published',
    'Retail Automation & System Engineering — Montnexus',
    'Structured automation systems for retail businesses. We analyze workflows, build custom systems, and deploy automation that reduces manual work and improves operational visibility.'
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.page_sections (page_id, section_type, display_order, content)
select id, 'hero', 0, '{
  "tag": "Retail · Automation · Engineering",
  "headline": "RETAIL AUTOMATION & SYSTEM ENGINEERING",
  "subheadline": "We design and implement custom automation systems for retail businesses looking to improve operational clarity and efficiency.",
  "cta_primary": {"text": "Start a Conversation", "link": "#contact"},
  "cta_secondary": {"text": "See What We Do", "link": "#services"},
  "stats": [
    {"number": "2", "label": "Core Services"},
    {"number": "IN · AE", "label": "Markets Served"},
    {"number": "100%", "label": "Custom Built"}
  ]
}'::jsonb from retail_page
union all
select id, 'about_strip', 1, '{
  "tag": "About",
  "title": "Operational clarity over added complexity.",
  "body": "Montnexus is a focused engineering team working on automation systems for retail businesses. We operate in the early stage of building long-term retail automation infrastructure.\n\nOur current focus is working with select retail partners to design and implement structured digital workflows. We believe operational clarity is more valuable than adding more software. No exaggerated claims. No unnecessary complexity. Just structured systems built with intention.",
  "stats": [
    {"number": "Early Stage", "label": "Building foundational retail automation infrastructure"},
    {"number": "India + UAE", "label": "Remote-first operations, UAE engagements available"},
    {"number": "Select Partners", "label": "Depth of execution over rapid expansion"}
  ]
}'::jsonb from retail_page
union all
select id, 'features_grid', 2, '{
  "tag": "What We Do",
  "title": "Two things, done well.",
  "body": "We focus on two core capabilities — operational automation and custom system development. No broad agency promises. Just structured engineering for retail.",
  "items": [
    {
      "number": "01",
      "tag": "Automation",
      "title": "Retail Workflow Automation",
      "description": "Structured automation for daily retail operations — inventory, sales tracking, and reporting that runs without manual effort.",
      "features": ["Inventory tracking & stock alerts", "Sales monitoring & automated reporting", "Workflow automation", "AI-assisted data processing"],
      "link": "#contact"
    },
    {
      "number": "02",
      "tag": "Systems",
      "title": "Custom Retail Dashboards",
      "description": "Internal dashboards and management systems built specifically for how your retail business operates.",
      "features": ["Custom internal dashboards", "Staff coordination tools", "Real-time data visibility", "Scalable backend systems"],
      "link": "#contact"
    }
  ]
}'::jsonb from retail_page
union all
select id, 'process_steps', 3, '{
  "tag": "How We Work",
  "title": "A clear process. No surprises.",
  "body": "We work with select retail partners during this early growth phase.",
  "steps": [
    {"number": "01", "title": "Operational Review", "description": "We sit with you — virtually or on-site — and understand your current retail process end-to-end. No assumptions, no templated solutions."},
    {"number": "02", "title": "Friction Mapping", "description": "We identify exactly where time is lost, where data gets unclear, and where staff coordination breaks down. You see the analysis before we move forward."},
    {"number": "03", "title": "System Design", "description": "We propose a structured automation plan specific to your business — not a generic software recommendation. You approve the direction before we build."},
    {"number": "04", "title": "Implementation", "description": "We build and integrate the solution into your daily operations. You receive full documentation, training, and continued support after delivery."}
  ]
}'::jsonb from retail_page
union all
select id, 'cta_banner', 4, '{
  "headline": "Retail businesses ready to operate with clarity.",
  "body": "We work best with owners who value structured improvement over quick fixes. If this describes your business, we would like to have a conversation.",
  "cta_text": "Get in Touch",
  "cta_link": "#contact",
  "email": "hello@montnexus.com"
}'::jsonb from retail_page;

-- ============================================================
-- SEED: WEB DEVELOPMENT PAGE
-- ============================================================

with web_page as (
  insert into public.site_pages (title, slug, status, meta_title, meta_description)
  values (
    'Web Design & Development',
    'web-design-development',
    'published',
    'Web Design & Development Services — Montnexus',
    'Custom business websites, CMS platforms, and web systems built from design to deployment. Scalable, secure, and performance-focused.'
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.page_sections (page_id, section_type, display_order, content)
select id, 'hero', 0, '{
  "tag": "Web · Design · Development",
  "headline": "WEB DESIGN & DEVELOPMENT",
  "subheadline": "Custom business websites and web systems built from design to deployment — performance-focused and scalable.",
  "cta_primary": {"text": "Request a Consultation", "link": "#contact"},
  "cta_secondary": {"text": "See Our Services", "link": "#services"},
  "stats": [
    {"number": "3", "label": "Service Types"},
    {"number": "IN · AE", "label": "Markets Served"},
    {"number": "100%", "label": "Custom Built"}
  ]
}'::jsonb from web_page
union all
select id, 'text_content', 1, '{
  "tag": "Overview",
  "title": "We do not just design interfaces. We engineer functional systems.",
  "body": "At Montnexus, we design and build complete web solutions — combining user experience, backend architecture, and deployment infrastructure into one structured system. From simple business websites to CMS platforms and custom web applications, every project is built with performance, scalability, and maintainability in mind."
}'::jsonb from web_page
union all
select id, 'services_grid', 2, '{
  "tag": "What We Build",
  "title": "Our Services",
  "body": "Three core delivery areas — from landing pages to full-stack systems.",
  "services": [
    {
      "number": "01",
      "title": "Business Website Development",
      "description": "Professional websites designed to represent your brand clearly and effectively.",
      "features": ["Custom UI/UX design", "Responsive (mobile-first) development", "Clean frontend architecture", "Contact & lead capture forms", "Domain & DNS configuration", "Deployment & hosting setup", "Google Analytics integration"]
    },
    {
      "number": "02",
      "title": "CMS-Based Websites",
      "description": "For businesses that need full control over their content without technical overhead.",
      "features": ["Blog integration", "Admin panel setup", "Content management interface", "WordPress or headless CMS", "Built for non-technical teams"]
    },
    {
      "number": "03",
      "title": "Custom Web Systems",
      "description": "Beyond websites — structured web applications built on solid backend architecture.",
      "features": ["Admin dashboards", "Client portals", "Booking & appointment systems", "Backend development", "Database design & API integration", "Secure authentication systems"]
    }
  ]
}'::jsonb from web_page
union all
select id, 'process_steps', 3, '{
  "tag": "Our Approach",
  "title": "Development Process",
  "body": "A structured workflow — from understanding your needs to deploying your system.",
  "steps": [
    {"number": "01", "title": "Discovery", "description": "Understanding your business model, goals, and user needs."},
    {"number": "02", "title": "Architecture Planning", "description": "Defining structure, database logic, and system flow before development begins."},
    {"number": "03", "title": "UI/UX Design", "description": "Designing intuitive, clean, and user-focused interfaces."},
    {"number": "04", "title": "Development", "description": "Frontend and backend implementation with structured code practices."},
    {"number": "05", "title": "Testing & Optimization", "description": "Performance testing, responsiveness validation, and quality checks."},
    {"number": "06", "title": "Deployment", "description": "Domain setup, DNS configuration, hosting integration, and production release."}
  ]
}'::jsonb from web_page
union all
select id, 'cta_banner', 4, '{
  "headline": "Ready to build your web system?",
  "body": "If you need a structured website or a custom web system built from scratch, we are ready to collaborate.",
  "cta_text": "Start a Project",
  "cta_link": "#contact",
  "email": "hello@montnexus.com"
}'::jsonb from web_page;
