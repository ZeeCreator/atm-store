'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { siteSettings } = useStore();
  const [heroData, setHeroData] = useState({
    title: siteSettings?.heroTitle || t.hero.title,
    subtitle: siteSettings?.heroSubtitle || t.hero.subtitle,
    image: siteSettings?.heroImage && siteSettings.heroImage !== '' ? siteSettings.heroImage : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  });

  useEffect(() => {
    // Fetch hero settings from Firebase
    const settingsRef = ref(db, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const heroImage = data?.hero?.image && data.hero.image !== '' 
          ? data.hero.image 
          : siteSettings?.heroImage && siteSettings.heroImage !== '' 
            ? siteSettings.heroImage 
            : 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
        const heroTitle = data?.hero?.title || siteSettings?.heroTitle || t.hero.title;
        const heroSubtitle = data?.hero?.subtitle || siteSettings?.heroSubtitle || t.hero.subtitle;
        
        setHeroData({
          title: heroTitle,
          subtitle: heroSubtitle,
          image: heroImage,
        });
      }
    });

    return () => unsubscribe();
  }, [siteSettings, t.hero.title, t.hero.subtitle]);

  return (
    <section className="relative h-[921px] flex items-center overflow-hidden">
      {/* Background Image with Zoom Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={heroData.image}
          alt="Motorcycle touring adventure"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover' }}
          className="grayscale-[30%] brightness-50 animate-scale-in"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent opacity-80"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-8 md:px-20 max-w-5xl">
        {/* Badge - Fade In Down */}
        <div className="mb-4 inline-flex items-center space-x-2 bg-primary-container/20 px-3 py-1 border-l-2 border-primary-container animate-fade-in-down">
          <span className="text-primary-container text-xs font-bold tracking-widest uppercase">
            Premium Gear Specialists
          </span>
        </div>

        {/* Title - Fade In with Delay */}
        <h1 className="font-headline font-black text-6xl md:text-8xl leading-none uppercase tracking-tighter text-white mb-6 animate-fade-in animation-delay-200">
          {heroData.title.split(' ')[0]}{' '}
          <br />
          <span className="text-primary-container text-shadow-glow animate-float">
            {heroData.title.split(' ').slice(1).join(' ')}
          </span>
        </h1>

        {/* Subtitle - Slide Up */}
        <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 font-light leading-relaxed animate-slide-up animation-delay-300">
          {heroData.subtitle}
        </p>

        {/* CTA Buttons - Scale In */}
        <div className="flex flex-col sm:flex-row gap-4 animate-scale-in animation-delay-500">
          <Link
            href="/products"
            className="bg-gradient-to-br from-primary to-primary-container px-10 py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform duration-300 text-center animate-pulse-glow hover:animate-none"
          >
            {t.hero.exploreCatalog}
          </Link>
          <Link
            href="/about"
            className="bg-surface-container-highest px-10 py-4 font-headline font-bold uppercase tracking-widest text-white border border-white/10 rounded-md hover:bg-surface-bright transition-all duration-300 text-center hover:shadow-lg hover:shadow-primary/20"
          >
            {t.about.visitUs}
          </Link>
        </div>
      </div>

      {/* Technical Detail Decoration - Floating */}
      <div className="absolute right-[-5%] bottom-[10%] hidden lg:block opacity-20 rotate-12 pointer-events-none animate-float">
        <span className="font-headline text-[15rem] font-black leading-none text-outline">01_</span>
      </div>
    </section>
  );
}
