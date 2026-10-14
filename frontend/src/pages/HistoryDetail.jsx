// pages/HistoryDetail.jsx — Full analysis detail view
import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getAnalysis, speakText } from "../services/api";
import SeverityBadge from "../components/SeverityBadge";
import RecommendationCard from "../components/RecommendationCard";
import { Volume2 } from "lucide-react";

/**
 * Props:
 *   analysisId - the analysis ID to load
 *   onBack()   - go back to history list
 *   onNewCheck() - start new detection
 */
export default function HistoryDetail({ analysisId, onBack, onNewCheck }) {
  const { t, lang } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRec, setShowRec] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAnalysis(analysisId);
        setAnalysis(data);
      } catch (err) {
        setError(err.message || t("errNetwork"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [analysisId]);

  function formatDate(str) {
    return new Date(str).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  }

  function handleSpeak() {
    if (!analysis) return;
    const text = analysis.disease_detected
      ? `${t("resultDisease")}: ${analysis.disease}. ${t("resultSeverity")}: ${analysis.severity}.`
      : t("healthyStatus");
    speakText(text, lang);
  }

  if (loading) return (
    <main className="page">
      <div className="center-loader"><Loader2 size={32} className="spin" /></div>
    </main>
  );

  if (error) return (
    <main className="page">
      <button className="page-back-btn" onClick={onBack}><ArrowLeft size={20} /></button>
      <div className="error-box" role="alert">⚠️ {error}</div>
    </main>
  );

  if (!analysis) return null;

  // Map API fields to result shape expected by ResultCard/RecommendationCard
  const resultShape = {
    analysis_id: analysis.analysis_id,
    is_gloriosa: analysis.is_gloriosa,
    disease_detected: analysis.disease_detected,
    disease: analysis.disease,
    severity: analysis.severity,
    confidence: analysis.confidence ? Math.round(analysis.confidence * 100) : null,
    recommendations: analysis.recommendations || [],
    recommendation: { actions: analysis.recommendations || [], treatment: [] },
  };

  return (
    <main className="page">
      <button
        className="page-back-btn"
        onClick={showRec ? () => setShowRec(false) : onBack}
      >
        <ArrowLeft size={20} /><span>{t("back")}</span>
      </button>

      <div className="page-header">
        <h1 className="page-title">{t("historyDetailTitle")}</h1>
        <p className="page-subtext">{formatDate(analysis.created_at)}</p>
      </div>

      {showRec ? (
        <RecommendationCard
          result={resultShape}
          onBack={() => setShowRec(false)}
          onNewCheck={onNewCheck}
        />
      ) : (
        <div className="result-card">
          {/* Status banner */}
          <div className={`result-status-banner ${analysis.severity === "Healthy" ? "result-status-banner--healthy" : "result-status-banner--disease"}`}>
            <span className="result-status-icon">{analysis.severity === "Healthy" ? "🌿" : "⚠️"}</span>
            <span className="result-status-text">
              {analysis.severity === "Healthy" ? t("noDisease") : t("diseaseDetected")}
            </span>
          </div>

          <button className="speak-btn" onClick={handleSpeak} aria-label={t("speakResult")}>
            <Volume2 size={20} /><span className="speak-label">{t("speakResult")}</span>
          </button>

          {analysis.severity === "Healthy" ? (
            <div className="result-healthy">
              <p className="result-healthy-main">{t("healthyStatus")}</p>
              <p className="result-healthy-advice">{t("healthyAdvice")}</p>
            </div>
          ) : (
            <div className="result-details">
              <div className="result-row">
                <span className="result-label">{t("resultDisease")}</span>
                <span className="result-value result-value--disease">{analysis.disease}</span>
              </div>
              <div className="result-row">
                <span className="result-label">{t("resultSeverity")}</span>
                <SeverityBadge severity={analysis.severity} size="lg" />
              </div>
              {analysis.confidence && (
                <div className="result-row">
                  <span className="result-label">{t("resultConfidence")}</span>
                  <div className="confidence-wrapper">
                    <span className="confidence-value">{Math.round(analysis.confidence * 100)}%</span>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${Math.round(analysis.confidence * 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="result-actions">
            {analysis.disease_detected && (
              <button className="btn btn--primary btn--full" onClick={() => setShowRec(true)}>
                {t("resultViewRec")}
              </button>
            )}
            <button className="btn btn--ghost btn--full" onClick={onNewCheck}>
              {t("resultCheckAgain")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
