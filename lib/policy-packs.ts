import type { CourtInput, Locale, PolicyConfig, PolicyPackId } from "./types";

const PACKS: Record<Exclude<PolicyPackId, "custom">, PolicyConfig> = {
  conservative: {
    id: "conservative",
    maxRiskPct: 1,
    maxNotional: 2000,
    requireStop: true,
    maxVolatility: 3.5,
    minMomentum: 0.1,
    blockAfterReasons: 2
  },
  balanced: {
    id: "balanced",
    maxRiskPct: 2,
    maxNotional: 5000,
    requireStop: true,
    maxVolatility: 4.5,
    minMomentum: 0.08,
    blockAfterReasons: 3
  },
  aggressive: {
    id: "aggressive",
    maxRiskPct: 3,
    maxNotional: 10000,
    requireStop: false,
    maxVolatility: 6,
    minMomentum: 0.05,
    blockAfterReasons: 4
  }
};

export function resolvePolicy(input: CourtInput): PolicyConfig {
  const packId = input.policyPack ?? "balanced";
  if (packId !== "custom") return { ...PACKS[packId] };

  const overrides = input.policyOverrides ?? {};
  const base = PACKS.balanced;
  return {
    id: "custom",
    maxRiskPct: overrides.maxRiskPct ?? base.maxRiskPct,
    maxNotional: overrides.maxNotional ?? base.maxNotional,
    requireStop: overrides.requireStop ?? base.requireStop,
    maxVolatility: overrides.maxVolatility ?? base.maxVolatility,
    minMomentum: overrides.minMomentum ?? base.minMomentum,
    blockAfterReasons: overrides.blockAfterReasons ?? base.blockAfterReasons
  };
}

export function policyPackLabel(id: PolicyPackId, locale: Locale): string {
  const labels: Record<PolicyPackId, Record<Locale, string>> = {
    conservative: { en: "Conservative", zh: "保守" },
    balanced: { en: "Balanced", zh: "均衡" },
    aggressive: { en: "Aggressive", zh: "积极" },
    custom: { en: "Custom", zh: "自定义" }
  };
  return labels[id][locale];
}

export function listPolicyPackIds(): PolicyPackId[] {
  return ["conservative", "balanced", "aggressive"];
}

export function defaultInputsForPack(packId: PolicyPackId): Pick<CourtInput, "maxRiskPct" | "notional"> {
  const policy = packId === "custom" ? PACKS.balanced : PACKS[packId];
  return {
    maxRiskPct: policy.maxRiskPct,
    notional: Math.min(1200, policy.maxNotional)
  };
}
