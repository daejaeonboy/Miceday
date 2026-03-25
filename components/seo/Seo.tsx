import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_OG_IMAGE,
  INDEX_ROBOTS,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  absoluteUrl,
  serializeJsonLd,
} from '../../src/seo';

interface SeoProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  robots?: string;
  type?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export const Seo: React.FC<SeoProps> = ({
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  canonical = '/',
  image = DEFAULT_OG_IMAGE,
  robots = INDEX_ROBOTS,
  type = 'website',
  jsonLd,
}) => {
  const canonicalUrl = absoluteUrl(canonical);
  const imageUrl = absoluteUrl(image);
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={robots} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="ko_KR" />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.map((schema, index) => (
        <script key={`json-ld-${index}`} type="application/ld+json">
          {serializeJsonLd(schema)}
        </script>
      ))}
    </Helmet>
  );
};
