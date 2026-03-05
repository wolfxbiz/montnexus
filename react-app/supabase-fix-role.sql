-- ══════════════════════════════════════════════════════════
-- Fix: Role resolution — safe to re-run
-- ══════════════════════════════════════════════════════════

-- Step 1: Fix get_my_role() — add SET search_path so auth.uid() works inside SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth
AS $$
  SELECT role FROM public.team_members
  WHERE user_id = auth.uid() AND status = 'active'
$$;

-- Step 2: Fix team_members SELECT policy — use direct auth.uid() = user_id check
-- (avoids circular dependency through get_my_role)
DROP POLICY IF EXISTS "team read" ON public.team_members;
CREATE POLICY "team read" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Step 3: Ensure your user is super_admin + active
INSERT INTO public.team_members (user_id, email, name, role, status)
SELECT id, email, 'Super Admin', 'super_admin', 'active'
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  role    = 'super_admin',
  status  = 'active';

-- Step 4: Test get_my_role() directly (run while logged into Supabase dashboard as your user)
-- You can test this via the SQL editor — it should return 'super_admin'
SELECT public.get_my_role();

-- Step 5: Verify team_members
SELECT id, user_id, email, role, status FROM public.team_members;
