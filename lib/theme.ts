export type ThemeId = "dark" | "light" | "bitget";

export const THEME_COOKIE = "blackbox-court-theme";

export const themes: Record<
  ThemeId,
  { labelEn: string; labelZh: string; colorScheme: "dark" | "light" }
> = {
  dark: { labelEn: "Dark", labelZh: "深色", colorScheme: "dark" },
  light: { labelEn: "Light", labelZh: "浅色", colorScheme: "light" },
  bitget: { labelEn: "Bitget", labelZh: "Bitget", colorScheme: "dark" }
};

export function normalizeTheme(value: unknown): ThemeId {
  return value === "light" || value === "dark" ? value : "bitget";
}
