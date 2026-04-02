'use client';

import { useEffect } from 'react';

export default function InitUser() {
  useEffect(() => {
    // Initialize user ID for cart sync
    let userId = localStorage.getItem('atm_user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('atm_user_id', userId);
    }
  }, []);
  
  return null;
}
