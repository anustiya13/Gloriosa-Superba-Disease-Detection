// components/LoadingState.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LoadingState() {
  const { t } = useLanguage();

  return (
    <div className="loading-screen" aria-live="polite" aria-busy="true">
      <div className="loading-animation">
        <div className="leaf-spinner">
          <div className="leaf-petal" />
          <div className="leaf-petal" />
          <div className="leaf-petal" />
          <div className="leaf-petal" />
          <div className="leaf-petal" />
          <div className="leaf-petal" />
        </div>
      </div>
      <h2 className="loading-title">{t("loadingTitle")}</h2>
      <p className="loading-subtext">{t("loadingSubtext")}</p>
    </div>
  );
}
