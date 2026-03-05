-- ════════════════════════════════════════════════════════════════
-- Fix: Page Sections — Diagnostic + Re-seed
-- Run in Supabase SQL Editor
-- Safe to re-run: only inserts if a page has 0 sections
-- ════════════════════════════════════════════════════════════════

-- ── STEP 1: Check what exists ─────────────────────────────────
SELECT sp.title, sp.slug, COUNT(ps.id) AS section_count
FROM site_pages sp
LEFT JOIN page_sections ps ON ps.page_id = sp.id
GROUP BY sp.id, sp.title, sp.slug
ORDER BY sp.created_at;

-- ── STEP 2: Ensure public read policy exists ──────────────────
DO $$ BEGIN
  CREATE POLICY "Public read page_sections" ON public.page_sections
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Public read site_pages" ON public.site_pages
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── STEP 3: Re-seed HOME sections (if empty) ─────────────────
INSERT INTO public.page_sections (page_id, section_type, display_order, content)
SELECT sp.id, v.section_type, v.display_order, v.content::jsonb
FROM public.site_pages sp
CROSS JOIN (VALUES
  ('hero', 0, '{
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
  }'),
  ('features_grid', 1, '{
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
        "features": ["Business website design & development", "CMS-based websites", "Custom web applications & portals", "Backend development & API integration", "Deployment & hosting setup"],
        "link": "/web-design-development"
      }
    ]
  }'),
  ('about_strip', 2, '{
    "tag": "About",
    "title": "Engineering-first. No unnecessary complexity.",
    "body": "Montnexus is a focused engineering team working at the intersection of retail operations and web technology. We build structured systems — not broad agency solutions.\n\nCurrently in an early growth phase, working with select partners across India and UAE. No exaggerated claims. Just structured work built with intention.",
    "stats": [
      {"number": "India + UAE", "label": "Remote-first operations"},
      {"number": "Select Partners", "label": "Early growth phase"},
      {"number": "2 Capabilities", "label": "Done well"}
    ]
  }'),
  ('process_steps', 3, '{
    "tag": "Our Approach",
    "title": "How We Work",
    "body": "Consistent across both capabilities.",
    "steps": [
      {"number": "01", "title": "Understand First", "description": "We take time to understand your business, goals, and constraints before proposing anything."},
      {"number": "02", "title": "Structure Before Build", "description": "We design a clear system architecture before writing a single line of code."},
      {"number": "03", "title": "End-to-End Delivery", "description": "Frontend, backend, and deployment — handled entirely with clean, maintainable code."},
      {"number": "04", "title": "Long-Term Support", "description": "Structured support plans available after delivery to keep systems stable and evolving."}
    ]
  }')
) AS v(section_type, display_order, content)
WHERE sp.slug = 'home'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = sp.id);

-- ── STEP 4: Re-seed SERVICES sections (if empty) ─────────────
INSERT INTO public.page_sections (page_id, section_type, display_order, content)
SELECT sp.id, v.section_type, v.display_order, v.content::jsonb
FROM public.site_pages sp
CROSS JOIN (VALUES
  ('hero', 0, '{
    "tag": "Retail Automation · Web Engineering",
    "headline": "SERVICES BUILT FOR REAL BUSINESS PROBLEMS.",
    "subheadline": "Two structured service lines — each designed to solve a specific operational challenge.",
    "cta_primary": {"text": "Retail Automation", "link": "/retail-automation-system"},
    "cta_secondary": {"text": "Web Development", "link": "/web-design-development"},
    "stats": [
      {"number": "2", "label": "Service Lines"},
      {"number": "100%", "label": "Custom Built"},
      {"number": "IN · AE", "label": "Markets"}
    ]
  }'),
  ('features_grid', 1, '{
    "tag": "Our Services",
    "title": "What We Offer",
    "body": "Two capabilities. Both engineering-led.",
    "items": [
      {
        "number": "01",
        "tag": "Automation",
        "title": "Retail Automation & System Engineering",
        "description": "Structured automation systems for retail businesses — inventory, reporting, and operational workflows that run without manual effort.",
        "features": ["Inventory tracking & stock alerts", "Sales monitoring", "Custom dashboards", "Workflow automation", "AI-assisted data processing"],
        "link": "/retail-automation-system"
      },
      {
        "number": "02",
        "tag": "Web",
        "title": "Web Design & Development",
        "description": "Custom business websites, CMS platforms, and web applications built from design to deployment.",
        "features": ["Business website design", "CMS-based platforms", "Custom web applications", "Backend & API development", "Deployment & hosting"],
        "link": "/web-design-development"
      }
    ]
  }'),
  ('cta_banner', 2, '{
    "headline": "Not sure which service fits your business?",
    "body": "Tell us what you are trying to solve. We will identify the right approach.",
    "cta_text": "Start a Conversation",
    "cta_link": "#contact",
    "email": "hello@montnexus.com"
  }')
) AS v(section_type, display_order, content)
WHERE sp.slug = 'services'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = sp.id);

