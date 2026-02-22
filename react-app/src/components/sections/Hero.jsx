import { siteConfig } from '../../data/siteConfig';
import heroImg from '../../assets/arrowstar_seamless_neon_green_background_with_bold_abstract_bla_49054f64-175b-431a-9b5f-7a67b75ff0e6.png';
import logoWordmark from '../../assets/MNX Montnexus.png';
import './Hero.css';

export default function Hero() {
  return (
    <section id="hero">
      {/* Top-left brand stamp */}
      <div className="hero-brand" aria-hidden="true">
        <img src={logoWordmark} alt={siteConfig.name} className="hero-brand-logo" />
      </div>

      <div className="hero-grid">

        {/* LEFT — text content */}
        <div className="hero-left">
          <h1 className="hero-title">
            RETAIL<br />
            AUTOMATION<br />
            &amp; SYSTEM<br />
            ENGINEERING
          </h1>

          <p className="hero-sub">
            We design and implement custom automation systems for retail
            businesses looking to improve operational clarity and efficiency.
          </p>

          <div className="hero-cta">
            <a href="#contact" className="hero-btn-green">Start a Conversation</a>
            <a href="#services" className="hero-cta-ghost">See What We Do</a>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">2</div>
              <div className="hero-stat-label">Core Services</div>
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

        {/* RIGHT — image */}
        <div className="hero-right" aria-hidden="true">
          <img
            src={heroImg}
            alt=""
            className="hero-image"
          />
          <div className="hero-image-overlay" />
        </div>

      </div>
    </section>
  );
}
