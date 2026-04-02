'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [customerInfo, setCustomerInfoState] = useState<CustomerInfo>({ name: '', phone: '', address: '', notes: '' });

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('simple-cart');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setCart(data.cart || []);
        if (data.customerInfo) {
          setCustomerInfoState(data.customerInfo);
        }
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('simple-cart', JSON.stringify({ cart, customerInfo }));

      // Also sync to Firebase (optional)
      const userId = localStorage.getItem('atm_user_id');
      if (userId && cart.length > 0) {
        // Firebase sync can be added here if needed
      }
    }
  }, [cart, isLoaded, customerInfo]);

  const setCustomerInfo = (info: Partial<CustomerInfo>) => {
    setCustomerInfoState((prev) => ({ ...prev, ...info }));
  };

  const addToCart = (item: CartItem) => {
    console.log('=== ADD TO CART (NEW SYSTEM) ===');
    console.log('Adding item:', item);
    
    setCart((prevCart) => {
      console.log('Previous cart:', prevCart);
      
      const existingIndex = prevCart.findIndex(
        (cartItem) => 
          cartItem.productId === item.productId && 
          (cartItem.variant || undefined) === (item.variant || undefined)
      );

      if (existingIndex > -1) {
        console.log('Item exists, updating quantity');
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + item.quantity
        };
        console.log('Updated cart:', newCart);
        return newCart;
      }

      console.log('Adding new item');
      const newCart = [...prevCart, item];
      console.log('New cart:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart((prevCart) => 
      prevCart.filter(
        (item) => !(item.productId === productId && (item.variant || undefined) === (variant || undefined))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && (item.variant || undefined) === (variant || undefined)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
      getCartTotal,
      customerInfo,
      setCustomerInfo
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
