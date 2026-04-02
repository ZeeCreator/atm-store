'use client';

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import ProductCard from '@/components/ProductCard';
import { useStore, type Product } from '@/store/useStore';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/Icon';
import { useLanguage } from '@/contexts/LanguageContext';

function CatalogContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { products } = useStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch categories from Firebase
  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(Object.values(data));
      } else {
        // Default categories
        setCategories([
          'Helmets',
          'Jackets',
          'Touring Boxes',
          'Gloves & Footwear',
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch products from Firebase
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: Product[] = Object.entries(data)
          .map(([id, product]: [string, any]) => ({ id, ...product }));
        setFilteredProducts(productsList);
      } else {
        // No products in database
        setFilteredProducts([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...(products || [])];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter - case insensitive
    if (selectedCategories.length > 0) {
      const selectedCatsLower = selectedCategories.map(c => c.toLowerCase());
      result = result.filter((p) => {
        const productCat = (p.category || '').toLowerCase();
        return selectedCatsLower.includes(productCat);
      });
    }

    // Check URL params
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== 'all') {
      const formattedCategory = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);
      const formattedCategoryLower = formattedCategory.toLowerCase();
      if (!selectedCategories.map(c => c.toLowerCase()).includes(formattedCategoryLower)) {
        result = result.filter((p) => {
          const productCat = (p.category || '').toLowerCase();
          return productCat === formattedCategoryLower;
        });
      }
    }

    // Price filter
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategories, priceRange, sortBy, searchParams]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatPriceDisplay = (price: number) => {
    if (price >= 1000000) {
      return `IDR ${price / 1000000}M`;
    }
    return `IDR ${price / 1000}`;
  };

  return (
    <>
      <SEO />
      <Navbar />
      <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 md:mb-10 text-xs font-headline uppercase tracking-[0.2em] text-white/40">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <Icons.ChevronRight className="text-[10px]" />
          <span className="text-primary-fixed-dim">Products</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Mobile Filters - Horizontal Scroll */}
          <div className="lg:hidden space-y-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t.products.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-lowest border-none text-sm px-4 py-2.5 w-full focus:ring-1 focus:ring-primary text-white pr-10 rounded-full"
              />
              <Icons.Search className="absolute right-3 top-2.5 text-white/40 text-sm" />
            </div>

            {/* Filter Chips - Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* Categories */}
              {categories.map((category) => {
                const productCount = products.filter((p) =>
                  (p.category || '').toLowerCase() === category.toLowerCase()
                ).length;
                const isSelected = selectedCategories.includes(category);

                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-headline font-bold uppercase tracking-wider transition-colors border ${
                      isSelected
                        ? 'bg-primary-container text-on-primary border-primary-container'
                        : 'bg-surface-container-low border-outline-variant/30 text-white/70 hover:border-white/50'
                    }`}
                  >
                    {category} {productCount > 0 && `(${productCount})`}
                  </button>
                );
              })}

              {/* Price Range Chip */}
              <div className="flex-shrink-0 relative">
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-headline font-bold uppercase tracking-wider bg-surface-container-low border border-outline-variant/30 text-white/70 whitespace-nowrap">
                  {formatPriceDisplay(priceRange[1])}
                </div>
              </div>

              {/* Sort Dropdown Chip */}
              <div className="flex-shrink-0 relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2 rounded-full text-sm font-headline font-bold uppercase tracking-wider bg-surface-container-low border border-outline-variant/30 text-white/70 pr-8 cursor-pointer focus:outline-none"
                >
                  <option value="newest">{t.products.newest}</option>
                  <option value="price-asc">{t.products.priceAsc}</option>
                  <option value="price-desc">{t.products.priceDesc}</option>
                  <option value="rating">{t.products.topRated}</option>
                </select>
                <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-full lg:w-72 flex-shrink-0 space-y-8 md:space-y-12">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={t.products.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-surface-container-lowest border-none text-sm px-4 py-3 w-full focus:ring-1 focus:ring-primary text-white pr-10"
              />
              <Icons.Search className="absolute right-3 top-3.5 text-white/40 text-sm" />
            </div>

            {/* Categories */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="font-headline text-lg font-bold uppercase tracking-tighter text-white">
                {t.products.categories}
              </h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const productCount = products.filter((p) =>
                    (p.category || '').toLowerCase() === category.toLowerCase()
                  ).length;

                  return (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="form-checkbox bg-surface-container-lowest border-outline-variant text-primary rounded-none focus:ring-0 accent-primary w-4 h-4"
                      />
                      <span className="text-sm font-body text-on-surface-variant group-hover:text-white transition-colors flex-1">
                        {category}
                      </span>
                      {productCount > 0 && (
                        <span className="text-xs text-white/40 bg-surface-container px-2 py-0.5 rounded">
                          {productCount}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="font-headline text-lg font-bold uppercase tracking-tighter text-white">
                {t.products.priceRange}
              </h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="100000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-1 bg-surface-container-high appearance-none cursor-pointer accent-primary-container"
                />
                <div className="flex justify-between mt-4 text-[10px] font-headline font-bold text-white/40 uppercase tracking-widest">
                  <span>IDR 0</span>
                  <span>IDR 20M+</span>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="font-headline text-lg font-bold uppercase tracking-tighter text-white">
                {t.products.sortBy}
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-low border-none text-sm font-headline font-bold uppercase tracking-tighter text-primary-fixed-dim focus:ring-0 py-2 px-3 w-full"
              >
                <option value="newest">{t.products.newest}</option>
                <option value="price-asc">{t.products.priceAsc}</option>
                <option value="price-desc">{t.products.priceDesc}</option>
                <option value="rating">{t.products.topRated}</option>
              </select>
            </div>
          </aside>

          {/* Main Catalog */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4 md:gap-6">
              <div>
                <h1 className="font-headline text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">
                  {t.products.title}
                </h1>
                <p className="font-body text-on-surface-variant text-sm">
                  {t.products.showingProducts.replace('{count}', filteredProducts.length.toString())}
                </p>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-surface-container-low">
                    <div className="aspect-[4/5] bg-surface-container-highest" />
                    <div className="p-4 md:p-6 space-y-4">
                      <div className="h-4 bg-surface-container-highest" />
                      <div className="h-6 bg-surface-container-highest w-3/4" />
                      <div className="h-10 bg-surface-container-highest" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Icons.Search className="text-5xl md:text-6xl text-white/30 mb-4" />
                <p className="text-white/60 font-headline uppercase tracking-widest text-sm md:text-base">
                  {t.products.noProductsFound}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Icons.Spinner className="text-5xl text-primary-container animate-spin" />
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
