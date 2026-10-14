// pages/Login.jsx — Phone number entry page
import React, { useState } from "react";
import { Phone, Leaf, ChevronRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { loginDirect } from "../services/api";
import LanguageSelector from "../components/LanguageSelector";

/**
 * Props:
 *   onLoginSuccess(language) — navigate to app home page after direct login
 */
export default function Login({ onLoginSuccess }) {
  const { t, setLang } = useLanguage();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePhone(val) {
    return /^[6-9]\d{9}$/.test(val.replace(/\s/g, ""));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/\s/g, "");
    if (!validatePhone(cleaned)) {
      setError(t("errPhone"));
      return;
    }

    setLoading(true);
    try {
      const res = await loginDirect(cleaned);
      login(res.access_token, res);
      if (res.language) setLang(res.language);
      if (onLoginSuccess) onLoginSuccess(res.language);
    } catch (err) {
      if (err.message?.includes("fetch") || err.message?.includes("network")) {
        setError(t("errNetwork"));
      } else {
        setError(err.message || t("errUnavailable"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      {/* Header with language selector */}
      <div className="auth-lang-row">
        <div className="auth-brand">
          <Leaf size={20} />
          <span>{t("appName")}</span>
        </div>
        <LanguageSelector />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <Leaf size={36} strokeWidth={1.8} />
        </div>

        <h1 className="auth-title">{t("loginTitle")}</h1>
        <p className="auth-subtext">{t("loginSubtext")}</p>

        <form onSubmit={handleLogin} noValidate>
          <div className="input-group">
            <div className="input-prefix">
              <Phone size={18} />
              <span>+91</span>
            </div>
            <input
              id="phone-input"
              type="tel"
              className="auth-input"
              placeholder={t("loginPhonePlaceholder")}
              value={phone}
              onChange={e => {
                setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                setError("");
              }}
              maxLength={10}
              inputMode="numeric"
              autoFocus
              aria-label={t("loginPhonePlaceholder")}
              aria-required="true"
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">⚠️ {error}</div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full btn--hero"
            disabled={loading || phone.length !== 10}
            id="send-otp-btn"
          >
            {loading ? t("loginSending") : (
              <>
                <span>{t("loginSendOTP")}</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tagline */}
      <p className="auth-footer">{t("appTagline")}</p>
    </div>
  );
}
