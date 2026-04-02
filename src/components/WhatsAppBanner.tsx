'use client';

import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Icons } from './Icon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function WhatsAppBanner() {
  const { t } = useLanguage();
  const { siteSettings } = useStore();
  const whatsappNumber = siteSettings?.whatsappNumber || '6281234567890';
  const sectionRef = useScrollAnimation();

  return (
    <section ref={sectionRef} className="py-12 bg-primary-container overflow-hidden relative">
      <div className="carbon-texture absolute inset-0"></div>
      <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 scroll-reveal">
        <div className="flex items-center gap-6 animate-slide-up">
          <Icons.Support className="text-black text-5xl" />
          <div>
            <h2 className="font-headline text-3xl font-black uppercase tracking-tighter text-black">
              {t.common.expertAdvice}
            </h2>
            <p className="text-black font-medium uppercase tracking-widest text-sm">
              {t.common.consultVeterans}
            </p>
          </div>
        </div>
        <Link
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          className="bg-surface text-white px-8 py-4 font-headline font-black uppercase tracking-widest rounded-md hover:scale-105 transition-transform flex items-center gap-3 animate-scale-in animation-delay-300 hover:shadow-xl hover:shadow-black/30"
        >
          <Icons.Whatsapp className="text-primary-container text-xl" />
          {t.common.whatsappSupport}
        </Link>
      </div>
    </section>
  );
}
