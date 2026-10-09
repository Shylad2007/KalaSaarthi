import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language, LanguageOption } from "./translations";
import { LANGUAGES, translations } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  currentLanguage: LanguageOption;
  languages: LanguageOption[];
  formatCurrency: (amount: number | string) => string;
  formatNumber: (num: number) => string;
  formatDate: (date: Date | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "kalasaarthi_lang";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language;
      if (saved && (saved === "en" || saved === "hi" || saved === "mr" || saved === "ta" || saved === "as")) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // Storage error ignored
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    const enDict = translations.en;
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  const currentLanguage = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return `₹${amount}`;
    return new Intl.NumberFormat(currentLanguage.locale, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat(currentLanguage.locale).format(num);
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat(currentLanguage.locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguage,
        languages: LANGUAGES,
        formatCurrency,
        formatNumber,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
