import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "storix_settings";

const defaultSettings = {
  theme: "light",       // "light" | "dark" | "system"
  language: "vi",       // "vi" | "en"
  sidebarCompact: false,
  notifications: {
    lowStock: true,
    expiry: true,
    orderUpdates: true,
    email: false,
  },
  autoLogout: "30",     // minutes: "15" | "30" | "60" | "never"
};

export const SettingsContext = createContext(null);

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const applyTheme = (theme) => {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    if (settings.theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [settings.theme]);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        ...partial,
        notifications: { ...prev.notifications, ...(partial.notifications || {}) },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
};
