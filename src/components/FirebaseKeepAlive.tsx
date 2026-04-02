'use client';

import { useEffect } from 'react';
import { ref, set, serverTimestamp } from 'firebase/database';
import { db } from '@/lib/firebase';

/**
 * Firebase Keep-Alive System
 * 
 * Komponen ini menjaga koneksi Firebase tetap aktif dengan melakukan
 * heartbeat secara berkala ke database. Ini mencegah Firebase dari
 * idle timeout dan memastikan koneksi tetap hidup.
 */
export default function FirebaseKeepAlive() {
  useEffect(() => {
    // Heartbeat interval - update setiap 10 detik
    const HEARTBEAT_INTERVAL = 10000; // 10 detik
    
    // Unique ID untuk instance ini
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Fungsi heartbeat
    const sendHeartbeat = async () => {
      try {
        const heartbeatRef = ref(db, `system/heartbeat/${clientId}`);
        await set(heartbeatRef, {
          timestamp: serverTimestamp(),
          clientId,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        });
      } catch (error) {
        // Silent fail - jangan ganggu user dengan error heartbeat
        console.warn('Heartbeat failed:', error);
      }
    };

    // Kirim heartbeat pertama
    sendHeartbeat();

    // Setup interval untuk heartbeat berikutnya
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Cleanup saat component unmount
    return () => {
      clearInterval(interval);
      
      // Optional: Hapus heartbeat saat user leave
      const cleanupRef = ref(db, `system/heartbeat/${clientId}`);
      set(cleanupRef, null).catch(() => {});
    };
  }, []);

  return null; // Component ini tidak render apapun
}
