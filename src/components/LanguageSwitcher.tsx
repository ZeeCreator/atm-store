'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = language === 'id' ? 'en' : 'id';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
      title={`Switch to ${language === 'id' ? 'English' : 'Bahasa Indonesia'}`}
    >
      <span className="text-lg">
        {language === 'id' ? '🇮🇩' : '🇬'}
      </span>
      <span className="hidden sm:inline font-headline uppercase tracking-widest text-xs">
        {language === 'id' ? 'ID' : 'EN'}
      </span>
    </button>
  );
}
