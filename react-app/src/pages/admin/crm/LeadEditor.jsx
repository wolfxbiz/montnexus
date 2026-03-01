import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLeads } from '../../../hooks/crm/useLeads';
import { useActivities } from '../../../hooks/crm/useActivities';

const SOURCES = ['website_form', 'instagram', 'facebook', 'linkedin', 'referral', 'manual', 'csv_import'];
const STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];
const EMPTY = { name: '', email: '', phone: '', company: '', message: '', source: 'manual', status: 'new', notes: '', tags: '' };

const ACTIVITY_ICONS = { note: '📝', email_sent: '✉️', status_change: '🔄', proposal_sent: '📄', invoice_sent: '🧾', call: '📞', meeting: '🤝' };

export default function LeadEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const { lead, fetchLeadById, createLead, updateLead } = useLeads();
  const { activities, fetchActivities, logActivity } = useActivities();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchLeadById(id).then(data => {
        if (data) setForm({ ...data, tags: (data.tags || []).join(', ') });
      });
      fetchActivities('lead', id);
    }
  }, [id]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name || !form.email) { setError('Name and email are required'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (isNew) {
        const newLead = await createLead(payload);
        navigate(`/admin/crm/leads/${newLead.id}`, { replace: true });
      } else {
        const prev = lead?.status;
        await updateLead(id, payload);
        if (prev && prev !== form.status) {
          await logActivity({ entity_type: 'lead', entity_id: id, type: 'status_change', content: `Status changed from "${prev}" to "${form.status}"` });
        }
      }
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  async function handleAddNote() {
    if (!noteText.trim() || !id) return;
    setAddingNote(true);
    await logActivity({ entity_type: 'lead', entity_id: id, type: 'note', content: noteText.trim() });
    setNoteText('');
    setAddingNote(false);
  }

  async function handleConvertToClient() {
    navigate(`/admin/crm/clients/new?from_lead=${id}`);
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/crm/leads" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>← Leads</Link>
          <h1 className="admin-topbar-title">{isNew ? 'New Lead' : (form.name || 'Edit Lead')}</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {!isNew && lead?.status === 'won' && (
            <button className="admin-btn-secondary" onClick={handleConvertToClient}>Convert to Client →</button>
          )}
          {!isNew && (
            <Link to={`/admin/crm/proposals/new?lead=${id}`} className="admin-btn-secondary">Create Proposal</Link>
          )}
          <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Lead'}
          </button>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-editor">
        {/* Left: form */}
        <div>
          <div className="admin-editor-panel">
            <h3 className="admin-panel-title">Lead Details</h3>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Name *</label>
                <input name="name" className="admin-input" value={form.name} onChange={handleChange} placeholder="Full name" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Email *</label>
                <input name="email" className="admin-input" type="email" value={form.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Phone</label>
                <input name="phone" className="admin-input" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="admin-field">
                <label className="admin-label">Company</label>
                <input name="company" className="admin-input" value={form.company} onChange={handleChange} placeholder="Company name" />
              </div>
            </div>
            <div className="admin-field-row">
              <div className="admin-field">
                <label className="admin-label">Source</label>
                <select name="source" className="admin-select" value={form.source} onChange={handleChange}>
                  {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">Status</label>
                <select name="status" className="admin-select" value={form.status} onChange={handleChange}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-field">
              <label className="admin-label">Enquiry / Message</label>
              <textarea name="message" className="admin-textarea" value={form.message} onChange={handleChange} rows={3} placeholder="What did they enquire about?" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Internal Notes</label>
              <textarea name="notes" className="admin-textarea" value={form.notes} onChange={handleChange} rows={3} placeholder="Internal notes visible only to admins" />
            </div>
            <div className="admin-field">
              <label className="admin-label">Tags (comma-separated)</label>
              <input name="tags" className="admin-input" value={form.tags} onChange={handleChange} placeholder="hot-lead, retail, q2" />
            </div>
          </div>
        </div>

        {/* Right: Activity log */}
        {!isNew && (
          <div>
            <div className="admin-editor-panel">
              <h3 className="admin-panel-title">Activity Log</h3>
              <div className="admin-field">
                <textarea className="admin-textarea" value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} placeholder="Add a note, call log, meeting note…" />
                <button className="admin-btn-secondary" style={{ marginTop: 8 }} onClick={handleAddNote} disabled={addingNote || !noteText.trim()}>
                  {addingNote ? 'Adding…' : 'Add Note'}
                </button>
              </div>
              <div className="crm-activity-log" style={{ marginTop: 16 }}>
                {activities.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No activity yet.</p>
                ) : activities.map(a => (
                  <div key={a.id} className="crm-activity-item">
                    <span className="crm-activity-icon">{ACTIVITY_ICONS[a.type] || '📌'}</span>
                    <div className="crm-activity-body">
                      <p className="crm-activity-content">{a.content}</p>
                      <span className="crm-activity-time">{new Date(a.created_at).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
