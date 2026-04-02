'use client';

import { useEffect } from 'react';
import { useSEO } from '@/hooks/useSEO';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export default function GoogleAnalytics() {
  const { seoSettings } = useSEO();
  const pathname = usePathname();

  useEffect(() => {
    if (!seoSettings?.enableAnalytics || !seoSettings.googleAnalyticsId) {
      return;
    }

    const measurementId = seoSettings.googleAnalyticsId;

    // Load gtag script
    const loadGtag = () => {
      // Create dataLayer if not exists
      window.dataLayer = window.dataLayer || [];

      // Create gtag function
      function gtag(...args: any[]) {
        window.dataLayer?.push(args);
      }
      window.gtag = gtag;

      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize GA4
        gtag('js', new Date());
        gtag('config', measurementId, {
          send_page_view: true,
        });

        // Track initial page view
        trackPageView(window.location.pathname);
      };
    };

    const trackPageView = (path: string) => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: path,
        });
      }
    };

    // Load the script
    loadGtag();

    // Track route changes (for SPA navigation)
    if (pathname) {
      trackPageView(pathname);
    }

  }, [seoSettings, pathname]);

  return null;
}

// Helper function to track custom events
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

// Predefined common e-commerce events
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}) => {
  trackEvent('add_to_cart', {
    currency: 'IDR',
    value: product.price * product.quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
        item_category: product.category,
      },
    ],
  });
};

export const trackViewProduct = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackEvent('view_item', {
    currency: 'IDR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
      },
    ],
  });
};

export const trackBeginCheckout = (cart: {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
}) => {
  trackEvent('begin_checkout', {
    currency: 'IDR',
    value: cart.total,
    items: cart.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackPurchase = (order: {
  id: string;
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  trackEvent('purchase', {
    transaction_id: order.id,
    currency: 'IDR',
    value: order.total,
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
  });
};

export const trackContact = (method: 'whatsapp' | 'email' | 'phone') => {
  trackEvent('contact', {
    contact_method: method,
  });
};
