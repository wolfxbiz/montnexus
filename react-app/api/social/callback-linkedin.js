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
    return res.writeHead(302, { Location: '/admin/socials?error=linkedin_denied' }).end();
  }

  const { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI } = process.env;

  // Exchange code for access token
  const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      client_id: LINKEDIN_CLIENT_ID,
      client_secret: LINKEDIN_CLIENT_SECRET,
    }),
  });

  if (!tokenRes.ok) {
    return res.writeHead(302, { Location: '/admin/socials?error=linkedin_token' }).end();
  }

  const { access_token, expires_in } = await tokenRes.json();

  // Get LinkedIn profile
  const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  const profile = await profileRes.json();

  const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

  // Store in Supabase
  await supabase.from('social_tokens').upsert({
    platform: 'linkedin',
    access_token,
    expires_at: expiresAt,
    page_id: profile.sub,  // LinkedIn user URN sub
    page_name: profile.name || profile.email || 'LinkedIn Account',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'platform' });

  res.writeHead(302, { Location: '/admin/socials?connected=linkedin' });
  res.end();
}
