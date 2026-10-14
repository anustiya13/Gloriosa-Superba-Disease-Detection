// ============================================================
// context/LanguageContext.jsx
// Provides t() translation hook + language switcher.
// Default language: "ta" (Tamil)
// ============================================================

import React, { createContext, useContext, useState } from "react";
import translations from "../data/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children, initialLang = "ta" }) {
  const [lang, setLang] = useState(initialLang);

  function t(key) {
    return translations[lang]?.[key] ?? translations["ta"]?.[key] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside <LanguageProvider>");
  return ctx;
}
