import { AlertTriangle } from "lucide-react";
import type { Locale } from "@/lib/types";
import { ui } from "@/lib/i18n";

export function FallbackBanner({ locale }: { locale: Locale }) {
  const t = ui[locale];

  return (
    <div className="fallback-banner" role="alert">
      <AlertTriangle size={18} />
      <div>
        <strong>{t.fallbackBannerTitle}</strong>
        <p>{t.fallbackBannerCopy}</p>
      </div>
    </div>
  );
}
