'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart, type CartItem, type CustomerInfo } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, getCartTotal, setCustomerInfo, customerInfo } = useCart();
  const [formData, setFormData] = useState<CustomerInfo>(customerInfo || { name: '', phone: '', address: '', notes: '' });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (setCustomerInfo) {
      setCustomerInfo({ [name]: value });
    }
  };

  const subtotal = getCartTotal();
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  if (!cart || cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
          <div className="text-center py-12 md:py-20">
            <span className="text-5xl md:text-6xl mb-4 block">🛒</span>
            <h1 className="font-headline text-2xl md:text-3xl font-black uppercase text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-white/60 mb-6 md:mb-8 text-sm md:text-base">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/products"
              className="bg-gradient-to-br from-primary to-primary-container px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform inline-block text-sm md:text-base"
            >
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 md:mb-10 text-xs font-headline uppercase tracking-[0.2em] text-white/40">
          <a href="/" className="hover:text-primary transition-colors">Home</a>
          <span className="text-[10px]">→</span>
          <span className="text-primary-fixed-dim">Cart</span>
        </nav>

        <h1 className="font-headline text-2xl md:text-4xl font-black uppercase tracking-tighter text-white mb-6 md:mb-10">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {cart.map((item, index) => (
              <div
                key={`${item.productId}-${item.variant || 'default'}-${index}`}
                className="flex gap-4 md:gap-6 bg-surface-container-low p-4 md:p-6"
              >
                {/* Product Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-surface-container-lowest overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline font-bold text-white uppercase mb-1 text-sm md:text-base truncate">
                    {item.name}
                  </h3>
                  {item.variant && (
                    <p className="text-xs md:text-sm text-white/40 mb-2 truncate">
                      Variant: {item.variant}
                    </p>
                  )}
                  <p className="font-headline font-black text-primary-container mb-3 md:mb-4 text-sm md:text-base">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center border border-outline-variant/30">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                        className="px-2 md:px-3 py-1 hover:bg-surface-container-highest transition-colors"
                      >
                        <span className="text-base md:text-lg">−</span>
                      </button>
                      <span className="px-3 md:px-4 font-headline font-bold text-white text-sm md:text-base">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                        className="px-2 md:px-3 py-1 hover:bg-surface-container-highest transition-colors"
                      >
                        <span className="text-base md:text-lg">+</span>
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId, item.variant)}
                      className="text-red-500 hover:text-red-400 text-xs md:text-sm font-headline uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right flex-shrink-0">
                  <p className="font-headline font-black text-white text-sm md:text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Form */}
          <div className="space-y-6 md:space-y-8">
            {/* Order Summary */}
            <div className="bg-surface-container-low p-4 md:p-6 space-y-3 md:space-y-4">
              <h2 className="font-headline font-bold text-white uppercase mb-4 text-sm md:text-base">
                Order Summary
              </h2>
              <div className="flex justify-between text-white/60 text-sm md:text-base">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/60 text-sm md:text-base">
                <span>Shipping</span>
                <span className="text-xs md:text-sm">Calculated via WhatsApp</span>
              </div>
              <div className="border-t border-outline-variant/15 pt-3 md:pt-4 flex justify-between">
                <span className="font-headline font-bold text-white uppercase text-sm md:text-base">Total</span>
                <span className="font-headline font-black text-primary-container text-lg md:text-xl">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="bg-surface-container-low p-4 md:p-6 space-y-3 md:space-y-4">
              <h2 className="font-headline font-bold text-white uppercase mb-4 text-sm md:text-base">
                Customer Information
              </h2>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-3 md:px-4 py-2 md:py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm md:text-base"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-3 md:px-4 py-2 md:py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary text-sm md:text-base"
                    placeholder="081234567890"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-3 md:px-4 py-2 md:py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm md:text-base"
                    placeholder="Enter your complete address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-white/60 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-3 md:px-4 py-2 md:py-3 text-white focus:ring-1 focus:ring-primary focus:border-primary resize-none text-sm md:text-base"
                    placeholder="Any special requests?"
                  />
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="block w-full bg-gradient-to-br from-primary to-primary-container px-6 md:px-8 py-3 md:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform text-center text-sm md:text-base"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
