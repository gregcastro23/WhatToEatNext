import React, { useEffect, useState } from "react";
import { DailyYieldLedger } from "@/components/ui/alchm/UserVisuals";
import { safeReadJson } from "@/lib/api/json";
import {
  consumerTransactionsResponseSchema,
  type ConsumerTransactionItem,
} from "@/lib/economy/clientSchemas";
import { createLogger } from "@/utils/logger";
import type { ProfileData } from "./types";

const logger = createLogger("TokenEconomyBlock");

interface YieldSeries {
  id: string;
  color: string;
  data: number[];
}

interface BalancesState {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

type DailyBuckets = Array<Record<"Spirit" | "Essence" | "Matter" | "Substance", number>>;

function aggregateDailyTransactions(txs: ConsumerTransactionItem[]): DailyBuckets {
  const dailyTx: DailyBuckets = Array.from({ length: 14 }, () => ({ Spirit: 0, Essence: 0, Matter: 0, Substance: 0 }));
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  for (const tx of txs) {
    const txTime = new Date(tx.createdAt).getTime();
    const dayDiff = Math.floor((todayStart + 24 * 3600 * 1000 - txTime) / (24 * 3600 * 1000));
    if (dayDiff >= 0 && dayDiff < 14) {
      const bucket = dailyTx[dayDiff];
      if (bucket) {
        const key = (tx.tokenType.charAt(0).toUpperCase() + tx.tokenType.slice(1).toLowerCase()) as "Spirit" | "Essence" | "Matter" | "Substance";
        if (key in bucket) bucket[key] += tx.amount;
      }
    }
  }
  return dailyTx;
}

function simulateHistoricalBalances(dailyTx: DailyBuckets, initial: BalancesState): {
  spirit: number[];
  essence: number[];
  matter: number[];
  substance: number[];
} {
  const seriesData = {
    spirit: new Array<number>(14),
    essence: new Array<number>(14),
    matter: new Array<number>(14),
    substance: new Array<number>(14),
  };

  let s = initial.spirit;
  let e = initial.essence;
  let m = initial.matter;
  let sub = initial.substance;

  for (let i = 0; i < 14; i++) {
    const idx = 13 - i;
    seriesData.spirit[idx] = Math.max(0, s);
    seriesData.essence[idx] = Math.max(0, e);
    seriesData.matter[idx] = Math.max(0, m);
    seriesData.substance[idx] = Math.max(0, sub);

    const day = dailyTx[i];
    if (day) {
      s -= day.Spirit;
      e -= day.Essence;
      m -= day.Matter;
      sub -= day.Substance;
    }
  }
  return seriesData;
}

function buildSeriesCurves(dailyTx: DailyBuckets, initialBalances: BalancesState): YieldSeries[] {
  const seriesData = simulateHistoricalBalances(dailyTx, initialBalances);
  const allVals = [
    ...seriesData.spirit,
    ...seriesData.essence,
    ...seriesData.matter,
    ...seriesData.substance,
  ];
  const maxVal = Math.max(...allVals, 10);
  const minVal = Math.min(...allVals, 0);
  const range = maxVal - minVal;

  const normalize = (v: number): number => {
    const ratio = range > 0 ? (v - minVal) / range : 0.5;
    return 0.1 + ratio * 0.8;
  };

  return [
    { id: "spirit", color: "var(--el-air)", data: seriesData.spirit.map(normalize) },
    { id: "essence", color: "var(--el-water)", data: seriesData.essence.map(normalize) },
    { id: "matter", color: "var(--el-earth)", data: seriesData.matter.map(normalize) },
    { id: "substance", color: "var(--el-fire)", data: seriesData.substance.map(normalize) },
  ];
}

const BalanceGrid: React.FC<{ balances: BalancesState }> = ({ balances }) => {
  const items: Array<{ k: keyof BalancesState; color: string }> = [
    { k: "spirit", color: "text-amber-400" },
    { k: "essence", color: "text-blue-400" },
    { k: "matter", color: "text-emerald-400" },
    { k: "substance", color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.k} className="bg-white/[0.01] p-3 rounded-xl text-center border border-white/5">
          <div className="text-[9px] uppercase tracking-widest text-white/45 mb-1 font-mono">{item.k}</div>
          <div className={`text-xl font-black tabular-nums ${item.color}`}>
            {balances[item.k].toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  );
};

function useYieldLedgerData(balances: BalancesState): { series: YieldSeries[] | undefined; loading: boolean } {
  const [series, setSeries] = useState<YieldSeries[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const { spirit, essence, matter, substance } = balances;

  useEffect(() => {
    let active = true;
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const res = await fetch("/api/economy/transactions?limit=100");
        const json = await safeReadJson(res, { success: false, transactions: [] }, {
          parse: (raw) => consumerTransactionsResponseSchema.parse(raw),
        });
        if (json.success && active) {
          const txs = json.transactions ?? [];
          const dailyTx = aggregateDailyTransactions(txs);
          const computedSeries = buildSeriesCurves(dailyTx, { spirit, essence, matter, substance });
          setSeries(computedSeries);
        }
      } catch (err) {
        logger.error("Failed to load transaction yield trend", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load().catch(() => {});
    return (): void => { active = false; };
  }, [spirit, essence, matter, substance]);

  return { series, loading };
}

export const TokenEconomyBlock: React.FC<{ data: ProfileData }> = ({ data }) => {
  const balances: BalancesState = {
    spirit: data.balances?.spirit ?? 0,
    essence: data.balances?.essence ?? 0,
    matter: data.balances?.matter ?? 0,
    substance: data.balances?.substance ?? 0,
  };
  const { series, loading } = useYieldLedgerData(balances);

  return (
    <div className="p-6 border border-white/10 rounded-2xl bg-white/[0.01] mt-4 space-y-6">
      <div className="flex justify-between items-baseline">
        <h3 className="font-bold text-lg text-white/90">Daily Yield Ledger</h3>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Balances</span>
      </div>

      <BalanceGrid balances={balances} />

      <div className="pt-4 border-t border-white/5 relative">
        <p className="text-[9px] uppercase tracking-widest text-white/45 font-mono mb-3">Cumulative yield trend</p>
        {loading && !series ? (
          <div className="h-[200px] flex items-center justify-center text-xs text-white/40">Loading ledger data...</div>
        ) : (
          <DailyYieldLedger series={series} />
        )}
      </div>
    </div>
  );
};
