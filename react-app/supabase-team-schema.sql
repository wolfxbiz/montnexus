-- ════════════════════════════════════════════════════════════════════════
-- Team Management Schema
-- Run in Supabase SQL Editor
-- Safe to re-run (uses IF NOT EXISTS / ON CONFLICT)
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. team_members table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email      text NOT NULL UNIQUE,
  name       text,
  role       text NOT NULL CHECK (role IN ('super_admin','admin','crm_manager','content_manager')),
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- ── 2. Helper function — returns current user's role ──────────────────────
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.team_members
  WHERE user_id = auth.uid() AND status = 'active'
$$;

-- ── 3. RLS for team_members ───────────────────────────────────────────────
-- Any active team member can read the list
DROP POLICY IF EXISTS "team read" ON public.team_members;
CREATE POLICY "team read" ON public.team_members
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND (SELECT status FROM public.team_members WHERE user_id = auth.uid()) = 'active'
  );

-- Only super_admin can insert / update / delete
DROP POLICY IF EXISTS "team write" ON public.team_members;
CREATE POLICY "team write" ON public.team_members
  FOR ALL USING ( public.get_my_role() = 'super_admin' );

-- ── 4. Auth trigger — link user_id when invited user accepts invite ────────
CREATE OR REPLACE FUNCTION public.link_team_member_on_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.team_members
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_team_member_on_signup();

-- ── 5. Seed initial super admin (current owner = first user) ─────────────
INSERT INTO public.team_members (user_id, email, name, role)
SELECT id, email, 'Super Admin', 'super_admin'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET role = 'super_admin', status = 'active';

-- ════════════════════════════════════════════════════════════════════════
-- 6. Update RLS on existing tables to respect roles
-- ════════════════════════════════════════════════════════════════════════

-- ── blog posts ────────────────────────────────────────────────────────────
-- Drop old blanket "authenticated" write policy, keep the public read policy
DROP POLICY IF EXISTS "Authenticated full access" ON public.blog_posts;
DROP POLICY IF EXISTS "posts write team" ON public.blog_posts;
CREATE POLICY "posts write team" ON public.blog_posts
  FOR ALL USING (
    public.get_my_role() IN ('super_admin','admin','content_manager')
  );

-- ── site_pages ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Auth write site_pages" ON public.site_pages;
DROP POLICY IF EXISTS "pages write team" ON public.site_pages;
CREATE POLICY "pages write team" ON public.site_pages
  FOR ALL USING (
    public.get_my_role() IN ('super_admin','admin','content_manager')
  );

-- ── page_sections ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Auth write page_sections" ON public.page_sections;
DROP POLICY IF EXISTS "sections write team" ON public.page_sections;
CREATE POLICY "sections write team" ON public.page_sections
  FOR ALL USING (
    public.get_my_role() IN ('super_admin','admin','content_manager')
  );

-- ── site_settings ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Auth write site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "settings write team" ON public.site_settings;
CREATE POLICY "settings write team" ON public.site_settings
  FOR ALL USING (
    public.get_my_role() IN ('super_admin','admin')
  );

-- ── CRM tables ────────────────────────────────────────────────────────────
-- Drop old blanket "authenticated" policies, then create role-based ones
DROP POLICY IF EXISTS "admin_all_leads"      ON public.crm_leads;
DROP POLICY IF EXISTS "admin_all_clients"    ON public.crm_clients;
DROP POLICY IF EXISTS "admin_all_proposals"  ON public.crm_proposals;
DROP POLICY IF EXISTS "admin_all_invoices"   ON public.crm_invoices;
DROP POLICY IF EXISTS "admin_all_campaigns"  ON public.crm_campaigns;
DROP POLICY IF EXISTS "admin_all_activities" ON public.crm_activities;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['crm_leads','crm_clients','crm_proposals','crm_invoices','crm_campaigns','crm_activities'] LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS "crm write team" ON public.%I; ' ||
      'CREATE POLICY "crm write team" ON public.%I ' ||
      'FOR ALL USING (public.get_my_role() IN (''super_admin'',''admin'',''crm_manager''));',
      t, t
    );
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════════════════════
-- Done! After running this:
-- 1. Deploy the frontend changes
-- 2. Visit /admin/team to manage your team
-- ════════════════════════════════════════════════════════════════════════
