import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useProposals() {
  const [proposals, setProposals] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_proposals')
      .select('*, crm_leads(name, email, company), crm_clients(name, email, company)')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setProposals(data || []);
    setLoading(false);
  }, []);

  const fetchProposalById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_proposals')
      .select('*, crm_leads(id, name, email, company, message), crm_clients(id, name, email, company)')
      .eq('id', id)
      .single();
    if (error) setError(error.message);
    else setProposal(data);
    setLoading(false);
    return data;
  }, []);

  const createProposal = async (data) => {
    const { data: newProposal, error } = await supabase
      .from('crm_proposals')
      .insert([{ ...data, updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setProposals(prev => [newProposal, ...prev]);
    return newProposal;
  };

  const updateProposal = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('crm_proposals')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setProposal(updated);
    setProposals(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProposal = async (id) => {
    const { error } = await supabase.from('crm_proposals').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  return {
    proposals, proposal, loading, error,
    fetchProposals, fetchProposalById, createProposal, updateProposal, deleteProposal,
  };
}
