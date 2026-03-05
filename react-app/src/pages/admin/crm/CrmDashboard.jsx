import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useRole } from '../../../hooks/useRole';

export default function CrmDashboard() {
  const { can, loading: roleLoading } = useRole();
  const [stats, setStats] = useState({ leads: 0, newLeads: 0, clients: 0, unpaidTotal: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading || !can('crm')) return;
    async function load() {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const [
        { count: leads },
        { count: newLeads },
        { count: clients },
        { data: unpaidInvoices },
        { data: recent },
      ] = await Promise.all([
        supabase.from('crm_leads').select('*', { count: 'exact', head: true }),
        supabase.from('crm_leads').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo),
        supabase.from('crm_clients').select('*', { count: 'exact', head: true }),
        supabase.from('crm_invoices').select('total, currency').in('status', ['sent', 'overdue']),
        supabase.from('crm_leads').select('*').order('created_at', { ascending: false }).limit(6),
      ]);
      const unpaidTotal = (unpaidInvoices || []).reduce((s, i) => s + Number(i.total), 0);
      setStats({ leads: leads || 0, newLeads: newLeads || 0, clients: clients || 0, unpaidTotal });
      setRecentLeads(recent || []);
      setLoading(false);
    }
    load();
  }, [roleLoading, can]);

  if (!roleLoading && !can('crm')) return <Navigate to="/admin/posts" replace />;

  if (loading) return <div className="admin-content"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar__title">CRM Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/crm/leads/new" className="admin-btn-secondary">+ Add Lead</Link>
          <Link to="/admin/crm/invoices/new" className="admin-btn-primary">+ New Invoice</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="crm-stats-row">
        <div className="crm-stat-card">
          <div className="crm-stat-label">Total Leads</div>
          <div className="crm-stat-value">{stats.leads}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">New This Week</div>
          <div className="crm-stat-value" style={{ color: 'var(--green)' }}>{stats.newLeads}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Active Clients</div>
          <div className="crm-stat-value">{stats.clients}</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-label">Unpaid Invoices</div>
          <div className="crm-stat-value" style={{ fontSize: 24 }}>₹{stats.unpaidTotal.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="admin-editor-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span className="admin-editor-panel__title" style={{ marginBottom: 0 }}>Recent Leads</span>
          <Link to="/admin/crm/leads" style={{ fontSize: 12, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
            <p className="crm-empty-state__text">No leads yet. <Link to="/admin/crm/leads/new">Add your first lead</Link></p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Company</th><th>Source</th><th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td className="admin-table-title">{lead.name}</td>
                    <td>{lead.company || '—'}</td>
                    <td>
                      <span className={`crm-source-badge crm-source--${lead.source}`}>
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`crm-status-badge crm-status--${lead.status}`}>
                        {lead.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/admin/crm/leads/${lead.id}`} className="admin-action-btn">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="crm-quick-actions">
        <Link to="/admin/crm/proposals/new" className="crm-quick-action">
          <div className="crm-quick-action__icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="crm-quick-action__label">New Proposal</div>
          <div className="crm-quick-action__desc">Draft a proposal for a lead or client</div>
        </Link>

        <Link to="/admin/crm/invoices/new" className="crm-quick-action">
          <div className="crm-quick-action__icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="crm-quick-action__label">New Invoice</div>
          <div className="crm-quick-action__desc">Create and send an invoice</div>
        </Link>

        <Link to="/admin/crm/campaigns/new" className="crm-quick-action">
          <div className="crm-quick-action__icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          </div>
          <div className="crm-quick-action__label">New Campaign</div>
          <div className="crm-quick-action__desc">Send an email to leads or clients</div>
        </Link>

        <Link to="/admin/crm/clients/new" className="crm-quick-action">
          <div className="crm-quick-action__icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"/>
            </svg>
          </div>
          <div className="crm-quick-action__label">Add Client</div>
          <div className="crm-quick-action__desc">Convert a lead or add a new client</div>
        </Link>
      </div>
    </div>
  );
}
