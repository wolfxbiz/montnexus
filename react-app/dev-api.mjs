/**
 * Local development API server — mirrors the Vercel serverless functions.
 * Run via: npm run dev:full
 * Listens on http://localhost:3001
 */
import http from 'http';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
try {
  const envFile = readFileSync(path.join(__dirname, '.env.local'), 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
  console.log('✓ Loaded .env.local');
} catch {
  console.warn('⚠ Could not load .env.local');
}

// Import the handler dynamically after env is loaded
async function getHandler(name) {
  const mod = await import(`./api/${name}.js?t=${Date.now()}`);
  return mod.default;
}

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Collect request body
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch {
      req.body = {};
    }

    // Mock res object compatible with our handlers
    const mockRes = {
      _status: 200,
      _headers: {},
      status(code) { this._status = code; return this; },
      setHeader(k, v) { this._headers[k] = v; return this; },
      json(data) {
        res.writeHead(this._status, { 'Content-Type': 'application/json', ...this._headers });
        res.end(JSON.stringify(data));
      },
      end(data) {
        res.writeHead(this._status, this._headers);
        res.end(data || '');
      },
    };

    try {
      if (pathname === '/api/ai-generate') {
        const handler = await getHandler('ai-generate');
        await handler(req, mockRes);
      } else if (pathname === '/api/publish-scheduled') {
        const handler = await getHandler('publish-scheduled');
        await handler(req, mockRes);
      } else {
        mockRes.status(404).json({ error: 'Not found' });
      }
    } catch (err) {
      console.error('Handler error:', err);
      mockRes.status(500).json({ error: err.message });
    }
  });
});

server.listen(PORT, () => {
  console.log(`✓ Local API server running at http://localhost:${PORT}`);
  console.log(`  /api/ai-generate    → POST`);
  console.log(`  /api/publish-scheduled → GET`);
});
