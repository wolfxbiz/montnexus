import { useState } from 'react';
import { siteConfig } from '../../data/siteConfig';
import logoMonogram from '../../assets/MNX.png';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header>
      <nav aria-label="Main navigation">
        <a href="#" className="nav-logo" aria-label={siteConfig.name} onClick={close}>
          <img src={logoMonogram} alt={siteConfig.name} className="nav-logo-img" />
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#how">How We Work</a></li>
        </ul>

        <div className="nav-right">
          <a href="#contact" className="btn-primary">Get in Touch</a>
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
          <li><a href="#about" onClick={close}>About</a></li>
          <li><a href="#services" onClick={close}>Services</a></li>
          <li><a href="#how" onClick={close}>How We Work</a></li>
          <li><a href="#contact" className="drawer-cta" onClick={close}>Get in Touch</a></li>
        </ul>
      </div>

      {/* Backdrop */}
      {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
    </header>
  );
}
