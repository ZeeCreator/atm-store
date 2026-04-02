import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import InitUser from '@/components/InitUser';
import PageTransitionLoader from '@/components/PageTransitionLoader';
import FirebaseKeepAlive from '@/components/FirebaseKeepAlive';
import SiteTitle from '@/components/SiteTitle';
import GoogleAnalytics from '@/components/GoogleAnalytics';

export const metadata: Metadata = {
  title: "Aksesoris Touring Madiun | Premium Motorcycle Gear",
  description: "Platform e-commerce untuk penjualan aksesoris touring motor dengan WhatsApp-based checkout. Helm, jaket, touring boxes, dan aksesoris lainnya.",
  keywords: "aksesoris motor, touring madiun, helm touring, jaket motor, touring boxes",
  icons: {
    icon: [
      {
        url: 'https://cdnzero.unaux.com/uploads/images/o9on8oBx.png',
        href: 'https://cdnzero.unaux.com/uploads/images/o9on8oBx.png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ATM Autolighting',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-background text-on-background font-body antialiased">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <InitUser />
              <FirebaseKeepAlive />
              <SiteTitle />
              <PageTransitionLoader />
              <GoogleAnalytics />
              {children}
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
