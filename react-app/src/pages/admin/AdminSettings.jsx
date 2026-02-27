import { useState, useEffect } from 'react';
import { useSiteSettings, GOOGLE_FONTS } from '../../hooks/useSiteSettings';

const BODY_FONTS = ['Noto Sans', ...GOOGLE_FONTS.filter(f => f !== 'Barlow Condensed')];

function ColorField({ label, settingKey, value, onChange }) {
  return (
    <div className="admin-form-group">
      <label className="ai-panel__label">{label}</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="color"
          value={value || '#000000'}
          onChange={e => onChange(settingKey, e.target.value)}
          style={{ width: 44, height: 36, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'transparent' }}
        />
        <input
          type="text"
          className="admin-input"
          value={value || ''}
          onChange={e => onChange(settingKey, e.target.value)}
          placeholder="#RRGGBB"
          style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
        />
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const { settings, saveAllSettings, loading } = useSiteSettings();
  const [local, setLocal] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    if (!loading) setLocal({ ...settings });
  }, [settings, loading]);

  const set = (key, val) => setLocal(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('');
    try {
      await saveAllSettings(local);
      setSaveStatus('Settings saved ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#92D108', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const previewColor = local.primary_color || '#92D108';
  const previewRadius = parseInt(local.btn_radius || '6');

  return (
    <>
      <div className="admin-topbar">
        <span className="admin-topbar__title">Design Settings</span>
      </div>

      <div className="admin-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Left — Settings forms */}
          <div>
            {/* Site Info */}
            <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
              <p className="admin-editor-panel__title">Site Info</p>
              <div className="admin-form-group">
                <label className="ai-panel__label">Site Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={local.site_name || ''}
                  onChange={e => set('site_name', e.target.value)}
                  placeholder="Montnexus"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
              <p className="admin-editor-panel__title">Colors</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
                These colors are applied to all CMS-managed pages. Save to see changes live.
              </p>
              <ColorField label="Primary Accent Color" settingKey="primary_color" value={local.primary_color} onChange={set} />
              <ColorField label="Dark Background" settingKey="dark_bg" value={local.dark_bg} onChange={set} />
              <ColorField label="Light Background" settingKey="light_bg" value={local.light_bg} onChange={set} />
              <ColorField label="Text on Dark Sections" settingKey="text_on_dark" value={local.text_on_dark} onChange={set} />
              <ColorField label="Text on Light Sections" settingKey="text_on_light" value={local.text_on_light} onChange={set} />
            </div>

            {/* Typography */}
            <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
              <p className="admin-editor-panel__title">Typography</p>
              <div className="admin-form-group">
                <label className="ai-panel__label">Heading Font (H1, H2, H3)</label>
                <select className="admin-select" value={local.font_display || 'Barlow Condensed'} onChange={e => set('font_display', e.target.value)}>
                  {GOOGLE_FONTS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="ai-panel__label">Body Font (paragraphs, labels)</label>
                <select className="admin-select" value={local.font_body || 'Noto Sans'} onChange={e => set('font_body', e.target.value)}>
                  {BODY_FONTS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="admin-editor-panel" style={{ marginBottom: 20 }}>
              <p className="admin-editor-panel__title">Buttons</p>
              <div className="admin-form-group">
                <label className="ai-panel__label">Border Radius: {local.btn_radius || 6}px</label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={parseInt(local.btn_radius || '6')}
                  onChange={e => set('btn_radius', e.target.value)}
                  style={{ width: '100%', accentColor: previewColor }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                  <span>0px (sharp)</span>
                  <span>24px (pill)</span>
                </div>
              </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={handleSave}
                className="admin-btn-primary"
                style={{ width: 'auto', padding: '11px 28px' }}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
              {saveStatus && (
                <span style={{ fontSize: 13, color: saveStatus.startsWith('Error') ? '#f87171' : '#92D108' }}>
                  {saveStatus}
                </span>
              )}
            </div>
          </div>

          {/* Right — Live Preview */}
          <div>
            <div className="admin-editor-panel" style={{ position: 'sticky', top: 20 }}>
              <p className="admin-editor-panel__title">Live Preview</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Updates as you change settings</p>

              {/* Dark section preview */}
              <div style={{ background: local.dark_bg || '#111', borderRadius: 10, padding: '20px 18px', marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: previewColor, marginBottom: 8 }}>Tag Label</div>
                <div style={{ fontFamily: `'${local.font_display || 'Barlow Condensed'}', sans-serif`, fontSize: 22, fontWeight: 800, color: local.text_on_dark || '#fff', textTransform: 'uppercase', marginBottom: 8 }}>
                  HERO HEADLINE
                </div>
                <div style={{ fontFamily: `'${local.font_body || 'Noto Sans'}', sans-serif`, fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16, lineHeight: 1.5 }}>
                  Your subheadline text appears here with the chosen body font.
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href="#" onClick={e => e.preventDefault()} style={{ background: previewColor, color: '#111', borderRadius: previewRadius, padding: '8px 16px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                    Primary CTA
                  </a>
                  <a href="#" onClick={e => e.preventDefault()} style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: previewRadius, padding: '7px 14px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    Secondary
                  </a>
                </div>
              </div>

              {/* Light section preview */}
              <div style={{ background: local.light_bg || '#f4f4f5', borderRadius: 10, padding: '20px 18px' }}>
                <div style={{ fontFamily: `'${local.font_display || 'Barlow Condensed'}', sans-serif`, fontSize: 18, fontWeight: 800, color: local.text_on_light || '#202020', textTransform: 'uppercase', marginBottom: 8 }}>
                  SECTION TITLE
                </div>
                <div style={{ fontFamily: `'${local.font_body || 'Noto Sans'}', sans-serif`, fontSize: 13, color: '#52525b', lineHeight: 1.6, marginBottom: 16 }}>
                  Body text appears here on the light background using the selected body font.
                </div>
                <div style={{ background: '#fff', border: `1px solid rgba(0,0,0,0.05)`, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: previewColor, letterSpacing: '0.08em', marginBottom: 6 }}>01</div>
                  <div style={{ fontFamily: `'${local.font_display || 'Barlow Condensed'}', sans-serif`, fontWeight: 700, color: local.text_on_light || '#202020', fontSize: 14, marginBottom: 6 }}>Feature Card Title</div>
                  <div style={{ fontSize: 12, color: '#52525b' }}>Feature description text</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
