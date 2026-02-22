import RevealWrapper from '../ui/RevealWrapper';
import { services } from '../../data/services';
import './Services.css';

function FlowVisual() {
  return (
    <div className="svc-visual flow-mock" aria-hidden="true">
      <div className="flow-node trigger">Inventory<br /><small>Input</small></div>
      <div className="flow-arrow">→</div>
      <div className="flow-node">Automation<br /><small>Process</small></div>
      <div className="flow-arrow">→</div>
      <div className="flow-node done">Report<br /><small>Output</small></div>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="svc-visual dashboard-mock" aria-hidden="true">
      <div className="dash-bar">
        <div className="b-dots"><span /><span /><span /></div>
        <div className="b-url">montnexus / retail-dashboard</div>
      </div>
      <div className="dash-body">
        <div className="dash-row">
          <div className="dash-metric">
            <div className="dash-metric-val">↑ 24%</div>
            <div className="dash-metric-label">Sales Visibility</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric-val">↓ 18%</div>
            <div className="dash-metric-label">Manual Work</div>
          </div>
        </div>
        <div className="dash-chart">
          {[40, 55, 60, 72, 68, 85].map((h, i) => (
            <div key={i} className={`dash-bar-col${i >= 4 ? ' active' : ''}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const visualMap = { flow: FlowVisual, dashboard: DashboardVisual };

export default function Services() {
  return (
    <section id="services">
      <div className="services-inner">
        <RevealWrapper className="services-header">
          <span className="pill pill-dark"><span />What We Do</span>
          <h2 className="services-title">Two things, done well.</h2>
          <p className="services-sub">
            We focus on two core capabilities — operational automation and custom system development.
            No broad agency promises. Just structured engineering for retail.
          </p>
        </RevealWrapper>

        <div className="svc-grid">
          {services.map((svc, i) => {
            const Visual = visualMap[svc.visual];
            return (
              <RevealWrapper key={svc.id} as="article" className="svc-card" delay={i}>
                <div className="svc-card-top">
                  <div className="svc-number">{svc.number}</div>
                  <div className="svc-tag">{svc.tag}</div>
                </div>
                <h3 className="svc-title">{svc.title}</h3>
                <p className="svc-desc">{svc.description}</p>
                <ul className="svc-features">
                  {svc.features.map((f) => (
                    <li key={f}>
                      <span className="svc-feature-dot" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" className="svc-btn">{svc.cta}</a>
                <Visual />
              </RevealWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}
