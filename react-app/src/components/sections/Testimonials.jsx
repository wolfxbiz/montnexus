import MarqueeTrack from '../ui/MarqueeTrack';
import RevealWrapper from '../ui/RevealWrapper';
import { testimonials, featuredQuote } from '../../data/testimonials';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <>
      <section id="testimonials">
        <div className="testi-inner">
          <RevealWrapper className="section-header">
            <span className="pill"><span />Testimonials</span>
            <h2 className="section-title" style={{ marginTop: 16 }}>
              What clients say
            </h2>
          </RevealWrapper>

          <div className="testi-marquee">
            <MarqueeTrack
              items={testimonials}
              speed="28s"
              gap="20px"
              masked={true}
              renderItem={(t, i) => (
                <article key={`${t.id}-${i}`} className={`testi-card${i % 2 === 1 ? ' testi-card--alt' : ''}`}>
                  <div className="testi-head">
                    <div className="testi-avatar" aria-hidden="true">{t.initial}</div>
                    <div>
                      <div className="testi-name">{t.name}</div>
                      <div className="testi-role">{t.role}</div>
                    </div>
                  </div>
                  <p className="testi-text">{t.text}</p>
                </article>
              )}
            />
          </div>
        </div>
      </section>

      <FeaturedQuote />
    </>
  );
}

function FeaturedQuote() {
  const { text, highlightPhrase, author } = featuredQuote;
  const parts = text.split(highlightPhrase);

  return (
    <div className="featured-quote-wrapper">
      <div className="featured-quote">
        <blockquote>
          {parts[0]}
          <em className="highlight">{highlightPhrase}</em>
          {parts[1]}
        </blockquote>
        <footer className="quote-author">
          <div className="quote-avatar" aria-hidden="true">{author.initial}</div>
          <div>
            <div className="quote-name">{author.name}</div>
            <div className="quote-title">{author.title}</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
