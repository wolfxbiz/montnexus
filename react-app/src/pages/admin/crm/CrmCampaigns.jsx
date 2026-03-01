import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCampaigns } from '../../../hooks/crm/useCampaigns';

export default function CrmCampaigns() {
  const { campaigns, loading, fetchCampaigns, deleteCampaign } = useCampaigns();

  useEffect(() => { fetchCampaigns(); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this campaign?')) return;
    deleteCampaign(id).catch(err => alert(err.message));
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Email Campaigns</h1>
        <Link to="/admin/crm/campaigns/new" className="admin-btn-primary">+ New Campaign</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? <div className="admin-spinner" /> : campaigns.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
            No campaigns yet. <Link to="/admin/crm/campaigns/new" style={{ color: '#92D108' }}>Create one</Link>
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Subject</th><th>Recipients</th><th>Status</th><th>Sent</th><th>Count</th><th></th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{c.subject}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{c.recipient_type.replace(/_/g, ' ')}</td>
                    <td>
                      <span className="crm-status-badge" style={c.status === 'sent'
                        ? { background: '#92D10822', color: '#92D108', borderColor: '#92D10844' }
                        : { background: '#71717a22', color: '#71717a', borderColor: '#71717a44' }
                      }>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{c.sent_at ? new Date(c.sent_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{c.recipients_count || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {c.status !== 'sent' && (
                          <Link to={`/admin/crm/campaigns/${c.id}/edit`} className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</Link>
                        )}
                        <button className="admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(c.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
