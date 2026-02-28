import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePages } from '../../hooks/usePages';

// Slugs that are always treated as core pages (fallback if page_type column doesn't exist yet)
const CORE_SLUGS = ['home', 'about', 'contact', 'services'];

const CATEGORIES = [
  {
    key: 'core',
    label: 'Core Pages',
    desc: 'Main site pages — Home, About, Contact',
    color: 'rgba(146,209,8,0.15)',
    textColor: '#92D108',
  },
  {
    key: 'service',
    label: 'Service Pages',
    desc: 'Shown in the Services dropdown and /services listing',
    color: 'rgba(99,102,241,0.12)',
    textColor: '#818cf8',
  },
  {
    key: 'other',
    label: 'Other Pages',
    desc: 'Landing pages and custom content',
    color: 'rgba(255,255,255,0.05)',
    textColor: 'rgba(255,255,255,0.4)',
  },
];

function getCategory(page) {
  if (page.page_type === 'core' || CORE_SLUGS.includes(page.slug)) return 'core';
  if (page.page_type === 'other') return 'other';
  return 'service';
}

function PageRow({ page, onDelete }) {
  return (
    <tr key={page.id}>
      <td style={{ fontWeight: 600, color: '#e4e4e7' }}>{page.title}</td>
      <td style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 12 }}>/{page.slug}</td>
      <td>
        <span className={`admin-status-badge admin-status-badge--${page.status}`}>
          {page.status}
        </span>
      </td>
      <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
        {format(new Date(page.updated_at), 'MMM d, yyyy')}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to={`/admin/pages/${page.id}/edit`} className="admin-action-btn">Edit</Link>
          {page.status === 'published' && (
            <a
              href={`/${page.slug === 'home' ? '' : page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-action-btn"
            >
              View ↗
            </a>
          )}
          {/* Protect core pages from deletion */}
          {getCategory(page) !== 'core' && (
            <button
              className="admin-action-btn admin-action-btn--danger"
              onClick={() => onDelete(page)}
            >
              Delete
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminPages() {
  const { pages, loading, error, deletePage } = usePages();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePage(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <span className="admin-topbar__title">Pages</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            to="/admin/pages/new"
            className="admin-btn-primary"
            style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            + New Page
          </Link>
        </div>
      </div>

      <div className="admin-content">
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#92D108', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 20 }}>No pages yet. Create your first page with AI.</p>
            <Link to="/admin/pages/new" className="admin-btn-primary" style={{ width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex' }}>
              + Create First Page
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {CATEGORIES.map(cat => {
              const catPages = pages.filter(p => getCategory(p) === cat.key);
              if (catPages.length === 0) return null;
              return (
                <div key={cat.key}>
                  {/* Category header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: cat.textColor, background: cat.color, border: `1px solid ${cat.textColor}30`,
                      borderRadius: 99, padding: '3px 10px',
                    }}>
                      {cat.label}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{cat.desc}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
                      {catPages.length} page{catPages.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Pages table */}
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Slug</th>
                          <th>Status</th>
                          <th>Updated</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catPages.map(page => (
                          <PageRow key={page.id} page={page} onDelete={setDeleteTarget} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal__title">Delete Page?</h3>
            <p className="admin-modal__body">
              This will permanently delete <strong>"{deleteTarget.title}"</strong> and all its sections.
            </p>
            <div className="admin-modal__actions">
              <button className="admin-btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
