'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function InitUser() {
  const initSettingsSubscription = useStore((state) => state.initSettingsSubscription);
  
  useEffect(() => {
    // Initialize user ID for cart sync
    let userId = localStorage.getItem('atm_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('atm_user_id', userId);
    }
    
    // Initialize settings subscription from Firebase
    initSettingsSubscription();
  }, [initSettingsSubscription]);

  return null;
}
