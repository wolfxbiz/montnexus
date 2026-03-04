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
    const { data, error } = await supabase
      .from('team_members')
      .select('role, status')
      .eq('user_id', user.id)
      .single();
    if (error) {
      // Table not found OR user not in team_members yet — grant full access
      setRole('super_admin');
    } else {
      setRole(data?.status === 'active' ? data.role : null);
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
