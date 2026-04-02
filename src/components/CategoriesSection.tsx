'use client';

import Image from 'next/image';
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
  span?: string;
}

// Default images untuk categories jika tidak ada di arsenal
const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  'Helmets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrOPHs5QuRC38lRDmTmY7sKn-kb8EZ8BsGj8Xl5B3bRu8UnoA4e99K4Z-zbYsslzIJYfRXBUWtj3rH3H8HAA35chxCMfJsaQQ59QpYujAsi90TDrEKoRsCsppgQpZJpblVnFBAUi6C7v7T-PDHpyYnaYOQ0d7vn5G0dFeD5RStwk-8EuemUqL9fvlG_cYiwHOst3wsf3QEpqh0iNPTI2a4sw_xuBJZq0XGhTb-i8L4CVVGKYJMaAtXnrQ2Lb916fdhbnhPFtuiSkTY',
  'Jackets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRvy3mzvo2UQMoY5soIh0ZM5mbjAg_Pq8c3y725s5z2lpmcFzDvArcy_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
  'Touring Boxes': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvZm2AEgCSr59eO8y8ZmGly7MOBQCZX5wZX0ffQghSfNhcQ1jMvIMQi_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
  'Gloves & Footwear': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxvenesZ98H4sbxJAaGB125WR9o_doEeMf-WFVf3Nv8jK3jbbjG0QDHOtwPhJPo0WwqSV75dTCTcH6LYdSLr3VMb5FI8tCSMDNYaIpGyjAdfIaSSjpAHDXy2c7QqvF43pvnU8bMbwzKKbkP36M8GQ1JMxwZSwjd2r3_hQUt5vBQeX5rNdGCKZzPTJh66dINiNOELOeVE8SsoVigCDSYZnxNHtFTwggqoYjGp7ErrK0IEmBheN-prFr9e1tzPd2CeXB4eTbmktIko5',
};

// Default spans untuk layout
const DEFAULT_SPANS = ['md:col-span-2 md:row-span-2', '', '', 'md:col-span-2'];

export default function CategoriesSection() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<ArsenalCategory[]>([]);
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    // Fetch dari arsenal terlebih dahulu (prioritas)
    const arsenalRef = ref(db, 'arsenal');
    const categoriesRef = ref(db, 'categories');
    
    const unsubscribeArsenal = onValue(arsenalRef, (arsenalSnapshot) => {
      const arsenalData = arsenalSnapshot.val();
      
      // Jika ada data di arsenal, gunakan itu
      if (arsenalData) {
        const arsenalList: ArsenalCategory[] = Object.values(arsenalData);
        setCategories(arsenalList);
        return;
      }
      
      // Jika tidak ada arsenal, coba dari categories
      const unsubscribeCategories = onValue(categoriesRef, (catSnapshot) => {
        const catData = catSnapshot.val();
        
        if (catData) {
          // Convert categories ke format arsenal dengan default images
          const categoriesList: ArsenalCategory[] = Object.values(catData).map((cat: unknown, index: number) => {
            const categoryName = cat as string;
            return {
              name: categoryName,
              image: DEFAULT_CATEGORY_IMAGES[categoryName] || `https://source.unsplash.com/800x600/?motorcycle,${categoryName.toLowerCase().replace(/&/g, '')}`,
              span: DEFAULT_SPANS[index % DEFAULT_SPANS.length] || '',
            };
          });
          
          setCategories(categoriesList);
        } else {
          // Fallback ke default categories
          setCategories([
            {
              name: 'Helmets',
              image: DEFAULT_CATEGORY_IMAGES['Helmets'],
              span: 'md:col-span-2 md:row-span-2',
            },
            {
              name: 'Jackets',
              image: DEFAULT_CATEGORY_IMAGES['Jackets'],
              span: '',
            },
            {
              name: 'Touring Boxes',
              image: DEFAULT_CATEGORY_IMAGES['Touring Boxes'],
              span: '',
            },
            {
              name: 'Gloves & Footwear',
              image: DEFAULT_CATEGORY_IMAGES['Gloves & Footwear'],
              span: 'md:col-span-2',
            },
          ]);
        }
      });
      
      return () => unsubscribeCategories();
    });

    return () => unsubscribeArsenal();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 scroll-reveal">
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white mb-2 animate-fade-in-down">
            The Arsenal
          </h2>
          <p className="text-white/40 uppercase tracking-widest text-xs animate-fade-in animation-delay-200">
            {t.categories.shopByCategory}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className={`${category.span} group relative overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className={`absolute ${category.span?.includes('row-span-2') ? 'bottom-10 left-10' : 'bottom-6 left-6'}`}>
                <h3 className={`font-headline font-bold text-white uppercase tracking-tighter mb-4 ${
                  category.span?.includes('row-span-2') ? 'text-4xl' : 'text-2xl'
                } animate-slide-up`}>
                  {category.name}
                </h3>
                <Link
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="flex items-center space-x-2 text-primary-container font-headline uppercase tracking-widest text-sm hover:translate-x-2 transition-transform duration-300 group-hover:animate-pulse"
                >
                  <span>{t.categories.browseRange}</span>
                  <Icons.ArrowRight className="text-sm" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
