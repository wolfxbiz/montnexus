// Generic Supabase proxy — forwards ALL Supabase REST/Auth calls server-side.
// Fixes Indian ISP routing issues where direct browser→Supabase connections fail.
// The Supabase client in supabase.js rewrites all URLs to go through this endpoint.

export default async function handler(req, res) {
  const { path, ...queryParams } = req.query;
  const supabasePath = Array.isArray(path) ? path.join('/') : (path || '');

  const qs = new URLSearchParams(queryParams).toString();
  const targetUrl = `${process.env.VITE_SUPABASE_URL}/${supabasePath}${qs ? '?' + qs : ''}`;

  // Forward Supabase-relevant headers from the client request
  const headers = {};
  for (const h of ['authorization', 'apikey', 'prefer', 'range', 'accept-profile', 'content-profile', 'x-client-info']) {
    if (req.headers[h]) headers[h] = req.headers[h];
  }
  // Always ensure apikey is set (Supabase requires it)
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
