'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FlashSaleSection from '@/components/FlashSaleSection';
import CategoriesSection from '@/components/CategoriesSection';
import WhatsAppBanner from '@/components/WhatsAppBanner';
import ProductCard from '@/components/ProductCard';
import ReviewsCarousel from '@/components/ReviewsCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { useStore, type Product } from '@/store/useStore';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/Icon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Home() {
  const { t } = useLanguage();
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setProducts } = useStore();
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    // Check if we need to scroll to reviews (from navigation)
    const shouldScrollToReviews = sessionStorage.getItem('scrollToReviews') === 'true';

    if (shouldScrollToReviews) {
      // Remove the flag
      sessionStorage.removeItem('scrollToReviews');

      // Wait for page to load and scroll
      const timer = setTimeout(() => {
        const element = document.getElementById('reviews');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait 500ms for page to settle

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Check if we need to scroll to features (from navigation)
    const shouldScrollToFeatures = sessionStorage.getItem('scrollToFeatures') === 'true';

    if (shouldScrollToFeatures) {
      // Remove the flag
      sessionStorage.removeItem('scrollToFeatures');

      // Wait for page to load and scroll
      const timer = setTimeout(() => {
        const element = document.getElementById('features');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait 500ms for page to settle

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Fetch products from Firebase
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: Product[] = Object.entries(data)
          .map(([id, product]: [string, any]) => ({ id, ...product }));
        setProducts(productsList);

        // Get popular products (top rated)
        const popular = productsList
          .filter((p) => p.rating >= 4.5)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        setPopularProducts(popular);
      } else {
        setPopularProducts([]);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setProducts]);

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Icons.Spinner className="text-5xl text-primary-container animate-spin" />
          <p className="text-white/40 mt-4 font-headline uppercase tracking-widest text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO />
      <Navbar />
      <main ref={sectionRef} className="pt-16">
        <HeroSection />
        <FlashSaleSection />
        <CategoriesSection />
        <FeaturesSection />
        <WhatsAppBanner />

        {/* Popular Products Section */}
        <section className="py-24 px-8 bg-surface-container-low">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16 border-b border-outline-variant/15 pb-8 scroll-reveal revealed">
              <div>
                <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white mb-2 animate-fade-in-down">
                  Top Rated Essentials
                </h2>
                <p className="text-white/40 uppercase tracking-widest text-xs mt-2 animate-fade-in animation-delay-200">
                  {t.products.topRated}
                </p>
              </div>
              <a
                href="/products"
                className="text-primary-container font-headline uppercase tracking-widest text-sm hover:underline decoration-2 underline-offset-4 transition-all duration-300 hover:translate-x-2"
              >
                {t.products.viewAll}
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
              {popularProducts.length > 0 ? (
                popularProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="scroll-reveal revealed"
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 scroll-reveal revealed">
                  <Icons.StarEmpty className="text-6xl text-white/30 mb-4 animate-float" />
                  <p className="text-white/60 font-headline uppercase tracking-widest">
                    {t.common.noProductsYet}
                  </p>
                  <p className="text-white/40 text-sm mt-2">
                    {t.common.checkBackLater}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <ReviewsCarousel />
      </main>
      <Footer />
    </>
  );
}
