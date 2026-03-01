import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(url, key, {
  global: {
    fetch: (input, init) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000); // 30s timeout (handles Supabase cold starts)
      return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
    },
  },
});
