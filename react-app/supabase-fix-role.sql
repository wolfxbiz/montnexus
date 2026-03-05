-- ══════════════════════════════════════════════════════════
-- Fix: Ensure super_admin role is set correctly
-- Run in Supabase SQL Editor
-- ══════════════════════════════════════════════════════════

-- Step 1: See what's in team_members right now
SELECT id, user_id, email, role, status FROM public.team_members;

-- Step 2: See all auth users
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Step 3: Upsert super_admin for first user (use user_id match, not just email)
-- This ensures user_id is correctly linked
INSERT INTO public.team_members (user_id, email, name, role, status)
SELECT id, email, 'Super Admin', 'super_admin', 'active'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role    = 'super_admin',
  status  = 'active';

-- Step 4: Verify — should show your email with role=super_admin, status=active
SELECT tm.id, tm.user_id, tm.email, tm.role, tm.status
FROM public.team_members tm
JOIN auth.users au ON au.id = tm.user_id;
