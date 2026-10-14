// components/Header.jsx
import React from "react";
import { Leaf } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function Header() {
  const { t } = useLanguage();
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <Leaf size={22} strokeWidth={2.5} />
          </div>
          <span className="header-title">{t("appName")}</span>
        </div>
        <LanguageSelector />
      </div>
    </header>
  );
}
