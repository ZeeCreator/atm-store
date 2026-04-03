'use client';

import Link from 'next/link';
import { Icons } from './Icon';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ArsenalCategory {
  name: string;
  image: string;
  cardSize?: 'small' | 'medium' | 'large' | 'full';
}

interface ArsenalLayoutSettings {
  mobileGap: number;
  desktopGap: number;
  layoutStyle: 'bento' | 'classic' | 'grid' | 'masonry' | 'uniform';
  borderRadius: string;
  overlayOpacity: number;
  textSize: 'small' | 'normal' | 'large' | 'xlarge';
  autoArrange: boolean;
}

// Default images untuk categories
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Helmets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrOPHs5QuRC38lRDmTmY7sKn-kb8EZ8BsGj8Xl5B3bRu8UnoA4e99K4Z-zbYsslzIJYfRXBUWtj3rH3H8HAA35chxCMfJsaQQ59QpYujAsi90TDrEKoRsCsppgQpZJpblVnFBAUi6C7v7T-PDHpyYnaYOQ0d7vn5G0dFeD5RStwk-8EuemUqL9fvlG_cYiwHOst3wsf3QEpqh0iNPTI2a4sw_xuBJZq0XGhTb-i8L4CVVGKYJMaAtXnrQ2Lb916fdhbnhPFtuiSkTY',
  'Jackets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRvy3mzvo2UQMoY5soIh0ZM5mbjAg_Pq8c3y725s5z2lpmcFzDvArcy_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
  'Touring Boxes': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvZm2AEgCSr59eO8y8ZmGly7MOBQCZX5wZX0ffQghSfNhcQ1jMvIMQi_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
  'Gloves & Footwear': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxvenesZ98H4sbxJAaGB125WR9o_doEeMf-WFVf3Nv8jK3jbbjG0QDHOtwPhJPo0WwqSV75dTCTcH6LYdSLr3VMb5FI8tCSMDNYaIpGyjAdfIaSSjpAHDXy2c7QqvF43pvnU8bMbwzKKbkP36M8GQ1JMxwZSwjd2r3_hQUt5vBQeX5rNdGCKZzPTJh66dINiNOELOeVE8SsoVigCDSYZnxNHtFTwggqoYjGp7ErrK0IEmBheN-prFr9e1tzPd2CeXB4eTbmktIko5',
};

