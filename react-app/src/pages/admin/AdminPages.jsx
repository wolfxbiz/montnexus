import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePages } from '../../hooks/usePages';

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
          <Link to="/admin/pages/new" className="admin-btn-primary" style={{ width: 'auto', padding: '8px 16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
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
        ) : (
          <div className="admin-table-wrap">
            {pages.length === 0 ? (
              <div style={{ padding: '60px 32px', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, marginBottom: 20 }}>No pages yet. Create your first page with AI.</p>
                <Link to="/admin/pages/new" className="admin-btn-primary" style={{ width: 'auto', padding: '10px 20px', textDecoration: 'none', display: 'inline-flex' }}>
                  + Create First Page
                </Link>
              </div>
            ) : (
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
                  {pages.map(page => (
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
                          <Link
                            to={`/admin/pages/${page.id}/edit`}
                            className="admin-action-btn"
                          >
                            Edit
                          </Link>
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
                          <button
                            className="admin-action-btn admin-action-btn--danger"
                            onClick={() => setDeleteTarget(page)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
