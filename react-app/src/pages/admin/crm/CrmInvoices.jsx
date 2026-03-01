import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices } from '../../../hooks/crm/useInvoices';

const STATUS_COLORS = { draft: '#71717a', sent: '#3b82f6', paid: '#92D108', overdue: '#ef4444', cancelled: '#52525b' };
const CURRENCY_SYMBOLS = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };

function isOverdue(invoice) {
  return invoice.due_date && invoice.status === 'sent' && new Date(invoice.due_date) < new Date();
}

export default function CrmInvoices() {
  const { invoices, loading, fetchInvoices, deleteInvoice } = useInvoices();

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
        <h1 className="admin-topbar-title">Invoices</h1>
        <Link to="/admin/crm/invoices/new" className="admin-btn-primary">+ New Invoice</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? <div className="admin-spinner" /> : invoices.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
            No invoices yet. <Link to="/admin/crm/invoices/new" style={{ color: '#92D108' }}>Create one</Link>
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Invoice #</th><th>Client</th><th>Status</th><th>Total</th><th>Due Date</th><th></th></tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const overdue = isOverdue(inv);
                  const status = overdue ? 'overdue' : inv.status;
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', color: '#92D108' }}>{inv.invoice_number}</td>
                      <td style={{ color: 'rgba(255,255,255,0.7)' }}>{inv.crm_clients?.name || '—'}</td>
                      <td>
                        <span className="crm-status-badge" style={{ background: STATUS_COLORS[status] + '22', color: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] + '44' }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmt(inv)}</td>
                      <td style={{ color: overdue ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: 13 }}>
                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link to={`/admin/crm/invoices/${inv.id}/edit`} className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</Link>
                          <button className="admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(inv.id)}>Delete</button>
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
