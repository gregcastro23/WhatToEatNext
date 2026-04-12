"use client";

import { useState, useEffect } from "react";
import { FaLock } from "react-icons/fa";
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
import { usePremium } from "@/contexts/PremiumContext";

interface TrendPoint {
  date: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
}

export function TokenBalanceTrends() {
  const { isPremium } = usePremium();
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const [balRes, txRes] = await Promise.all([
          fetch("/api/economy/balance", { credentials: "include" }),
          fetch("/api/economy/transactions?limit=100", { credentials: "include" })
        ]);

        if (!balRes.ok || !txRes.ok) throw new Error("Failed to fetch");

        const balData = await balRes.json();
        const txData = await txRes.json();

        if (balData.success && txData.success) {
          const currentBalances = balData.balances;
          const txs = txData.transactions;

          // We will reconstruct the balances going backwards 7 days.
          const days = 7;
          const history: TrendPoint[] = [];
          const now = new Date();
          
          let currentSpirit = currentBalances.spirit || 0;
          let currentEssence = currentBalances.essence || 0;
          let currentMatter = currentBalances.matter || 0;
          let currentSubstance = currentBalances.substance || 0;

          // Group transactions by date string YYYY-MM-DD
          const txByDate: Record<string, any[]> = {};
          txs.forEach((tx: any) => {
            const dateStr = new Date(tx.createdAt).toISOString().split('T')[0];
            if (!txByDate[dateStr]) txByDate[dateStr] = [];
            txByDate[dateStr].push(tx);
          });

          for (let i = 0; i < days; i++) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Add point for end of this day
            history.unshift({
              date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
              Spirit: currentSpirit,
              Essence: currentEssence,
              Matter: currentMatter,
              Substance: currentSubstance,
            });

            // Subtract this day's transactions to get the start of the day (which is the end of previous day)
            const dayTxs = txByDate[dateStr] || [];
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
        console.error("Failed to load trend data", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchHistory();
  }, [isPremium]);

  if (!isPremium) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-600/5 backdrop-blur-md" />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <FaLock className="w-6 h-6 text-white/40" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-wide">Premium Exclusive</h3>
            <p className="text-sm text-white/50 mt-2 max-w-md mx-auto">
              Unlock historical transmutation trends and token balance projections with Premium status.
            </p>
          </div>
          <button className="mt-4 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

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
              color: "#fff"
            }}
            itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
          />
          <Legend wrapperStyle={{ fontSize: "10px", opacity: 0.8, marginTop: "10px" }} />
          
          <Line type="monotone" dataKey="Spirit" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Essence" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Matter" stroke="#34d399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="Substance" stroke="#c084fc" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
