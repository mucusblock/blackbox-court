import type { PolicyGate } from "@/lib/types";

export function PolicyGateList({
  title,
  gates,
  passLabel,
  failLabel,
  warnLabel,
  emptyLabel,
  flat = false
}: {
  title: string;
  gates: PolicyGate[];
  passLabel: string;
  failLabel: string;
  warnLabel: string;
  emptyLabel: string;
  flat?: boolean;
}) {
  const sectionClass = flat ? "surface-flat" : "surface";

  if (gates.length === 0) {
    return (
      <section className={sectionClass}>
        <h3 className="section-title">{title}</h3>
        <p className="muted">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <h3 className="section-title">{title}</h3>
      <div className="gate-list">
        {gates.map((gate) => (
          <div className={`gate ${gate.status ?? (gate.pass ? "pass" : "fail")}`} key={gate.id}>
            <div>
              <span>{gate.label}</span>
              <small className="muted">{gate.detail}</small>
            </div>
            <strong>
              {gate.status === "warn" ? warnLabel : gate.pass ? passLabel : failLabel}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}
