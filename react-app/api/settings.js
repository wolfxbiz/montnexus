// Public proxy — fetches site_settings server-side.
// Prevents Indian ISP routing issues with direct browser→Supabase calls.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { data } = await supabase.from('site_settings').select('key, value');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json(data || []);
}
