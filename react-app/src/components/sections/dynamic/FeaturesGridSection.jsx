import { Link } from 'react-router-dom';
import RevealWrapper from '../../ui/RevealWrapper';

export default function FeaturesGridSection({ content = {} }) {
  const { tag = '', title = '', body = '', items = [] } = content;
  const gridClass = items.length === 3 ? 'dp-features-grid dp-features-grid--3' : 'dp-features-grid';

  function renderItemLink(link, text = 'Explore Service →') {
    if (!link) return null;
    const isExternal = link.startsWith('http');
    const isHash = link.startsWith('#');
    if (isExternal || isHash) {
      return <a href={link} className="dp-feature-link">{text}</a>;
    }
    return <Link to={link} className="dp-feature-link">{text}</Link>;
  }

  return (
    <section className="dp-features">
      <div className="dp-container">
        {(tag || title) && (
          <RevealWrapper className="dp-section-header">
            {tag && <div className="dp-tag">{tag}</div>}
            {title && <h2 className="dp-section-title">{title}</h2>}
            {body && <p className="dp-section-body">{body}</p>}
          </RevealWrapper>
        )}

        <div className={gridClass}>
          {items.map((item, i) => (
            <RevealWrapper key={i} delay={i + 1} className="dp-feature-card">
              <div className="dp-feature-top">
                {item.number && <span className="dp-feature-number">{item.number}</span>}
                {item.tag && <span className="dp-feature-tag">{item.tag}</span>}
              </div>
              {item.title && <h3 className="dp-feature-title">{item.title}</h3>}
              {item.description && <p className="dp-feature-desc">{item.description}</p>}
              {item.features?.length > 0 && (
                <ul className="dp-feature-list">
                  {item.features.map((f, fi) => (
                    <li key={fi}>
                      <span className="dp-dot" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {renderItemLink(item.link)}
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
