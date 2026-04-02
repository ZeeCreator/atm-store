'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  productsCount?: number;
  ordersCount?: number;
  instagramCount?: number;
}

export default function AdminLayout({
  children,
  user,
  activeTab,
  setActiveTab,
  onLogout,
  productsCount = 0,
  ordersCount = 0,
  instagramCount = 0,
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
    { id: 'products', label: 'Products', icon: 'fa-box', count: productsCount },
    { id: 'orders', label: 'Orders', icon: 'fa-shopping-cart', count: ordersCount },
    { id: 'flashsale', label: 'Flash Sale', icon: 'fa-bolt' },
    { id: 'categories', label: 'Categories', icon: 'fa-tags' },
    { id: 'arsenal', label: 'The Arsenal', icon: 'fa-th-large' },
    { id: 'instagram', label: 'Instagram', icon: 'fa-instagram', count: instagramCount, isIcon: true },
    { id: 'seo', label: 'SEO Settings', icon: 'fa-search' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
    { id: 'backup', label: 'Backup/Restore', icon: 'fa-database', isDev: true },
    { id: 'developer', label: 'Developer', icon: 'fa-code', isDev: true },
  ];

  return (
    <div className="min-h-screen bg-[#131313] admin-brutal">
      {/* Noise Texture Overlay */}
      <div className="noise-bg fixed inset-0 pointer-events-none z-50"></div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-[#131313] border-r border-[#5d4038]/15 hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-xl font-bold text-[#FF4500] font-headline tracking-tight uppercase">ATM Admin</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-1">Iron &amp; Tarmac Ops</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto admin-scroll">
          {sidebarItems.map((item) => {
            const isActive = item.isDev 
              ? (item.id === 'backup' ? pathname === '/admin/backup' : pathname === '/admin/developer')
              : activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isDev) {
                    if (item.id === 'backup') {
                      router.push('/admin/backup');
                    } else {
                      router.push('/admin/developer');
                    }
                  } else {
                    // If currently on developer page, navigate to /admin first
                    if (pathname === '/admin/developer' || pathname === '/admin/backup') {
                      router.push('/admin');
                      // Set active tab after navigation
                      setTimeout(() => setActiveTab(item.id), 100);
                    } else {
                      setActiveTab(item.id);
                    }
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  isActive
                    ? 'sidebar-active'
                    : 'sidebar-inactive'
                }`}
              >
                {item.isIcon ? (
                  <i className={`fa-brands ${item.icon} text-base`}></i>
                ) : (
                  <i className={`fa-solid ${item.icon} text-base`}></i>
                )}
                <span className="font-headline tracking-tight uppercase">{item.label}</span>
                {item.count !== undefined && !item.isDev && (
                  <span className="text-white/40 text-xs ml-auto">({item.count})</span>
                )}
              </button>
            );
          })}
        </nav>
        
        <div className="p-6 bg-[#1c1b1b] flex items-center gap-3 mt-auto">
          <div className="w-10 h-10 rounded-lg bg-[#FF4500] flex items-center justify-center text-white font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{user?.email?.split('@')[0]}</p>
            <p className="text-[10px] text-gray-500 uppercase">Admin Level 4</p>
          </div>
        </div>
      </aside>

      {/* Desktop Top Bar */}
      <header className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-8 z-30 bg-[#131313]/80 backdrop-blur-md hidden lg:flex">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"></i>
            <input
              className="bg-surface-container-lowest border-none border-b-2 border-transparent focus:border-[#FF4500] text-xs tracking-widest w-full pl-10 pr-4 py-2 focus:ring-0 text-white input-brutal"
              placeholder="SEARCH TELEMETRY..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white font-headline text-sm font-black tracking-tighter">Aksesoris Touring Madiun</span>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-[#FF4500] transition-colors">
              <i className="fa-solid fa-bell"></i>
            </button>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-[#FF4500] transition-colors"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden bg-[#131313] border-b border-[#5d4038]/15 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#FF4500] font-headline uppercase tracking-tight">ATM Admin</h1>
        </div>
        <button onClick={onLogout} className="text-gray-400">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </header>

      {/* Mobile Tabs */}
      <div className="lg:hidden w-full bg-[#1c1b1b] border-b border-[#5d4038]/15 sticky top-16 z-40">
        <div className="flex overflow-x-auto scrollbar-hide pb-2 px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-3 font-headline font-bold uppercase tracking-widest text-xs whitespace-nowrap flex-shrink-0 border-b-2 ${
                activeTab === item.id
                  ? 'text-[#FF4500] border-[#FF4500]'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {item.label}
              {item.count !== undefined && ` (${item.count})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 pb-12 px-8 min-h-screen relative z-10">
        {children}
      </main>

      {/* Footer Decor */}
      <div className="fixed bottom-10 right-10 pointer-events-none z-50 hidden lg:block">
        <div className="text-[8px] font-mono text-gray-700 space-y-1 text-right">
          <p>LAT: -7.6298 | LON: 111.5239</p>
          <p>EST_UPTIME: 99.98%</p>
          <p>ATM_OS_V2.4.0</p>
        </div>
      </div>
    </div>
  );
}
