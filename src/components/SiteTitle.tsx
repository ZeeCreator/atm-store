'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function SiteTitle() {
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    // Fetch store name from Firebase
    const settingsRef = ref(db, 'settings/store/name');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStoreName(data);
      } else {
        setStoreName('Aksesoris Touring Madiun');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (storeName) {
      // Update document title
      document.title = `${storeName} | Premium Motorcycle Gear`;
    }
  }, [storeName]);

  return null; // This component doesn't render anything
}
