import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Production: route all Supabase calls through Vercel serverless proxy.
// Browser sends to /api/supabase-proxy?target=/rest/v1/... (same domain, no ISP block).
// Development: connect directly (use VPN if on a restricted network).
const proxyFetch = import.meta.env.PROD
  ? (input, init) => {
      const url =
        typeof input === 'string' ? input
        : input instanceof URL ? input.toString()
        : input.url;
      if (url.startsWith(SUPABASE_URL)) {
        const targetPath = url.slice(SUPABASE_URL.length);
        return fetch(`/api/supabase-proxy?target=${encodeURIComponent(targetPath)}`, init);
      }
      return fetch(input, init);
    }
  : undefined;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  ...(proxyFetch ? { global: { fetch: proxyFetch } } : {}),
});
