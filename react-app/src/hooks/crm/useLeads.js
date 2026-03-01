import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async (statusFilter = null) => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    else setLeads(data || []);
    setLoading(false);
  }, []);

  const fetchLeadById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('id', id)
      .single();
    if (error) setError(error.message);
    else setLead(data);
    setLoading(false);
    return data;
  }, []);

  const createLead = async (data) => {
    const { data: newLead, error } = await supabase
      .from('crm_leads')
      .insert([{ ...data, updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setLeads(prev => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('crm_leads')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setLead(updated);
    setLeads(prev => prev.map(l => l.id === id ? updated : l));
    return updated;
  };

  const deleteLead = async (id) => {
    const { error } = await supabase.from('crm_leads').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const bulkCreateLeads = async (rows) => {
    const records = rows.map(r => ({ ...r, updated_at: new Date().toISOString() }));
    const { data, error } = await supabase
      .from('crm_leads')
      .insert(records)
      .select();
    if (error) throw new Error(error.message);
    setLeads(prev => [...(data || []), ...prev]);
    return data;
  };

  return {
    leads, lead, loading, error,
    fetchLeads, fetchLeadById, createLead, updateLead, deleteLead, bulkCreateLeads,
  };
}
