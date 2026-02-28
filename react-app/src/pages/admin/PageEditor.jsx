import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePages } from '../../hooks/usePages';
import { supabase } from '../../lib/supabase';
import HeroSection from '../../components/sections/dynamic/HeroSection';
import FeaturesGridSection from '../../components/sections/dynamic/FeaturesGridSection';
import ServicesGridSection from '../../components/sections/dynamic/ServicesGridSection';
import ProcessStepsSection from '../../components/sections/dynamic/ProcessStepsSection';
import AboutStripSection from '../../components/sections/dynamic/AboutStripSection';
import CtaBannerSection from '../../components/sections/dynamic/CtaBannerSection';
import TextContentSection from '../../components/sections/dynamic/TextContentSection';
import '../../styles/DynamicPage.css';

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero', desc: 'Full-width hero with headline, CTAs, and stats' },
  { type: 'features_grid', label: 'Features Grid', desc: '2-3 column feature/capability cards' },
  { type: 'services_grid', label: 'Services Grid', desc: '3-column service cards with feature lists' },
  { type: 'process_steps', label: 'Process Steps', desc: 'Numbered steps grid on dark background' },
  { type: 'about_strip', label: 'About Strip', desc: 'About section with body text and stats' },
  { type: 'cta_banner', label: 'CTA Banner', desc: 'Dark call-to-action with button and email' },
  { type: 'text_content', label: 'Text Content', desc: 'Tag, title, and markdown body text' },
];

function SectionTypeModal({ onSelect, onClose }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <h3 className="admin-modal__title">Add Section</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
          {SECTION_TYPES.map(st => (
            <button
              key={st.type}
              onClick={() => onSelect(st.type)}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(146,209,8,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: 13, marginBottom: 4 }}>{st.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>{st.desc}</div>
            </button>
          ))}
        </div>
        <div className="admin-modal__actions">
          <button className="admin-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function defaultContent(sectionType) {
  const defaults = {
    hero: { tag: '', headline: 'YOUR HEADLINE HERE', subheadline: '', cta_primary: { text: 'Get Started', link: '#contact' }, cta_secondary: { text: 'Learn More', link: '#services' }, stats: [{ number: '—', label: 'Stat Label' }] },
    features_grid: { tag: 'What We Do', title: 'Our Features', body: '', items: [{ number: '01', tag: 'Feature', title: 'Feature Title', description: 'Feature description.', features: [], link: '' }] },
    services_grid: { tag: 'Services', title: 'What We Offer', body: '', services: [{ number: '01', title: 'Service Name', description: 'Service description.', features: [] }] },
    process_steps: { tag: 'Our Process', title: 'How It Works', body: '', steps: [{ number: '01', title: 'Step One', description: 'Description of this step.' }] },
    about_strip: { tag: 'About', title: 'About Us', body: 'Tell your story here.', stats: [{ number: '—', label: 'Stat' }] },
    cta_banner: { headline: 'Ready to get started?', body: 'Contact us today.', cta_text: 'Get in Touch', cta_link: '#contact', email: '' },
    text_content: { tag: 'Overview', title: 'Section Title', body: 'Your content here.' },
  };
  return defaults[sectionType] || {};
}

// ── Section Form Fields ───────────────────────────────────────