export default function CategoriesSection() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<ArsenalCategory[]>([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState<ArsenalLayoutSettings>({
    mobileGap: 12,
    desktopGap: 16,
    layoutStyle: 'bento',
    borderRadius: 'rounded-none',
    overlayOpacity: 60,
    textSize: 'normal',
    autoArrange: false,
  });
  const sectionRef = useScrollAnimation();

  // Desktop: always show all cards
  // Mobile: show only 4 cards initially, can expand with Read More button
  const MAX_MOBILE_CATEGORIES = 4;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile: limit to 4 cards unless showAllCategories is true
  // On desktop: always show all cards
  const displayedCategories = isMobile && !showAllCategories
    ? categories.slice(0, MAX_MOBILE_CATEGORIES)
    : categories;
    
  const hasMoreCategories = categories.length > MAX_MOBILE_CATEGORIES;

  useEffect(() => {
    const arsenalRef = ref(db, 'arsenal');
    const unsubscribeArsenal = onValue(arsenalRef, (arsenalSnapshot) => {
      const arsenalData = arsenalSnapshot.val();
      if (arsenalData) {
        const arsenalList: ArsenalCategory[] = Object.values(arsenalData);
        setCategories(arsenalList);
      }
    });

    const layoutRef = ref(db, 'arsenalLayout');
    const unsubscribeLayout = onValue(layoutRef, (layoutSnapshot) => {
      const layoutData = layoutSnapshot.val();
      if (layoutData) {
        setLayoutSettings({
          mobileGap: layoutData.mobileGap ?? 12,
          desktopGap: layoutData.desktopGap ?? 16,
          layoutStyle: layoutData.layoutStyle ?? 'bento',
          borderRadius: layoutData.borderRadius ?? 'rounded-none',
          overlayOpacity: layoutData.overlayOpacity ?? 60,
          textSize: layoutData.textSize ?? 'normal',
          autoArrange: layoutData.autoArrange ?? false,
        });
      }
    });

    return () => {
      unsubscribeArsenal();
      unsubscribeLayout();
    };
  }, []);

  // Get grid position based on card size and layout style
  const getCardClasses = (category: ArsenalCategory, index: number, total: number) => {
    const cardSize = category.cardSize || 'medium';
    
    // Auto arrange mode
    if (layoutSettings.autoArrange) {
      // Classic Layout - PERSIS SEPERTI SCREENSHOT
      // Layout: 1 card besar di kiri (full height), 2 card kecil di kanan atas, 1 card lebar di kanan bawah
      if (layoutSettings.layoutStyle === 'classic') {
        if (total === 1) {
          return 'col-span-full';
        } else if (total === 2) {
          return index === 0 ? 'md:col-span-2' : 'md:col-span-2';
        } else if (total === 3) {
          // Card 1: besar kiri (2 rows), Card 2-3: kanan (1 row each)
          if (index === 0) return 'md:col-span-2 md:row-span-2';
          return 'md:col-span-1';
        } else if (total >= 4) {
          // Pattern screenshot: 
          // - Card 0 (HELMETS): col-span-2, row-span-2 (besar di kiri)
          // - Card 1 (JACKETS): col-span-1 (kanan atas kiri)
          // - Card 2 (TOURING): col-span-1 (kanan atas kanan)
          // - Card 3 (GLOVES): col-span-2 (kanan bawah, lebar)
          if (index === 0) return 'md:col-span-2 md:row-span-2';
          if (index === 1 || index === 2) return 'md:col-span-1';
          if (index === 3) return 'md:col-span-2';
          // Untuk card > 4, tampilkan di bawah
          return 'md:col-span-1';
        }
      }
      
      // Bento layout - variasi lain
      if (layoutSettings.layoutStyle === 'bento') {
        if (total === 1) {
          return 'col-span-full';
        } else if (total === 2) {
          return index === 0 ? 'md:col-span-2' : 'md:col-span-1';
        } else if (total === 3) {
          if (index === 0) return 'md:col-span-2 md:row-span-2';
          if (index === 1) return 'md:col-span-1';
          return 'md:col-span-1';
        } else if (total === 4) {
          if (index === 0) return 'md:col-span-2 md:row-span-2';
          if (index === 1 || index === 2) return 'md:col-span-1';
          if (index === 3) return 'md:col-span-2';
        } else {
          // More than 4 cards
          if (cardSize === 'full') return 'col-span-full';
          if (cardSize === 'large') return 'md:col-span-2 md:row-span-2';
          if (cardSize === 'medium') return 'md:col-span-1';
          return 'md:col-span-1';
        }
      }
      
      // Grid layout
      if (layoutSettings.layoutStyle === 'grid') {
        if (cardSize === 'full') return 'col-span-full';
        if (cardSize === 'large') return 'sm:col-span-2 md:row-span-2';
        if (cardSize === 'medium') return 'col-span-1';
        return 'col-span-1';
      }
      
      // Masonry layout
      if (layoutSettings.layoutStyle === 'masonry') {
        if (cardSize === 'full') return 'sm:col-span-2 lg:col-span-3';
        if (cardSize === 'large') return 'md:row-span-2';
        return 'md:row-span-1';
      }
      
      // Uniform layout
      if (layoutSettings.layoutStyle === 'uniform') {
        return 'col-span-1';
      }
    }
    
    // Manual mode - use span from data or default
    if (cardSize === 'full') return 'col-span-full';
    if (cardSize === 'large') return 'md:col-span-2 md:row-span-2';
    if (cardSize === 'medium') return '';
    if (cardSize === 'small') return '';
    return '';
  };

  // Get row height based on layout style
  const getGridClasses = () => {
    if (layoutSettings.layoutStyle === 'classic') {
      // Classic layout seperti screenshot: 4 kolom, auto-rows
      return 'grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[200px]';
    } else if (layoutSettings.layoutStyle === 'bento') {
      return 'grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[200px]';
    } else if (layoutSettings.layoutStyle === 'grid') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px]';
    } else if (layoutSettings.layoutStyle === 'masonry') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 auto-rows-[180px]';
    } else {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px]';
    }
  };

  // Get text size
  const getTextSize = () => {
    switch (layoutSettings.textSize) {
      case 'small': return 'text-lg md:text-xl';
      case 'large': return 'text-2xl md:text-3xl lg:text-4xl';
      case 'xlarge': return 'text-3xl md:text-4xl lg:text-5xl';
      default: return 'text-xl md:text-2xl lg:text-3xl';
    }
  };

  // Get border radius
  const getRadiusClass = () => {
    return layoutSettings.borderRadius === 'rounded-none' ? '' :
           layoutSettings.borderRadius === 'rounded-lg' ? 'rounded-lg' :
           layoutSettings.borderRadius === 'rounded-xl' ? 'rounded-xl' :
           layoutSettings.borderRadius === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-3xl';
  };

  return (
    <section ref={sectionRef} className="py-16 md:py-24 px-4 md:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 md:mb-16 scroll-reveal">
          <h2 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tight text-white animate-fade-in-down">
            THE ARSENAL
          </h2>
          <p className="text-white/40 uppercase tracking-wider text-xs mt-2 animate-fade-in animation-delay-200">
            {t.categories.shopByCategory}
          </p>
        </div>

        {/* Grid Layout */}
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-th-large text-4xl text-white/20"></i>
            </div>
            <p className="text-white/60 font-headline font-bold uppercase tracking-widest mb-2">No Categories Yet</p>
            <p className="text-white/40 text-sm">Check back later for exciting categories!</p>
          </div>
        ) : (
          <>
            <div className={getGridClasses()}>
              {displayedCategories.map((category, index) => {
                // Prioritas gambar: Database Firebase > Default Images > Gradient Fallback
                let displayImage = '';

                if (category.image && !category.image.includes('source.unsplash.com')) {
                  // Gunakan gambar dari database (bukan unsplash lama)
                  displayImage = category.image;
                } else if (DEFAULT_CATEGORY_IMAGES[category.name]) {
                  // Gunakan default image untuk category tertentu
                  displayImage = DEFAULT_CATEGORY_IMAGES[category.name];
                }

                const hasImage = !!displayImage;

                return (
                  <div
                    key={category.name}
                    className={`group relative overflow-hidden ${getCardClasses(category, index, displayedCategories.length)} ${getRadiusClass()}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Background Image dengan fallback */}
                    <div className={`absolute inset-0 ${!hasImage ? 'bg-gradient-to-br from-primary/20 to-primary-container/20' : 'bg-surface-container-lowest'}`}>
                      {hasImage && (
                        <img
                          src={displayImage}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            // Jika gambar error, tampilkan gradient fallback
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-primary/20', 'to-primary-container/20');
                          }}
                        />
                      )}
                    </div>

                    {/* Overlay dengan opacity yang bisa diatur */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-90"
                      style={{ opacity: layoutSettings.overlayOpacity / 100 }}
                    ></div>

                    {/* Content */}
                    <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                      <div>
                        <h3 className={`font-headline font-bold text-white uppercase tracking-tight ${getTextSize()} animate-slide-up`}>
                          {category.name}
                        </h3>
                        <Link
                          href={`/products?category=${encodeURIComponent(category.name)}`}
                          className="mt-3 inline-flex items-center space-x-2 text-primary text-sm font-semibold uppercase tracking-wider hover:text-primary-container transition-colors duration-300 group/link"
                        >
                          <span>Jelajahi</span>
                          <Icons.ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Read More / Show Less Button - Mobile Only */}
            {hasMoreCategories && (
              <div className="mt-8 text-center md:hidden">
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="group relative inline-flex items-center gap-2 text-white font-headline font-bold uppercase tracking-widest text-sm hover:text-primary transition-all duration-300"
                >
                  {/* Animated text with shimmer effect */}
                  <span className="relative inline-block overflow-hidden">
                    {showAllCategories ? t.categories.showLess : t.categories.readMore}
                    {/* Animated underline */}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-container group-hover:w-full transition-all duration-500 ease-out"></span>
                    {/* Shimmer effect on hover */}
                    <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></span>
                  </span>
                  
                  {/* Bouncing arrow icon */}
                  <span className="inline-flex items-center">
                    <i className={`fa-solid ${
                      showAllCategories ? 'fa-chevron-up' : 'fa-chevron-down'
                    } transition-all duration-300 ${
                      !showAllCategories ? 'group-hover:animate-bounce' : ''
                    }`}></i>
                  </span>
                  
                  {/* Pulse ring effect */}
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping bg-primary/10"></span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
