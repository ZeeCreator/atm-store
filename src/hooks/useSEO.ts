import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { defaultSEOSettings, type SEOSettings } from '@/types/seo';

interface SEOPageSettings {
  title: string;
  description: string;
  keywords: string;
  image: string;
  url: string;
  type: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export function useSEO() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seoRef = ref(db, 'seo');
    const unsubscribe = onValue(seoRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSeoSettings({ ...defaultSEOSettings, ...data });
      } else {
        setSeoSettings(defaultSEOSettings);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getSEOSettings = (pageSettings?: Partial<SEOPageSettings>): SEOPageSettings => {
    if (!seoSettings) {
      return {
        title: defaultSEOSettings.defaultTitle,
        description: defaultSEOSettings.defaultDescription,
        keywords: defaultSEOSettings.defaultKeywords,
        image: defaultSEOSettings.defaultImage,
        url: defaultSEOSettings.siteUrl,
        type: 'website',
      };
    }

    const baseUrl = seoSettings.siteUrl.replace(/\/$/, '');
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    // Determine page type for specific settings
    let title = pageSettings?.title || seoSettings.defaultTitle;
    let description = pageSettings?.description || seoSettings.defaultDescription;
    let keywords = pageSettings?.keywords || seoSettings.defaultKeywords;
    let image = pageSettings?.image || seoSettings.defaultImage;
    
    // Use page-specific settings based on path
    if (!pageSettings?.title) {
      if (path === '/') {
        title = seoSettings.homeTitle;
        description = seoSettings.homeDescription;
        keywords = seoSettings.homeKeywords;
      } else if (path.includes('/about')) {
        title = seoSettings.aboutTitle;
        description = seoSettings.aboutDescription;
      } else if (path.includes('/products')) {
        title = seoSettings.productsTitle;
        description = seoSettings.productsDescription;
      } else if (path.includes('/contact') || path.includes('/cart') || path.includes('/checkout')) {
        title = seoSettings.contactTitle;
        description = seoSettings.contactDescription;
      }
    }

    // Ensure image URL is absolute
    const absoluteImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

    return {
      title,
      description,
      keywords,
      image: absoluteImage,
      url: pageSettings?.url || `${baseUrl}${path}`,
      type: pageSettings?.type || 'website',
      publishedTime: pageSettings?.publishedTime,
      modifiedTime: pageSettings?.modifiedTime,
      tags: pageSettings?.tags,
    };
  };

  const updateSEO = async (updates: Partial<SEOSettings>) => {
    // This would be called from admin panel
    console.log('Update SEO:', updates);
  };

  return {
    seoSettings: seoSettings || defaultSEOSettings,
    loading,
    getSEOSettings,
    updateSEO,
  };
}
