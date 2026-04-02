'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ref, onValue, set as setFirebase } from 'firebase/database';
import { db } from '@/lib/firebase';

// Sync site settings from Firebase
let settingsUnsubscribe: (() => void) | null = null;

function subscribeToSettings(set: any) {
  if (settingsUnsubscribe) {
    settingsUnsubscribe();
  }
  
  const settingsRef = ref(db, 'settings');
  settingsUnsubscribe = onValue(settingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      set({
        siteSettings: {
          storeName: data.store?.name || 'Aksesoris Touring Madiun',
          whatsappNumber: data.contact?.whatsappNumber || '6281234567890',
          whatsappMessageTemplate: data.message?.template || `*Halo {storeName}, saya ingin memesan:* 🛒

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

_Mohon konfirmasi ketersediaan barang dan ongkos kirim. Terima kasih!_ 🙏`,
          heroImage: data.hero?.image || '',
          heroTitle: data.hero?.title || 'Equip Your Adventure',
          heroSubtitle: data.hero?.subtitle || 'Engineered for the long haul.',
          primaryColor: data.theme?.primaryColor || '#ffb5a0',
          secondaryColor: data.theme?.secondaryColor || '#ff5625',
          logoText: data.store?.name || 'Aksesoris Touring Madiun',
        },
      });
    }
  });
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  images: string[];
  variants?: { name: string; value: string }[];
  stock: number;
  rating: number;
  reviews: number;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  discount?: number;
  createdAt: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  variant?: string;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface Order {
  orderNumber: string;
  orderSource: 'whatsapp' | 'direct';
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shippingCost: number | null;
  total: number | null;
  status: 'pending' | 'confirmed' | 'waiting_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  isConfirmed: boolean;
  waLink?: string;
  waMessage?: string;
  createdAt: number;
}

interface SiteSettings {
  storeName: string;
  whatsappNumber: string;
  whatsappMessageTemplate: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  secondaryColor: string;
  logoText: string;
}

interface StoreState {
  // Cart
  cart: CartItem[];
  userId: string | null;
  initUser: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Sync with Firebase
  syncCartWithFirebase: () => void;
  
  // Customer Info
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  
  // Site Settings (Customizable)
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  initSettingsSubscription: () => void;
  
  // Products (will be synced with Firebase)
  products: Product[];
  setProducts: (products: Product[]) => void;
}

const defaultSiteSettings: SiteSettings = {
  storeName: 'Aksesoris Touring Madiun',
  whatsappNumber: '6281234567890',
  whatsappMessageTemplate: `*Halo {storeName}, saya ingin memesan:* 🛒

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

_Mohon konfirmasi ketersediaan barang dan ongkos kirim. Terima kasih!_ 🙏`,
  heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3SIGEMLJKTAGSvfZLNUk23ehbscIccY93e9o9B4oHTKZwV_fNUZLk176YklwB7_nu6loNmoF2TsJ51qKDMML9KHVWSQV2kmaKwVs0YQ6g3t4o0tI5s0hRwpgF3MMWimlPfuQC0GJqj2PzLUHkbuRmQ0m2wB-czbBV5zkj4f6g6Mg-UQFvuoFth8VcOzi6MZH_0issVQKTqvZrcQcYsu3HaW7FbzfZ97tqYPSS7mGPTvAqt6V4orlq8ZBmfrkoPUNykrJcsc05sPsz',
  heroTitle: 'Equip Your Adventure',
  heroSubtitle: 'Engineered for the long haul. High-performance touring accessories designed for the rugged terrain of Madiun and beyond.',
  primaryColor: '#ffb5a0',
  secondaryColor: '#ff5625',
  logoText: 'Aksesoris Touring Madiun',
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // User ID for Firebase sync
      userId: null,
      initUser: () => {
        let userId = localStorage.getItem('atm_user_id');
        if (!userId) {
          userId = 'user_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('atm_user_id', userId);
        }
        set(() => ({ userId }));
        get().syncCartWithFirebase();
        
        // Subscribe to settings updates from Firebase
        subscribeToSettings(set);
      },

      // Initialize settings subscription (call this on app load)
      initSettingsSubscription: () => {
        subscribeToSettings(set);
      },
      
      // Cart State
      cart: [],
      
      // Sync cart with Firebase
      syncCartWithFirebase: () => {
        const userId = get().userId || localStorage.getItem('atm_user_id');
        if (!userId) return;
        
        // Save to Firebase
        setFirebase(ref(db, `carts/${userId}`), {
          cart: get().cart,
          updatedAt: Date.now(),
        });
      },
      
      addToCart: (item) => {
        console.log('=== ADD TO CART CALLED ===');
        console.log('Item to add:', item);
        
        set((state) => {
          console.log('Current cart state:', state.cart);
          
          const existingIndex = state.cart.findIndex(
            (cartItem) => 
              cartItem.productId === item.productId && 
              (cartItem.variant || undefined) === (item.variant || undefined)
          );

          if (existingIndex > -1) {
            console.log('Item exists, updating quantity');
            const newCart = [...state.cart];
            newCart[existingIndex].quantity += item.quantity;
            console.log('Updated cart:', newCart);
            return { cart: newCart };
          }

          console.log('Adding new item to cart');
          const newCart = [...state.cart, item];
          console.log('New cart:', newCart);
          return { cart: newCart };
        });

        console.log('=== ADD TO CART COMPLETE ===');

        // Sync to Firebase after short delay
        setTimeout(() => get().syncCartWithFirebase(), 100);
      },
      removeFromCart: (productId, variant) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => !(item.productId === productId && item.variant === variant)
          ),
        }));
        
        // Sync to Firebase after short delay
        setTimeout(() => get().syncCartWithFirebase(), 100);
      },
      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, variant);
          return;
        }
        
        set((state) => ({
          cart: state.cart.map((item) =>
            item.productId === productId && item.variant === variant
              ? { ...item, quantity }
              : item
          ),
        }));
        
        // Sync to Firebase after short delay
        setTimeout(() => get().syncCartWithFirebase(), 100);
      },
      clearCart: () => {
        set({ cart: [] });
        get().syncCartWithFirebase();
      },
      getCartTotal: () => {
        const cart = get().cart || [];
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getCartCount: () => {
        const cart = get().cart || [];
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      // Customer Info
      customerInfo: {
        name: '',
        phone: '',
        address: '',
        notes: '',
      },
      setCustomerInfo: (info) => {
        set((state) => ({
          customerInfo: { ...state.customerInfo, ...info },
        }));
      },
      
      // Site Settings
      siteSettings: defaultSiteSettings,
      updateSiteSettings: (settings) => {
        set((state) => ({
          siteSettings: { ...state.siteSettings, ...settings },
        }));
      },
      
      // Products
      products: [],
      setProducts: (products) => set({ products }),
    }),
    {
      name: 'atm-store',
      partialize: (state) => ({
        cart: state.cart,
        customerInfo: state.customerInfo,
        siteSettings: state.siteSettings,
      }),
    }
  )
);
