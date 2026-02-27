/**
 * Client-side helper to call the /api/ai-generate serverless function.
 * The Anthropic API key is kept server-side and never exposed to the browser.
 */
export async function generateContent(action, payload) {
  const res = await fetch('/api/ai-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'AI generation failed');
  }

  return res.json();
}
