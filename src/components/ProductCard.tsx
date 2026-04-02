'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    description: string;
    images: string[];
    stock: number;
    rating: number;
    reviews: number;
    isFlashSale?: boolean;
    flashSalePrice?: number;
    discount?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const displayPrice = product.isFlashSale && product.flashSalePrice
    ? product.flashSalePrice
    : product.price;

  const originalPrice = product.isFlashSale ? product.price : null;
  const discount = product.discount || (originalPrice
    ? Math.round((1 - displayPrice / originalPrice) * 100)
    : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      image: product.images[0],
    };
    
    console.log('🛒 ADD TO CART:', product.name);
    addToCart(cartItem);
    
    // Show visual feedback
    alert(`✅ ${product.name} added to cart!`);
  };

  return (
    <div className="group flex flex-col bg-surface-container-low transition-all duration-500 hover:bg-surface-container-high relative overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 rounded-lg">
      {/* Flash Sale Badge with Pulse */}
      {product.isFlashSale && discount > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-primary-container text-on-primary px-2 py-1 text-[10px] font-black uppercase tracking-tighter animate-pulse-glow rounded">
          Save {discount}%
        </div>
      )}

      {/* Product Image */}
      <Link href={`/product/${product.id}`} className="aspect-[4/5] overflow-hidden bg-surface-container-lowest relative">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={500}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
        />
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
          <div className="shimmer w-full h-full"></div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-primary-fixed-dim transition-colors duration-300 group-hover:text-primary">
            {product.category}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-primary-fixed-dim group-hover:text-yellow-500 transition-colors duration-300">
              <span className="text-[10px] text-yellow-500 animate-float">★</span>
              <span className="text-[10px] font-bold">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-headline text-xl font-bold uppercase tracking-tighter text-white mb-2 leading-tight hover:text-primary transition-all duration-300 hover:tracking-normal">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="font-body text-xs text-on-surface-variant mb-6 line-clamp-2 transition-opacity duration-300 group-hover:opacity-80">
          {product.description}
        </p>

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline text-lg font-black text-white group-hover:text-primary transition-colors duration-300">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && (
              <span className="text-white/30 line-through text-sm">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            type="button"
            className="bg-primary-container p-2 text-on-primary-container hover:bg-primary transition-all duration-300 rounded hover:scale-125 hover:shadow-lg hover:shadow-primary/50 active:scale-95"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>
    </div>
  );
}
