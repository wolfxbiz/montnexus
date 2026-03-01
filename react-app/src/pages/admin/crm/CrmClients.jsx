import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '../../../hooks/crm/useClients';

export default function CrmClients() {
  const { clients, loading, fetchClients, deleteClient } = useClients();

  useEffect(() => { fetchClients(); }, []);

  function handleDelete(id) {
    if (!confirm('Delete this client? This will also block deletion of associated invoices.')) return;
    deleteClient(id).catch(err => alert(err.message));
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Clients</h1>
        <Link to="/admin/crm/clients/new" className="admin-btn-primary">+ New Client</Link>
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : clients.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
            No clients yet. <Link to="/admin/crm/clients/new" style={{ color: '#92D108' }}>Add your first client</Link>
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Company</th><th>Email</th><th>Country</th><th>Proposals</th><th>Invoices</th><th></th></tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: 600 }}>{client.name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{client.company || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{client.email}</td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{client.country || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{(client.crm_proposals || []).length}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{(client.crm_invoices || []).length}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/crm/clients/${client.id}`} className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</Link>
                        <button className="admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(client.id)}>Delete</button>
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
