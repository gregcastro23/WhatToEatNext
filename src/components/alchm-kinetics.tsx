"use client";

import { Activity, TrendingUp, Zap, Gauge } from "lucide-react";
import { useState, useEffect } from "react";

interface ESMSKinetics {
  velocity:     { Spirit: number; Essence: number; Matter: number; Substance: number };
  acceleration: { Spirit: number; Essence: number; Matter: number; Substance: number };
  momentum:     { Spirit: number; Essence: number; Matter: number; Substance: number };
}

interface CircuitData {
  charge: number;
  potentialDifference: number;
  currentFlow: number;
  power: number;
  inertia: number;
  forceMagnitude: number;
  forceClassification: string;
  thermalDirection: string;
}

interface ApiData {
  kinetics: ESMSKinetics;
  circuit: CircuitData;
}

const QUANTITIES = ["Spirit", "Essence", "Matter", "Substance"] as const;

/** Return CSS colour class for a signed value */
function signColour(v: number): string {
  return v >= 0 ? "text-green-400" : "text-red-400";
}

/** Return CSS gradient class for a signed value */
function signGradient(v: number): string {
  return v >= 0
    ? "bg-gradient-to-r from-green-500 to-emerald-400"
    : "bg-gradient-to-r from-red-500 to-orange-400";
}

/**
 * Normalise a set of values so the largest absolute value maps to 1.
 * Returns width fractions (0–1) for use in progress bars.
 */
function normalise(record: Record<string, number>): Record<string, number> {
  const maxAbs = Math.max(...Object.values(record).map(Math.abs), 1e-9);
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => [k, Math.abs(v) / maxAbs]),
  );
}

/** Single metric row with normalised progress bar */
function MetricRow({
  label,
  value,
  widthFraction,
  precision = 4,
}: {
  label: string;
  value: number;
  widthFraction: number;
  precision?: number;
}) {
  const pct = `${(widthFraction * 100).toFixed(1)}%`;
  const sign = value >= 0 ? "+" : "";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className={`font-mono ${signColour(value)}`}>
          {sign}{value.toFixed(precision)}
        </span>
      </div>
      <div className="h-2 bg-gray-900/30 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${signGradient(value)}`}
          style={{ width: pct }}
        />
      </div>
    </div>
  );
}

/** Small circuit stat box */
function CircuitStat({
  label,
  value,
  unit = "",
  colour = "text-cyan-300",
}: {
  label: string;
  value: string | number;
  unit?: string;
  colour?: string;
}) {
  const display =
    typeof value === "number"
      ? Number.isFinite(value)
        ? value.toFixed(4)
        : "—"
      : value;
  return (
    <div className="p-3 bg-black/20 rounded-lg border border-cyan-900/40 text-center">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-sm font-mono font-semibold ${colour}`}>
        {display}
        {unit && <span className="text-gray-500 text-xs ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

export default function AlchmKinetics() {
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/alchm-quantities");
        const data = await response.json();
        if (data.kinetics && data.circuit) {
          setApiData({ kinetics: data.kinetics, circuit: data.circuit });
        }
      } catch (error) {
        console.error("Failed to fetch kinetics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 bg-cyan-500/20 rounded w-full" />
        ))}
      </div>
    );
  }

  if (!apiData) {
    return (
      <p className="text-gray-400 italic text-sm">No kinetic data available</p>
    );
  }

  const { kinetics, circuit } = apiData;

  // Normalise each metric group so progress bars are always visible
  const velW  = normalise(kinetics.velocity);
  const accW  = normalise(kinetics.acceleration);
  const momW  = normalise(kinetics.momentum);

  return (
    <div className="space-y-6">

      {/* ── Velocity ── */}
      <div className="space-y-3">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Velocity — rate of change tendency
        </h4>
        {QUANTITIES.map((q) => (
          <MetricRow
            key={`v-${q}`}
            label={q}
            value={kinetics.velocity[q]}
            widthFraction={velW[q]}
            precision={5}
          />
        ))}
      </div>

      {/* ── Acceleration ── */}
      <div className="space-y-3">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Acceleration — ΔVelocity / ΔTime
        </h4>
        {QUANTITIES.map((q) => (
          <MetricRow
            key={`a-${q}`}
            label={q}
            value={kinetics.acceleration[q]}
            widthFraction={accW[q]}
            precision={5}
          />
        ))}
      </div>

      {/* ── Momentum ── */}
      <div className="space-y-3">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4" />
          Momentum — Quantity × Velocity
        </h4>
        {QUANTITIES.map((q) => (
          <MetricRow
            key={`m-${q}`}
            label={q}
            value={kinetics.momentum[q]}
            widthFraction={momW[q]}
            precision={3}
          />
        ))}
      </div>

      {/* ── P = IV Circuit ── */}
      <div className="space-y-3 pt-2 border-t border-cyan-900/30">
        <h4 className="font-medium text-cyan-300 flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4" />
          P = IV Circuit Model
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <CircuitStat label="Charge Q = M+Sub"  value={circuit.charge}              unit="u"  />
          <CircuitStat label="Potential ΔV"       value={circuit.potentialDifference}           />
          <CircuitStat label="Current Flow I"     value={circuit.currentFlow}        unit="A"  />
          <CircuitStat label="Power P = IV"       value={circuit.power}                        />
          <CircuitStat label="Inertia"            value={circuit.inertia}                       />
          <CircuitStat label="|Force|"            value={circuit.forceMagnitude}                />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-black/20 rounded-lg border border-cyan-900/40 text-center">
            <div className="text-xs text-gray-400 mb-1">Force Class</div>
            <div className={`text-sm font-semibold capitalize ${
              circuit.forceClassification === "accelerating"
                ? "text-green-400"
                : circuit.forceClassification === "decelerating"
                ? "text-red-400"
                : "text-yellow-400"
            }`}>
              {circuit.forceClassification}
            </div>
          </div>
          <div className="p-3 bg-black/20 rounded-lg border border-cyan-900/40 text-center">
            <div className="text-xs text-gray-400 mb-1">Thermal Direction</div>
            <div className={`text-sm font-semibold capitalize ${
              circuit.thermalDirection === "heating"
                ? "text-orange-400"
                : circuit.thermalDirection === "cooling"
                ? "text-blue-400"
                : "text-gray-400"
            }`}>
              {circuit.thermalDirection}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Velocities are thermodynamic-deviation proxies (no two-point ΔT available).
        Circuit follows the P = IV model: Q = Matter + Substance, V = GregsEnergy/Q,
        I = Reactivity × Q × 0.1, P = I × V.
      </p>
    </div>
  );
}
