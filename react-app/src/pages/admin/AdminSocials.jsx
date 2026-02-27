import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import '../../styles/AdminSocials.css';

const PLATFORMS = [
  {
    key: 'twitter',
    label: 'Twitter / X',
    color: '#000',
    icon: '𝕏',
    envBased: true,
    envVars: ['TWITTER_API_KEY', 'TWITTER_ACCESS_TOKEN'],
    setupSteps: [
      'Go to developer.twitter.com → Create Project → Create App',
      'App Permissions → set to "Read and Write"',
      'Keys and Tokens → Generate Access Token & Secret',
      'Add all 4 vars to Vercel Environment Variables:',
      'TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET',
    ],
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    color: '#0077b5',
    icon: 'in',
    envBased: false,
    oauthPath: '/api/social/oauth-linkedin',
    setupSteps: [
      'Go to linkedin.com/developers → Create App',
      'Products tab → Request "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect"',
      'Auth tab → Redirect URL: https://montnexus.com/api/social/callback-linkedin',
      'Add LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET to Vercel',
      'Then click "Connect LinkedIn" below',
    ],
  },
  {
    key: 'facebook',
    label: 'Facebook',
    color: '#1877f2',
    icon: 'f',
    envBased: false,
    oauthPath: '/api/social/oauth-facebook',
    setupSteps: [
      'Go to developers.facebook.com → Create App → Business type',
      'Add Products: Facebook Login + Instagram Graph API',
      'Facebook Login → Valid OAuth Redirect: https://montnexus.com/api/social/callback-facebook',
      'Add FACEBOOK_APP_ID + FACEBOOK_APP_SECRET to Vercel',
      'Then click "Connect Facebook" below',
    ],
  },
  {
    key: 'instagram',
    label: 'Instagram',
    color: '#e1306c',
    icon: '◎',
    envBased: false,
    derivedFrom: 'facebook',
    setupSteps: [
      'Instagram is connected automatically when you connect Facebook.',
      'Your Instagram account must be a Business or Creator account.',
      'It must be linked to your Facebook Page in Meta Business Suite.',
    ],
  },
];

