// pages/Home.jsx
import React, { useState } from "react";
import { Leaf, ChevronRight, Camera, ScanSearch, Award, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const HOW_IT_WORKS_ICONS = [Camera, ScanSearch, Leaf, Award];

export default function Home({ onNavigate }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showHow, setShowHow] = useState(false);

  const howSteps = [t("howStep1"), t("howStep2"), t("howStep3"), t("howStep4")];

  return (
    <main className="page home-page">
      <section className="hero">
        <div className="hero-badge">
          <Leaf size={16} />
          <span>Gloriosa superba</span>
        </div>
        <h1 className="hero-title">{t("homeHero")}</h1>
        <p className="hero-subtext">{t("homeSubtext")}</p>

        <button
          id="detect-disease-btn"
          className="btn btn--primary btn--full btn--hero"
          onClick={() => onNavigate("detect")}
        >
          <Leaf size={22} aria-hidden="true" />
          <span>{t("homeDetectBtn")}</span>
          <ChevronRight size={20} aria-hidden="true" />
        </button>

        <button
          id="how-it-works-btn"
          className="btn btn--ghost btn--full"
          onClick={() => setShowHow(!showHow)}
          aria-expanded={showHow}
        >
          {t("homeHowItWorks")}
        </button>
      </section>

      {showHow && (
        <section className="how-section" aria-label="How it works">
          <div className="how-steps">
            {howSteps.map((step, i) => {
              const Icon = HOW_IT_WORKS_ICONS[i];
              return (
                <React.Fragment key={i}>
                  <div className="how-step">
                    <div className="how-step-icon"><Icon size={24} /></div>
                    <p className="how-step-text">{step}</p>
                  </div>
                  {i < howSteps.length - 1 && (
                    <ArrowRight className="how-arrow" size={20} aria-hidden="true" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>
      )}

      <section className="feature-tiles">
        {[
          { emoji: "📸", labelKey: "detectUploadPhoto", page: "detect" },
          { emoji: "📋", labelKey: "navHistory",        page: "history" },
          { emoji: "❓", labelKey: "navHelp",           page: "help" },
        ].map(({ emoji, labelKey, page }) => (
          <div
            key={page}
            className="feature-tile"
            onClick={() => onNavigate(page)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && onNavigate(page)}
          >
            <div className="feature-tile-icon">{emoji}</div>
            <p className="feature-tile-label">{t(labelKey)}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
