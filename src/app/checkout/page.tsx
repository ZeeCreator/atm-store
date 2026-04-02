'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/store/useStore';
import { ref, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { sanitizeInput, validatePhone } from '@/lib/security';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, removeFromCart, siteSettings } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Local customer info state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ATM-${year}${month}${day}-${hours}${minutes}${random}`;
  };

  const generateWhatsAppMessage = (orderNumber: string) => {
    const subtotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Generate items string
    const itemsString = cart.map((item, index) => {
      let itemStr = `${index + 1}. *${item.name}*`;
      if (item.variant) {
        itemStr += ` (${item.variant})`;
      }
      itemStr += `\n   └─ Qty: ${item.quantity} x ${formatPrice(item.price)}\n`;
      itemStr += `   └─ Subtotal: *${formatPrice(item.price * item.quantity)}*\n`;
      return itemStr;
    }).join('\n');

    // Get template from siteSettings or use default
    const template = siteSettings.whatsappMessageTemplate || `*Halo {storeName}, saya ingin memesan:* 🛒

━━━━━━━━━━━━━━━━━━━━━━
📋 *ORDER DETAILS*
━━━━━━━━━━━━━━━━━━━━━━

{items}

━━━━━━━━━━━━━━━━━━━━━━
💰 *PRICING SUMMARY*
━━━━━━━━━━━━━━━━━━━━━━
Subtotal: {subtotal}
Shipping: _Calculated by admin_

*TOTAL: {total} + Ongkir*

━━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━
Name: {name}
Phone: {phone}
Address: {address}
Notes: {notes}

━━━━━━━━━━━━━━━━━━━━━━
📦 *Order Number: {orderNumber}*
⏰ {timestamp}

