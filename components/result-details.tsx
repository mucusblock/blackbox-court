"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export function ResultDetails({
  label,
  hideLabel,
  footer,
  children
}: {
  label: string;
  hideLabel: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="result-details">
      <button className="result-details-toggle" onClick={() => setOpen((value) => !value)} type="button">
        <span>{open ? hideLabel : label}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open ? (
        <div className="result-details-body">
          {children}
          {footer ? <div className="result-details-footer">{footer}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
