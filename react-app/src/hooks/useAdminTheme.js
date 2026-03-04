import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'admin-theme';
const VALID = ['light', 'dark', 'system'];

function getResolved(pref) {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

export function useAdminTheme() {
  const [preference, setPreference] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID.includes(stored) ? stored : 'dark';
  });

  const resolved = getResolved(preference);

  // Apply attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', resolved);
  }, [resolved]);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      document.documentElement.setAttribute(
        'data-admin-theme',
        mq.matches ? 'dark' : 'light'
      );
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  const setTheme = useCallback((val) => {
    const v = VALID.includes(val) ? val : 'dark';
    localStorage.setItem(STORAGE_KEY, v);
    setPreference(v);
  }, []);

  return { preference, resolved, setTheme };
}