function ArrayField({ label, value = [], onChange, itemSchema, addLabel = '+ Add Item' }) {
  const handleChange = (idx, field, val) => {
    const next = value.map((item, i) => i === idx ? { ...item, [field]: val } : item);
    onChange(next);
  };
  const handleAdd = () => onChange([...value, { ...itemSchema }]);
  const handleRemove = (idx) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div className="admin-form-group">
      <label className="ai-panel__label">{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {value.map((item, idx) => (
          <div key={idx} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '12px 14px', position: 'relative' }}>
            <button
              onClick={() => handleRemove(idx)}
              style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >×</button>
            {Object.keys(itemSchema).map(field => {
              if (Array.isArray(itemSchema[field])) {
                return (
                  <div key={field} className="admin-form-group" style={{ marginBottom: 8 }}>
                    <label className="ai-panel__label" style={{ fontSize: 11 }}>{field}</label>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      value={(item[field] || []).join('\n')}
                      onChange={e => handleChange(idx, field, e.target.value.split('\n').filter(Boolean))}
                      placeholder="One item per line"
                      style={{ fontSize: 12 }}
                    />
                  </div>
                );
              }
              if (typeof itemSchema[field] === 'object') {
                return null; // nested objects handled separately
              }
              return (
                <div key={field} className="admin-form-group" style={{ marginBottom: 8 }}>
                  <label className="ai-panel__label" style={{ fontSize: 11 }}>{field}</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={item[field] || ''}
                    onChange={e => handleChange(idx, field, e.target.value)}
                    style={{ fontSize: 12 }}
                  />
                </div>
              );
            })}
          </div>
        ))}
        <button
          onClick={handleAdd}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 16px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function SectionForm({ sectionType, content, onChange }) {
  const set = (key, val) => onChange({ ...content, [key]: val });
  const setNested = (key, field, val) => onChange({ ...content, [key]: { ...(content[key] || {}), [field]: val } });

  const input = (key, label, placeholder = '') => (
    <div className="admin-form-group">
      <label className="ai-panel__label">{label}</label>
      <input type="text" className="admin-input" value={content[key] || ''} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
    </div>
  );
  const textarea = (key, label, rows = 3) => (
    <div className="admin-form-group">
      <label className="ai-panel__label">{label}</label>
      <textarea className="admin-textarea" rows={rows} value={content[key] || ''} onChange={e => set(key, e.target.value)} />
    </div>
  );

  if (sectionType === 'hero') return (
    <>
      {input('tag', 'Tag (above headline)', 'Automation · Engineering · Growth')}
      {input('headline', 'Headline *', 'YOUR HEADLINE')}
      {textarea('subheadline', 'Subheadline', 2)}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="ai-panel__label">CTA Primary Text</label>
          <input type="text" className="admin-input" value={content.cta_primary?.text || ''} onChange={e => setNested('cta_primary', 'text', e.target.value)} />
        </div>
        <div>
          <label className="ai-panel__label">CTA Primary Link</label>
          <input type="text" className="admin-input" value={content.cta_primary?.link || ''} onChange={e => setNested('cta_primary', 'link', e.target.value)} />
        </div>
        <div>
          <label className="ai-panel__label">CTA Secondary Text</label>
          <input type="text" className="admin-input" value={content.cta_secondary?.text || ''} onChange={e => setNested('cta_secondary', 'text', e.target.value)} />
        </div>
        <div>
          <label className="ai-panel__label">CTA Secondary Link</label>
          <input type="text" className="admin-input" value={content.cta_secondary?.link || ''} onChange={e => setNested('cta_secondary', 'link', e.target.value)} />
        </div>
      </div>
      <ArrayField label="Stats" value={content.stats || []} onChange={v => set('stats', v)} itemSchema={{ number: '', label: '' }} addLabel="+ Add Stat" />
    </>
  );

  if (sectionType === 'features_grid') return (
    <>
      {input('tag', 'Tag')}
      {input('title', 'Section Title')}
      {textarea('body', 'Section Body', 2)}
      <ArrayField
        label="Feature Cards"
        value={content.items || []}
        onChange={v => set('items', v)}
        itemSchema={{ number: '', tag: '', title: '', description: '', features: [], link: '' }}
        addLabel="+ Add Feature Card"
      />
    </>
  );

  if (sectionType === 'services_grid') return (
    <>
      {input('tag', 'Tag')}
      {input('title', 'Section Title')}
      {textarea('body', 'Section Body', 2)}
      <ArrayField
        label="Services"
        value={content.services || []}
        onChange={v => set('services', v)}
        itemSchema={{ number: '', title: '', description: '', features: [] }}
        addLabel="+ Add Service"
      />
    </>
  );

  if (sectionType === 'process_steps') return (
    <>
      {input('tag', 'Tag')}
      {input('title', 'Section Title')}
      {textarea('body', 'Section Body', 2)}
      <ArrayField
        label="Steps"
        value={content.steps || []}
        onChange={v => set('steps', v)}
        itemSchema={{ number: '', title: '', description: '' }}
        addLabel="+ Add Step"
      />
    </>
  );

  if (sectionType === 'about_strip') return (
    <>
      {input('tag', 'Tag')}
      {input('title', 'Heading')}
      {textarea('body', 'Body Text (use blank line for new paragraph)', 4)}
      <ArrayField
        label="Stats"
        value={content.stats || []}
        onChange={v => set('stats', v)}
        itemSchema={{ number: '', label: '' }}
        addLabel="+ Add Stat"
      />
    </>
  );

  if (sectionType === 'cta_banner') return (
    <>
      {input('headline', 'Headline')}
      {textarea('body', 'Body Text', 2)}
      {input('cta_text', 'Button Text')}
      {input('cta_link', 'Button Link', '#contact')}
      {input('email', 'Email Address', 'hello@yourdomain.com')}
    </>
  );

  if (sectionType === 'text_content') return (
    <>
      {input('tag', 'Tag (optional)')}
      {input('title', 'Title')}
      {textarea('body', 'Body (Markdown supported)', 6)}
    </>
  );

  return <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No form for section type: {sectionType}</p>;
}

