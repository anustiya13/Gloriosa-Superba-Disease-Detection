// App.jsx — Root component with auth flow and page routing
import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import BottomNavigation from "./components/BottomNavigation";

// Auth pages (no bottom nav)
import Login from "./pages/Login";
import OTPVerify from "./pages/OTPVerify";

// App pages
import Home from "./pages/Home";
import Detect from "./pages/Detect";
import Result from "./pages/Result";
import History from "./pages/History";
import HistoryDetail from "./pages/HistoryDetail";
import Help from "./pages/Help";
import Profile from "./pages/Profile";

// ── Inner App (uses auth context) ───────────────────────────
function AppInner() {
  const { isAuthenticated, user } = useAuth();
  const { setLang } = useLanguage();

  // Auth flow state
  const [authStep, setAuthStep] = useState("login"); // "login" | "otp"
  const [pendingPhone, setPendingPhone] = useState("");
  const [mockOtp, setMockOtp] = useState(null);

  // Page routing
  const [page, setPage] = useState("home");
  const [result, setResult] = useState(null);
  const [historyDetailId, setHistoryDetailId] = useState(null);
  const [historyCount, setHistoryCount] = useState(null);

  // ── Auth handlers ─────────────────────────────────────────
  function handleOTPSent(phone, otp) {
    setPendingPhone(phone);
    setMockOtp(otp);
    setAuthStep("otp");
  }

  function handleLoginSuccess(language) {
    // Switch app language to user's preference
    if (language) setLang(language);
    setPage("home");
  }

  // ── Page navigation ───────────────────────────────────────
  function handleResult(res) {
    setResult(res);
    setPage("result");
  }

  function handleNewCheck() {
    setResult(null);
    setPage("detect");
  }

  function handleViewDetail(id) {
    setHistoryDetailId(id);
    setPage("history-detail");
  }

  function handleNavigate(target) {
    if (target !== "result" && target !== "history-detail") setResult(null);
    setPage(target);
  }

  function handleLogout() {
    setPage("home");
    setAuthStep("login");
  }

  // ── Not authenticated → show 1-click phone login ───
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Active page indicator for bottom nav ─────────────────
  const navPage = ["result", "history-detail"].includes(page) ? "history" :
                  page === "detect" ? "detect" : page;

  // ── Render current page ───────────────────────────────────
  function renderPage() {
    switch (page) {
      case "home":
        return <Home onNavigate={handleNavigate} />;

      case "detect":
        return <Detect onResult={handleResult} onBack={() => setPage("home")} />;

      case "result":
        return (
          <Result
            result={result}
            onBack={() => setPage("detect")}
            onNewCheck={handleNewCheck}
          />
        );

      case "history":
        return (
          <History
            onViewDetail={handleViewDetail}
            onNavigate={handleNavigate}
          />
        );

      case "history-detail":
        return (
          <HistoryDetail
            analysisId={historyDetailId}
            onBack={() => setPage("history")}
            onNewCheck={handleNewCheck}
          />
        );

      case "help":
        return <Help />;

      case "profile":
        return (
          <Profile
            onLogout={handleLogout}
            historyCount={historyCount}
          />
        );

      default:
        return <Home onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="app-content">{renderPage()}</div>
      <BottomNavigation activePage={navPage} onNavigate={handleNavigate} />
    </div>
  );
}

// ── Root with providers ───────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider initialLang="ta">
        <AppInner />
      </LanguageProvider>
    </AuthProvider>
  );
}
