import type { Locale, PaperExecution } from "@/lib/types";
import { ui } from "@/lib/i18n";

function money(value: number | undefined, locale: Locale, digits = 2) {
  if (value === undefined) return "-";
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function PaperPositionCard({ locale, paper }: { locale: Locale; paper: PaperExecution | null | undefined }) {
  const t = ui[locale];
  const filled = paper?.status === "simulated_fill";

  return (
    <section className="surface surface-compact paper-position-card">
      <div className="paper-position-head">
        <div>
          <h3 className="section-title">{t.paperPositionTitle}</h3>
          <p className="muted">{filled ? t.paperPositionOpen : t.paperPositionNoOrder}</p>
        </div>
        <span className={`paper-position-status ${filled ? "open" : "closed"}`}>{filled ? t.paperPositionOpen : t.paperPositionNoOrder}</span>
      </div>

      {filled && paper ? (
        <div className="paper-position-grid">
          <div><span>{t.paperSide}</span><strong>{paper.side === "short" ? "SHORT" : "LONG"}</strong></div>
          <div><span>{t.paperQuantity}</span><strong>{money(paper.quantity, locale, 6)}</strong></div>
          <div><span>{t.paperEntry}</span><strong>{money(paper.fillPrice, locale)}</strong></div>
          <div><span>{t.paperMark}</span><strong>{money(paper.markPrice, locale)}</strong></div>
          <div><span>{t.paperStop}</span><strong>{money(paper.stopPrice, locale)}</strong></div>
          <div><span>{t.paperTarget}</span><strong>{money(paper.targetPrice, locale)}</strong></div>
          <div className={paper.unrealizedPnl && paper.unrealizedPnl >= 0 ? "pnl-positive" : "pnl-negative"}>
            <span>{t.paperPnl}</span><strong>{paper.unrealizedPnl === undefined ? "-" : `${paper.unrealizedPnl >= 0 ? "+" : ""}${money(paper.unrealizedPnl, locale)} USDT`}</strong>
          </div>
        </div>
      ) : null}

      <p className="paper-position-note">{t.paperEvidenceNote}</p>
    </section>
  );
}
