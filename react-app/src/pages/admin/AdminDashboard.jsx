import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePosts } from '../../hooks/usePosts';

export default function AdminDashboard() {
  const { posts, loading, error, deletePost } = usePosts();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const total = posts.length;
  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePost(id);
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const statusLabel = (status) => {
    const classes = {
      published: 'admin-status-badge admin-status-badge--published',
      draft: 'admin-status-badge admin-status-badge--draft',
      scheduled: 'admin-status-badge admin-status-badge--scheduled',
    };
    return <span className={classes[status] || 'admin-status-badge'}>{status}</span>;
  };

  return (
    <>
      <div className="admin-topbar">
        <span className="admin-topbar__title">Blog Posts</span>
        <Link to="/admin/posts/new" className="admin-btn-primary" style={{ width: 'auto', display: 'inline-block', textDecoration: 'none' }}>
          + New Post
        </Link>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Total Posts</div>
            <div className="admin-stat-card__value">{total}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Published</div>
            <div className="admin-stat-card__value" style={{ color: '#92D108' }}>{published}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Drafts</div>
            <div className="admin-stat-card__value" style={{ color: 'rgba(255,255,255,0.5)' }}>{drafts}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-card__label">Scheduled</div>
            <div className="admin-stat-card__value" style={{ color: '#eab308' }}>{scheduled}</div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="admin-posts-header">
          <span className="admin-section-title">All Posts</span>
        </div>

        {loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            Loading…
          </div>
        )}

        {error && (
          <div style={{ padding: '20px', color: '#f87171', fontSize: '13px' }}>
            Error: {error}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="admin-table-wrap" style={{ padding: '48px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
            <p>No posts yet.</p>
            <Link to="/admin/posts/new" className="admin-btn-primary" style={{ width: 'auto', display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
              Create your first post
            </Link>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Tags</th>
                  <th>Views</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td className="admin-table-title">{post.title}</td>
                    <td>{statusLabel(post.status)}</td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                      {post.tags?.slice(0, 2).join(', ') || '—'}
                    </td>
                    <td style={{ color: 'rgba(255,255,255,0.4)' }}>{post.views || 0}</td>
                    <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {post.created_at ? format(new Date(post.created_at), 'MMM d, yyyy') : '—'}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <Link to={`/admin/posts/${post.id}/edit`} className="admin-action-btn">
                          Edit
                        </Link>
                        {post.status === 'published' && (
                          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="admin-action-btn">
                            View ↗
                          </a>
                        )}
                        <button
                          className="admin-action-btn admin-action-btn--danger"
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={deletingId === post.id}
                        >
                          {deletingId === post.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
