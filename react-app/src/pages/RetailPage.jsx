import SEO from '../seo/SEO';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Services from '../components/sections/Services';
import HowItWorks from '../components/sections/HowItWorks';
import WhyUs from '../components/sections/WhyUs';
import Contact from '../components/sections/Contact';
import './RetailPage.css';

export default function RetailPage() {
  return (
    <div className="retail-page">
      <SEO
        title="Retail Automation & System Engineering"
        description="Structured automation systems for retail businesses. We analyze workflows, build custom systems, and deploy automation that reduces manual work and improves operational visibility."
        canonicalPath="/retail-automation-system"
      />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <WhyUs />
      </main>
      <Contact />
    </div>
  );
}
