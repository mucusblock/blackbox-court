"use client";

import type { Route } from "next";
import Link from "next/link";
import { DatabaseZap, FileJson, Gavel, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { useAppSettings } from "@/components/app-settings-provider";
import { locales, ui } from "@/lib/i18n";
import { themes, type ThemeId } from "@/lib/theme";

type SiteHeaderProps = {
  activeNav: "home" | "developers" | "report";
  tagline?: string;
  statusLabel?: string;
  statusLive?: boolean;
  extraActions?: React.ReactNode;
};

export function SiteHeader({
  activeNav,
  tagline,
  statusLabel,
  statusLive = true,
  extraActions
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { locale, setLocale, theme, setTheme } = useAppSettings();
  const t = ui[locale];
  const homeHref = `/?lang=${locale}` as Route;
  const devHref = `/developers?lang=${locale}` as Route;

  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="brand">
          <Link className="brand-link" href={homeHref}>
            <div className="brand-mark">
              <Gavel size={22} />
            </div>
            <div className="brand-copy">
              <div className="brand-title-row">
                <h1>{t.productName}</h1>
                <span className="infra-track-badge sm">{t.trackBadge}</span>
              </div>
              {tagline ? <p>{tagline}</p> : null}
            </div>
          </Link>
        </div>

        <button
          aria-expanded={menuOpen}
          aria-label={t.menu}
          aria-controls="mobile-control-panel"
          className="mobile-nav-toggle icon-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <nav aria-label="Main" className={`top-nav ${menuOpen ? "is-open" : ""}`}>
          <Link
            className={activeNav === "home" ? "active" : ""}
            href={homeHref}
            onClick={() => setMenuOpen(false)}
          >
            {t.navApp}
          </Link>
          <Link
            className={activeNav === "developers" ? "active" : ""}
            href={devHref}
            onClick={() => setMenuOpen(false)}
          >
            {t.navDevelopers}
          </Link>
          <div className="mobile-menu-ops" id="mobile-control-panel">
            <div className="mobile-menu-head">
              <span>{t.mobileMenuTitle}</span>
              <strong>{statusLabel ?? t.statusFallback}</strong>
            </div>
            <div className="mobile-menu-grid">
              <div>
                <ShieldCheck size={15} />
                <span>{t.mobileMenuGate}</span>
              </div>
              <div>
                <DatabaseZap size={15} />
                <span>{statusLive ? t.mobileMenuLive : t.mobileMenuFallback}</span>
              </div>
              <div>
                <FileJson size={15} />
                <span>{t.mobileMenuAudit}</span>
              </div>
            </div>
            <Link className="mobile-menu-link" href={devHref} onClick={() => setMenuOpen(false)}>
              {t.mobileMenuDevelopers}
            </Link>
          </div>
        </nav>

        <div className="top-actions">
          <label className="sr-only" htmlFor="header-theme">
            {t.settingsTheme}
          </label>
          <select
            aria-label={t.settingsTheme}
            className="control control-select header-theme-select"
            id="header-theme"
            onChange={(event) => setTheme(event.target.value as ThemeId)}
            value={theme}
          >
            {(Object.keys(themes) as ThemeId[]).map((id) => (
              <option key={id} value={id}>
                {locale === "zh" ? themes[id].labelZh : themes[id].labelEn}
              </option>
            ))}
          </select>

          <div className="language-switch" aria-label={t.language} role="group">
            {(Object.keys(locales) as Array<keyof typeof locales>).map((item) => (
              <button
                aria-pressed={item === locale}
                className={item === locale ? "active" : ""}
                key={item}
                onClick={() => setLocale(item)}
                type="button"
              >
                {locales[item].shortLabel}
              </button>
            ))}
          </div>
          {extraActions}
          {statusLabel ? (
            <div className={`status-pill ${statusLive ? "live" : "warn"}`} title={statusLabel}>
              <span className="status-dot" />
              <span className="status-pill-text">{statusLabel}</span>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
