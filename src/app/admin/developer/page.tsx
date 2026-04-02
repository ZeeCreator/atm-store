'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AlertPopup from '@/components/admin/AlertPopup';
import { ref, onValue, remove, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function DeveloperPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    totalInstagram: 0,
    totalArsenal: 0,
    totalRevenue: 0,
  });

  const [alertPopup, setAlertPopup] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    badgeText: '',
    badgeColor: '',
  });

  const showAlert = (config: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    badgeText?: string;
    badgeColor?: string;
  }) => {
    setAlertPopup({ ...config, isOpen: true, badgeText: config.badgeText || '', badgeColor: config.badgeColor || '' });
  };

  const closeAlert = () => {
    setAlertPopup((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const productsRef = ref(db, 'products');
      const ordersRef = ref(db, 'orders');
      const categoriesRef = ref(db, 'categories');
      const instagramRef = ref(db, 'instagram');
      const arsenalRef = ref(db, 'arsenal');

      const [productsSnap, ordersSnap, categoriesSnap, instagramSnap, arsenalSnap] = await Promise.all([
        get(productsRef),
        get(ordersRef),
        get(categoriesRef),
        get(instagramRef),
        get(arsenalRef),
      ]);

      const products = productsSnap.exists() ? Object.keys(productsSnap.val()).length : 0;
      const orders = ordersSnap.exists() ? Object.keys(ordersSnap.val()).length : 0;
      const categories = categoriesSnap.exists() ? Object.keys(categoriesSnap.val()).length : 0;
      const instagram = instagramSnap.exists() ? Object.keys(instagramSnap.val()).length : 0;
      const arsenal = arsenalSnap.exists() ? Object.keys(arsenalSnap.val()).length : 0;

      // Calculate total revenue
      let totalRevenue = 0;
      if (ordersSnap.exists()) {
        const ordersData = ordersSnap.val();
        Object.values(ordersData).forEach((order: any) => {
          totalRevenue += order.subtotal || 0;
        });
      }

      setStats({
        totalProducts: products,
        totalOrders: orders,
        totalCategories: categories,
        totalInstagram: instagram,
        totalArsenal: arsenal,
        totalRevenue,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setIsLoading(false);
    }
  };

  const handleDeleteCollection = async (collection: string, displayName: string) => {
    if (!confirm(`⚠️ WARNING: This will delete ALL ${displayName.toUpperCase()}!\n\nType "DELETE" to confirm:`)) {
      return;
    }

    const confirmation = prompt(`Type "DELETE ${collection}" to confirm deletion:`);
    if (confirmation !== `DELETE ${collection}`) {
      showAlert({
        type: 'warning',
        title: 'DELETION CANCELLED',
        message: 'No data was deleted.',
        badgeText: 'CANCELLED',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    try {
      await remove(ref(db, collection));
      showAlert({
        type: 'success',
        title: `${displayName.toUpperCase()} DELETED`,
        message: `All ${displayName} have been permanently deleted.`,
        badgeText: 'DELETED',
        badgeColor: 'bg-red-900/30 text-red-200',
      });
      loadStats(); // Reload stats
    } catch (error) {
      console.error(`Error deleting ${collection}:`, error);
      showAlert({
        type: 'error',
        title: 'DELETION FAILED',
        message: `Failed to delete ${displayName}.`,
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const handleResetSettings = async () => {
    if (!confirm('⚠️ WARNING: This will reset ALL settings to default!\n\nThis action cannot be undone.')) {
      return;
    }

    const confirmation = prompt('Type "RESET SETTINGS" to confirm:');
    if (confirmation !== 'RESET SETTINGS') {
      showAlert({
        type: 'warning',
        title: 'RESET CANCELLED',
        message: 'Settings remain unchanged.',
        badgeText: 'CANCELLED',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    try {
      await set(ref(db, 'settings'), {
        auth: {
          username: 'admin',
          password: 'admin',
        },
        hero: {
          title: 'Equip Your Adventure',
          subtitle: 'Engineered for the long haul.',
          image: '',
        },
        contact: {
          whatsappNumber: '6281234567890',
        },
        store: {
          name: 'Aksesoris Touring Madiun',
        },
        social: {
          instagramTag: '#AksesorisTouringMadiun',
        },
        about: {
          storyContent: '',
        },
      });

      showAlert({
        type: 'success',
        title: 'SETTINGS RESET',
        message: 'All settings have been reset to default.',
        badgeText: 'RESET',
        badgeColor: 'bg-blue-900/30 text-blue-200',
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      showAlert({
        type: 'error',
        title: 'RESET FAILED',
        message: 'Failed to reset settings.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131313]">
        <div className="text-center">
          <i className="fa-solid fa-circle-notch text-5xl text-primary-container animate-spin"></i>
          <p className="text-white/40 mt-4 font-headline uppercase tracking-widest text-sm">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={logout}
      productsCount={stats.totalProducts}
      ordersCount={stats.totalOrders}
      instagramCount={stats.totalInstagram}
    >
      {/* Developer Dashboard */}
      {activeTab === 'overview' && (
        <div>
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-headline font-black uppercase text-white mb-2 flex items-center gap-3">
              <i className="fa-solid fa-code text-[#FF4500]"></i>
              Developer Dashboard
            </h1>
            <p className="text-white/60 text-sm">
              System management tools for internal use only
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-3xl"></i>
              <div>
                <h3 className="font-headline font-bold text-red-400 uppercase mb-2">
                  ⚠️ Developer Only
                </h3>
                <p className="text-sm text-red-200/80">
                  The tools on this page are for INTERNAL USE ONLY. Misuse can result in permanent data loss. 
                  Make sure you have backups before performing any destructive actions.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <i className="fa-solid fa-box text-primary text-2xl"></i>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Products</span>
              </div>
              <p className="text-3xl font-headline font-bold text-white">{stats.totalProducts}</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <i className="fa-solid fa-shopping-cart text-primary text-2xl"></i>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Orders</span>
              </div>
              <p className="text-3xl font-headline font-bold text-white">{stats.totalOrders}</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <i className="fa-solid fa-tags text-primary text-2xl"></i>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Categories</span>
              </div>
              <p className="text-3xl font-headline font-bold text-white">{stats.totalCategories}</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <i className="fa-brands fa-instagram text-primary text-2xl"></i>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Instagram</span>
              </div>
              <p className="text-3xl font-headline font-bold text-white">{stats.totalInstagram}</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <i className="fa-solid fa-layer-group text-primary text-2xl"></i>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Arsenal</span>
              </div>
              <p className="text-3xl font-headline font-bold text-white">{stats.totalArsenal}</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <i className="fa-solid fa-coins text-primary text-2xl"></i>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Total Revenue</span>
              </div>
              <p className="text-3xl font-headline font-bold text-[#FF4500]">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Data Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delete Collections */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-database text-[#FF4500]"></i>
                Delete Collections
              </h2>

              <div className="space-y-4">
                <div className="bg-surface-container-highest border border-outline-variant/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-white">Products</h3>
                      <p className="text-xs text-white/60">{stats.totalProducts} items</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCollection('products', 'Products')}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded text-xs font-headline uppercase tracking-widest transition-colors"
                    >
                      Delete All
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-highest border border-outline-variant/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-white">Orders</h3>
                      <p className="text-xs text-white/60">{stats.totalOrders} orders</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCollection('orders', 'Orders')}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded text-xs font-headline uppercase tracking-widest transition-colors"
                    >
                      Delete All
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-highest border border-outline-variant/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-white">Categories</h3>
                      <p className="text-xs text-white/60">{stats.totalCategories} categories</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCollection('categories', 'Categories')}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded text-xs font-headline uppercase tracking-widest transition-colors"
                    >
                      Delete All
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-highest border border-outline-variant/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-white">Instagram Posts</h3>
                      <p className="text-xs text-white/60">{stats.totalInstagram} posts</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCollection('instagram', 'Instagram Posts')}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded text-xs font-headline uppercase tracking-widest transition-colors"
                    >
                      Delete All
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-highest border border-outline-variant/30 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-headline font-bold text-white">Arsenal Categories</h3>
                      <p className="text-xs text-white/60">{stats.totalArsenal} categories</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCollection('arsenal', 'Arsenal Categories')}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded text-xs font-headline uppercase tracking-widest transition-colors"
                    >
                      Delete All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
                <i className="fa-solid fa-gear text-[#FF4500]"></i>
                System Settings
              </h2>

              <div className="space-y-4">
                <div className="bg-surface-container-highest border border-outline-variant/30 rounded p-4">
                  <h3 className="font-headline font-bold text-white mb-2">Reset All Settings</h3>
                  <p className="text-xs text-white/60 mb-4">
                    Reset authentication, hero section, contact info, and all other settings to default values.
                  </p>
                  <button
                    onClick={handleResetSettings}
                    className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-4 py-2 rounded text-xs font-headline uppercase tracking-widest transition-colors"
                  >
                    Reset Settings
                  </button>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded p-4">
                  <h3 className="font-headline font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-circle-info"></i>
                    System Information
                  </h3>
                  <div className="space-y-2 text-xs text-blue-200/80">
                    <p><strong>Version:</strong> 2.4.0</p>
                    <p><strong>Database:</strong> Firebase Realtime DB</p>
                    <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
                    <p><strong>Last Backup:</strong> _Not tracked_</p>
                  </div>
                </div>
              </div>
            </div>
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
        onClose={closeAlert}
      />
    </AdminLayout>
  );
}
