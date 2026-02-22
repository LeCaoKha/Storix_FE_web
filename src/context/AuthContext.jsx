import React, { createContext, useState, useCallback } from "react";
import { logoutApi } from "../api/authApi";

export const AuthContext = createContext(null);

const TOKEN_KEY = "storix_token";
const REFRESH_TOKEN_KEY = "storix_refresh_token";
const USER_KEY = "storix_user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback((tokenValue, userData, refreshTokenValue) => {
    localStorage.setItem(TOKEN_KEY, tokenValue);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    if (refreshTokenValue) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshTokenValue);
      setRefreshToken(refreshTokenValue);
    }
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    try {
      if (storedRefreshToken) {
        await logoutApi(storedRefreshToken);
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider
      value={{ token, refreshToken, user, loading, isAuthenticated, login, logout, updateUser, setLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
