import { fundingRateFromSignals, getMarketSignals } from "./bitget-market-signals";
import { getAccountContext } from "./bitget-private";
import { normalizeLocale, trendLabel, verdictLabel } from "./i18n";
import { getMarketSnapshot } from "./market";
import { simulatePaperExecution } from "./paper-execution";
import { policyPackLabel, resolvePolicy } from "./policy-packs";
import type {
  AgentOpinion,
  BlackBoxEvent,
  CourtDecision,
  CourtInput,
  Locale,
  MarketSnapshot,
  PolicyConfig,
  PolicyGate,
  Verdict
} from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function event(stage: string, detail: string): BlackBoxEvent {
  return { stage, detail, timestamp: new Date().toISOString() };
}

function copy(locale: Locale) {
  return {
    marketName: locale === "zh" ? "市场检查" : "Market check",
    marketRole: locale === "zh" ? "价格、趋势与波动" : "Price, trend, volatility",
    sizingName: locale === "zh" ? "仓位检查" : "Size check",
    sizingRole: locale === "zh" ? "名义金额与风险预算" : "Notional and risk budget",
    vetoName: locale === "zh" ? "风控否决" : "Veto review",
    vetoRole: locale === "zh" ? "拦截理由汇总" : "Intervention reasons",
    auditName: locale === "zh" ? "审计留痕" : "Audit log",
    auditRole: locale === "zh" ? "可复盘记录" : "Replayable record",
    directionMissing: locale === "zh" ? "未说明做多还是做空。" : "Trade direction is not defined.",
    stopMissing: locale === "zh" ? "未给出止损或失效条件。" : "Stop-loss or invalidation is missing.",
    stopDenied: locale === "zh" ? "描述里明确没有止损。" : "Prompt explicitly skips a stop rule.",
    riskHigh: locale === "zh" ? "风险预算超过策略上限。" : "Risk budget exceeds policy limit.",
    volHigh: locale === "zh" ? "波动率高于策略上限。" : "Volatility exceeds policy limit.",
    weakTrend: locale === "zh" ? "趋势信号偏弱。" : "Trend signal is too weak.",
    sizeHigh: locale === "zh" ? "名义金额超过策略上限。" : "Notional exceeds policy limit.",
    fundingHigh: locale === "zh" ? "资金费率偏高，需要更谨慎。" : "Funding rate is elevated.",
    clean: locale === "zh" ? "未发现必须拦截的硬性问题。" : "No hard blockers detected."
  };
}

function parseDirection(prompt: string) {
  const wantsLong = /long|buy|bull|up|做多|看多|买入/i.test(prompt);
  const wantsShort = /short|sell|bear|down|做空|看空|卖出/i.test(prompt);
  if (wantsLong) return "long" as const;
  if (wantsShort) return "short" as const;
  return "unclear" as const;
}

function parseStop(prompt: string) {
  const mentionsStop = /stop|stop-loss|invalidation|invalidated|止损|失效|前低|前高/i.test(prompt);
  const deniesStop = /no\s+(clear\s+)?(stop|stop-loss|invalidation)|without\s+(a\s+)?(stop|stop-loss|invalidation)|没有.*(止损|失效)|无.*(止损|失效)/i.test(prompt);
  return { mentionsStop, deniesStop };
}

function analyzeRiskFactors(
  input: CourtInput,
  market: MarketSnapshot,
  policy: PolicyConfig,
  locale: Locale,
  fundingRate: number | null
) {
  const t = copy(locale);
  const direction = parseDirection(input.prompt);
  const stop = parseStop(input.prompt);
  const reasons: string[] = [];

  if (direction === "unclear") reasons.push(t.directionMissing);
  if (policy.requireStop && (!stop.mentionsStop || stop.deniesStop)) {
    reasons.push(stop.deniesStop ? t.stopDenied : t.stopMissing);
  }
  if (input.maxRiskPct > policy.maxRiskPct) reasons.push(t.riskHigh);
  if (market.volatility > policy.maxVolatility) reasons.push(t.volHigh);
  if (Math.abs(market.momentum) < policy.minMomentum) reasons.push(t.weakTrend);
  if (input.notional > policy.maxNotional) reasons.push(t.sizeHigh);
  if (fundingRate !== null && Math.abs(fundingRate) >= 0.03) reasons.push(t.fundingHigh);

  const hardStops = Number(direction === "unclear") + Number(policy.requireStop && (!stop.mentionsStop || stop.deniesStop));
  return { direction, reasons, hardStops };
}

