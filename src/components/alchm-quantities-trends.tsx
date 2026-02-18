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
  ReferenceLine,
} from "recharts";

type TrendPoint = {
  time: string;
  iso?: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  Fire?: number;
  Water?: number;
  Earth?: number;
  Air?: number;
  isDiurnal?: boolean;
};

type ChartMode = "esms" | "elemental" | "both";

export default function AlchmQuantitiesTrends() {
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ChartMode>("both");

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/alchm-quantities/trends");
        if (!response.ok) throw new Error("Failed to fetch trends");
        const data = await response.json();
        setTrendData(data.trends);
      } catch (error) {
        console.error("Failed to fetch trend data:", error);
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
    const interval = setInterval(fetchTrendData, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-300">7-Day Trends</h3>
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-300">7-Day Trends</h3>
        <div className="flex justify-center items-center h-[300px] text-gray-400">
          No trend data available
        </div>
      </div>
    );
  }

  // Detect day/night sect transitions for reference lines
  const sectTransitions: string[] = [];
  for (let i = 1; i < trendData.length; i++) {
    if (
      trendData[i].isDiurnal != null &&
      trendData[i - 1].isDiurnal != null &&
      trendData[i].isDiurnal !== trendData[i - 1].isDiurnal
    ) {
      sectTransitions.push(trendData[i].time);
    }
  }

  const hasElemental = trendData[0]?.Fire != null;
  const showESMS = mode === "esms" || mode === "both";
  const showElemental = hasElemental && (mode === "elemental" || mode === "both");

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-orange-300">7-Day Trends</h3>
        {/* Mode selector */}
        {hasElemental && (
          <div className="flex gap-1 text-xs">
            {(["esms", "elemental", "both"] as ChartMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 rounded border transition-colors ${
                  mode === m
                    ? "bg-orange-800/50 border-orange-500/50 text-orange-200"
                    : "bg-gray-800/40 border-gray-700/40 text-gray-400 hover:text-gray-300"
                }`}
              >
                {m === "esms" ? "ESMS" : m === "elemental" ? "Elemental" : "Both"}
              </button>
            ))}
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#888" }}
            interval="preserveStartEnd"
            stroke="#555"
          />
          <YAxis tick={{ fontSize: 11, fill: "#888" }} stroke="#555" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a2e",
              border: "1px solid #444",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                const pt = payload[0].payload as TrendPoint;
                if (pt.isDiurnal != null) {
                  const sectLabel = pt.isDiurnal ? "Day Sect" : "Night Sect";
                  return `${label} (${sectLabel})`;
                }
              }
              return String(label);
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />

          {/* Sect transition reference lines (sunrise/sunset markers) */}
          {sectTransitions.map((time, idx) => (
            <ReferenceLine
              key={`sect-${idx}`}
              x={time}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />
          ))}

          {/* ESMS lines (solid) */}
          {showESMS && (
            <>
              <Line
                type="monotone"
                dataKey="Spirit"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="Spirit"
              />
              <Line
                type="monotone"
                dataKey="Essence"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Essence"
              />
              <Line
                type="monotone"
                dataKey="Matter"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Matter"
              />
              <Line
                type="monotone"
                dataKey="Substance"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="Substance"
              />
            </>
          )}

          {/* Elemental lines (dashed — these shift with day/night sect) */}
          {showElemental && (
            <>
              <Line
                type="monotone"
                dataKey="Fire"
                stroke="#f97316"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="Fire"
              />
              <Line
                type="monotone"
                dataKey="Water"
                stroke="#06b6d4"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="Water"
              />
              <Line
                type="monotone"
                dataKey="Earth"
                stroke="#84cc16"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="Earth"
              />
              <Line
                type="monotone"
                dataKey="Air"
                stroke="#eab308"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="Air"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 flex-wrap text-xs text-gray-400">
        <span>Sampled every 2 h over the past 7 days.</span>
        {sectTransitions.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-4 border-t-2 border-dashed border-amber-500/50 inline-block" />
            Sect transitions (sunrise / sunset)
          </span>
        )}
        {showElemental && (
          <span className="flex items-center gap-1">
            <span className="w-4 border-t border-dashed border-gray-400 inline-block" />
            Dashed = elemental
          </span>
        )}
      </div>
    </div>
  );
}
