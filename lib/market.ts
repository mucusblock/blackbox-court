import type { MarketCandle, MarketSnapshot } from "./types";

const BITGET_BASE_URL = "https://api.bitget.com";

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function calcSma(values: number[], length: number) {
  if (values.length < length) return values[values.length - 1] ?? 0;
  const slice = values.slice(-length);
  return slice.reduce((sum, value) => sum + value, 0) / slice.length;
}

function calcVolatility(candles: MarketCandle[]) {
  const returns = candles.slice(1).map((candle, index) => {
    const previous = candles[index]?.close || candle.close;
    return previous === 0 ? 0 : (candle.close - previous) / previous;
  });
  if (returns.length === 0) return 0;
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    returns.length;
  return Math.sqrt(variance) * Math.sqrt(24) * 100;
}

function normalizeCandles(payload: unknown): MarketCandle[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((row) => {
      if (!Array.isArray(row)) return null;
      return {
        timestamp: toNumber(row[0]),
        open: toNumber(row[1]),
        high: toNumber(row[2]),
        low: toNumber(row[3]),
        close: toNumber(row[4]),
        volume: toNumber(row[5])
      };
    })
    .filter((row): row is MarketCandle => Boolean(row))
    .sort((a, b) => a.timestamp - b.timestamp);
}

function fallbackSnapshot(symbol: string, granularity: string): MarketSnapshot {
  const now = Date.now();
  const candles: MarketCandle[] = Array.from({ length: 48 }).map((_, index) => {
    const wave = Math.sin(index / 3) * 180;
    const drift = index * 12;
    const close = 65000 + drift + wave;
    return {
      timestamp: now - (48 - index) * 60 * 60 * 1000,
      open: close - 60,
      high: close + 180,
      low: close - 220,
      close,
      volume: 1200 + index * 8
    };
  });

  const closes = candles.map((candle) => candle.close);
  const price = closes[closes.length - 1] ?? 0;
  const shortSma = calcSma(closes, 8);
  const longSma = calcSma(closes, 24);

  return {
    symbol,
    productType: "USDT-FUTURES",
    granularity,
    price,
    change24h: 1.84,
    volatility: calcVolatility(candles),
    momentum: longSma === 0 ? 0 : ((shortSma - longSma) / longSma) * 100,
    trend: shortSma > longSma ? "up" : shortSma < longSma ? "down" : "flat",
    candles,
    source: "fallback",
    updatedAt: new Date().toISOString()
  };
}

export async function getMarketSnapshot(
  symbol = "BTCUSDT",
  granularity = "1H"
): Promise<MarketSnapshot> {
  try {
    const url = new URL("/api/v2/mix/market/candles", BITGET_BASE_URL);
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("productType", "USDT-FUTURES");
    url.searchParams.set("granularity", granularity);
    url.searchParams.set("limit", "80");

    const response = await fetch(url, {
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      return fallbackSnapshot(symbol, granularity);
    }

    const json = (await response.json()) as { data?: unknown };
    const candles = normalizeCandles(json.data);
    if (candles.length < 10) {
      return fallbackSnapshot(symbol, granularity);
    }

    const closes = candles.map((candle) => candle.close);
    const price = closes[closes.length - 1] ?? 0;
    const dayBack = closes[Math.max(0, closes.length - 25)] ?? price;
    const shortSma = calcSma(closes, 8);
    const longSma = calcSma(closes, 24);

    return {
      symbol,
      productType: "USDT-FUTURES",
      granularity,
      price,
      change24h: dayBack === 0 ? 0 : ((price - dayBack) / dayBack) * 100,
      volatility: calcVolatility(candles),
      momentum: longSma === 0 ? 0 : ((shortSma - longSma) / longSma) * 100,
      trend: shortSma > longSma ? "up" : shortSma < longSma ? "down" : "flat",
      candles,
      source: "bitget-public-api",
      updatedAt: new Date().toISOString()
    };
  } catch {
    return fallbackSnapshot(symbol, granularity);
  }
}
