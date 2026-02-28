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

function PageSkeleton() {
  return (
    <div className="dp-skeleton">
      {/* Hero skeleton — dark */}
      <div className="dp-skeleton__hero">
        <div className="dp-skeleton__tag" />
        <div className="dp-skeleton__headline" />
        <div className="dp-skeleton__sub" />
        <div className="dp-skeleton__sub dp-skeleton__sub--short" />
        <div className="dp-skeleton__ctas">
          <div className="dp-skeleton__btn" />
          <div className="dp-skeleton__btn dp-skeleton__btn--ghost" />
        </div>
      </div>
      {/* Light section skeleton */}
      <div className="dp-skeleton__section dp-skeleton__section--light">
        <div className="dp-skeleton__section-inner">
          <div className="dp-skeleton__tag dp-skeleton__tag--dark" />
          <div className="dp-skeleton__title dp-skeleton__title--dark" />
          <div className="dp-skeleton__grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="dp-skeleton__card dp-skeleton__card--light" />
            ))}
          </div>
        </div>
      </div>
      {/* Dark section skeleton */}
      <div className="dp-skeleton__section dp-skeleton__section--dark">
        <div className="dp-skeleton__section-inner">
          <div className="dp-skeleton__tag" />
          <div className="dp-skeleton__title" />
          <div className="dp-skeleton__grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="dp-skeleton__card" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DynamicPage({ slug: slugProp }) {
  const { slug: slugParam } = useParams();
  const slug = slugProp || slugParam;

  // Pass slug directly so the hook fetches the correct page without a race condition.
  // Previously, calling usePages() with no args triggered fetchPages() (all pages),
  // which completed fast and set loading=false + page=null → 404 flash.
  const { page, sections, loading, error } = usePages(slug ? { slug } : undefined);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !page) {
    return (
      <div className="dp-not-found">
        <h1>404</h1>
        <p>This page could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.meta_title || page.title}</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        {page.og_image_url && <meta property="og:image" content={page.og_image_url} />}
        <meta property="og:title" content={page.meta_title || page.title} />
      </Helmet>

      <div className="dp-page-enter">
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
