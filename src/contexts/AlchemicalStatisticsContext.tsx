/**
 * Shared statistics fetcher for any page that displays alchemical quantities.
 *
 * One provider per app subtree fetches `/api/alchm-quantities/statistics?all=true`
 * a single time, exposes the selected period, and lets every descendant pull
 * the contextual envelope (mean, stdDev, z-score, sparkline, histogram) for a
 * specific quantity via `useQuantityContext("esms.Spirit")`.
 *
 * Keeps the bundle tiny: no SWR/react-query — just useState + useEffect + a
 * 30-minute revalidation interval that matches the API's Cache-Control.
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  PeriodStatistics,
  QuantityContext as QuantityContextValue,
  StatPeriod,
} from "@/utils/alchemicalSampleLookup";

export const STAT_PERIODS: StatPeriod[] = [
  "day",
  "week",
  "month",
  "quarter",
  "year",
  "all",
];

export const PERIOD_LABELS: Record<StatPeriod, string> = {
  day: "Today",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
  all: "All",
};

interface AllPeriodsResponse {
  success: boolean;
  reference: string;
  file: { generatedAt: string; intervalHours: number; count: number };
  periods: Record<StatPeriod, PeriodStatistics | null>;
}

interface ContextValue {
  /** Currently selected period for inline displays. */
  period: StatPeriod;
  setPeriod: (p: StatPeriod) => void;
  /** All periods, fetched once. Null while loading. */
  allPeriods: Record<StatPeriod, PeriodStatistics | null> | null;
  /** Convenience: stats for the currently-selected period. */
  active: PeriodStatistics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  fileMeta: { generatedAt: string; intervalHours: number; count: number } | null;
}

const AlchemicalStatisticsCtx = createContext<ContextValue | null>(null);

const REFRESH_MS = 30 * 60 * 1000; // 30 min — matches API cache window

export function AlchemicalStatisticsProvider({
  children,
  defaultPeriod = "month",
}: {
  children: ReactNode;
  defaultPeriod?: StatPeriod;
}) {
  const [period, setPeriod] = useState<StatPeriod>(defaultPeriod);
  const [allPeriods, setAllPeriods] = useState<
    Record<StatPeriod, PeriodStatistics | null> | null
  >(null);
  const [fileMeta, setFileMeta] = useState<ContextValue["fileMeta"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inflightRef = useRef<Promise<void> | null>(null);

  const fetchAll = useCallback(async () => {
    if (inflightRef.current) return inflightRef.current;
    setError(null);
    const p = (async () => {
      try {
        const res = await fetch("/api/alchm-quantities/statistics?all=true", {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AllPeriodsResponse;
        if (!json.success) throw new Error("API reported failure");
        setAllPeriods(json.periods);
        setFileMeta(json.file);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setIsLoading(false);
        inflightRef.current = null;
      }
    })();
    inflightRef.current = p;
    return p;
  }, []);

  useEffect(() => {
    void fetchAll();
    const id = setInterval(() => {
      void fetchAll();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  const value = useMemo<ContextValue>(
    () => ({
      period,
      setPeriod,
      allPeriods,
      active: allPeriods ? allPeriods[period] : null,
      isLoading,
      error,
      refresh: () => {
        void fetchAll();
      },
      fileMeta,
    }),
    [period, allPeriods, isLoading, error, fetchAll, fileMeta],
  );

  return (
    <AlchemicalStatisticsCtx.Provider value={value}>
      {children}
    </AlchemicalStatisticsCtx.Provider>
  );
}

export function useAlchemicalStatistics(): ContextValue {
  const ctx = useContext(AlchemicalStatisticsCtx);
  if (!ctx) {
    // Soft fallback — no provider mounted, expose a no-op so consumers don't crash.
    return {
      period: "month",
      setPeriod: () => undefined,
      allPeriods: null,
      active: null,
      isLoading: false,
      error: null,
      refresh: () => undefined,
      fileMeta: null,
    };
  }
  return ctx;
}

/**
 * Resolve a dotted path inside the active statistics payload.
 *
 * Supported shapes:
 *   "esms.Spirit"          → top-level ESMS quantity
 *   "thermo.heat"
 *   "elemental.Fire"
 *   "aNumber"
 *   "perPlanet.Sun.esms.Spirit"
 *   "perPlanet.Mars.elements.Fire"
 */
export function useQuantityContext(
  path: string,
  periodOverride?: StatPeriod,
): QuantityContextValue | null {
  const { allPeriods, period: activePeriod } = useAlchemicalStatistics();
  const period = periodOverride ?? activePeriod;
  return useMemo(() => {
    if (!allPeriods) return null;
    const stats = allPeriods[period];
    if (!stats) return null;
    const parts = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cursor: any = stats;
    for (const part of parts) {
      if (cursor == null) return null;
      cursor = cursor[part];
    }
    if (
      cursor &&
      typeof cursor === "object" &&
      typeof cursor.mean === "number" &&
      typeof cursor.stdDev === "number"
    ) {
      return cursor as QuantityContextValue;
    }
    return null;
  }, [allPeriods, period, path]);
}
