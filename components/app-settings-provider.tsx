"use client";

import type { Route } from "next";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { normalizeTheme, THEME_COOKIE, type ThemeId } from "@/lib/theme";
import type { Locale } from "@/lib/types";

const LOCALE_COOKIE = "blackbox-court-locale";

type AppSettingsContextValue = {
  locale: Locale;
  theme: ThemeId;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeId) => void;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

function persistLocale(nextLocale: Locale) {
  window.localStorage.setItem(LOCALE_COOKIE, nextLocale);
  document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
}

function applyTheme(theme: ThemeId) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme === "light" ? "light" : "dark";
  window.localStorage.setItem(THEME_COOKIE, theme);
}

export function AppSettingsProvider({
  children,
  initialLocale
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<ThemeId>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLocale = params.get("lang");
    const storedLocale = window.localStorage.getItem(LOCALE_COOKIE);
    let nextLocale = initialLocale;

    if (urlLocale === "zh" || urlLocale === "en") {
      nextLocale = urlLocale;
    } else if (storedLocale === "zh" || storedLocale === "en") {
      nextLocale = storedLocale;
    }

    setLocaleState(nextLocale);
    persistLocale(nextLocale);

    const storedTheme = normalizeTheme(window.localStorage.getItem(THEME_COOKIE));
    setThemeState(storedTheme);
    applyTheme(storedTheme);
    setReady(true);
  }, [initialLocale]);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
  }, [locale, ready]);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (nextLocale === locale) return;
    setLocaleState(nextLocale);
    persistLocale(nextLocale);

    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    const query = params.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route);
  }, [locale, pathname, router, searchParams]);

  const value = useMemo(
    () => ({ locale, theme, setLocale, setTheme }),
    [locale, theme, setLocale, setTheme]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return context;
}
