import { NextResponse } from "next/server";
import { evaluateCourt } from "@/lib/court";
import { saveDecision } from "@/lib/blackbox-store";
import { normalizeLocale } from "@/lib/i18n";
import type { CourtInput, PolicyPackId } from "@/lib/types";

function parseNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePolicyPack(value: unknown): PolicyPackId {
  if (value === "conservative" || value === "balanced" || value === "aggressive" || value === "custom") {
    return value;
  }
  return "balanced";
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<CourtInput>;
  const input: CourtInput = {
    prompt:
      body.prompt?.trim() ||
      "Small BTC long, 1% max loss, stop below recent swing low.",
    symbol: body.symbol?.trim() || "BTCUSDT",
    timeframe: body.timeframe?.trim() || "1H",
    notional: parseNumber(body.notional, 1000),
    maxRiskPct: parseNumber(body.maxRiskPct, 1),
    locale: normalizeLocale(body.locale),
    policyPack: parsePolicyPack(body.policyPack),
    policyOverrides: body.policyOverrides
  };

  const decision = await evaluateCourt(input);
  const record = await saveDecision(input, decision);
  return NextResponse.json(record);
}
