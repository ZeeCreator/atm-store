'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Icons } from './Icon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeaturesSection() {
  const { t } = useLanguage();
  const sectionRef = useScrollAnimation();

  const features: Feature[] = [
    {
      icon: <Icons.Certificate className="text-4xl md:text-5xl" />,
      title: t.features.quality.title,
      description: t.features.quality.description,
    },
    {
      icon: <Icons.Price className="text-4xl md:text-5xl" />,
      title: t.features.price.title,
      description: t.features.price.description,
    },
    {
      icon: <Icons.Service className="text-4xl md:text-5xl" />,
      title: t.features.service.title,
      description: t.features.service.description,
    },
    {
      icon: <Icons.Shipping className="text-4xl md:text-5xl" />,
      title: t.features.shipping.title,
      description: t.features.shipping.description,
    },
    {
      icon: <Icons.Warranty className="text-4xl md:text-5xl" />,
      title: t.features.warranty.title,
      description: t.features.warranty.description,
    },
    {
      icon: <Icons.Trusted className="text-4xl md:text-5xl" />,
      title: t.features.trusted.title,
      description: t.features.trusted.description,
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="py-16 md:py-24 px-4 md:px-8 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 scroll-reveal">
          <h2 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-3 md:mb-4 animate-fade-in-down">
            {t.features.title}
          </h2>
          <p className="text-white/40 uppercase tracking-widest text-xs md:text-sm animate-fade-in animation-delay-200">
            {t.features.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="scroll-reveal bg-surface-container p-6 md:p-8 rounded-lg border border-outline-variant/15 hover:border-primary-container/30 transition-all duration-500 group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-primary-container mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:animate-float">
                {feature.icon}
              </div>
              <h3 className="font-headline font-bold text-white uppercase mb-3 md:mb-4 text-sm md:text-base">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
