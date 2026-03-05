import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useClients } from '../../../hooks/crm/useClients';
import { useRole } from '../../../hooks/useRole';

export default function CrmClients() {
  const { can, loading: roleLoading } = useRole();
  const { clients, loading, fetchClients, deleteClient } = useClients();

  useEffect(() => {
    if (roleLoading || !can('crm')) return;
    fetchClients();
  }, [roleLoading, can]);

  if (!roleLoading && !can('crm')) return <Navigate to="/admin/posts" replace />;

  function handleDelete(id) {
    if (!confirm('Delete this client? Associated invoices will be unlinked.')) return;
    deleteClient(id).catch(err => alert(err.message));
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar__title">Clients</h1>
        <Link to="/admin/crm/clients/new" className="admin-btn-primary">+ New Client</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : clients.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"/>
            </svg>
            <p className="crm-empty-state__text">No clients yet. <Link to="/admin/crm/clients/new">Add your first client</Link></p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Company</th><th>Email</th><th>Country</th><th>Proposals</th><th>Invoices</th><th></th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td className="admin-table-title">{client.name}</td>
                    <td>{client.company || '—'}</td>
                    <td style={{ fontSize: 12 }}>{client.email}</td>
                    <td>{client.country || '—'}</td>
                    <td>{(client.crm_proposals || []).length}</td>
                    <td>{(client.crm_invoices || []).length}</td>
                    <td>
                      <div className="admin-table-actions">
                        <Link to={`/admin/crm/clients/${client.id}`} className="admin-action-btn">Edit</Link>
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(client.id)}>Delete</button>
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
