import RevealWrapper from '../ui/RevealWrapper';
import './About.css';

const stats = [
  { val: 'Early Stage', label: 'Building foundational retail automation infrastructure with select partners' },
  { val: 'India + UAE', label: 'Remote-first operations. UAE engagements available for structured projects' },
  { val: 'Select Partners', label: 'We work with a limited number of retail businesses during this growth phase' },
];

export default function About() {
  return (
    <section id="about">
      <div className="about-inner">

        <RevealWrapper className="about-split-header">
          <h2 className="about-headline">
            Operational clarity<br />over added<br /><em>complexity.</em>
          </h2>
          <div className="about-header-right">
            <span className="pill" style={{ marginBottom: 14, display: 'inline-flex' }}>
              <span />About
            </span>
            <p>
              Montnexus is a focused engineering team working on automation systems
              for retail businesses. We operate in the early stage of building
              long-term retail automation infrastructure.
            </p>
          </div>
        </RevealWrapper>

        <div className="about-layout">

          {/* Left: Manifesto card */}
          <RevealWrapper className="about-manifesto">
            <div>
              <div className="manifesto-eyebrow">Our approach</div>
              <p className="manifesto-text">
                Our current focus is working with select retail partners to design and
                implement <strong>structured digital workflows.</strong><br /><br />
                We believe operational clarity is more valuable than adding more software.<br /><br />
                <strong>No exaggerated claims. No unnecessary complexity.</strong><br />
                Just structured systems built with intention.
              </p>
            </div>
            <div className="manifesto-footer">
              {stats.map((s) => (
                <div key={s.val} className="manifesto-stat">
                  <span className="manifesto-stat-val">{s.val}</span>
                  <span className="manifesto-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </RevealWrapper>

          {/* Right: Current stage card */}
          <RevealWrapper className="about-stage" delay={1}>
            <div className="about-card-label">Current Stage</div>
            <p className="about-stage-desc">
              Montnexus is currently building foundational systems and working with
              early-stage retail partners.
            </p>
            <div className="stage-items">
              <div className="stage-item">
                <div className="stage-item-dot" aria-hidden="true" />
                <div>
                  <div className="stage-item-title">Private Limited Registration</div>
                  <div className="stage-item-sub">Formalizing our company structure</div>
                </div>
              </div>
              <div className="stage-item">
                <div className="stage-item-dot" aria-hidden="true" />
                <div>
                  <div className="stage-item-title">Reusable Automation Frameworks</div>
                  <div className="stage-item-sub">Building scalable retail solutions</div>
                </div>
              </div>
              <div className="stage-item">
                <div className="stage-item-dot" aria-hidden="true" />
                <div>
                  <div className="stage-item-title">Select Retail Partnerships</div>
                  <div className="stage-item-sub">Depth of execution over rapid expansion</div>
                </div>
              </div>
              <div className="stage-item">
                <div className="stage-item-dot" aria-hidden="true" />
                <div>
                  <div className="stage-item-title">Remote-First Operations</div>
                  <div className="stage-item-sub">India-based, UAE projects available</div>
                </div>
              </div>
            </div>
          </RevealWrapper>
        </div>

      </div>
    </section>
  );
}
