import React, { createContext, useContext, useState } from 'react';
import type { Language, UIStrings, SupportedLang } from '../types';
import { LANGUAGES } from '../data';
import { UI_STRINGS } from '../data/translations';

interface LanguageContextValue {
  selectedLanguage: Language;
  setSelectedLanguage: (lang: Language) => void;
  /** Translate a UI string key into the selected language */
  t: (key: keyof UIStrings) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);

  function t(key: keyof UIStrings): string {
    const code = selectedLanguage.code as SupportedLang;
    return UI_STRINGS[code]?.[key] ?? UI_STRINGS['en'][key];
  }

  return (
    <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
