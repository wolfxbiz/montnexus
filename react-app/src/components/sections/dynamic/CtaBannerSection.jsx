import RevealWrapper from '../../ui/RevealWrapper';

export default function CtaBannerSection({ content = {} }) {
  const { headline = '', body = '', cta_text = '', cta_link = '#contact', email = '' } = content;

  return (
    <section className="dp-cta">
      <div className="dp-container">
        <RevealWrapper className="dp-cta-inner">
          {headline && <h2 className="dp-cta-headline">{headline}</h2>}
          {body && <p className="dp-cta-body">{body}</p>}
          <div className="dp-cta-actions">
            {cta_text && (
              <a href={cta_link} className="dp-btn-light">{cta_text}</a>
            )}
          </div>
          {email && (
            <p className="dp-cta-email">
              Or email us at <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
        </RevealWrapper>
      </div>
    </section>
  );
}
