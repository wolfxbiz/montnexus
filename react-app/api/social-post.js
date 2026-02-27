import { TwitterApi } from 'twitter-api-v2';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Get stored token for a platform
async function getToken(platform) {
  const { data } = await supabase
    .from('social_tokens')
    .select('*')
    .eq('platform', platform)
    .single();
  return data;
}

// Generate social text if not already stored
async function getSocialText(post) {
  if (post.social_posts && Object.keys(post.social_posts).length > 0) {
    return post.social_posts;
  }
  // Generate via Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `Create social media posts for this blog article about Montnexus (retail automation & AI systems company).
Title: ${post.title}
Excerpt: ${post.excerpt || ''}

Return a JSON object (no markdown) with:
{
  "linkedin": "Professional LinkedIn post (150-300 words) with hashtags",
  "instagram": "Engaging Instagram caption (100-150 words) with emojis and hashtags",
  "twitter": "Punchy Twitter/X post under 275 chars with 2-3 hashtags",
  "facebook": "Friendly Facebook post (100-200 words) with link to article"
}`
    }]
  });
  const text = message.content[0].text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(text);
}

// ─── TWITTER ────────────────────────────────────────────────
async function postToTwitter(text) {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } = process.env;
  if (!TWITTER_API_KEY || !TWITTER_ACCESS_TOKEN) throw new Error('Twitter credentials not configured');

  const client = new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
  });
  const tweet = await client.v2.tweet(text.substring(0, 280));
  return tweet.data.id;
}

// ─── LINKEDIN ───────────────────────────────────────────────
async function postToLinkedIn(text, token) {
  if (!token) throw new Error('LinkedIn not connected');

  // Get the author URN (stored as page_id for LinkedIn)
  const authorUrn = token.page_id;

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${authorUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn API error: ${err}`);
  }
  const data = await res.json();
  return data.id;
}

// ─── FACEBOOK ───────────────────────────────────────────────
async function postToFacebook(text, postUrl, token) {
  if (!token) throw new Error('Facebook not connected');

  const message = postUrl ? `${text}\n\n${postUrl}` : text;
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${token.page_id}/feed`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        access_token: token.access_token,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Facebook API error: ${err}`);
  }
  const data = await res.json();
  return data.id;
}

// ─── INSTAGRAM ──────────────────────────────────────────────
async function postToInstagram(caption, imageUrl, token) {
  if (!token) throw new Error('Instagram not connected');
  if (!imageUrl) throw new Error('Instagram requires a cover image URL');

  const igUserId = token.page_id;
  const pageToken = token.access_token;

  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: pageToken,
      }),
    }
  );
  if (!containerRes.ok) throw new Error('Instagram container creation failed');
  const { id: creationId } = await containerRes.json();

  // Step 2: Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: creationId, access_token: pageToken }),
    }
  );
  if (!publishRes.ok) throw new Error('Instagram publish failed');
  const { id } = await publishRes.json();
  return id;
}

// ─── MAIN HANDLER ───────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action = 'all', post } = req.body;
  if (!post) return res.status(400).json({ error: 'post is required' });

  const postUrl = `https://montnexus.com/blog/${post.slug}`;
  const results = {};

  try {
    const socialText = await getSocialText(post);

    const [linkedinToken, facebookToken, instagramToken] = await Promise.all([
      getToken('linkedin'),
      getToken('facebook'),
      getToken('instagram'),
    ]);

    const tasks = [];

    if (action === 'all' || action === 'twitter') {
      tasks.push(
        postToTwitter(socialText.twitter || socialText.linkedin?.substring(0, 275))
          .then(id => { results.twitter = { ok: true, id }; })
          .catch(e => { results.twitter = { ok: false, error: e.message }; })
      );
    }

    if (action === 'all' || action === 'linkedin') {
      tasks.push(
        postToLinkedIn(socialText.linkedin, linkedinToken)
          .then(id => { results.linkedin = { ok: true, id }; })
          .catch(e => { results.linkedin = { ok: false, error: e.message }; })
      );
    }

    if (action === 'all' || action === 'facebook') {
      tasks.push(
        postToFacebook(socialText.facebook || socialText.linkedin, postUrl, facebookToken)
          .then(id => { results.facebook = { ok: true, id }; })
          .catch(e => { results.facebook = { ok: false, error: e.message }; })
      );
    }

    if (action === 'all' || action === 'instagram') {
      tasks.push(
        postToInstagram(socialText.instagram, post.cover_image_url, instagramToken)
          .then(id => { results.instagram = { ok: true, id }; })
          .catch(e => { results.instagram = { ok: false, error: e.message }; })
      );
    }

    await Promise.all(tasks);

    // Save social_posts back to the blog post
    if (action === 'all') {
      await supabase.from('blog_posts')
        .update({ social_posts: socialText })
        .eq('id', post.id);
    }

    return res.status(200).json({ results, social_posts: socialText });
  } catch (err) {
    return res.status(500).json({ error: err.message, results });
  }
}
