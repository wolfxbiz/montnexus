import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';

const CURRENCY_SYMBOLS = { INR: '₹', AED: 'AED ', USD: '$', EUR: '€' };

export default function CrmDashboard() {
  const [stats, setStats] = useState({ leads: 0, newLeads: 0, clients: 0, unpaidTotal: 0 });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const now = new Date();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

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
  }, []);

  const STATUS_COLORS = { new: '#3b82f6', contacted: '#eab308', qualified: '#a855f7', proposal_sent: '#f97316', won: '#92D108', lost: '#71717a' };

  if (loading) return <div className="admin-content"><div className="admin-spinner" /></div>;

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">CRM Dashboard</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/crm/leads/new" className="admin-btn-secondary">+ Add Lead</Link>
          <Link to="/admin/crm/invoices/new" className="admin-btn-primary">+ New Invoice</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="crm-stats-row">
        <div className="crm-stat-card">
          <div className="crm-stat-card__value">{stats.leads}</div>
          <div className="crm-stat-card__label">Total Leads</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-card__value" style={{ color: '#92D108' }}>{stats.newLeads}</div>
          <div className="crm-stat-card__label">New This Week</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-card__value">{stats.clients}</div>
          <div className="crm-stat-card__label">Active Clients</div>
        </div>
        <div className="crm-stat-card">
          <div className="crm-stat-card__value">₹{stats.unpaidTotal.toLocaleString('en-IN')}</div>
          <div className="crm-stat-card__label">Unpaid Invoices</div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="admin-editor-panel" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7', margin: 0 }}>Recent Leads</h2>
          <Link to="/admin/crm/leads" style={{ fontSize: 13, color: '#92D108' }}>View All →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No leads yet. <Link to="/admin/crm/leads/new" style={{ color: '#92D108' }}>Add your first lead</Link></p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Company</th><th>Source</th><th>Status</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {recentLeads.map(lead => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 600 }}>{lead.name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{lead.company || '—'}</td>
                    <td><span className="crm-source-badge">{lead.source.replace('_', ' ')}</span></td>
                    <td><span className="crm-status-badge" style={{ background: STATUS_COLORS[lead.status] + '22', color: STATUS_COLORS[lead.status], borderColor: STATUS_COLORS[lead.status] + '44' }}>{lead.status.replace('_', ' ')}</span></td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                    <td><Link to={`/admin/crm/leads/${lead.id}`} className="admin-btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="crm-quick-actions">
        <Link to="/admin/crm/proposals/new" className="crm-quick-card">
          <span className="crm-quick-card__icon">📄</span>
          <span className="crm-quick-card__label">New Proposal</span>
        </Link>
        <Link to="/admin/crm/invoices/new" className="crm-quick-card">
          <span className="crm-quick-card__icon">🧾</span>
          <span className="crm-quick-card__label">New Invoice</span>
        </Link>
        <Link to="/admin/crm/campaigns/new" className="crm-quick-card">
          <span className="crm-quick-card__icon">✉️</span>
          <span className="crm-quick-card__label">New Campaign</span>
        </Link>
        <Link to="/admin/crm/clients/new" className="crm-quick-card">
          <span className="crm-quick-card__icon">👤</span>
          <span className="crm-quick-card__label">Add Client</span>
        </Link>
      </div>
    </div>
  );
}
