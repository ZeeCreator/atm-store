'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { type Product } from '@/store/useStore';
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

type TimeLeft = {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

export default function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 4, minutes: 22, seconds: 37, isExpired: false });
  const [config, setConfig] = useState<FlashSaleConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExpired, setHasExpired] = useState(false);
  const sectionRef = useScrollAnimation();

  // Fetch flash sale config dan products
  useEffect(() => {
    // Fetch flash sale config dari Firebase
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
    }, (error) => {
      console.error('Error fetching flash sale config:', error);
      setIsLoading(false);
    });

    // Fetch flash sale products dari Firebase
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allProducts: Product[] = Object.entries(data).map(([key, value]) => {
          const product = value as Product;
          return { ...product, id: key };
        });
        
        const productsList: Product[] = allProducts
          .filter((p) => p.isFlashSale === true)
          .slice(0, 8);
        
        setProducts(productsList);
      } else {
        setProducts([]);
      }
    }, (error) => {
      console.error('Error fetching products:', error);
      setProducts([]);
    });

    return () => {
      unsubscribeConfig();
      unsubscribeProducts();
    };
  }, []);

  // Countdown timer logic
  useEffect(() => {
    if (!config || !config.isActive) return;

    // Fungsi untuk menghitung waktu yang tersisa
    const calculateTimeLeft = (): TimeLeft => {
      if (config.endTime) {
        const remaining = config.endTime - Date.now();
        if (remaining <= 0) {
          return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
        }
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return { hours, minutes, seconds, isExpired: false };
      } else {
        // Fallback: hitung dari hours, minutes, seconds yang diset
        const totalSeconds = (config.hours * 3600) + (config.minutes * 60) + config.seconds;
        return { 
          hours: config.hours, 
          minutes: config.minutes, 
          seconds: config.seconds, 
          isExpired: false 
        };
      }
    };

    // Set initial time
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial.isExpired) {
      setHasExpired(true);
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isExpired) {
        setHasExpired(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config?.isActive, config?.endTime]);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // Jangan render jika flash sale tidak aktif
  if (!config || !config.isActive) {
    return null;
  }

  // Jangan render jika waktu sudah habis
  if (hasExpired && timeLeft.isExpired) {
    return (
      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Icons.Clock className="text-6xl text-white/30 mb-4" />
            <p className="text-white/60 font-headline uppercase tracking-widest text-sm">
              Flash Sale Telah Berakhir
            </p>
            <p className="text-white/40 text-sm mt-2">
              Nantikan flash sale berikutnya!
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Tampilkan loading state saat fetching data
  if (isLoading) {
    return (
      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <Icons.Spinner className="text-5xl text-primary-container animate-spin mb-4" />
            <p className="text-white/60 font-headline uppercase tracking-widest text-sm">
              Memuat Flash Sale...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-surface-container-lowest" style={{ position: 'relative', zIndex: 10 }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16 gap-6 md:gap-8">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-primary to-primary-container px-4 py-2 rounded-md flex items-center gap-2">
                <i className="fa-solid fa-bolt text-white text-sm"></i>
                <span className="text-white font-headline font-bold text-xs uppercase tracking-widest">
                  Limited Time
                </span>
              </div>
            </div>
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-4 md:mb-6" style={{ textShadow: '0 0 20px rgba(255,69,0,0.5)' }}>
              {config.title}
            </h2>
            <div className="flex items-center gap-4 md:gap-6 flex-wrap">
              <span className="text-primary-container font-headline font-bold text-base md:text-xl tracking-tighter uppercase">
                Berakhir Dalam:
              </span>
              <div className="flex gap-2 md:gap-4">
                <div className="bg-surface-container-high px-3 md:px-4 py-2 md:py-3 rounded-md border border-outline-variant/15 text-center min-w-[60px] md:min-w-[80px]" style={{ minWidth: '70px' }}>
                  <span className="block text-xl md:text-3xl font-black text-white">
                    {formatTime(timeLeft.hours)}
                  </span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/60">
                    Jam
                  </span>
                </div>
                <div className="bg-surface-container-high px-3 md:px-4 py-2 md:py-3 rounded-md border border-outline-variant/15 text-center min-w-[60px] md:min-w-[80px]" style={{ minWidth: '70px' }}>
                  <span className="block text-xl md:text-3xl font-black text-white">
                    {formatTime(timeLeft.minutes)}
                  </span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/60">
                    Menit
                  </span>
                </div>
                <div className="bg-surface-container-high px-3 md:px-4 py-2 md:py-3 rounded-md border border-outline-variant/15 text-center min-w-[60px] md:min-w-[80px]" style={{ minWidth: '70px' }}>
                  <span className="block text-xl md:text-3xl font-black text-white">
                    {formatTime(timeLeft.seconds)}
                  </span>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/60">
                    Detik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id}
              >
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 md:py-20">
              <Icons.Box className="text-5xl md:text-6xl text-white/30 mb-4 mx-auto" />
              <p className="text-white/60 font-headline uppercase tracking-widest text-sm md:text-base">
                Belum ada produk flash sale
              </p>
              <p className="text-white/40 text-xs md:text-sm mt-2">
                Periksa kembali nanti untuk penawaran menarik!
              </p>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="mt-8 md:mt-12 text-center">
            <a
              href="/products"
              className="inline-flex items-center gap-2 text-primary-container font-headline uppercase tracking-widest text-xs md:text-sm hover:underline decoration-2 underline-offset-4 transition-all duration-300 hover:translate-x-2"
            >
              Lihat Semua Produk
              <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
