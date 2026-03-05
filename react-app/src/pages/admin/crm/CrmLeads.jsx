import { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Papa from 'papaparse';
import { useLeads } from '../../../hooks/crm/useLeads';
import { useRole } from '../../../hooks/useRole';

const STATUSES = ['all', 'new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];
const REQUIRED_CSV_COLS = ['name', 'email'];

export default function CrmLeads() {
  const { can, loading: roleLoading } = useRole();
  const { leads, loading, fetchLeads, deleteLead, bulkCreateLeads } = useLeads();
  const [filter, setFilter] = useState('all');
  const [csvModal, setCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvError, setCsvError] = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (roleLoading || !can('crm')) return;
    fetchLeads(filter);
  }, [filter, roleLoading, can]);

  if (!roleLoading && !can('crm')) return <Navigate to="/admin/posts" replace />;

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
        <h1 className="admin-topbar__title">Leads</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn-secondary" onClick={() => { setCsvModal(true); setCsvRows([]); setCsvError(''); }}>
            Import CSV
          </button>
          <Link to="/admin/crm/leads/new" className="admin-btn-primary">+ New Lead</Link>
        </div>
      </div>

      {/* Pipeline filter */}
      <div className="crm-pipeline-tabs">
        {STATUSES.map(s => (
          <button
            key={s}
            className={`crm-tab-btn${filter === s ? ' active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All Leads' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="admin-editor-panel">
        {loading ? (
          <div className="admin-spinner" />
        ) : leads.length === 0 ? (
          <div className="crm-empty-state">
            <svg className="crm-empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
            </svg>
            <p className="crm-empty-state__text">
              No leads found. <Link to="/admin/crm/leads/new">Add your first lead</Link>
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th><th>Company</th><th>Email</th><th>Source</th><th>Status</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td className="admin-table-title">{lead.name}</td>
                    <td>{lead.company || '—'}</td>
                    <td style={{ fontSize: 12 }}>{lead.email}</td>
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
                      <div className="admin-table-actions">
                        <Link to={`/admin/crm/leads/${lead.id}`} className="admin-action-btn">Edit</Link>
                        <button className="admin-action-btn admin-action-btn--danger" onClick={() => handleDelete(lead.id)}>Delete</button>
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
        <div className="admin-modal-overlay" onClick={() => setCsvModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__title">Import Leads from CSV</div>
            <div className="admin-modal__body">
              CSV must include columns: <strong>name</strong>, <strong>email</strong>
              <br />Optional: phone, company, message
            </div>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCsvFile} className="admin-input" style={{ marginBottom: 12 }} />
            {csvError && <div className="admin-error">{csvError}</div>}
            {csvRows.length > 0 && (
              <p style={{ color: 'var(--green)', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
                ✓ {csvRows.length} leads ready to import
              </p>
            )}
            <div className="admin-modal__actions">
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
