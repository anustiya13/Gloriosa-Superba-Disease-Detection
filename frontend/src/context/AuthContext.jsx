// ============================================================
// context/AuthContext.jsx
// Manages authentication state: user, token, login, logout.
// ============================================================

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "gloriosa_token";
const USER_KEY  = "gloriosa_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token && !!user;

  function login(tokenValue, userData) {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  function updateUser(updated) {
    const merged = { ...user, ...updated };
    localStorage.setItem(USER_KEY, JSON.stringify(merged));
    setUser(merged);
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, setLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
