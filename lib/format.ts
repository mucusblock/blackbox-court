export function formatRiskScore(value: number) {
  return Math.round(value);
}

export function formatRecordTime(value: string, locale: "en" | "zh") {
  return new Date(value).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
