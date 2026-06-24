import { NextResponse } from "next/server";
import { evaluateCourt } from "@/lib/court";
import { getSafetyImpactStats, saveDecision } from "@/lib/blackbox-store";
import { normalizeLocale, ui } from "@/lib/i18n";
import type { CourtInput } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  const locale = normalizeLocale(body.locale);
  const cases = ui[locale].demoCases;

  let lastRecord = null;

  for (const item of cases) {
    const input: CourtInput = {
      prompt: item.prompt,
      symbol: "BTCUSDT",
      timeframe: "1H",
      notional: item.notional,
      maxRiskPct: item.maxRiskPct,
      locale,
      policyPack: "balanced"
    };
    const decision = await evaluateCourt(input);
    lastRecord = await saveDecision(input, decision);
  }

  const stats = await getSafetyImpactStats();

  return NextResponse.json({
    ran: cases.length,
    lastRecord,
    stats
  });
}
