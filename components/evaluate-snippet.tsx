"use client";

import { CopyCodeBlock } from "@/components/copy-code-block";
import { useAppSettings } from "@/components/app-settings-provider";
import { ui } from "@/lib/i18n";
import type { CourtInput } from "@/lib/types";

type EvaluateSnippetProps = {
  input: Pick<
    CourtInput,
    "prompt" | "symbol" | "timeframe" | "notional" | "maxRiskPct" | "policyPack"
  >;
};

export function EvaluateSnippet({ input }: EvaluateSnippetProps) {
  const { locale } = useAppSettings();
  const t = ui[locale];
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  const payload = JSON.stringify({
    prompt: input.prompt,
    symbol: input.symbol,
    timeframe: input.timeframe,
    notional: input.notional,
    maxRiskPct: input.maxRiskPct,
    policyPack: input.policyPack ?? "balanced",
    locale
  });

  const snippet = `curl -X POST ${origin}/api/court/evaluate -H "Content-Type: application/json" -d '${payload.replace(/'/g, "'\\''")}'`;

  return (
    <section className="surface surface-compact evaluate-snippet">
      <h3 className="section-title">{t.botIntegrationTitle}</h3>
      <p className="muted">{t.botIntegrationCopy}</p>
      <CopyCodeBlock code={snippet} />
    </section>
  );
}
