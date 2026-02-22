import { useState } from 'react';
import RevealWrapper from '../ui/RevealWrapper';
import { faqItems } from '../../data/faqItems';
import './FAQ.css';

export default function FAQ() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <section id="faq">
      <div className="faq-inner">
        <RevealWrapper className="section-header">
          <span className="pill"><span />FAQ</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>
            Frequently asked questions
          </h2>
        </RevealWrapper>

        <div className="faq-list" role="list">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`faq-item${isOpen ? ' open' : ''}`}
                role="listitem"
              >
                <button
                  className="faq-q"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-answer`}
                >
                  {item.question}
                  <span className="faq-arrow" aria-hidden="true">+</span>
                </button>
                <div
                  id={`${item.id}-answer`}
                  className="faq-a"
                  role="region"
                  aria-hidden={!isOpen}
                >
                  {item.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
