export default function handler(req, res) {
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
  res.end();
}
