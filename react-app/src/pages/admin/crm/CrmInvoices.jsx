import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useInvoices } from '../../../hooks/crm/useInvoices';
import { useRole } from '../../../hooks/useRole';

const CURRENCY_SYMBOLS = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };

function isOverdue(inv) {
  return inv.due_date && inv.status === 'sent' && new Date(inv.due_date) < new Date();
}

export default function CrmInvoices() {
  const { can, loading: roleLoading } = useRole();
  const { invoices, loading, fetchInvoices, deleteInvoice } = useInvoices();
  if (!roleLoading && !can('crm')) return <Navigate to="/admin/posts" replace />;

  useEffect(() => { fetchInvoices(); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this invoice?')) return;
    deleteInvoice(id).catch(err => alert(err.message));
  }

  const fmt = (inv) => {
    const sym = CURRENCY_SYMBOLS[inv.currency] || inv.currency;
    return `${sym}${Number(inv.total).toLocaleString('en-IN')}`;
  };

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar__title">Invoices</h1>
        <Link to="/admin/crm/invoices/new" className="admin-btn-primary">+ New Invoice</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : invoices.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>
            </svg>
            <p className="crm-empty-state__text">No invoices yet. <Link to="/admin/crm/invoices/new">Create one</Link></p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Invoice #</th><th>Client</th><th>Status</th><th>Total</th><th>Due Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const overdue = isOverdue(inv);
                  const status = overdue ? 'overdue' : inv.status;
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--green)' }}>{inv.invoice_number}</td>
                      <td className="admin-table-title">{inv.crm_clients?.name || '—'}</td>
                      <td>
                        <span className={`crm-status-badge crm-status--${status}`}>{status}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmt(inv)}</td>
                      <td style={{ color: overdue ? 'var(--admin-danger)' : 'var(--admin-text-muted)', fontSize: 12 }}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <Link to={`/admin/crm/invoices/${inv.id}/edit`} className="admin-action-btn">Edit</Link>
                          <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(inv.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
