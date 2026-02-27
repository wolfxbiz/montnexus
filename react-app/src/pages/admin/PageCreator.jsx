import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePages } from '../../hooks/usePages';

const SECTION_LABELS = {
  hero: 'Hero',
  features_grid: 'Features Grid',
  services_grid: 'Services Grid',
  process_steps: 'Process Steps',
  about_strip: 'About Strip',
  cta_banner: 'CTA Banner',
  text_content: 'Text Content',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function PageCreator() {
  const navigate = useNavigate();
  const { createPage, addSection } = usePages();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: '',
    businessDescription: '',
    tone: 'professional',
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [genError, setGenError] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleGenerate = async () => {
    if (!form.businessName.trim() || !form.businessDescription.trim()) {
      setGenError('Please fill in business name and description.');
      return;
    }
    setGenerating(true);
    setGenError('');
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'page_content',
          business_name: form.businessName,
          business_description: form.businessDescription,
          tone: form.tone,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setGenerated(data);
      setPageTitle(data.site_name || form.businessName);
      setPageSlug(slugify(data.site_name || form.businessName));
      setStep(2);
    } catch (err) {
      setGenError(err.message || 'Generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (status) => {
    if (!pageTitle.trim() || !pageSlug.trim()) {
      setSaveError('Page title and slug are required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const newPage = await createPage({
        title: pageTitle,
        slug: pageSlug,
        status,
        meta_title: generated?.meta_title || pageTitle,
        meta_description: generated?.meta_description || '',
      });
      for (let i = 0; i < (generated?.sections || []).length; i++) {
        const sec = generated.sections[i];
        await addSection(newPage.id, sec.section_type, sec.content, i);
      }
      navigate(`/admin/pages/${newPage.id}/edit`);
    } catch (err) {
      setSaveError(err.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/pages" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13 }}>
            ← Pages
          </Link>
          <span className="admin-topbar__title">New Page</span>
        </div>
        {step === 2 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(1)} className="admin-btn-secondary" style={{ padding: '7px 14px' }}>
              ← Regenerate
            </button>
          </div>
        )}
      </div>

      <div className="admin-content">

        {step === 1 && (
          <div style={{ maxWidth: 600 }}>
            <div className="admin-editor-panel">
              <p className="admin-editor-panel__title">Describe Your Business</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                AI will generate a complete website based on your description. The more detail you provide, the better the content.
              </p>

              <div className="admin-form-group">
                <label className="ai-panel__label">Business Name *</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="e.g. Bloom Florals, Vista Real Estate, QuickBite Cafe"
                  value={form.businessName}
                  onChange={e => setField('businessName', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="ai-panel__label">Business Description *</label>
                <textarea
                  className="admin-textarea"
                  placeholder="Describe what your business does, who your customers are, what services/products you offer, and what makes you unique. The more detail, the better."
                  value={form.businessDescription}
                  onChange={e => setField('businessDescription', e.target.value)}
                  rows={5}
                />
              </div>

              <div className="admin-form-group">
                <label className="ai-panel__label">Tone</label>
                <select
                  className="admin-select"
                  value={form.tone}
                  onChange={e => setField('tone', e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly & Approachable</option>
                  <option value="bold">Bold & Confident</option>
                  <option value="luxury">Luxury & Premium</option>
                  <option value="minimal">Clean & Minimal</option>
                </select>
              </div>

              {genError && (
                <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                  {genError}
                </div>
              )}

              <button
                className="admin-btn-primary ai-generate-btn"
                onClick={handleGenerate}
                disabled={generating}
                style={{ marginTop: 8 }}
              >
                {generating ? (
                  <>
                    <div className="ai-spinner" />
                    Generating website content…
                  </>
                ) : '✦ Generate Full Website with AI'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && generated && (
          <div style={{ maxWidth: 800 }}>
            {/* Page identity */}
            <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
              <p className="admin-editor-panel__title">Page Details</p>
              <div className="admin-field-row">
                <div className="admin-form-group">
                  <label className="ai-panel__label">Page Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={pageTitle}
                    onChange={e => setPageTitle(e.target.value)}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="ai-panel__label">URL Slug</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={pageSlug}
                    onChange={e => setPageSlug(e.target.value)}
                    placeholder="e.g. flower-shop"
                  />
                </div>
              </div>
              {generated.meta_description && (
                <div className="admin-form-group">
                  <label className="ai-panel__label">Meta Description (AI generated)</label>
                  <textarea
                    className="admin-textarea"
                    defaultValue={generated.meta_description}
                    rows={2}
                    readOnly
                    style={{ opacity: 0.6 }}
                  />
                </div>
              )}
            </div>

            {/* Sections preview */}
            <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
              <p className="admin-editor-panel__title">Generated Sections ({generated.sections?.length || 0})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {(generated.sections || []).map((sec, i) => (
                  <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {i + 1}. {SECTION_LABELS[sec.section_type] || sec.section_type}
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(146,209,8,0.1)', color: '#92D108', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>✓ Generated</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                      {sec.content?.headline || sec.content?.title || sec.content?.tag || '—'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {saveError && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                {saveError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="admin-btn-secondary"
                onClick={() => handleSave('draft')}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                className="admin-btn-primary"
                style={{ width: 'auto' }}
                onClick={() => handleSave('published')}
                disabled={saving}
              >
                {saving ? 'Publishing…' : 'Publish Page'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
