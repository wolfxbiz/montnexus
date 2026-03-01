import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { useLeads } from '../../../hooks/crm/useLeads';

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];
const STATUS_COLORS = { new: '#3b82f6', contacted: '#eab308', qualified: '#a855f7', proposal_sent: '#f97316', won: '#92D108', lost: '#71717a' };

const REQUIRED_CSV_COLS = ['name', 'email'];

export default function CrmLeads() {
  const { leads, loading, fetchLeads, createLead, deleteLead, bulkCreateLeads } = useLeads();
  const [filter, setFilter] = useState('all');
  const [csvModal, setCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  useEffect(() => { fetchLeads(filter); }, [filter]);

  function handleDelete(id) {
    if (!confirm('Delete this lead?')) return;
    deleteLead(id).catch(err => alert(err.message));
  }

  function handleCsvFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const cols = meta.fields.map(f => f.toLowerCase().trim());
        if (!REQUIRED_CSV_COLS.every(c => cols.includes(c))) {
          setCsvError(`CSV must have columns: ${REQUIRED_CSV_COLS.join(', ')}`);
          setCsvRows([]);
          return;
        }
        setCsvError('');
        const normalised = data.map(row => {
          const r = {};
          Object.keys(row).forEach(k => { r[k.toLowerCase().trim()] = row[k]; });
          return {
            name: r.name?.trim() || '',
            email: r.email?.trim().toLowerCase() || '',
            phone: r.phone?.trim() || null,
            company: r.company?.trim() || null,
            message: r.message?.trim() || null,
            source: 'csv_import',
            status: 'new',
          };
        }).filter(r => r.name && r.email);
        setCsvRows(normalised);
      },
    });
  }

  async function handleImport() {
    if (csvRows.length === 0) return;
    setImporting(true);
    try {
      await bulkCreateLeads(csvRows);
      setCsvModal(false);
      setCsvRows([]);
      fetchLeads(filter);
    } catch (err) {
      setCsvError(err.message);
    }
    setImporting(false);
  }

  return (
    <div className="admin-content">
      <div className="admin-topbar">
        <h1 className="admin-topbar-title">Leads</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn-secondary" onClick={() => { setCsvModal(true); setCsvRows([]); setCsvError(''); }}>Import CSV</button>
          <Link to="/admin/crm/leads/new" className="admin-btn-primary">+ New Lead</Link>
        </div>
      </div>

      {/* Pipeline filter tabs */}
      <div className="crm-pipeline-tabs">
        {STATUSES.map(s => (
          <button key={s} className={`crm-pipeline-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : leads.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>
            No leads found. <Link to="/admin/crm/leads/new" style={{ color: '#92D108' }}>Add one</Link>
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Company</th><th>Email</th><th>Source</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td style={{ fontWeight: 600 }}>{lead.name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{lead.company || '—'}</td>
                    <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{lead.email}</td>
                    <td><span className="crm-source-badge">{lead.source.replace(/_/g, ' ')}</span></td>
                    <td>
                      <span className="crm-status-badge" style={{ background: STATUS_COLORS[lead.status] + '22', color: STATUS_COLORS[lead.status], borderColor: STATUS_COLORS[lead.status] + '44' }}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{new Date(lead.created_at).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/crm/leads/${lead.id}`} className="admin-btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>Edit</Link>
                        <button className="admin-btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(lead.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Import Modal */}
      {csvModal && (
        <div className="crm-modal-overlay" onClick={() => setCsvModal(false)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', color: '#e4e4e7' }}>Import Leads from CSV</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
              CSV must have columns: <strong>name</strong>, <strong>email</strong> (optional: phone, company, message)
            </p>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCsvFile} className="admin-input" style={{ marginBottom: 12 }} />
            {csvError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{csvError}</p>}
            {csvRows.length > 0 && (
              <p style={{ color: '#92D108', fontSize: 14, marginBottom: 16 }}>✓ {csvRows.length} leads ready to import</p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="admin-btn-secondary" onClick={() => setCsvModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleImport} disabled={csvRows.length === 0 || importing}>
                {importing ? 'Importing…' : `Import ${csvRows.length} Leads`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
