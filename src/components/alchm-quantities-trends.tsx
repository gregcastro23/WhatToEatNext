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

  useEffect(() => {
    // Generate mock trend data (replace with real historical data)
    const generateTrendData = () => {
      const data: QuantityPoint[] = [];
      const now = new Date();

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = time.getHours();

        data.push({
          time: time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          Spirit: 3 + Math.sin((hour / 24) * 2 * Math.PI) * 2,
          Essence: 3 + Math.cos((hour / 24) * 2 * Math.PI) * 2,
          Matter: 3 + Math.sin(((hour + 6) / 24) * 2 * Math.PI) * 2,
          Substance: 3 + Math.cos(((hour + 3) / 24) * 2 * Math.PI) * 2,
        });
      }

      setTrendData(data);
    };

    generateTrendData();
    const interval = setInterval(generateTrendData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

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
