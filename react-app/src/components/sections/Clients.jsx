import MarqueeTrack from '../ui/MarqueeTrack';
import { clientLogos } from '../../data/testimonials';
import './Clients.css';

export default function Clients() {
  return (
    <div className="logos-section" aria-label="Our clients">
      <MarqueeTrack
        items={clientLogos}
        speed="20s"
        gap="64px"
        masked={false}
        renderItem={(logo, i) => (
          <span key={`${logo}-${i}`} className="logo-item">
            {logo}
          </span>
        )}
      />
    </div>
  );
}
