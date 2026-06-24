import type { MarketSignal } from "./types";

const BITGET_BASE = "https://api.bitget.com";

function signal(
  key: string,
  label: string,
  value: string,
  unit: string,
  source: MarketSignal["source"]
): MarketSignal {
  return {
    key,
    label,
    value,
    unit,
    source,
    fetchedAt: new Date().toISOString()
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 20 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getMarketSignals(symbol = "BTCUSDT"): Promise<MarketSignal[]> {
  const productType = "USDT-FUTURES";
  const tickerUrl = `${BITGET_BASE}/api/v2/mix/market/ticker?symbol=${symbol}&productType=${productType}`;
  const fundingUrl = `${BITGET_BASE}/api/v2/mix/market/current-fund-rate?symbol=${symbol}&productType=${productType}`;

  const [tickerJson, fundingJson] = await Promise.all([
    fetchJson<{ data?: Array<Record<string, string>> }>(tickerUrl),
    fetchJson<{ data?: Array<Record<string, string>> }>(fundingUrl)
  ]);

  const signals: MarketSignal[] = [];
  const ticker = tickerJson?.data?.[0];

  if (ticker) {
    const change = Number(ticker.change24h ?? ticker.changeUtc24h ?? 0);
    const volume = Number(ticker.baseVolume ?? ticker.usdtVolume ?? 0);
    const last = Number(ticker.lastPr ?? ticker.last ?? 0);
    const bid = Number(ticker.bidPr ?? ticker.bestBid ?? 0);
    const ask = Number(ticker.askPr ?? ticker.bestAsk ?? 0);
    const oi = Number(ticker.holdingAmount ?? ticker.openInterest ?? 0);

    signals.push(
      signal("ticker", "24h change", `${change >= 0 ? "+" : ""}${change.toFixed(2)}`, "%", "bitget-live"),
      signal("volume", "24h volume", volume.toLocaleString(undefined, { maximumFractionDigits: 0 }), "USDT", "bitget-live"),
      signal("price", "Mark", last.toFixed(2), "USDT", "bitget-live")
    );

    if (bid > 0 && ask > 0) {
      const spreadBps = last > 0 ? ((ask - bid) / last) * 10000 : 0;
      signals.push(
        signal("spread", "Bid / Ask", `${bid.toFixed(1)} / ${ask.toFixed(1)}`, "USDT", "bitget-live"),
        signal("spread_bps", "Spread", spreadBps.toFixed(1), "bps", "bitget-live")
      );
    }

    if (oi > 0) {
      signals.push(
        signal("open_interest", "Open interest", oi.toLocaleString(undefined, { maximumFractionDigits: 0 }), "contracts", "bitget-live")
      );
    }
  }

  const funding = fundingJson?.data?.[0];
  if (funding) {
    const rate = Number(funding.fundingRate ?? funding.fundRate ?? 0) * 100;
    signals.push(signal("funding", "Funding rate", rate.toFixed(4), "%", "bitget-live"));
  }

  if (signals.length === 0) {
    return [
      signal("status", "Market feed", "Unavailable", "", "unavailable"),
      signal("note", "Fallback", "Using candle snapshot only", "", "unavailable")
    ];
  }

  return signals;
}

export function fundingRateFromSignals(signals: MarketSignal[]): number | null {
  const funding = signals.find((item) => item.key === "funding");
  if (!funding || funding.source !== "bitget-live") return null;
  const parsed = Number(funding.value);
  return Number.isFinite(parsed) ? parsed : null;
}
