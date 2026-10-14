// pages/History.jsx — Shows user's real analysis history from backend
import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import SeverityBadge from "../components/SeverityBadge";
import { getHistory } from "../services/api";
import { ChevronRight, Loader2 } from "lucide-react";

/**
 * Props:
 *   onViewDetail(analysisId) — navigate to detail view
 *   onNavigate(page)         — navigate to other pages
 */
export default function History({ onViewDetail, onNavigate }) {
  const { t, lang } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHistory();
        setHistory(data);
      } catch (err) {
        setError(t("errNetwork"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }

  return (
    <main className="page history-page">
      <div className="page-header">
        <h1 className="page-title">{t("historyTitle")}</h1>
      </div>

      {loading && (
        <div className="center-loader" aria-live="polite">
          <Loader2 size={32} className="spin" />
        </div>
      )}

      {error && !loading && (
        <div className="error-box" role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-text">{t("historyEmpty")}</p>
          <button className="btn btn--primary" onClick={() => onNavigate("detect")}>
            {t("homeDetectBtn")}
          </button>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <ul className="history-list">
          {history.map(item => (
            <li
              key={item.analysis_id}
              className="history-item"
              onClick={() => onViewDetail(item.analysis_id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && onViewDetail(item.analysis_id)}
            >
              <div className="history-item-date">{formatDate(item.created_at)}</div>
              <div className="history-item-body">
                <div>
                  <span className="history-item-disease">
                    {!item.is_gloriosa
                      ? "⚠️ Invalid crop"
                      : item.severity === "Healthy"
                      ? t("noDisease")
                      : item.disease || t("diseaseDetected")}
                  </span>
                </div>
                <div className="history-item-right">
                  {item.is_gloriosa && item.severity && (
                    <SeverityBadge severity={item.severity} size="sm" />
                  )}
                  <ChevronRight size={16} className="history-chevron" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
