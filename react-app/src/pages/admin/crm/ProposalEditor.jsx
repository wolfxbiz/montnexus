import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useProposals } from '../../../hooks/crm/useProposals';
import { supabase } from '../../../lib/supabase';

const CURRENCIES = ['INR', 'AED', 'USD', 'EUR'];
const TONES = ['professional', 'consultative', 'bold'];
const STATUS_COLORS = { draft: '#71717a', sent: '#3b82f6', viewed: '#eab308', accepted: '#92D108', rejected: '#ef4444' };
const EMPTY = { title: '', content: '', status: 'draft', currency: 'INR', total_value: '', valid_until: '', lead_id: null, client_id: null };

export default function ProposalEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromLead = searchParams.get('lead');
  const isNew = !id;

  const { proposal, fetchProposalById, createProposal, updateProposal } = useProposals();

  const [form, setForm] = useState({ ...EMPTY, lead_id: fromLead || null });
  const [recipientType, setRecipientType] = useState('lead');
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTone, setAiTone] = useState('professional');
  const [leadContext, setLeadContext] = useState(null);

  useEffect(() => {
    supabase.from('crm_leads').select('id, name, email, company, message').order('created_at', { ascending: false }).then(({ data }) => setLeads(data || []));
    supabase.from('crm_clients').select('id, name, email, company').order('name').then(({ data }) => setClients(data || []));
    if (!isNew) {
      fetchProposalById(id).then(data => {
        if (data) {
          setForm({ ...data, total_value: data.total_value || '', valid_until: data.valid_until || '' });
          setRecipientType(data.client_id ? 'client' : 'lead');
        }
      });
    }
  }, [id]);

  // When a lead is selected, load their context for AI
  useEffect(() => {
    if (form.lead_id && leads.length > 0) {
      const l = leads.find(l => l.id === form.lead_id);
      setLeadContext(l || null);
    }
  }, [form.lead_id, leads]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave(status = form.status) {
    if (!form.title || !form.content) { setError('Title and content are required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        status,
        lead_id: recipientType === 'lead' ? form.lead_id : null,
        client_id: recipientType === 'client' ? form.client_id : null,
        total_value: form.total_value ? parseFloat(form.total_value) : null,
        valid_until: form.valid_until || null,
      };
      if (isNew) {
        const created = await createProposal(payload);
        navigate(`/admin/crm/proposals/${created.id}/edit`, { replace: true });
      } else {
        await updateProposal(id, payload);
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleSend() {
    if (!id) { setError('Save the proposal first'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/crm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_proposal', proposalId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      await updateProposal(id, { status: 'sent', sent_at: new Date().toISOString() });
      setForm(prev => ({ ...prev, status: 'sent' }));
      alert(`Proposal sent to ${data.to}`);
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  }

  async function handleAiGenerate() {
    setAiLoading(true); setError('');
    try {
      const services = ['Retail Automation Systems', 'Web Design & Development'];
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'proposal_draft',
          lead_name: leadContext?.name || form.title,
          company: leadContext?.company || '',
          message: leadContext?.message || '',
          services,
          tone: aiTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(prev => ({ ...prev, content: data.content }));
    } catch (err) {
      setError(err.message);
    }
    setAiLoading(false);
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/crm/proposals" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>← Proposals</Link>
          <h1 className="admin-topbar-title">{isNew ? 'New Proposal' : (form.title || 'Edit Proposal')}</h1>
          {!isNew && (
            <span className="crm-status-badge" style={{ background: STATUS_COLORS[form.status] + '22', color: STATUS_COLORS[form.status], borderColor: STATUS_COLORS[form.status] + '44' }}>
              {form.status}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn-secondary" onClick={() => handleSave()} disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</button>
          <button className="admin-btn-primary" onClick={handleSend} disabled={sending || isNew}>{sending ? 'Sending…' : 'Send Proposal'}</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-editor">
        {/* Main content */}
        <div>
          <div className="admin-editor-panel">
            <div className="admin-field">
              <label className="admin-label">Proposal Title</label>
              <input name="title" className="admin-input" value={form.title} onChange={handleChange} placeholder="e.g. Retail Automation Proposal for Acme Corp" />
            </div>

            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Recipient</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <button className={`admin-btn-secondary${recipientType === 'lead' ? ' active' : ''}`} style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => setRecipientType('lead')}>Lead</button>
                  <button className={`admin-btn-secondary${recipientType === 'client' ? ' active' : ''}`} style={{ fontSize: 12, padding: '4px 12px' }} onClick={() => setRecipientType('client')}>Client</button>
                </div>
                {recipientType === 'lead' ? (
                  <select name="lead_id" className="admin-select" value={form.lead_id || ''} onChange={handleChange}>
                    <option value="">Select a lead…</option>
                    {leads.map(l => <option key={l.id} value={l.id}>{l.name} {l.company ? `(${l.company})` : ''}</option>)}
                  </select>
                ) : (
                  <select name="client_id" className="admin-select" value={form.client_id || ''} onChange={handleChange}>
                    <option value="">Select a client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                  </select>
                )}
              </div>
              <div className="admin-field">
                <label className="admin-label">Currency</label>
                <select name="currency" className="admin-select" value={form.currency} onChange={handleChange}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Total Value</label>
                <input name="total_value" type="number" className="admin-input" value={form.total_value} onChange={handleChange} placeholder="0.00" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Valid Until</label>
                <input name="valid_until" type="date" className="admin-input" value={form.valid_until} onChange={handleChange} />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label">Proposal Content (HTML)</label>
              <textarea name="content" className="admin-textarea" value={form.content} onChange={handleChange} rows={20} placeholder="Generate with AI or write your proposal here…" style={{ fontFamily: 'monospace', fontSize: 13 }} />
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        <div>
          <div className="admin-editor-panel ai-panel">
            <h3 className="admin-panel-title" style={{ color: '#92D108' }}>AI Proposal Generator</h3>
            {leadContext && (
              <div style={{ background: 'rgba(146,209,8,0.07)', border: '1px solid rgba(146,209,8,0.15)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>Using context from:</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', margin: 0 }}>{leadContext.name}{leadContext.company ? ` — ${leadContext.company}` : ''}</p>
                {leadContext.message && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '6px 0 0', lineHeight: 1.4 }}>{leadContext.message.substring(0, 120)}…</p>}
              </div>
            )}
            <div className="admin-field">
              <label className="admin-label">Tone</label>
              <select className="admin-select" value={aiTone} onChange={e => setAiTone(e.target.value)}>
                {TONES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <button className="ai-generate-btn" onClick={handleAiGenerate} disabled={aiLoading}>
              {aiLoading ? 'Generating…' : '✦ Generate Proposal with AI'}
            </button>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.5 }}>
              AI will generate a full HTML proposal with executive summary, scope, deliverables, and investment sections. You can edit the content freely after generating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
