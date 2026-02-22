import { Helmet } from 'react-helmet-async';
import { siteConfig } from '../data/siteConfig';

export default function SEO({
  title,
  description,
  canonicalPath = '/',
  ogImage,
}) {
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.tagline}`;

  const metaDescription = description || siteConfig.description;
  const canonicalUrl = `${siteConfig.url}${canonicalPath}`;
  const ogImg = ogImage || `${siteConfig.url}${siteConfig.openGraph.image}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/favicon.ico`,
    email: siteConfig.email,
    description: metaDescription,
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.facebook,
      siteConfig.social.instagram,
    ],
    areaServed: ['IN', 'AE'],
  };

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="index, follow" />

      {/* OpenGraph */}
      <meta property="og:type" content={siteConfig.openGraph.type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:locale" content={siteConfig.openGraph.locale} />
      <meta property="og:site_name" content={siteConfig.name} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={siteConfig.twitterCard.card} />
      <meta name="twitter:site" content={siteConfig.twitterCard.site} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImg} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
