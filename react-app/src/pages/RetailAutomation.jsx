import SEO from '../seo/SEO';
import RevealWrapper from '../components/ui/RevealWrapper';
import './RetailAutomation.css';

const services = [
  {
    number: '01',
    title: 'Retail Operational Automation',
    description:
      'We analyze and improve daily retail workflows — reducing repetitive work and improving visibility across your operations.',
    features: [
      'Inventory tracking & stock alerts',
      'Sales monitoring & daily summaries',
      'Automated reporting processes',
      'Customer follow-up workflows',
      'Staff coordination systems',
    ],
  },
  {
    number: '02',
    title: 'Custom System Development',
    description:
      'When existing tools don\'t fit, we build systems tailored to how your store actually functions — no unnecessary complexity.',
    features: [
      'Internal dashboards',
      'Inventory management systems',
      'Automation workflow builders',
      'AI-assisted reporting',
      'Web-based retail platforms',
    ],
  },
  {
    number: '03',
    title: 'Process Integration',
    description:
      'Connecting your existing tools and data sources into one structured, observable system.',
    features: [
      'Workflow design & mapping',
      'Third-party tool integration',
      'Data pipeline setup',
      'Automated alerts & triggers',
      'Operational efficiency analysis',
    ],
  },
];

const processSteps = [
  { number: '01', title: 'Audit', desc: 'Understanding your current workflows, tools, and operational pain points.' },
  { number: '02', title: 'Planning', desc: 'Designing the automation architecture and defining measurable outcomes.' },
  { number: '03', title: 'Implementation', desc: 'Building and configuring the system with structured, clean code practices.' },
  { number: '04', title: 'Training', desc: 'Ensuring your team understands and can operate the system independently.' },
  { number: '05', title: 'Monitoring', desc: 'Tracking system performance and resolving issues in the early run phase.' },
  { number: '06', title: 'Optimisation', desc: 'Refining workflows and outputs based on real-world operational data.' },
];

const whyItems = [
  'Retail-focused engineering',
  'No unnecessary complexity',
  'Clean, understandable systems',
  'Remote-first operations',
  'Structured implementation',
  'Long-term system support',
];

const maintenanceItems = [
  'System monitoring',
  'Workflow adjustments',
  'Performance optimisation',
  'Feature updates',
  'Technical support',
];

export default function RetailAutomation() {
  return (
    <div className="ra-page">
      <SEO
        title="Retail Automation & System Engineering"
        description="Structured automation systems for retail businesses. We design, build, and deploy operational workflows that reduce manual work and improve business visibility."
        canonicalPath="/retail-automation-system"
      />

      {/* ── Hero ── */}
      <section className="ra-hero">
        <div className="ra-container">
          <RevealWrapper>
            <span className="pill pill-dark"><span />Retail Automation</span>
          </RevealWrapper>
          <RevealWrapper delay={1}>
            <h1 className="ra-hero-title">Retail Automation<br />&amp; System Engineering</h1>
          </RevealWrapper>
          <RevealWrapper delay={2}>
            <p className="ra-hero-sub">
              Structured Automation Systems for Retail Operations<br />
              Built to Reduce Manual Work &amp; Improve Visibility
            </p>
          </RevealWrapper>
          <RevealWrapper delay={3}>
            <a href="#contact" className="btn-light ra-hero-cta">Request a Consultation</a>
          </RevealWrapper>
        </div>
      </section>

      {/* ── Overview ── */}
      <section id="about" className="ra-overview">
        <div className="ra-container">
          <RevealWrapper>
            <span className="pill"><span />Overview</span>
          </RevealWrapper>
          <RevealWrapper delay={1}>
            <h2 className="ra-overview-heading">
              Operational clarity<br />over added complexity.
            </h2>
          </RevealWrapper>
          <RevealWrapper delay={2}>
            <p className="ra-overview-body">
              At Montnexus, we work with retail businesses to design and implement structured
              automation systems that improve daily operations. We focus on removing repetitive
              manual work, improving data visibility, and building systems that your team can
              actually use — without exaggerated promises or unnecessary software.
            </p>
          </RevealWrapper>
        </div>
      </section>

      {/* ── Services Breakdown ── */}
      <section id="services" className="ra-services">
        <div className="ra-container">
          <RevealWrapper className="section-header">
            <span className="section-tag">What We Do</span>
            <h2 className="section-title">Our Services</h2>
            <p className="section-sub">Three core capabilities — operational automation, custom systems, and process integration.</p>
          </RevealWrapper>

          <div className="ra-services-grid">
            {services.map((svc, i) => (
              <RevealWrapper key={svc.number} delay={i + 1} className="ra-service-card">
                <div className="ra-service-number">{svc.number}</div>
                <h3 className="ra-service-title">{svc.title}</h3>
                <p className="ra-service-desc">{svc.description}</p>
                <ul className="ra-feature-list">
                  {svc.features.map((f) => (
                    <li key={f}>
                      <span className="ra-dot" aria-hidden="true" />
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
      <section id="how" className="ra-process">
        <div className="ra-container">
          <RevealWrapper className="section-header">
            <span className="section-tag">How We Work</span>
            <h2 className="section-title section-title--light">Implementation Process</h2>
            <p className="section-sub ra-process-sub">
              A structured six-stage approach — from understanding your operations to optimising your system.
            </p>
          </RevealWrapper>

          <div className="ra-process-grid">
            {processSteps.map((step, i) => (
              <RevealWrapper key={step.number} delay={(i % 3) + 1} className="ra-process-step">
                <div className="ra-process-num">{step.number}</div>
                <h4 className="ra-process-title">{step.title}</h4>
                <p className="ra-process-desc">{step.desc}</p>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Montnexus ── */}
      <section className="ra-why">
        <div className="ra-container">
          <RevealWrapper>
            <span className="pill"><span />Why Montnexus</span>
          </RevealWrapper>
          <RevealWrapper delay={1}>
            <h2 className="ra-why-heading">
              No exaggerated claims.<br />No unnecessary complexity.
            </h2>
          </RevealWrapper>
          <div className="ra-why-grid">
            {whyItems.map((item, i) => (
              <RevealWrapper key={item} delay={(i % 3) + 1} className="ra-why-item">
                <span className="ra-dot" aria-hidden="true" />
                <span>{item}</span>
              </RevealWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ── Maintenance ── */}
      <section className="ra-maintenance">
        <div className="ra-container">
          <RevealWrapper className="ra-maintenance-card">
            <span className="section-tag">Ongoing Support</span>
            <h2 className="ra-maintenance-title">Maintenance &amp; Support</h2>
            <p className="ra-maintenance-desc">
              Optional ongoing support plans to keep your automation systems running smoothly as your business evolves.
            </p>
            <ul className="ra-feature-list">
              {maintenanceItems.map((item) => (
                <li key={item}>
                  <span className="ra-dot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="ra-maintenance-note">Structured support ensures long-term stability.</p>
          </RevealWrapper>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="contact" className="ra-cta">
        <div className="ra-container">
          <RevealWrapper className="ra-cta-inner">
            <span className="pill pill-dark"><span />Let's Work Together</span>
            <h2 className="ra-cta-title">
              Ready to automate<br />your operations?
            </h2>
            <p className="ra-cta-sub">
              If you're a retail business looking to reduce manual work and build structured operational systems,
              we're ready to collaborate.
            </p>
            <a href="mailto:hello@montnexus.com" className="btn-light ra-cta-btn">
              hello@montnexus.com
            </a>
            <p className="ra-cta-location">India · Remote-first · UAE projects available</p>
          </RevealWrapper>
        </div>
      </section>
    </div>
  );
}
