"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { useAppSettings } from "@/components/app-settings-provider";
import { ui } from "@/lib/i18n";

export function CopyCodeBlock({ code }: { code: string }) {
  const { locale } = useAppSettings();
  const t = ui[locale];
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="code-block-wrap">
      <pre className="code-block">{code}</pre>
      <button className="btn-secondary code-copy-btn" onClick={copy} type="button">
        <Copy size={14} />
        {copied ? t.copied : t.copyCode}
      </button>
    </div>
  );
}
