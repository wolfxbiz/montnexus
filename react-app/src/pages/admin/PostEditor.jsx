import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePosts } from '../../hooks/usePosts';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import AIAssistant from '../../components/admin/AIAssistant';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  tags: '',
  status: 'draft',
  scheduled_at: '',
  meta_title: '',
  meta_description: '',
  og_image_url: '',
};

function toTagArray(tagsStr) {
  return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
}

export default function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { post, loading: postLoading, createPost, updatePost, slugify } = usePosts(isEdit ? { id } : {});

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');
  const [socialStatus, setSocialStatus] = useState(null);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && post) {
      setForm({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        cover_image_url: post.cover_image_url || '',
        tags: post.tags?.join(', ') || '',
        status: post.status || 'draft',
        scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 16) : '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        og_image_url: post.og_image_url || '',
      });
    }
  }, [post, isEdit]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // Auto-generate slug from title
  const handleTitleBlur = () => {
    if (!form.slug && form.title) {
      setField('slug', slugify(form.title));
    }
  };

  const handleSave = async (publishStatus) => {
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSaveStatus('Saving…');

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      tags: toTagArray(form.tags),
      status: publishStatus || form.status,
      scheduled_at: form.scheduled_at || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_image_url: form.og_image_url || null,
    };

    try {
      let savedPost;
      if (isEdit) {
        savedPost = await updatePost(id, payload);
        setSaveStatus('Saved ✓');
      } else {
        savedPost = await createPost(payload);
        setSaveStatus('Created ✓');
        navigate(`/admin/posts/${savedPost.id}/edit`, { replace: true });
      }

      // Auto-post to social media if publishing
      if (publishStatus === 'published') {
        setSaveStatus('Publishing to social media…');
        setSocialStatus(null);
        try {
          const socialRes = await fetch('/api/social-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'all', post: savedPost || payload }),
          });
          const socialData = await socialRes.json();
          setSocialStatus(socialData.results || {});
        } catch {
          setSocialStatus({ error: 'Social posting failed' });
        }
        setSaveStatus('Published ✓');
      }
    } catch (err) {
      setError(err.message || 'Save failed.');
      setSaveStatus('');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus(''), 4000);
    }
  };

  // Called by AIAssistant when a draft is generated
  const handleDraftGenerated = useCallback(({ content, title, excerpt }) => {
    setForm(prev => ({
      ...prev,
      content: content || prev.content,
      title: title && !prev.title ? title : prev.title,
      excerpt: excerpt && !prev.excerpt ? excerpt : prev.excerpt,
    }));
    setSaveStatus('AI draft applied ✓');
    setTimeout(() => setSaveStatus(''), 3000);
  }, []);

  // Called by AIAssistant when SEO is generated
  const handleSEOGenerated = useCallback(({ meta_title, meta_description, tags }) => {
    setForm(prev => ({
      ...prev,
      meta_title: meta_title || prev.meta_title,
      meta_description: meta_description || prev.meta_description,
      tags: tags?.join(', ') || prev.tags,
    }));
  }, []);

  if (isEdit && postLoading) {
    return (
      <>
        <div className="admin-topbar">
          <span className="admin-topbar__title">Loading Post…</span>
        </div>
        <div className="admin-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#92D108', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/admin/posts" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '13px' }}>
            ← Posts
          </Link>
          <span className="admin-topbar__title">
            {isEdit ? 'Edit Post' : 'New Post'}
          </span>
        </div>
      </div>

      <div className="admin-content">
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#f87171', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div className="admin-editor">
          {/* Main editing area */}
          <div className="admin-editor-main">

            {/* Title + Slug */}
            <div className="admin-editor-panel">
              <p className="admin-editor-panel__title">Post Details</p>
              <div className="admin-form-group">
                <label className="ai-panel__label">Title *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="Enter post title…"
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  onBlur={handleTitleBlur}
                  style={{ fontSize: '16px', padding: '12px 14px' }}
                />
              </div>
              <div className="admin-field-row">
                <div className="admin-form-group">
                  <label className="ai-panel__label">Slug</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="auto-generated-from-title"
                    value={form.slug}
                    onChange={e => setField('slug', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="ai-panel__label">Cover Image URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://…"
                    value={form.cover_image_url}
                    onChange={e => setField('cover_image_url', e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-form-group">
                <label className="ai-panel__label">Excerpt</label>
                <textarea
                  className="admin-textarea"
                  placeholder="Short description shown in blog listing…"
                  value={form.excerpt}
                  onChange={e => setField('excerpt', e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Markdown Editor */}
            <div className="admin-editor-panel">
              <p className="admin-editor-panel__title">Content (Markdown)</p>
              <MarkdownEditor
                value={form.content}
                onChange={val => setField('content', val || '')}
              />
            </div>

            {/* SEO */}
            <div className="admin-editor-panel">
              <p className="admin-editor-panel__title">SEO & Meta</p>
              <div className="admin-form-group">
                <label className="ai-panel__label">Meta Title</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="SEO title (max 60 chars)"
                  value={form.meta_title}
                  onChange={e => setField('meta_title', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="ai-panel__label">Meta Description</label>
                <textarea
                  className="admin-textarea"
                  placeholder="SEO description (max 160 chars)"
                  value={form.meta_description}
                  onChange={e => setField('meta_description', e.target.value)}
                  rows={2}
                />
              </div>
              <div className="admin-field-row">
                <div className="admin-form-group">
                  <label className="ai-panel__label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="AI, Retail, Automation"
                    value={form.tags}
                    onChange={e => setField('tags', e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="ai-panel__label">OG Image URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    placeholder="https://… (social share image)"
                    value={form.og_image_url}
                    onChange={e => setField('og_image_url', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Social post results */}
            {socialStatus && (
              <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 16px', fontSize: '12px', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px' }}>Social Media</div>
                {socialStatus.error ? (
                  <span style={{ color: '#f87171' }}>{socialStatus.error}</span>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(socialStatus).map(([platform, result]) => (
                      <span key={platform} style={{ padding: '4px 10px', borderRadius: '6px', fontWeight: 600, background: result?.ok ? 'rgba(146,209,8,0.1)' : 'rgba(220,38,38,0.1)', color: result?.ok ? '#92D108' : '#f87171', border: `1px solid ${result?.ok ? 'rgba(146,209,8,0.2)' : 'rgba(220,38,38,0.2)'}` }}>
                        {result?.ok ? '✓' : '✗'} {platform}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className="admin-editor-footer">
              {saveStatus && <span className="admin-save-status">{saveStatus}</span>}
              <button
                className="admin-btn-secondary"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                {saving && form.status === 'draft' ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                className="admin-btn-primary"
                style={{ width: 'auto' }}
                onClick={() => handleSave('published')}
                disabled={saving}
              >
                {saving ? 'Publishing…' : isEdit ? 'Save & Publish' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="admin-editor-sidebar">
            {/* Publish Settings */}
            <div className="admin-editor-panel">
              <p className="admin-editor-panel__title">Publish Settings</p>
              <div className="admin-form-group">
                <label className="ai-panel__label">Status</label>
                <select
                  className="admin-select"
                  value={form.status}
                  onChange={e => setField('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {form.status === 'scheduled' && (
                <div className="admin-form-group">
                  <label className="ai-panel__label">Publish Date & Time</label>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={form.scheduled_at}
                    onChange={e => setField('scheduled_at', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* AI Assistant */}
            <AIAssistant
              postTitle={form.title}
              postContent={form.content}
              postExcerpt={form.excerpt}
              onDraftGenerated={handleDraftGenerated}
              onSEOGenerated={handleSEOGenerated}
            />
          </div>
        </div>
      </div>
    </>
  );
}