_Mohon konfirmasi ketersediaan barang dan ongkos kirim. Terima kasih!_ 🙏`;

    // Replace placeholders
    let message = template
      .replace(/{storeName}/g, siteSettings.storeName)
      .replace(/{items}/g, itemsString)
      .replace(/{subtotal}/g, formatPrice(subtotal))
      .replace(/{total}/g, formatPrice(subtotal))
      .replace(/{name}/g, customerInfo.name)
      .replace(/{phone}/g, customerInfo.phone)
      .replace(/{address}/g, customerInfo.address)
      .replace(/{notes}/g, customerInfo.notes || '-')
      .replace(/{orderNumber}/g, orderNumber)
      .replace(/{timestamp}/g, new Date().toLocaleString('id-ID'));

    return message;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.name || customerInfo.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!validatePhone(customerInfo.phone)) {
      newErrors.phone = 'Invalid phone number (use format: 081234567890)';
    }

    if (!customerInfo.address || customerInfo.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      document.getElementById(firstError)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const orderNumber = generateOrderNumber();
      const message = generateWhatsAppMessage(orderNumber);

      const subtotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Save order to Firebase
      const orderData = {
        orderNumber,
        orderSource: 'whatsapp' as const,
        customer: {
          name: sanitizeInput(customerInfo.name),
          phone: sanitizeInput(customerInfo.phone),
          address: sanitizeInput(customerInfo.address),
          notes: sanitizeInput(customerInfo.notes || ''),
        },
        items: cart.map(item => ({
          productId: item.productId,
          name: sanitizeInput(item.name),
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || '', // Handle undefined variant
        })),
        subtotal,
        status: 'pending',
        createdAt: Date.now(),
        waMessage: message,
      };

      await push(ref(db, 'orders'), orderData);

      // Redirect to WhatsApp
      const waUrl = `https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      // Clear cart and redirect
      clearCart();
      
      // Open WhatsApp in new tab
      const newWindow = window.open(waUrl, '_blank');
      
      // Redirect to success page
      if (newWindow) {
        router.push('/success?order=' + orderNumber);
      } else {
        // Fallback if popup blocked
        window.location.href = waUrl;
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRemoveItem = (index: number) => {
    const item = cart[index];
    if (confirm(`Remove ${item.name} from cart?`)) {
      removeFromCart(item.productId);
    }
  };

  const subtotal = (cart || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (cart.length === 0) {
    return (
      <>
        <Navbar />
        <main className="pt-20 md:pt-28 pb-20 px-4 md:px-8 max-w-[1920px] mx-auto min-h-screen">
          <div className="text-center py-20">
            <i className="fa-solid fa-cart-arrow-down text-6xl text-white/20 mb-6"></i>
            <h1 className="font-headline text-2xl md:text-4xl font-black uppercase text-white mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-white/60 mb-8">Add some products before checkout</p>
            <button
              onClick={() => router.push('/products')}
              className="bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform"
            >
              Browse Products
            </button>
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
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-headline text-3xl md:text-5xl font-black uppercase text-white mb-4">
            <i className="fa-brands fa-whatsapp text-[#FF4500] mr-3"></i>
            Checkout via WhatsApp
          </h1>
          <p className="text-white/60 font-body">
            Fill in your details and we'll redirect you to WhatsApp to complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-user text-[#FF4500]"></i>
                Customer Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className={`w-full bg-surface-container-lowest border ${errors.name ? 'border-red-500' : 'border-outline-variant/30'} rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full bg-surface-container-lowest border ${errors.phone ? 'border-red-500' : 'border-outline-variant/30'} rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal`}
                    placeholder="e.g., 081234567890 or 0881026356541"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full bg-surface-container-lowest border ${errors.address ? 'border-red-500' : 'border-outline-variant/30'} rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal`}
                    placeholder="Complete address including postal code"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={customerInfo.notes || ''}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                    placeholder="Any special requests or questions?"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-shield-halved text-blue-400 text-xl mt-0.5"></i>
                <div>
                  <h4 className="font-headline font-bold text-blue-400 text-sm mb-1">
                    Secure Checkout
                  </h4>
                  <p className="text-xs text-blue-200/80">
                    Your order will be sent directly to our official WhatsApp number. No data is stored on third-party servers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 sticky top-28">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-receipt text-[#FF4500]"></i>
                Order Summary
              </h2>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto admin-scroll">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-outline-variant/15 last:border-0 group">
                    <div className="w-20 h-20 bg-surface-container-lowest rounded overflow-hidden flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Remove button overlay */}
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="absolute top-1 right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                        title="Remove item"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-headline font-bold text-white text-sm mb-1">
                          {item.name}
                        </h3>
                        {/* Mobile remove button */}
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="lg:hidden text-red-500 hover:text-red-400 p-1"
                          title="Remove item"
                        >
                          <i className="fa-solid fa-trash text-sm"></i>
                        </button>
                      </div>
                      {item.variant && (
                        <p className="text-xs text-white/60 mb-1">
                          Variant: {item.variant}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-white/60">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-headline font-bold text-primary text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 pt-6 border-t border-outline-variant/30">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-headline font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Shipping</span>
                  <span className="font-headline font-bold text-white/60">Calculated by admin</span>
                </div>
                <div className="flex justify-between text-lg pt-3 border-t border-outline-variant/30">
                  <span className="font-headline font-bold text-white">Total</span>
                  <span className="font-headline font-bold text-[#FF4500]">{formatPrice(subtotal)} + Ongkir</span>
                </div>
              </div>

              {/* Clear Cart Button */}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove all items from cart?')) {
                    clearCart();
                    router.push('/products');
                  }
                }}
                className="w-full mt-4 bg-surface-container-highest px-6 py-3 font-headline font-bold uppercase tracking-widest text-white/60 rounded-md border border-outline-variant/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <i className="fa-solid fa-trash-can"></i>
                Clear Cart
              </button>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full mt-4 bg-gradient-to-br from-green-600 to-green-700 px-8 py-4 font-headline font-bold uppercase tracking-widest text-white rounded-md hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 btn-brutal"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                {isProcessing ? 'Processing...' : 'Complete Order via WhatsApp'}
              </button>

              <p className="text-[10px] text-white/40 text-center mt-4">
                By clicking the button, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
