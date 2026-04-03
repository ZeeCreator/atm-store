'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Icons } from '@/components/Icon';
import ImageUploader from '@/components/ImageUploader';
import AlertPopup from '@/components/admin/AlertPopup';
import AdminLayout from '@/components/admin/AdminLayout';
import UptimeMonitor from '@/components/admin/UptimeMonitor';
import { SalesChart, CategoryChart, StatsChart } from '@/components/admin/Charts';
import { ref, onValue, push, update, remove, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import '@/app/admin/admin-theme.css';
import {
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateURL,
  validateInstagramURL,
  validatePrice,
  validateStock,
  validateDiscount,
  validateProductData,
  validateSettingsData,
  escapeHTML,
} from '@/lib/security';
import SEOSettingsPanel from '@/components/SEOSettingsPanel';
import FlashSaleManager from '@/components/admin/FlashSaleManager';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  images: string[];
  stock: number;
  reviews: number;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  discount?: number;
  variants?: { name: string; value: string }[];
  createdAt: number;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState('auth');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [arsenalCategories, setArsenalCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [arsenalForm, setArsenalForm] = useState({ name: '', image: '', span: 'md:col-span-1', cardSize: 'medium' as 'small' | 'medium' | 'large' | 'full' });
  const [editingArsenalIndex, setEditingArsenalIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showArsenalImageUploader, setShowArsenalImageUploader] = useState(false);
  const [activeArsenalSubTab, setActiveArsenalSubTab] = useState<'categories' | 'layout'>('categories');
  const [arsenalLayoutSettings, setArsenalLayoutSettings] = useState({
    mobileGap: 12,
    desktopGap: 16,
    layoutStyle: 'classic',
    borderRadius: 'rounded-none',
    overlayOpacity: 60,
    textSize: 'normal',
    autoArrange: false,
  });
  const [isResizing, setIsResizing] = useState<{
    isResizing: boolean;
    mode: 'width' | 'height' | null;
    startX: number;
    startY: number;
    startValue: number;
  }>({ isResizing: false, mode: null, startX: 0, startY: 0, startValue: 0 });

  // Alert Popup State
  const [alertPopup, setAlertPopup] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    badgeText: '',
    badgeColor: '',
    primaryAction: undefined as (() => void) | undefined,
    primaryActionText: '',
    secondaryAction: undefined as (() => void) | undefined,
    secondaryActionText: '',
  });

  const showAlert = (config: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    badgeText?: string;
    badgeColor?: string;
    primaryAction?: () => void;
    primaryActionText?: string;
    secondaryAction?: () => void;
    secondaryActionText?: string;
  }) => {
    setAlertPopup({ 
      ...config, 
      isOpen: true,
      badgeText: config.badgeText || '',
      badgeColor: config.badgeColor || '',
      primaryAction: config.primaryAction,
      primaryActionText: config.primaryActionText || '',
      secondaryAction: config.secondaryAction,
      secondaryActionText: config.secondaryActionText || '',
    });
  };

  const closeAlert = () => {
    setAlertPopup((prev) => ({ ...prev, isOpen: false }));
  };

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    description: '',
    images: [] as string[],
    stock: '',
    isFlashSale: false,
    flashSalePrice: '',
    discount: '',
    variants: '',
  });

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    username: 'admin',
    password: 'admin',
    heroTitle: 'Equip Your Adventure',
    heroSubtitle: 'Engineered for the long haul.',
    heroImage: '',
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
    storeName: 'Aksesoris Touring Madiun',
    instagramTag: '#AksesorisTouringMadiun',
    aboutStory: '',
  });
  const [showHeroImageUploader, setShowHeroImageUploader] = useState(false);

  // Flash Sale Settings State
  const [flashSaleSettings, setFlashSaleSettings] = useState({
    isActive: false,
    hours: 4,
    minutes: 22,
    seconds: 37,
    title: 'Limited Flash Sale',
    endTime: null as number | null,
  });

  // Instagram Posts State
  const [instagramPosts, setInstagramPosts] = useState<any[]>([]);
  const [newInstagramPost, setNewInstagramPost] = useState('');
  const [newInstagramCaption, setNewInstagramCaption] = useState('');

  // Chart data states
  const [salesData, setSalesData] = useState({
    labels: [] as string[],
    sales: [] as number[],
    revenue: [] as number[],
  });
  const [categoryData, setCategoryData] = useState({
    labels: [] as string[],
    values: [] as number[],
  });

  // Pagination states
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const itemsPerPage = 10;

  // Store raw price value
  const [rawPrice, setRawPrice] = useState('');
  const [rawFlashSalePrice, setRawFlashSalePrice] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Fetch products
      const productsRef = ref(db, 'products');
      const unsubscribeProducts = onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsList: Product[] = Object.entries(data)
            .map(([id, product]: [string, any]) => ({ id, ...product }));
          setProducts(productsList);
        }
      });

      // Fetch orders
      const ordersRef = ref(db, 'orders');
      const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const ordersList = Object.entries(data)
            .map(([id, order]: [string, any]) => ({ id, ...order }));
          setOrders(ordersList);
        }
      });

      // Fetch site settings
      const settingsRef = ref(db, 'settings');
      const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSiteSettings(data);
          setSettingsForm({
            username: data.auth?.username || 'admin',
            password: data.auth?.password || 'admin',
            heroTitle: data.hero?.title || 'Equip Your Adventure',
            heroSubtitle: data.hero?.subtitle || 'Engineered for the long haul.',
            heroImage: data.hero?.image || '',
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
            storeName: data.store?.name || 'Aksesoris Touring Madiun',
            instagramTag: data.social?.instagramTag || '#AksesorisTouringMadiun',
            aboutStory: data.about?.storyContent || '',
          });
        }
      });

      // Fetch categories
      const categoriesRef = ref(db, 'categories');
      const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setCategories(Object.values(data));
        } else {
          setCategories(['Helmets', 'Jackets', 'Touring Boxes', 'Gloves & Footwear']);
        }
      });

      // Fetch arsenal categories
      const arsenalRef = ref(db, 'arsenal');
      const unsubscribeArsenal = onValue(arsenalRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setArsenalCategories(Object.values(data));
        } else {
          setArsenalCategories([]);
        }
      });

      // Fetch arsenal layout settings
      const arsenalLayoutRef = ref(db, 'arsenalLayout');
      const unsubscribeArsenalLayout = onValue(arsenalLayoutRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setArsenalLayoutSettings({
            mobileGap: data.mobileGap ?? 12,
            desktopGap: data.desktopGap ?? 16,
            layoutStyle: data.layoutStyle ?? 'classic',
            borderRadius: data.borderRadius ?? 'rounded-none',
            overlayOpacity: data.overlayOpacity ?? 60,
            textSize: data.textSize ?? 'normal',
            autoArrange: data.autoArrange ?? false,
          });
        }
      });

      // Fetch flash sale settings
      const flashSaleRef = ref(db, 'flashSale');
      const unsubscribeFlashSale = onValue(flashSaleRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setFlashSaleSettings({
            isActive: data.isActive ?? false,
            hours: data.hours ?? 4,
            minutes: data.minutes ?? 22,
            seconds: data.seconds ?? 37,
            title: data.title ?? 'Limited Flash Sale',
            endTime: data.endTime ?? null,
          });
        }
      });

      // Fetch instagram posts
      const instagramRef = ref(db, 'instagram');
      const unsubscribeInstagram = onValue(instagramRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setInstagramPosts(Object.values(data) as string[]);
        } else {
          setInstagramPosts([]);
        }
      });

      // Load chart data
      loadChartData();

      setIsLoading(false);

      return () => {
        unsubscribeProducts();
        unsubscribeOrders();
        unsubscribeSettings();
        unsubscribeCategories();
        unsubscribeArsenal();
        unsubscribeArsenalLayout();
        unsubscribeFlashSale();
        unsubscribeInstagram();
      };
    }
  }, [user]);

  const loadChartData = async () => {
    try {
      // Get last 7 days labels
      const labels = [];
      const salesByDate = new Map<string, number>();
      const revenueByDate = new Map<string, number>();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        labels.push(dateStr);
        salesByDate.set(dateStr, 0);
        revenueByDate.set(dateStr, 0);
      }

      // Get orders data
      const ordersRef = ref(db, 'orders');
      const ordersSnap = await get(ordersRef);
      if (ordersSnap.exists()) {
        const ordersData = ordersSnap.val();
        Object.values(ordersData).forEach((order: any) => {
          const orderDate = new Date(order.createdAt || Date.now());
          const dateStr = orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (salesByDate.has(dateStr)) {
            salesByDate.set(dateStr, (salesByDate.get(dateStr) || 0) + 1);
            revenueByDate.set(dateStr, (revenueByDate.get(dateStr) || 0) + (order.subtotal || 0));
          }
        });
      }

      setSalesData({
        labels,
        sales: Array.from(salesByDate.values()),
        revenue: Array.from(revenueByDate.values()),
      });

      // Get category data
      const productsRef = ref(db, 'products');
      const productsSnap = await get(productsRef);
      const categoryCount = new Map<string, number>();
      
      if (productsSnap.exists()) {
        const productsData = productsSnap.val();
        Object.values(productsData).forEach((product: any) => {
          const cat = product.category || 'Uncategorized';
          categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
        });
      }

      setCategoryData({
        labels: Array.from(categoryCount.keys()),
        values: Array.from(categoryCount.values()),
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format number with thousand separator
  const formatNumberWithThousands = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits === '0') return '0';
    const groups = [];
    let remaining = digits;
    while (remaining.length > 3) {
      groups.unshift(remaining.slice(-3));
      remaining = remaining.slice(0, -3);
    }
    if (remaining) {
      groups.unshift(remaining);
    }
    return groups.join('.');
  };

  const parseFormattedNumber = (value: string): string => {
    return value.replace(/\./g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === 'price') {
      const rawValue = value.replace(/\D/g, '');
      setRawPrice(rawValue);
      const formattedValue = formatNumberWithThousands(rawValue);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    if (name === 'flashSalePrice') {
      const rawValue = value.replace(/\D/g, '');
      setRawFlashSalePrice(rawValue);
      const formattedValue = formatNumberWithThousands(rawValue);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(formData.name),
      category: sanitizeInput(formData.category),
      brand: sanitizeInput(formData.brand),
      description: sanitizeInput(formData.description),
      images: formData.images,
      stock: parseInt(formData.stock) || 0,
      price: rawPrice ? parseInt(rawPrice) : 0,
      isFlashSale: formData.isFlashSale,
      flashSalePrice: rawFlashSalePrice ? parseInt(rawFlashSalePrice) : 0,
      discount: formData.discount ? parseInt(formData.discount) : 0,
    };

    // Validate product data
    const validation = validateProductData({
      ...sanitizedData,
      variants: formData.variants,
    });

    if (!validation.valid) {
      showAlert({
        type: 'error',
        title: 'VALIDATION ERROR',
        message: validation.errors.join('. '),
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
      return;
    }

    const productData: any = {
      ...sanitizedData,
      reviews: 0,
      createdAt: Date.now(),
    };

    if (sanitizedData.isFlashSale && sanitizedData.flashSalePrice) {
      productData.flashSalePrice = sanitizedData.flashSalePrice;
    }
    if (sanitizedData.isFlashSale && sanitizedData.discount) {
      productData.discount = sanitizedData.discount;
    }
    if (formData.variants && formData.variants.trim()) {
      try {
        productData.variants = JSON.parse(formData.variants);
      } catch (error) {
        showAlert({
          type: 'error',
          title: 'INVALID VARIANTS',
          message: 'Please enter valid JSON for variants.',
          badgeText: 'ERROR',
          badgeColor: 'bg-error-container text-on-error-container',
        });
        return;
      }
    }

    try {
      if (editingProduct) {
        await update(ref(db, `products/${editingProduct.id}`), productData);
        showAlert({
          type: 'success',
          title: 'PRODUCT UPDATED',
          message: `${productData.name} has been successfully updated.`,
          badgeText: 'UPDATED',
          badgeColor: 'bg-green-900/30 text-green-200',
        });
      } else {
        await push(ref(db, 'products'), productData);
        showAlert({
          type: 'success',
          title: 'PRODUCT CREATED',
          message: `${productData.name} has been successfully added to inventory.`,
          badgeText: 'CREATED',
          badgeColor: 'bg-green-900/30 text-green-200',
        });
      }

      resetForm();
      setShowProductForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert({
        type: 'error',
        title: 'SAVE FAILED',
        message: 'Failed to save product. Please try again.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setRawPrice(product.price.toString());
    setRawFlashSalePrice(product.flashSalePrice?.toString() || '');
    setFormData({
      name: product.name,
      price: product.price > 0 ? formatNumberWithThousands(product.price.toString()) : '',
      category: product.category,
      brand: product.brand,
      description: product.description,
      images: product.images,
      stock: product.stock.toString(),
      isFlashSale: product.isFlashSale || false,
      flashSalePrice: product.flashSalePrice && product.flashSalePrice > 0 ? formatNumberWithThousands(product.flashSalePrice.toString()) : '',
      discount: product.discount?.toString() || '',
      variants: product.variants ? JSON.stringify(product.variants) : '',
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await remove(ref(db, `products/${id}`));
      showAlert({
        type: 'success',
        title: 'PRODUCT DELETED',
        message: 'Product has been successfully removed from the inventory.',
        badgeText: 'DELETED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      showAlert({
        type: 'error',
        title: 'DELETION FAILED',
        message: 'Failed to delete product. Please try again.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const handleSaveSettings = async () => {
    // Validate settings data
    const validation = validateSettingsData(settingsForm);

    if (!validation.valid) {
      showAlert({
        type: 'error',
        title: 'VALIDATION ERROR',
        message: validation.errors.join('. '),
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
      return;
    }

    try {
      await update(ref(db, 'settings'), {
        auth: {
          username: sanitizeInput(settingsForm.username),
          password: settingsForm.password, // Password should be hashed in production
        },
        hero: {
          title: sanitizeInput(settingsForm.heroTitle),
          subtitle: sanitizeInput(settingsForm.heroSubtitle),
          image: settingsForm.heroImage,
        },
        contact: {
          whatsappNumber: sanitizeInput(settingsForm.whatsappNumber),
        },
        message: {
          template: settingsForm.whatsappMessageTemplate,
        },
        store: {
          name: sanitizeInput(settingsForm.storeName),
        },
        social: {
          instagramTag: sanitizeInput(settingsForm.instagramTag),
        },
        about: {
          storyContent: settingsForm.aboutStory,
        },
      });
      showAlert({
        type: 'success',
        title: 'SETTINGS SAVED',
        message: 'All configuration parameters have been successfully updated.',
        badgeText: 'SYSTEM UPDATED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      showAlert({
        type: 'error',
        title: 'SYSTEM PROTOCOL FAILURE',
        message: 'Failed to save settings. Please check your connection and try again.',
        badgeText: 'ERROR CODE: 0xSET01',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      brand: '',
      description: '',
      images: [],
      stock: '',
      isFlashSale: false,
      flashSalePrice: '',
      discount: '',
      variants: '',
    });
    setEditingProduct(null);
    setRawPrice('');
    setRawFlashSalePrice('');
  };

  // Category Functions
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      showAlert({
        type: 'warning',
        title: 'DUPLICATE CATEGORY',
        message: 'This category already exists.',
        badgeText: 'ERROR',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    try {
      const categoryName = newCategory.trim();
      await push(ref(db, 'categories'), categoryName);
      
      // Auto-sync to Arsenal dengan default image
      const defaultImages: Record<string, string> = {
        'Helmets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrOPHs5QuRC38lRDmTmY7sKn-kb8EZ8BsGj8Xl5B3bRu8UnoA4e99K4Z-zbYsslzIJYfRXBUWtj3rH3H8HAA35chxCMfJsaQQ59QpYujAsi90TDrEKoRsCsppgQpZJpblVnFBAUi6C7v7T-PDHpyYnaYOQ0d7vn5G0dFeD5RStwk-8EuemUqL9fvlG_cYiwHOst3wsf3QEpqh0iNPTI2a4sw_xuBJZq0XGhTb-i8L4CVVGKYJMaAtXnrQ2Lb916fdhbnhPFtuiSkTY',
        'Jackets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRvy3mzvo2UQMoY5soIh0ZM5mbjAg_Pq8c3y725s5z2lpmcFzDvArcy_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
        'Touring Boxes': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvZm2AEgCSr59eO8y8ZmGly7MOBQCZX5wZX0ffQghSfNhcQ1jMvIMQi_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
        'Gloves & Footwear': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxvenesZ98H4sbxJAaGB125WR9o_doEeMf-WFVf3Nv8jK3jbbjG0QDHOtwPhJPo0WwqSV75dTCTcH6LYdSLr3VMb5FI8tCSMDNYaIpGyjAdfIaSSjpAHDXy2c7QqvF43pvnU8bMbwzKKbkP36M8GQ1JMxwZSwjd2r3_hQUt5vBQeX5rNdGCKZzPTJh66dINiNOELOeVE8SsoVigCDSYZnxNHtFTwggqoYjGp7ErrK0IEmBheN-prFr9e1tzPd2CeXB4eTbmktIko5',
      };
      
      // Cek apakah arsenal sudah ada data
      const arsenalRef = ref(db, 'arsenal');
      const arsenalSnapshot = await get(arsenalRef);
      const arsenalData = arsenalSnapshot.val();

      // Jika category belum ada di arsenal, tambahkan
      const categoryExistsInArsenal = arsenalData && Object.values(arsenalData).some((c: any) =>
        c.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (!categoryExistsInArsenal) {
        const newArsenalItem = {
          name: categoryName,
          image: defaultImages[categoryName] || '', // Gunakan default atau kosong (tidak pakai random)
          span: '',
        };
        await push(arsenalRef, newArsenalItem);
      }
      
      setNewCategory('');
      showAlert({
        type: 'success',
        title: 'CATEGORY ADDED',
        message: `Category "${categoryName}" has been added to Categories and Arsenal.`,
        badgeText: 'ADDED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'ADD FAILED',
        message: 'Failed to add category.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!confirm(`Delete category "${category}"?`)) return;

    try {
      const categoriesRef = ref(db, 'categories');
      const snapshot = await onValue(categoriesRef, (snap) => {
        const data = snap.val();
        if (data) {
          Object.entries(data).forEach(([key, value]: [string, any]) => {
            if (value === category) {
              remove(ref(db, `categories/${key}`));
            }
          });
        }
      });
      showAlert({
        type: 'success',
        title: 'CATEGORY DELETED',
        message: `Category "${category}" has been deleted.`,
        badgeText: 'DELETED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'DELETE FAILED',
        message: 'Failed to delete category.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  // Arsenal Functions
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newArsenal = [...arsenalCategories];
    const draggedItem = newArsenal[draggedIndex];
    newArsenal.splice(draggedIndex, 1);
    newArsenal.splice(index, 0, draggedItem);
    setArsenalCategories(newArsenal);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddArsenalCategory = () => {
    if (!arsenalForm.name || !arsenalForm.image) {
      showAlert({
        type: 'warning',
        title: 'MISSING INFO',
        message: 'Please fill in name and image URL.',
        badgeText: 'ERROR',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    const newArsenal = [...arsenalCategories, { ...arsenalForm }];
    setArsenalCategories(newArsenal);
    setArsenalForm({ name: '', image: '', span: 'md:col-span-1', cardSize: 'medium' });
  };

  const handleEditArsenalCategory = (index: number) => {
    const category = arsenalCategories[index];
    setArsenalForm(category);
    setEditingArsenalIndex(index);
  };

  const handleUpdateArsenalCategory = () => {
    if (!arsenalForm.name || !arsenalForm.image) {
      showAlert({
        type: 'warning',
        title: 'MISSING INFO',
        message: 'Please fill in name and image URL.',
        badgeText: 'ERROR',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    const newArsenal = [...arsenalCategories];
    if (editingArsenalIndex !== null) {
      newArsenal[editingArsenalIndex] = { ...arsenalForm };
      setArsenalCategories(newArsenal);
      setArsenalForm({ name: '', image: '', span: 'md:col-span-1', cardSize: 'medium' });
      setEditingArsenalIndex(null);
    }
  };

  const handleDeleteArsenalCategory = (index: number) => {
    if (!confirm('Delete this category?')) return;

    const newArsenal = arsenalCategories.filter((_, i) => i !== index);
    setArsenalCategories(newArsenal);
    if (editingArsenalIndex === index) {
      setArsenalForm({ name: '', image: '', span: 'md:col-span-1' });
      setEditingArsenalIndex(null);
    }
  };

  const handleCancelArsenal = () => {
    setArsenalForm({ name: '', image: '', span: 'md:col-span-1', cardSize: 'medium' });
    setEditingArsenalIndex(null);
  };

  // Auto-arrange function - Layout Bento seperti screenshot
  const handleAutoArrangeArsenal = (pattern: 'classic' | 'bento' | 'uniform' | 'mixed' = 'classic') => {
    if (arsenalCategories.length === 0) {
      showAlert({
        type: 'warning',
        title: 'NO CATEGORIES',
        message: 'Tambahkan kategori terlebih dahulu sebelum auto-arrange.',
        badgeText: 'WARNING',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    const total = arsenalCategories.length;
    const newArsenal = arsenalCategories.map((cat: any, index: number) => {
      let cardSize: 'small' | 'medium' | 'large' | 'full' = 'medium';

      if (pattern === 'classic') {
        // Pattern screenshot: 1 besar kiri, 2 kecil kanan atas, 1 lebar kanan bawah
        if (total === 1) {
          cardSize = 'full';
        } else if (total === 2) {
          cardSize = index === 0 ? 'large' : 'large';
        } else if (total === 3) {
          if (index === 0) cardSize = 'large';
          else cardSize = 'small';
        } else if (total >= 4) {
          if (index === 0) cardSize = 'large';
          else if (index === 1 || index === 2) cardSize = 'small';
          else if (index === 3) cardSize = 'medium';
          else cardSize = 'medium';
        }
      } else if (pattern === 'bento') {
        // Pattern bento: variasi lain
        if (total === 1) {
          cardSize = 'full';
        } else if (total === 2) {
          cardSize = index === 0 ? 'large' : 'medium';
        } else if (total === 3) {
          if (index === 0) cardSize = 'large';
          else cardSize = 'small';
        } else if (total === 4) {
          if (index === 0) cardSize = 'large';
          else if (index === 1 || index === 2) cardSize = 'small';
          else cardSize = 'medium';
        } else {
          if (index === 0) cardSize = 'large';
          else if (index < total - 1 && index % 3 !== 0) cardSize = 'small';
          else cardSize = 'medium';
        }
      } else if (pattern === 'uniform') {
        // Semua ukuran sama
        cardSize = 'medium';
      } else if (pattern === 'mixed') {
        // Campuran acak
        const sizes: Array<'small' | 'medium' | 'large' | 'full'> = ['small', 'medium', 'large'];
        if (index === 0) cardSize = 'large';
        else if (index === total - 1) cardSize = 'medium';
        else cardSize = sizes[index % 3];
      }

      return { ...cat, cardSize };
    });

    setArsenalCategories(newArsenal);
    setArsenalLayoutSettings(prev => ({ ...prev, autoArrange: true }));

    showAlert({
      type: 'success',
      title: 'AUTO-ARRANGE',
      message: `Layout "${pattern}" diterapkan pada ${total} kategori.`,
      badgeText: 'ARRANGED',
      badgeColor: 'bg-blue-900/30 text-blue-200',
    });
  };

  const handleSaveArsenal = async () => {
    try {
      await set(ref(db, 'arsenal'), arsenalCategories);
      showAlert({
        type: 'success',
        title: 'ARSENAL SAVED',
        message: 'Arsenal categories have been saved successfully.',
        badgeText: 'SAVED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'SAVE FAILED',
        message: 'Failed to save arsenal categories.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  // Arsenal Layout Settings Functions
  const handleSaveArsenalLayout = async () => {
    try {
      await set(ref(db, 'arsenalLayout'), arsenalLayoutSettings);
      showAlert({
        type: 'success',
        title: 'LAYOUT SAVED',
        message: 'Arsenal layout settings have been saved successfully.',
        badgeText: 'SAVED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'SAVE FAILED',
        message: 'Failed to save arsenal layout settings.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const handleResetArsenalLayout = () => {
    setArsenalLayoutSettings({
      mobileGap: 12,
      desktopGap: 16,
      layoutStyle: 'classic',
      borderRadius: 'rounded-none',
      overlayOpacity: 60,
      textSize: 'normal',
      autoArrange: false,
    });
    showAlert({
      type: 'info',
      title: 'LAYOUT RESET',
      message: 'Layout settings telah direset ke default. Klik Save untuk menerapkan.',
      badgeText: 'RESET',
      badgeColor: 'bg-blue-900/30 text-blue-200',
    });
  };

  // Resize Handlers - Simplified for Bento Layout
  const handleResizeStart = (mode: 'width' | 'height', e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setIsResizing({
      isResizing: true,
      mode,
      startX: clientX,
      startY: clientY,
      startValue: mode === 'width' ? arsenalLayoutSettings.desktopGap : arsenalLayoutSettings.overlayOpacity,
    });
  };

  useEffect(() => {
    if (!isResizing.isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isResizing.mode === 'width') {
        const deltaX = clientX - isResizing.startX;
        const deltaGap = Math.round(deltaX / 10); // Setiap 10px = 4px gap
        const newGap = Math.max(4, Math.min(32, isResizing.startValue + deltaGap * 4));
        if (newGap !== arsenalLayoutSettings.desktopGap) {
          setArsenalLayoutSettings(prev => ({ ...prev, desktopGap: newGap, mobileGap: Math.max(4, newGap / 2) }));
        }
      } else if (isResizing.mode === 'height') {
        const deltaY = clientY - isResizing.startY;
        const newOpacity = Math.max(0, Math.min(100, isResizing.startValue - deltaY / 3));
        if (newOpacity !== arsenalLayoutSettings.overlayOpacity) {
          setArsenalLayoutSettings(prev => ({ ...prev, overlayOpacity: Math.round(newOpacity) }));
        }
      }
    };

    const handleEnd = () => {
      setIsResizing({ isResizing: false, mode: null, startX: 0, startY: 0, startValue: 0 });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isResizing]);

  // Instagram Functions
  const handleAddInstagramPost = () => {
    if (!newInstagramPost.trim()) {
      showAlert({
        type: 'warning',
        title: 'MISSING URL',
        message: 'Please enter Instagram post URL.',
        badgeText: 'ERROR',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    // Validate Instagram URL with enhanced security
    if (!validateInstagramURL(newInstagramPost)) {
      showAlert({
        type: 'error',
        title: 'INVALID URL',
        message: 'Please enter a valid Instagram post URL (e.g., https://www.instagram.com/p/ABC123/).',
        badgeText: 'SECURITY ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
      return;
    }

    // Additional URL validation
    try {
      const url = new URL(newInstagramPost);
      if (url.protocol !== 'https:') {
        showAlert({
          type: 'error',
          title: 'INSECURE URL',
          message: 'Only HTTPS URLs are allowed for security.',
          badgeText: 'SECURITY ERROR',
          badgeColor: 'bg-error-container text-on-error-container',
        });
        return;
      }
    } catch {
      showAlert({
        type: 'error',
        title: 'INVALID URL FORMAT',
        message: 'The URL format is invalid.',
        badgeText: 'SECURITY ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
      return;
    }

    // Check for duplicate URL
    if (instagramPosts.some(post => post.url === newInstagramPost)) {
      showAlert({
        type: 'warning',
        title: 'DUPLICATE POST',
        message: 'This post already exists.',
        badgeText: 'ERROR',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    const newPost = {
      url: newInstagramPost,
      caption: newInstagramCaption,
      createdAt: Date.now(),
    };
    
    const newPosts = [...instagramPosts, newPost];
    setInstagramPosts(newPosts);
    setNewInstagramPost('');
    setNewInstagramCaption('');
  };

  const handleDeleteInstagramPost = (index: number) => {
    if (!confirm('Delete this Instagram post?')) return;

    const newPosts = instagramPosts.filter((_, i) => i !== index);
    setInstagramPosts(newPosts);
  };

  const handleSaveInstagram = async () => {
    try {
      await set(ref(db, 'instagram'), instagramPosts);
      showAlert({
        type: 'success',
        title: 'INSTAGRAM SAVED',
        message: 'Instagram posts have been saved successfully.',
        badgeText: 'SAVED',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'SAVE FAILED',
        message: 'Failed to save Instagram posts.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  // Dashboard Stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const lowStockProducts = products.filter((p) => p.stock < 10).length;

  // Pagination calculations
  const totalPagesProducts = Math.ceil(products.length / itemsPerPage);
  const totalPagesOrders = Math.ceil(orders.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage
  );
  const paginatedOrders = orders.slice(
    (ordersPage - 1) * itemsPerPage,
    ordersPage * itemsPerPage
  );

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131313]">
        <div className="text-center">
          <Icons.Spinner className="text-5xl text-primary-container animate-spin" />
          <p className="text-white/40 mt-4 font-headline uppercase tracking-widest text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AdminLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
      productsCount={products.length}
      ordersCount={orders.length}
      instagramCount={instagramPosts.length}
    >
      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Dashboard Header */}
          <div className="mb-10">
            <h2 className="text-5xl font-headline font-bold uppercase tracking-tighter mb-2">
              Operations <span className="text-[#FF4500]">Dashboard</span>
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">
                System Status: Active
              </span>
              <span className="bg-[#1c1b1b] text-gray-500 text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">
                Real-time Data
              </span>
            </div>
          </div>

          {/* Uptime Monitor */}
          <div className="mb-10">
            <UptimeMonitor />
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-surface-container-low p-6 flex flex-col justify-between group hover:bg-surface-container-high transition-all kpi-card">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  {t.admin.totalRevenue}
                </span>
                <i className="fa-solid fa-coins text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-3xl font-headline font-bold">{formatPrice(totalRevenue)}</h3>
                <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                  <i className="fa-solid fa-arrow-trend-up text-xs"></i> Real-time
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 flex flex-col justify-between group hover:bg-surface-container-high transition-all kpi-card">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  {t.admin.pendingOrders}
                </span>
                <i className="fa-solid fa-clock text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-3xl font-headline font-bold">{pendingOrders}</h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                  Awaiting Confirmation
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 flex flex-col justify-between group hover:bg-surface-container-high transition-all kpi-card">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  {t.admin.completedOrders}
                </span>
                <i className="fa-solid fa-circle-check text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-3xl font-headline font-bold">{completedOrders}</h3>
                <p className="text-[10px] text-primary mt-2 flex items-center gap-1">
                  <i className="fa-solid fa-arrow-trend-up text-xs"></i> +{completedOrders} this week
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 flex flex-col justify-between group hover:bg-surface-container-high transition-all kpi-card">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  {t.admin.lowStockProducts}
                </span>
                <i className="fa-solid fa-triangle-exclamation text-primary text-xl"></i>
              </div>
              <div>
                <h3 className="text-3xl font-headline font-bold">{lowStockProducts}</h3>
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">
                  Needs Restock
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Sales Trend Chart */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h3 className="font-headline text-lg font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-chart-line text-[#FF4500]"></i>
                7-Day Sales Trend
              </h3>
              <SalesChart data={salesData} />
            </div>

            {/* Category Distribution Chart */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h3 className="font-headline text-lg font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-chart-pie text-[#FF4500]"></i>
                Products by Category
              </h3>
              <CategoryChart data={categoryData} />
            </div>
          </div>

          {/* Stats Overview Bar Chart */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6 mb-10">
            <h3 className="font-headline text-lg font-bold uppercase text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-chart-column text-[#FF4500]"></i>
              Quick Stats Overview
            </h3>
            <StatsChart stats={{
              totalProducts: products.length,
              totalOrders: orders.length,
              totalRevenue,
              lowStock: lowStockProducts,
            }} />
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {!showProductForm ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => { resetForm(); setShowProductForm(true); }}
                  className="w-full sm:w-auto bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform flex items-center justify-center gap-2 btn-brutal text-sm sm:text-base"
                >
                  <i className="fa-solid fa-plus"></i>
                  {t.admin.addProduct}
                </button>
              </div>

              {products.length > 0 ? (
                <div className="bg-surface-container-low overflow-x-auto admin-scroll">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/15">
                        <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                          {t.admin.product}
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                          {t.admin.category}
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                          {t.admin.price}
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                          {t.admin.stock}
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                          {t.admin.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((product) => (
                        <tr key={product.id} className="border-b border-outline-variant/15 table-row-brutal">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                              <span className="font-headline font-bold text-white">{product.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-white/60">{product.category}</td>
                          <td className="py-4 px-6 text-white">{formatPrice(product.price)}</td>
                          <td className="py-4 px-6">
                            <span className={product.stock < 10 ? 'text-red-500' : 'text-white/60'}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-primary-container hover:text-primary mr-3"
                            >
                              <Icons.Edit className="text-sm" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Icons.Delete className="text-sm" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPagesProducts > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/15">
                      <p className="text-xs md:text-sm text-white/60">
                        Showing {((productsPage - 1) * itemsPerPage) + 1} to {Math.min(productsPage * itemsPerPage, products.length)} of {products.length} products
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setProductsPage(prev => Math.max(1, prev - 1))}
                          disabled={productsPage === 1}
                          className="px-3 md:px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs md:text-sm font-headline uppercase tracking-widest disabled:opacity-50 btn-brutal"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPagesProducts }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setProductsPage(page)}
                            className={`w-8 md:w-10 h-8 flex items-center justify-center rounded text-xs md:text-sm font-headline uppercase tracking-widest transition-colors btn-brutal ${
                              productsPage === page
                                ? 'bg-primary-container text-on-primary'
                                : 'bg-surface-container-highest border border-outline-variant/30 text-white'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setProductsPage(prev => Math.min(totalPagesProducts, prev + 1))}
                          disabled={productsPage === totalPagesProducts}
                          className="px-3 md:px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs md:text-sm font-headline uppercase tracking-widest disabled:opacity-50 btn-brutal"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Icons.Products className="text-6xl mx-auto mb-4 text-white/40" />
                  <p className="text-white/40">{t.admin.noProductsYet}</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface-container-low p-8">
              <h3 className="text-2xl font-headline font-bold uppercase mb-6">
                {editingProduct ? t.admin.editProduct : t.admin.addProduct}
              </h3>
              <form onSubmit={handleSubmitProduct} className="space-y-6">
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.productName}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      {t.admin.category}
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      {t.admin.brand}
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                      placeholder="e.g., SHAD, GIVI, Alpinestars"
                      required
                    />
                  </div>
                </div>

                {/* Price & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      {t.admin.price}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-headline">Rp</span>
                      <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 pl-12 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      {t.admin.stock}
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.description}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                    placeholder="Product description..."
                    required
                  />
                </div>

                {/* Product Images */}
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Product Images
                  </label>
                  <ImageUploader
                    images={formData.images}
                    onImagesChange={(urls) => setFormData({ ...formData, images: urls })}
                  />
                </div>

                {/* Flash Sale Section */}
                <div className="border border-outline-variant/30 rounded p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-headline font-bold uppercase text-white">
                      <i className="fa-solid fa-bolt text-[#FF4500] mr-2"></i>
                      Flash Sale
                    </h4>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isFlashSale"
                        checked={formData.isFlashSale}
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-[#FF4500]"
                      />
                      <span className="text-xs font-headline uppercase tracking-widest text-gray-500">
                        {t.admin.flashSaleToggle}
                      </span>
                    </label>
                  </div>

                  {formData.isFlashSale && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                          {t.admin.flashSalePrice}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-headline">Rp</span>
                          <input
                            type="text"
                            name="flashSalePrice"
                            value={formData.flashSalePrice}
                            onChange={handleInputChange}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 pl-12 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                          {t.admin.discount}
                        </label>
                        <input
                          type="number"
                          name="discount"
                          value={formData.discount}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                          placeholder="0"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center gap-2"
                  >
                    <i className="fa-solid fa-save"></i>
                    {editingProduct ? t.admin.updateProduct : t.admin.addProduct}
                  </button>
                  <button
                    type="button"
                    onClick={() => { resetForm(); setShowProductForm(false); }}
                    className="bg-surface-container-highest px-8 py-3 font-headline font-bold uppercase tracking-widest text-white rounded-md border border-outline-variant/20 btn-brutal flex items-center gap-2"
                  >
                    <i className="fa-solid fa-xmark"></i>
                    {t.admin.cancel}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-surface-container-low overflow-x-auto admin-scroll">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/15">
                <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                  {t.admin.orderNumber}
                </th>
                <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                  {t.admin.customer}
                </th>
                <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                  {t.admin.total}
                </th>
                <th className="text-left py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                  {t.admin.status}
                </th>
                <th className="text-right py-4 px-6 text-xs font-headline uppercase tracking-widest text-white/40">
                  {t.admin.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b border-outline-variant/15 table-row-brutal">
                  <td className="py-4 px-6 font-mono text-sm">{order.id?.slice(0, 8)}</td>
                  <td className="py-4 px-6 text-white">{order.customer?.name || 'N/A'}</td>
                  <td className="py-4 px-6 text-white">{formatPrice(order.subtotal || 0)}</td>
                  <td className="py-4 px-6">
                    <span className="status-badge bg-secondary-container text-on-secondary-container">
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <a
                      href={order.waLink || `https://wa.me/${order.customer?.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-400 inline-flex items-center gap-1"
                    >
                      <Icons.Whatsapp className="text-sm" />
                      Chat
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPagesOrders > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/15">
              <p className="text-xs md:text-sm text-white/60">
                Showing {((ordersPage - 1) * itemsPerPage) + 1} to {Math.min(ordersPage * itemsPerPage, orders.length)} of {orders.length} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrdersPage(prev => Math.max(1, prev - 1))}
                  disabled={ordersPage === 1}
                  className="px-3 md:px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs md:text-sm font-headline uppercase tracking-widest disabled:opacity-50 btn-brutal"
                >
                  Previous
                </button>
                {Array.from({ length: totalPagesOrders }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setOrdersPage(page)}
                    className={`w-8 md:w-10 h-8 flex items-center justify-center rounded text-xs md:text-sm font-headline uppercase tracking-widest transition-colors btn-brutal ${
                      ordersPage === page
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container-highest border border-outline-variant/30 text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setOrdersPage(prev => Math.min(totalPagesOrders, prev + 1))}
                  disabled={ordersPage === totalPagesOrders}
                  className="px-3 md:px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs md:text-sm font-headline uppercase tracking-widest disabled:opacity-50 btn-brutal"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flash Sale Tab */}
      {activeTab === 'flashsale' && (
        <div className="bg-surface-container-low p-8">
          <FlashSaleManager showAlert={showAlert} />
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-surface-container-low p-8">
          <h3 className="text-2xl font-headline font-bold uppercase mb-6">
            <i className="fa-solid fa-tags text-[#FF4500] mr-2"></i>
            {t.admin.manageCategories}
          </h3>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t.admin.enterCategoryName}
                className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal w-full"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                className="bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center justify-center gap-2 whitespace-nowrap sm:w-auto w-full"
              >
                <i className="fa-solid fa-plus"></i>
                <span className="hidden sm:inline">{t.admin.add}</span>
                <i className="fa-solid fa-plus sm:hidden"></i>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, index) => (
                <div key={index} className="bg-surface-container-highest border border-outline-variant/30 rounded p-4 flex items-center justify-between">
                  <span className="font-headline font-bold text-white uppercase">{cat}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="text-red-500 hover:text-red-400 p-2"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-20">
                <i className="fa-solid fa-tags text-6xl text-white/40 mb-4"></i>
                <p className="text-white/40">{t.admin.noCategoriesAvailable}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Arsenal Tab */}
      {activeTab === 'arsenal' && (
        <div className="bg-surface-container-low p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-headline font-bold uppercase flex items-center gap-3">
              <i className="fa-solid fa-th-large text-[#FF4500] text-3xl"></i>
              {t.admin.arsenal}
            </h3>
            <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
              {arsenalCategories.length} Categories
            </span>
          </div>

          {/* Arsenal Sub-Tabs */}
          <div className="flex gap-2 mb-8 border-b border-outline-variant/30">
            <button
              onClick={() => setActiveArsenalSubTab('categories')}
              className={`px-6 py-3 font-headline font-bold uppercase tracking-widest text-sm transition-all border-b-2 ${
                activeArsenalSubTab === 'categories'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-layer-group mr-2"></i>
              Categories
            </button>
            <button
              onClick={() => setActiveArsenalSubTab('layout')}
              className={`px-6 py-3 font-headline font-bold uppercase tracking-widest text-sm transition-all border-b-2 ${
                activeArsenalSubTab === 'layout'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-sliders mr-2"></i>
              Layout Settings
            </button>
          </div>

          <div className="space-y-8">
            {/* Categories Sub-Tab Content */}
            {activeArsenalSubTab === 'categories' && (
            <>
            {/* Info Banner */}
            <div className="bg-gradient-to-br from-primary/10 to-primary-container/10 border border-primary/20 rounded p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-circle-info text-primary text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white uppercase mb-2">About The Arsenal</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {t.admin.arsenalDescription} Categories will be displayed on the homepage with a stunning grid layout.
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Button */}
            <div className="flex items-center justify-between p-4 bg-surface-container-highest border border-outline-variant/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <i className="fa-solid fa-right-left text-primary text-lg"></i>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white uppercase text-sm">Sync Categories to Arsenal</h4>
                  <p className="text-xs text-gray-400">Copy all categories to The Arsenal with default images</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (categories.length === 0) {
                    showAlert({
                      type: 'warning',
                      title: 'TIDAK ADA CATEGORIES',
                      message: 'Tambahkan categories terlebih dahulu sebelum sync.',
                      badgeText: 'PERINGATAN',
                      badgeColor: 'bg-amber-900/30 text-amber-200',
                    });
                    return;
                  }
                  
                  try {
                    const defaultImages: Record<string, string> = {
                      'Helmets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrOPHs5QuRC38lRDmTmY7sKn-kb8EZ8BsGj8Xl5B3bRu8UnoA4e99K4Z-zbYsslzIJYfRXBUWtj3rH3H8HAA35chxCMfJsaQQ59QpYujAsi90TDrEKoRsCsppgQpZJpblVnFBAUi6C7v7T-PDHpyYnaYOQ0d7vn5G0dFeD5RStwk-8EuemUqL9fvlG_cYiwHOst3wsf3QEpqh0iNPTI2a4sw_xuBJZq0XGhTb-i8L4CVVGKYJMaAtXnrQ2Lb916fdhbnhPFtuiSkTY',
                      'Jackets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRvy3mzvo2UQMoY5soIh0ZM5mbjAg_Pq8c3y725s5z2lpmcFzDvArcy_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
                      'Touring Boxes': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvZm2AEgCSr59eO8y8ZmGly7MOBQCZX5wZX0ffQghSfNhcQ1jMvIMQi_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
                      'Gloves & Footwear': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxvenesZ98H4sbxJAaGB125WR9o_doEeMf-WFVf3Nv8jK3jbbjG0QDHOtwPhJPo0WwqSV75dTCTcH6LYdSLr3VMb5FI8tCSMDNYaIpGyjAdfIaSSjpAHDXy2c7QqvF43pvnU8bMbwzKKbkP36M8GQ1JMxwZSwjd2r3_hQUt5vBQeX5rNdGCKZzPTJh66dINiNOELOeVE8SsoVigCDSYZnxNHtFTwggqoYjGp7ErrK0IEmBheN-prFr9e1tzPd2CeXB4eTbmktIko5',
                    };
                    const spans = ['md:col-span-2 md:row-span-2', '', '', 'md:col-span-2'];
                    
                    // Get existing arsenal categories names (case insensitive)
                    const arsenalRef = ref(db, 'arsenal');
                    const snapshot = await get(arsenalRef);
                    const existingArsenal = snapshot.val();
                    const existingNames = existingArsenal 
                      ? Object.values(existingArsenal).map((c: any) => c.name.toLowerCase())
                      : [];
                    
                    // Sync only categories that don't exist in arsenal yet
                    const newArsenalData = categories
                      .filter(cat => !existingNames.includes(cat.toLowerCase()))
                      .map((cat, index) => ({
                        name: cat,
                        image: defaultImages[cat] || '', // Gunakan default atau kosong (tidak pakai random)
                        span: spans[index % spans.length] || '',
                      }));
                    
                    // Add new categories to existing arsenal
                    if (newArsenalData.length > 0) {
                      for (const item of newArsenalData) {
                        await push(arsenalRef, item);
                      }
                    }
                    
                    showAlert({
                      type: 'success',
                      title: 'SYNC BERHASIL',
                      message: `${newArsenalData.length || categories.length} categories berhasil disync ke The Arsenal.`,
                      badgeText: 'BERHASIL',
                      badgeColor: 'bg-green-900/30 text-green-200',
                    });
                  } catch (error) {
                    showAlert({
                      type: 'error',
                      title: 'SYNC GAGAL',
                      message: 'Terjadi kesalahan saat sync categories.',
                      badgeText: 'ERROR',
                      badgeColor: 'bg-error-container text-on-error-container',
                    });
                  }
                }}
                className="bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center gap-2 hover:from-primary-container hover:to-primary transition-all"
              >
                <i className="fa-solid fa-bolt"></i>
                Sync Now
              </button>
            </div>

            {/* Add/Edit Form */}
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-container p-4">
                <h4 className="text-lg font-headline font-bold uppercase text-on-primary flex items-center gap-2">
                  <i className="fa-solid fa-plus-circle"></i>
                  {editingArsenalIndex !== null ? 'Edit Category' : t.admin.addNewCategory}
                </h4>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      {t.admin.arsenalName}
                    </label>
                    {/* Dropdown Categories */}
                    <div className="relative mb-3">
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedCat = categories.find(c => c === e.target.value);
                            if (selectedCat) {
                              const defaultImages: Record<string, string> = {
                                'Helmets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrOPHs5QuRC38lRDmTmY7sKn-kb8EZ8BsGj8Xl5B3bRu8UnoA4e99K4Z-zbYsslzIJYfRXBUWtj3rH3H8HAA35chxCMfJsaQQ59QpYujAsi90TDrEKoRsCsppgQpZJpblVnFBAUi6C7v7T-PDHpyYnaYOQ0d7vn5G0dFeD5RStwk-8EuemUqL9fvlG_cYiwHOst3wsf3QEpqh0iNPTI2a4sw_xuBJZq0XGhTb-i8L4CVVGKYJMaAtXnrQ2Lb916fdhbnhPFtuiSkTY',
                                'Jackets': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRvy3mzvo2UQMoY5soIh0ZM5mbjAg_Pq8c3y725s5z2lpmcFzDvArcy_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
                                'Touring Boxes': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvZm2AEgCSr59eO8y8ZmGly7MOBQCZX5wZX0ffQghSfNhcQ1jMvIMQi_aeSwpo41D7EN2ak7_c6InB_SrEst01NSS5qMHcbFSHszRcfExmhDShcapaJlQmM7fVb3LAK28enlmgCxqjoUIKmLNbB04qCVm2launfsL1E7AhbabU-AWjRAeO5hb1fzYAmcKpNWBFOsSMucKinULWW1wp8jt1bC3LrZXo6Bj6w5XNWCNzX9NZVUi_SPibGfNNYWwSe3_jwDM3gAI6Netu',
                                'Gloves & Footwear': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLxvenesZ98H4sbxJAaGB125WR9o_doEeMf-WFVf3Nv8jK3jbbjG0QDHOtwPhJPo0WwqSV75dTCTcH6LYdSLr3VMb5FI8tCSMDNYaIpGyjAdfIaSSjpAHDXy2c7QqvF43pvnU8bMbwzKKbkP36M8GQ1JMxwZSwjd2r3_hQUt5vBQeX5rNdGCKZzPTJh66dINiNOELOeVE8SsoVigCDSYZnxNHtFTwggqoYjGp7ErrK0IEmBheN-prFr9e1tzPd2CeXB4eTbmktIko5',
                              };
                              setArsenalForm({ 
                                ...arsenalForm, 
                                name: selectedCat,
                                image: defaultImages[selectedCat] || arsenalForm.image,
                              });
                            }
                          }
                        }}
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal transition-all appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih dari Categories (Opsional) --</option>
                        {categories.map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                    </div>
                    {/* Info Box */}
                    <div className="bg-primary/10 border border-primary/20 rounded p-3 mb-3">
                      <p className="text-xs text-gray-400 flex items-start gap-2">
                        <i className="fa-solid fa-circle-info text-primary mt-0.5"></i>
                        <span>Pilih dari dropdown untuk menggunakan default image, atau ketik manual nama category yang berbeda.</span>
                      </p>
                    </div>
                    {/* Manual Input */}
                    <input
                      type="text"
                      value={arsenalForm.name}
                      onChange={(e) => setArsenalForm({ ...arsenalForm, name: e.target.value })}
                      placeholder="Nama Category Arsenal..."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      {t.admin.arsenalImage}
                    </label>
                    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded p-3">
                      <ImageUploader
                        images={arsenalForm.image ? [arsenalForm.image] : []}
                        onImagesChange={(urls) => setArsenalForm({ ...arsenalForm, image: urls[0] || '' })}
                        maxImages={1}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Card Size Selector */}
                <div className="mt-6">
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-3">
                    <i className="fa-solid fa-expand mr-1"></i>
                    Card Size (Ukuran Card)
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { value: 'small', label: 'Small', icon: 'fa-square-sm', desc: 'Kecil' },
                      { value: 'medium', label: 'Medium', icon: 'fa-square', desc: 'Sedang' },
                      { value: 'large', label: 'Large', icon: 'fa-square-lg', desc: 'Besar' },
                      { value: 'full', label: 'Full', icon: 'fa-rectangle-wide', desc: 'Penuh' },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setArsenalForm({ ...arsenalForm, cardSize: size.value as 'small' | 'medium' | 'large' | 'full' })}
                        className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                          arsenalForm.cardSize === size.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant/30 bg-surface-container-low text-gray-400 hover:border-primary/50'
                        }`}
                      >
                        <i className={`fa-solid ${size.icon} text-2xl mb-2`}></i>
                        <div className="text-xs font-bold uppercase">{size.label}</div>
                        <div className="text-[10px] opacity-60">{size.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-outline-variant/30">
                  {editingArsenalIndex !== null ? (
                    <>
                      <button
                        onClick={handleUpdateArsenalCategory}
                        className="flex-1 bg-gradient-to-br from-green-500 to-green-600 px-6 py-3 font-headline font-bold uppercase tracking-widest text-white rounded-md btn-brutal flex items-center justify-center gap-2 hover:from-green-600 hover:to-green-700 transition-all"
                      >
                        <i className="fa-solid fa-check"></i>
                        Update Category
                      </button>
                      <button
                        onClick={handleCancelArsenal}
                        className="flex-1 bg-surface-container-highest px-6 py-3 font-headline font-bold uppercase tracking-widest text-white rounded-md border border-outline-variant/20 btn-brutal flex items-center justify-center gap-2 hover:bg-surface-bright transition-all"
                      >
                        <i className="fa-solid fa-xmark"></i>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleAddArsenalCategory}
                      className="w-full bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center justify-center gap-2 hover:from-primary-container hover:to-primary transition-all"
                    >
                      <i className="fa-solid fa-plus"></i>
                      Add New Category
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Arsenal Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-headline font-bold uppercase text-white flex items-center gap-2">
                  <i className="fa-solid fa-layer-group text-[#FF4500]"></i>
                  Categories Grid
                </h4>
                <div className="flex items-center gap-2">
                  {/* Auto Arrange Dropdown */}
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAutoArrangeArsenal(e.target.value as 'classic' | 'bento' | 'uniform' | 'mixed');
                          e.target.value = '';
                        }
                      }}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 pr-8 text-xs font-headline font-bold uppercase tracking-wider text-white rounded-md flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all appearance-none cursor-pointer"
                      defaultValue=""
                    >
                      <option value="" disabled>✨ Auto Arrange</option>
                      <option value="classic">🎯 Classic (Screenshot)</option>
                      <option value="bento"> Bento (Variasi)</option>
                      <option value="uniform">⬜ Uniform (Seragam)</option>
                      <option value="mixed">🎲 Mixed (Campuran)</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none text-xs"></i>
                  </div>
                  <span className="text-xs text-gray-500 font-headline uppercase tracking-widest flex items-center">
                    <i className="fa-solid fa-arrows-up-down-left mr-1"></i>
                    <span className="hidden sm:inline">Drag to reorder</span>
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {arsenalCategories.map((cat: any, index: number) => (
                  <div
                    key={index}
                    className="group bg-surface-container-highest border border-outline-variant/30 rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-video bg-surface-container-lowest overflow-hidden">
                      {cat.image ? (
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-image text-4xl text-white/20"></i>
                        </div>
                      )}
                      {/* Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEditArsenalCategory(index)}
                          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteArsenalCategory(index)}
                          className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                          title="Delete"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                      {/* Drag Handle */}
                      <div className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <i className="fa-solid fa-grip-vertical text-white/80"></i>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-headline font-bold text-white uppercase tracking-tight text-lg">
                          {cat.name}
                        </span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <div className="w-2 h-2 rounded-full bg-primary opacity-50"></div>
                          <div className="w-2 h-2 rounded-full bg-primary opacity-25"></div>
                        </div>
                      </div>
                      {/* Card Size Badge */}
                      {cat.cardSize && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            cat.cardSize === 'large' ? 'bg-orange-500/20 text-orange-400' :
                            cat.cardSize === 'full' ? 'bg-purple-500/20 text-purple-400' :
                            cat.cardSize === 'small' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            <i className={`fa-solid ${
                              cat.cardSize === 'large' ? 'fa-square-lg' :
                              cat.cardSize === 'full' ? 'fa-rectangle-wide' :
                              cat.cardSize === 'small' ? 'fa-square-sm' :
                              'fa-square'
                            }`}></i>
                            {cat.cardSize}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {arsenalCategories.length === 0 && (
              <div className="text-center py-20 bg-surface-container-highest border border-outline-variant/30 rounded-lg">
                <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-th-large text-4xl text-white/20"></i>
                </div>
                <p className="text-white/60 font-headline font-bold uppercase tracking-widest mb-2">No Categories Yet</p>
                <p className="text-white/40 text-sm">Add your first arsenal category using the form above</p>
              </div>
            )}

            {/* Save Button */}
            {arsenalCategories.length > 0 && (
              <div className="flex justify-end pt-6 border-t border-outline-variant/30">
                <button
                  onClick={handleSaveArsenal}
                  className="bg-gradient-to-br from-primary to-primary-container px-6 sm:px-10 py-3 sm:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center gap-2 sm:gap-3 hover:from-primary-container hover:to-primary transition-all shadow-lg shadow-primary/20 text-sm sm:text-base"
                >
                  <i className="fa-solid fa-floppy-disk text-base sm:text-xl"></i>
                  <span className="hidden sm:inline">{t.admin.saveArsenal}</span>
                  <span className="sm:hidden">Save</span>
                </button>
              </div>
            )}
            </>
            )}

            {/* Layout Settings Sub-Tab Content */}
            {activeArsenalSubTab === 'layout' && (
            <>
            {/* Info Banner */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-circle-info text-blue-500 text-2xl"></i>
                </div>
                <div>
                  <h4 className="font-headline font-bold text-white uppercase mb-2">About Layout Settings</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Atur tampilan The Arsenal di homepage. Anda bisa mengontrol jumlah kolom, tinggi, jarak, dan gaya layout tanpa mengubah logic backend.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Preview - Bento Layout */}
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                <h4 className="text-lg font-headline font-bold uppercase text-white flex items-center gap-2">
                  <i className="fa-solid fa-eye"></i>
                  Live Preview - Bento Grid Layout
                </h4>
                <p className="text-xs text-white/80 mt-1">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Layout mengikuti pattern: 1 card besar di kiri, 3 card di kanan (2 atas + 1 wide bawah)
                </p>
              </div>
              
              <div className="p-6">
                {/* Preview Info */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {arsenalLayoutSettings.borderRadius === 'rounded-none' ? '0px' : 
                       arsenalLayoutSettings.borderRadius === 'rounded-lg' ? '8px' :
                       arsenalLayoutSettings.borderRadius === 'rounded-xl' ? '12px' :
                       arsenalLayoutSettings.borderRadius === 'rounded-2xl' ? '16px' : '24px'}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Radius</div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{arsenalLayoutSettings.desktopGap}px</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Gap</div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{arsenalLayoutSettings.overlayOpacity}%</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Overlay</div>
                  </div>
                </div>

                {/* Bento Grid Preview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 auto-rows-[120px] md:auto-rows-[100px] select-none">
                  {arsenalCategories.length > 0 ? arsenalCategories.slice(0, 4).map((cat: any, index: number) => {
                    const getGridClasses = (index: number) => {
                      if (index === 0) return 'md:row-span-2 md:col-span-2';
                      if (index === 3) return 'md:col-span-2';
                      return '';
                    };

                    return (
                      <div
                        key={index}
                        className={`relative group bg-gradient-to-br from-primary/30 to-primary-container/30 border-2 border-primary/50 overflow-hidden ${getGridClasses(index)} ${
                          arsenalLayoutSettings.borderRadius === 'rounded-none' ? '' :
                          arsenalLayoutSettings.borderRadius === 'rounded-lg' ? 'rounded-lg' :
                          arsenalLayoutSettings.borderRadius === 'rounded-xl' ? 'rounded-xl' :
                          arsenalLayoutSettings.borderRadius === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-3xl'
                        }`}
                      >
                        {/* Category Name */}
                        <div className="absolute inset-0 flex items-center justify-center p-3">
                          <div className="text-center">
                            <div className="text-xs md:text-sm font-headline font-bold text-white uppercase tracking-tight">
                              {cat.name}
                            </div>
                            <div className="text-[8px] md:text-[10px] text-white/60 mt-1">Preview</div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <>
                      {/* Dummy Preview - Bento Pattern */}
                      <div className={`relative group bg-surface-container-low border border-outline-variant/30 md:row-span-2 md:col-span-2 ${
                        arsenalLayoutSettings.borderRadius === 'rounded-none' ? '' :
                        arsenalLayoutSettings.borderRadius === 'rounded-lg' ? 'rounded-lg' :
                        arsenalLayoutSettings.borderRadius === 'rounded-xl' ? 'rounded-xl' :
                        arsenalLayoutSettings.borderRadius === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-3xl'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <i className="fa-solid fa-image text-3xl md:text-4xl text-white/20 mb-2"></i>
                            <div className="text-xs text-gray-500 font-bold">HELMETS</div>
                            <div className="text-[10px] text-gray-600">Category 1 (Large)</div>
                          </div>
                        </div>
                      </div>
                      <div className={`relative group bg-surface-container-low border border-outline-variant/30 ${
                        arsenalLayoutSettings.borderRadius === 'rounded-none' ? '' :
                        arsenalLayoutSettings.borderRadius === 'rounded-lg' ? 'rounded-lg' :
                        arsenalLayoutSettings.borderRadius === 'rounded-xl' ? 'rounded-xl' :
                        arsenalLayoutSettings.borderRadius === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-3xl'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <i className="fa-solid fa-image text-2xl text-white/20 mb-2"></i>
                            <div className="text-xs text-gray-500 font-bold">JACKETS</div>
                          </div>
                        </div>
                      </div>
                      <div className={`relative group bg-surface-container-low border border-outline-variant/30 ${
                        arsenalLayoutSettings.borderRadius === 'rounded-none' ? '' :
                        arsenalLayoutSettings.borderRadius === 'rounded-lg' ? 'rounded-lg' :
                        arsenalLayoutSettings.borderRadius === 'rounded-xl' ? 'rounded-xl' :
                        arsenalLayoutSettings.borderRadius === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-3xl'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <i className="fa-solid fa-image text-2xl text-white/20 mb-2"></i>
                            <div className="text-xs text-gray-500 font-bold">TOURING</div>
                          </div>
                        </div>
                      </div>
                      <div className={`relative group bg-surface-container-low border border-outline-variant/30 md:col-span-2 ${
                        arsenalLayoutSettings.borderRadius === 'rounded-none' ? '' :
                        arsenalLayoutSettings.borderRadius === 'rounded-lg' ? 'rounded-lg' :
                        arsenalLayoutSettings.borderRadius === 'rounded-xl' ? 'rounded-xl' :
                        arsenalLayoutSettings.borderRadius === 'rounded-2xl' ? 'rounded-2xl' : 'rounded-3xl'
                      }`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <i className="fa-solid fa-image text-2xl text-white/20 mb-2"></i>
                            <div className="text-xs text-gray-500 font-bold">GLOVES & FOOTWEAR</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Gap & Opacity Resize Area */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div
                    className="relative bg-surface-container-low border-2 border-dashed border-primary/50 rounded-lg p-4 cursor-ew-resize hover:border-primary transition-colors"
                    onMouseDown={(e) => handleResizeStart('width', e)}
                    onTouchStart={(e) => handleResizeStart('width', e)}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <i className="fa-solid fa-arrows-left-right"></i>
                      <span className="font-bold">Geser untuk ubah Gap</span>
                      <span className="text-xs">({arsenalLayoutSettings.desktopGap}px)</span>
                    </div>
                  </div>
                  <div
                    className="relative bg-surface-container-low border-2 border-dashed border-primary/50 rounded-lg p-4 cursor-ns-resize hover:border-primary transition-colors"
                    onMouseDown={(e) => handleResizeStart('height', e)}
                    onTouchStart={(e) => handleResizeStart('height', e)}
                  >
                    <div className="flex items-center justify-center gap-2 text-sm text-primary">
                      <i className="fa-solid fa-arrows-up-down"></i>
                      <span className="font-bold">Geser untuk ubah Overlay</span>
                      <span className="text-xs">({arsenalLayoutSettings.overlayOpacity}%)</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded p-3">
                  <p className="text-xs text-gray-300 flex items-start gap-2">
                    <i className="fa-solid fa-lightbulb text-blue-500 mt-0.5"></i>
                    <span>
                      <strong>Cara menggunakan:</strong><br/>
                      • <strong>Layout Bento:</strong> Otomatis - card 1 besar di kiri, card 2-3 di kanan atas, card 4 wide di kanan bawah<br/>
                      • <strong>Gap:</strong> Drag area kiri untuk mengubah jarak antar card<br/>
                      • <strong>Overlay:</strong> Drag area kanan untuk mengubah kegelapan overlay<br/>
                      • <strong>Border Radius:</strong> Pilih dari dropdown di bawah<br/>
                      • Perubahan langsung terlihat di preview dan homepage
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Style Settings */}
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-container p-4">
                <h4 className="text-lg font-headline font-bold uppercase text-on-primary flex items-center gap-2">
                  <i className="fa-solid fa-palette"></i>
                  Style Settings
                </h4>
              </div>
              <div className="p-6 space-y-6">
                {/* Layout Style Selector */}
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-3">
                    <i className="fa-solid fa-grid-2 mr-1"></i>
                    Layout Style (Gaya Layout)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { value: 'classic', label: 'Classic', icon: 'fa-table-cells-large', desc: 'Screenshot style', featured: true },
                      { value: 'bento', label: 'Bento', icon: 'fa-table-cells', desc: 'Asimetris, dinamis' },
                      { value: 'grid', label: 'Grid', icon: 'fa-grid', desc: 'Rapi, responsif' },
                      { value: 'masonry', label: 'Masonry', icon: 'fa-bricks', desc: 'Tinggi bervariasi' },
                      { value: 'uniform', label: 'Uniform', icon: 'fa-squarespace', desc: 'Seragam, bersih' },
                    ].map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        onClick={() => setArsenalLayoutSettings({ ...arsenalLayoutSettings, layoutStyle: style.value })}
                        className={`p-4 border-2 rounded-lg transition-all duration-200 relative ${
                          arsenalLayoutSettings.layoutStyle === style.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline-variant/30 bg-surface-container-low text-gray-400 hover:border-primary/50'
                        }`}
                      >
                        {style.featured && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">
                            NEW
                          </div>
                        )}
                        <i className={`fa-solid ${style.icon} text-3xl mb-2`}></i>
                        <div className="text-sm font-bold uppercase">{style.label}</div>
                        <div className="text-[10px] opacity-60 mt-1">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Arrange Toggle */}
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <i className="fa-solid fa-wand-magic-sparkles text-primary text-xl"></i>
                      </div>
                      <div>
                        <div className="font-bold text-white uppercase text-sm">Auto Arrange</div>
                        <div className="text-xs text-gray-400">Otomatis atur ukuran card berdasarkan posisi</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setArsenalLayoutSettings({ ...arsenalLayoutSettings, autoArrange: !arsenalLayoutSettings.autoArrange })}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        arsenalLayoutSettings.autoArrange
                          ? 'bg-primary'
                          : 'bg-surface-container-highest border border-outline-variant/30'
                      }`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                        arsenalLayoutSettings.autoArrange ? 'translate-x-7' : 'translate-x-0'
                      }`}></div>
                    </button>
                  </div>
                  {arsenalLayoutSettings.autoArrange && (
                    <div className="mt-3 bg-primary/5 border border-primary/20 rounded p-3">
                      <p className="text-xs text-gray-300 flex items-start gap-2">
                        <i className="fa-solid fa-circle-check text-primary mt-0.5"></i>
                        <span>Auto Arrange aktif. Ukuran card akan otomatis disesuaikan berdasarkan layout yang dipilih.</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Overlay Opacity (%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={arsenalLayoutSettings.overlayOpacity}
                    onChange={(e) => setArsenalLayoutSettings({...arsenalLayoutSettings, overlayOpacity: parseInt(e.target.value)})}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0% (Terang)</span>
                    <span className="text-primary font-bold">{arsenalLayoutSettings.overlayOpacity}%</span>
                    <span>100% (Gelap)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      Border Radius
                    </label>
                    <select
                      value={arsenalLayoutSettings.borderRadius}
                      onChange={(e) => setArsenalLayoutSettings({...arsenalLayoutSettings, borderRadius: e.target.value})}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-primary input-brutal appearance-none cursor-pointer"
                    >
                      <option value="rounded-none">Tidak Ada (Kotak - Seperti Referensi)</option>
                      <option value="rounded-lg">Sedikit (8px)</option>
                      <option value="rounded-xl">Medium (12px)</option>
                      <option value="rounded-2xl">Besar (16px)</option>
                      <option value="rounded-3xl">Sangat Besar (24px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                      Ukuran Teks Judul
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setArsenalLayoutSettings({...arsenalLayoutSettings, textSize: 'small'})}
                        className={`p-4 border-2 rounded-lg font-headline font-bold uppercase transition-all ${
                          arsenalLayoutSettings.textSize === 'small'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-outline-variant/30 bg-surface-container-lowest text-gray-400 hover:border-white/50'
                        }`}
                      >
                        <div className="text-xs">Kecil</div>
                      </button>
                      <button
                        onClick={() => setArsenalLayoutSettings({...arsenalLayoutSettings, textSize: 'normal'})}
                        className={`p-4 border-2 rounded-lg font-headline font-bold uppercase transition-all ${
                          arsenalLayoutSettings.textSize === 'normal'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-outline-variant/30 bg-surface-container-lowest text-gray-400 hover:border-white/50'
                        }`}
                      >
                        <div className="text-sm">Normal</div>
                      </button>
                      <button
                        onClick={() => setArsenalLayoutSettings({...arsenalLayoutSettings, textSize: 'large'})}
                        className={`p-4 border-2 rounded-lg font-headline font-bold uppercase transition-all ${
                          arsenalLayoutSettings.textSize === 'large'
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-outline-variant/30 bg-surface-container-lowest text-gray-400 hover:border-white/50'
                        }`}
                      >
                        <div className="text-base">Besar</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-outline-variant/30">
              <button
                onClick={handleResetArsenalLayout}
                className="sm:w-auto px-6 py-4 font-headline font-bold uppercase tracking-widest text-white rounded-md btn-brutal flex items-center justify-center gap-2 bg-surface-container-highest border border-outline-variant/20 hover:bg-surface-bright transition-all"
              >
                <i className="fa-solid fa-rotate-left"></i>
                Reset Default
              </button>
              <button
                onClick={handleSaveArsenalLayout}
                className="sm:w-auto bg-gradient-to-br from-primary to-primary-container px-6 sm:px-10 py-3 sm:py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center gap-2 sm:gap-3 hover:from-primary-container hover:to-primary transition-all shadow-lg shadow-primary/20"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Save Layout Settings
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* Instagram Tab */}
      {activeTab === 'instagram' && (
        <div className="bg-surface-container-low p-8">
          <h3 className="text-2xl font-headline font-bold uppercase mb-6">
            <i className="fa-brands fa-instagram text-[#FF4500] mr-2"></i>
            {t.admin.instagramPosts}
          </h3>

          <div className="space-y-6">
            <p className="text-xs text-gray-500 font-headline uppercase tracking-widest">
              {t.admin.instagramDescription}
            </p>

            {/* Add Post Form */}
            <div className="bg-surface-container-highest border border-outline-variant/30 rounded-lg p-4 md:p-6">
              <h4 className="font-headline font-bold text-white uppercase mb-4 flex items-center gap-2 text-sm md:text-base">
                <i className="fa-solid fa-plus-circle text-[#FF4500]"></i>
                Add New Instagram Post
              </h4>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Instagram URL *
                  </label>
                  <input
                    type="text"
                    value={newInstagramPost}
                    onChange={(e) => setNewInstagramPost(e.target.value)}
                    placeholder="https://www.instagram.com/p/ABC123/"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    Caption (Optional)
                  </label>
                  <textarea
                    value={newInstagramCaption}
                    onChange={(e) => setNewInstagramCaption(e.target.value)}
                    placeholder="Add a caption for this post..."
                    rows={3}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:border-[#FF4500] focus:ring-0 input-brutal resize-none"
                  />
                </div>
                <button
                  onClick={handleAddInstagramPost}
                  className="w-full bg-gradient-to-br from-primary to-primary-container px-4 md:px-6 py-2.5 md:py-3 text-xs md:text-sm font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  {t.admin.addPost}
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div>
              <h4 className="font-headline font-bold text-white uppercase mb-4 flex items-center gap-2">
                <i className="fa-brands fa-instagram text-[#FF4500]"></i>
                Instagram Posts ({instagramPosts.length})
              </h4>
              
              {instagramPosts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {instagramPosts.map((post, index) => (
                    <div key={index} className="bg-surface-container-highest border border-outline-variant/30 rounded-lg overflow-hidden group">
                      {/* Preview */}
                      <div className="aspect-square bg-surface-container-lowest flex items-center justify-center relative">
                        <i className="fa-brands fa-instagram text-4xl text-primary opacity-50"></i>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors"
                            title="View on Instagram"
                          >
                            <i className="fa-solid fa-external-link-alt text-sm"></i>
                          </a>
                          <button
                            onClick={() => handleDeleteInstagramPost(index)}
                            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            <i className="fa-solid fa-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <p className="text-xs text-gray-500 mb-2 truncate">
                          {post.url}
                        </p>
                        {post.caption && (
                          <p className="text-white/80 text-sm line-clamp-2">
                            {post.caption}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-600 mt-2">
                          {new Date(post.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <i className="fa-brands fa-instagram text-6xl text-white/40 mb-4"></i>
                  <p className="text-white/40">No Instagram posts yet</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveInstagram}
              className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container px-6 md:px-8 py-2.5 md:py-3 text-xs md:text-sm font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-save"></i>
              {t.admin.savePosts}
            </button>
          </div>
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'seo' && (
        <div className="bg-surface-container-low p-8 rounded-lg">
          <SEOSettingsPanel />
        </div>
      )}

      {/* Settings Tab - Enhanced */}
      {activeTab === 'settings' && (
        <div className="bg-surface-container-low p-8">
          <h3 className="text-2xl font-headline font-bold uppercase mb-6">
            <i className="fa-solid fa-gear text-[#FF4500] mr-2"></i>
            {t.admin.settings}
          </h3>

          {/* Settings Sub-Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-outline-variant/30 pb-4">
            <button
              onClick={() => setActiveSettingsTab('auth')}
              className={`px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeSettingsTab === 'auth'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-surface-container-highest text-white/60 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-lock mr-2"></i>Authentication
            </button>
            <button
              onClick={() => setActiveSettingsTab('hero')}
              className={`px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeSettingsTab === 'hero'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-surface-container-highest text-white/60 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-image mr-2"></i>Hero Section
            </button>
            <button
              onClick={() => setActiveSettingsTab('contact')}
              className={`px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeSettingsTab === 'contact'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-surface-container-highest text-white/60 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-phone mr-2"></i>Contact & WhatsApp
            </button>
            <button
              onClick={() => setActiveSettingsTab('store')}
              className={`px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeSettingsTab === 'store'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-surface-container-highest text-white/60 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-store mr-2"></i>Store Info
            </button>
            <button
              onClick={() => setActiveSettingsTab('social')}
              className={`px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeSettingsTab === 'social'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-surface-container-highest text-white/60 hover:text-white'
              }`}
            >
              <i className="fa-brands fa-instagram mr-2"></i>Social Media
            </button>
            <button
              onClick={() => setActiveSettingsTab('about')}
              className={`px-4 py-2 font-headline font-bold text-xs uppercase tracking-widest rounded transition-colors ${
                activeSettingsTab === 'about'
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-surface-container-highest text-white/60 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-book mr-2"></i>About Page
            </button>
          </div>

          {/* Authentication Settings Tab */}
          {activeSettingsTab === 'auth' && (
            <div className="border border-outline-variant/30 rounded p-6">
              <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-lock text-[#FF4500]"></i>
                {t.admin.authSettings}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.username}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.username}
                    onChange={(e) => setSettingsForm({ ...settingsForm, username: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.password}
                  </label>
                  <input
                    type="password"
                    value={settingsForm.password}
                    onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hero Section Settings Tab */}
          {activeSettingsTab === 'hero' && (
            <div className="border border-outline-variant/30 rounded p-6">
              <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-image text-[#FF4500]"></i>
                {t.admin.heroSettings}
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.heroTitle}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.heroSubtitle}
                  </label>
                  <textarea
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    rows={3}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.heroImage}
                  </label>
                  <div className="bg-surface-container-lowest border border-outline-variant/30 rounded p-4">
                    <ImageUploader
                      images={settingsForm.heroImage ? [settingsForm.heroImage] : []}
                      onImagesChange={(urls) => setSettingsForm({ ...settingsForm, heroImage: urls[0] || '' })}
                      maxImages={1}
                    />
                    {settingsForm.heroImage && (
                      <div className="mt-4">
                        <p className="text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">Preview:</p>
                        <img src={settingsForm.heroImage} alt="Hero preview" className="w-full h-48 object-cover rounded border border-outline-variant/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact & WhatsApp Settings Tab */}
          {activeSettingsTab === 'contact' && (
            <div className="border border-outline-variant/30 rounded p-6">
              <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-phone text-[#FF4500]"></i>
                Contact & WhatsApp
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.storeName}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.whatsappNumber}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="6281234567890"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                  WhatsApp Message Template
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Available placeholders: {'{storeName}'}, {'{items}'}, {'{subtotal}'}, {'{total}'}, {'{name}'}, {'{phone}'}, {'{address}'}, {'{notes}'}, {'{orderNumber}'}, {'{timestamp}'}
                </p>
                <textarea
                  value={settingsForm.whatsappMessageTemplate}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappMessageTemplate: e.target.value })}
                  rows={12}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Store Info Settings Tab */}
          {activeSettingsTab === 'store' && (
            <div className="border border-outline-variant/30 rounded p-6">
              <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-store text-[#FF4500]"></i>
                Store Information
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                    {t.admin.storeName}
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storeName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Settings Tab */}
          {activeSettingsTab === 'social' && (
            <div className="border border-outline-variant/30 rounded p-6">
              <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-brands fa-instagram text-[#FF4500]"></i>
                Social Media
              </h4>
              <div>
                <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                  {t.admin.instagramTag}
                </label>
                <input
                  type="text"
                  value={settingsForm.instagramTag}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramTag: e.target.value })}
                  placeholder="#AksesorisTouringMadiun"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                />
              </div>
            </div>
          )}

          {/* About Page Settings Tab */}
          {activeSettingsTab === 'about' && (
            <div className="border border-outline-variant/30 rounded p-6">
              <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-book text-[#FF4500]"></i>
                About Page
              </h4>
              <div>
                <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-2">
                  Store Story / About Content
                </label>
                <textarea
                  value={settingsForm.aboutStory}
                  onChange={(e) => setSettingsForm({ ...settingsForm, aboutStory: e.target.value })}
                  rows={8}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
                  placeholder="Enter your store story..."
                />
              </div>
            </div>
          )}

          {/* Save & Reset Buttons - Always visible */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-outline-variant/30 mt-6">
            <button
              onClick={handleSaveSettings}
              className="flex-1 bg-gradient-to-br from-primary to-primary-container px-6 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center justify-center gap-2 hover:from-primary-container hover:to-primary transition-all shadow-lg shadow-primary/20 text-sm sm:text-base"
            >
              <i className="fa-solid fa-save"></i>
              {t.admin.saveSettings}
            </button>
            <button
              onClick={() => {
                setSettingsForm({
                  username: 'admin',
                  password: 'admin',
                  heroTitle: 'Equip Your Adventure',
                  heroSubtitle: 'Engineered for the long haul.',
                  heroImage: '',
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
                  storeName: 'Aksesoris Touring Madiun',
                  instagramTag: '#AksesorisTouringMadiun',
                  aboutStory: '',
                });
                showAlert({
                  type: 'info',
                  title: 'SETTINGS RESET',
                  message: 'Settings have been reset to default.',
                  badgeText: 'RESET',
                  badgeColor: 'bg-blue-900/30 text-blue-200',
                });
              }}
              className="flex-1 bg-surface-container-highest px-6 py-3 font-headline font-bold uppercase tracking-widest text-white rounded-md border border-outline-variant/20 btn-brutal flex items-center justify-center gap-2 hover:bg-surface-bright transition-all text-sm sm:text-base"
            >
              <i className="fa-solid fa-rotate-left"></i>
              Reset Default
            </button>
          </div>
        </div>
      )}

      {/* Alert Popup */}
      <AlertPopup
        isOpen={alertPopup.isOpen}
        type={alertPopup.type}
        title={alertPopup.title}
        message={alertPopup.message}
        badgeText={alertPopup.badgeText}
        badgeColor={alertPopup.badgeColor}
        primaryAction={alertPopup.primaryAction}
        primaryActionText={alertPopup.primaryActionText}
        secondaryAction={alertPopup.secondaryAction}
        secondaryActionText={alertPopup.secondaryActionText}
        onClose={closeAlert}
      />
    </AdminLayout>
  );
}
