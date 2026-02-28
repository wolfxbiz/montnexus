import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Contact from '../components/sections/Contact';
import './AboutPage.css';

const STATS = [
  { number: '50+', label: 'Projects Delivered' },
  { number: '5+', label: 'Years Experience' },
  { number: '98%', label: 'Client Satisfaction' },
  { number: '3', label: 'Countries Served' },
];

const VALUES = [
  {
    number: '01',
    title: 'Engineering First',
    description:
      'We approach every project as an engineering problem — identifying root causes, designing scalable solutions, and validating with data before we build.',
  },
  {
    number: '02',
    title: 'Clarity Over Complexity',
    description:
      'Systems should be simple enough to operate, maintain, and grow. We strip away unnecessary complexity so you can focus on running your business.',
  },
  {
    number: '03',
    title: 'Long-Term Partnership',
    description:
      'We measure success by the impact our solutions have months and years after launch — not just at delivery. Our clients stay because results last.',
  },
];

const PROCESS = [
  {
    number: '01',
    title: 'Discovery',
    description:
      'We start by deeply understanding your business, your goals, and the problems that are holding you back.',
  },
  {
    number: '02',
    title: 'Strategy',
    description:
      'We design a solution architecture and delivery roadmap tailored to your specific requirements and budget.',
  },
  {
    number: '03',
    title: 'Build',
    description:
      'Our engineers develop and test the system rigorously, keeping you updated at every milestone along the way.',
  },
  {
    number: '04',
    title: 'Launch & Support',
    description:
      'We deploy, train your team, and provide ongoing support to ensure long-term success after go-live.',
  },
];

export default function AboutPage() {
  return (
    <div className="page-enter">
      <Helmet>
        <title>About Us | Montnexus</title>
        <meta
          name="description"
          content="Learn about Montnexus — a team of engineers building retail automation systems and digital experiences that help businesses scale."
        />
      </Helmet>

      {/* ── Hero ── */}
      <section className="abt-hero">
        <div className="abt-hero__inner page-hero-enter">
          <span className="abt-tag">Our Story</span>
          <h1 className="abt-hero__headline">BUILT TO ENGINEER GROWTH</h1>
          <p className="abt-hero__sub">
            Montnexus is a technology company focused on retail automation and
            digital experiences. We help businesses scale through intelligent
            systems and purposeful design.
          </p>
          <div className="abt-hero__ctas">
            <Link to="/services" className="abt-btn-primary">Our Services</Link>
            <Link to="/contact" className="abt-btn-ghost">Get in Touch</Link>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="abt-story">
        <div className="abt-story__inner">
          <div className="abt-story__text">
            <span className="abt-tag abt-tag--dark">Who We Are</span>
            <h2 className="abt-story__title">Engineering That Moves Businesses Forward</h2>
            <p className="abt-story__body">
              We are a team of engineers, designers, and strategists who believe
              technology should work for businesses — not the other way around.
            </p>
            <p className="abt-story__body">
              From retail automation systems that streamline operations to web
              experiences that convert visitors into customers, we build solutions
              that create real, measurable impact.
            </p>
            <p className="abt-story__body">
              Every system we build is designed with one goal: to make your
              business run better.
            </p>
          </div>
          <div className="abt-story__stats">
            {STATS.map(s => (
              <div key={s.label} className="abt-stat">
                <span className="abt-stat__number">{s.number}</span>
                <span className="abt-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="abt-values">
        <div className="abt-values__inner">
          <div className="abt-values__header">
            <span className="abt-tag">What Drives Us</span>
            <h2 className="abt-values__title">Our Core Values</h2>
          </div>
          <div className="abt-values__grid">
            {VALUES.map(v => (
              <div key={v.number} className="abt-value-card">
                <span className="abt-value-card__num">{v.number}</span>
                <h3 className="abt-value-card__title">{v.title}</h3>
                <p className="abt-value-card__desc">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="abt-process">
        <div className="abt-process__inner">
          <div className="abt-process__header">
            <span className="abt-tag abt-tag--dark">How We Work</span>
            <h2 className="abt-process__title">Our Approach</h2>
            <p className="abt-process__sub">
              A structured process that ensures every project delivers real results.
            </p>
          </div>
          <div className="abt-process__grid">
            {PROCESS.map(step => (
              <div key={step.number} className="abt-step">
                <span className="abt-step__num">{step.number}</span>
                <h3 className="abt-step__title">{step.title}</h3>
                <p className="abt-step__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="abt-cta">
        <div className="abt-cta__inner">
          <h2 className="abt-cta__headline">Ready to Work Together?</h2>
          <p className="abt-cta__body">
            Tell us about your business and we will engineer a solution that fits.
          </p>
          <Link to="/contact" className="abt-btn-primary">Start a Project</Link>
        </div>
      </section>

      <Contact />
    </div>
  );
}
