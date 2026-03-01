import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_clients')
      .select('*, crm_proposals(id), crm_invoices(id)')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setClients(data || []);
    setLoading(false);
  }, []);

  const fetchClientById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_clients')
      .select('*')
      .eq('id', id)
      .single();
    if (error) setError(error.message);
    else setClient(data);
    setLoading(false);
    return data;
  }, []);

  const createClient = async (data) => {
    const { data: newClient, error } = await supabase
      .from('crm_clients')
      .insert([{ ...data, updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('crm_clients')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setClient(updated);
    setClients(prev => prev.map(c => c.id === id ? updated : c));
    return updated;
  };

  const deleteClient = async (id) => {
    const { error } = await supabase.from('crm_clients').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return {
    clients, client, loading, error,
    fetchClients, fetchClientById, createClient, updateClient, deleteClient,
  };
}
