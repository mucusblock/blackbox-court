import { NextResponse } from "next/server";
import { readRecords } from "@/lib/blackbox-store";

export async function GET() {
  const records = await readRecords();
  const summaries = records.map((record) => ({
    id: record.id,
    title: record.title,
    createdAt: record.createdAt,
    symbol: record.input.symbol,
    verdict: record.verdict,
    verdictLabel: record.verdictLabel,
    riskScore: Math.round(record.riskScore),
    allowedNotional: record.allowedNotional,
    marketSource: record.market.source
  }));

  return NextResponse.json(summaries);
}
