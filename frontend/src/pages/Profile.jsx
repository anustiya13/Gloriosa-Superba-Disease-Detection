// pages/Profile.jsx — User profile page with language switcher and logout
import React, { useState } from "react";
import { LogOut, Phone, Globe, Calendar, BarChart2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { logoutAPI } from "../services/api";

/**
 * Props:
 *   onLogout() — called after logout to go back to login screen
 */
export default function Profile({ onLogout, historyCount }) {
  const { t, lang, setLang } = useLanguage();
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try { await logoutAPI(); } catch (e) { /* ignore */ }
    logout();
    onLogout();
  }

  function formatDate(str) {
    if (!str) return "—";
    return new Date(str).toLocaleDateString(lang === "ta" ? "ta-IN" : "en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  }

  return (
    <main className="page profile-page">
      <div className="page-header">
        <h1 className="page-title">{t("profileTitle")}</h1>
      </div>

      {/* Avatar */}
      <div className="profile-avatar">
        <div className="profile-avatar-circle">
          <Phone size={28} />
        </div>
        <p className="profile-phone">+91 {user?.phone_number}</p>
      </div>

      {/* Info cards */}
      <div className="profile-cards">
        <div className="profile-info-card">
          <Phone size={18} className="profile-card-icon" />
          <div>
            <p className="profile-card-label">{t("profilePhone")}</p>
            <p className="profile-card-value">+91 {user?.phone_number}</p>
          </div>
        </div>

        <div className="profile-info-card">
          <BarChart2 size={18} className="profile-card-icon" />
          <div>
            <p className="profile-card-label">{t("profileTotalChecks")}</p>
            <p className="profile-card-value">{historyCount ?? "—"}</p>
          </div>
        </div>

        {user?.created_at && (
          <div className="profile-info-card">
            <Calendar size={18} className="profile-card-icon" />
            <div>
              <p className="profile-card-label">{t("profileMember")}</p>
              <p className="profile-card-value">{formatDate(user.created_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout button */}
      {!showConfirm ? (
        <button
          className="btn btn--ghost btn--full profile-logout-btn"
          onClick={() => setShowConfirm(true)}
          id="logout-btn"
        >
          <LogOut size={18} />
          <span>{t("profileLogout")}</span>
        </button>
      ) : (
        <div className="confirm-card">
          <p className="confirm-text">{t("logoutConfirm")}</p>
          <div className="confirm-actions">
            <button
              className="btn btn--ghost"
              onClick={() => setShowConfirm(false)}
            >
              {t("cancel")}
            </button>
            <button
              className="btn btn--danger"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              <LogOut size={16} />
              {loggingOut ? "…" : t("yes")}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
