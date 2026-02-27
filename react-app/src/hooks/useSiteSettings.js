import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  'Barlow Condensed', 'Inter', 'Poppins', 'Roboto', 'Playfair Display',
  'Montserrat', 'Lato', 'DM Sans', 'Space Grotesk', 'Raleway',
];

const DEFAULTS = {
  primary_color: '#92D108',
  dark_bg: '#111111',
  light_bg: '#f4f4f5',
  text_on_dark: '#ffffff',
  text_on_light: '#202020',
  btn_radius: '6',
  font_display: 'Barlow Condensed',
  font_body: 'Noto Sans',
  site_name: 'Montnexus',
};

function buildFontUrl(display, body) {
  const fonts = [...new Set([display, body])].filter(f => GOOGLE_FONTS.includes(f) || f === 'Noto Sans');
  if (!fonts.length) return null;
  const params = fonts.map(f => `family=${f.replace(/ /g, '+')}:wght@400;600;700;800`).join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function applySettingsToDOM(settings) {
  const s = { ...DEFAULTS, ...settings };
  const root = document.documentElement;
  root.style.setProperty('--primary', s.primary_color);
  root.style.setProperty('--green', s.primary_color);
  root.style.setProperty('--green-dim', s.primary_color);
  root.style.setProperty('--bg-dark', s.dark_bg);
  root.style.setProperty('--bg-light', s.light_bg);
  root.style.setProperty('--text-on-dark', s.text_on_dark);
  root.style.setProperty('--text-on-light', s.text_on_light);
  root.style.setProperty('--btn-radius', s.btn_radius + 'px');
  root.style.setProperty('--font-display', `'${s.font_display}', sans-serif`);
  root.style.setProperty('--font-body', `'${s.font_body}', sans-serif`);

  // Inject/update Google Fonts link
  const fontUrl = buildFontUrl(s.font_display, s.font_body);
  if (fontUrl) {
    let link = document.getElementById('cms-google-fonts');
    if (!link) {
      link = document.createElement('link');
      link.id = 'cms-google-fonts';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = fontUrl;
  }
}

// ── Context ──────────────────────────────────────────────────

const SiteSettingsContext = createContext({ settings: DEFAULTS, updateSetting: () => {} });

export function SiteSettingsProvider({ children }) {
  const value = useSiteSettingsInternal();
  return React.createElement(SiteSettingsContext.Provider, { value }, children);
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

// Internal hook — only used by Provider
function useSiteSettingsInternal() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('site_settings').select('key, value');
    if (data && data.length > 0) {
      const obj = Object.fromEntries(data.map(r => [r.key, r.value]));
      const merged = { ...DEFAULTS, ...obj };
      setSettings(merged);
      applySettingsToDOM(merged);
    } else {
      applySettingsToDOM(DEFAULTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateSetting = useCallback(async (key, value) => {
    await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      applySettingsToDOM(next);
      return next;
    });
  }, []);

  const saveAllSettings = useCallback(async (newSettings) => {
    const rows = Object.entries(newSettings).map(([key, value]) => ({
      key, value, updated_at: new Date().toISOString(),
    }));
    await supabase.from('site_settings').upsert(rows);
    const merged = { ...DEFAULTS, ...newSettings };
    setSettings(merged);
    applySettingsToDOM(merged);
  }, []);

  return { settings, loading, updateSetting, saveAllSettings, GOOGLE_FONTS };
}

export { GOOGLE_FONTS, DEFAULTS };
