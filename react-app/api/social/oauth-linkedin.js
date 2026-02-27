export default function handler(req, res) {
  const { LINKEDIN_CLIENT_ID, LINKEDIN_REDIRECT_URI } = process.env;
  if (!LINKEDIN_CLIENT_ID) {
    return res.status(400).send('LINKEDIN_CLIENT_ID not configured in environment variables.');
  }

  const scope = 'openid profile w_member_social';
  const state = Math.random().toString(36).substring(2);

  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', LINKEDIN_CLIENT_ID);
  url.searchParams.set('redirect_uri', LINKEDIN_REDIRECT_URI);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);

  res.writeHead(302, { Location: url.toString() });
  res.end();
}
