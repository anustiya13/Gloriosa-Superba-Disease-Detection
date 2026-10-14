// components/ImageUploader.jsx
import React, { useRef } from "react";
import { Camera, ImageUp } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Image upload/capture selector.
 * Shows two large buttons: Take Photo and Upload Photo.
 *
 * Props:
 *   onImageSelected(file: File, previewUrl: string) - called when user picks an image
 */
export default function ImageUploader({ onImageSelected }) {
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageSelected(file, url);
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  }

  return (
    <div className="uploader">
      {/* ── Take Photo ─────────────────────────────── */}
      <button
        className="uploader-option"
        onClick={() => cameraInputRef.current?.click()}
        aria-label={t("detectTakePhoto")}
      >
        <div className="uploader-icon">
          <Camera size={36} strokeWidth={1.8} />
        </div>
        <span className="uploader-label">{t("detectTakePhoto")}</span>
      </button>

      {/* ── Upload Photo ────────────────────────────── */}
      <button
        className="uploader-option"
        onClick={() => fileInputRef.current?.click()}
        aria-label={t("detectUploadPhoto")}
      >
        <div className="uploader-icon">
          <ImageUp size={36} strokeWidth={1.8} />
        </div>
        <span className="uploader-label">{t("detectUploadPhoto")}</span>
      </button>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
