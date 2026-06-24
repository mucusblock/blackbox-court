import type { MarketSnapshot, PaperExecution } from "./types";

export function simulatePaperExecution(
  symbol: string,
  allowedNotional: number,
  market: MarketSnapshot,
  side: "long" | "short",
  maxRiskPct: number
): PaperExecution | null {
  if (allowedNotional <= 0) {
    return {
      status: "no_order",
      symbol,
      notional: 0,
      fillPrice: 0,
      estimatedFee: 0,
      slippageBps: 0
    };
  }

  const slippageBps = 5;
  const fillPrice = market.price * (side === "long" ? 1 + slippageBps / 10000 : 1 - slippageBps / 10000);
  const riskFraction = Math.max(0.0025, Math.min(maxRiskPct / 100, 0.05));
  const stopPrice = fillPrice * (side === "long" ? 1 - riskFraction : 1 + riskFraction);
  const targetPrice = fillPrice * (side === "long" ? 1 + riskFraction * 2 : 1 - riskFraction * 2);
  const quantity = allowedNotional / fillPrice;
  const unrealizedPnl = (market.price - fillPrice) * quantity * (side === "long" ? 1 : -1);

  return {
    status: "simulated_fill",
    symbol,
    side,
    fillPrice: Number(fillPrice.toFixed(2)),
    markPrice: Number(market.price.toFixed(2)),
    stopPrice: Number(stopPrice.toFixed(2)),
    targetPrice: Number(targetPrice.toFixed(2)),
    quantity: Number(quantity.toFixed(6)),
    unrealizedPnl: Number(unrealizedPnl.toFixed(2)),
    notional: allowedNotional,
    estimatedFee: Number((allowedNotional * 0.0004).toFixed(2)),
    slippageBps
  };
}
