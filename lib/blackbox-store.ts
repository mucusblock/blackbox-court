import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CourtDecision, CourtInput, DecisionRecord, SafetyImpactStats, Verdict } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "blackbox-records.json");
const MAX_RECORDS = 50;
const volatileRecords: DecisionRecord[] = [];

function makeId() {
  return `bbc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeTitle(input: CourtInput, decision: CourtDecision) {
  return `${input.symbol} · ${decision.verdict}`;
}

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readRecords(): Promise<DecisionRecord[]> {
  try {
    const content = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as DecisionRecord[]) : [];
  } catch {
    return volatileRecords;
  }
}

export async function getRecord(id: string): Promise<DecisionRecord | null> {
  const records = await readRecords();
  return records.find((record) => record.id === id) ?? null;
}

export async function saveDecision(
  input: CourtInput,
  decision: CourtDecision
): Promise<DecisionRecord> {
  const createdAt = new Date().toISOString();
  const record: DecisionRecord = {
    ...decision,
    id: makeId(),
    createdAt,
    input,
    title: makeTitle(input, decision)
  };

  try {
    await ensureStore();
    const records = await readRecords();
    const nextRecords = [record, ...records].slice(0, MAX_RECORDS);
    await writeFile(STORE_PATH, `${JSON.stringify(nextRecords, null, 2)}\n`, "utf8");
  } catch {
    volatileRecords.unshift(record);
    volatileRecords.splice(MAX_RECORDS);
  }
  return record;
}

export async function getSafetyImpactStats(): Promise<SafetyImpactStats> {
  const records = await readRecords();
  const verdictCounts: Record<Verdict, number> = {
    allow: 0,
    reduce: 0,
    watch: 0,
    block: 0
  };
  const reasonCounts = new Map<string, number>();

  let requestedNotional = 0;
  let allowedNotional = 0;
  let totalRiskScore = 0;
  let highRiskInterventions = 0;
  let replayableRecords = 0;
  let blockedRiskBudget = 0;
  let noTradeInterventions = 0;
  let paperOnlyExecutions = 0;

  records.forEach((record) => {
    verdictCounts[record.verdict] += 1;
    requestedNotional += record.input.notional;
    allowedNotional += record.allowedNotional;
    totalRiskScore += record.riskScore;

    const intervened = record.verdict !== "allow";
    if (intervened && record.riskScore >= 70) {
      highRiskInterventions += 1;
    }

    if (record.noTradeReasons.length > 0) {
      noTradeInterventions += 1;
    }

    if (
      (record.verdict === "allow" || record.verdict === "reduce") &&
      record.allowedNotional > 0
    ) {
      paperOnlyExecutions += 1;
    }

    if (record.verdict === "block" || record.verdict === "watch") {
      blockedRiskBudget += (record.input.notional * record.input.maxRiskPct) / 100;
    }

    if (record.blackBox.length > 0 && record.agents.length > 0) {
      replayableRecords += 1;
    }

    if (intervened) {
      record.noTradeReasons.forEach((reason) => {
        reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
      });
    }
  });

  const totalDecisions = records.length;
  const interventionCount = verdictCounts.reduce + verdictCounts.watch + verdictCounts.block;
  const topReasons = [...reasonCounts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 4)
    .map(([reason, count]) => ({ reason, count }));

  return {
    totalDecisions,
    allowCount: verdictCounts.allow,
    reduceCount: verdictCounts.reduce,
    watchCount: verdictCounts.watch,
    blockCount: verdictCounts.block,
    interventionCount,
    interventionRate: totalDecisions ? Math.round((interventionCount / totalDecisions) * 100) : 0,
    averageRiskScore: totalDecisions ? Math.round(totalRiskScore / totalDecisions) : 0,
    requestedNotional,
    allowedNotional,
    preventedNotional: Math.max(0, requestedNotional - allowedNotional),
    blockedRiskBudget: Math.round(blockedRiskBudget),
    noTradeInterventions,
    paperOnlyExecutions,
    highRiskInterventions,
    replayCoverage: totalDecisions ? Math.round((replayableRecords / totalDecisions) * 100) : 0,
    topReasons,
    lastUpdatedAt: records[0]?.createdAt ?? null
  };
}
