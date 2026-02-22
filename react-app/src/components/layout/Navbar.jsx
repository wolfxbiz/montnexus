import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import logoMonogram from '../../assets/MNX.png';
import logoGreen from '../../assets/MNX (1).png';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { pathname } = useLocation();

  // True when on any dedicated service page (not the home page)
  const isServicePage =
    pathname === '/web-design-development' ||
    pathname === '/retail-automation-system';

  // Hash links scroll to sections on the current page when already on a
  // service page, otherwise they navigate to the matching home-page section.
  const href = (hash) => isServicePage ? `#${hash}` : `/#${hash}`;

  // 4th nav slot: cross-link to the OTHER service page.
  // Home + Retail Automation page → Web Design & Development
  // Web Design & Development page  → Retail Automation & System
  const serviceLink =
    pathname === '/web-design-development'
      ? { to: '/retail-automation-system', label: 'Retail Automation & System' }
      : { to: '/web-design-development',   label: 'Web Design & Development'   };

  return (
    <header>
      <nav aria-label="Main navigation">
        <Link to="/" className="nav-logo" aria-label={siteConfig.name} onClick={close}>
          <img src={logoMonogram} alt={siteConfig.name} className="nav-logo-img" />
          <img src={logoGreen} alt="" className="nav-logo-img nav-logo-img-green" aria-hidden="true" />
        </Link>

        {/* Desktop links */}
        <ul className="nav-links">
          <li><a href={href('about')}>About</a></li>
          <li><a href={href('services')}>Services</a></li>
          <li><a href={href('how')}>How We Work</a></li>
          <li><Link to={serviceLink.to}>{serviceLink.label}</Link></li>
        </ul>

        <div className="nav-right">
          <a href={href('contact')} className="btn-primary">Get in Touch</a>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`nav-burger${open ? ' open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <ul>
          <li><a href={href('about')} onClick={close}>About</a></li>
          <li><a href={href('services')} onClick={close}>Services</a></li>
          <li><a href={href('how')} onClick={close}>How We Work</a></li>
          <li><Link to={serviceLink.to} onClick={close}>{serviceLink.label}</Link></li>
          <li><a href={href('contact')} className="drawer-cta" onClick={close}>Get in Touch</a></li>
        </ul>
      </div>

      {/* Backdrop */}
      {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
    </header>
  );
}
