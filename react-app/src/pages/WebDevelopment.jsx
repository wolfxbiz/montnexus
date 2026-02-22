import SEO from '../seo/SEO';
import RevealWrapper from '../components/ui/RevealWrapper';
import Contact from '../components/sections/Contact';
import { siteConfig } from '../data/siteConfig';
import logoWordmark from '../assets/MNX Montnexus.png';
import heroImg from '../assets/Cristus_Create_an_abstract_composition_in_vibrant_neon_green_to_f12736e3-f3e5-4ad9-a48f-29a29c5f9734.png';
import '../components/sections/Hero.css';
import './WebDevelopment.css';

const services = [
  {
    number: '01',
    title: 'Business Website Development',
    description:
      'Professional websites designed to represent your brand clearly and effectively.',
    features: [
      'Custom UI/UX design',
      'Responsive (mobile-first) development',
      'Clean frontend architecture',
      'Contact & lead capture forms',
      'Domain & DNS configuration',
      'Deployment & hosting setup',
      'Google Analytics integration',
    ],
  },
  {
    number: '02',
    title: 'CMS-Based Websites',
    description:
      'For businesses that need full control over their content without technical overhead.',
    features: [
      'Blog integration',
      'Admin panel setup',
      'Content management interface',
      'WordPress or headless CMS',
      'Built for non-technical teams',
    ],
  },
  {
    number: '03',
    title: 'Custom Web Systems',
    description:
      'Beyond websites — structured web applications built on solid backend architecture.',
    features: [
      'Admin dashboards',
      'Client portals',
      'Booking & appointment systems',
      'Backend development',
      'Database design & API integration',
      'Secure authentication systems',
    ],
  },
];

const processSteps = [
  { number: '01', title: 'Discovery', desc: 'Understanding your business model, goals, and user needs.' },
  { number: '02', title: 'Architecture Planning', desc: 'Defining structure, database logic, and system flow before development begins.' },
  { number: '03', title: 'UI/UX Design', desc: 'Designing intuitive, clean, and user-focused interfaces.' },
  { number: '04', title: 'Development', desc: 'Frontend and backend implementation with structured code practices.' },
  { number: '05', title: 'Testing & Optimization', desc: 'Performance testing, responsiveness validation, and quality checks.' },
  { number: '06', title: 'Deployment', desc: 'Domain setup, DNS configuration, hosting integration, and production release.' },
];

const whyItems = [
  'Engineering-first mindset',
  'Structured backend architecture',
  'Performance-optimized builds',
  'Clean deployment workflows',
  'Scalable system design',
  'Analytics-ready from day one',
];

const maintenanceItems = [
  'CMS updates',
  'Security patches',
  'Backup monitoring',
  'Minor feature enhancements',
  'Technical support',
];

