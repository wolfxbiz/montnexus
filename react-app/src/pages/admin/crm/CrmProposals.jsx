import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProposals } from '../../../hooks/crm/useProposals';

const STATUS_COLORS = { draft: '#71717a', sent: '#3b82f6', viewed: '#eab308', accepted: '#92D108', rejected: '#ef4444' };
const CURRENCY_SYMBOLS = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };

export default function CrmProposals() {
  const { proposals, loading, fetchProposals, deleteProposal } = useProposals();

  useEffect(() => { fetchProposals(); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this proposal?')) return;
    deleteProposal(id).catch(err => alert(err.message));
  }

  const recipient = (p) => p.crm_clients?.name || p.crm_leads?.name || '—';

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Proposals</h1>
        <Link to="/admin/crm/proposals/new" className="admin-btn-primary">+ New Proposal</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? <div className="admin-spinner" /> : proposals.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
            No proposals yet. <Link to="/admin/crm/proposals/new" style={{ color: '#92D108' }}>Create one</Link>
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Title</th><th>Recipient</th><th>Status</th><th>Value</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {proposals.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{recipient(p)}</td>
                    <td>
                      <span className="crm-status-badge" style={{ background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status], borderColor: STATUS_COLORS[p.status] + '44' }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.6)' }}>
                      {p.total_value ? `${CURRENCY_SYMBOLS[p.currency] || p.currency}${Number(p.total_value).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/crm/proposals/${p.id}/edit`} className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</Link>
                        <button className="admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(p.id)}>Delete</button>
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
