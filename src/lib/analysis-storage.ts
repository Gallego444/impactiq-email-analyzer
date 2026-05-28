import type { AnalysisHistoryEntry, AnalysisResult } from "@/lib/types";

const STORAGE_KEY = "impactiq-analysis-history";
const MAX_ENTRIES = 20;

export function loadAnalysisHistory(): AnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAnalysisToHistory(params: {
  startDate: string;
  endDate: string;
  result: AnalysisResult;
  emailCount: number;
}): AnalysisHistoryEntry {
  const entry: AnalysisHistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    startDate: params.startDate,
    endDate: params.endDate,
    result: params.result,
    emailCount: params.emailCount,
  };

  const existing = loadAnalysisHistory();
  const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return entry;
}