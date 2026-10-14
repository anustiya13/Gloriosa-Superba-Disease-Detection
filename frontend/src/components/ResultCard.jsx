// components/ResultCard.jsx
import React from "react";
import { Volume2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import SeverityBadge from "./SeverityBadge";
import { speakText } from "../services/api";

/**
 * Props:
 *   result - backend prediction object:
 *     { analysis_id, is_gloriosa, disease_detected, disease, severity, confidence (0-1), recommendations }
 */
export default function ResultCard({ result, onViewRecommendation, onCheckAgain }) {
  const { t, lang } = useLanguage();
  const isHealthy = result.severity === "Healthy" || !result.disease_detected;

  // Backend returns confidence as 0.0–1.0; display as percentage
  const confidencePct = result.confidence
    ? Math.round(result.confidence * 100)
    : null;

  function handleSpeak() {
    const text = isHealthy
      ? `${t("healthyStatus")} ${t("healthyAdvice")}`
      : `${t("resultDisease")}: ${result.disease}. ${t("resultSeverity")}: ${t(`severity${result.severity}`)}. ${t("resultConfidence")}: ${confidencePct} percent.`;
    speakText(text, lang);
  }

  return (
    <div className="result-card">
      <div className={`result-status-banner ${isHealthy ? "result-status-banner--healthy" : "result-status-banner--disease"}`}>
        <span className="result-status-icon">{isHealthy ? "🌿" : "⚠️"}</span>
        <span className="result-status-text">
          {isHealthy ? t("noDisease") : t("diseaseDetected")}
        </span>
      </div>

      <button className="speak-btn" onClick={handleSpeak} aria-label={t("speakResult")}>
        <Volume2 size={20} />
        <span className="speak-label">{t("speakResult")}</span>
      </button>

      {isHealthy ? (
        <div className="result-healthy">
          <p className="result-healthy-main">{t("healthyStatus")}</p>
          <p className="result-healthy-advice">{t("healthyAdvice")}</p>
        </div>
      ) : (
        <div className="result-details">
          <div className="result-row">
            <span className="result-label">{t("resultDisease")}</span>
            <span className="result-value result-value--disease">{result.disease}</span>
          </div>
          <div className="result-row">
            <span className="result-label">{t("resultSeverity")}</span>
            <SeverityBadge severity={result.severity} size="lg" />
          </div>
          {confidencePct !== null && (
            <div className="result-row">
              <span className="result-label">{t("resultConfidence")}</span>
              <div className="confidence-wrapper">
                <span className="confidence-value">{confidencePct}%</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${confidencePct}%` }}
                    role="progressbar"
                    aria-valuenow={confidencePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
          )}
          <div className="result-info-box">
            <p className="result-info-title">{t("resultWhatMeans")}</p>
            <p className="result-info-text">{t("resultWhatMeansText")}</p>
          </div>
        </div>
      )}

      <div className="result-actions">
        {!isHealthy && (
          <button className="btn btn--primary btn--full" onClick={onViewRecommendation}>
            {t("resultViewRec")}
          </button>
        )}
        <button className="btn btn--ghost btn--full" onClick={onCheckAgain}>
          {t("resultCheckAgain")}
        </button>
      </div>
    </div>
  );
}