-- ── STEP 5: Re-seed ABOUT US sections (if empty) ─────────────
INSERT INTO public.page_sections (page_id, section_type, display_order, content)
SELECT sp.id, v.section_type, v.display_order, v.content::jsonb
FROM public.site_pages sp
CROSS JOIN (VALUES
  ('hero', 0, '{
    "tag": "About Montnexus",
    "headline": "ENGINEERING-FIRST. NO UNNECESSARY COMPLEXITY.",
    "subheadline": "A focused team working at the intersection of retail operations and web technology.",
    "cta_primary": {"text": "Our Services", "link": "/services"},
    "cta_secondary": {"text": "Get in Touch", "link": "#contact"},
    "stats": [
      {"number": "2", "label": "Core Capabilities"},
      {"number": "India + UAE", "label": "Markets Served"},
      {"number": "Select", "label": "Partner Engagements"}
    ]
  }'),
  ('about_strip', 1, '{
    "tag": "Who We Are",
    "title": "Structured systems. Not broad agency promises.",
    "body": "Montnexus is a focused engineering team working at the intersection of retail operations and web technology. We build structured systems designed to solve specific business problems.\n\nWe are currently in an early growth phase, working with select partners across India and the UAE. Our approach is engineering-led — we design before we build, and we deliver with clarity.",
    "stats": [
      {"number": "India + UAE", "label": "Remote-first operations"},
      {"number": "Early Stage", "label": "Building with intention"},
      {"number": "2 Capabilities", "label": "Done well, not spread thin"}
    ]
  }'),
  ('process_steps', 2, '{
    "tag": "Our Values",
    "title": "How We Think",
    "body": "The principles behind every project we take on.",
    "steps": [
      {"number": "01", "title": "Clarity Over Complexity", "description": "We do not add tools or processes that do not serve a clear purpose. Every decision is justified by the problem it solves."},
      {"number": "02", "title": "Structure Before Speed", "description": "We take time to design the right system before writing code. This prevents rework and produces more stable outcomes."},
      {"number": "03", "title": "Honest Communication", "description": "We tell clients what is feasible, what is not, and what we recommend — without overpromising."},
      {"number": "04", "title": "Long-Term Thinking", "description": "Every system we build is designed to be maintained, extended, and handed off cleanly."}
    ]
  }'),
  ('cta_banner', 3, '{
    "headline": "Interested in working with us?",
    "body": "We work with a select number of partners. If you have a clear problem and want a structured solution, let us talk.",
    "cta_text": "Get in Touch",
    "cta_link": "#contact",
    "email": "hello@montnexus.com"
  }')
) AS v(section_type, display_order, content)
WHERE sp.slug = 'about'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = sp.id);

-- ── STEP 6: Re-seed CONTACT US sections (if empty) ───────────
INSERT INTO public.page_sections (page_id, section_type, display_order, content)
SELECT sp.id, v.section_type, v.display_order, v.content::jsonb
FROM public.site_pages sp
CROSS JOIN (VALUES
  ('hero', 0, '{
    "tag": "Contact Montnexus",
    "headline": "LET US TALK ABOUT YOUR PROJECT.",
    "subheadline": "We work with select partners on retail automation and web development projects. Tell us what you are trying to solve.",
    "cta_primary": {"text": "Email Us", "link": "mailto:hello@montnexus.com"},
    "cta_secondary": {"text": "View Services", "link": "/services"},
    "stats": [
      {"number": "India", "label": "Primary Operations"},
      {"number": "UAE", "label": "Engagements Available"},
      {"number": "48h", "label": "Response Time"}
    ]
  }'),
  ('text_content', 1, '{
    "tag": "Get in Touch",
    "title": "How to Reach Us",
    "body": "The best way to start is by sending us a brief message about your project — what you are trying to build or automate, your timeline, and your location.\n\n**Email:** hello@montnexus.com\n\nWe review every inquiry and respond within 48 hours. If your project is a good fit, we will schedule a short discovery call to understand your needs in detail."
  }'),
  ('cta_banner', 2, '{
    "headline": "Ready to get started?",
    "body": "Send us a message. No sales pressure — just a clear conversation about whether we can help.",
    "cta_text": "Email hello@montnexus.com",
    "cta_link": "mailto:hello@montnexus.com",
    "email": "hello@montnexus.com"
  }')
) AS v(section_type, display_order, content)
WHERE sp.slug = 'contact'
  AND NOT EXISTS (SELECT 1 FROM public.page_sections WHERE page_id = sp.id);

-- ── STEP 7: Verify result ─────────────────────────────────────
SELECT sp.title, sp.slug, COUNT(ps.id) AS section_count
FROM site_pages sp
LEFT JOIN page_sections ps ON ps.page_id = sp.id
GROUP BY sp.id, sp.title, sp.slug
ORDER BY sp.created_at;