export default function WebDevelopment() {
  return (
    <div className="wd-page">
      <SEO
        title="Web Design & Development Services"
        description="Custom business websites, CMS platforms, and web systems built from design to deployment. Scalable, secure, and performance-focused."
        canonicalPath="/web-design-development"
      />

      {/* ── Hero ── */}
      <section id="hero">
        <div className="hero-brand" aria-hidden="true">
          <img src={logoWordmark} alt={siteConfig.name} className="hero-brand-logo" />
        </div>

        <div className="hero-grid">
          <div className="hero-left">
            <h1 className="hero-title">
              WEB DESIGN<br />&amp; DEVELOPMENT
            </h1>

            <p className="hero-sub">
              Custom business websites and web systems built from design
              to deployment — performance-focused and scalable.
            </p>

            <div className="hero-cta">
              <a href="#contact" className="hero-btn-green">Request a Consultation</a>
              <a href="#services" className="hero-cta-ghost">See Our Services</a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">3</div>
                <div className="hero-stat-label">Service Types</div>
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

      {/* ── Overview ── */}
      <section id="about" className="wd-overview">
        <div className="wd-container">
          <RevealWrapper>
            <span className="pill"><span />Overview</span>
          </RevealWrapper>
          <RevealWrapper delay={1}>
            <h2 className="wd-overview-heading">
              We don't just design interfaces.<br />We engineer functional systems.
            </h2>
          </RevealWrapper>
          <RevealWrapper delay={2}>
            <p className="wd-overview-body">
              At Montnexus, we design and build complete web solutions — combining user experience,
              backend architecture, and deployment infrastructure into one structured system.
              From simple business websites to CMS platforms and custom web applications,
              every project is built with performance, scalability, and maintainability in mind.
            </p>
          </RevealWrapper>
        </div>
      </section>

      {/* ── Services Breakdown ── */}
      <section id="services" className="wd-services">
        <div className="wd-container">
          <RevealWrapper className="section-header">
            <span className="section-tag">What We Build</span>
            <h2 className="section-title">Our Services</h2>
            <p className="section-sub">Three core delivery areas — from landing pages to full-stack systems.</p>
          </RevealWrapper>

          <div className="wd-services-grid">
            {services.map((svc, i) => (
              <RevealWrapper key={svc.number} delay={i + 1} className="wd-service-card">
                <div className="wd-service-number">{svc.number}</div>
                <h3 className="wd-service-title">{svc.title}</h3>
                <p className="wd-service-desc">{svc.description}</p>
                <ul className="wd-feature-list">
                  {svc.features.map((f) => (
                    <li key={f}>
                      <span className="wd-dot" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section id="how" className="wd-process">
        <div className="wd-container">
          <RevealWrapper className="section-header">
            <span className="section-tag">Our Approach</span>
            <h2 className="section-title section-title--light">Development Process</h2>
            <p className="section-sub wd-process-sub">
              A structured workflow — from understanding your needs to deploying your system.
            </p>
          </RevealWrapper>

          <div className="wd-process-grid">
            {processSteps.map((step, i) => (
              <RevealWrapper key={step.number} delay={(i % 3) + 1} className="wd-process-step">
                <div className="wd-process-num">{step.number}</div>
                <h4 className="wd-process-title">{step.title}</h4>
                <p className="wd-process-desc">{step.desc}</p>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Montnexus ── */}
      <section className="wd-why">
        <div className="wd-container">
          <RevealWrapper>
            <span className="pill"><span />Why Montnexus</span>
          </RevealWrapper>
          <RevealWrapper delay={1}>
            <h2 className="wd-why-heading">
              We build digital systems —<br />not just pages.
            </h2>
          </RevealWrapper>
          <div className="wd-why-grid">
            {whyItems.map((item, i) => (
              <RevealWrapper key={item} delay={(i % 3) + 1} className="wd-why-item">
                <span className="wd-dot" aria-hidden="true" />
                <span>{item}</span>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Maintenance ── */}
      <section className="wd-maintenance">
        <div className="wd-container">
          <RevealWrapper className="wd-maintenance-card">
            <span className="section-tag">Ongoing Support</span>
            <h2 className="wd-maintenance-title">Maintenance &amp; Support</h2>
            <p className="wd-maintenance-desc">
              Optional ongoing support plans to keep your web system stable, secure, and up to date.
            </p>
            <ul className="wd-feature-list">
              {maintenanceItems.map((item) => (
                <li key={item}>
                  <span className="wd-dot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="wd-maintenance-note">Structured support ensures long-term stability.</p>
          </RevealWrapper>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="wd-cta">
        <div className="wd-container">
          <RevealWrapper className="wd-cta-inner">
            <span className="pill pill-dark"><span />Let's Build</span>
            <h2 className="wd-cta-title">
              Ready to build your<br />web system?
            </h2>
            <p className="wd-cta-sub">
              If you need a structured website or a custom web system built from scratch,
              we're ready to collaborate.
            </p>
            <a href="mailto:hello@montnexus.com" className="btn-light wd-cta-btn">
              hello@montnexus.com
            </a>
            <p className="wd-cta-location">India · Remote-first</p>
          </RevealWrapper>
        </div>
      </section>
      <Contact />
    </div>
  );
}
