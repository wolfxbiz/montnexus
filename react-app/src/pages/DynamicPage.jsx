import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePages } from '../hooks/usePages';
import Contact from '../components/sections/Contact';
import HeroSection from '../components/sections/dynamic/HeroSection';
import FeaturesGridSection from '../components/sections/dynamic/FeaturesGridSection';
import ServicesGridSection from '../components/sections/dynamic/ServicesGridSection';
import ProcessStepsSection from '../components/sections/dynamic/ProcessStepsSection';
import AboutStripSection from '../components/sections/dynamic/AboutStripSection';
import CtaBannerSection from '../components/sections/dynamic/CtaBannerSection';
import TextContentSection from '../components/sections/dynamic/TextContentSection';
import '../styles/DynamicPage.css';

const SECTION_MAP = {
  hero:          HeroSection,
  features_grid: FeaturesGridSection,
  services_grid: ServicesGridSection,
  process_steps: ProcessStepsSection,
  about_strip:   AboutStripSection,
  cta_banner:    CtaBannerSection,
  text_content:  TextContentSection,
};

export default function DynamicPage({ slug: slugProp }) {
  const { slug: slugParam } = useParams();
  const slug = slugProp || slugParam;

  const { page, sections, loading, error, fetchPageBySlug } = usePages();

  useEffect(() => {
    if (slug) fetchPageBySlug(slug);
  }, [slug, fetchPageBySlug]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(0,0,0,0.08)', borderTopColor: 'var(--primary, #92D108)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="dp-not-found">
        <h1>404</h1>
        <p>This page could not be found.</p>
      </div>
    );
  }

  const siteName = document.documentElement.style.getPropertyValue('--site-name') || 'Montnexus';

  return (
    <>
      <Helmet>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        {page.og_image_url && <meta property="og:image" content={page.og_image_url} />}
        <meta property="og:title" content={page.meta_title || page.title} />
      </Helmet>

      <div>
        {sections.map((section) => {
          const Component = SECTION_MAP[section.section_type];
          if (!Component) return null;
          return <Component key={section.id} content={section.content} />;
        })}
        <Contact />
      </div>
    </>
  );
}
