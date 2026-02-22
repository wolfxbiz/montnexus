import { Link } from 'react-router-dom';
import SEO from '../seo/SEO';
import Contact from '../components/sections/Contact';
import RevealWrapper from '../components/ui/RevealWrapper';
import { siteConfig } from '../data/siteConfig';
import logoWordmark from '../assets/MNX Montnexus.png';
import heroImg from '../assets/Cristus_Create_an_abstract_composition_in_vibrant_neon_green_to_90f354a8-5fe9-43d1-8a92-4ea505df406c.png';
import '../components/sections/Hero.css';
import './HomeLanding.css';

const capabilities = [
  {
    number: '01',
    tag: 'Automation',
    title: 'Retail Automation & System Engineering',
    description:
      'We analyze and improve daily retail workflows — reducing repetitive work and improving operational visibility across your business.',
    features: [
      'Inventory tracking & stock alerts',
      'Sales monitoring & automated reporting',
      'Custom internal dashboards',
      'Workflow automation systems',
      'AI-assisted data processing',
    ],
    to: '/retail-automation-system',
  },
  {
    number: '02',
    tag: 'Web',
    title: 'Web Design & Development',
    description:
      'Custom business websites, CMS platforms, and web applications built from design to deployment — performance-focused and scalable.',
    features: [
      'Business website design & development',
      'CMS-based websites (WordPress / Headless)',
      'Custom web applications & portals',
      'Backend development & API integration',
      'Deployment, analytics & hosting setup',
    ],
    to: '/web-design-development',
  },
];

const principles = [
  { n: '01', t: 'Understand First', d: 'We take time to understand your business, goals, and constraints before proposing anything.' },
  { n: '02', t: 'Structure Before Build', d: 'We design a clear system architecture before writing a single line of code.' },
  { n: '03', t: 'End-to-End Delivery', d: 'Frontend, backend, and deployment — handled entirely with clean, maintainable code.' },
  { n: '04', t: 'Long-Term Support', d: 'Structured support plans available after delivery to keep systems stable and evolving.' },
];

export default function HomeLanding() {
  return (
    <div className="hl-page">
      <SEO
        title="Retail Automation & Web Engineering"
        description="Montnexus — structured automation systems for retail operations and complete web solutions from design to deployment."
        canonicalPath="/"
      />

      {/* ── Hero ── */}
      <section id="hero">
        <div className="hero-brand" aria-hidden="true">
          <img src={logoWordmark} alt={siteConfig.name} className="hero-brand-logo" />
        </div>

        <div className="hero-grid">
          <div className="hero-left">
            <h1 className="hero-title">
              RETAIL AUTOMATION<br />&amp; WEB ENGINEERING.
            </h1>

            <p className="hero-sub">
              Two structured capabilities — operational automation for retail
              businesses and complete web solutions built from design to deployment.
            </p>

            <div className="hero-cta">
              <Link to="/retail-automation-system" className="hero-btn-green">Retail Automation</Link>
              <Link to="/web-design-development" className="hero-cta-ghost">Web Development</Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">2</div>
                <div className="hero-stat-label">Core Capabilities</div>
              </div>
              <div className="hero-stat-divider" aria-hidden="true" />
              <div className="hero-stat">
                <div className="hero-stat-value">IN · AE</div>
                <div className="hero-stat-label">Markets Served</div>
              </div>
              <div className="hero-stat-divider" aria-hidden="true" />
              <div className="hero-stat">
                <div className="hero-stat-value">100%</div>
                <div className="hero-stat-label">Custom Built</div>
              </div>
            </div>
          </div>

          <div className="hero-right" aria-hidden="true">
            <img src={heroImg} alt="" className="hero-image" />
            <div className="hero-image-overlay" />
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section id="services" className="hl-services">
        <div className="hl-container">
          <RevealWrapper className="section-header">
            <span className="section-tag">What We Do</span>
            <h2 className="section-title">Two Core Capabilities</h2>
            <p className="section-sub">Focused on two things, done well.</p>
          </RevealWrapper>

          <div className="hl-cap-grid">
            {capabilities.map((cap, i) => (
              <RevealWrapper key={cap.number} delay={i + 1} className="hl-cap-card">
                <div className="hl-cap-top">
                  <span className="hl-cap-number">{cap.number}</span>
                  <span className="hl-cap-tag">{cap.tag}</span>
                </div>
                <h3 className="hl-cap-title">{cap.title}</h3>
                <p className="hl-cap-desc">{cap.description}</p>
                <ul className="hl-cap-features">
                  {cap.features.map(f => (
                    <li key={f}>
                      <span className="hl-dot" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={cap.to} className="hl-cap-cta">Explore Service →</Link>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="hl-about">
        <div className="hl-container">
          <RevealWrapper className="hl-about-inner">
            <div className="hl-about-left">
              <span className="pill" style={{ marginBottom: 20, display: 'inline-flex' }}>
                <span />About
              </span>
              <h2 className="hl-about-title">
                Engineering-first.<br />No unnecessary<br /><em>complexity.</em>
              </h2>
            </div>
            <div className="hl-about-right">
              <p className="hl-about-body">
                Montnexus is a focused engineering team working at the intersection of
                retail operations and web technology. We build structured systems — not
                broad agency solutions.
              </p>
              <p className="hl-about-body">
                Currently in an early growth phase, working with select partners across
                India and UAE. No exaggerated claims. Just structured work built with intention.
              </p>
              <div className="hl-about-stats">
                <div className="hl-stat">
                  <span className="hl-stat-val">India + UAE</span>
                  <span className="hl-stat-label">Remote-first operations</span>
                </div>
                <div className="hl-stat">
                  <span className="hl-stat-val">Select Partners</span>
                  <span className="hl-stat-label">Early growth phase</span>
                </div>
                <div className="hl-stat">
                  <span className="hl-stat-val">2 Capabilities</span>
                  <span className="hl-stat-label">Done well</span>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>
      </section>

      {/* ── How We Work ── */}
      <section id="how" className="hl-how">
        <div className="hl-container">
          <RevealWrapper className="section-header">
            <span className="section-tag">Our Approach</span>
            <h2 className="section-title">How We Work</h2>
            <p className="section-sub">Consistent across both capabilities.</p>
          </RevealWrapper>

          <div className="hl-how-grid">
            {principles.map((p, i) => (
              <RevealWrapper key={p.n} delay={i + 1} className="hl-how-step">
                <div className="hl-how-num">{p.n}</div>
                <h4 className="hl-how-title">{p.t}</h4>
                <p className="hl-how-desc">{p.d}</p>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact / Footer ── */}
      <Contact />
    </div>
  );
}
