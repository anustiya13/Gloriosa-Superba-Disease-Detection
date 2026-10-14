// components/SeverityBadge.jsx
import React from "react";
import { useLanguage } from "../context/LanguageContext";

/**
 * Displays a color-coded severity badge with text label.
 * Always shows text (not color-only) for accessibility.
 *
 * Props:
 *   severity - "Healthy" | "Mild" | "Moderate" | "Severe"
 *   size     - "sm" | "md" | "lg" (default "md")
 */

const SEVERITY_CONFIG = {
  Healthy: {
    color: "severity--healthy",
    emoji: "🟢",
    labelKey: "severityHealthy",
  },
  Mild: {
    color: "severity--mild",
    emoji: "🟡",
    labelKey: "severityMild",
  },
  Moderate: {
    color: "severity--moderate",
    emoji: "🟠",
    labelKey: "severityModerate",
  },
  Severe: {
    color: "severity--severe",
    emoji: "🔴",
    labelKey: "severitySevere",
  },
};

export default function SeverityBadge({ severity, size = "md" }) {
  const { t } = useLanguage();
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG["Healthy"];

  return (
    <span
      className={`severity-badge severity-badge--${size} ${config.color}`}
      role="status"
      aria-label={`Severity: ${t(config.labelKey)}`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      <span className="severity-text">{t(config.labelKey)}</span>
    </span>
  );
}
