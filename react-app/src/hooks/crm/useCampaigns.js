import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setCampaigns(data || []);
    setLoading(false);
  }, []);

  const fetchCampaignById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_campaigns')
      .select('*')
      .eq('id', id)
      .single();
    if (error) setError(error.message);
    else setCampaign(data);
    setLoading(false);
    return data;
  }, []);

  const createCampaign = async (data) => {
    const { data: newCampaign, error } = await supabase
      .from('crm_campaigns')
      .insert([data])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  };

  const updateCampaign = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('crm_campaigns')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setCampaign(updated);
    setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteCampaign = async (id) => {
    const { error } = await supabase.from('crm_campaigns').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return {
    campaigns, campaign, loading, error,
    fetchCampaigns, fetchCampaignById, createCampaign, updateCampaign, deleteCampaign,
  };
}
