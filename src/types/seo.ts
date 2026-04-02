export interface SEOSettings {
  // General SEO
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteLogo: string;
  
  // Default Meta Tags
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  defaultImage: string;
  
  // Open Graph / Social Media
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  
  // Twitter Card
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  
  // Google Analytics
  googleAnalyticsId: string;
  enableAnalytics: boolean;
  
  // Google Search Console
  googleSiteVerification: string;
  
  // Robots.txt
  robotsAllow: boolean;
  robotsCustomRules: string;
  
  // Structured Data / Schema.org
  organizationName: string;
  organizationLogo: string;
  organizationUrl: string;
  organizationContactEmail: string;
  organizationContactPhone: string;
  organizationAddress: string;
  
  // Page-specific SEO (for dynamic pages)
  homeTitle: string;
  homeDescription: string;
  homeKeywords: string;
  
  aboutTitle: string;
  aboutDescription: string;
  
  productsTitle: string;
  productsDescription: string;
  
  contactTitle: string;
  contactDescription: string;
}

export const defaultSEOSettings: SEOSettings = {
  siteName: 'ATM Autolighting Madiun',
  siteDescription: 'Pusat aksesoris motor touring terlengkap dan terpercaya di Madiun. Menyediakan helm, jaket, touring boxes, gloves, dan aksesoris motor berkualitas tinggi.',
  siteUrl: 'https://atmautolighting.com',
  siteLogo: '/logo.png',
  
  defaultTitle: 'ATM Autolighting Madiun - Aksesoris Motor Touring Terlengkap',
  defaultDescription: 'Pusat aksesoris motor touring terlengkap dan terpercaya di Madiun. Helm, jaket, touring boxes, dan aksesoris berkualitas dengan harga terbaik.',
  defaultKeywords: 'aksesoris motor, touring, helm, jaket motor, touring boxes, Madiun, ATM Autolighting, aksesoris touring madiun',
  defaultImage: '/og-image.jpg',
  
  ogTitle: 'ATM Autolighting Madiun - Aksesoris Motor Touring',
  ogDescription: 'Pusat aksesoris motor touring terlengkap dan terpercaya di Madiun',
  ogImage: '/og-image.jpg',
  ogType: 'website',
  
  twitterCard: 'summary_large_image',
  twitterSite: '@atmautolighting',
  twitterCreator: '@atmautolighting',
  
  googleAnalyticsId: '',
  enableAnalytics: false,
  
  googleSiteVerification: '',
  
  robotsAllow: true,
  robotsCustomRules: '',
  
  organizationName: 'ATM Autolighting Madiun',
  organizationLogo: '/logo.png',
  organizationUrl: 'https://atmautolighting.com',
  organizationContactEmail: 'info@aksesoristouringmadiun.com',
  organizationContactPhone: '082232760393',
  organizationAddress: 'Jl. Urip Sumoharjo No.11, Nambangan Kidul, Kec. Manguharjo, Kota Madiun, Jawa Timur 63131',
  
  homeTitle: 'ATM Autolighting Madiun - Aksesoris Motor Touring #1',
  homeDescription: 'Belanja aksesoris motor touring terlengkap di Madiun. Helm, jaket, touring boxes, gloves dengan kualitas terbaik dan harga terjangkau.',
  homeKeywords: 'aksesoris motor touring madiun, helm touring, jaket motor, touring boxes, gloves motor, ATM autolighting',
  
  aboutTitle: 'Tentang Kami - ATM Autolighting Madiun',
  aboutDescription: 'ATM Autolighting Madiun adalah pusat aksesoris motor touring terlengkap dan terpercaya. Melayani dengan hati sejak bertahun-tahun.',
  
  productsTitle: 'Katalog Produk - ATM Autolighting Madiun',
  productsDescription: 'Lihat katalog lengkap aksesoris motor touring. Helm, jaket, touring boxes, gloves, dan aksesoris lainnya dengan harga terbaik.',
  
  contactTitle: 'Hubungi Kami - ATM Autolighting Madiun',
  contactDescription: 'Kunjungi toko kami di Madiun atau hubungi kami melalui WhatsApp. Kami siap membantu kebutuhan aksesoris motor touring Anda.',
};
