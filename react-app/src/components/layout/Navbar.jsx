import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteConfig } from '../../data/siteConfig';
import { supabase } from '../../lib/supabase';
import logoMonogram from '../../assets/MNX.png';
import logoGreen from '../../assets/MNX (1).png';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [servicePages, setServicePages] = useState([]);
  const dropdownRef = useRef(null);
  const close = () => { setOpen(false); setServicesOpen(false); setMobileServicesOpen(false); };
  const { pathname } = useLocation();

  useEffect(() => {
    supabase
      .from('site_pages')
      .select('id, title, slug')
      .eq('status', 'published')
      .neq('slug', 'home')
      .order('updated_at', { ascending: false })
      .then(({ data }) => setServicePages(data || []));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  return (
    <header>
      <nav aria-label="Main navigation">
        <Link to="/" className="nav-logo" aria-label={siteConfig.name} onClick={close}>
          <img src={logoMonogram} alt={siteConfig.name} className="nav-logo-img" />
          <img src={logoGreen} alt="" className="nav-logo-img nav-logo-img-green" aria-hidden="true" />
        </Link>

        {/* Desktop links */}
        <ul className="nav-links">
          <li><a href="/#about">About</a></li>

          {/* Services dropdown */}
          <li className="nav-dropdown" ref={dropdownRef}>
            <button
              className="nav-dropdown__trigger"
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen(o => !o)}
            >
              Services <span className={`nav-dropdown__caret${servicesOpen ? ' open' : ''}`}>▾</span>
            </button>
            {servicesOpen && (
              <div className="nav-dropdown__menu">
                {servicePages.map(p => (
                  <Link
                    key={p.id}
                    to={`/${p.slug}`}
                    className="nav-dropdown__item"
                    onClick={() => setServicesOpen(false)}
                  >
                    {p.title}
                  </Link>
                ))}
                <Link
                  to="/services"
                  className="nav-dropdown__item nav-dropdown__item--all"
                  onClick={() => setServicesOpen(false)}
                >
                  View All Services →
                </Link>
              </div>
            )}
          </li>

          <li><a href="/#how">How We Work</a></li>
          <li><Link to="/blog">Blog</Link></li>
        </ul>

        <div className="nav-right">
          <a href="/#contact" className="btn-primary">Get in Touch</a>
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
          <li><a href="/#about" onClick={close}>About</a></li>
          <li className="drawer-services">
            <button
              className="drawer-services__toggle"
              onClick={() => setMobileServicesOpen(o => !o)}
            >
              Services <span className={`nav-dropdown__caret${mobileServicesOpen ? ' open' : ''}`}>▾</span>
            </button>
            {mobileServicesOpen && (
              <div className="drawer-services__sub">
                {servicePages.map(p => (
                  <Link key={p.id} to={`/${p.slug}`} onClick={close}>{p.title}</Link>
                ))}
                <Link to="/services" onClick={close} style={{ fontWeight: 700, color: '#92D108' }}>
                  View All Services →
                </Link>
              </div>
            )}
          </li>
          <li><a href="/#how" onClick={close}>How We Work</a></li>
          <li><Link to="/blog" onClick={close}>Blog</Link></li>
          <li><a href="/#contact" className="drawer-cta" onClick={close}>Get in Touch</a></li>
        </ul>
      </div>

      {/* Backdrop */}
      {open && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}
    </header>
  );
}
