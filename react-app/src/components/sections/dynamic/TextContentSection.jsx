import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import RevealWrapper from '../../ui/RevealWrapper';

export default function TextContentSection({ content = {} }) {
  const { tag = '', title = '', body = '' } = content;

  return (
    <section className="dp-text">
      <div className="dp-container">
        <div className="dp-text-inner">
          {tag && (
            <RevealWrapper>
              <div className="dp-about-tag" style={{ marginBottom: 20 }}>
                <span className="dp-dot" aria-hidden="true" />
                {tag}
              </div>
            </RevealWrapper>
          )}
          {title && (
            <RevealWrapper delay={1}>
              <h2 className="dp-about-title" style={{ marginBottom: 24 }}>{title}</h2>
            </RevealWrapper>
          )}
          {body && (
            <RevealWrapper delay={2} className="dp-text-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </RevealWrapper>
          )}
        </div>
      </div>
    </section>
  );
}
