import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert content writer and SEO specialist for Montnexus,
a retail automation and AI systems engineering company based in India/UAE.
Write professional, engaging content that showcases expertise in AI, retail automation,
and business systems. Maintain a confident, forward-thinking tone.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, ...payload } = req.body;

  try {
    let result;

    switch (action) {
      case 'draft':
        result = await generateDraft(payload);
        break;
      case 'seo':
        result = await generateSEO(payload);
        break;
      case 'social':
        result = await generateSocial(payload);
        break;
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('AI generate error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function generateDraft({ topic, keywords = [], tone = 'professional' }) {
  const keywordStr = keywords.length > 0 ? `Keywords to include: ${keywords.join(', ')}` : '';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Write a comprehensive blog post about: "${topic}"
${keywordStr}
Tone: ${tone}

Format the response as valid Markdown with:
- A compelling H1 title
- An engaging introduction paragraph
- 3-5 H2 sections with detailed content
- A conclusion with a call to action
- Appropriate use of bullet points or numbered lists where helpful

Return ONLY the markdown content, no extra explanation.`,
      },
    ],
  });

  const content = message.content[0].text;

  // Extract title from first H1
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : topic;

  // Extract first paragraph as excerpt
  const excerptMatch = content.replace(/^#.+$/m, '').trim().match(/^([^\n]+)/);
  const excerpt = excerptMatch ? excerptMatch[1].substring(0, 200) : '';

  return { content, title, excerpt };
}

async function generateSEO({ title, content, excerpt }) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze this blog post and generate SEO metadata.

Title: ${title}
Excerpt: ${excerpt}
Content preview: ${content.substring(0, 500)}

Return a JSON object (no markdown, just raw JSON) with:
{
  "meta_title": "SEO-optimized title under 60 chars",
  "meta_description": "Compelling meta description 150-160 chars",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  // Strip markdown code fences if present
  const json = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

async function generateSocial({ title, content, excerpt }) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Create social media posts for this blog article.

Title: ${title}
Excerpt: ${excerpt}

Return a JSON object (no markdown, just raw JSON) with:
{
  "linkedin": "Professional LinkedIn post (150-300 words) with relevant hashtags",
  "instagram": "Engaging Instagram caption (100-150 words) with emojis and hashtags",
  "twitter": "Punchy Twitter/X post under 280 chars with 2-3 hashtags"
}`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  const json = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}
