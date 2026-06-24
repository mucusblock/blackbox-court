"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { MarketSignalsBar } from "@/components/market-signals-bar";
import { trendLabel, ui } from "@/lib/i18n";
import type { Locale, MarketSignal, MarketSnapshot } from "@/lib/types";

type ResultMarketPanelProps = {
  locale: Locale;
  market: MarketSnapshot;
  signals: MarketSignal[];
};

export function ResultMarketPanel({ locale, market, signals }: ResultMarketPanelProps) {
  const t = ui[locale];

  const chartData = useMemo(
    () =>
      market.candles.map((candle) => ({
        time: new Date(candle.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }),
        price: Number(candle.close.toFixed(2))
      })),
    [market.candles]
  );

  return (
    <div className="result-market-row">
      <section className="surface market-context">
        <MarketSignalsBar
          liveLabel={t.signalsLive}
          offlineLabel={t.signalsOffline}
          signals={signals}
          title={t.marketSignals}
        />

        <div className="metric-row">
          <div className="metric">
            <span>{t.price}</span>
            <strong>{market.price.toFixed(2)}</strong>
          </div>
          <div className="metric">
            <span>{t.trend}</span>
            <strong>{trendLabel(market.trend, locale)}</strong>
          </div>
          <div className="metric">
            <span>{t.volatility}</span>
            <strong>{market.volatility.toFixed(2)}%</strong>
          </div>
          <div className="metric">
            <span>{t.source}</span>
            <strong className={market.source === "fallback" ? "bad" : undefined}>
              {market.source === "fallback" ? t.fallback : "Bitget"}
            </strong>
          </div>
        </div>
      </section>

      <div className="chart-card">
        <ResponsiveContainer height={220} width="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={24} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <YAxis domain={["dataMin", "dataMax"]} tick={{ fill: "var(--muted)", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--line)",
                borderRadius: 8
              }}
            />
            <Area
              dataKey="price"
              fill="rgba(91,159,212,0.2)"
              stroke="var(--blue)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
