'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { getCartCount } = useCart();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [isStoreNameLoaded, setIsStoreNameLoaded] = useState(false);

  // Fetch store name from Firebase settings
  useEffect(() => {
    const settingsRef = ref(db, 'settings/store/name');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStoreName(data);
      } else {
        // Fallback jika tidak ada data
        setStoreName('Aksesoris Touring Madiun');
      }
      setIsStoreNameLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // Split store name for styling
  const nameParts = storeName ? storeName.split(' ') : ['Aksesoris', 'Touring', 'Madiun'];
  const nameFirst = nameParts[0];
  const nameRest = nameParts.slice(1).join(' ');

  // Check if current path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Get nav link classes based on active state
  const getNavLinkClasses = (path: string, isExternalScroll?: boolean) => {
    const active = isExternalScroll ? false : isActive(path);
    return `transition-colors ${
      active
        ? 'text-primary-container border-b-2 border-primary-container pb-1'
        : 'text-white/70 hover:text-white'
    }`;
  };

  useEffect(() => {
    // Initialize user
    const userId = localStorage.getItem('atm_user_id');
    if (!userId) {
      const newUserId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('atm_user_id', newUserId);
    }
    
    // Update cart count from context
    const updateCartCount = () => {
      const count = getCartCount();
      setCartCount(count);
    };
    
    updateCartCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Poll for updates
    const interval = setInterval(updateCartCount, 500);
    
    // Listen for Firebase cart changes
    const currentUserId = localStorage.getItem('atm_user_id');
    if (currentUserId) {
      const cartRef = ref(db, `carts/${currentUserId}`);
      const unsubscribe = onValue(cartRef, (snapshot) => {
        const data = snapshot.val();
        if (data?.cart) {
          updateCartCount();
        }
      });
      
      return () => {
        unsubscribe();
        window.removeEventListener('storage', updateCartCount);
        clearInterval(interval);
      };
    }
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, [getCartCount]);

  // Handle reviews link click - navigate to home and scroll to reviews
  const handleReviewsClick = (e: React.MouseEvent, isMobile: boolean = false) => {
    e.preventDefault();
    
    // If not on home page, navigate to home with hash
    if (pathname !== '/') {
      // Set flag for scroll on next page load
      sessionStorage.setItem('scrollToReviews', 'true');
      window.location.href = '/#reviews';
    } else {
      // If on home page, just scroll
      const element = document.getElementById('reviews');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Close mobile menu if open
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  // Handle features link click - navigate to home and scroll to features
  const handleFeaturesClick = (e: React.MouseEvent, isMobile: boolean = false) => {
    e.preventDefault();
    
    // If not on home page, navigate to home with hash
    if (pathname !== '/') {
      // Set flag for scroll on next page load
      sessionStorage.setItem('scrollToFeatures', 'true');
      window.location.href = '/#features';
    } else {
      // If on home page, just scroll
      const element = document.getElementById('features');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Close mobile menu if open
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-background/90 backdrop-blur-xl border-b border-outline-variant/15 transition-all duration-300">
      <nav className="flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-6 max-w-[1920px] mx-auto">
        {/* Logo */}
        <Link href="/" className="text-base md:text-xl font-black tracking-tight text-white font-headline uppercase tracking-tighter">
          {nameFirst} <span className="text-primary-container">{nameRest}</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-10 font-headline uppercase tracking-tighter text-sm">
          <Link href="/" className={getNavLinkClasses('/')}>
            {t.nav.home}
          </Link>
          <Link href="/products" className={getNavLinkClasses('/products')}>
            {t.nav.products}
          </Link>
          <Link href="/instagram" className={getNavLinkClasses('/instagram')}>
            Postingan
          </Link>
          <a
            href="#features"
            onClick={(e) => handleFeaturesClick(e, false)}
            className={getNavLinkClasses('/', true)}
          >
            {t.nav.features}
          </a>
          <a
            href="#reviews"
            onClick={(e) => handleReviewsClick(e, false)}
            className={getNavLinkClasses('/', true)}
          >
            {t.nav.reviews}
          </a>
          <Link href="/about" className={getNavLinkClasses('/about')}>
            {t.nav.about}
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-6">
          <LanguageSwitcher />
          
          <Link href="/cart" className="relative text-white/70 hover:text-primary-container transition-colors">
            <span className="text-2xl">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-container text-on-primary text-[10px] font-bold px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-2xl">{isMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-surface-container-low border-b border-outline-variant/15">
          <div className="flex flex-col px-4 md:px-8 py-6 space-y-6 font-headline uppercase tracking-tighter text-base">
            <div className="flex items-center justify-between py-2 border-b border-outline-variant/15">
              <span className="text-white/60 text-xs uppercase tracking-widest">Language</span>
              <LanguageSwitcher />
            </div>
            <Link href="/" className={getNavLinkClasses('/')} onClick={() => setIsMenuOpen(false)}>
              {t.nav.home}
            </Link>
            <Link href="/products" className={getNavLinkClasses('/products')} onClick={() => setIsMenuOpen(false)}>
              {t.nav.products}
            </Link>
            <Link href="/instagram" className={getNavLinkClasses('/instagram')} onClick={() => setIsMenuOpen(false)}>
              Postingan
            </Link>
            <a
              href="#features"
              onClick={(e) => handleFeaturesClick(e, true)}
              className={getNavLinkClasses('/', true)}
            >
              {t.nav.features}
            </a>
            <a
              href="#reviews"
              onClick={(e) => handleReviewsClick(e, true)}
              className={getNavLinkClasses('/', true)}
            >
              {t.nav.reviews}
            </a>
            <Link href="/about" className={getNavLinkClasses('/about')} onClick={() => setIsMenuOpen(false)}>
              {t.nav.about}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
