"use client";

import { useState } from "react";
import { SafetyImpactBand } from "@/components/verdict-strip";
import { ui, verdictLabel } from "@/lib/i18n";
import type { Locale, SafetyImpactStats, Verdict } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const verdictClass: Record<Verdict, string> = {
  allow: "allowed",
  reduce: "reduced",
  watch: "watch",
  block: "blocked"
};

const verdictColors: Record<Verdict, string> = {
  allow: "var(--green)",
  reduce: "var(--yellow)",
  watch: "var(--blue)",
  block: "var(--red)"
};

type StatsPanelProps = {
  locale: Locale;
  stats: SafetyImpactStats | null;
  loading: boolean;
};

export function StatsPanel({ locale, stats, loading }: StatsPanelProps) {
  const t = ui[locale];
  const [expanded, setExpanded] = useState(false);
  const hasStats = Boolean(stats && stats.totalDecisions > 0);

  const verdictMix = stats
    ? [
        { id: "allow" as const, label: verdictLabel("allow", locale), count: stats.allowCount },
        { id: "reduce" as const, label: verdictLabel("reduce", locale), count: stats.reduceCount },
        { id: "watch" as const, label: verdictLabel("watch", locale), count: stats.watchCount },
        { id: "block" as const, label: verdictLabel("block", locale), count: stats.blockCount }
      ]
    : [];
  const money = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: 0
  });
  const exposureData = stats
    ? [
        { label: t.statsRequested, value: stats.requestedNotional, fill: "var(--blue)" },
        { label: t.statsAllowed, value: stats.allowedNotional, fill: "var(--green)" },
        { label: t.statsWithheld, value: stats.preventedNotional, fill: "var(--red)" }
      ]
    : [];
  const reasonData =
    stats?.topReasons.slice(0, 5).map((item) => ({
      label: item.reason,
      count: item.count
    })) ?? [];

  return (
    <div className="stats-panel">
      {hasStats ? (
        <div className="stats-compact-row">
          <div className="stats-compact-metric">
            <span>{t.statsInterventionRate}</span>
            <strong>{stats?.interventionRate ?? 0}%</strong>
          </div>
          <div className="stats-compact-metric highlight">
            <span>{t.statsPrevented}</span>
            <strong>{money.format(stats?.preventedNotional ?? 0)} USDT</strong>
          </div>
          <div className="stats-compact-metric">
            <span>{t.statsTotal}</span>
            <strong>{stats?.totalDecisions ?? 0}</strong>
          </div>
          <button
            className="btn-ghost stats-expand-toggle"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {expanded ? t.statsHideDetails : t.statsShowDetails}
          </button>
        </div>
      ) : (
        <p className="stats-compact-empty muted">{loading ? "..." : t.statsCompactEmpty}</p>
      )}

      {hasStats && expanded ? (
        <>
          <SafetyImpactBand
            labels={{
              noDecision: t.noDecision,
              statsAvgRisk: t.statsAvgRisk,
              statsBlockedBudget: t.statsBlockedBudget,
              statsInterventions: t.statsInterventions,
              statsLastUpdated: t.statsLastUpdated,
              statsPaperFills: t.statsPaperFills,
              statsPrevented: t.statsPrevented,
              statsTitle: t.statsTitle,
              statsTotal: t.statsTotal
            }}
            loading={loading}
            locale={locale}
            stats={stats}
          />

          <div className="stats-panel-grid">
            <section className="surface surface-compact">
              <h3 className="section-title">{t.statsImpactHeadline}</h3>
              <div className="stats-kpi-row">
                <div className="stats-kpi">
                  <span>{t.statsInterventionRate}</span>
                  <strong>{stats?.interventionRate ?? 0}%</strong>
                </div>
                <div className="stats-kpi">
                  <span>{t.statsReplayCoverage}</span>
                  <strong>{stats?.replayCoverage ?? 0}%</strong>
                </div>
              </div>
            </section>

            <section className="surface surface-compact stats-chart-card">
              <h3 className="section-title">{t.statsTopReasons}</h3>
              {stats && stats.topReasons.length > 0 ? (
                <div className="stats-chart">
                  <ResponsiveContainer height={210} width="100%">
                    <BarChart data={reasonData} layout="vertical" margin={{ bottom: 0, left: 0, right: 12, top: 8 }}>
                      <CartesianGrid horizontal={false} stroke="var(--line-soft)" />
                      <XAxis allowDecimals={false} stroke="var(--muted)" type="number" />
                      <YAxis dataKey="label" hide type="category" />
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--line)",
                          borderRadius: 8,
                          color: "var(--text)"
                        }}
                      />
                      <Bar dataKey="count" fill="var(--yellow)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="reason-legend">
                    {reasonData.map((item) => (
                      <div className="reason-row" key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="muted">{t.statsNoReasons}</p>
              )}
            </section>

            <section className="surface surface-compact stats-chart-card stats-verdict-section">
              <h3 className="section-title">{t.statsVerdictMix}</h3>
              <div className="stats-donut-layout">
                <ResponsiveContainer height={190} width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={verdictMix}
                      dataKey="count"
                      innerRadius={48}
                      nameKey="label"
                      outerRadius={78}
                      paddingAngle={3}
                    >
                      {verdictMix.map((item) => (
                        <Cell fill={verdictColors[item.id]} key={item.id} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        color: "var(--text)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="verdict-mix">
                  {verdictMix.map((item) => {
                    const share = stats?.totalDecisions
                      ? Math.round((item.count / stats.totalDecisions) * 100)
                      : 0;
                    return (
                      <div className="verdict-mix-row" key={item.id}>
                        <span className={`mini-verdict ${verdictClass[item.id]}`}>{item.label}</span>
                        <div className="verdict-mix-bar">
                          <i className={`verdict-mix-fill ${item.id}`} style={{ width: `${share}%` }} />
                        </div>
                        <strong>{item.count}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="surface surface-compact stats-chart-card stats-exposure-section">
              <h3 className="section-title">{t.statsExposureFlow}</h3>
              <ResponsiveContainer height={220} width="100%">
                <BarChart data={exposureData} margin={{ bottom: 8, left: 0, right: 12, top: 12 }}>
                  <CartesianGrid vertical={false} stroke="var(--line-soft)" />
                  <XAxis dataKey="label" stroke="var(--muted)" />
                  <YAxis stroke="var(--muted)" tickFormatter={(value) => money.format(Number(value))} />
                  <Tooltip
                    formatter={(value) => [`${money.format(Number(value))} USDT`, ""]}
                    contentStyle={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      color: "var(--text)"
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {exposureData.map((item) => (
                      <Cell fill={item.fill} key={item.label} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
