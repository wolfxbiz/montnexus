import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import Contact from '../components/sections/Contact';
import './Services.css';

export default function Services() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_pages')
      .select('id, title, slug, meta_description')
      .eq('status', 'published')
      .neq('slug', 'home')
      .neq('slug', 'services')
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setPages(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Our Services | Montnexus</title>
        <meta name="description" content="Explore Montnexus services — retail automation systems, web design & development, and more." />
      </Helmet>

      {/* Hero */}
      <section className="srv-hero">
        <div className="srv-hero__inner">
          <span className="srv-hero__tag">What We Do</span>
          <h1 className="srv-hero__headline">OUR SERVICES</h1>
          <p className="srv-hero__sub">
            We build systems and digital experiences that help businesses grow.
            Explore our full range of services below.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="srv-grid">
        <div className="srv-grid__inner">
          {loading ? (
            <div className="srv-grid__loading">
              <div className="srv-spinner" />
            </div>
          ) : pages.length === 0 ? (
            <p className="srv-grid__empty">No services available yet.</p>
          ) : (
            <div className="srv-grid__cards">
              {pages.map((page, i) => (
                <Link key={page.id} to={`/${page.slug}`} className="srv-card">
                  <span className="srv-card__num">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="srv-card__title">{page.title}</h2>
                  {page.meta_description && (
                    <p className="srv-card__desc">{page.meta_description}</p>
                  )}
                  <span className="srv-card__cta">Learn More →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Contact />
    </>
  );
}
