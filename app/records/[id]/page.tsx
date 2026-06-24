import { AlertTriangle, ArrowLeft, Ban, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { DecisionLog } from "@/components/decision-log";
import { PolicyGateList } from "@/components/policy-gate-list";
import { PaperPositionCard } from "@/components/paper-position-card";
import { ResultDetails } from "@/components/result-details";
import { ResultMarketPanel } from "@/components/result-market-panel";
import { SiteHeader } from "@/components/site-header";
import { VerdictBanner } from "@/components/verdict-strip";
import { getRecord } from "@/lib/blackbox-store";
import { resolveLocale, ui, verdictLabel } from "@/lib/i18n";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export default async function RecordReplayPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { lang } = await searchParams;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("blackbox-court-locale")?.value;
  const locale = resolveLocale(lang, cookieLocale);
  const t = ui[locale];
  const record = await getRecord(id);

  if (!record) notFound();

  const meta = [
    record.input.symbol,
    record.input.timeframe,
    `${t.allowedNotional} ${record.allowedNotional.toLocaleString()} USDT`
  ].join(" · ");

  return (
    <main className="shell">
      <SiteHeader
        activeNav="report"
        extraActions={
          <>
            <a className="btn-secondary back-link" href={`/api/court/records/${record.id}/export`}>
              <Download size={15} />
              {t.exportBundle}
            </a>
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
