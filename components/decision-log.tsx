import type { BlackBoxEvent } from "@/lib/types";

export function DecisionLog({ title, events }: { title: string; events: BlackBoxEvent[] }) {
  return (
    <section className="decision-log">
      <h3 className="section-title">{title}</h3>
      <ol className="timeline">
        {events.map((item) => (
          <li className="timeline-item" key={`${item.stage}-${item.timestamp}`}>
            <time dateTime={item.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })}
            </time>
            <div>
              <strong>{item.stage}</strong>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
