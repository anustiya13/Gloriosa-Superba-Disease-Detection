// ============================================================
// services/api.js
// Centralized API service — ALL backend communication lives here.
//
// BACKEND INTEGRATION:
// Change API_BASE_URL in .env:  VITE_API_BASE_URL=http://localhost:8000
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ── Token helper ─────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("gloriosa_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Core fetch wrapper ───────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    // Token expired — clear local storage
    localStorage.removeItem("gloriosa_token");
    localStorage.removeItem("gloriosa_user");
    window.location.reload();
    throw new Error("Session expired. Please login again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Server error ${res.status}`);
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────

/**
 * POST /api/auth/login-direct
 * Direct 1-click login with phone number (No OTP needed for farmers)
 * Returns: { access_token, user_id, phone_number, language, is_new_user }
 */
export async function loginDirect(phoneNumber) {
  return apiFetch("/api/auth/login-direct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
}

/**
 * POST /api/auth/send-otp
 * In mock mode, response includes mock_otp: "123456"
 */
export async function sendOTP(phoneNumber) {
  return apiFetch("/api/auth/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
}

/**
 * POST /api/auth/verify-otp
 * Returns: { access_token, user_id, phone_number, language, is_new_user }
 */
export async function verifyOTP(phoneNumber, otp) {
  return apiFetch("/api/auth/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber, otp }),
  });
}

/**
 * GET /api/auth/me
 */
export async function getCurrentUser() {
  return apiFetch("/api/auth/me");
}

/**
 * POST /api/auth/logout
 */
export async function logoutAPI() {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

/**
 * PATCH /api/auth/language
 */
export async function updateLanguage(language) {
  return apiFetch("/api/auth/language", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language }),
  });
}

// ── Analysis ─────────────────────────────────────────────────

/**
 * POST /api/analysis/predict
 * Sends image for full AI disease analysis.
 * Returns: { analysis_id, is_gloriosa, disease_detected, disease, severity, confidence, recommendations, created_at }
 *       OR: { is_gloriosa: false, message: "..." }
 */
export async function analyzeCrop(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);
  return apiFetch("/api/analysis/predict", { method: "POST", body: formData });
}

/**
 * POST /api/crop/validate
 * Quick validation without full disease analysis.
 */
export async function validateCropImage(imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);
  return apiFetch("/api/crop/validate", { method: "POST", body: formData });
}

// ── History ──────────────────────────────────────────────────

/**
 * GET /api/history
 */
export async function getHistory(limit = 50, offset = 0) {
  return apiFetch(`/api/history?limit=${limit}&offset=${offset}`);
}

/**
 * GET /api/history/{analysis_id}
 */
export async function getAnalysis(analysisId) {
  return apiFetch(`/api/history/${analysisId}`);
}

// ── Statistics ───────────────────────────────────────────────

/**
 * GET /api/statistics/overview
 */
export async function getStatisticsOverview() {
  return apiFetch("/api/statistics/overview");
}

/**
 * GET /api/statistics/daily
 */
export async function getDailyStats(days = 7) {
  return apiFetch(`/api/statistics/daily?days=${days}`);
}

// ── Health ───────────────────────────────────────────────────
export async function checkHealth() {
  return apiFetch("/api/health");
}

// ── Text-to-Speech ───────────────────────────────────────────

/**
 * Speak text using Web Speech API.
 * @param {string} text - Text to speak
 * @param {string} lang - "ta" | "en"
 */
export function speakText(text, lang = "ta") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
