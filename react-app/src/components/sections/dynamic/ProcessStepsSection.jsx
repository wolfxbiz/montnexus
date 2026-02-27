import RevealWrapper from '../../ui/RevealWrapper';

export default function ProcessStepsSection({ content = {} }) {
  const { tag = '', title = '', body = '', steps = [] } = content;

  return (
    <section className="dp-process">
      <div className="dp-container">
        {(tag || title) && (
          <RevealWrapper className="dp-section-header">
            {tag && <div className="dp-tag" style={{ color: 'var(--primary)' }}>{tag}</div>}
            {title && <h2 className="dp-section-title dp-section-title--dark">{title}</h2>}
            {body && <p className="dp-section-body" style={{ color: 'rgba(255,255,255,0.4)' }}>{body}</p>}
          </RevealWrapper>
        )}

        <div className="dp-process-grid">
          {steps.map((step, i) => (
            <RevealWrapper key={i} delay={(i % 3) + 1} className="dp-process-step">
              {step.number && <div className="dp-process-num">{step.number}</div>}
              {step.title && <h4 className="dp-process-title">{step.title}</h4>}
              {step.description && <p className="dp-process-desc">{step.description}</p>}
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
