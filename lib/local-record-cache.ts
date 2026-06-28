import type { DecisionRecord } from "./types";

const RECORD_PREFIX = "blackbox-court-record:";
const RECORD_INDEX = "blackbox-court-record-index";
const MAX_LOCAL_RECORDS = 20;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function saveLocalRecord(record: DecisionRecord) {
  if (!canUseStorage() || !record.id) return;

  try {
    window.localStorage.setItem(`${RECORD_PREFIX}${record.id}`, JSON.stringify(record));
    const current = JSON.parse(window.localStorage.getItem(RECORD_INDEX) ?? "[]");
    const ids = Array.isArray(current) ? current.filter((id) => typeof id === "string") : [];
    const allIds = [record.id, ...ids.filter((id) => id !== record.id)];
    const nextIds = allIds.slice(0, MAX_LOCAL_RECORDS);
    window.localStorage.setItem(RECORD_INDEX, JSON.stringify(nextIds));

    allIds.slice(MAX_LOCAL_RECORDS).forEach((id) => {
      window.localStorage.removeItem(`${RECORD_PREFIX}${id}`);
    });
  } catch {
    // Local cache is only a browser fallback for serverless demo replay.
  }
}

export function readLocalRecord(id: string): DecisionRecord | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(`${RECORD_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as DecisionRecord;
  } catch {
    return null;
  }
}
