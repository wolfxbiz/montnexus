import RevealWrapper from '../ui/RevealWrapper';
import './WhyUs.css';

const criteria = [
  {
    title: 'Visibility over operations',
    desc: 'You want a clearer picture of inventory, sales, and staff activity — without relying on manual spreadsheets.',
    icon: '01',
  },
  {
    title: 'Exploring automation',
    desc: 'You know repetitive tasks are slowing your team down and you\'re ready to explore structured, practical solutions.',
    icon: '02',
  },
  {
    title: 'Open to structured systems',
    desc: 'You\'re willing to document and improve your processes — not just add more software on top of broken workflows.',
    icon: '03',
  },
  {
    title: 'Custom over generic software',
    desc: 'You\'ve tried off-the-shelf tools that don\'t quite fit and you prefer something built around how you actually operate.',
    icon: '04',
  },
];

export default function WhyUs() {
  return (
    <section id="why">
      <div className="why-inner">
        <RevealWrapper className="section-header">
          <span className="pill"><span />Who Should Contact Us</span>
          <h2 className="section-title" style={{ marginTop: 16 }}>
            Retail businesses ready to<br />operate with clarity.
          </h2>
          <p className="section-sub">
            We work best with owners who value structured improvement over quick fixes.
          </p>
        </RevealWrapper>

        <div className="why-grid">
          {criteria.map((item, i) => (
            <RevealWrapper key={item.icon} as="article" className="why-card" delay={(i % 2) + 1}>
              <div className="why-card-num">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </RevealWrapper>
          ))}
        </div>

        <RevealWrapper className="why-cta-row">
          <p className="why-cta-text">
            If this describes your business, we&rsquo;d like to have a conversation.
          </p>
          <a href="#contact" className="btn-primary">Get in Touch</a>
        </RevealWrapper>
      </div>
    </section>
  );
}
