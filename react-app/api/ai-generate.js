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
      case 'page_content':
        result = await generatePageContent(payload);
        break;
      case 'section_content':
        result = await generateSectionContent(payload);
        break;
      case 'page_regen':
        result = await regeneratePageContent(payload);
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

async function generatePageContent({ business_name, business_description, tone = 'professional' }) {
  const SECTION_SCHEMAS = `
Section type schemas (output EXACTLY these keys):
- "hero": { tag, headline, subheadline, cta_primary:{text,link}, cta_secondary:{text,link}, stats:[{number,label}] }
- "features_grid": { tag, title, body, items:[{number,tag,title,description,features:[],link}] }
- "services_grid": { tag, title, body, services:[{number,title,description,features:[]}] }
- "process_steps": { tag, title, body, steps:[{number,title,description}] }
- "about_strip": { tag, title, body, stats:[{number,label}] }
- "cta_banner": { headline, body, cta_text, cta_link, email }
`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [
      {
        role: 'user',
        content: `Create a complete professional website for this business:

Business Name: ${business_name}
Description: ${business_description}
Tone: ${tone}

${SECTION_SCHEMAS}

Generate a full website with these sections in order:
1. hero (compelling headline, subheadline, 2 CTAs, 3 stats)
2. features_grid (2-3 key service/feature cards with bullet points)
3. services_grid (3 service offerings with features)
4. process_steps (4-6 process steps)
5. cta_banner (final call to action with email: hello@${business_name.toLowerCase().replace(/\s+/g, '')}.com)

Also include: site_name, meta_title (under 60 chars), meta_description (under 160 chars).

Return ONLY valid JSON (no markdown fences):
{
  "site_name": "...",
  "meta_title": "...",
  "meta_description": "...",
  "sections": [
    {"section_type": "hero", "content": {...}},
    ...
  ]
}`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  const json = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

async function generateSectionContent({ section_type, business_description, context = '', tone = 'professional' }) {
  const SCHEMAS = {
    hero: '{ tag, headline, subheadline, cta_primary:{text,link}, cta_secondary:{text,link}, stats:[{number,label}] }',
    features_grid: '{ tag, title, body, items:[{number,tag,title,description,features:[],link}] }',
    services_grid: '{ tag, title, body, services:[{number,title,description,features:[]}] }',
    process_steps: '{ tag, title, body, steps:[{number,title,description}] }',
    about_strip: '{ tag, title, body, stats:[{number,label}] }',
    cta_banner: '{ headline, body, cta_text, cta_link, email }',
    text_content: '{ tag, title, body }',
  };

  const schema = SCHEMAS[section_type] || '{}';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `Generate content for a "${section_type}" website section.

Business: ${business_description}
${context ? `Context: ${context}` : ''}
Tone: ${tone}

Required JSON schema: ${schema}

Return ONLY valid JSON matching that schema exactly (no markdown fences).`,
      },
    ],
  });

  const text = message.content[0].text.trim();
  const json = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(json);
}

async function regeneratePageContent({
  page_title,
  page_type = 'service',
  current_sections = [],
  available_services = [],
  extra_instructions = '',
  tone = 'professional',
}) {
  const SCHEMAS = `
Section type schemas (use EXACTLY these keys):
- "hero": { tag, headline, subheadline, cta_primary:{text,link}, cta_secondary:{text,link}, stats:[{number,label}] }
- "features_grid": { tag, title, body, items:[{number,tag,title,description,features:[],link}] }
- "services_grid": { tag, title, body, services:[{number,title,description,features:[]}] }
- "process_steps": { tag, title, body, steps:[{number,title,description}] }
- "about_strip": { tag, title, body, stats:[{number,label}] }
- "cta_banner": { headline, body, cta_text, cta_link, email }
- "text_content": { tag, title, body }`;

  const servicesContext = available_services.length > 0
    ? `Available service pages on this site:\n${available_services.map(s => `- "${s.title}" at /${s.slug}${s.meta_description ? ': ' + s.meta_description : ''}`).join('\n')}`
    : 'No additional service pages on this site yet.';

  const sectionList = current_sections.length > 0
    ? `Preserve this section order and types: ${current_sections.join(' → ')}`
    : 'Choose the most appropriate 4-5 sections for this page type.';

  const pageContext = {
    core_home: 'This is the main home/landing page. It should give an overview of all services and link to specific service pages.',
    core_about: 'This is the About Us page. Focus on company story, team values, process, and culture.',
    core_contact: 'This is the Contact Us page. Focus on getting visitors to reach out, with contact options and reassurance.',
    service: `This is a service detail page for "${page_title}". Focus deeply on this specific service, its benefits, process, and results.`,
    other: `This is a landing page titled "${page_title}". Optimize for conversion and clarity.`,
  }[page_type === 'core' ? `core_${page_title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')}` : page_type]
    || `This page is titled "${page_title}".`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3500,
    messages: [
      {
        role: 'user',
        content: `Regenerate optimized content for this website page.

Page: "${page_title}"
Context: ${pageContext}
Tone: ${tone}

${servicesContext}

${sectionList}

${extra_instructions ? `Additional instructions: ${extra_instructions}` : ''}

${SCHEMAS}

Important:
- For the home page, reference the available service pages and include their links in CTAs/features
- Use compelling, conversion-focused copy
- Keep stats realistic and impactful
- CTAs should link to /#contact or specific service pages

Return ONLY valid JSON (no markdown fences):
{
  "sections": [
    {"section_type": "hero", "content": {...}},
    {"section_type": "features_grid", "content": {...}},
    ...
  ]
}`,
      },
    ],
  });

  const text = message.content[0].text.trim();
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