function buildPolicyGates(
  input: CourtInput,
  market: MarketSnapshot,
  policy: PolicyConfig,
  locale: Locale,
  reasons: string[]
): PolicyGate[] {
  const t = copy(locale);
  const direction = parseDirection(input.prompt);
  const stop = parseStop(input.prompt);

  return [
    {
      id: "direction",
      label: locale === "zh" ? "方向明确" : "Direction clear",
      pass: direction !== "unclear",
      detail: direction === "unclear" ? t.directionMissing : locale === "zh" ? "已识别交易方向。" : "Direction identified."
    },
    {
      id: "stop",
      label: locale === "zh" ? "止损/失效条件" : "Stop / invalidation",
      pass: !policy.requireStop || (stop.mentionsStop && !stop.deniesStop),
      detail: !policy.requireStop
        ? locale === "zh" ? "当前策略不强制止损。" : "Policy does not require a stop."
        : stop.deniesStop
          ? t.stopDenied
          : stop.mentionsStop
            ? locale === "zh" ? "已提供止损或失效条件。" : "Stop or invalidation provided."
            : t.stopMissing
    },
    { id: "budget", label: locale === "zh" ? "风险预算" : "Risk budget", pass: input.maxRiskPct <= policy.maxRiskPct, detail: `${input.maxRiskPct.toFixed(2)}% / ${policy.maxRiskPct.toFixed(2)}% max` },
    { id: "size", label: locale === "zh" ? "名义金额" : "Notional", pass: input.notional <= policy.maxNotional, detail: `${input.notional.toLocaleString()} / ${policy.maxNotional.toLocaleString()} USDT` },
    { id: "volatility", label: locale === "zh" ? "波动率" : "Volatility", pass: market.volatility <= policy.maxVolatility, detail: `${market.volatility.toFixed(2)}% / ${policy.maxVolatility.toFixed(2)}% max` },
    { id: "signal", label: locale === "zh" ? "趋势质量" : "Trend quality", pass: Math.abs(market.momentum) >= policy.minMomentum, detail: `${Math.abs(market.momentum).toFixed(2)}% / ${policy.minMomentum.toFixed(2)}% min` },
    {
      id: "veto",
      label: locale === "zh" ? "否决汇总" : "Veto summary",
      pass: reasons.length === 0,
      status: reasons.length === 0 ? "pass" : reasons.length >= policy.blockAfterReasons ? "fail" : "warn",
      detail: reasons.length === 0 ? t.clean : locale === "zh" ? `${reasons.length} 项需关注，拦截阈值为 ${policy.blockAfterReasons} 项。` : `${reasons.length} flagged; block threshold is ${policy.blockAfterReasons}.`
    }
  ].map((gate): PolicyGate => ({ ...gate, status: (gate.status ?? (gate.pass ? "pass" : "fail")) as PolicyGate["status"] }));
}

function appendAccountGate(gates: PolicyGate[], input: CourtInput, locale: Locale, account: Awaited<ReturnType<typeof getAccountContext>>) {
  if (account.source !== "bitget-private-api" || account.availableUsdt === undefined) return gates;
  const pass = input.notional <= account.availableUsdt;
  return [...gates, {
    id: "account",
    label: locale === "zh" ? "账户可用余额" : "Account available",
    pass,
    detail: locale === "zh"
      ? `请求 ${input.notional.toLocaleString()} USDT · 可用 ${account.availableUsdt.toLocaleString()} USDT`
      : `Requested ${input.notional.toLocaleString()} USDT · available ${account.availableUsdt.toLocaleString()} USDT`
  }];
}

