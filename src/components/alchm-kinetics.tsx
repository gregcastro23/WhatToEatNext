"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown, Zap } from "lucide-react";

type KineticData = {
  velocity: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  acceleration: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  momentum: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
};

export default function AlchmKinetics() {
  const [kinetics, setKinetics] = useState<KineticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKinetics = async () => {
      try {
        const response = await fetch("/api/alchm-quantities");
        const data = await response.json();
        setKinetics(data.kinetics);
      } catch (error) {
        console.error("Failed to fetch kinetics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKinetics();
    const interval = setInterval(fetchKinetics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-cyan-500/20 rounded w-1/3"></div>
          <div className="h-4 bg-cyan-500/20 rounded w-full"></div>
          <div className="h-4 bg-cyan-500/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!kinetics) {
    return (
      <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-lg border border-cyan-500/30">
        <p className="text-gray-400 italic">No kinetic data available</p>
      </div>
    );
  }

  const quantities = ["Spirit", "Essence", "Matter", "Substance"] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
        <Activity className="h-5 w-5" />
        Kinetic Analysis
      </h3>

      {/* Velocity Section */}
      <div className="space-y-3">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Velocity (Rate of Change)
        </h4>
        {quantities.map((quantity) => (
          <div key={`velocity-${quantity}`} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{quantity}</span>
              <span
                className={`font-mono ${
                  kinetics.velocity[quantity] > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {kinetics.velocity[quantity] > 0 ? "+" : ""}
                {kinetics.velocity[quantity].toFixed(3)}
              </span>
            </div>
            <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  kinetics.velocity[quantity] > 0
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
                style={{ width: `${Math.abs(kinetics.velocity[quantity]) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Acceleration Section */}
      <div className="space-y-3">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Acceleration
        </h4>
        {quantities.map((quantity) => (
          <div key={`acceleration-${quantity}`} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{quantity}</span>
              <span
                className={`font-mono ${
                  kinetics.acceleration[quantity] > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {kinetics.acceleration[quantity] > 0 ? "+" : ""}
                {kinetics.acceleration[quantity].toFixed(4)}
              </span>
            </div>
            <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  kinetics.acceleration[quantity] > 0
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
                style={{ width: `${Math.abs(kinetics.acceleration[quantity]) * 200}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Momentum Section */}
      <div className="space-y-3">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2">
          <TrendingDown className="h-4 w-4" />
          Momentum (Quantity × Velocity)
        </h4>
        {quantities.map((quantity) => (
          <div key={`momentum-${quantity}`} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{quantity}</span>
              <span
                className={`font-mono ${
                  kinetics.momentum[quantity] > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {kinetics.momentum[quantity] > 0 ? "+" : ""}
                {kinetics.momentum[quantity].toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  kinetics.momentum[quantity] > 0
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-orange-500"
                }`}
                style={{ width: `${Math.abs(kinetics.momentum[quantity]) * 10}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-400">
        Kinetic analysis shows the motion and change rates of alchemical quantities.
      </div>
    </div>
  );
}
