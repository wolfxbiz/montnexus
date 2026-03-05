import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useCampaigns } from '../../../hooks/crm/useCampaigns';
import { useRole } from '../../../hooks/useRole';

export default function CrmCampaigns() {
  const { can, loading: roleLoading } = useRole();
  const { campaigns, loading, fetchCampaigns, deleteCampaign } = useCampaigns();
  if (!roleLoading && !can('crm')) return <Navigate to="/admin/posts" replace />;

  useEffect(() => { fetchCampaigns(); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this campaign?')) return;
    deleteCampaign(id).catch(err => alert(err.message));
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar__title">Email Campaigns</h1>
        <Link to="/admin/crm/campaigns/new" className="admin-btn-primary">+ New Campaign</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : campaigns.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
            <p className="crm-empty-state__text">No campaigns yet. <Link to="/admin/crm/campaigns/new">Create one</Link></p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Subject</th><th>Recipients</th><th>Status</th><th>Sent</th><th>Count</th><th></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td className="admin-table-title">{c.name}</td>
                    <td style={{ fontSize: 12 }}>{c.subject}</td>
                    <td>{c.recipient_type.replace(/_/g, ' ')}</td>
                    <td>
                      <span className={`crm-status-badge crm-status--${c.status}`}>{c.status}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>{c.sent_at ? new Date(c.sent_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>{c.recipients_count || 0}</td>
                    <td>
                      <div className="admin-table-actions">
                        {c.status !== 'sent' && (
                          <Link to={`/admin/crm/campaigns/${c.id}/edit`} className="admin-action-btn">Edit</Link>
                        )}
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(c.id)}>Delete</button>
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
