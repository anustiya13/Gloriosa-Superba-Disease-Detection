// pages/OTPVerify.jsx — OTP verification page
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { verifyOTP, sendOTP } from "../services/api";

/**
 * Props:
 *   phoneNumber - the phone number OTP was sent to
 *   mockOtp     - if in mock mode, the OTP to display as hint
 *   onBack()    - go back to login
 *   onSuccess() - called after successful verification
 */
export default function OTPVerify({ phoneNumber, mockOtp, onBack, onSuccess }) {
  const { t } = useLanguage();
  const { login } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const inputRefs = useRef([]);

  // Countdown for resend button
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleChange(idx, val) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setError("");
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  const fullOtp = otp.join("");

  async function handleVerify(e) {
    e.preventDefault();
    if (fullOtp.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const res = await verifyOTP(phoneNumber, fullOtp);
      // res = { access_token, user_id, phone_number, language, is_new_user }
      login(res.access_token, {
        id: res.user_id,
        phone_number: res.phone_number,
        language: res.language,
      });
      onSuccess(res.language);
    } catch (err) {
      setError(t("errOTP"));
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return;
    setResending(true);
    try {
      await sendOTP(phoneNumber);
      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (e) {
      setError(t("errNetwork"));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <button className="page-back-btn" onClick={onBack} aria-label={t("back")}>
          <ArrowLeft size={20} />
          <span>{t("back")}</span>
        </button>

        <div className="auth-logo auth-logo--green">
          <ShieldCheck size={36} strokeWidth={1.8} />
        </div>

        <h1 className="auth-title">{t("otpTitle")}</h1>
        <p className="auth-subtext">
          {t("otpSubtext")} <strong>+91 {phoneNumber}</strong>
        </p>

        {/* Mock OTP hint */}
        {mockOtp && (
          <div className="mock-banner" role="note">
            🧪 {t("otpMockNote")}: <strong>{mockOtp}</strong>
          </div>
        )}

        <form onSubmit={handleVerify} noValidate>
          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-box ${error ? "otp-box--error" : ""}`}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                aria-label={`OTP digit ${idx + 1}`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {error && <div className="auth-error" role="alert">⚠️ {error}</div>}

          <button
            type="submit"
            id="verify-otp-btn"
            className="btn btn--primary btn--full btn--hero"
            disabled={loading || fullOtp.length !== 6}
          >
            {loading ? t("otpVerifying") : t("otpVerify")}
          </button>
        </form>

        <div className="otp-footer">
          <button
            className="otp-resend-btn"
            onClick={handleResend}
            disabled={resendTimer > 0 || resending}
          >
            {resendTimer > 0
              ? `${t("otpResend")} (${resendTimer}s)`
              : resending ? "…" : t("otpResend")}
          </button>
          <span className="otp-divider">•</span>
          <button className="otp-change-btn" onClick={onBack}>
            {t("otpChange")}
          </button>
        </div>
      </div>
    </div>
  );
}
