import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export function useInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_invoices')
      .select('*, crm_clients(name, email, company)')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setInvoices(data || []);
    setLoading(false);
  }, []);

  const fetchInvoiceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('crm_invoices')
      .select('*, crm_clients(*)')
      .eq('id', id)
      .single();
    if (error) setError(error.message);
    else setInvoice(data);
    setLoading(false);
    return data;
  }, []);

  const nextInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const { data } = await supabase
      .from('crm_invoices')
      .select('invoice_number')
      .ilike('invoice_number', `INV-${year}-%`)
      .order('invoice_number', { ascending: false })
      .limit(1);
    if (!data || data.length === 0) return `INV-${year}-001`;
    const last = data[0].invoice_number;
    const num = parseInt(last.split('-')[2] || '0', 10) + 1;
    return `INV-${year}-${String(num).padStart(3, '0')}`;
  };

  const createInvoice = async (data) => {
    const { data: newInvoice, error } = await supabase
      .from('crm_invoices')
      .insert([{ ...data, updated_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id, data) => {
    const { data: updated, error } = await supabase
      .from('crm_invoices')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    setInvoice(updated);
    setInvoices(prev => prev.map(i => i.id === id ? updated : i));
    return updated;
  };

  const deleteInvoice = async (id) => {
    const { error } = await supabase.from('crm_invoices').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  return {
    invoices, invoice, loading, error,
    fetchInvoices, fetchInvoiceById, createInvoice, updateInvoice, deleteInvoice, nextInvoiceNumber,
  };
}