const SECTION_RENDERERS = {
  hero: HeroSection,
  features_grid: FeaturesGridSection,
  services_grid: ServicesGridSection,
  process_steps: ProcessStepsSection,
  about_strip: AboutStripSection,
  cta_banner: CtaBannerSection,
  text_content: TextContentSection,
};

// ── Main Component ────────────────────────────────────────────

export default function PageEditor() {
  const { id } = useParams();
  const { page, sections, loading, error, updatePage, addSection, updateSection, deleteSection, reorderSections, fetchPageById } = usePages();

  const [activeTab, setActiveTab] = useState('content');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState({});
  const [sectionSaving, setSectionSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [regenerating, setRegenerating] = useState(null);

  // SEO form
  const [seoForm, setSeoForm] = useState({ meta_title: '', meta_description: '', og_image_url: '', status: 'draft' });
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoStatus, setSeoStatus] = useState('');

  // Publish / unpublish
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState('');

  const handlePublish = async () => {
    setPublishing(true);
    setPublishStatus('');
    try {
      await updatePage(id, { status: 'published' });
      setSeoForm(prev => ({ ...prev, status: 'published' }));
      setPublishStatus('published');
      setTimeout(() => setPublishStatus(''), 3000);
    } catch (err) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    setPublishing(true);
    try {
      await updatePage(id, { status: 'draft' });
      setSeoForm(prev => ({ ...prev, status: 'draft' }));
    } catch (err) {
      alert('Failed to unpublish: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  // ── Full page regeneration ────────────────────────────────
  const [showFullRegen, setShowFullRegen] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState('');
  const [regenTone, setRegenTone] = useState('professional');
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenPreview, setRegenPreview] = useState(null); // { sections: [] }
  const [regenError, setRegenError] = useState('');
  const [servicePages, setServicePages] = useState([]);
  const [applyingRegen, setApplyingRegen] = useState(false);

  // Fetch service pages for context when regen panel opens
  useEffect(() => {
    if (!showFullRegen) return;
    supabase
      .from('site_pages')
      .select('id, title, slug, meta_description')
      .eq('status', 'published')
      .neq('slug', page?.slug || '')
      .then(({ data }) => setServicePages(data || []));
  }, [showFullRegen, page?.slug]);

  const handleFullRegenerate = async () => {
    setRegenLoading(true);
    setRegenError('');
    setRegenPreview(null);
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'page_regen',
          page_title: page.title,
          page_type: page.page_type || 'service',
          current_sections: sections.map(s => s.section_type),
          available_services: servicePages,
          extra_instructions: regenInstructions,
          tone: regenTone,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRegenPreview(data);
    } catch (err) {
      setRegenError(err.message || 'Generation failed. Try again.');
    } finally {
      setRegenLoading(false);
    }
  };

  const handleApplyRegen = async () => {
    if (!regenPreview?.sections?.length) return;
    setApplyingRegen(true);
    try {
      // Delete all existing sections
      for (const s of sections) {
        await deleteSection(s.id);
      }
      // Add new sections from AI
      for (let i = 0; i < regenPreview.sections.length; i++) {
        const sec = regenPreview.sections[i];
        await addSection(id, sec.section_type, sec.content, i);
      }
      setShowFullRegen(false);
      setRegenPreview(null);
      setRegenInstructions('');
    } catch (err) {
      alert('Failed to apply: ' + err.message);
    } finally {
      setApplyingRegen(false);
    }
  };

  useEffect(() => {
    if (id) fetchPageById(id);
  }, [id, fetchPageById]);

  useEffect(() => {
    if (page) {
      setSeoForm({
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        og_image_url: page.og_image_url || '',
        status: page.status || 'draft',
      });
    }
  }, [page]);

  const startEdit = (section) => {
    setEditingId(section.id);
    setEditContent(section.content);
  };

  const handleSaveSection = async () => {
    setSectionSaving(true);
    try {
      await updateSection(editingId, editContent);
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSectionSaving(false);
    }
  };

  const handleAddSection = async (sectionType) => {
    setShowAddModal(false);
    try {
      const nextOrder = sections.length;
      await addSection(id, sectionType, defaultContent(sectionType), nextOrder);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSection(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveUp = async (idx) => {
    if (idx === 0) return;
    const ids = sections.map(s => s.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    await reorderSections(id, ids);
  };

  const handleMoveDown = async (idx) => {
    if (idx === sections.length - 1) return;
    const ids = sections.map(s => s.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    await reorderSections(id, ids);
  };

  const handleRegenerateSection = async (section) => {
    setRegenerating(section.id);
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'section_content',
          section_type: section.section_type,
          business_description: page?.title || 'a professional business',
          context: JSON.stringify(section.content).substring(0, 300),
          tone: 'professional',
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const newContent = await res.json();
      await updateSection(section.id, newContent);
    } catch (err) {
      alert('Regeneration failed: ' + err.message);
    } finally {
      setRegenerating(null);
    }
  };

  const handleSaveSEO = async () => {
    setSeoSaving(true);
    setSeoStatus('');
    try {
      await updatePage(id, seoForm);
      setSeoStatus('Saved ✓');
      setTimeout(() => setSeoStatus(''), 3000);
    } catch (err) {
      setSeoStatus('Error: ' + err.message);
    } finally {
      setSeoSaving(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!page) return;
    setSeoSaving(true);
    const firstSection = sections[0];
    const context = firstSection ? JSON.stringify(firstSection.content).substring(0, 300) : page.title;
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seo', title: page.title, content: context, excerpt: '' }),
      });
      const data = await res.json();
      setSeoForm(prev => ({ ...prev, meta_title: data.meta_title || prev.meta_title, meta_description: data.meta_description || prev.meta_description }));
    } catch (err) {
      alert('SEO generation failed: ' + err.message);
    } finally {
      setSeoSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#92D108', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (error || !page) return (
    <div className="admin-content">
      <p style={{ color: '#f87171', fontSize: 14 }}>{error || 'Page not found'}</p>
      <Link to="/admin/pages" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>← Back to Pages</Link>
    </div>
  );

  const SECTION_TYPE_LABELS = Object.fromEntries(SECTION_TYPES.map(s => [s.type, s.label]));

  return (
    <>
      <div className="admin-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/pages" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 13 }}>← Pages</Link>
          <span className="admin-topbar__title">Edit: {page.title}</span>
          {/* Status badge */}
          <span style={{
            fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '3px 10px',
            background: page.status === 'published' ? 'rgba(146,209,8,0.12)' : 'rgba(255,255,255,0.07)',
            color: page.status === 'published' ? '#92D108' : 'rgba(255,255,255,0.35)',
            border: `1px solid ${page.status === 'published' ? 'rgba(146,209,8,0.25)' : 'rgba(255,255,255,0.1)'}`,
          }}>
            {page.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {publishStatus === 'published' && (
            <span style={{ fontSize: 12, color: '#92D108' }}>Page published ✓</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {page.status === 'published' ? (
            <>
              <a
                href={`/${page.slug === 'home' ? '' : page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-secondary"
                style={{ padding: '7px 14px', textDecoration: 'none', fontSize: 13 }}
              >
                View Live ↗
              </a>
              <button
                onClick={handleUnpublish}
                className="admin-btn-secondary"
                style={{ padding: '7px 14px' }}
                disabled={publishing}
              >
                Unpublish
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('preview')}
                className="admin-btn-secondary"
                style={{ padding: '7px 14px' }}
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                className="admin-btn-primary"
                style={{ width: 'auto', padding: '7px 18px' }}
                disabled={publishing}
              >
                {publishing ? 'Publishing…' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="admin-content">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { key: 'content', label: 'Content' },
            { key: 'preview', label: 'Preview' },
            { key: 'seo', label: 'SEO & Status' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? '#92D108' : 'transparent'}`,
                color: activeTab === tab.key ? '#92D108' : 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            {/* Full page regen trigger */}
            {!showFullRegen ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  onClick={() => setShowFullRegen(true)}
                  style={{
                    background: 'rgba(146,209,8,0.08)', border: '1px solid rgba(146,209,8,0.2)',
                    borderRadius: 8, padding: '8px 16px', color: '#92D108', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  ✦ Regenerate Full Page with AI
                </button>
              </div>
            ) : (
              /* Full regen panel */
              <div style={{ background: '#1a1a1a', border: '1px solid rgba(146,209,8,0.2)', borderRadius: 12, padding: '20px 20px 24px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#92D108', margin: '0 0 4px' }}>✦ Regenerate Full Page with AI</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                      AI will rewrite all sections, using your other pages as context for optimal linking and messaging.
                    </p>
                  </div>
                  <button onClick={() => { setShowFullRegen(false); setRegenPreview(null); setRegenError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>

                {/* Context pages */}
                {servicePages.length > 0 && (
                  <div className="admin-form-group">
                    <label className="ai-panel__label">Pages used as AI context</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {servicePages.map(p => (
                        <span key={p.id} style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 99, padding: '3px 10px', color: 'rgba(255,255,255,0.5)' }}>
                          /{p.slug} — {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="ai-panel__label">Additional instructions (optional)</label>
                    <textarea
                      className="admin-textarea"
                      rows={2}
                      placeholder={`e.g. "Emphasize our retail automation services" or "Use more industry statistics"`}
                      value={regenInstructions}
                      onChange={e => setRegenInstructions(e.target.value)}
                      style={{ fontSize: 13 }}
                    />
                  </div>
                  <div className="admin-form-group" style={{ margin: 0 }}>
                    <label className="ai-panel__label">Tone</label>
                    <select className="admin-select" value={regenTone} onChange={e => setRegenTone(e.target.value)}>
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="bold">Bold</option>
                      <option value="luxury">Luxury</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>
                </div>

                {regenError && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginTop: 12 }}>
                    {regenError}
                  </div>
                )}

                {/* Generated preview */}
                {regenPreview && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Generated — {regenPreview.sections.length} sections
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                      {regenPreview.sections.map((s, i) => (
                        <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', minWidth: 110 }}>{s.section_type}</span>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.content?.headline || s.content?.title || s.content?.tag || '—'}
                          </span>
                          <span style={{ fontSize: 11, color: '#92D108', fontWeight: 700, flexShrink: 0 }}>✓ Ready</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={handleApplyRegen}
                        className="admin-btn-primary"
                        style={{ width: 'auto' }}
                        disabled={applyingRegen}
                      >
                        {applyingRegen ? 'Applying…' : 'Apply — Replace All Sections'}
                      </button>
                      <button
                        onClick={() => { setRegenPreview(null); setRegenError(''); }}
                        className="admin-btn-secondary"
                        disabled={applyingRegen}
                      >
                        Regenerate Again
                      </button>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>This will replace all current sections</span>
                    </div>
                  </div>
                )}

                {!regenPreview && (
                  <div style={{ marginTop: 14 }}>
                    <button
                      onClick={handleFullRegenerate}
                      className="admin-btn-primary ai-generate-btn"
                      style={{ width: 'auto' }}
                      disabled={regenLoading}
                    >
                      {regenLoading ? (
                        <><div className="ai-spinner" /> Generating page content…</>
                      ) : '✦ Generate Now'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sections list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {sections.map((section, idx) => (
                <div key={section.id} style={{ background: '#1a1a1a', border: `1px solid ${editingId === section.id ? 'rgba(146,209,8,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* Section header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 100 }}>
                      {SECTION_TYPE_LABELS[section.section_type] || section.section_type}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {section.content?.headline || section.content?.title || section.content?.tag || '—'}
                    </span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="admin-action-btn" style={{ padding: '4px 8px' }}>↑</button>
                      <button onClick={() => handleMoveDown(idx)} disabled={idx === sections.length - 1} className="admin-action-btn" style={{ padding: '4px 8px' }}>↓</button>
                      <button
                        onClick={() => handleRegenerateSection(section)}
                        disabled={regenerating === section.id}
                        className="admin-action-btn"
                      >
                        {regenerating === section.id ? '…' : '✦ AI'}
                      </button>
                      <button
                        onClick={() => editingId === section.id ? setEditingId(null) : startEdit(section)}
                        className="admin-action-btn"
                      >
                        {editingId === section.id ? 'Close' : 'Edit'}
                      </button>
                      <button className="admin-action-btn admin-action-btn--danger" onClick={() => setDeleteTarget(section)}>Delete</button>
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {editingId === section.id && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 16px 20px' }}>
                      <SectionForm
                        sectionType={section.section_type}
                        content={editContent}
                        onChange={setEditContent}
                      />
                      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button onClick={handleSaveSection} className="admin-btn-primary" style={{ width: 'auto' }} disabled={sectionSaving}>
                          {sectionSaving ? 'Saving…' : 'Save Section'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="admin-btn-secondary">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 24px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', width: '100%', fontSize: 13, fontWeight: 600, transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(146,209,8,0.3)'; e.currentTarget.style.color = '#92D108'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              + Add Section
            </button>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div>
            {/* Publish / view bar */}
            {page.status === 'draft' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(146,209,8,0.07)', border: '1px solid rgba(146,209,8,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                  Looking good? Publish the page to make it live.
                </p>
                <button
                  onClick={handlePublish}
                  className="admin-btn-primary"
                  style={{ width: 'auto', padding: '8px 20px', flexShrink: 0 }}
                  disabled={publishing}
                >
                  {publishing ? 'Publishing…' : 'Publish Page'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  This page is live. Changes you save are immediately reflected.
                </p>
                <a
                  href={`/${page.slug === 'home' ? '' : page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-action-btn"
                  style={{ flexShrink: 0 }}
                >
                  Open Live Page ↗
                </a>
              </div>
            )}

            {/* Preview frame */}
            <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {sections.length === 0 ? (
                <div style={{ padding: '60px 32px', textAlign: 'center', color: '#52525b', fontSize: 14 }}>
                  No sections yet. Add sections in the Content tab.
                </div>
              ) : (
                sections.map(section => {
                  const content = editingId === section.id ? editContent : section.content;
                  const Renderer = SECTION_RENDERERS[section.section_type];
                  return Renderer ? (
                    <Renderer key={section.id} content={content} />
                  ) : (
                    <div key={section.id} style={{ padding: '20px 24px', background: '#f4f4f5', fontSize: 13, color: '#52525b' }}>
                      Unknown section type: {section.section_type}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div style={{ maxWidth: 600 }}>
            <div className="admin-editor-panel">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p className="admin-editor-panel__title" style={{ margin: 0 }}>SEO & Meta</p>
                <button onClick={handleGenerateSEO} className="admin-action-btn" disabled={seoSaving}>✦ Generate SEO</button>
              </div>

              <div className="admin-form-group">
                <label className="ai-panel__label">Meta Title (max 60 chars)</label>
                <input type="text" className="admin-input" value={seoForm.meta_title} onChange={e => setSeoForm(prev => ({ ...prev, meta_title: e.target.value }))} />
                <span style={{ fontSize: 11, color: seoForm.meta_title.length > 60 ? '#f87171' : 'rgba(255,255,255,0.25)', marginTop: 4, display: 'block' }}>{seoForm.meta_title.length}/60</span>
              </div>

              <div className="admin-form-group">
                <label className="ai-panel__label">Meta Description (max 160 chars)</label>
                <textarea className="admin-textarea" rows={3} value={seoForm.meta_description} onChange={e => setSeoForm(prev => ({ ...prev, meta_description: e.target.value }))} />
                <span style={{ fontSize: 11, color: seoForm.meta_description.length > 160 ? '#f87171' : 'rgba(255,255,255,0.25)', marginTop: 4, display: 'block' }}>{seoForm.meta_description.length}/160</span>
              </div>

              <div className="admin-form-group">
                <label className="ai-panel__label">OG Image URL</label>
                <input type="url" className="admin-input" placeholder="https://…" value={seoForm.og_image_url} onChange={e => setSeoForm(prev => ({ ...prev, og_image_url: e.target.value }))} />
              </div>

              <div className="admin-form-group">
                <label className="ai-panel__label">Page Status</label>
                <select className="admin-select" value={seoForm.status} onChange={e => setSeoForm(prev => ({ ...prev, status: e.target.value }))}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <button onClick={handleSaveSEO} className="admin-btn-primary" style={{ width: 'auto' }} disabled={seoSaving}>
                  {seoSaving ? 'Saving…' : 'Save Page'}
                </button>
                {seoStatus && <span style={{ fontSize: 13, color: seoStatus.startsWith('Error') ? '#f87171' : '#92D108' }}>{seoStatus}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && <SectionTypeModal onSelect={handleAddSection} onClose={() => setShowAddModal(false)} />}

      {/* Delete Section Modal */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal__title">Delete Section?</h3>
            <p className="admin-modal__body">This will permanently remove the "{SECTION_TYPE_LABELS[deleteTarget.section_type]}" section.</p>
            <div className="admin-modal__actions">
              <button className="admin-btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="admin-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
