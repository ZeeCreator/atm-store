'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ProductCard from './ProductCard';
import { useStore, type Product } from '@/store/useStore';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Icons } from './Icon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

type FlashSaleConfig = {
  isActive: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  title: string;
  endTime: number | null;
};

export default function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 37 });
  const [config, setConfig] = useState<FlashSaleConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useScrollAnimation();

  useEffect(() => {
    // Fetch flash sale config from Firebase
    const configRef = ref(db, 'flashSale');
    const unsubscribeConfig = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setConfig({
          isActive: data.isActive ?? false,
          hours: data.hours ?? 4,
          minutes: data.minutes ?? 22,
          seconds: data.seconds ?? 37,
          title: data.title ?? 'Limited Flash Sale',
          endTime: data.endTime ?? null,
        });
      }
      setIsLoading(false);
    });

    // Fetch flash sale products from Firebase
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: Product[] = Object.entries(data)
          .map(([id, product]: [string, any]) => ({ id, ...product }))
          .filter((p) => p.isFlashSale)
          .slice(0, 4);
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    });

    return () => {
      unsubscribeConfig();
      unsubscribeProducts();
    };
  }, []);

  useEffect(() => {
    if (!config || !config.isActive) return;

    const timer = setInterval(() => {
      if (config.endTime) {
        // Use endTime for countdown
        const remaining = config.endTime - Date.now();
        if (remaining <= 0) {
          // Timer expired, reset
          setTimeLeft({ hours: config.hours, minutes: config.minutes, seconds: config.seconds });
        } else {
          const hours = Math.floor(remaining / 3600000);
          const minutes = Math.floor((remaining % 3600000) / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      } else {
        // Fallback to manual countdown
        setTimeLeft((prev) => {
          let { hours, minutes, seconds } = prev;

          if (seconds > 0) {
            seconds--;
          } else {
            seconds = 59;
            if (minutes > 0) {
              minutes--;
            } else {
              minutes = 59;
              if (hours > 0) {
                hours--;
              } else {
                // Reset timer
                return { hours: config.hours, minutes: config.minutes, seconds: config.seconds };
              }
            }
          }

          return { hours, minutes, seconds };
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // Don't render if flash sale is not active
  if (!config || !config.isActive) {
    return null;
  }

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Icons.Spinner className="text-5xl text-primary-container animate-spin mb-4" />
            <p className="text-white/60 font-headline uppercase tracking-widest text-sm">
              Loading Flash Sale...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-24 px-8 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 scroll-reveal">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 animate-fade-in-down">
              {config.title}
            </h2>
            <div className="flex items-center gap-6">
              <span className="text-primary-container font-headline font-bold text-xl tracking-tighter uppercase animate-pulse">
                Ends In:
              </span>
              <div className="flex gap-4">
                <div className="bg-surface-container-high px-4 py-2 rounded-md border border-outline-variant/15 text-center hover:scale-110 transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20">
                  <span className="block text-2xl font-black text-white animate-scale-in">
                    {formatTime(timeLeft.hours)}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    Hours
                  </span>
                </div>
                <div className="bg-surface-container-high px-4 py-2 rounded-md border border-outline-variant/15 text-center hover:scale-110 transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20 animation-delay-100">
                  <span className="block text-2xl font-black text-white animate-scale-in animation-delay-100">
                    {formatTime(timeLeft.minutes)}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    Mins
                  </span>
                </div>
                <div className="bg-surface-container-high px-4 py-2 rounded-md border border-outline-variant/15 text-center hover:scale-110 transition-transform duration-300 hover:shadow-lg hover:shadow-primary/20 animation-delay-200">
                  <span className="block text-2xl font-black text-white animate-scale-in animation-delay-200">
                    {formatTime(timeLeft.seconds)}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40">
                    Secs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id}
                className="scroll-reveal"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 scroll-reveal">
              <Icons.Box className="text-6xl text-white/30 mb-4 animate-float" />
              <p className="text-white/60 font-headline uppercase tracking-widest">
                No flash sale products available
              </p>
              <p className="text-white/40 text-sm mt-2">
                Check back later for exciting deals!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
