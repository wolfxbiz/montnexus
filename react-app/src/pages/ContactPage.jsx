import { Helmet } from 'react-helmet-async';
import Contact from '../components/sections/Contact';
import './ContactPage.css';

const INFO = [
  {
    number: '01',
    title: 'Free Consultation',
    description:
      'Not sure what you need? Book a free 30-minute discovery call and we will help you figure out the best path forward.',
    tag: 'Quick Chat',
  },
  {
    number: '02',
    title: 'Start a Project',
    description:
      'Have a clear scope? Share the details and we will send you a proposal within 48 hours.',
    tag: 'Project',
  },
  {
    number: '03',
    title: 'Retainer Support',
    description:
      'Need ongoing development or maintenance? We offer monthly retainer plans for long-term partnerships.',
    tag: 'Ongoing',
  },
];

export default function ContactPage() {
  return (
    <>
      <Helmet>
        <title>Contact Us | Montnexus</title>
        <meta
          name="description"
          content="Get in touch with Montnexus. We respond within 24 hours and are ready to discuss your retail automation or web development project."
        />
      </Helmet>

      {/* ── Hero ── */}
      <section className="ctp-hero">
        <div className="ctp-hero__inner">
          <span className="ctp-tag">Get In Touch</span>
          <h1 className="ctp-hero__headline">LET'S TALK ABOUT YOUR PROJECT</h1>
          <p className="ctp-hero__sub">
            Whether you need a retail automation system or a complete digital
            presence, we are ready to help. Reach out and let us start the
            conversation.
          </p>
          <div className="ctp-hero__stats">
            <div className="ctp-stat">
              <span className="ctp-stat__number">24h</span>
              <span className="ctp-stat__label">Response Time</span>
            </div>
            <div className="ctp-stat__divider" />
            <div className="ctp-stat">
              <span className="ctp-stat__number">50+</span>
              <span className="ctp-stat__label">Projects Done</span>
            </div>
            <div className="ctp-stat__divider" />
            <div className="ctp-stat">
              <span className="ctp-stat__number">3</span>
              <span className="ctp-stat__label">Countries Served</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ways to connect ── */}
      <section className="ctp-ways">
        <div className="ctp-ways__inner">
          <div className="ctp-ways__header">
            <span className="ctp-tag ctp-tag--dark">Ways to Connect</span>
            <h2 className="ctp-ways__title">How We Can Help</h2>
            <p className="ctp-ways__sub">Choose the right engagement model for your project.</p>
          </div>
          <div className="ctp-ways__grid">
            {INFO.map(item => (
              <div key={item.number} className="ctp-way-card">
                <div className="ctp-way-card__header">
                  <span className="ctp-way-card__num">{item.number}</span>
                  <span className="ctp-way-card__tag">{item.tag}</span>
                </div>
                <h3 className="ctp-way-card__title">{item.title}</h3>
                <p className="ctp-way-card__desc">{item.description}</p>
                <a href="#contact" className="ctp-way-card__cta">Get Started →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact form (existing component) ── */}
      <Contact />
    </>
  );
}
