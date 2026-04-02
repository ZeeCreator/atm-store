'use client';

import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import { Icons } from '@/components/Icon';
import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  isFlashSale?: boolean;
  flashSalePrice?: number;
  discount?: number;
  stock: number;
};

type FlashSaleConfig = {
  isActive: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  title: string;
  endTime: number | null;
};

interface FlashSaleManagerProps {
  showAlert: (config: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    badgeText?: string;
    badgeColor?: string;
    primaryAction?: () => void;
    primaryActionText?: string;
    secondaryAction?: () => void;
    secondaryActionText?: string;
  }) => void;
}

export default function FlashSaleManager({ showAlert }: FlashSaleManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleConfig, setFlashSaleConfig] = useState<FlashSaleConfig>({
    isActive: false,
    hours: 4,
    minutes: 0,
    seconds: 0,
    title: 'Flash Sale Spesial',
    endTime: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Fetch products dan flash sale config
  useEffect(() => {
    // Fetch semua products
    const productsRef = ref(db, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList: Product[] = Object.entries(data).map(([key, value]) => {
          const product = value as Product;
          return { ...product, id: key };
        });
        setProducts(productsList);

        // Set selected products yang sudah ada isFlashSale = true
        const flashSaleProducts = productsList
          .filter((p) => p.isFlashSale)
          .map((p) => p.id);
        setSelectedProducts(new Set(flashSaleProducts));
      } else {
        setProducts([]);
      }
    });

    // Fetch flash sale config
    const flashSaleRef = ref(db, 'flashSale');
    const unsubscribeFlashSale = onValue(flashSaleRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFlashSaleConfig({
          isActive: data.isActive ?? false,
          hours: data.hours ?? 4,
          minutes: data.minutes ?? 0,
          seconds: data.seconds ?? 0,
          title: data.title ?? 'Flash Sale Spesial',
          endTime: data.endTime ?? null,
        });
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeFlashSale();
    };
  }, []);

  // Toggle produk flash sale
  const toggleProductFlashSale = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)));
    }
  };

  // Simpan pengaturan flash sale
  const handleSaveFlashSale = async () => {
    // Validasi
    if (flashSaleConfig.hours === 0 && flashSaleConfig.minutes === 0 && flashSaleConfig.seconds === 0) {
      showAlert({
        type: 'error',
        title: 'VALIDASI ERROR',
        message: 'Durasi flash sale tidak boleh kosong. Setel minimal 1 detik.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
      return;
    }

    if (selectedProducts.size === 0) {
      showAlert({
        type: 'warning',
        title: 'TIDAK ADA PRODUK',
        message: 'Pilih minimal 1 produk untuk flash sale.',
        badgeText: 'PERINGATAN',
        badgeColor: 'bg-amber-900/30 text-amber-200',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Hitung endTime
      const endTime = flashSaleConfig.isActive
        ? Date.now() + (flashSaleConfig.hours * 3600000 + flashSaleConfig.minutes * 60000 + flashSaleConfig.seconds * 1000)
        : null;

      // Update flash sale config
      await update(ref(db, 'flashSale'), {
        isActive: flashSaleConfig.isActive,
        hours: flashSaleConfig.hours,
        minutes: flashSaleConfig.minutes,
        seconds: flashSaleConfig.seconds,
        title: flashSaleConfig.title,
        endTime: endTime,
        updatedAt: Date.now(),
      });

      // Update status flash sale untuk setiap produk
      const productUpdates: Record<string, boolean> = {};
      
      // Set semua produk ke isFlashSale = false dulu
      products.forEach((product) => {
        productUpdates[`products/${product.id}/isFlashSale`] = false;
      });

      // Set produk yang dipilih ke isFlashSale = true
      selectedProducts.forEach((productId) => {
        productUpdates[`products/${productId}/isFlashSale`] = true;
      });

      await update(ref(db), productUpdates);

      showAlert({
        type: 'success',
        title: 'FLASH SALE DISIMPAN',
        message: `Pengaturan flash sale berhasil disimpan. ${selectedProducts.size} produk dipilih.`,
        badgeText: 'BERHASIL',
        badgeColor: 'bg-green-900/30 text-green-200',
      });
    } catch (error) {
      console.error('Error saving flash sale:', error);
      showAlert({
        type: 'error',
        title: 'GAGAL MENYIMPAN',
        message: 'Terjadi kesalahan saat menyimpan pengaturan flash sale.',
        badgeText: 'ERROR',
        badgeColor: 'bg-error-container text-on-error-container',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick set duration
  const quickSetDuration = (hours: number, minutes: number, seconds: number) => {
    setFlashSaleConfig({
      ...flashSaleConfig,
      hours,
      minutes,
      seconds,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.Spinner className="text-5xl text-primary-container animate-spin" />
        <p className="text-white/40 mt-4 font-headline uppercase tracking-widest text-sm">
          Memuat Data...
        </p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (price: number, flashSalePrice: number) => {
    if (!flashSalePrice || flashSalePrice >= price) return 0;
    return Math.round(((price - flashSalePrice) / price) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 to-primary-container/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-headline font-bold uppercase text-white mb-2 flex items-center gap-2">
              <i className="fa-solid fa-bolt text-[#FF4500]"></i>
              Manajemen Flash Sale
            </h3>
            <p className="text-sm text-gray-400">
              Kelola produk dan durasi flash sale Anda
            </p>
          </div>
          <div className={`px-4 py-2 rounded-md border ${
            flashSaleConfig.isActive
              ? 'bg-green-900/30 border-green-500/30 text-green-400'
              : 'bg-gray-800/50 border-gray-600/30 text-gray-400'
          }`}>
            <span className="text-xs font-headline uppercase tracking-widest font-bold">
              {flashSaleConfig.isActive ? '● AKTIF' : '○ TIDAK AKTIF'}
            </span>
          </div>
        </div>
      </div>

      {/* Pengaturan Durasi */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
        <h4 className="text-lg font-headline font-bold uppercase text-white mb-6 flex items-center gap-2">
          <i className="fa-solid fa-clock text-[#FF4500]"></i>
          Pengaturan Durasi
        </h4>

        {/* Quick Set Buttons */}
        <div className="mb-6">
          <label className="block text-xs font-headline uppercase tracking-widest text-gray-500 mb-3">
            Durasi Cepat
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => quickSetDuration(0, 30, 0)}
              className="px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs font-headline uppercase tracking-widest hover:bg-primary-container/20 hover:border-primary/50 transition-all"
            >
              30 Menit
            </button>
            <button
              onClick={() => quickSetDuration(1, 0, 0)}
              className="px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs font-headline uppercase tracking-widest hover:bg-primary-container/20 hover:border-primary/50 transition-all"
            >
              1 Jam
            </button>
            <button
              onClick={() => quickSetDuration(4, 0, 0)}
              className="px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs font-headline uppercase tracking-widest hover:bg-primary-container/20 hover:border-primary/50 transition-all"
            >
              4 Jam
            </button>
            <button
              onClick={() => quickSetDuration(12, 0, 0)}
              className="px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs font-headline uppercase tracking-widest hover:bg-primary-container/20 hover:border-primary/50 transition-all"
            >
              12 Jam
            </button>
            <button
              onClick={() => quickSetDuration(24, 0, 0)}
              className="px-4 py-2 bg-surface-container-highest border border-outline-variant/30 rounded text-xs font-headline uppercase tracking-widest hover:bg-primary-container/20 hover:border-primary/50 transition-all"
            >
              24 Jam
            </button>
          </div>
        </div>

        {/* Custom Duration */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-headline uppercase tracking-widest text-gray-500 mb-2">
              Jam
            </label>
            <input
              type="number"
              value={flashSaleConfig.hours}
              onChange={(e) => setFlashSaleConfig({ ...flashSaleConfig, hours: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white text-center focus:border-[#FF4500] focus:ring-0 input-brutal"
              min="0"
              max="999"
            />
          </div>
          <div>
            <label className="block text-[10px] font-headline uppercase tracking-widest text-gray-500 mb-2">
              Menit
            </label>
            <input
              type="number"
              value={flashSaleConfig.minutes}
              onChange={(e) => setFlashSaleConfig({ ...flashSaleConfig, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white text-center focus:border-[#FF4500] focus:ring-0 input-brutal"
              min="0"
              max="59"
            />
          </div>
          <div>
            <label className="block text-[10px] font-headline uppercase tracking-widest text-gray-500 mb-2">
              Detik
            </label>
            <input
              type="number"
              value={flashSaleConfig.seconds}
              onChange={(e) => setFlashSaleConfig({ ...flashSaleConfig, seconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white text-center focus:border-[#FF4500] focus:ring-0 input-brutal"
              min="0"
              max="59"
            />
          </div>
        </div>

        {/* Total Duration Preview */}
        <div className="bg-surface-container-highest rounded-md p-4 border border-outline-variant/15">
          <p className="text-xs text-gray-400 mb-1">Total Durasi:</p>
          <p className="text-lg font-headline font-bold text-white">
            {flashSaleConfig.hours > 0 && `${flashSaleConfig.hours} jam `}
            {flashSaleConfig.minutes > 0 && `${flashSaleConfig.minutes} menit `}
            {flashSaleConfig.seconds > 0 && `${flashSaleConfig.seconds} detik`}
            {flashSaleConfig.hours === 0 && flashSaleConfig.minutes === 0 && flashSaleConfig.seconds === 0 && (
              <span className="text-gray-500">Belum diatur</span>
            )}
          </p>
        </div>
      </div>

      {/* Judul Flash Sale */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
        <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-heading text-[#FF4500]"></i>
          Judul Flash Sale
        </h4>
        <input
          type="text"
          value={flashSaleConfig.title}
          onChange={(e) => setFlashSaleConfig({ ...flashSaleConfig, title: e.target.value })}
          className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded px-4 py-3 text-white focus:border-[#FF4500] focus:ring-0 input-brutal"
          placeholder="Masukkan judul flash sale..."
          maxLength={50}
        />
        <p className="text-xs text-gray-500 mt-2">
          {flashSaleConfig.title.length}/50 karakter
        </p>
      </div>

      {/* Toggle Aktif/Nonaktif */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
        <h4 className="text-lg font-headline font-bold uppercase text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-power-off text-[#FF4500]"></i>
          Status Flash Sale
        </h4>
        <div className="flex items-center justify-between p-4 bg-surface-container-highest rounded-md border border-outline-variant/15">
          <div>
            <p className="text-white font-headline font-bold uppercase mb-1">
              Aktifkan Flash Sale
            </p>
            <p className="text-xs text-gray-400">
              Countdown timer akan dimulai saat flash sale diaktifkan
            </p>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={flashSaleConfig.isActive}
              onChange={(e) => setFlashSaleConfig({ ...flashSaleConfig, isActive: e.target.checked })}
              className="w-5 h-5 accent-[#FF4500]"
            />
            <span className={`text-xs font-headline uppercase tracking-widest font-bold px-3 py-1 rounded ${
              flashSaleConfig.isActive
                ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-600/30'
            }`}>
              {flashSaleConfig.isActive ? 'AKTIF' : 'NONAKTIF'}
            </span>
          </label>
        </div>
      </div>

      {/* Pilihan Produk */}
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-headline font-bold uppercase text-white flex items-center gap-2">
            <i className="fa-solid fa-box text-[#FF4500]"></i>
            Pilih Produk Flash Sale
          </h4>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              {selectedProducts.size} produk dipilih
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs font-headline uppercase tracking-widest text-primary-container hover:text-primary transition-colors"
            >
              {selectedProducts.size === products.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Icons.Box className="text-6xl text-white/30 mb-4 mx-auto" />
            <p className="text-white/60 font-headline uppercase tracking-widest mb-2">
              Belum Ada Produk
            </p>
            <p className="text-white/40 text-sm">
              Tambahkan produk terlebih dahulu di tab Products
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto admin-scroll pr-2">
            {products.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              const discount = calculateDiscount(product.price, product.flashSalePrice || 0);

              return (
                <div
                  key={product.id}
                  onClick={() => toggleProductFlashSale(product.id)}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-[#FF4500] bg-primary/10'
                      : 'border-outline-variant/30 bg-surface-container-highest hover:border-outline-variant/50'
                  }`}
                >
                  {/* Checkbox Indicator */}
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                    isSelected
                      ? 'bg-[#FF4500] border-[#FF4500]'
                      : 'bg-surface-container-low border-gray-500'
                  }`}>
                    {isSelected && (
                      <i className="fa-solid fa-check text-white text-xs"></i>
                    )}
                  </div>

                  {/* Product Image */}
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.images[0] || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{discount}%
                      </div>
                    )}
                    {product.isFlashSale && !isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#FF4500]/90 text-white text-xs font-bold px-2 py-1 text-center">
                        Sedang Flash Sale
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h5 className="font-headline font-bold text-white text-sm mb-2 line-clamp-2">
                      {product.name}
                    </h5>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                        {product.flashSalePrice && product.flashSalePrice > 0 && (
                          <span className="text-sm font-bold text-[#FF4500]">
                            {formatPrice(product.flashSalePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Stok: {product.stock}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/30">
        <button
          onClick={() => {
            setFlashSaleConfig({
              isActive: false,
              hours: 4,
              minutes: 0,
              seconds: 0,
              title: 'Flash Sale Spesial',
              endTime: null,
            });
            setSelectedProducts(new Set());
          }}
          className="px-6 py-3 bg-surface-container-highest border border-outline-variant/30 rounded text-xs font-headline uppercase tracking-widest hover:bg-surface-container-high transition-all"
        >
          Reset
        </button>
        <button
          onClick={handleSaveFlashSale}
          disabled={isSaving}
          className="bg-gradient-to-br from-primary to-primary-container px-8 py-3 font-headline font-bold uppercase tracking-widest text-on-primary rounded-md btn-brutal flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Icons.Spinner className="text-lg animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <i className="fa-solid fa-save"></i>
              Simpan Pengaturan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
