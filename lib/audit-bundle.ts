import type { DecisionRecord } from "./types";

export type AuditBundle = {
  bundleVersion: "1.0";
  exportedAt: string;
  originalIntent: DecisionRecord["input"];
  policyPack: NonNullable<DecisionRecord["policy"]>;
  marketSnapshot: DecisionRecord["market"];
  marketSignals: DecisionRecord["marketSignals"];
  policyGates: DecisionRecord["policyGates"];
  reviewModules: DecisionRecord["agents"];
  judgeVerdict: {
    verdict: DecisionRecord["verdict"];
    verdictLabel: DecisionRecord["verdictLabel"];
    riskScore: DecisionRecord["riskScore"];
    allowedNotional: DecisionRecord["allowedNotional"];
    summary: DecisionRecord["judgeSummary"];
    noTradeReasons: DecisionRecord["noTradeReasons"];
  };
  paperExecution: DecisionRecord["paperExecution"];
  auditTrail: DecisionRecord["blackBox"];
  metadata: {
    id: string;
    title: string;
    createdAt: string;
    locale: DecisionRecord["input"]["locale"];
    marketSource: DecisionRecord["market"]["source"];
  };
};

export function buildAuditBundle(record: DecisionRecord): AuditBundle {
  return {
    bundleVersion: "1.0",
    exportedAt: new Date().toISOString(),
    originalIntent: record.input,
    policyPack: record.policy ?? {
      id: record.input.policyPack ?? "balanced",
      label: record.input.policyPack ?? "balanced",
      config: {
        id: record.input.policyPack ?? "balanced",
        maxRiskPct: record.input.maxRiskPct,
        maxNotional: record.input.notional,
        requireStop: true,
        maxVolatility: 4.5,
        minMomentum: 0.08,
        blockAfterReasons: 3
      }
    },
    marketSnapshot: record.market,
    marketSignals: record.marketSignals ?? [],
    policyGates: record.policyGates ?? [],
    reviewModules: record.agents,
    judgeVerdict: {
      verdict: record.verdict,
      verdictLabel: record.verdictLabel,
      riskScore: record.riskScore,
      allowedNotional: record.allowedNotional,
      summary: record.judgeSummary,
      noTradeReasons: record.noTradeReasons
    },
    paperExecution: record.paperExecution ?? null,
    auditTrail: record.blackBox,
    metadata: {
      id: record.id,
      title: record.title,
      createdAt: record.createdAt,
      locale: record.input.locale,
      marketSource: record.market.source
    }
  };
}
