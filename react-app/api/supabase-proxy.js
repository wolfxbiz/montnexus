// Generic Supabase proxy — single-file endpoint that receives the full path as a query param.
// Avoids catch-all [...path] routing issues on Vercel.
// Client sends: /api/supabase-proxy?target=/rest/v1/blog_posts?select=*&order=...

export default async function handler(req, res) {
  const target = req.query.target;
  if (!target) return res.status(400).json({ error: 'target required' });

  const targetUrl = `${process.env.VITE_SUPABASE_URL}${target}`;

  // Forward Supabase-relevant headers
  const headers = {};
  for (const h of ['authorization', 'apikey', 'prefer', 'range', 'accept-profile', 'content-profile', 'x-client-info']) {
    if (req.headers[h]) headers[h] = req.headers[h];
  }
  if (!headers['apikey']) headers['apikey'] = process.env.VITE_SUPABASE_ANON_KEY;
  if (req.body) headers['content-type'] = 'application/json';

  const fetchOptions = { method: req.method, headers };
  if (req.body && !['GET', 'HEAD'].includes(req.method)) {
    fetchOptions.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const text = await response.text();

    for (const h of ['content-type', 'content-range', 'x-total-count', 'location']) {
      const val = response.headers.get(h);
      if (val) res.setHeader(h, val);
    }

    return res.status(response.status).send(text);
  } catch (err) {
    return res.status(502).json({ error: 'Proxy error', message: err.message });
  }
}
