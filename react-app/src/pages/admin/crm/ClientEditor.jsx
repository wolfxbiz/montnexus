import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useClients } from '../../../hooks/crm/useClients';
import { useLeads } from '../../../hooks/crm/useLeads';
import { supabase } from '../../../lib/supabase';

const EMPTY = { name: '', email: '', phone: '', company: '', address: '', city: '', country: 'India', gst_number: '', notes: '', lead_id: null };

export default function ClientEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromLead = searchParams.get('from_lead');
  const isNew = !id;

  const { client, fetchClientById, createClient, updateClient } = useClients();
  const { fetchLeadById } = useLeads();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [linkedProposals, setLinkedProposals] = useState([]);
  const [linkedInvoices, setLinkedInvoices] = useState([]);

  useEffect(() => {
    if (!isNew) {
      fetchClientById(id).then(data => { if (data) setForm(data); });
      // Fetch linked records
      supabase.from('crm_proposals').select('id, title, status, total_value, currency').eq('client_id', id)
        .then(({ data }) => setLinkedProposals(data || []));
      supabase.from('crm_invoices').select('id, invoice_number, status, total, currency').eq('client_id', id)
        .then(({ data }) => setLinkedInvoices(data || []));
    } else if (fromLead) {
      fetchLeadById(fromLead).then(lead => {
        if (lead) setForm(prev => ({ ...prev, name: lead.name, email: lead.email, phone: lead.phone || '', company: lead.company || '', notes: lead.notes || '', lead_id: lead.id }));
      });
    }
  }, [id, fromLead]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true); setError('');
    try {
      if (isNew) {
        const newClient = await createClient(form);
        navigate(`/admin/crm/clients/${newClient.id}`, { replace: true });
      } else {
        await updateClient(id, form);
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  const currencySymbols = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/crm/clients" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>← Clients</Link>
          <h1 className="admin-topbar-title">{isNew ? 'New Client' : (form.name || 'Edit Client')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isNew && <Link to={`/admin/crm/invoices/new?client=${id}`} className="admin-btn-secondary">+ New Invoice</Link>}
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Client'}
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-editor">
        <div>
          <div className="admin-editor-panel">
            <h3 className="admin-panel-title">Client Details</h3>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Name *</label>
                <input name="name" className="admin-input" value={form.name} onChange={handleChange} placeholder="Full name" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Email *</label>
                <input name="email" className="admin-input" type="email" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Phone</label>
                <input name="phone" className="admin-input" value={form.phone} onChange={handleChange} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Company</label>
                <input name="company" className="admin-input" value={form.company} onChange={handleChange} />
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Address</label>
              <input name="address" className="admin-input" value={form.address} onChange={handleChange} />
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">City</label>
                <input name="city" className="admin-input" value={form.city} onChange={handleChange} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Country</label>
                <select name="country" className="admin-select" value={form.country} onChange={handleChange}>
                  {['India', 'UAE', 'United States', 'United Kingdom', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">GST / VAT Number</label>
              <input name="gst_number" className="admin-input" value={form.gst_number} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Notes</label>
              <textarea name="notes" className="admin-textarea" value={form.notes} onChange={handleChange} rows={3} />
            </div>
          </div>
        </div>

        {/* Right: linked records */}
        {!isNew && (
          <div>
            {linkedProposals.length > 0 && (
              <div className="admin-editor-panel" style={{ marginBottom: 16 }}>
                <h3 className="admin-panel-title">Proposals ({linkedProposals.length})</h3>
                {linkedProposals.map(p => (
                  <div key={p.id} className="crm-linked-row">
                    <span style={{ flex: 1, fontSize: 13 }}>{p.title}</span>
                    <span className="crm-status-badge crm-status-badge--sm">{p.status}</span>
                    <Link to={`/admin/crm/proposals/${p.id}/edit`} style={{ fontSize: 12, color: '#92D108' }}>Edit</Link>
                  </div>
                ))}
              </div>
            )}
            {linkedInvoices.length > 0 && (
              <div className="admin-editor-panel">
                <h3 className="admin-panel-title">Invoices ({linkedInvoices.length})</h3>
                {linkedInvoices.map(inv => (
                  <div key={inv.id} className="crm-linked-row">
                    <span style={{ flex: 1, fontSize: 13 }}>{inv.invoice_number}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{currencySymbols[inv.currency]}{Number(inv.total).toLocaleString('en-IN')}</span>
                    <span className="crm-status-badge crm-status-badge--sm">{inv.status}</span>
                    <Link to={`/admin/crm/invoices/${inv.id}/edit`} style={{ fontSize: 12, color: '#92D108' }}>Edit</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
