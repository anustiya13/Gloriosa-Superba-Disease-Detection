// components/ImagePreview.jsx
import React from "react";
import { RefreshCw, ScanSearch } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import PrimaryButton from "./PrimaryButton";

/**
 * Shows the selected image and action buttons.
 *
 * Props:
 *   previewUrl  - object URL of the selected image
 *   onReplace() - called when user wants to pick another image
 *   onAnalyze() - called when user clicks Analyze
 *   isLoading   - disables buttons during analysis
 */
export default function ImagePreview({ previewUrl, onReplace, onAnalyze, isLoading }) {
  const { t } = useLanguage();

  return (
    <div className="preview-wrapper">
      <div className="preview-image-box">
        <img
          src={previewUrl}
          alt="Selected plant photo for analysis"
          className="preview-image"
        />
      </div>

      <div className="preview-actions">
        <PrimaryButton
          variant="ghost"
          icon={<RefreshCw size={18} />}
          onClick={onReplace}
          disabled={isLoading}
        >
          {t("previewReplace")}
        </PrimaryButton>

        <PrimaryButton
          variant="primary"
          icon={<ScanSearch size={20} />}
          onClick={onAnalyze}
          disabled={isLoading}
          fullWidth
        >
          {isLoading ? t("loading") : t("previewAnalyze")}
        </PrimaryButton>
      </div>
    </div>
  );
}
