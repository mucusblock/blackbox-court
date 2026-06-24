import { NextResponse } from "next/server";
import { credentialsConfigured, getAccountContext } from "@/lib/bitget-private";
import { getMarketSnapshot } from "@/lib/market";

export async function GET() {
  const hasApiKey = credentialsConfigured();
  const readOnly = process.env.BITGET_READ_ONLY !== "false";
  const market = await getMarketSnapshot("BTCUSDT", "1H");
  const accountProbe = hasApiKey ? await getAccountContext("BTCUSDT") : null;
  const apiKeyUsedInEvaluate = accountProbe?.source === "bitget-private-api";
  const paperLogUrl = process.env.PAPER_LOG_URL?.trim() || null;

  return NextResponse.json({
    provider: "Bitget",
    agentHub: "bitget-mcp-server",
    modules: ["spot", "futures", "account"],
    hasApiKey,
    apiKeyUsedInEvaluate,
    readOnly,
    liveTradingEnabled: false,
    paperExecutionOnly: true,
    browserExposesSecrets: false,
    paperLogUrl,
    marketReachable: market.source === "bitget-public-api",
    marketSource: market.source,
    accountProbe: accountProbe
      ? {
          source: accountProbe.source,
          availableUsdt: accountProbe.availableUsdt,
          message: accountProbe.message
        }
      : null,
    command: "npx -y bitget-mcp-server --read-only --modules spot,futures,account",
    safety: [
      "Public market data works without API keys",
      "Optional read-only keys add account context to evaluate",
      "API credentials stay on the server only",
      "Paper fills are formula estimates, not Bitget demo orders",
      "No live orders are sent from this app"
    ]
  });
}
