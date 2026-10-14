// components/BottomNavigation.jsx
import React from "react";
import { Home, ScanSearch, History, HelpCircle, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const NAV_ITEMS = [
  { key: "home",    labelKey: "navHome",    Icon: Home },
  { key: "detect",  labelKey: "navDetect",  Icon: ScanSearch },
  { key: "history", labelKey: "navHistory", Icon: History },
  { key: "help",    labelKey: "navHelp",    Icon: HelpCircle },
  { key: "profile", labelKey: "navProfile", Icon: User },
];

export default function BottomNavigation({ activePage, onNavigate }) {
  const { t } = useLanguage();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map(({ key, labelKey, Icon }) => (
        <button
          key={key}
          className={`bottom-nav-item ${activePage === key ? "bottom-nav-item--active" : ""}`}
          onClick={() => onNavigate(key)}
          aria-label={t(labelKey)}
          aria-current={activePage === key ? "page" : undefined}
        >
          <Icon size={22} strokeWidth={activePage === key ? 2.5 : 1.8} aria-hidden="true" />
          <span className="bottom-nav-label">{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
