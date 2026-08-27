"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createLogger } from "@/utils/logger";

const logger = createLogger("TokenBalanceTrends");

interface TrendPoint {
  date: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

interface BalanceResponse {
  success?: boolean;
  balances?: {
    spirit?: number;
    essence?: number;
    matter?: number;
    substance?: number;
  };
}

interface TransactionItem {
  createdAt: string | number | Date;
  tokenType: string;
  amount: number;
}

interface TransactionsResponse {
  success?: boolean;
  transactions?: TransactionItem[];
}

export function TokenBalanceTrends(): React.JSX.Element {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      try {
        const [balRes, txRes] = await Promise.all([
          fetch("/api/economy/balance", { credentials: "include" }),
          fetch("/api/economy/transactions?limit=100", { credentials: "include" }),
        ]);

        if (!balRes.ok || !txRes.ok) throw new Error("Failed to fetch");

        const balData = (await balRes.json()) as BalanceResponse;
        const txData = (await txRes.json()) as TransactionsResponse;

        if (balData.success && txData.success) {
          const currentBalances = balData.balances ?? {};
          const txs = txData.transactions ?? [];

          // We will reconstruct the balances going backwards 7 days.
          const days = 7;
          const history: TrendPoint[] = [];
          const now = new Date();

          let currentSpirit = currentBalances.spirit ?? 0;
          let currentEssence = currentBalances.essence ?? 0;
          let currentMatter = currentBalances.matter ?? 0;
          let currentSubstance = currentBalances.substance ?? 0;

          // Group transactions by date string YYYY-MM-DD
          const txByDate: Record<string, TransactionItem[]> = {};
          txs.forEach((tx: TransactionItem) => {
            const [dateStr] = new Date(tx.createdAt).toISOString().split("T");
            if (dateStr) {
              const list = txByDate[dateStr] ?? [];
              list.push(tx);
              txByDate[dateStr] = list;
            }
          });

          for (let i = 0; i < days; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const [dateStr = ""] = d.toISOString().split("T");

            // Add point for end of this day
            history.unshift({
              date: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
              Spirit: currentSpirit,
              Essence: currentEssence,
              Matter: currentMatter,
              Substance: currentSubstance,
            });

            // Subtract this day's transactions to get the start of the day (which is the end of previous day)
            const dayTxs = txByDate[dateStr] ?? [];
            dayTxs.forEach((tx) => {
              if (tx.tokenType === "spirit") currentSpirit -= Number(tx.amount);
              if (tx.tokenType === "essence") currentEssence -= Number(tx.amount);
              if (tx.tokenType === "matter") currentMatter -= Number(tx.amount);
              if (tx.tokenType === "substance") currentSubstance -= Number(tx.amount);
            });
          }

          setData(history);
        }
      } catch (err) {
        logger.error("Failed to load trend data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory().catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[340px] border border-white/5 rounded-3xl bg-white/[0.02]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
      </div>
    );
  }

  return (
    <div className="border border-white/5 rounded-3xl bg-white/[0.02] p-6">
      <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider text-[11px] opacity-60">
        Personal Transmutation Ledger (7 Days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            tickMargin={10}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            tickMargin={10}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,15,19,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
              color: "#fff",
            }}
            itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
          />
          <Legend wrapperStyle={{ fontSize: "10px", opacity: 0.8, marginTop: "10px" }} />

          <Line type="monotone" dataKey="Spirit" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Essence" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Matter" stroke="#34d399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Substance" stroke="#f472b6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
