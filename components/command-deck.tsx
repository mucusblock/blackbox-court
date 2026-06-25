"use client";

import {
  Activity,
  CircleDollarSign,
  DatabaseZap,
  FileJson,
  Play,
  ShieldCheck,
  Split
} from "lucide-react";
import { ui, verdictLabel } from "@/lib/i18n";
import type { CourtDecision, Locale, SafetyImpactStats } from "@/lib/types";

type CommandDeckProps = {
  busy: boolean;
  decision: CourtDecision | null;
  locale: Locale;
  marketLive: boolean;
  maxRiskPct: number;
  notional: number;
  onRunClean: () => void;
  onRunStress: () => void;
  safetyStats: SafetyImpactStats | null;
  symbol: string;
  timeframe: string;
};

export function CommandDeck({
  busy,
  decision,
  locale,
  marketLive,
  maxRiskPct,
  notional,
  onRunClean,
  onRunStress,
  safetyStats,
  symbol,
  timeframe
}: CommandDeckProps) {
  const t = ui[locale];
  const money = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0
  });

  const verdict = decision ? verdictLabel(decision.verdict, locale) : t.commandNoVerdict;
  const riskScore = decision ? `${decision.riskScore}/100` : "--";
  const prevented = safetyStats ? `${money.format(safetyStats.preventedNotional)} USDT` : "--";

  return (
    <section aria-label={t.commandDeckTitle} className="command-deck">
      <div className="command-deck-lead">
        <span className="command-kicker">{t.commandDeckKicker}</span>
        <h2>{t.commandDeckTitle}</h2>
        <p>{t.commandDeckCopy}</p>
      </div>

      <div className="command-action-rail" aria-label={t.commandActionTitle}>
        <button className="btn-primary command-run" disabled={busy} onClick={onRunClean} type="button">
          <Play size={16} />
          {t.commandRunClean}
        </button>
        <button className="btn-secondary command-run" disabled={busy} onClick={onRunStress} type="button">
          <Split size={16} />
          {t.commandRunStress}
        </button>
      </div>

      <div className="command-grid">
        <div className="command-card command-card--primary">
          <div className="command-card-icon">
            <Activity size={18} />
          </div>
          <span>{t.commandIntent}</span>
          <strong>
            {symbol} · {timeframe}
          </strong>
          <small>
            {money.format(notional)} USDT · {maxRiskPct}% max loss
          </small>
        </div>

        <div className="command-card">
          <div className="command-card-icon">
            <ShieldCheck size={18} />
          </div>
          <span>{t.commandVerdict}</span>
          <strong>{verdict}</strong>
          <small>{t.commandRiskScore} {riskScore}</small>
        </div>

        <div className="command-card">
          <div className="command-card-icon">
            <DatabaseZap size={18} />
          </div>
          <span>{t.commandMarket}</span>
          <strong>{marketLive ? t.statusLive : t.statusFallback}</strong>
          <small>{t.commandMarketCopy}</small>
        </div>

        <div className="command-card">
          <div className="command-card-icon">
            <CircleDollarSign size={18} />
          </div>
          <span>{t.commandWithheld}</span>
          <strong>{prevented}</strong>
          <small>{t.commandWithheldCopy}</small>
        </div>

        <div className="command-card command-card--wide">
          <div className="command-card-icon">
            <FileJson size={18} />
          </div>
          <span>{t.commandReplay}</span>
          <strong>{decision?.id ?? t.commandReplayPending}</strong>
          <small>{t.commandReplayCopy}</small>
        </div>
      </div>
    </section>
  );
}
