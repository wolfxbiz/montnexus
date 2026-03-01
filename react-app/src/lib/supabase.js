import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(url, key, {
  global: {
    fetch: (input, init) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000); // 8s timeout
      return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
    },
  },
});
