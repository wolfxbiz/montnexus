import SEO from './seo/SEO';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Services from './components/sections/Services';
import HowItWorks from './components/sections/HowItWorks';
import WhyUs from './components/sections/WhyUs';
import Contact from './components/sections/Contact';

export default function App() {
  return (
    <>
      <SEO />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <WhyUs />
      </main>
      <Contact />
    </>
  );
}
