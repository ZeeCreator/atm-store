'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function AboutPage() {
  const { t } = useLanguage();
  const [storyContent, setStoryContent] = useState(t.about.storyContent);
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    // Fetch story content from Firebase settings
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.about?.storyContent) {
        setStoryContent(data.about.storyContent);
      } else {
        setStoryContent(t.about.storyContent);
      }
    });

    return () => unsubscribe();
  }, [t.about.storyContent]);

  return (
    <>
      <SEO />
      <Navbar />
      <main ref={sectionRef} className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
        {/* Hero Section */}
        <section className="py-12 md:py-20 text-center scroll-reveal revealed">
          <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6 px-4 animate-fade-in-down">
            {t.about.title.split(' ')[0]} <span className="text-primary-container">{t.about.title.split(' ').slice(1).join(' ')}</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-3xl mx-auto leading-relaxed px-4 animate-slide-up animation-delay-200">
            {t.about.heroSubtitle}
          </p>
        </section>

        {/* Story Section */}
        <section className="py-12 md:py-20 bg-surface-container-low">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center px-4">
            <div className="scroll-reveal">
              <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6 animate-fade-in-down">
                {t.about.ourStory}
              </h2>
              <div className="space-y-3 md:space-y-4 text-white/80 leading-relaxed whitespace-pre-line text-sm md:text-base animate-slide-up animation-delay-200">
                {storyContent}
              </div>
            </div>
            <div className="aspect-square bg-surface-container-highest overflow-hidden scroll-reveal animation-delay-300">
              <div className="w-full h-full bg-gradient-to-br from-primary-container/20 to-surface-container flex items-center justify-center">
                <img
                  src="https://cdnzero.unaux.com/uploads/images/o9on8oBx.png"
                  alt="Motorcycle"
                  className="w-32 h-32 md:w-48 md:h-48 object-contain opacity-60 animate-float"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-8 md:mb-12 text-center scroll-reveal revealed">
              {t.about.ourValues}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-surface-container-low p-6 md:p-8 text-center rounded-xl scroll-reveal revealed transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 animate-float" style={{ animationDelay: '0s' }}>
                  <i className="fa-solid fa-certificate text-3xl md:text-4xl text-primary-container"></i>
                </div>
                <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                  {t.about.qualityAssured}
                </h3>
                <p className="text-white/60 text-sm">
                  {t.about.qualityContent}
                </p>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 text-center rounded-xl scroll-reveal revealed transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/10" style={{ transitionDelay: '100ms' }}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 animate-float" style={{ animationDelay: '0.2s' }}>
                  <i className="fa-solid fa-comments text-3xl md:text-4xl text-primary-container"></i>
                </div>
                <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                  {t.about.personalService}
                </h3>
                <p className="text-white/60 text-sm">
                  {t.about.serviceContent}
                </p>
              </div>
              <div className="bg-surface-container-low p-6 md:p-8 text-center rounded-xl scroll-reveal revealed transform transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-primary/10" style={{ transitionDelay: '200ms' }}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-container/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 animate-float" style={{ animationDelay: '0.4s' }}>
                  <i className="fa-solid fa-truck-fast text-3xl md:text-4xl text-primary-container"></i>
                </div>
                <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                  {t.about.fastShipping}
                </h3>
                <p className="text-white/60 text-sm">
                  {t.about.shippingContent}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="location" className="py-12 md:py-20 bg-surface-container-low">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-8 md:mb-12 text-center scroll-reveal revealed">
              {t.about.visitUs}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="space-y-4 md:space-y-6">
                <div className="bg-surface-container-highest p-6 md:p-8 rounded-xl scroll-reveal revealed transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
                  <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                    {t.about.storeLocation}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    Jl. Urip Sumoharjo No.11<br />
                    Nambangan Kidul, Kec. Manguharjo<br />
                    Kota Madiun, Jawa Timur 63131
                  </p>
                </div>
                <div className="bg-surface-container-highest p-6 md:p-8 rounded-xl scroll-reveal revealed transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl" style={{ transitionDelay: '100ms' }}>
                  <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                    {t.about.operatingHours}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    Senin - Sabtu: 09.00–17.00<br />
                    Minggu: 09.00–17.00<br />
                    <span className="text-white/40 text-xs md:text-sm">Jam buka dapat berbeda</span>
                  </p>
                </div>
                <div className="bg-surface-container-highest p-6 md:p-8 rounded-xl scroll-reveal revealed transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl" style={{ transitionDelay: '200ms' }}>
                  <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                    {t.about.contact}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-sm md:text-base">
                    WhatsApp: 082232760393<br />
                    Email: info@aksesoristouringmadiun.com
                  </p>
                </div>
              </div>
              <div className="aspect-video bg-surface-container-highest overflow-hidden rounded-xl scroll-reveal revealed transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl" style={{ transitionDelay: '300ms' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31636.198602567238!2d111.46299362182617!3d-7.62656661185836!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e79bfa7d1342359%3A0xd96fd6dbe37e4fea!2sATM%20AUTOLIGHTING%20MADIUN%20XPRO7MADIUN!5e0!3m2!1sid!2sid!4v1774959625093!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6 scroll-reveal revealed">
              {t.about.readyToUpgrade}
            </h2>
            <p className="text-white/60 text-base md:text-lg mb-6 md:mb-8 scroll-reveal revealed animation-delay-200">
              {t.about.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center scroll-reveal revealed animation-delay-300">
              <Link
                href="/products"
                className="bg-gradient-to-br from-primary to-primary-container px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform text-sm md:text-base hover:shadow-xl hover:shadow-primary/30"
              >
                {t.about.browseCatalog}
              </Link>
              <Link
                href="https://wa.me/6282232760393"
                target="_blank"
                className="bg-green-600 px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base hover:scale-105 hover:shadow-xl hover:shadow-green-600/30"
              >
                <i className="fa-brands fa-whatsapp"></i>
                {t.about.chatOnWhatsApp}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
