"use client";

import { Loader2, Play, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DecisionLog } from "@/components/decision-log";
import { EvaluateSnippet } from "@/components/evaluate-snippet";
import { FallbackBanner } from "@/components/fallback-banner";
import { PaperPositionCard } from "@/components/paper-position-card";
import { PolicyGateList } from "@/components/policy-gate-list";
import { ResultDetails } from "@/components/result-details";
import { ResultMarketPanel } from "@/components/result-market-panel";
import { SiteHeader } from "@/components/site-header";
import { StatsPanel } from "@/components/stats-panel";
import { useAppSettings } from "@/components/app-settings-provider";
import { CommandDeck } from "@/components/command-deck";
import { InfraFlowBar } from "@/components/infra-flow-bar";
import { VerdictStrip } from "@/components/verdict-strip";
import { HistorySkeleton, WorkspaceSkeleton } from "@/components/workspace-skeleton";
import { formatRecordTime, formatRiskScore } from "@/lib/format";
import { defaultInputsForPack, listPolicyPackIds } from "@/lib/policy-packs";
import { ui, verdictLabel } from "@/lib/i18n";
import type { CourtDecision, PolicyPackId, SafetyImpactStats, Verdict } from "@/lib/types";

type RecordSummary = {
  id: string;
  title: string;
  createdAt: string;
  symbol: string;
  verdict: Verdict;
  verdictLabel: string;
  riskScore: number;
  allowedNotional: number;
  marketSource: string;
};

type IntegrationStatus = {
  marketReachable: boolean;
  marketSource?: string;
};

type DemoCase = (typeof ui.en.demoCases)[number];

const verdictClass: Record<Verdict, string> = {
  allow: "allowed",
  reduce: "reduced",
  watch: "watch",
  block: "blocked"
};

type CheckPayload = {
  prompt: string;
  symbol: string;
  timeframe: string;
  notional: number;
  maxRiskPct: number;
  policyPack: PolicyPackId;
};

