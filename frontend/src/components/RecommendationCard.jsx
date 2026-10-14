// components/RecommendationCard.jsx
import React from "react";
import { Volume2, Sprout, FlaskConical, Eye } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { speakText } from "../services/api";

/**
 * Props:
 *   result - { disease, severity, recommendations: string[], recommendation: { actions[], treatment[] } }
 *   Backend returns `recommendations` as a flat array.
 *   We split it into actions and treatment for display, or use both directly.
 */
export default function RecommendationCard({ result, onBack, onNewCheck }) {
  const { t, lang } = useLanguage();

  // Backend returns flat `recommendations` array
  // The mock data (mockResults.js) uses recommendation.actions / recommendation.treatment
  const flatRecs = result.recommendations || [];
  const actions = result.recommendation?.actions || flatRecs;
  const treatment = result.recommendation?.treatment || [];

  function handleSpeak() {
    const allText = [...actions, ...treatment].join(". ");
    speakText(`${t("recTitle")}. ${allText}. ${t("recMonitor")}. ${t("recMonitorText")}`, lang);
  }

  return (
    <div className="rec-card">
      <button className="speak-btn" onClick={handleSpeak} aria-label={t("speakResult")}>
        <Volume2 size={20} /><span className="speak-label">{t("speakResult")}</span>
      </button>

      {actions.length > 0 && (
        <section className="rec-section">
          <div className="rec-section-header">
            <Sprout size={22} className="rec-icon" />
            <h2 className="rec-section-title">{t("recWhatToDo")}</h2>
          </div>
          <ul className="rec-list">
            {actions.map((action, idx) => (
              <li key={idx} className="rec-list-item">
                <span className="rec-bullet" aria-hidden="true">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {treatment.length > 0 && (
        <section className="rec-section">
          <div className="rec-section-header">
            <FlaskConical size={22} className="rec-icon" />
            <h2 className="rec-section-title">{t("recTreatment")}</h2>
          </div>
          <ul className="rec-list">
            {treatment.map((item, idx) => (
              <li key={idx} className="rec-list-item">
                <span className="rec-bullet" aria-hidden="true">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rec-section">
        <div className="rec-section-header">
          <Eye size={22} className="rec-icon" />
          <h2 className="rec-section-title">{t("recMonitor")}</h2>
        </div>
        <p className="rec-monitor-text">{t("recMonitorText")}</p>
      </section>

      <div className="rec-actions">
        <button className="btn btn--ghost btn--full" onClick={onBack}>{t("recBackBtn")}</button>
        <button className="btn btn--primary btn--full" onClick={onNewCheck}>{t("recNewCheck")}</button>
      </div>
    </div>
  );
}
