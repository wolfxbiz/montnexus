import { useState } from 'react';
import { generateContent } from '../../lib/api';

export default function AIAssistant({ onDraftGenerated, onSEOGenerated, postTitle, postContent, postExcerpt }) {
  const [activeTab, setActiveTab] = useState('draft');

  // Draft state
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');

  // SEO state
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState(null);
  const [seoError, setSeoError] = useState('');

  // Social state
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialResult, setSocialResult] = useState(null);
  const [socialError, setSocialError] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const handleGenerateDraft = async () => {
    if (!topic.trim()) return;
    setDraftLoading(true);
    setDraftError('');

    try {
      const kws = keywords.split(',').map(k => k.trim()).filter(Boolean);
      const result = await generateContent('draft', { topic, keywords: kws });
      onDraftGenerated(result);
    } catch (err) {
      setDraftError(err.message || 'Failed to generate draft.');
    } finally {
      setDraftLoading(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!postContent && !postTitle) {
      setSeoError('Write some content first before generating SEO.');
      return;
    }
    setSeoLoading(true);
    setSeoError('');
    setSeoResult(null);

    try {
      const result = await generateContent('seo', {
        title: postTitle,
        content: postContent,
        excerpt: postExcerpt,
      });
      setSeoResult(result);
      onSEOGenerated(result);
    } catch (err) {
      setSeoError(err.message || 'Failed to generate SEO data.');
    } finally {
      setSeoLoading(false);
    }
  };

  const handleGenerateSocial = async () => {
    if (!postContent && !postTitle) {
      setSocialError('Write some content first before generating social posts.');
      return;
    }
    setSocialLoading(true);
    setSocialError('');
    setSocialResult(null);

    try {
      const result = await generateContent('social', {
        title: postTitle,
        content: postContent,
        excerpt: postExcerpt,
      });
      setSocialResult(result);
    } catch (err) {
      setSocialError(err.message || 'Failed to generate social posts.');
    } finally {
      setSocialLoading(false);
    }
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <svg className="ai-panel__header-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
        </svg>
        <span className="ai-panel__header-title">AI Assistant</span>
      </div>

      <div className="ai-panel__tabs">
        {['draft', 'seo', 'social'].map(tab => (
          <button
            key={tab}
            className={`ai-tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'draft' && 'Draft'}
            {tab === 'seo' && 'SEO'}
            {tab === 'social' && 'Social'}
          </button>
        ))}
      </div>

      <div className="ai-panel__body">

        {/* DRAFT TAB */}
        {activeTab === 'draft' && (
          <>
            <div>
              <label className="ai-panel__label">Blog Topic</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. How AI is transforming retail checkout"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="ai-panel__label">Keywords (comma-separated)</label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. AI, retail, automation, POS"
                value={keywords}
                onChange={e => setKeywords(e.target.value)}
              />
            </div>
            {draftError && <div className="ai-error">{draftError}</div>}
            <button
              className="ai-generate-btn"
              onClick={handleGenerateDraft}
              disabled={draftLoading || !topic.trim()}
            >
              {draftLoading && <span className="ai-spinner" />}
              {draftLoading ? 'Generating…' : '⚡ Generate Draft'}
            </button>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.5' }}>
              AI will write a full blog post and populate the title and content fields.
            </p>
          </>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
              Analyzes your post and generates an optimized title, meta description, and tags.
            </p>
            {seoError && <div className="ai-error">{seoError}</div>}
            {seoResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="ai-panel__label">Meta Title</label>
                  <div className="ai-output">{seoResult.meta_title}</div>
                </div>
                <div>
                  <label className="ai-panel__label">Meta Description</label>
                  <div className="ai-output">{seoResult.meta_description}</div>
                </div>
                <div>
                  <label className="ai-panel__label">Tags</label>
                  <div className="ai-output">{seoResult.tags?.join(', ')}</div>
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(146,209,8,0.7)' }}>
                  ✓ Fields auto-filled in the SEO section below.
                </p>
              </div>
            )}
            <button
              className="ai-generate-btn"
              onClick={handleGenerateSEO}
              disabled={seoLoading}
            >
              {seoLoading && <span className="ai-spinner" />}
              {seoLoading ? 'Analyzing…' : '⚡ Optimize SEO'}
            </button>
          </>
        )}

        {/* SOCIAL TAB */}
        {activeTab === 'social' && (
          <>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
              Generates LinkedIn, Instagram, and Twitter posts from your blog content.
            </p>
            {socialError && <div className="ai-error">{socialError}</div>}
            {socialResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'linkedin', label: 'LinkedIn' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'twitter', label: 'Twitter / X' },
                ].map(({ key, label }) => socialResult[key] && (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <label className="ai-panel__label" style={{ margin: 0 }}>{label}</label>
                      <button
                        className={`ai-copy-btn${copiedKey === key ? ' copied' : ''}`}
                        onClick={() => copyToClipboard(socialResult[key], key)}
                      >
                        {copiedKey === key ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="ai-output">{socialResult[key]}</div>
                  </div>
                ))}
              </div>
            )}
            <button
              className="ai-generate-btn"
              onClick={handleGenerateSocial}
              disabled={socialLoading}
            >
              {socialLoading && <span className="ai-spinner" />}
              {socialLoading ? 'Generating…' : '⚡ Generate Posts'}
            </button>
          </>
        )}

      </div>
    </div>
  );
}