export default function HomeClient() {
  const { locale } = useAppSettings();
  const t = ui[locale];
  const [policyPack, setPolicyPack] = useState<PolicyPackId>("balanced");
  const [prompt, setPrompt] = useState(ui[locale].defaultPrompt as string);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1H");
  const [notional, setNotional] = useState(1200);
  const [maxRiskPct, setMaxRiskPct] = useState(1);
  const [decision, setDecision] = useState<CourtDecision | null>(null);
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [safetyStats, setSafetyStats] = useState<SafetyImpactStats | null>(null);
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState("");

  const policyLabels: Record<PolicyPackId, string> = {
    conservative: t.policyConservative,
    balanced: t.policyBalanced,
    aggressive: t.policyAggressive,
    custom: t.policyCustom
  };

  function selectPolicy(pack: PolicyPackId) {
    setPolicyPack(pack);
    const defaults = defaultInputsForPack(pack);
    setNotional(defaults.notional);
    setMaxRiskPct(defaults.maxRiskPct);
  }

  async function loadRecords(showLoading = true) {
    if (showLoading) setLoadingRecords(true);
    setHistoryError("");
    try {
      const response = await fetch("/api/court/records", { cache: "no-store" });
      if (!response.ok) throw new Error("history");
      const payload = (await response.json()) as RecordSummary[];
      setRecords(Array.isArray(payload) ? payload : []);
    } catch {
      setRecords([]);
      setHistoryError(t.historyLoadFailed);
    } finally {
      setLoadingRecords(false);
    }
  }

  async function loadSafetyStats(showLoading = true) {
    if (showLoading) setLoadingStats(true);
    try {
      const response = await fetch("/api/court/stats", { cache: "no-store" });
      if (!response.ok) throw new Error("stats");
      setSafetyStats((await response.json()) as SafetyImpactStats);
    } catch {
      setSafetyStats(null);
    } finally {
      setLoadingStats(false);
    }
  }

  async function loadIntegration() {
    try {
      const response = await fetch("/api/integrations/bitget", { cache: "no-store" });
      if (!response.ok) return;
      setIntegration((await response.json()) as IntegrationStatus);
    } catch {
      setIntegration(null);
    }
  }

  useEffect(() => {
    void loadRecords();
    void loadSafetyStats();
    void loadIntegration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPrompt((current) => {
      if (current === ui.en.defaultPrompt || current === ui.zh.defaultPrompt) {
        return ui[locale].defaultPrompt as string;
      }
      return current;
    });
  }, [locale]);

  async function runCheck(payload?: Partial<CheckPayload>) {
    const body: CheckPayload = {
      prompt: payload?.prompt ?? prompt,
      symbol: payload?.symbol ?? symbol,
      timeframe: payload?.timeframe ?? timeframe,
      notional: payload?.notional ?? notional,
      maxRiskPct: payload?.maxRiskPct ?? maxRiskPct,
      policyPack: payload?.policyPack ?? policyPack
    };

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/court/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, locale })
      });
      if (!response.ok) throw new Error(`check-${response.status}`);
      const record = (await response.json()) as CourtDecision;
      setDecision(record);
      await loadRecords(false);
      await loadSafetyStats(false);
      return record;
    } catch {
      setError(t.checkFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function runDemoCase(item: DemoCase) {
    setActiveCase(item.label);
    setPrompt(item.prompt);
    setNotional(item.notional);
    setMaxRiskPct(item.maxRiskPct);
    await runCheck({
      prompt: item.prompt,
      notional: item.notional,
      maxRiskPct: item.maxRiskPct
    });
  }

  function loadDemoCase(item: DemoCase) {
    setActiveCase(item.label);
    setPrompt(item.prompt);
    setNotional(item.notional);
    setMaxRiskPct(item.maxRiskPct);
  }

  async function runDemoSeed() {
    setSeeding(true);
    setSeedMessage("");
    try {
      const response = await fetch("/api/court/demo-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale })
      });
      if (!response.ok) throw new Error("seed");
      const payload = (await response.json()) as { lastRecord?: CourtDecision };
      if (payload.lastRecord) setDecision(payload.lastRecord);
      await loadRecords(false);
      await loadSafetyStats(false);
      setSeedMessage(t.demoSeedDone);
    } catch {
      setSeedMessage(t.demoSeedFailed);
    } finally {
      setSeeding(false);
      window.setTimeout(() => setSeedMessage(""), 4000);
    }
  }

  async function copyDecisionJson() {
    if (!decision) return;
    await navigator.clipboard.writeText(JSON.stringify(decision, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const marketLive =
    integration?.marketReachable ??
    (decision?.market.source !== "fallback" && decision?.market.source === "bitget-public-api");
  const showFallbackBanner =
    decision?.market.source === "fallback" || (integration !== null && !integration.marketReachable);
  const busy = loading || seeding;

  return (
    <main className="shell">
      <SiteHeader
        activeNav="home"
        statusLabel={marketLive ? t.statusLive : t.statusFallback}
        statusLive={marketLive}
        tagline={t.tagline}
      />

      <InfraFlowBar apiReady locale={locale} />

      {showFallbackBanner ? <FallbackBanner locale={locale} /> : null}

      <CommandDeck
        busy={busy}
        decision={decision}
        locale={locale}
        marketLive={marketLive}
        maxRiskPct={maxRiskPct}
        notional={notional}
        onRunClean={() => void runDemoCase(t.demoCases[0])}
        onRunStress={() => {
          setPrompt(t.stressPrompt as string);
          setActiveCase(null);
          void runCheck({ prompt: t.stressPrompt as string, notional: 10000, maxRiskPct: 3 });
        }}
        safetyStats={safetyStats}
        symbol={symbol}
        timeframe={timeframe}
      />

      <section className="workspace">
        <aside className="panel panel-form">
          <div className="panel-form-head">
            <h2>{t.checkSetup}</h2>
            <p>{t.checkSetupHint}</p>
          </div>

          <div className="policy-picker">
            {listPolicyPackIds().map((pack) => (
              <button
                className={`policy-option ${policyPack === pack ? "active" : ""}`}
                key={pack}
                onClick={() => selectPolicy(pack)}
                type="button"
              >
                <strong>{policyLabels[pack]}</strong>
                <span>{`${defaultInputsForPack(pack).maxRiskPct}% · ${defaultInputsForPack(pack).notional}U`}</span>
              </button>
            ))}
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="symbol">{t.symbol}</label>
              <select id="symbol" onChange={(e) => setSymbol(e.target.value)} value={symbol}>
                <option value="BTCUSDT">BTCUSDT</option>
                <option value="ETHUSDT">ETHUSDT</option>
                <option value="SOLUSDT">SOLUSDT</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="timeframe">{t.timeframe}</label>
              <select id="timeframe" onChange={(e) => setTimeframe(e.target.value)} value={timeframe}>
                <option value="15m">15m</option>
                <option value="1H">1H</option>
                <option value="4H">4H</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="notional">{t.paperNotional}</label>
              <input
                id="notional"
                min={100}
                onChange={(e) => setNotional(Number(e.target.value))}
                step={100}
                type="number"
                value={notional}
              />
            </div>
            <div className="field">
              <label htmlFor="risk">{t.maxRisk}</label>
              <input
                id="risk"
                max={5}
                min={0.1}
                onChange={(e) => setMaxRiskPct(Number(e.target.value))}
                step={0.1}
                type="number"
                value={maxRiskPct}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="prompt">{t.tradeBrief}</label>
            <textarea
              id="prompt"
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={t.defaultPrompt as string}
              value={prompt}
            />
          </div>

          <div className="demo-cases">
            {t.demoCases.map((item) => (
              <button
                className={`case-button ${activeCase === item.label ? "active" : ""}`}
                disabled={busy}
                key={item.label}
                onClick={() => loadDemoCase(item)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="panel-form-actions">
            <div className="button-row">
              <button className="btn-primary" disabled={busy} onClick={() => void runCheck()} type="button">
                {loading ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
                {t.runCheck}
              </button>
              <button
                className="btn-secondary"
                disabled={busy}
                onClick={() => {
                  loadDemoCase(t.demoCases[1]);
                }}
                type="button"
              >
                {t.stress}
              </button>
            </div>

            {error ? (
              <div className="error" role="alert">
                {error}
              </div>
            ) : null}
          </div>

          <div className="history-box">
            <div className="history-head">
              <h3>{t.history}</h3>
              <div className="history-head-actions">
                <button
                  className="btn-ghost btn-ghost-sm"
                  disabled={busy}
                  onClick={() => void runDemoSeed()}
                  type="button"
                >
                  {seeding ? t.demoSeedRunning : t.demoSeed}
                </button>
                <button
                  aria-label={t.refreshHistory}
                  className="icon-button"
                  disabled={loadingRecords}
                  onClick={() => loadRecords()}
                  type="button"
                >
                  <RefreshCw className={loadingRecords ? "spin" : undefined} size={14} />
                </button>
              </div>
            </div>
            {seedMessage ? <p className="muted history-seed-note">{seedMessage}</p> : null}
            <div className="history-list">
              {loadingRecords ? (
                <HistorySkeleton />
              ) : historyError ? (
                <p className="muted">{historyError}</p>
              ) : records.length === 0 ? (
                <div className="history-empty">
                  <p className="muted">{t.noRecord}</p>
                  <p className="muted">{t.noRecordHint}</p>
                </div>
              ) : (
                records.slice(0, 8).map((record) => (
                  <Link
                    className="history-link"
                    href={`/records/${record.id}?lang=${locale}`}
                    key={record.id}
                  >
                    <span className={`mini-verdict ${verdictClass[record.verdict]}`}>
                      {verdictLabel(record.verdict, locale)}
                    </span>
                    <strong>
                      {record.symbol} · {formatRiskScore(record.riskScore)}/100
                    </strong>
                    <small>{formatRecordTime(record.createdAt, locale)}</small>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>

        <section aria-live="polite" className="panel workspace-panel workspace-panel--single">
          <div className="workspace-content workspace-content--stack">
            <StatsPanel loading={loadingStats} locale={locale} stats={safetyStats} />

            {loading ? (
              <div className="loading-panel">
                <p className="loading-status">
                  <Loader2 className="spin" size={16} />
                  {t.evaluating}
                </p>
                <WorkspaceSkeleton variant="court" />
              </div>
            ) : !decision ? (
              <div className="empty-state">
                <div>
                  <h2>{t.awaiting}</h2>
                  <p>{t.awaitingCopy}</p>
                  <p className="empty-state-hint">{t.awaitingHint}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="result-anchor">
                  <VerdictStrip
                    copy={{
                      allowedNotional: t.allowedNotional,
                      exportBundle: t.exportBundle,
                      openReport: t.openReport
                    }}
                    decision={decision}
                    locale={locale}
                  />
                </div>

                {decision.noTradeReasons.length > 0 ? (
                  <section className="surface surface-compact">
                    <h3 className="section-title">{t.vetoReasons}</h3>
                    <ul className="reason-list">
                      {decision.noTradeReasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <ResultMarketPanel
                  locale={locale}
                  market={decision.market}
                  signals={decision.marketSignals}
                />

                <PaperPositionCard locale={locale} paper={decision.paperExecution} />

                <ResultDetails
                  footer={
                    <button className="btn-secondary" onClick={copyDecisionJson} type="button">
                      {copied ? t.copied : t.copyJson}
                    </button>
                  }
                  hideLabel={t.hideDetails}
                  label={t.showDetails}
                >
                  {decision.input ? <EvaluateSnippet input={decision.input} /> : null}
                  <PolicyGateList
                    emptyLabel={t.gateListEmpty}
                    failLabel={t.failed}
                    flat
                    gates={decision.policyGates}
                    passLabel={t.passed}
                    title={t.policyChecks}
                    warnLabel={t.gateWarn}
                  />
                  <DecisionLog events={decision.blackBox} title={t.decisionLog} />
                </ResultDetails>
              </>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
