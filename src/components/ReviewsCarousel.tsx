'use client';

import { useEffect, useState } from 'react';
import { Icons } from './Icon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Review {
  id: number;
  name: string;
  initial: string;
  avatarColor: string;
  rating: number;
  comment: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Andri Setiawan',
    initial: 'A',
    avatarColor: 'bg-primary-container',
    rating: 5,
    comment: 'Pelayanan sangat memuaskan, produk berkualitas dan pengiriman cepat. Sangat recommended untuk aksesoris touring!',
  },
  {
    id: 2,
    name: 'Budi Santoso',
    initial: 'B',
    avatarColor: 'bg-green-600',
    rating: 5,
    comment: 'Barang original dan harga bersaing. Owner ramah dan fast respon. Bakal langganan terus!',
  },
  {
    id: 3,
    name: 'Candra Wijaya',
    initial: 'C',
    avatarColor: 'bg-purple-600',
    rating: 5,
    comment: 'Kualitas produk top, packing rapi dan aman. Pengiriman ke luar kota juga cepat. Mantap!',
  },
  {
    id: 4,
    name: 'Dimas Prakoso',
    initial: 'D',
    avatarColor: 'bg-blue-600',
    rating: 5,
    comment: 'Tempat belanja aksesoris motor terlengkap di Madiun. Produk berkualitas dengan harga terjangkau!',
  },
  {
    id: 5,
    name: 'Eko Prasetyo',
    initial: 'E',
    avatarColor: 'bg-red-600',
    rating: 5,
    comment: 'Sangat puas belanja disini. Produk original, pelayanan ramah, dan garansi jelas. Highly recommended!',
  },
  {
    id: 6,
    name: 'Fajar Nugroho',
    initial: 'F',
    avatarColor: 'bg-orange-600',
    rating: 5,
    comment: 'Pengiriman cepat, barang sesuai deskripsi. Seller responsif dan helpful. Thanks!',
  },
];

export default function ReviewsCarousel() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const sectionRef = useScrollAnimation();

  // Reset direction after animation
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDirection(0);
    }, 700);
    return () => clearTimeout(timeout);
  }, [currentIndex]);

  // Auto scroll ke kanan setiap 3 detik
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const getVisibleReviews = () => {
    const visible: Review[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % reviews.length;
      visible.push(reviews[index]);
    }
    return visible;
  };

  const getVisibleReviewsMobile = () => {
    return [reviews[currentIndex]];
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section id="reviews" ref={sectionRef} className="py-24 px-8 bg-surface-container">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="font-headline text-4xl font-black uppercase tracking-tighter text-white mb-4 animate-fade-in-down">
            {t.reviews.title}
          </h2>
          <p className="text-white/40 uppercase tracking-widest text-xs animate-fade-in animation-delay-200">
            {t.reviews.subtitle}
          </p>
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icons.Star key={star} className="text-yellow-500 text-xl" />
              ))}
            </div>
            <span className="text-white font-headline uppercase tracking-widest text-sm">
              4.9 / 5.0
            </span>
          </div>
          <p className="text-white/40 text-sm mt-2">
            {t.reviews.ratingLabel}
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Carousel Track - Mobile (1 card) */}
          <div className="overflow-hidden md:hidden">
            <div className="relative">
              {getVisibleReviewsMobile().map((review) => (
                <div
                  key={review.id}
                  className="transition-all duration-700 ease-in-out"
                  style={{
                    animation: direction === 1 
                      ? 'slideInRight 0.7s ease-out forwards' 
                      : direction === -1 
                        ? 'slideInLeft 0.7s ease-out forwards'
                        : 'none',
                  }}
                >
                  <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/15">
                    <div className="flex items-center mb-3">
                      <div className={`w-10 h-10 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                        {review.initial}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <h4 className="text-white font-headline uppercase tracking-tighter text-sm truncate">
                          {review.name}
                        </h4>
                        <div className="flex items-center mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icons.Star key={star} className="text-yellow-500 text-xs" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Track - Desktop (3 cards) */}
          <div className="overflow-hidden hidden md:block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getVisibleReviews().map((review, index) => (
                <div
                  key={review.id}
                  className="bg-surface-container-low p-6 rounded-lg border border-outline-variant/15 transition-all duration-700 ease-in-out transform hover:scale-105 hover:shadow-xl hover:shadow-black/20"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`,
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-full ${review.avatarColor} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {review.initial}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-white font-headline uppercase tracking-tighter text-base">
                        {review.name}
                      </h4>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icons.Star key={star} className="text-yellow-500 text-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-surface-container hover:bg-surface-container-high border border-outline-variant/15 rounded-full p-3 text-white transition-all hover:scale-110"
            aria-label="Previous review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-surface-container hover:bg-surface-container-high border border-outline-variant/15 rounded-full p-3 text-white transition-all hover:scale-110"
            aria-label="Next review"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-primary-container w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Google Maps Link */}
        <div className="text-center mt-12">
          <a
            href="https://www.google.com/maps/place/ATM+AUTOLIGHTING+MADIUN+XPRO7MADIUN/@-7.6265666,111.4629936,14z/data=!4m15!1m7!3m6!1s0x2e79bfa7d1342359:0xd96fd6dbe37e4fea!2sATM+AUTOLIGHTING+MADIUN+XPRO7MADIUN!8m2!3d-7.6265739!4d111.5011128!16s%2Fg%2F11gt_xc1lj!3m6!1s0x2e79bfa7d1342359:0xd96fd6dbe37e4fea!8m2!3d-7.6265739!4d111.5011128!15sChhha3Nlc29yaXMgdG91cmluZyBtYWRpdW5aGiIYYWtzZXNvcmlzIHRvdXJpbmcgbWFkaXVukgEXYXV0b19lbGVjdHJpY2FsX3NlcnZpY2WaASNDaFpEU1VoTk1HOW5TMFZKUTBGblNVUlNOVW90VVZOUkVBReABAPoBBAgAECI!16s%2Fg%2F11gt_xc1lj?entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-primary-container font-headline uppercase tracking-widest text-sm hover:underline decoration-2 underline-offset-4"
          >
            <span>{t.reviews.seeMore}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
