import { NextResponse } from "next/server";
import { getSafetyImpactStats } from "@/lib/blackbox-store";

export async function GET() {
  const stats = await getSafetyImpactStats();
  return NextResponse.json(stats);
}
