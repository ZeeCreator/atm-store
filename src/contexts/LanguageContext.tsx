'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, translations, detectLanguage, saveLanguage, getCurrentLanguage } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  t: Translation;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved language or detect from browser on mount
    const savedLang = getCurrentLanguage();
    setLanguageState(savedLang);
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const t = translations[language];
  const isRTL = false; // Set to true if you add RTL languages like Arabic

  if (!isLoaded) {
    return null; // Or show a loading spinner
  }

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