function buildReviewModules(input: CourtInput, market: MarketSnapshot, policy: PolicyConfig, locale: Locale, reasons: string[], fundingRate: number | null): AgentOpinion[] {
  const t = copy(locale);
  const direction = parseDirection(input.prompt);
  const technicalStance = market.trend === "up" && direction !== "short" ? "bullish" : market.trend === "down" && direction !== "long" ? "bearish" : "neutral";
  const marketEvidence = [
    locale === "zh" ? `价格 ${market.price.toFixed(2)}` : `Price ${market.price.toFixed(2)}`,
    locale === "zh" ? `趋势 ${trendLabel(market.trend, locale)}` : `Trend ${trendLabel(market.trend, locale)}`,
    locale === "zh" ? `波动 ${market.volatility.toFixed(2)}%` : `Volatility ${market.volatility.toFixed(2)}%`
  ];
  if (fundingRate !== null) marketEvidence.push(locale === "zh" ? `资金费率 ${fundingRate.toFixed(4)}%` : `Funding ${fundingRate.toFixed(4)}%`);

  return [
    {
      id: "technical", name: t.marketName, role: t.marketRole, stance: technicalStance,
      confidence: clamp(50 + Math.abs(market.momentum) * 6, 40, 85),
      summary: market.trend === "flat" ? (locale === "zh" ? "结构偏震荡，方向不够清晰。" : "Structure is range-bound; direction is unclear.") : (locale === "zh" ? `${market.granularity} 结构${trendLabel(market.trend, locale)}，动量 ${market.momentum.toFixed(2)}%。` : `${market.granularity} structure is ${market.trend}; momentum ${market.momentum.toFixed(2)}%.`),
      evidence: marketEvidence
    },
    {
      id: "execution", name: t.sizingName, role: t.sizingRole, stance: input.notional > policy.maxNotional ? "risk-off" : "neutral", confidence: input.notional > policy.maxNotional ? 78 : 55,
      summary: input.notional > policy.maxNotional ? (locale === "zh" ? "请求金额超过当前策略上限，建议缩小。" : "Requested size exceeds the active policy limit.") : (locale === "zh" ? "仓位规模在策略范围内，仍需明确止损。" : "Size is within policy limits; stop rules still required."),
      evidence: [locale === "zh" ? `请求 ${input.notional.toLocaleString()} USDT` : `Requested ${input.notional.toLocaleString()} USDT`, locale === "zh" ? `风险预算 ${input.maxRiskPct.toFixed(2)}%` : `Risk budget ${input.maxRiskPct.toFixed(2)}%`]
    },
    {
      id: "notrade", name: t.vetoName, role: t.vetoRole, stance: reasons.length >= policy.blockAfterReasons ? "risk-off" : "neutral", confidence: clamp(50 + reasons.length * 10, 50, 95),
      summary: reasons.length > 0 ? (locale === "zh" ? `列出 ${reasons.length} 条需处理的风险点。` : `${reasons.length} risk item(s) require attention.`) : t.clean,
      evidence: reasons.length > 0 ? reasons : [t.clean]
    },
    {
      id: "audit", name: t.auditName, role: t.auditRole, stance: "neutral", confidence: 90,
      summary: locale === "zh" ? "已保存意图、行情、策略与裁决，供后续复盘。" : "Intent, market, policy, and verdict are stored for replay.",
      evidence: [locale === "zh" ? `来源 ${market.source}` : `Source ${market.source}`, locale === "zh" ? "仅模拟，不会发真实订单。" : "Paper mode only; no live orders."]
    }
  ];
}

function judge(input: CourtInput, market: MarketSnapshot, policy: PolicyConfig, locale: Locale, reasons: string[], hardStops: number) {
  const riskScore = clamp(24 + reasons.length * 11 + hardStops * 10 + Math.max(0, input.maxRiskPct - policy.maxRiskPct) * 9 + Math.max(0, market.volatility - policy.maxVolatility) * 7 + Math.max(0, input.notional - policy.maxNotional) / 600, 0, 100);
  const verdict: Verdict = hardStops >= 2 || reasons.length >= policy.blockAfterReasons || riskScore >= 76 ? "block" : hardStops >= 1 || reasons.length >= policy.blockAfterReasons - 1 || riskScore >= 58 ? "watch" : riskScore >= 44 || reasons.length > 0 ? "reduce" : "allow";
  const allowedNotional = verdict === "block" || verdict === "watch" ? 0 : verdict === "reduce" ? Math.round(input.notional * 0.35) : input.notional;
  const judgeSummary = verdict === "block" ? (locale === "zh" ? "拦截：硬性风控项未满足，暂不应下单。" : "Blocked: hard risk checks failed; do not route to execution.") : verdict === "watch" ? (locale === "zh" ? "观察：先补齐止损/方向，或等待波动回落。" : "Hold: fix stop/direction or wait for cleaner conditions.") : verdict === "reduce" ? (locale === "zh" ? "减仓：可小仓模拟，但需要复核。" : "Reduce: allow a smaller paper size with review.") : (locale === "zh" ? "放行：在当前策略下可进入模拟执行。" : "Clear: paper execution is allowed under the active policy.");
  return { verdict, verdictLabel: verdictLabel(verdict, locale), riskScore: Math.round(riskScore), allowedNotional, noTradeReasons: reasons, judgeSummary };
}

