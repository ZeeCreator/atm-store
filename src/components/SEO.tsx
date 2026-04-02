'use client';

import { useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
}: SEOProps) {
  const { seoSettings, getSEOSettings } = useSEO();

  useEffect(() => {
    if (!seoSettings) return;

    const seo = getSEOSettings({
      title,
      description,
      keywords,
      image,
      url,
      type,
      publishedTime,
      modifiedTime,
      tags,
    });

    // Set document title
    document.title = seo.title;

    // Create or update meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    setMetaTag('description', seo.description);
    setMetaTag('keywords', seo.keywords);
    setMetaTag('author', seoSettings.organizationName);
    setMetaTag('robots', seoSettings.robotsAllow ? 'index, follow' : 'noindex, nofollow');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.url || seoSettings.siteUrl);

    // Open Graph meta tags
    setMetaTag('og:title', seo.title, true);
    setMetaTag('og:description', seo.description, true);
    setMetaTag('og:image', seo.image, true);
    setMetaTag('og:image:alt', seo.title, true);
    setMetaTag('og:url', seo.url || seoSettings.siteUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', seoSettings.siteName, true);

    // Article specific OG tags
    if (type === 'article') {
      if (publishedTime) {
        setMetaTag('article:published_time', publishedTime, true);
      }
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          setMetaTag('article:tag', tag, true);
        });
      }
    }

    // Twitter Card meta tags
    setMetaTag('twitter:card', seoSettings.twitterCard);
    setMetaTag('twitter:title', seo.title);
    setMetaTag('twitter:description', seo.description);
    setMetaTag('twitter:image', seo.image);
    if (seoSettings.twitterSite) {
      setMetaTag('twitter:site', seoSettings.twitterSite);
    }
    if (seoSettings.twitterCreator) {
      setMetaTag('twitter:creator', seoSettings.twitterCreator);
    }

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.setAttribute('rel', 'icon');
      favicon.setAttribute('href', '/favicon.ico');
      document.head.appendChild(favicon);
    }

    // Apple Touch Icon
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.setAttribute('rel', 'apple-touch-icon');
      appleIcon.setAttribute('sizes', '180x180');
      appleIcon.setAttribute('href', '/apple-touch-icon.png');
      document.head.appendChild(appleIcon);
    }

    // Manifest
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.setAttribute('rel', 'manifest');
      manifest.setAttribute('href', '/manifest.json');
      document.head.appendChild(manifest);
    }

    // Theme color
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColor);
    }
    themeColor.setAttribute('content', '#ef4444');

    // Structured Data / Schema.org JSON-LD
    const addStructuredData = () => {
      // Remove existing structured data
      const existing = document.getElementById('structured-data');
      if (existing) {
        existing.remove();
      }

      const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': seoSettings.organizationUrl + '#organization',
            name: seoSettings.organizationName,
            url: seoSettings.organizationUrl,
            logo: {
              '@type': 'ImageObject',
              url: seoSettings.organizationLogo.includes('http') 
                ? seoSettings.organizationLogo 
                : seoSettings.siteUrl + seoSettings.organizationLogo,
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: seoSettings.organizationContactPhone,
              contactType: 'customer service',
              email: seoSettings.organizationContactEmail,
            },
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Jl. Urip Sumoharjo No.11',
              addressLocality: 'Madiun',
              addressRegion: 'Jawa Timur',
              postalCode: '63131',
              addressCountry: 'ID',
            },
          },
          {
            '@type': 'WebSite',
            '@id': seoSettings.siteUrl + '#website',
            name: seoSettings.siteName,
            url: seoSettings.siteUrl,
            description: seoSettings.siteDescription,
            inLanguage: 'id-ID',
            publisher: {
              '@id': seoSettings.organizationUrl + '#organization',
            },
          },
          {
            '@type': 'WebPage',
            '@id': seo.url || seoSettings.siteUrl + '#webpage',
            name: seo.title,
            description: seo.description,
            inLanguage: 'id-ID',
            isPartOf: {
              '@id': seoSettings.siteUrl + '#website',
            },
          },
        ],
      };

      // Add LocalBusiness schema if on homepage
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        (structuredData['@graph'] as any[]).push({
          '@type': 'AutoPartsStore',
          '@id': seoSettings.siteUrl + '#business',
          name: seoSettings.organizationName,
          image: {
            '@type': 'ImageObject',
            url: seoSettings.siteUrl + seoSettings.siteLogo,
          },
          url: seoSettings.siteUrl,
          telephone: seoSettings.organizationContactPhone,
          email: seoSettings.organizationContactEmail,
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Jl. Urip Sumoharjo No.11, Nambangan Kidul',
            addressLocality: 'Manguharjo',
            addressRegion: 'Kota Madiun',
            postalCode: '63131',
            addressCountry: 'ID',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: -7.6265739,
            longitude: 111.5011128,
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
              opens: '09:00',
              closes: '17:00',
            },
          ],
          priceRange: '$$',
        });
      }

      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    };

    addStructuredData();

    // Cleanup function
    return () => {
      // Meta tags are kept as they're useful across page navigation
    };
  }, [seoSettings, title, description, keywords, image, url, type, publishedTime, modifiedTime, tags]);

  return null; // This component doesn't render anything visible
}
