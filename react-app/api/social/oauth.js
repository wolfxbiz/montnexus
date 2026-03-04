export default function handler(req, res) {
  const { platform } = req.query;

  if (platform === 'facebook') {
    const { FACEBOOK_APP_ID, FACEBOOK_REDIRECT_URI } = process.env;
    if (!FACEBOOK_APP_ID) {
      return res.status(400).send('FACEBOOK_APP_ID not configured in environment variables.');
    }
    const scope = [
      'pages_manage_posts',
      'pages_read_engagement',
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
    ].join(',');
    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    url.searchParams.set('client_id', FACEBOOK_APP_ID);
    url.searchParams.set('redirect_uri', FACEBOOK_REDIRECT_URI);
    url.searchParams.set('scope', scope);
    url.searchParams.set('response_type', 'code');
    res.writeHead(302, { Location: url.toString() });
    return res.end();
  }

  if (platform === 'linkedin') {
    const { LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI } = process.env;
    if (!LINKEDIN_CLIENT_ID) {
      return res.status(400).send('LINKEDIN_CLIENT_ID not configured in environment variables.');
    }
    const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
    url.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
    url.searchParams.set('scope', 'openid profile w_member_social');
    url.searchParams.set('state', Math.random().toString(36).substring(2));
    res.writeHead(302, { Location: url.toString() });
    return res.end();
  }

  return res.status(400).json({ error: 'platform must be facebook or linkedin' });
}
