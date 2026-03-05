import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

const PERMS = {
  super_admin:     ['content', 'pages', 'crm', 'settings', 'team'],
  admin:           ['content', 'pages', 'crm', 'settings'],
  crm_manager:     ['crm'],
  content_manager: ['content', 'pages'],
};

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async () => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    // Use RPC to call get_my_role() — SECURITY DEFINER bypasses team_members RLS entirely
    const { data: roleData, error } = await supabase.rpc('get_my_role');
    console.log('[useRole] user:', user?.id, 'rpc result:', roleData, 'error:', error);
    if (error || roleData === null || roleData === undefined) {
      // Function missing, table missing, or user not yet in team_members → full access
      setRole('super_admin');
    } else {
      setRole(roleData);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchRole(); }, [fetchRole]);

  const can = useCallback((section) => {
    if (!role) return false;
    return PERMS[role]?.includes(section) ?? false;
  }, [role]);

  return {
    role,
    loading,
    can,
    isSuperAdmin: role === 'super_admin',
    refetch: fetchRole,
  };
}
