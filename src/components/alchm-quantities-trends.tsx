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

type QuantityPoint = {
  time: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
};

export default function AlchmQuantitiesTrends() {
  const [trendData, setTrendData] = useState<QuantityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real trend data based on planetary calculations
    const fetchTrendData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/alchm-quantities/trends");
        if (!response.ok) throw new Error("Failed to fetch trends");
        const data = await response.json();
        setTrendData(data.trends);
      } catch (error) {
        console.error("Failed to fetch trend data:", error);
        // Fallback to empty array on error
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendData();
    const interval = setInterval(fetchTrendData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-300">24-Hour Trends</h3>
        <div className="flex justify-center items-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
        </div>
      </div>
    );
  }

  if (trendData.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-300">24-Hour Trends</h3>
        <div className="flex justify-center items-center h-[300px] text-gray-400">
          No trend data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-orange-300">24-Hour Trends</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12, fill: "#999" }}
            interval="preserveStartEnd"
            stroke="#666"
          />
          <YAxis tick={{ fontSize: 12, fill: "#999" }} stroke="#666" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #444",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Spirit"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Essence"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Matter"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Substance"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="text-xs text-gray-400">
        Trends show quantity fluctuations over the past 24 hours based on planetary movements.
      </div>
    </div>
  );
}
