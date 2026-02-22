import RevealWrapper from '../ui/RevealWrapper';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    label: 'Operational Review',
    tag: 'Step 1',
    desc: 'We sit with you — virtually or on-site — and understand your current retail process end-to-end. No assumptions, no templated solutions.',
    chips: ['Process walkthrough', 'Tool audit', 'Team workflow review', 'Pain point mapping'],
  },
  {
    number: '02',
    label: 'Friction Mapping',
    tag: 'Step 2',
    desc: 'We identify exactly where time is lost, where data gets unclear, and where staff coordination breaks down. You see the analysis before we move forward.',
    chips: ['Bottleneck identification', 'Data flow review', 'Manual task inventory', 'Priority ranking'],
  },
  {
    number: '03',
    label: 'System Design',
    tag: 'Step 3',
    desc: 'We propose a structured automation plan specific to your business — not a generic software recommendation. You approve the direction before we build.',
    chips: ['Workflow architecture', 'Tool selection', 'Integration planning', 'Timeline estimate'],
  },
  {
    number: '04',
    label: 'Implementation',
    tag: 'Step 4',
    desc: 'We build and integrate the solution into your daily operations. You receive full documentation, training, and continued support after delivery.',
    chips: ['System build', 'Staff onboarding', 'Documentation', 'Post-launch support'],
  },
];

export default function HowItWorks() {
  return (
    <section id="how">
      <div className="how-inner">
        <RevealWrapper className="how-header">
          <span className="pill pill-dark"><span />How We Work</span>
          <h2>A clear process.<br />No surprises.</h2>
          <p>We work with select retail partners during this early growth phase.</p>
        </RevealWrapper>

        <div className="timeline" role="list">
          {steps.map((step, i) => (
            <RevealWrapper key={step.number} as="div" className="tl-item" delay={Math.min(i, 3)} role="listitem">
              <div className="tl-dot" aria-hidden="true">
                <span className="tl-dot-num">{step.number}</span>
              </div>
              <div className="tl-content">
                <div className="tl-top">
                  <span className="tl-label">{step.label}</span>
                  <span className="tl-tag">{step.tag}</span>
                </div>
                <p className="tl-desc">{step.desc}</p>
                <div className="tl-chips">
                  {step.chips.map((chip) => (
                    <span key={chip} className="tl-chip">
                      <span className="tl-chip-dot" aria-hidden="true" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </RevealWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
