import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { CopyCodeBlock } from "@/components/copy-code-block";
import { DevelopersIntegration } from "@/components/developers-integration";
import { resolveLocale, ui } from "@/lib/i18n";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export default async function DevelopersPage({ searchParams }: PageProps) {
  const { lang } = await searchParams;
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("blackbox-court-locale")?.value;
  const locale = resolveLocale(lang, cookieLocale);
  const t = ui[locale];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const evaluateCurl = `curl -X POST ${baseUrl}/api/court/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Long BTC 900 USDT. Max loss 1%. Stop below swing low.",
    "symbol": "BTCUSDT",
    "timeframe": "1H",
    "notional": 900,
    "maxRiskPct": 1,
    "policyPack": "balanced",
    "locale": "${locale}"
  }'`;

  const statsCurl = `curl ${baseUrl}/api/court/stats`;
  const recordsCurl = `curl ${baseUrl}/api/court/records
curl -OJ ${baseUrl}/api/court/records/{id}/export`;

  return (
    <main className="shell">
      <SiteHeader activeNav="developers" tagline={t.devHeroTitle} />

      <div className="page-frame">
        <article className="developers-page">
          <section className="developers-hero surface">
            <span className="infra-track-badge">{t.trackBadge}</span>
            <h1>{t.devHeroTitle}</h1>
            <p className="muted">{t.devHeroCopy}</p>
          </section>

          <section className="surface">
            <h2 className="section-title">{t.devUsageTitle}</h2>
            <ol className="dev-checklist">
              {t.devUsageSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="surface">
            <h2 className="section-title">POST /api/court/evaluate</h2>
            <p className="muted">{t.infraProblem}</p>
            <CopyCodeBlock code={evaluateCurl} />
          </section>

          <section className="surface">
            <h2 className="section-title">GET /api/court/stats · records · export</h2>
            <CopyCodeBlock code={`${statsCurl}\n${recordsCurl}`} />
          </section>

          <section className="surface">
            <h2 className="section-title">{t.getAgentTitle}</h2>
            <p className="muted">{t.getAgentCopy}</p>
            <p className="muted">
              <a href={t.getAgentLink} rel="noreferrer" target="_blank">
                {t.getAgentLink}
              </a>
            </p>
          </section>

          <DevelopersIntegration />

          <section className="surface">
            <h2 className="section-title">{t.devPolicyPacksTitle}</h2>
            <p className="muted">{t.devPolicyPacks}</p>
            <p className="muted">{t.deployLocalNote}</p>
          </section>
        </article>
      </div>
    </main>
  );
}
