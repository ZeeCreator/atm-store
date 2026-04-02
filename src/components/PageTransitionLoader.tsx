'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icons } from './Icon';

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Show loading immediately when path changes
    setIsLoading(true);
    
    // Hide loader after animation completes
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, isMounted]);

  // Don't render until mounted to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* Loading Overlay */}
      <div
        className={`fixed inset-0 z-[200] bg-background flex items-center justify-center transition-opacity duration-400 ${
          isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center">
          <Icons.Spinner className="text-6xl text-primary-container animate-spin" />
          <p className="text-white/40 mt-6 font-headline uppercase tracking-widest text-sm animate-pulse">
            Loading...
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className={`fixed top-0 left-0 h-1 bg-primary-container z-[201] transition-all duration-400 ease-out ${
          isLoading ? 'w-full opacity-100' : 'w-0 opacity-0'
        }`}
      />
    </>
  );
}
