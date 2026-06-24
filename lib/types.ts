export type Verdict = "allow" | "reduce" | "watch" | "block";
export type Locale = "en" | "zh";
export type PolicyPackId = "conservative" | "balanced" | "aggressive" | "custom";

export type AgentStance = "bullish" | "bearish" | "neutral" | "risk-off";

export type PolicyConfig = {
  id: PolicyPackId;
  maxRiskPct: number;
  maxNotional: number;
  requireStop: boolean;
  maxVolatility: number;
  minMomentum: number;
  blockAfterReasons: number;
};

export type PolicySnapshot = {
  id: PolicyPackId;
  label: string;
  config: PolicyConfig;
};

export type PolicyGate = {
  id: string;
  label: string;
  pass: boolean;
  status?: "pass" | "fail" | "warn";
  detail: string;
};

export type MarketCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type MarketSnapshot = {
  symbol: string;
  productType: string;
  granularity: string;
  price: number;
  change24h: number;
  volatility: number;
  momentum: number;
  trend: "up" | "down" | "flat";
  candles: MarketCandle[];
  source: "bitget-public-api" | "fallback";
  updatedAt: string;
};

export type MarketSignal = {
  key: string;
  label: string;
  value: string;
  unit: string;
  source: "bitget-live" | "unavailable";
  fetchedAt: string;
};

export type CourtInput = {
  prompt: string;
  symbol: string;
  timeframe: string;
  notional: number;
  maxRiskPct: number;
  locale?: Locale;
  policyPack?: PolicyPackId;
  policyOverrides?: Partial<
    Pick<
      PolicyConfig,
      "maxRiskPct" | "maxNotional" | "requireStop" | "maxVolatility" | "minMomentum" | "blockAfterReasons"
    >
  >;
};

export type AgentOpinion = {
  id: string;
  name: string;
  role: string;
  stance: AgentStance;
  confidence: number;
  summary: string;
  evidence: string[];
};

export type BlackBoxEvent = {
  stage: string;
  detail: string;
  timestamp: string;
};

export type PaperExecution = {
  status: "simulated_fill" | "no_order";
  symbol: string;
  side?: "long" | "short";
  fillPrice: number;
  markPrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  quantity?: number;
  unrealizedPnl?: number;
  notional: number;
  estimatedFee: number;
  slippageBps: number;
};

export type AccountContext = {
  source: "bitget-private-api" | "unconfigured" | "error";
  availableUsdt?: number;
  openPositions?: number;
  symbolExposureUsdt?: number;
  message?: string;
  fetchedAt?: string;
};

export type CourtDecision = {
  id?: string;
  verdict: Verdict;
  verdictLabel: string;
  riskScore: number;
  allowedNotional: number;
  noTradeReasons: string[];
  judgeSummary: string;
  market: MarketSnapshot;
  marketSignals: MarketSignal[];
  policy: PolicySnapshot;
  policyGates: PolicyGate[];
  agents: AgentOpinion[];
  blackBox: BlackBoxEvent[];
  paperExecution: PaperExecution | null;
  accountContext?: AccountContext;
  createdAt?: string;
  input?: CourtInput;
};

export type DecisionRecord = CourtDecision & {
  id: string;
  createdAt: string;
  input: CourtInput;
  title: string;
};

export type SafetyImpactReason = {
  reason: string;
  count: number;
};

export type SafetyImpactStats = {
  totalDecisions: number;
  allowCount: number;
  reduceCount: number;
  watchCount: number;
  blockCount: number;
  interventionCount: number;
  interventionRate: number;
  averageRiskScore: number;
  requestedNotional: number;
  allowedNotional: number;
  preventedNotional: number;
  blockedRiskBudget: number;
  noTradeInterventions: number;
  paperOnlyExecutions: number;
  highRiskInterventions: number;
  replayCoverage: number;
  topReasons: SafetyImpactReason[];
  lastUpdatedAt: string | null;
};