export default function AdminSocials() {
  const [searchParams] = useSearchParams();
  const [tokens, setTokens] = useState({});
  const [twitterConfigured, setTwitterConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState({});
  const [testResults, setTestResults] = useState({});
  const [expandedSetup, setExpandedSetup] = useState(null);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchStatus();
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) setNotification(`✓ ${connected} connected successfully!`);
    if (error) setNotification(`✗ Error: ${error.replace(/_/g, ' ')}`);
    if (connected || error) setTimeout(() => setNotification(''), 5000);
  }, []);

  async function fetchStatus() {
    setLoading(true);
    // Check Twitter via a status endpoint
    const twRes = await fetch('/api/social-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    }).catch(() => null);
    if (twRes?.ok) {
      const data = await twRes.json();
      setTwitterConfigured(data.twitter_configured || false);
    }

    // Check Supabase tokens
    const { data } = await supabase
      .from('social_tokens')
      .select('platform, page_name, expires_at, updated_at');

    const tokenMap = {};
    (data || []).forEach(t => { tokenMap[t.platform] = t; });
    setTokens(tokenMap);
    setLoading(false);
  }

  async function disconnect(platform) {
    if (!window.confirm(`Disconnect ${platform}?`)) return;
    await supabase.from('social_tokens').delete().eq('platform', platform);
    if (platform === 'facebook') {
      await supabase.from('social_tokens').delete().eq('platform', 'instagram');
    }
    fetchStatus();
  }

  async function testPost(platform) {
    setTesting(p => ({ ...p, [platform]: true }));
    setTestResults(p => ({ ...p, [platform]: null }));
    try {
      const res = await fetch('/api/social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: platform,
          post: {
            title: 'Test post from Montnexus CMS',
            slug: 'test',
            excerpt: 'This is a test post to verify social media connection.',
            cover_image_url: null,
          },
        }),
      });
      const data = await res.json();
      const result = data.results?.[platform];
      setTestResults(p => ({ ...p, [platform]: result?.ok ? 'success' : result?.error || 'failed' }));
    } catch (e) {
      setTestResults(p => ({ ...p, [platform]: e.message }));
    } finally {
      setTesting(p => ({ ...p, [platform]: false }));
    }
  }

  function isConnected(platform) {
    if (platform === 'twitter') return twitterConfigured;
    return !!tokens[platform];
  }

  return (
    <>
      <div className="admin-topbar">
        <span className="admin-topbar__title">Social Media</span>
      </div>

      <div className="admin-content">
        {notification && (
          <div className={`socials-notification ${notification.startsWith('✓') ? 'socials-notification--ok' : 'socials-notification--err'}`}>
            {notification}
          </div>
        )}

        <p className="socials-intro">
          Connect your social accounts. When you publish a blog post, it will automatically post to all connected platforms.
        </p>

        <div className="socials-grid">
          {PLATFORMS.map(platform => {
            const connected = isConnected(platform.key);
            const token = tokens[platform.key];
            const testResult = testResults[platform.key];
            const isExpanded = expandedSetup === platform.key;

            return (
              <div key={platform.key} className={`socials-card ${connected ? 'socials-card--connected' : ''}`}>
                {/* Header */}
                <div className="socials-card__header">
                  <div className="socials-card__icon" style={{ background: platform.color }}>
                    {platform.icon}
                  </div>
                  <div>
                    <div className="socials-card__name">{platform.label}</div>
                    <div className={`socials-card__status ${connected ? 'connected' : 'disconnected'}`}>
                      {connected ? (
                        <>
                          <span className="socials-status-dot" />
                          Connected{token?.page_name ? ` · ${token.page_name}` : ''}
                        </>
                      ) : 'Not connected'}
                    </div>
                  </div>
                </div>

                {/* Token expiry warning */}
                {token?.expires_at && (
                  <div className="socials-expiry">
                    Token expires: {new Date(token.expires_at).toLocaleDateString()}
                  </div>
                )}

                {/* Test result */}
                {testResult && (
                  <div className={`socials-test-result ${testResult === 'success' ? 'ok' : 'err'}`}>
                    {testResult === 'success' ? '✓ Test post sent!' : `✗ ${testResult}`}
                  </div>
                )}

                {/* Actions */}
                <div className="socials-card__actions">
                  {connected ? (
                    <>
                      <button
                        className="admin-btn-secondary"
                        onClick={() => testPost(platform.key)}
                        disabled={testing[platform.key]}
                      >
                        {testing[platform.key] ? 'Sending…' : 'Send Test'}
                      </button>
                      {!platform.derivedFrom && (
                        <button
                          className="admin-btn-danger"
                          onClick={() => disconnect(platform.key)}
                        >
                          Disconnect
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {platform.envBased ? (
                        <button
                          className="socials-setup-btn"
                          onClick={() => setExpandedSetup(isExpanded ? null : platform.key)}
                        >
                          {isExpanded ? 'Hide Setup Guide' : 'View Setup Guide'}
                        </button>
                      ) : platform.derivedFrom ? (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                          Connect Facebook first to enable Instagram.
                        </p>
                      ) : (
                        <a href={platform.oauthPath} className="socials-connect-btn">
                          Connect {platform.label}
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* Setup steps */}
                {(isExpanded || (!connected && platform.derivedFrom)) && (
                  <div className="socials-setup-steps">
                    {platform.setupSteps.map((step, i) => (
                      <div key={i} className="socials-setup-step">
                        {!platform.derivedFrom && <span className="socials-step-num">{i + 1}</span>}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Posting behavior note */}
        <div className="socials-note">
          <strong>How auto-posting works:</strong> When you click "Save &amp; Publish" on a blog post,
          the CMS will automatically generate platform-specific captions using AI and post to all connected accounts.
          Instagram requires a Cover Image URL set on the post. Posts link back to your blog article.
        </div>
      </div>
    </>
  );
}
