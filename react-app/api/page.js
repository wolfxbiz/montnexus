// Public proxy — fetches a CMS page + its sections server-side.
// Prevents Indian ISP routing issues with direct browser→Supabase calls.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  const { data: page, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !page) return res.status(404).json({ error: 'Page not found' });

  const { data: sections } = await supabase
    .from('page_sections')
    .select('*')
    .eq('page_id', page.id)
    .order('display_order', { ascending: true });

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ page, sections: sections || [] });
}
