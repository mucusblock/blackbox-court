"use client";

import { AlertTriangle, ArrowLeft, Ban, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DecisionLog } from "@/components/decision-log";
import { PolicyGateList } from "@/components/policy-gate-list";
import { PaperPositionCard } from "@/components/paper-position-card";
import { ResultDetails } from "@/components/result-details";
import { ResultMarketPanel } from "@/components/result-market-panel";
import { SiteHeader } from "@/components/site-header";
import { VerdictBanner } from "@/components/verdict-strip";
import { buildAuditBundle } from "@/lib/audit-bundle";
import { readLocalRecord, saveLocalRecord } from "@/lib/local-record-cache";
import { ui, verdictLabel } from "@/lib/i18n";
import type { DecisionRecord, Locale } from "@/lib/types";

type RecordReplayClientProps = {
  id: string;
  locale: Locale;
};

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

export function RecordReplayClient({ id, locale }: RecordReplayClientProps) {
  const t = ui[locale];
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRecord() {
      setLoading(true);
      try {
        const response = await fetch(`/api/court/records/${id}`, { cache: "no-store" });
        if (response.ok) {
          const nextRecord = (await response.json()) as DecisionRecord;
          if (!cancelled) {
            saveLocalRecord(nextRecord);
            setRecord(nextRecord);
            return;
          }
        }
      } catch {
        // Fall back to the browser cache below.
      } finally {
        if (!cancelled) {
          setRecord((current) => current ?? readLocalRecord(id));
          setLoading(false);
        }
      }
    }

    void loadRecord();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const meta = useMemo(() => {
    if (!record) return "";
    return [
      record.input.symbol,
      record.input.timeframe,
      `${t.allowedNotional} ${record.allowedNotional.toLocaleString()} USDT`
    ].join(" · ");
  }, [record, t.allowedNotional]);

  if (loading) {
    return (
      <main className="shell">
        <SiteHeader activeNav="report" tagline={locale === "zh" ? "正在恢复审计报告" : "Restoring audit report"} />
        <div className="page-frame replay-stack">
          <section className="panel empty-state-panel">
            <Loader2 className="spin" size={18} />
            <h2>{locale === "zh" ? "正在打开报告" : "Opening report"}</h2>
            <p className="muted">
              {locale === "zh"
                ? "正在读取服务端记录；如果 Vercel 临时实例找不到记录，会自动尝试浏览器本地审计缓存。"
                : "Reading the server record first, then falling back to the browser audit cache if needed."}
            </p>
          </section>
        </div>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="shell">
        <SiteHeader activeNav="report" tagline={locale === "zh" ? "报告不可用" : "Report unavailable"} />
        <div className="page-frame replay-stack">
          <section className="panel empty-state-panel">
            <AlertTriangle size={18} />
            <h2>{locale === "zh" ? "这份报告暂时找不到" : "This report could not be found"}</h2>
            <p className="muted">
              {locale === "zh"
                ? "这通常发生在 Vercel serverless 实例切换、旧记录过期，或你打开了另一台设备上的本地记录链接。请回到首页重新运行一次检查。"
                : "This usually happens when a serverless instance rotates, an old record expires, or the link came from another browser. Run a fresh check from the home page."}
            </p>
            <Link className="btn-secondary back-link" href={`/?lang=${locale}`}>
              <ArrowLeft size={15} />
              {t.back}
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <SiteHeader
        activeNav="report"
        extraActions={
          <>
            <button className="btn-secondary back-link" onClick={() => downloadAuditBundle(record)} type="button">
              <Download size={15} />
              {t.exportBundle}
            </button>
            <Link className="btn-secondary back-link" href={`/?lang=${locale}`}>
              <ArrowLeft size={15} />
              {t.back}
            </Link>
          </>
        }
        tagline={`${record.input.symbol} · ${verdictLabel(record.verdict, locale)}`}
      />

      <div className="page-frame replay-stack">
        <VerdictBanner
          locale={locale}
          meta={meta}
          paperExecution={record.paperExecution}
          riskScore={record.riskScore}
          summary={record.judgeSummary}
          verdict={record.verdict}
        />

        <section className="panel replay-main replay-main--single">
          <div className="replay-section">
            <h3>{t.originalIntent}</h3>
            <p>{record.input.prompt}</p>
          </div>

          {record.noTradeReasons.length > 0 ? (
            <div className="replay-section">
              <h3>
                <Ban size={16} />
                {t.vetoReasons}
              </h3>
              <ul className="reason-list">
                {record.noTradeReasons.map((reason) => (
                  <li key={reason}>
                    <AlertTriangle size={14} />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="muted">{t.noBlockReason}</p>
          )}

          <ResultMarketPanel locale={locale} market={record.market} signals={record.marketSignals ?? []} />

          <PaperPositionCard locale={locale} paper={record.paperExecution} />

          <ResultDetails hideLabel={t.hideDetails} label={t.showDetails}>
            <PolicyGateList
              emptyLabel={t.gateListEmpty}
              failLabel={t.failed}
              gates={record.policyGates ?? []}
              passLabel={t.passed}
              title={t.policyChecks}
              warnLabel={t.gateWarn}
            />
            <DecisionLog events={record.blackBox} title={t.decisionLog} />
          </ResultDetails>
        </section>
      </div>
    </main>
  );
}
