import type { MarketSignal } from "@/lib/types";

export function MarketSignalsBar({
  title,
  liveLabel,
  offlineLabel,
  signals
}: {
  title: string;
  liveLabel: string;
  offlineLabel: string;
  signals: MarketSignal[];
}) {
  const live = signals.some((item) => item.source === "bitget-live");

  return (
    <section className="signal-bar">
      <div className="signal-bar-head">
        <h3>{title}</h3>
        <span className={`signal-badge ${live ? "live" : "offline"}`}>
          {live ? liveLabel : offlineLabel}
        </span>
      </div>
      <div className="signal-grid">
        {signals.map((item) => (
          <div className="signal-item" key={item.key}>
            <span>{item.label}</span>
            <strong>
              {item.value}
              {item.unit ? ` ${item.unit.trim()}` : ""}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
