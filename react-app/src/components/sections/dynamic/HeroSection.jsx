import { Link } from 'react-router-dom';

export default function HeroSection({ content = {} }) {
  const {
    tag = '',
    headline = '',
    subheadline = '',
    cta_primary = {},
    cta_secondary = {},
    stats = [],
  } = content;

  function renderCTA(cta, className) {
    if (!cta?.text) return null;
    const isExternal = cta.link?.startsWith('http');
    const isHash = cta.link?.startsWith('#');
    if (isExternal || isHash) {
      return <a href={cta.link} className={className}>{cta.text}</a>;
    }
    return <Link to={cta.link || '/'} className={className}>{cta.text}</Link>;
  }

  return (
    <section className="dp-hero">
      <div className="dp-hero-inner page-hero-enter">
        {tag && <div className="dp-hero-tag">{tag}</div>}

        <h1 className="dp-hero-title">{headline}</h1>

        {subheadline && <p className="dp-hero-sub">{subheadline}</p>}

        {(cta_primary?.text || cta_secondary?.text) && (
          <div className="dp-hero-cta">
            {renderCTA(cta_primary, 'dp-btn-primary')}
            {renderCTA(cta_secondary, 'dp-btn-ghost')}
          </div>
        )}

        {stats.length > 0 && (
          <div className="dp-hero-stats">
            {stats.map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div className="dp-hero-stat-divider" />}
                <div className="dp-hero-stat">
                  <div className="dp-hero-stat-value">{stat.number}</div>
                  <div className="dp-hero-stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
