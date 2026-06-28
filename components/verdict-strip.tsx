"use client";

import { useState } from "react";
import { buildAuditBundle } from "@/lib/audit-bundle";
import type { CourtDecision, DecisionRecord, Locale, PaperExecution, SafetyImpactStats, Verdict } from "@/lib/types";
import { formatRiskScore } from "@/lib/format";
import { ui, verdictLabel } from "@/lib/i18n";

const verdictClass: Record<Verdict, string> = {
  allow: "allowed",
  reduce: "reduced",
  watch: "watch",
  block: "blocked"
};

function SummaryText({ locale, text }: { locale: Locale; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const t = ui[locale];
  const long = text.length > 72 || text.includes("\n");

  return (
    <div>
      <p className={`verdict-strip-summary ${!expanded && long ? "clamped" : ""}`}>{text}</p>
      {long ? (
        <button
          className="verdict-strip-summary-toggle"
          onClick={() => setExpanded((value) => !value)}
          type="button"
        >
          {expanded ? t.summaryLess : t.summaryMore}
        </button>
      ) : null}
    </div>
  );
}

function paperMeta(locale: Locale, paper: PaperExecution | null | undefined) {
  if (!paper || paper.status !== "simulated_fill") return null;
  const t = ui[locale];
  return `${t.paperFill} ${paper.fillPrice} · ${t.fee} ${paper.estimatedFee} USDT · ${t.slippage} ${paper.slippageBps} bps`;
}

function canExportBundle(decision: CourtDecision): decision is DecisionRecord {
  return Boolean(decision.id && decision.input && "createdAt" in decision && "title" in decision);
}

function downloadAuditBundle(record: DecisionRecord) {
  const bundle = buildAuditBundle(record);
  const blob = new Blob([`${JSON.stringify(bundle, null, 2)}\n`], {
    type: "application/json;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `blackbox-court-${record.id}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

type VerdictBannerProps = {
  locale: Locale;
  verdict: Verdict;
  riskScore: number;
  summary: string;
  meta?: string;
  paperExecution?: PaperExecution | null;
  actions?: React.ReactNode;
};

export function VerdictBanner({
  locale,
  verdict,
  riskScore,
  summary,
  meta,
  paperExecution,
  actions
}: VerdictBannerProps) {
  const paperLine = paperMeta(locale, paperExecution);

  return (
    <div className="verdict-strip">
      <div className="verdict-strip-main">
        <div className="verdict-strip-head">
          <span className={`mini-verdict ${verdictClass[verdict]}`}>
            {verdictLabel(verdict, locale)}
          </span>
          <span className="verdict-strip-score">
            {formatRiskScore(riskScore)}
            <small>/100</small>
          </span>
        </div>
        <div className="verdict-strip-copy">
          {meta ? <span className="verdict-strip-meta">{meta}</span> : null}
          {paperLine ? <span className="verdict-strip-meta">{paperLine}</span> : null}
          <SummaryText locale={locale} text={summary} />
        </div>
      </div>
      {actions ? <div className="verdict-strip-actions">{actions}</div> : null}
    </div>
  );
}

type VerdictStripProps = {
  locale: Locale;
  decision: CourtDecision;
  copy: {
    allowedNotional: string;
    openReport: string;
    exportBundle: string;
  };
};

export function VerdictStrip({ locale, decision, copy }: VerdictStripProps) {
  const meta = [
    decision.input?.symbol,
    decision.policy.label,
    `${copy.allowedNotional} ${decision.allowedNotional.toLocaleString()} USDT`
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <VerdictBanner
      actions={
        decision.id ? (
          <div className="verdict-strip-actions-row">
            <a className="btn-ghost" href={`/records/${decision.id}?lang=${locale}`}>
              {copy.openReport}
            </a>
            <button
              className="btn-secondary"
              disabled={!canExportBundle(decision)}
              onClick={() => {
                if (canExportBundle(decision)) downloadAuditBundle(decision);
              }}
              type="button"
            >
              {copy.exportBundle}
            </button>
          </div>
        ) : null
      }
      locale={locale}
      meta={meta}
      paperExecution={decision.paperExecution}
      riskScore={decision.riskScore}
      summary={decision.judgeSummary}
      verdict={decision.verdict}
    />
  );
}

export function SafetyImpactBand({
  locale,
  stats,
  loading,
  labels
}: {
  locale: Locale;
  stats: SafetyImpactStats | null;
  loading: boolean;
  labels: Record<string, string>;
}) {
  const money = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0
  });

  return (
    <section className="impact-band">
      <div className="impact-band-head">
        <h2>{labels.statsTitle}</h2>
        <p className="muted">
          {stats?.lastUpdatedAt
            ? `${labels.statsLastUpdated} ${new Date(stats.lastUpdatedAt).toLocaleString()}`
            : labels.noDecision}
        </p>
      </div>
      <div className="impact-metrics">
        <div className="impact-metric">
          <span>{labels.statsTotal}</span>
          <strong>{loading ? "..." : (stats?.totalDecisions ?? 0)}</strong>
        </div>
        <div className="impact-metric highlight">
          <span>{labels.statsPrevented}</span>
          <strong>{loading ? "..." : `${money.format(stats?.preventedNotional ?? 0)}`}</strong>
          <small>USDT</small>
        </div>
        <div className="impact-metric">
          <span>{labels.statsBlockedBudget}</span>
          <strong>{loading ? "..." : `${money.format(stats?.blockedRiskBudget ?? 0)}`}</strong>
          <small>USDT</small>
        </div>
        <div className="impact-metric">
          <span>{labels.statsInterventions}</span>
          <strong>{loading ? "..." : (stats?.noTradeInterventions ?? 0)}</strong>
        </div>
        <div className="impact-metric">
          <span>{labels.statsPaperFills}</span>
          <strong>{loading ? "..." : (stats?.paperOnlyExecutions ?? 0)}</strong>
        </div>
        <div className="impact-metric">
          <span>{labels.statsAvgRisk}</span>
          <strong>{loading ? "..." : (stats?.averageRiskScore ?? 0)}</strong>
          <small>/100</small>
        </div>
      </div>
    </section>
  );
}
