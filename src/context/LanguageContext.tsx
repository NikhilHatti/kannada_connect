import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language, UIStrings, SupportedLang } from '../types';
import { LANGUAGES } from '../data';
import { UI_STRINGS } from '../data/translations';
import { ADDITIONAL_UI_STRINGS } from '../data/gamificationTranslations';

interface LanguageContextValue {
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  currentLang: SupportedLang;
  /** Translate a UI string key into the selected language */
  t: (key: keyof UIStrings) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('kc_lang');
      if (saved) {
        const found = LANGUAGES.find((l) => l.code === saved);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return LANGUAGES[0];
  });

  useEffect(() => {
    try {
      localStorage.setItem('kc_lang', selectedLanguage.code);
    } catch {
      // ignore
    }
  }, [selectedLanguage]);

  function t(key: keyof UIStrings): string {
    const code = selectedLanguage.code as SupportedLang;
    return (
      ADDITIONAL_UI_STRINGS[code]?.[key] ??
      UI_STRINGS[code]?.[key] ??
      ADDITIONAL_UI_STRINGS['en']?.[key] ??
      UI_STRINGS['en']?.[key] ??
      (key as string)
    );
  }

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        currentLang: selectedLanguage.code as SupportedLang,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
