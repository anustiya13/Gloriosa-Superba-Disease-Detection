// pages/Result.jsx — Shows analysis result and recommendation toggle
import React, { useState } from "react";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ResultCard from "../components/ResultCard";
import RecommendationCard from "../components/RecommendationCard";

/**
 * Props:
 *   result    - backend result object
 *   onBack()  - back to detect
 *   onNewCheck() - start new analysis
 */
export default function Result({ result, onBack, onNewCheck }) {
  const { t } = useLanguage();
  const [showRec, setShowRec] = useState(false);

  if (!result) return null;

  // Invalid crop case
  if (result._invalid) {
    return (
      <main className="page result-page">
        <button className="page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} /><span>{t("back")}</span>
        </button>
        <div className="invalid-crop-card">
          <div className="invalid-crop-icon">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="invalid-crop-title">{t("notGloriosa")}</h2>
          <p className="invalid-crop-subtext">{t("notGloriosaSubtext")}</p>
          <button className="btn btn--primary btn--full" onClick={onNewCheck}>
            <RefreshCw size={18} /><span>{t("tryAgain")}</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page result-page">
      <button
        className="page-back-btn"
        onClick={showRec ? () => setShowRec(false) : onBack}
      >
        <ArrowLeft size={20} /><span>{t("back")}</span>
      </button>

      <div className="page-header">
        <h1 className="page-title">
          {showRec ? t("recTitle") : t("resultTitle")}
        </h1>
      </div>

      {showRec ? (
        <RecommendationCard
          result={result}
          onBack={() => setShowRec(false)}
          onNewCheck={onNewCheck}
        />
      ) : (
        <ResultCard
          result={result}
          onViewRecommendation={() => setShowRec(true)}
          onCheckAgain={onNewCheck}
        />
      )}
    </main>
  );
}
