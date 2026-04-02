'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authSettings, setAuthSettings] = useState<{ username: string; password: string }>({
    username: 'admin',
    password: 'admin',
  });

  useEffect(() => {
    // Fetch auth settings from Firebase
    const settingsRef = ref(db, 'settings/auth');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAuthSettings(data);
      }
      
      // Check if user is already logged in (from localStorage)
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    // Simple validation against database settings
    if (username === authSettings.username && password === authSettings.password) {
      const userData = { username, email: `${username}@admin.com` };
      setUser(userData);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      throw new Error('Invalid username or password');
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
