import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampaigns } from '../../../hooks/crm/useCampaigns';

const RECIPIENT_TYPES = [
  { value: 'all_leads', label: 'All Leads', desc: 'Everyone in your leads list' },
  { value: 'qualified_leads', label: 'Qualified Leads', desc: 'Leads with status: qualified, proposal_sent, or won' },
  { value: 'all_clients', label: 'All Clients', desc: 'All your active clients' },
  { value: 'custom', label: 'Custom Emails', desc: 'Paste specific email addresses' },
];
const TONES = ['professional', 'friendly', 'bold'];
const EMPTY = { name: '', subject: '', content: '', recipient_type: 'all_leads', custom_emails: '' };

export default function CampaignEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { campaign, fetchCampaignById, createCampaign, updateCampaign } = useCampaigns();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiLoading, setAiLoading] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchCampaignById(id).then(data => {
        if (data) setForm({ ...data, custom_emails: (data.custom_emails || []).join('\n') });
      });
    }
  }, [id]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name || !form.subject || !form.content) { setError('Name, subject, and content are required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        custom_emails: form.recipient_type === 'custom'
          ? form.custom_emails.split('\n').map(e => e.trim()).filter(Boolean)
          : [],
      };
      if (isNew) {
        const created = await createCampaign(payload);
        navigate(`/admin/crm/campaigns/${created.id}/edit`, { replace: true });
      } else {
        await updateCampaign(id, payload);
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleSend() {
    if (isNew || !id) { setError('Save the campaign first'); return; }
    if (!confirm(`Send this campaign to ${RECIPIENT_TYPES.find(r => r.value === form.recipient_type)?.label}? This cannot be undone.`)) return;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/crm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_campaign', campaignId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Campaign sent to ${data.sent} recipients!`);
      navigate('/admin/crm/campaigns');
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  }

  async function handleAiGenerate() {
    if (!aiTopic.trim()) { setError('Enter a topic for the campaign'); return; }
    setAiLoading(true); setError('');
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'campaign_draft', topic: aiTopic, tone: aiTone, recipient_type: form.recipient_type }),
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
          <Link to="/admin/crm/campaigns" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>← Campaigns</Link>
          <h1 className="admin-topbar-title">{isNew ? 'New Campaign' : (form.name || 'Edit Campaign')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn-secondary" onClick={() => setPreview(p => !p)}>{preview ? 'Edit' : 'Preview'}</button>
          <button className="admin-btn-secondary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</button>
          <button className="admin-btn-primary" onClick={handleSend} disabled={sending || isNew}>{sending ? 'Sending…' : 'Send Campaign'}</button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {preview ? (
        <div className="admin-editor-panel">
          <h3 className="admin-panel-title">Preview</h3>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, color: '#202020' }} dangerouslySetInnerHTML={{ __html: form.content }} />
        </div>
      ) : (
        <div className="admin-editor">
          <div>
            <div className="admin-editor-panel">
              <div className="admin-field">
                <label className="admin-label">Campaign Name (internal)</label>
                <input name="name" className="admin-input" value={form.name} onChange={handleChange} placeholder="e.g. Q1 Newsletter — Retail Clients" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Email Subject</label>
                <input name="subject" className="admin-input" value={form.subject} onChange={handleChange} placeholder="e.g. How Montnexus Can Transform Your Store" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Recipients</label>
                {RECIPIENT_TYPES.map(r => (
                  <label key={r.value} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10, cursor: 'pointer' }}>
                    <input type="radio" name="recipient_type" value={r.value} checked={form.recipient_type === r.value} onChange={handleChange} style={{ marginTop: 3 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              {form.recipient_type === 'custom' && (
                <div className="admin-field">
                  <label className="admin-label">Email Addresses (one per line)</label>
                  <textarea name="custom_emails" className="admin-textarea" value={form.custom_emails} onChange={handleChange} rows={5} placeholder="john@example.com&#10;jane@company.com" />
                </div>
              )}
              <div className="admin-field">
                <label className="admin-label">Email Content (HTML)</label>
                <textarea name="content" className="admin-textarea" value={form.content} onChange={handleChange} rows={16} placeholder="Generate with AI or write HTML content here…" style={{ fontFamily: 'monospace', fontSize: 13 }} />
              </div>
            </div>
          </div>

          {/* AI Sidebar */}
          <div>
            <div className="admin-editor-panel ai-panel">
              <h3 className="admin-panel-title" style={{ color: '#92D108' }}>AI Campaign Generator</h3>
              <div className="admin-field">
                <label className="admin-label">Campaign Topic</label>
                <textarea className="admin-textarea" value={aiTopic} onChange={e => setAiTopic(e.target.value)} rows={3} placeholder="e.g. How our retail automation system reduces inventory loss by 40%" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Tone</label>
                <select className="admin-select" value={aiTone} onChange={e => setAiTone(e.target.value)}>
                  {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button className="ai-generate-btn" onClick={handleAiGenerate} disabled={aiLoading}>
                {aiLoading ? 'Generating…' : '✦ Generate with AI'}
              </button>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10, lineHeight: 1.5 }}>
                AI writes a professional newsletter with opening, insight sections, and a CTA button. Edit freely after generating.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
