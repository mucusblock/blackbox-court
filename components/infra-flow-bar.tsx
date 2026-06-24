import Link from "next/link";
import type { Route } from "next";
import type { Locale } from "@/lib/types";
import { ui } from "@/lib/i18n";

type InfraFlowBarProps = {
  locale: Locale;
  apiReady?: boolean;
};

export function InfraFlowBar({ locale, apiReady = true }: InfraFlowBarProps) {
  const t = ui[locale];
  const devHref = `/developers?lang=${locale}` as Route;

  return (
    <section aria-label={t.infraFlowTitle} className="infra-flow-bar infra-flow-bar--compact">
      <p className="infra-flow-line">{t.infraFlowLine}</p>
      <div className="infra-flow-meta">
        <span className={`infra-pill ${apiReady ? "ok" : ""}`}>{t.infraApiReady}</span>
        <span className="infra-pill">{t.infraPaperOnly}</span>
        <Link className="btn-secondary infra-docs-link" href={devHref}>
          {t.infraIntegrate}
        </Link>
      </div>
    </section>
  );
}
