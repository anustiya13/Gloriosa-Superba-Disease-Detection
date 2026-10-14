// components/LanguageSelector.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { updateLanguage } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const { isAuthenticated, updateUser } = useAuth();

  async function handleSwitch(newLang) {
    setLang(newLang);
    // Persist to backend if logged in
    if (isAuthenticated) {
      try {
        await updateLanguage(newLang);
        updateUser({ language: newLang });
      } catch (e) {
        // Non-critical — just log
        console.warn("[LanguageSelector] Failed to save language:", e);
      }
    }
  }

  return (
    <div className="lang-selector" role="group" aria-label="Language selector">
      <button
        className={`lang-btn ${lang === "ta" ? "lang-btn--active" : ""}`}
        onClick={() => handleSwitch("ta")}
        aria-pressed={lang === "ta"}
        title="தமிழ்"
      >
        தமிழ்
      </button>
      <span className="lang-divider" aria-hidden="true">|</span>
      <button
        className={`lang-btn ${lang === "en" ? "lang-btn--active" : ""}`}
        onClick={() => handleSwitch("en")}
        aria-pressed={lang === "en"}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
