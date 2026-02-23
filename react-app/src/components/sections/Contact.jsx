import { useState } from 'react';
import { siteConfig } from '../../data/siteConfig';
import logoWordmark from '../../assets/Frame 17.png';
import './Contact.css';

// ── Get your free access key at https://web3forms.com ──────────────────────
const WEB3FORMS_KEY = '2d4894bc-20c8-41e8-ba98-11ffc6e7f250';
// ───────────────────────────────────────────────────────────────────────────

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New enquiry from ${formData.name} — Montnexus`,
          from_name: formData.name,
          email: formData.email,
          message: formData.message,
          redirect: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contact">
      <div className="contact-inner">

        <div className="contact-top">
          <span className="pill" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <span />Contact
          </span>
          <h2 className="contact-heading">Start a conversation.</h2>
          <p className="contact-sub">
            We work with select retail partners. If you&rsquo;re exploring automation
            or looking to improve operational clarity, reach out directly.
          </p>
        </div>

        {status === 'success' ? (
          <div className="cf-success">
            <div className="cf-success-icon">✓</div>
            <p className="cf-success-msg">Message sent. We&rsquo;ll get back to you shortly.</p>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="cf-row">
              <div className="cf-field">
                <label className="cf-label" htmlFor="cf-name">Name</label>
                <input
                  id="cf-name"
                  className="cf-input"
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="cf-field">
                <label className="cf-label" htmlFor="cf-email">Email</label>
                <input
                  id="cf-email"
                  className="cf-input"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="cf-field">
              <label className="cf-label" htmlFor="cf-message">Message</label>
              <textarea
                id="cf-message"
                className="cf-input cf-textarea"
                name="message"
                placeholder="Tell us about your project or requirement…"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>

            {status === 'error' && (
              <p className="cf-error">
                Something went wrong. Please try again or email us directly.
              </p>
            )}

            <button className="cf-submit" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending…' : 'Send Message →'}
            </button>
          </form>
        )}

        <a href={`mailto:${siteConfig.email}`} className="contact-email">
          {siteConfig.email}
        </a>

        <div className="contact-locations">
          <div className="contact-loc">
            <div className="contact-loc-dot" aria-hidden="true" />
            <div>
              <div className="contact-loc-label">India</div>
              <div className="contact-loc-sub">Remote-first · Primary operations</div>
            </div>
          </div>
          <div className="contact-loc-divider" aria-hidden="true" />
          <div className="contact-loc">
            <div className="contact-loc-dot contact-loc-dot--dim" aria-hidden="true" />
            <div>
              <div className="contact-loc-label">UAE</div>
              <div className="contact-loc-sub">Available for structured projects</div>
            </div>
          </div>
        </div>

        <div className="social-row">
          <a href={siteConfig.social.linkedin} className="social-btn" aria-label="LinkedIn" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#71717a" aria-hidden="true">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </a>
          <a href={siteConfig.social.facebook} className="social-btn" aria-label="Facebook" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#71717a" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
            </svg>
          </a>
          <a href={siteConfig.social.instagram} className="social-btn" aria-label="Instagram" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </div>

        <footer className="footer-bottom">
          <div className="footer-logo-wrap" aria-label={siteConfig.name}>
            <img src={logoWordmark} alt={siteConfig.name} className="footer-logo" />
          </div>
          <span className="footer-copy">© 2025 {siteConfig.name}. All rights reserved.</span>
        </footer>

      </div>
    </section>
  );
}
