import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return res.writeHead(302, { Location: '/admin/socials?error=facebook_denied' }).end();
  }

  const { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, FACEBOOK_REDIRECT_URI } = process.env;
  const graphBase = 'https://graph.facebook.com/v19.0';

  // Step 1: Exchange code for short-lived token
  const shortRes = await fetch(`${graphBase}/oauth/access_token?` + new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    code,
  }));
  if (!shortRes.ok) {
    return res.writeHead(302, { Location: '/admin/socials?error=facebook_token' }).end();
  }
  const { access_token: shortToken } = await shortRes.json();

  // Step 2: Exchange for long-lived token (~60 days)
  const longRes = await fetch(`${graphBase}/oauth/access_token?` + new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    fb_exchange_token: shortToken,
  }));
  const { access_token: longToken, expires_in } = await longRes.json();
  const expiresAt = new Date(Date.now() + (expires_in || 5184000) * 1000).toISOString();

  // Step 3: Get managed Pages
  const pagesRes = await fetch(`${graphBase}/me/accounts?access_token=${longToken}`);
  const pagesData = await pagesRes.json();
  const page = pagesData.data?.[0]; // Use first page

  if (!page) {
    return res.writeHead(302, { Location: '/admin/socials?error=no_facebook_page' }).end();
  }

  // Store Facebook token
  await supabase.from('social_tokens').upsert({
    platform: 'facebook',
    access_token: page.access_token, // Page access token (never expires)
    expires_at: null,
    page_id: page.id,
    page_name: page.name,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'platform' });

  // Step 4: Get connected Instagram Business Account
  const igRes = await fetch(
    `${graphBase}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  );
  const igData = await igRes.json();
  const igAccount = igData.instagram_business_account;

  if (igAccount?.id) {
    // Get Instagram username
    const igInfoRes = await fetch(
      `${graphBase}/${igAccount.id}?fields=username&access_token=${page.access_token}`
    );
    const igInfo = await igInfoRes.json();

    await supabase.from('social_tokens').upsert({
      platform: 'instagram',
      access_token: page.access_token,
      expires_at: null,
      page_id: igAccount.id,
      page_name: igInfo.username || 'Instagram Account',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'platform' });
  }

  res.writeHead(302, { Location: '/admin/socials?connected=facebook' });
  res.end();
}
