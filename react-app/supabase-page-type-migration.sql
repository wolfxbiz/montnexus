-- ════════════════════════════════════════════════════════════════════════
-- Migration: add page_type + seed About Us and Contact Us pages
-- Run in Supabase SQL Editor (safe to re-run — uses IF NOT EXISTS / ON CONFLICT)
-- ════════════════════════════════════════════════════════════════════════

-- 1. Add page_type column
alter table public.site_pages
  add column if not exists page_type text not null default 'service'
  check (page_type in ('core', 'service', 'other'));

-- 2. Mark existing core pages
update public.site_pages
  set page_type = 'core'
  where slug in ('home', 'about', 'contact', 'services');

-- ── About Us page ─────────────────────────────────────────────────────────
with about_page as (
  insert into public.site_pages (title, slug, status, page_type, meta_title, meta_description)
  values (
    'About Us',
    'about',
    'published',
    'core',
    'About Montnexus | Retail Automation & Web Development',
    'Learn about Montnexus — a team of engineers building retail automation systems and digital experiences that help businesses grow.'
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.page_sections (page_id, section_type, display_order, content)
select id, 'hero', 0, '{
  "tag": "Our Story",
  "headline": "BUILT TO ENGINEER GROWTH",
  "subheadline": "Montnexus is a technology company focused on retail automation and digital experiences. We help businesses scale through intelligent systems and purposeful design.",
  "cta_primary": {"text": "Our Services", "link": "/services"},
  "cta_secondary": {"text": "Get in Touch", "link": "/#contact"},
  "stats": [
    {"number": "50+", "label": "Projects Delivered"},
    {"number": "5+", "label": "Years Experience"},
    {"number": "98%", "label": "Client Satisfaction"}
  ]
}'::jsonb
from about_page

union all
select id, 'about_strip', 1, '{
  "tag": "Who We Are",
  "title": "Engineering That Moves Businesses Forward",
  "body": "We are a team of engineers, designers, and strategists who believe technology should work for businesses — not the other way around.\n\nFrom retail automation systems that streamline operations to web experiences that convert visitors into customers, we build solutions that create real, measurable impact.\n\nEvery system we build is designed with one goal: to make your business run better.",
  "stats": [
    {"number": "50+", "label": "Clients Served"},
    {"number": "100+", "label": "Systems Deployed"},
    {"number": "3", "label": "Countries"}
  ]
}'::jsonb
from about_page

union all
select id, 'process_steps', 2, '{
  "tag": "How We Work",
  "title": "Our Approach",
  "body": "We follow a structured process to ensure every project delivers real results.",
  "steps": [
    {"number": "01", "title": "Discovery", "description": "We start by deeply understanding your business, goals, and the problems you need solved."},
    {"number": "02", "title": "Strategy", "description": "We design a solution architecture and roadmap tailored to your specific requirements and budget."},
    {"number": "03", "title": "Build", "description": "Our engineers develop and test the system rigorously, keeping you updated at every milestone."},
    {"number": "04", "title": "Launch & Support", "description": "We deploy, train your team, and provide ongoing support to ensure long-term success."}
  ]
}'::jsonb
from about_page

union all
select id, 'cta_banner', 3, '{
  "headline": "Ready to Work Together?",
  "body": "Tell us about your business and we will engineer a solution that fits.",
  "cta_text": "Start a Project",
  "cta_link": "/#contact",
  "email": "hello@montnexus.com"
}'::jsonb
from about_page;

-- ── Contact Us page ───────────────────────────────────────────────────────
with contact_page as (
  insert into public.site_pages (title, slug, status, page_type, meta_title, meta_description)
  values (
    'Contact Us',
    'contact',
    'published',
    'core',
    'Contact Montnexus | Start Your Project',
    'Get in touch with Montnexus. We respond within 24 hours and are ready to discuss your retail automation or web development project.'
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.page_sections (page_id, section_type, display_order, content)
select id, 'hero', 0, '{
  "tag": "Get In Touch",
  "headline": "LET US TALK ABOUT YOUR PROJECT",
  "subheadline": "Whether you need a retail automation system or a complete digital presence, we are ready to help. Reach out and let us start the conversation.",
  "cta_primary": {"text": "Send a Message", "link": "/#contact"},
  "cta_secondary": {"text": "View Services", "link": "/services"},
  "stats": [
    {"number": "24h", "label": "Response Time"},
    {"number": "50+", "label": "Projects Done"},
    {"number": "3", "label": "Countries Served"}
  ]
}'::jsonb
from contact_page

union all
select id, 'features_grid', 1, '{
  "tag": "Ways to Connect",
  "title": "How We Can Help",
  "body": "Choose the right engagement model for your project.",
  "items": [
    {
      "number": "01",
      "tag": "Quick Chat",
      "title": "Free Consultation",
      "description": "Not sure what you need? Book a free 30-minute discovery call and we will help you figure out the best path forward.",
      "features": ["No commitment required", "Get expert advice", "Walk away with a clear plan"],
      "link": "/#contact"
    },
    {
      "number": "02",
      "tag": "Project",
      "title": "Start a Project",
      "description": "Have a clear scope? Share the details and we will send you a proposal within 48 hours.",
      "features": ["Fixed-scope delivery", "Clear milestones", "Dedicated team"],
      "link": "/#contact"
    },
    {
      "number": "03",
      "tag": "Ongoing",
      "title": "Retainer Support",
      "description": "Need ongoing development or maintenance? We offer monthly retainer plans for long-term partnerships.",
      "features": ["Priority support", "Monthly hours", "Regular reviews"],
      "link": "/#contact"
    }
  ]
}'::jsonb
from contact_page

union all
select id, 'cta_banner', 2, '{
  "headline": "We Respond Within 24 Hours",
  "body": "Drop us a message using the form below and our team will get back to you with a clear plan.",
  "cta_text": "Send a Message",
  "cta_link": "/#contact",
  "email": "hello@montnexus.com"
}'::jsonb
from contact_page;
