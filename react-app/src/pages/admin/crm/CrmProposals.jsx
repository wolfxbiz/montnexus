import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProposals } from '../../../hooks/crm/useProposals';

const CURRENCY_SYMBOLS = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };

export default function CrmProposals() {
  const { proposals, loading, fetchProposals, deleteProposal } = useProposals();

  useEffect(() => { fetchProposals(); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this proposal?')) return;
    deleteProposal(id).catch(err => alert(err.message));
  }

  const recipient = (p) => p.crm_clients?.name || p.crm_leads?.name || '—';
  const fmtValue = (p) => p.total_value
    ? `${CURRENCY_SYMBOLS[p.currency] || p.currency}${Number(p.total_value).toLocaleString()}`
    : '—';

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar__title">Proposals</h1>
        <Link to="/admin/crm/proposals/new" className="admin-btn-primary">+ New Proposal</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : proposals.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
            </svg>
            <p className="crm-empty-state__text">No proposals yet. <Link to="/admin/crm/proposals/new">Create one</Link></p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th><th>Recipient</th><th>Status</th><th>Value</th><th>Created</th><th></th>
                </tr>
              </thead>
              <tbody>
                {proposals.map(p => (
                  <tr key={p.id}>
                    <td className="admin-table-title">{p.title}</td>
                    <td>{recipient(p)}</td>
                    <td>
                      <span className={`crm-status-badge crm-status--${p.status}`}>{p.status}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmtValue(p)}</td>
                    <td style={{ fontSize: 12 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Link to={`/admin/crm/proposals/${p.id}/edit`} className="admin-action-btn">Edit</Link>
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(p.id)}>Delete</button>
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
