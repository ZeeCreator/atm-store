'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AlertPopup from '@/components/admin/AlertPopup';
import { ref, get, set, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';

export default function BackupRestorePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('backup');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [alertPopup, setAlertPopup] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    badgeText: '',
    badgeColor: '',
  });

  const [backupData, setBackupData] = useState({
    products: 0,
    orders: 0,
    categories: 0,
    settings: false,
    instagram: 0,
    arsenal: 0,
  });

  const [importStats, setImportStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
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
    if (user && activeTab === 'backup') {
      loadBackupData();
    }
  }, [user, activeTab]);

  const loadBackupData = async () => {
    try {
      const [productsSnap, ordersSnap, categoriesSnap, settingsSnap, instagramSnap, arsenalSnap] = await Promise.all([
        get(ref(db, 'products')),
        get(ref(db, 'orders')),
        get(ref(db, 'categories')),
        get(ref(db, 'settings')),
        get(ref(db, 'instagram')),
        get(ref(db, 'arsenal')),
      ]);

      setBackupData({
        products: productsSnap.exists() ? Object.keys(productsSnap.val()).length : 0,
        orders: ordersSnap.exists() ? Object.keys(ordersSnap.val()).length : 0,
        categories: categoriesSnap.exists() ? Object.keys(categoriesSnap.val()).length : 0,
        settings: settingsSnap.exists(),
        instagram: instagramSnap.exists() ? Object.keys(instagramSnap.val()).length : 0,
        arsenal: arsenalSnap.exists() ? Object.keys(arsenalSnap.val()).length : 0,
      });
    } catch (error) {
      console.error('Error loading backup data:', error);
    }
  };

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      const [productsSnap, ordersSnap, categoriesSnap, settingsSnap, instagramSnap, arsenalSnap] = await Promise.all([
        get(ref(db, 'products')),
        get(ref(db, 'orders')),
        get(ref(db, 'categories')),
        get(ref(db, 'settings')),
        get(ref(db, 'instagram')),
        get(ref(db, 'arsenal')),
      ]);

      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        products: productsSnap.exists() ? productsSnap.val() : {},
        orders: ordersSnap.exists() ? ordersSnap.val() : {},
        categories: categoriesSnap.exists() ? categoriesSnap.val() : {},
        settings: settingsSnap.exists() ? settingsSnap.val() : {},
        instagram: instagramSnap.exists() ? instagramSnap.val() : {},
        arsenal: arsenalSnap.exists() ? arsenalSnap.val() : {},
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atm-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showAlert({
        type: 'success',
        title: 'BACKUP CREATED',
        message: 'Backup file has been downloaded successfully.',
        badgeText: 'SUCCESS',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      showAlert({
        type: 'error',
        title: 'BACKUP FAILED',
        message: 'Failed to create backup file.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('⚠️ WARNING: This will OVERWRITE all existing data!\n\nMake sure you have a backup before proceeding.')) {
      return;
    }

    const confirmation = prompt('Type "RESTORE" to confirm:');
    if (confirmation !== 'RESTORE') {
      showAlert({
        type: 'warning',
        title: 'RESTORE CANCELLED',
        message: 'No data was changed.',
        badgeText: 'CANCELLED',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backup = JSON.parse(event.target?.result as string);

          // Restore data
          if (backup.products) await set(ref(db, 'products'), backup.products);
          if (backup.orders) await set(ref(db, 'orders'), backup.orders);
          if (backup.categories) await set(ref(db, 'categories'), backup.categories);
          if (backup.settings) await set(ref(db, 'settings'), backup.settings);
          if (backup.instagram) await set(ref(db, 'instagram'), backup.instagram);
          if (backup.arsenal) await set(ref(db, 'arsenal'), backup.arsenal);

          showAlert({
            type: 'success',
            title: 'RESTORE COMPLETE',
            message: 'All data has been restored successfully.',
            badgeText: 'RESTORED',
            badgeColor: 'bg-green-900/30 text-green-200',
          });
          loadBackupData();
        } catch (error) {
          console.error('Error parsing backup file:', error);
          showAlert({
            type: 'error',
            title: 'INVALID BACKUP FILE',
            message: 'The backup file format is invalid.',
            badgeText: 'ERROR',
            badgeColor: 'bg-error-container text-on-error-container',
          });
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error restoring backup:', error);
      showAlert({
        type: 'error',
        title: 'RESTORE FAILED',
        message: 'Failed to restore backup.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
      setIsProcessing(false);
    }
  };

  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const products: any[] = XLSX.utils.sheet_to_json(worksheet);

      setImportStats({ total: products.length, success: 0, failed: 0 });

      let success = 0;
      let failed = 0;

      for (const product of products) {
        try {
          if (!product.name || !product.price) {
            failed++;
            continue;
          }

          await push(ref(db, 'products'), {
            name: product.name || 'Unknown',
            price: parseInt(product.price) || 0,
            category: product.category || 'Uncategorized',
            brand: product.brand || 'Generic',
            description: product.description || '',
            images: product.images ? [product.images] : [],
            stock: parseInt(product.stock) || 0,
            reviews: 0,
            isFlashSale: product.isFlashSale || false,
            flashSalePrice: parseInt(product.flashSalePrice) || 0,
            discount: parseInt(product.discount) || 0,
            createdAt: Date.now(),
          });
          success++;
        } catch (error) {
          console.error('Error importing product:', error);
          failed++;
        }
      }

      setImportStats({ total: products.length, success, failed });

      showAlert({
        type: success > 0 ? 'success' : 'warning',
        title: 'IMPORT COMPLETE',
        message: `Imported ${success} products. ${failed > 0 ? `${failed} failed.` : ''}`,
        badgeText: `${success}/${products.length}`,
        badgeColor: success > 0 ? 'bg-green-900/30 text-green-200' : 'bg-amber-900/30 text-amber-200',
      });
    } catch (error) {
      console.error('Error importing products:', error);
      showAlert({
        type: 'error',
        title: 'IMPORT FAILED',
        message: 'Failed to import products. Make sure the file is a valid Excel/CSV file.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        name: 'Product Name',
        price: 100000,
        category: 'Category',
        brand: 'Brand',
        description: 'Product description',
        images: 'https://example.com/image.jpg',
        stock: 10,
        isFlashSale: false,
        flashSalePrice: 0,
        discount: 0,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product-import-template.xlsx');

    showAlert({
      type: 'info',
      title: 'TEMPLATE DOWNLOADED',
      message: 'Product import template has been downloaded.',
      badgeText: 'DOWNLOADED',
      badgeColor: 'bg-blue-900/30 text-blue-200',
    });
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
    >
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-headline font-black uppercase text-white mb-2 flex items-center gap-3">
          <i className="fa-solid fa-database text-[#FF4500]"></i>
          Backup & Import
        </h1>
        <p className="text-white/60 text-sm">
          Manage your store data - Backup, Restore, and Import Products
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-outline-variant/30">
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-6 py-3 font-headline font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${
            activeTab === 'backup'
              ? 'text-[#FF4500] border-[#FF4500]'
              : 'text-gray-500 border-transparent hover:text-white'
          }`}
        >
          <i className="fa-solid fa-floppy-disk mr-2"></i>
          Backup & Restore
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-3 font-headline font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${
            activeTab === 'import'
              ? 'text-[#FF4500] border-[#FF4500]'
              : 'text-gray-500 border-transparent hover:text-white'
          }`}
        >
          <i className="fa-solid fa-file-import mr-2"></i>
          Import Products
        </button>
      </div>

      {/* Backup & Restore Tab */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Data Overview */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
            <h2 className="font-headline text-xl font-bold uppercase text-white mb-6 flex items-center gap-2">
              <i className="fa-solid fa-chart-pie text-[#FF4500]"></i>
              Current Data Overview
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded">
                <span className="text-white/60 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-box"></i> Products
                </span>
                <span className="font-headline font-bold text-white text-lg">{backupData.products}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded">
                <span className="text-white/60 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-shopping-cart"></i> Orders
                </span>
                <span className="font-headline font-bold text-white text-lg">{backupData.orders}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded">
                <span className="text-white/60 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-tags"></i> Categories
                </span>
                <span className="font-headline font-bold text-white text-lg">{backupData.categories}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded">
                <span className="text-white/60 text-sm flex items-center gap-2">
                  <i className="fa-brands fa-instagram"></i> Instagram Posts
                </span>
                <span className="font-headline font-bold text-white text-lg">{backupData.instagram}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded">
                <span className="text-white/60 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-layer-group"></i> Arsenal
                </span>
                <span className="font-headline font-bold text-white text-lg">{backupData.arsenal}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded">
                <span className="text-white/60 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-gear"></i> Settings
                </span>
                <span className={`font-headline font-bold text-lg ${backupData.settings ? 'text-green-500' : 'text-red-500'}`}>
                  {backupData.settings ? '✓ Configured' : '✗ Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Backup Actions */}
          <div className="space-y-6">
            {/* Create Backup */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-download text-[#FF4500]"></i>
                Create Backup
              </h2>
              <p className="text-sm text-white/60 mb-6">
                Download all your store data (products, orders, categories, settings) as a JSON file.
              </p>
              <button
                onClick={handleBackup}
                disabled={isProcessing}
                className="w-full bg-gradient-to-br from-primary to-primary-container px-6 py-4 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-download"></i>
                {isProcessing ? 'Creating Backup...' : 'Download Backup'}
              </button>
            </div>

            {/* Restore Backup */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-upload text-[#FF4500]"></i>
                Restore Backup
              </h2>
              <p className="text-sm text-white/60 mb-6">
                Upload a previously downloaded backup file to restore all data.
              </p>
              <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-8 text-center hover:border-[#FF4500]/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  disabled={isProcessing}
                  className="hidden"
                  id="restore-file"
                />
                <label htmlFor="restore-file" className="cursor-pointer">
                  <i className="fa-solid fa-file-import text-4xl text-[#FF4500] mb-4"></i>
                  <p className="text-white font-headline font-bold uppercase mb-2">
                    Click to Upload Backup
                  </p>
                  <p className="text-xs text-white/60">
                    Select a .json backup file
                  </p>
                </label>
              </div>
              {isProcessing && (
                <div className="mt-4 text-center">
                  <i className="fa-solid fa-circle-notch text-2xl text-primary-container animate-spin"></i>
                  <p className="text-xs text-white/60 mt-2">Restoring data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Products Tab */}
      {activeTab === 'import' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Instructions */}
          <div className="space-y-6">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
              <h2 className="font-headline text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                <i className="fa-solid fa-file-excel text-[#FF4500]"></i>
                Import Products from Excel/CSV
              </h2>
              <p className="text-sm text-white/60 mb-6">
                Bulk import products from an Excel (.xlsx) or CSV file. Make sure your file has the following columns:
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>name</strong> - Product name (required)</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>price</strong> - Price in IDR (required)</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>category</strong> - Product category</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>brand</strong> - Product brand</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>description</strong> - Product description</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>images</strong> - Image URL</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>stock</strong> - Stock quantity</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>isFlashSale</strong> - true/false</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>flashSalePrice</strong> - Flash sale price</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <i className="fa-solid fa-check text-green-500"></i>
                  <span><strong>discount</strong> - Discount percentage</span>
                </div>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="w-full mt-6 bg-surface-container-highest px-6 py-3 font-headline font-bold uppercase tracking-widest text-white rounded-md border border-outline-variant/20 hover:bg-surface-bright transition-colors flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-download"></i>
                Download Template
              </button>
            </div>

            {/* Import Stats */}
            {importStats.total > 0 && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
                <h2 className="font-headline text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-[#FF4500]"></i>
                  Import Results
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-surface-container-highest rounded">
                    <p className="text-2xl font-headline font-bold text-white">{importStats.total}</p>
                    <p className="text-xs text-white/60 uppercase">Total</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded">
                    <p className="text-2xl font-headline font-bold text-green-500">{importStats.success}</p>
                    <p className="text-xs text-green-500/60 uppercase">Success</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded">
                    <p className="text-2xl font-headline font-bold text-red-500">{importStats.failed}</p>
                    <p className="text-xs text-red-500/60 uppercase">Failed</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
            <h2 className="font-headline text-xl font-bold uppercase text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-cloud-arrow-up text-[#FF4500]"></i>
              Upload File
            </h2>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-12 text-center hover:border-[#FF4500]/50 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportProducts}
                disabled={isProcessing}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file" className="cursor-pointer">
                <i className="fa-solid fa-file-excel text-6xl text-[#FF4500] mb-4"></i>
                <p className="text-white font-headline font-bold uppercase mb-2">
                  Click to Upload Excel/CSV
                </p>
                <p className="text-xs text-white/60">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </label>
            </div>
            {isProcessing && (
              <div className="mt-4 text-center">
                <i className="fa-solid fa-circle-notch text-2xl text-primary-container animate-spin"></i>
                <p className="text-xs text-white/60 mt-2">Importing products...</p>
              </div>
            )}
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
