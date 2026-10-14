// pages/Detect.jsx — Full detection flow connected to real backend
import React, { useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import ImageUploader from "../components/ImageUploader";
import ImagePreview from "../components/ImagePreview";
import LoadingState from "../components/LoadingState";
import { analyzeCrop } from "../services/api";

/**
 * Props:
 *   onResult(result) - called with backend prediction result
 *   onBack()         - go back to home
 */
export default function Detect({ onResult, onBack }) {
  const { t } = useLanguage();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleImageSelected(file, url) {
    setImageFile(file);
    setPreviewUrl(url);
    setError(null);
  }

  function handleReplace() {
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!imageFile) { setError(t("errNoImage")); return; }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeCrop(imageFile);

      // Check if crop validation failed
      if (result.is_gloriosa === false) {
        setIsLoading(false);
        setError(null);
        onResult({ ...result, _invalid: true });
        return;
      }

      onResult(result);
    } catch (err) {
      console.error("[Detect]", err);
      const msg = err.message?.toLowerCase();
      if (msg?.includes("network") || msg?.includes("fetch")) {
        setError(t("errNetwork"));
      } else if (msg?.includes("file") || msg?.includes("image")) {
        setError(err.message);
      } else {
        setError(t("errAnalysis"));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <main className="page"><LoadingState /></main>;
  }

  return (
    <main className="page detect-page">
      <button className="page-back-btn" onClick={onBack} aria-label={t("back")}>
        <ArrowLeft size={20} /><span>{t("back")}</span>
      </button>

      {!previewUrl ? (
        <>
          <div className="page-header">
            <h1 className="page-title">{t("detectTitle")}</h1>
            <p className="page-subtext">{t("detectSubtext")}</p>
          </div>
          <ImageUploader onImageSelected={handleImageSelected} />
          <p className="detect-instruction">{t("detectInstruction")}</p>
          <div className="tips-card">
            <div className="tips-card-header">
              <Info size={18} /><span>{t("detectTipTitle")}</span>
            </div>
            <ul className="tips-list">
              {[t("detectTip1"), t("detectTip2"), t("detectTip3"), t("detectTip4")].map((tip, i) => (
                <li key={i} className="tips-item">
                  <span className="tips-bullet" aria-hidden="true">✓</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="page-header">
            <h1 className="page-title">{t("previewTitle")}</h1>
          </div>
          <ImagePreview
            previewUrl={previewUrl}
            onReplace={handleReplace}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
        </>
      )}

      {error && (
        <div className="error-box" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </main>
  );
}