export async function evaluateCourt(input: CourtInput): Promise<CourtDecision> {
  const locale = normalizeLocale(input.locale);
  const policyConfig = resolvePolicy(input);
  const packId = input.policyPack ?? "balanced";
  const [market, marketSignals, accountContext] = await Promise.all([getMarketSnapshot(input.symbol, input.timeframe), getMarketSignals(input.symbol), getAccountContext(input.symbol)]);
  const fundingRate = fundingRateFromSignals(marketSignals);
  const { direction, reasons, hardStops } = analyzeRiskFactors(input, market, policyConfig, locale, fundingRate);
  let policyGates = buildPolicyGates(input, market, policyConfig, locale, reasons);
  policyGates = appendAccountGate(policyGates, input, locale, accountContext);
  if (accountContext.source === "bitget-private-api" && accountContext.availableUsdt !== undefined && input.notional > accountContext.availableUsdt) {
    reasons.push(locale === "zh" ? `请求名义金额超过账户可用 USDT（${accountContext.availableUsdt.toLocaleString()}）。` : `Requested notional exceeds available USDT (${accountContext.availableUsdt.toLocaleString()}).`);
  }
  const agents = buildReviewModules(input, market, policyConfig, locale, reasons, fundingRate);
  const ruling = judge(input, market, policyConfig, locale, reasons, hardStops);
  const paperExecution = simulatePaperExecution(input.symbol, ruling.allowedNotional, market, direction === "short" ? "short" : "long", input.maxRiskPct);
  const policy = { id: packId, label: policyPackLabel(packId, locale), config: policyConfig };
  const blackBox: BlackBoxEvent[] = [
    event(locale === "zh" ? "收到交易说明" : "Trade brief received", input.prompt),
    event(locale === "zh" ? "策略档位" : "Policy pack", `${policy.label} · max risk ${policyConfig.maxRiskPct}% · max size ${policyConfig.maxNotional.toLocaleString()} USDT`),
    event(locale === "zh" ? "行情快照" : "Market snapshot", `${market.symbol} ${market.granularity} @ ${market.price.toFixed(2)} · ${market.source}`),
    event(locale === "zh" ? "Bitget 市场信号" : "Bitget market signals", marketSignals.filter((item) => item.source === "bitget-live").slice(0, 4).map((item) => `${item.label} ${item.value}${item.unit ? ` ${item.unit}` : ""}`).join(" · ") || (locale === "zh" ? "暂无实时信号" : "No live signals")),
    ...(accountContext.source === "bitget-private-api" ? [event(locale === "zh" ? "Bitget 账户探测" : "Bitget account probe", `${accountContext.availableUsdt?.toLocaleString() ?? "?"} USDT available · ${accountContext.openPositions ?? 0} open positions`)] : []),
    event(locale === "zh" ? "风控结论" : "Risk verdict", `${ruling.verdictLabel} · score ${ruling.riskScore}/100`),
    event(locale === "zh" ? "模拟持仓证据" : "Paper position evidence", paperExecution?.status === "simulated_fill" ? `${paperExecution.side} ${paperExecution.quantity} ${paperExecution.symbol} @ ${paperExecution.fillPrice}` : (locale === "zh" ? "未生成模拟订单" : "No simulated order"))
  ];
  return { ...ruling, market, marketSignals, policy, policyGates, agents, blackBox, paperExecution, accountContext };
}
