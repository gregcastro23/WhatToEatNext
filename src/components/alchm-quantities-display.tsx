"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Droplets,
  Wind,
  Mountain,
  Coins,
  RefreshCw,
} from "lucide-react";

type AlchemyQuantities = {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  ANumber: number;
  DayEssence: number;
  NightEssence: number;
};

type AlchemyData = {
  quantities: AlchemyQuantities;
  dominantElement: string;
  heat: number;
  entropy: number;
  reactivity: number;
  energy: number;
  kalchm: number;
  monica: number;
  timestamp: string;
  error?: string;
};

export default function AlchmQuantitiesDisplay() {
  const [data, setData] = useState<AlchemyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/alchm-quantities");
      if (!response.ok) throw new Error("Failed to fetch");
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-orange-500/20 rounded w-1/3"></div>
          <div className="h-4 bg-orange-500/20 rounded w-full"></div>
          <div className="h-4 bg-orange-500/20 rounded w-full"></div>
          <div className="h-4 bg-orange-500/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-lg border border-red-500/30">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30">
        <p className="text-gray-400 italic">No data available</p>
      </div>
    );
  }

  const quantities = data?.quantities;

  if (!quantities) {
    return (
      <div className="p-6 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg border border-orange-500/30">
        <p className="text-gray-400 italic">Quantities data not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-orange-300">
          Current Quantities
        </h3>
        <button
          onClick={fetchData}
          className="px-3 py-2 rounded-lg bg-orange-900/30 hover:bg-orange-800/40 text-orange-300 font-semibold text-sm transition-all duration-200 hover:scale-105 border border-orange-500/30 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Main Quantities Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Spirit */}
        <div className="p-4 bg-gradient-to-br from-red-900/30 to-orange-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-red-400" />
            <span className="font-semibold text-gray-200">Spirit</span>
          </div>
          <div className="text-2xl font-bold mb-2 text-red-300">
            {(quantities.Spirit ?? 0).toFixed(1)}
          </div>
          <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${((quantities.Spirit ?? 0) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Essence */}
        <div className="p-4 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-gray-200">Essence</span>
          </div>
          <div className="text-2xl font-bold mb-2 text-blue-300">
            {(quantities.Essence ?? 0).toFixed(1)}
          </div>
          <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${((quantities.Essence ?? 0) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Matter */}
        <div className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mountain className="h-5 w-5 text-green-400" />
            <span className="font-semibold text-gray-200">Matter</span>
          </div>
          <div className="text-2xl font-bold mb-2 text-green-300">
            {(quantities.Matter ?? 0).toFixed(1)}
          </div>
          <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${((quantities.Matter ?? 0) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Substance */}
        <div className="p-4 bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wind className="h-5 w-5 text-purple-400" />
            <span className="font-semibold text-gray-200">Substance</span>
          </div>
          <div className="text-2xl font-bold mb-2 text-purple-300">
            {(quantities.Substance ?? 0).toFixed(1)}
          </div>
          <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${((quantities.Substance ?? 0) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* A-Number Display */}
      <div className="p-6 bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border border-amber-500/30 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <Coins className="h-6 w-6 text-amber-400" />
          <span className="text-xl font-bold text-amber-300">A-Number</span>
        </div>
        <div className="text-3xl font-bold text-amber-300">
          {(quantities.ANumber ?? 0).toFixed(1)}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Total alchemical energy: Spirit + Essence + Matter + Substance
        </p>
      </div>

      {/* Thermodynamics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-center">
          <div className="font-semibold text-gray-300">Heat</div>
          <div className="text-lg text-cyan-300">
            {(data.heat ?? 0).toFixed(4)}
          </div>
        </div>
        <div className="p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg text-center">
          <div className="font-semibold text-gray-300">Entropy</div>
          <div className="text-lg text-orange-300">
            {(data.entropy ?? 0).toFixed(4)}
          </div>
        </div>
        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-center">
          <div className="font-semibold text-gray-300">Reactivity</div>
          <div className="text-lg text-purple-300">
            {(data.reactivity ?? 0).toFixed(4)}
          </div>
        </div>
        <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
          <div className="font-semibold text-gray-300">Energy</div>
          <div className="text-lg text-green-300">
            {(data.energy ?? 0).toFixed(4)}
          </div>
        </div>
      </div>

      {/* Alchemical Constants */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg text-center">
          <div className="font-semibold text-gray-300">
            K<sub>alchm</sub>
          </div>
          <div className="text-lg text-amber-300">
            {(data.kalchm ?? 0).toFixed(4) ?? "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Alchemical Equilibrium
          </div>
        </div>
        <div className="p-3 bg-pink-900/20 border border-pink-500/30 rounded-lg text-center">
          <div className="font-semibold text-gray-300">Monica</div>
          <div className="text-lg text-pink-300">
            {(data.monica ?? 0).toFixed(4) ?? "N/A"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Dynamic System Constant
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>
          Dominant Element:{" "}
          <span className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700 text-gray-300">
            {data.dominantElement ?? "N/A"}
          </span>
        </p>
        <p>
          Last Updated:{" "}
          {new Date(data.timestamp ?? Date.now()).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
