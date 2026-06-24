import crypto from "crypto";

export type AccountContext = {
  source: "bitget-private-api" | "unconfigured" | "error";
  availableUsdt?: number;
  openPositions?: number;
  symbolExposureUsdt?: number;
  message?: string;
  fetchedAt?: string;
};

function hasCredentials() {
  return Boolean(
    process.env.BITGET_API_KEY && process.env.BITGET_SECRET_KEY && process.env.BITGET_PASSPHRASE
  );
}

function signRequest(timestamp: string, method: string, requestPath: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(timestamp + method + requestPath).digest("base64");
}

async function bitgetPrivateGet<T>(requestPath: string): Promise<T | null> {
  const apiKey = process.env.BITGET_API_KEY;
  const secret = process.env.BITGET_SECRET_KEY;
  const passphrase = process.env.BITGET_PASSPHRASE;
  if (!apiKey || !secret || !passphrase) return null;

  const timestamp = Date.now().toString();
  const signature = signRequest(timestamp, "GET", requestPath, secret);

  try {
    const response = await fetch(`https://api.bitget.com${requestPath}`, {
      headers: {
        "ACCESS-KEY": apiKey,
        "ACCESS-SIGN": signature,
        "ACCESS-TIMESTAMP": timestamp,
        "ACCESS-PASSPHRASE": passphrase,
        "Content-Type": "application/json",
        locale: "en-US"
      },
      cache: "no-store"
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { code?: string; data?: T };
    if (payload.code !== "00000" || !payload.data) return null;
    return payload.data;
  } catch {
    return null;
  }
}

type MixAccount = {
  marginCoin: string;
  available?: string;
  accountEquity?: string;
};

type MixPosition = {
  symbol: string;
  total?: string;
  markPrice?: string;
  marginCoin?: string;
};

export async function getAccountContext(symbol: string): Promise<AccountContext> {
  if (!hasCredentials()) {
    return { source: "unconfigured" };
  }

  const productType = "USDT-FUTURES";
  const accounts = await bitgetPrivateGet<MixAccount[]>(
    `/api/v2/mix/account/accounts?productType=${productType}`
  );

  if (!accounts) {
    return {
      source: "error",
      message: "Bitget account probe failed. Check API key permissions (read-only is enough)."
    };
  }

  const usdt = accounts.find((item) => item.marginCoin === "USDT");
  const availableUsdt = Number(usdt?.available ?? usdt?.accountEquity ?? 0);

  const positions = await bitgetPrivateGet<MixPosition[]>(
    `/api/v2/mix/position/all-position?productType=${productType}&marginCoin=USDT`
  );

  const openPositions = positions?.filter((item) => Number(item.total ?? 0) !== 0).length ?? 0;
  const matched = positions?.find((item) => item.symbol === symbol);
  const symbolExposureUsdt =
    matched && matched.total && matched.markPrice
      ? Math.abs(Number(matched.total) * Number(matched.markPrice))
      : 0;

  return {
    source: "bitget-private-api",
    availableUsdt: Number.isFinite(availableUsdt) ? availableUsdt : undefined,
    openPositions,
    symbolExposureUsdt: symbolExposureUsdt > 0 ? Math.round(symbolExposureUsdt) : undefined,
    fetchedAt: new Date().toISOString()
  };
}

export function credentialsConfigured() {
  return hasCredentials();
}
