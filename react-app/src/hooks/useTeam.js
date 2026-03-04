import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true });
    if (err) setError(err.message);
    else setMembers(data || []);
    setLoading(false);
  }, []);

  const inviteMember = useCallback(async (email, name, role) => {
    setError('');
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'invite', email, name, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invite failed');
    await fetchMembers();
    return data;
  }, [fetchMembers]);

  const updateMember = useCallback(async (memberId, action, role = null) => {
    setError('');
    const res = await fetch('/api/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'update', memberId, action, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    await fetchMembers();
    return data;
  }, [fetchMembers]);

  return { members, loading, error, fetchMembers, inviteMember, updateMember };
}
