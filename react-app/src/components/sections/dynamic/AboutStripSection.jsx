import RevealWrapper from '../../ui/RevealWrapper';

export default function AboutStripSection({ content = {} }) {
  const { tag = '', title = '', body = '', stats = [] } = content;
  const paragraphs = body ? body.split('\n\n').filter(Boolean) : [];

  return (
    <section className="dp-about">
      <div className="dp-container">
        <RevealWrapper className="dp-about-inner">
          <div>
            {tag && (
              <div className="dp-about-tag">
                <span className="dp-dot" aria-hidden="true" />
                {tag}
              </div>
            )}
            {title && <h2 className="dp-about-title">{title}</h2>}
          </div>
          <div>
            {paragraphs.map((p, i) => (
              <p key={i} className="dp-about-body">{p}</p>
            ))}
            {stats.length > 0 && (
              <div className="dp-about-stats">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <span className="dp-about-stat-val">{stat.number}</span>
                    <span className="dp-about-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </RevealWrapper>
      </div>
    </section>
  );
}
