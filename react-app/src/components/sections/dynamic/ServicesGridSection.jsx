import RevealWrapper from '../../ui/RevealWrapper';

export default function ServicesGridSection({ content = {} }) {
  const { tag = '', title = '', body = '', services = [] } = content;

  return (
    <section className="dp-services">
      <div className="dp-container">
        {(tag || title) && (
          <RevealWrapper className="dp-section-header">
            {tag && <div className="dp-tag">{tag}</div>}
            {title && <h2 className="dp-section-title">{title}</h2>}
            {body && <p className="dp-section-body">{body}</p>}
          </RevealWrapper>
        )}

        <div className="dp-services-grid">
          {services.map((svc, i) => (
            <RevealWrapper key={i} delay={i + 1} className="dp-service-card">
              {svc.number && <div className="dp-service-number">{svc.number}</div>}
              {svc.title && <h3 className="dp-service-title">{svc.title}</h3>}
              {svc.description && <p className="dp-service-desc">{svc.description}</p>}
              {svc.features?.length > 0 && (
                <ul className="dp-service-list">
                  {svc.features.map((f, fi) => (
                    <li key={fi}>
                      <span className="dp-dot" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
