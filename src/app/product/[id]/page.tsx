'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { useStore, type Product, type CartItem } from '@/store/useStore';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, siteSettings } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const productRef = ref(db, `products/${params.id}`);
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProduct({ id: params.id as string, ...data });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price,
      variant: selectedVariant || undefined,
      quantity,
      image: product.images[selectedImage],
    };

    addToCart(cartItem);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleWhatsAppDirect = () => {
    if (!product) return;

    const message = `Halo ${siteSettings.storeName}, saya tertarik dengan produk ini:\n\n*${product.name}*\nHarga: ${formatPrice(product.price)}\n\nApakah masih tersedia?`;
    const waUrl = `https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
            <div className="aspect-square bg-surface-container-highest" />
            <div className="space-y-4 md:space-y-6">
              <div className="h-4 bg-surface-container-highest w-32" />
              <div className="h-10 md:h-12 bg-surface-container-highest w-3/4" />
              <div className="h-8 bg-surface-container-highest w-48" />
              <div className="h-20 bg-surface-container-highest" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen text-center">
          <h1 className="font-headline text-2xl md:text-4xl font-black uppercase text-white mb-4">
            Product Not Found
          </h1>
          <a href="/products" className="text-primary-container hover:underline text-sm md:text-base">
            Back to Catalog
          </a>
        </main>
        <Footer />
      </>
    );
  }

  const displayPrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price;
  const originalPrice = product.isFlashSale ? product.price : null;
  const discount = product.discount || (originalPrice
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0);

  return (
    <>
      {product && (
        <SEO
          title={`${product.name} - ${siteSettings?.storeName || 'ATM Autolighting'}`}
          description={product.description}
          keywords={`${product.name}, ${product.category}, aksesoris motor`}
          image={product.images[0]}
          type="product"
        />
      )}
      <Navbar />
      <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 md:mb-10 text-xs font-headline uppercase tracking-[0.2em] text-white/40 flex-wrap">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <i className="fa-solid fa-chevron-right text-[8px]"></i>
          <a href="/products" className="hover:text-primary transition-colors">Products</a>
          <i className="fa-solid fa-chevron-right text-[8px]"></i>
          <span className="text-primary-fixed-dim truncate max-w-[200px] md:max-w-md">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Product Images */}
          <div className="space-y-3 md:space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-surface-container-lowest overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary-container'
                        : 'border-transparent hover:border-white/30'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6 md:space-y-8">
            {/* Category & Rating */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary-fixed-dim truncate">
                {product.category} / {product.brand}
              </span>
              {product.rating > 0 && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-filled text-sm ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-500'
                            : 'text-white/20'
                        }`}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-white/60">
                    ({product.reviews} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h1 className="font-headline text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white break-words">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              <span className="font-headline text-2xl md:text-4xl font-black text-primary-container">
                {formatPrice(displayPrice)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-white/30 line-through text-sm md:text-xl">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="bg-primary-container text-on-primary px-2 py-1 text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="font-body text-white/80 leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <span className="text-xs md:text-sm font-headline font-bold uppercase tracking-widest text-white">
                  Select Variant
                </span>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.value}
                      onClick={() => setSelectedVariant(variant.value)}
                      className={`px-4 md:px-6 py-2 md:py-3 border font-headline font-bold uppercase tracking-widest text-xs md:text-sm transition-colors whitespace-nowrap ${
                        selectedVariant === variant.value
                          ? 'border-primary-container text-primary-container'
                          : 'border-white/30 text-white/60 hover:border-white'
                      }`}
                    >
                      {variant.name}: {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                  product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-xs md:text-sm font-body text-white/60">
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'} - {product.stock} available
              </span>
            </div>

            {/* Quantity */}
            <div className="space-y-3 md:space-y-4">
              <span className="text-xs md:text-sm font-headline font-bold uppercase tracking-widest text-white">
                Quantity
              </span>
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright transition-colors"
                >
                  <i className="fa-solid fa-minus text-sm md:text-base"></i>
                </button>
                <span className="w-14 md:w-16 text-center font-headline text-lg md:text-xl font-bold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 md:w-12 md:h-12 bg-surface-container-highest flex items-center justify-center hover:bg-surface-bright transition-colors"
                >
                  <i className="fa-solid fa-plus text-sm md:text-base"></i>
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-6 md:pt-8 border-t border-outline-variant/15">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-gradient-to-br from-primary to-primary-container px-4 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base btn-brutal"
              >
                <i className="fa-solid fa-cart-plus"></i>
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 bg-surface-container-highest px-4 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-white border border-white/10 rounded-md hover:bg-surface-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base btn-brutal"
              >
                Buy Now
              </button>
              <button
                onClick={handleWhatsAppDirect}
                disabled={product.stock <= 0}
                className="flex-1 bg-green-600 px-4 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base btn-brutal"
              >
                <i className="fa-brands fa-whatsapp"></i>
                Ask via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 md:mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          <div className="bg-surface-container-low p-6 md:p-8">
            <i className="fa-solid fa-truck-fast text-primary-container text-3xl md:text-4xl mb-3 md:mb-4"></i>
            <h3 className="font-headline font-bold text-white uppercase mb-2 text-sm md:text-base">
              Free Shipping
            </h3>
            <p className="text-xs md:text-sm text-white/60">
              For orders above Rp 1,000,000
            </p>
          </div>
          <div className="bg-surface-container-low p-6 md:p-8">
            <i className="fa-solid fa-shield-halved text-primary-container text-3xl md:text-4xl mb-3 md:mb-4"></i>
            <h3 className="font-headline font-bold text-white uppercase mb-2 text-sm md:text-base">
              Official Warranty
            </h3>
            <p className="text-xs md:text-sm text-white/60">
              1 year manufacturer warranty
            </p>
          </div>
          <div className="bg-surface-container-low p-6 md:p-8">
            <i className="fa-solid fa-rotate-left text-primary-container text-3xl md:text-4xl mb-3 md:mb-4"></i>
            <h3 className="font-headline font-bold text-white uppercase mb-2 text-sm md:text-base">
              Easy Returns
            </h3>
            <p className="text-xs md:text-sm text-white/60">
              30 days return policy
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
