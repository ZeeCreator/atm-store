import { NextResponse } from 'next/server';
import { getDatabase, ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch SEO settings from Firebase
    const seoRef = ref(db, 'seo');
    const snapshot = await get(seoRef);
    const seoData = snapshot.val();

    const baseUrl = seoData?.siteUrl || 'https://atmautolighting.com';
    const allowRobots = seoData?.robotsAllow !== false;

    // Fetch products for product pages
    const productsRef = ref(db, 'products');
    const productsSnapshot = await get(productsRef);
    const productsData = productsSnapshot.val();
    
    const productUrls = productsData 
      ? Object.keys(productsData).map((id) => ({
          loc: `${baseUrl}/product/${id}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
        }))
      : [];

    // Generate sitemap XML
    const urls = [
      // Homepage
      {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0,
      },
      // Products page
      {
        loc: `${baseUrl}/products`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      // About page
      {
        loc: `${baseUrl}/about`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      // Cart page
      {
        loc: `${baseUrl}/cart`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.5,
      },
      // Checkout page
      {
        loc: `${baseUrl}/checkout`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.3,
      },
      // Login page
      {
        loc: `${baseUrl}/login`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.3,
      },
      // Success page
      {
        loc: `${baseUrl}/success`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.3,
      },
      // Admin pages (noindex if robots not allowed)
      ...(allowRobots ? [] : [
        {
          loc: `${baseUrl}/admin`,
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.1,
        },
      ]),
      // Product detail pages
      ...productUrls,
    ];

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
`;

    urls.forEach((url) => {
      xml += `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return basic sitemap as fallback
    const baseUrl = 'https://atmautolighting.com';
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
