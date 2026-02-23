"use client";

/**
 * Enhanced Cooking Method Recommender — Revamped UI
 *
 * Visual-first design showcasing the full alchemical cooking system:
 * - Rich collapsed cards with elemental bars, P=IV radar, and key metrics
 * - Tabbed expanded views (Overview / Thermodynamics / Kinetics / Conditions)
 * - Sortable by Power, Energy, Monica Score, or Heat
 * - SVG radar chart for kineticProfile visualization
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import {
  ALCHEMICAL_PILLARS,
} from "@/constants/alchemicalPillars";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import {
  calculateKAlchm,
  calculateMonicaConstant,
  calculateMonicaOptimizationScore,
} from "@/utils/monicaKalchmCalculations";
import {
  calculateOptimalCookingConditions,
  calculatePillarMonicaModifiers,
  getCookingMethodThermodynamics,
} from "@/constants/alchemicalPillars";
import type { KineticMetrics } from "@/calculations/kinetics";
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import { calculateMethodSpecificKinetics } from "@/utils/cookingMethodKinetics";
import { getKineticProfile } from "@/utils/cookingMethodKinetics";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import type {
  AlchemicalProperties,
  ElementalProperties,
} from "@/types/celestial";

// ============================================================================
// Types
// ============================================================================

interface MethodData {
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  alchemicalProperties?: AlchemicalProperties;
  thermodynamicProperties?: {
    heat: number;
    entropy: number;
    reactivity: number;
    energy?: number;
  };
  duration?: { min: number; max: number };
  time_range?: { min: number; max: number };
  suitable_for?: string[];
  benefits?: string[];
  toolsRequired?: string[];
  commonMistakes?: string[];
  expertTips?: string[];
  regionalVariations?: Record<string, string[]>;
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  methods: Record<string, MethodData>;
}

type SortKey = "composite" | "power" | "energy" | "monica" | "heat";
type ExpandedTab = "overview" | "thermo" | "kinetics" | "conditions";

const categories: CategoryConfig[] = [
  { id: "dry", name: "Dry Heat", icon: "🔥", methods: dryCookingMethods as Record<string, MethodData> },
  { id: "wet", name: "Wet Heat", icon: "💧", methods: wetCookingMethods as Record<string, MethodData> },
  { id: "molecular", name: "Molecular", icon: "🧪", methods: molecularCookingMethods as Record<string, MethodData> },
  { id: "traditional", name: "Traditional", icon: "🏺", methods: traditionalCookingMethods as Record<string, MethodData> },
  { id: "transformation", name: "Transformation", icon: "⚗️", methods: transformationMethods as Record<string, MethodData> },
];

// ============================================================================
// Constants & Helpers
// ============================================================================

const DEFAULT_PLANETARY_POSITIONS = {
  Sun: "Leo" as const, Moon: "Cancer" as const, Mercury: "Gemini" as const,
  Venus: "Taurus" as const, Mars: "Aries" as const, Jupiter: "Sagittarius" as const,
  Saturn: "Capricorn" as const, Uranus: "Aquarius" as const,
  Neptune: "Pisces" as const, Pluto: "Scorpio" as const,
};

function extractZodiacSignType(position: unknown): string {
  if (!position) return "Aries";
  if (typeof position === "string") return position;
  if (typeof position === "object" && position !== null) {
    const posObj = position as Record<string, unknown>;
    if (typeof posObj.sign === "string") {
      return posObj.sign.charAt(0).toUpperCase() + posObj.sign.slice(1).toLowerCase();
    }
  }
  return "Aries";
}

function normalizePlanetaryPositions(contextPositions: Record<string, unknown> | undefined): Record<string, string> {
  if (!contextPositions || Object.keys(contextPositions).length === 0) return DEFAULT_PLANETARY_POSITIONS;
  const normalized: Record<string, string> = {};
  const planets = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  for (const planet of planets) {
    const position = contextPositions[planet] || contextPositions[planet.toLowerCase()];
    normalized[planet] = extractZodiacSignType(position);
  }
  return normalized;
}

function classifyMonica(monica: number | null): { label: string; color: string; bgColor: string } {
  if (monica === null || isNaN(monica)) return { label: "Undefined", color: "text-gray-500", bgColor: "bg-gray-100" };
  if (monica > 10) return { label: "Highly Volatile", color: "text-red-700", bgColor: "bg-red-100" };
  if (monica > 5) return { label: "Volatile", color: "text-orange-700", bgColor: "bg-orange-100" };
  if (monica > 2) return { label: "Transformative", color: "text-yellow-700", bgColor: "bg-yellow-100" };
  if (monica > 1) return { label: "Balanced", color: "text-green-700", bgColor: "bg-green-100" };
  if (monica > 0.5) return { label: "Stable", color: "text-blue-700", bgColor: "bg-blue-100" };
  return { label: "Very Stable", color: "text-indigo-700", bgColor: "bg-indigo-100" };
}

function getPillarColors(pillarId: number) {
  const map: Record<number, { bg: string; text: string; border: string; accent: string }> = {
    1: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-300", accent: "#3b82f6" },
    2: { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-300", accent: "#06b6d4" },
    3: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-300", accent: "#0ea5e9" },
    4: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-300", accent: "#6366f1" },
    5: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-300", accent: "#a855f7" },
    6: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-300", accent: "#eab308" },
    7: { bg: "bg-red-50", text: "text-red-800", border: "border-red-300", accent: "#ef4444" },
    8: { bg: "bg-green-50", text: "text-green-800", border: "border-green-300", accent: "#22c55e" },
    9: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-300", accent: "#14b8a6" },
    10: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-300", accent: "#f97316" },
    11: { bg: "bg-pink-50", text: "text-pink-800", border: "border-pink-300", accent: "#ec4899" },
    12: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300", accent: "#10b981" },
    13: { bg: "bg-violet-50", text: "text-violet-800", border: "border-violet-300", accent: "#8b5cf6" },
    14: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-300", accent: "#f59e0b" },
  };
  return map[pillarId] || { bg: "bg-gray-50", text: "text-gray-800", border: "border-gray-300", accent: "#6b7280" };
}

// ============================================================================
// SVG Radar Chart for Kinetic Profile
// ============================================================================

function KineticRadar({ profile, size = 120 }: { profile: { voltage: number; current: number; resistance: number; velocityFactor: number; momentumRetention: number; forceImpact: number }; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const axes = [
    { key: "voltage", label: "V", value: profile.voltage },
    { key: "current", label: "I", value: profile.current },
    { key: "velocityFactor", label: "Vel", value: profile.velocityFactor },
    { key: "forceImpact", label: "F", value: profile.forceImpact },
    { key: "momentumRetention", label: "Mom", value: profile.momentumRetention },
    { key: "resistance", label: "R", value: profile.resistance },
  ];
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  const points = axes.map((a, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return {
      x: cx + r * a.value * Math.cos(angle),
      y: cy + r * a.value * Math.sin(angle),
      lx: cx + (r + 12) * Math.cos(angle),
      ly: cy + (r + 12) * Math.sin(angle),
      label: a.label,
      value: a.value,
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(" ");

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      {/* Grid rings */}
      {rings.map(ring => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            return `${cx + r * ring * Math.cos(angle)},${cy + r * ring * Math.sin(angle)}`;
          }).join(" ")}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />
      ))}
      {/* Axis lines */}
      {axes.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return (
          <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#d1d5db" strokeWidth="0.5" />
        );
      })}
      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="1.5" />
      {/* Data points and labels */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill="#8b5cf6" />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-gray-500">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ============================================================================
// Elemental Composition Bar
// ============================================================================

function ElementalBar({ effect }: { effect: Record<string, number> }) {
  const total = (effect.Fire || 0) + (effect.Water || 0) + (effect.Earth || 0) + (effect.Air || 0) || 1;
  const pcts = {
    Fire: ((effect.Fire || 0) / total) * 100,
    Water: ((effect.Water || 0) / total) * 100,
    Earth: ((effect.Earth || 0) / total) * 100,
    Air: ((effect.Air || 0) / total) * 100,
  };
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full" title={`Fire ${pcts.Fire.toFixed(0)}% | Water ${pcts.Water.toFixed(0)}% | Earth ${pcts.Earth.toFixed(0)}% | Air ${pcts.Air.toFixed(0)}%`}>
      {pcts.Fire > 0 && <div className="bg-red-400 transition-all" style={{ width: `${pcts.Fire}%` }} />}
      {pcts.Water > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${pcts.Water}%` }} />}
      {pcts.Earth > 0 && <div className="bg-amber-600 transition-all" style={{ width: `${pcts.Earth}%` }} />}
      {pcts.Air > 0 && <div className="bg-sky-300 transition-all" style={{ width: `${pcts.Air}%` }} />}
    </div>
  );
}

// ============================================================================
// Component Props
// ============================================================================

interface EnhancedCookingMethodRecommenderProps {
  onDoubleClickMethod?: (methodName: string) => void;
}

// ============================================================================
// Main Component
// ============================================================================

export default function EnhancedCookingMethodRecommender({ onDoubleClickMethod }: EnhancedCookingMethodRecommenderProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("dry");
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [expandedTab, setExpandedTab] = useState<ExpandedTab>("overview");
  const [sortBy, setSortBy] = useState<SortKey>("composite");
  const [showPillarsGuide, setShowPillarsGuide] = useState(false);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, string>>(DEFAULT_PLANETARY_POSITIONS);
  const [positionsSource, setPositionsSource] = useState<"real" | "fallback">("fallback");

  // Get planetary positions from AlchemicalContext
  let alchemicalContext: ReturnType<typeof useAlchemical> | null = null;
  try {
    alchemicalContext = useAlchemical();
  } catch {
    // Context not available
  }

  useEffect(() => {
    if (alchemicalContext?.planetaryPositions) {
      const normalized = normalizePlanetaryPositions(alchemicalContext.planetaryPositions);
      setPlanetaryPositions(normalized);
      setPositionsSource("real");
    }
    if (alchemicalContext?.refreshPlanetaryPositions) {
      alchemicalContext.refreshPlanetaryPositions()
        .then((positions) => {
          if (positions && Object.keys(positions).length > 0) {
            setPlanetaryPositions(normalizePlanetaryPositions(positions as Record<string, unknown>));
            setPositionsSource("real");
          }
        })
        .catch(() => {});
    }
  }, [alchemicalContext?.planetaryPositions]);

  // ── Compute all methods with full metrics ──
  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    const baseAlchemicalProperties = calculateAlchemicalFromPlanets(planetaryPositions);

    const methods = Object.entries(category.methods).map(([id, method]) => {
      const pillar = getCookingMethodPillar(id);
      const baseESMS = {
        Spirit: baseAlchemicalProperties?.Spirit ?? 4,
        Essence: baseAlchemicalProperties?.Essence ?? 4,
        Matter: baseAlchemicalProperties?.Matter ?? 4,
        Substance: baseAlchemicalProperties?.Substance ?? 2,
      };
      const transformedESMS = pillar
        ? {
            Spirit: baseESMS.Spirit + (pillar.effects.Spirit || 0),
            Essence: baseESMS.Essence + (pillar.effects.Essence || 0),
            Matter: baseESMS.Matter + (pillar.effects.Matter || 0),
            Substance: baseESMS.Substance + (pillar.effects.Substance || 0),
          }
        : baseESMS;

      const methodThermo = method.thermodynamicProperties || getCookingMethodThermodynamics(id) || { heat: 0.5, entropy: 0.5, reactivity: 0.5 };

      const gregsEnergy = calculateGregsEnergy({
        Spirit: transformedESMS.Spirit, Essence: transformedESMS.Essence,
        Matter: transformedESMS.Matter, Substance: transformedESMS.Substance,
        Fire: method.elementalEffect.Fire, Water: method.elementalEffect.Water,
        Air: method.elementalEffect.Air, Earth: method.elementalEffect.Earth,
      }).gregsEnergy;

      const kalchm = calculateKAlchm(transformedESMS.Spirit, transformedESMS.Essence, transformedESMS.Matter, transformedESMS.Substance);
      const reactivity = methodThermo.reactivity;
      const monica = gregsEnergy !== null && kalchm ? calculateMonicaConstant(gregsEnergy, reactivity, kalchm) : null;
      const monicaModifiers = monica !== null ? calculatePillarMonicaModifiers(monica) : { temperatureAdjustment: 0, timingAdjustment: 0, intensityModifier: "neutral" as const };
      const optimalConditions = method.thermodynamicProperties && monica !== null ? calculateOptimalCookingConditions(monica, method.thermodynamicProperties) : null;

      let kinetics: KineticMetrics | null = null;
      try {
        kinetics = calculateMethodSpecificKinetics({
          methodId: id,
          elementalEffect: method.elementalEffect as unknown as Record<string, number>,
          transformedESMS,
          thermodynamics: methodThermo,
          gregsEnergy,
          monica,
          kineticProfile: (method as any).kineticProfile,
          planetaryPositions,
        });
      } catch { /* skip */ }

      const monicaScoreResult = calculateMonicaOptimizationScore(
        [id],
        baseAlchemicalProperties ?? { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 },
        method.elementalEffect as any,
      );

      // Get the kinetic profile (from data file or fallback)
      const kProfile = getKineticProfile(id, (method as any).kineticProfile);

      return {
        id, ...method,
        alchemicalProperties: transformedESMS,
        baseESMS,
        pillar,
        kalchm, monica,
        monicaClass: classifyMonica(monica),
        monicaModifiers,
        gregsEnergy,
        optimalConditions,
        kinetics,
        monicaScoreResult,
        kProfile,
      };
    });

    // Sort
    return methods.sort((a, b) => {
      switch (sortBy) {
        case "power": return (b.kinetics?.power ?? 0) - (a.kinetics?.power ?? 0);
        case "energy": return b.gregsEnergy - a.gregsEnergy;
        case "monica": return (b.monicaScoreResult?.score ?? 0) - (a.monicaScoreResult?.score ?? 0);
        case "heat": return (b.thermodynamicProperties?.heat ?? 0) - (a.thermodynamicProperties?.heat ?? 0);
        default: {
          const sa = (a.monicaScoreResult?.score ?? 50) * 0.6 + (a.gregsEnergy + 1) * 20;
          const sb = (b.monicaScoreResult?.score ?? 50) * 0.6 + (b.gregsEnergy + 1) * 20;
          return sb - sa;
        }
      }
    });
  }, [selectedCategory, planetaryPositions, sortBy]);

  const toggleMethod = (methodId: string) => {
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
      setExpandedTab("overview");
    }
  };

  const formatDuration = (method: MethodData) => {
    const t = method.duration || method.time_range;
    if (!t) return "Variable";
    if (t.min >= 1440) return `${Math.floor(t.min / 1440)}-${Math.floor(t.max / 1440)} days`;
    if (t.min >= 60) return `${Math.floor(t.min / 60)}-${Math.floor(t.max / 60)} hrs`;
    return `${t.min}-${t.max} min`;
  };

  const category = categories.find((cat) => cat.id === selectedCategory);

  // ============================================================================
  // RENDER: Tabs for expanded view
  // ============================================================================
  const tabs: { key: ExpandedTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "🔮" },
    { key: "thermo", label: "Thermodynamics", icon: "🌡️" },
    { key: "kinetics", label: "Kinetics", icon: "⚡" },
    { key: "conditions", label: "Conditions", icon: "🎯" },
  ];

  // ============================================================================
  // RENDER: Overview Tab
  // ============================================================================
  const renderOverviewTab = (method: (typeof currentMethods)[0]) => {
    const { monicaClass, kalchm, gregsEnergy, pillar, monicaScoreResult } = method;
    const pillarColors = pillar ? getPillarColors(pillar.id) : null;
    const score = monicaScoreResult?.score ?? 0;
    const getScoreColor = (s: number) => {
      if (s >= 75) return "text-yellow-700";
      if (s >= 50) return "text-green-700";
      if (s >= 25) return "text-blue-700";
      return "text-red-700";
    };

    return (
      <div className="space-y-4">
        {/* Monica Vibe Score + Transformation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Score Circle */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Monica Vibe Score</h4>
            <div className="flex items-center gap-5">
              <div className="relative h-24 w-24 flex-shrink-0">
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeDasharray={`${score} 100`} strokeLinecap="round"
                    className={getScoreColor(score)} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-black ${getScoreColor(score)}`}>{Math.round(score)}</span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="text-lg font-bold text-gray-800">{monicaScoreResult?.label ?? "N/A"}</div>
                {monicaScoreResult && (
                  <div className="space-y-1">
                    {[
                      { n: "Thermo Eff.", v: monicaScoreResult.breakdown.thermodynamicEfficiency, w: "40%" },
                      { n: "Alchm Eq.", v: monicaScoreResult.breakdown.alchemicalEquilibrium, w: "30%" },
                      { n: "Monica Align", v: monicaScoreResult.breakdown.monicaAlignment, w: "30%" },
                    ].map(({ n, v, w }) => (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-500">{n} <span className="text-gray-400">({w})</span></span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-400 rounded-full" style={{ width: `${Math.min(100, v)}%` }} />
                        </div>
                        <span className="w-8 text-right font-semibold text-gray-600">{Math.round(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Transformation Overview</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-500">Monica Class</div>
                <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${monicaClass.bgColor} ${monicaClass.color}`}>{monicaClass.label}</span>
              </div>
              <div>
                <div className="text-xs text-gray-500">Kalchm</div>
                <div className="text-lg font-bold text-purple-700 mt-0.5">{kalchm !== null && !isNaN(kalchm) ? kalchm.toFixed(3) : "N/A"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Greg&apos;s Energy</div>
                <div className={`text-lg font-bold mt-0.5 ${gregsEnergy >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {gregsEnergy >= 0 ? "+" : ""}{gregsEnergy.toFixed(3)}
                </div>
              </div>
              {pillar && (
                <div>
                  <div className="text-xs text-gray-500">Pillar</div>
                  <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${pillarColors?.bg} ${pillarColors?.text}`}>
                    #{pillar.id} {pillar.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ESMS Matrix */}
        <div className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Alchemical Matrix (ESMS)</h4>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: "Spirit", value: method.alchemicalProperties.Spirit, color: "bg-yellow-400", icon: "✨" },
              { name: "Essence", value: method.alchemicalProperties.Essence, color: "bg-blue-400", icon: "💫" },
              { name: "Matter", value: method.alchemicalProperties.Matter, color: "bg-green-500", icon: "🌿" },
              { name: "Substance", value: method.alchemicalProperties.Substance, color: "bg-purple-400", icon: "🔮" },
            ].map(({ name, value, color, icon }) => (
              <div key={name} className="text-center">
                <div className="text-lg">{icon}</div>
                <div className="text-xs font-semibold text-gray-600 mt-1">{name}</div>
                <div className="text-lg font-black text-gray-800">{value}</div>
                <div className="mt-1 mx-auto h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(100, ((value + 5) / 10) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          {method.pillar && (
            <div className="mt-3 text-center text-xs text-gray-500">
              Pillar Effects: {Object.entries(method.pillar.effects).map(([p, v]) => `${p} ${(v as number) > 0 ? "+" : ""}${v}`).join(", ")}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {method.suitable_for && method.suitable_for.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Suitable For</h4>
              <div className="flex flex-wrap gap-1">
                {method.suitable_for.slice(0, 6).map((item, i) => (
                  <span key={i} className="rounded-md bg-green-50 px-2 py-0.5 text-xs text-green-700">{item}</span>
                ))}
              </div>
            </div>
          )}
          {method.benefits && method.benefits.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Benefits</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
                {method.benefits.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {method.expertTips && method.expertTips.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Expert Tips</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
                {method.expertTips.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: Thermodynamics Tab
  // ============================================================================
  const renderThermoTab = (method: (typeof currentMethods)[0]) => {
    if (!method.thermodynamicProperties) return <p className="text-sm text-gray-500 py-8 text-center">No thermodynamic data available.</p>;
    const { heat, entropy, reactivity } = method.thermodynamicProperties;
    const { gregsEnergy, kalchm, monica, monicaClass } = method;
    const metrics = [
      { name: "Heat", value: heat, icon: "🔥", color: "bg-red-500", desc: "Active energy" },
      { name: "Entropy", value: entropy, icon: "🌀", color: "bg-orange-500", desc: "System disorder" },
      { name: "Reactivity", value: reactivity, icon: "⚡", color: "bg-pink-500", desc: "Change potential" },
    ];
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Heat · Entropy · Reactivity</h4>
          <div className="space-y-3">
            {metrics.map(({ name, value, icon, color, desc }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{icon}</span>
                <div className="w-20">
                  <div className="text-sm font-bold text-gray-700">{name}</div>
                  <div className="text-[10px] text-gray-400">{desc}</div>
                </div>
                <div className="flex-1">
                  <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} transition-all duration-500 rounded-full`} style={{ width: `${value * 100}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">{(value * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="w-14 text-right text-sm font-semibold text-gray-600">{value.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Derived Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Greg&apos;s Energy</div>
            <div className={`text-2xl font-black ${gregsEnergy >= 0 ? "text-green-600" : "text-red-600"}`}>
              {gregsEnergy >= 0 ? "+" : ""}{gregsEnergy.toFixed(3)}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">H - (S × R)</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Kalchm</div>
            <div className="text-2xl font-black text-purple-600">{kalchm !== null && !isNaN(kalchm) ? kalchm.toFixed(3) : "N/A"}</div>
            <div className="text-[10px] text-gray-400 mt-1">Equilibrium K</div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Monica</div>
            <div className={`text-xl font-black ${monicaClass.color}`}>
              {monica !== null && !isNaN(monica) ? monica.toFixed(3) : "N/A"}
            </div>
            <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${monicaClass.bgColor} ${monicaClass.color}`}>{monicaClass.label}</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: Kinetics Tab
  // ============================================================================
  const renderKineticsTab = (method: (typeof currentMethods)[0]) => {
    const { kinetics, kProfile } = method;

    return (
      <div className="space-y-4">
        {/* P=IV Radar + Key Metrics side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">P=IV Circuit Profile</h4>
            <div className="flex justify-center">
              <KineticRadar profile={kProfile} size={180} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Voltage", value: kProfile.voltage, unit: "V" },
                { label: "Current", value: kProfile.current, unit: "I" },
                { label: "Resistance", value: kProfile.resistance, unit: "R" },
                { label: "Velocity", value: kProfile.velocityFactor, unit: "v" },
                { label: "Momentum", value: kProfile.momentumRetention, unit: "p" },
                { label: "Force", value: kProfile.forceImpact, unit: "F" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="text-xs">
                  <div className="text-gray-400">{label}</div>
                  <div className="font-bold text-gray-700">{value.toFixed(2)} <span className="text-gray-400 text-[10px]">{unit}</span></div>
                </div>
              ))}
            </div>
          </div>

          {kinetics && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="text-sm font-bold text-gray-700 mb-3">Computed Kinetics</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Power (P=IV)", value: kinetics.power, color: "text-indigo-600" },
                  { label: "Force Magnitude", value: kinetics.forceMagnitude, color: "text-pink-600" },
                  { label: "Charge (Q)", value: kinetics.charge, color: "text-green-600" },
                  { label: "Potential (V)", value: kinetics.potentialDifference, color: "text-blue-600" },
                  { label: "Current (I)", value: kinetics.currentFlow, color: "text-amber-600" },
                  { label: "Inertia", value: kinetics.inertia, color: "text-gray-600" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="text-[10px] text-gray-400">{label}</div>
                    <div className={`text-lg font-black ${color}`}>{value.toFixed(3)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  kinetics.forceClassification === "accelerating" ? "bg-green-100 text-green-700"
                  : kinetics.forceClassification === "balanced" ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700"
                }`}>{kinetics.forceClassification}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  kinetics.thermalDirection === "heating" ? "bg-red-100 text-red-700"
                  : kinetics.thermalDirection === "cooling" ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
                }`}>
                  {kinetics.thermalDirection === "heating" ? "🔥" : kinetics.thermalDirection === "cooling" ? "❄️" : "➖"} {kinetics.thermalDirection}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Elemental Flow */}
        {kinetics && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Elemental Flow</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                const icons: Record<string, string> = { Fire: "🔥", Water: "💧", Earth: "🌍", Air: "💨" };
                const colors: Record<string, string> = { Fire: "bg-red-400", Water: "bg-blue-400", Earth: "bg-amber-600", Air: "bg-sky-300" };
                const v = kinetics.velocity[el];
                const m = kinetics.momentum[el];
                const f = kinetics.force[el];
                return (
                  <div key={el} className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="text-xl">{icons[el]}</div>
                    <div className="text-xs font-bold text-gray-700 mt-1">{el}</div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-gray-400 w-6">vel</span>
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[el]} rounded-full`} style={{ width: `${Math.min(100, v * 200)}%` }} />
                        </div>
                        <span className="text-gray-500 w-8 text-right">{v.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-gray-400 w-6">mom</span>
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[el]} rounded-full`} style={{ width: `${Math.min(100, m * 200)}%` }} />
                        </div>
                        <span className="text-gray-500 w-8 text-right">{m.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-gray-400 w-6">frc</span>
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${colors[el]} rounded-full`} style={{ width: `${Math.min(100, f * 200)}%` }} />
                        </div>
                        <span className="text-gray-500 w-8 text-right">{f.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Conditions Tab
  // ============================================================================
  const renderConditionsTab = (method: (typeof currentMethods)[0]) => {
    if (!method.optimalConditions) return <p className="text-sm text-gray-500 py-8 text-center">No optimal conditions calculated. Requires thermodynamic + Monica data.</p>;
    const { temperature, timing, planetaryHours, lunarPhases } = method.optimalConditions;
    const mods = method.monicaModifiers as any;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Temperature</div>
            <div className="text-3xl font-black text-red-600">{temperature}°F</div>
            <div className="text-sm text-gray-500">{Math.round(((temperature - 32) * 5) / 9)}°C</div>
            {mods?.temperatureAdjustment !== 0 && (
              <div className="mt-1 text-xs text-gray-400">Monica: {mods.temperatureAdjustment >= 0 ? "+" : ""}{mods.temperatureAdjustment.toFixed(0)}°F</div>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Timing</div>
            <span className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${
              timing === "quick" ? "bg-yellow-100 text-yellow-800"
              : timing === "slow" ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
            }`}>{timing.toUpperCase()}</span>
            {mods?.timingAdjustment !== 0 && (
              <div className="mt-2 text-xs text-gray-400">Monica: {mods.timingAdjustment >= 0 ? "+" : ""}{mods.timingAdjustment.toFixed(0)} min</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold text-gray-700 mb-2">Best Planetary Hours</div>
            <div className="flex flex-wrap gap-1.5">
              {planetaryHours.map((p) => (
                <span key={p} className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">{p}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold text-gray-700 mb-2">Lunar Phases</div>
            <div className="flex flex-wrap gap-1.5">
              {lunarPhases.map((ph) => (
                <span key={ph} className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">{ph.replace("_", " ")}</span>
              ))}
            </div>
          </div>
        </div>
        {method.pillar && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h4 className="text-xs font-bold text-gray-700 mb-2">Pillar Details: #{method.pillar.id} {method.pillar.name}</h4>
            <p className="text-xs text-gray-600">{method.pillar.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              {method.pillar.planetaryAssociations && <span>Planets: {method.pillar.planetaryAssociations.join(", ")}</span>}
              {method.pillar.tarotAssociations && <span>Tarot: {method.pillar.tarotAssociations.join(", ")}</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6 px-2 md:px-6 py-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900">Cooking Methods</h2>
        <p className="text-gray-500 mt-1">Alchemical Transformation System · P=IV Circuit Model · 14 Pillars</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            positionsSource === "real" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
          }`}>
            {positionsSource === "real" ? "🌟 Live Planetary Data" : "⏳ Default Positions"}
          </span>
          <button onClick={() => setShowPillarsGuide(!showPillarsGuide)} className="text-xs text-purple-600 hover:text-purple-800 hover:underline">
            {showPillarsGuide ? "Hide" : "Show"} 14 Pillars
          </button>
        </div>
      </div>

      {/* Pillars Guide (collapsible) */}
      {showPillarsGuide && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-indigo-900 mb-3">The 14 Alchemical Pillars</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {ALCHEMICAL_PILLARS.map((pillar) => {
              const c = getPillarColors(pillar.id);
              return (
                <div key={pillar.id} className={`rounded-lg border ${c.border} ${c.bg} p-2.5 text-center`}>
                  <div className={`font-bold text-xs ${c.text}`}>{pillar.id}. {pillar.name}</div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {Object.entries(pillar.effects).map(([p, v]) => `${p[0]}${v > 0 ? "+" : ""}${v}`).join(" ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Selector + Sort Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setExpandedMethod(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "bg-gray-900 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:shadow"
              }`}
            >
              <span className="mr-1.5">{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          {([
            { key: "composite", label: "Best Match" },
            { key: "power", label: "Power" },
            { key: "energy", label: "Energy" },
            { key: "monica", label: "Monica" },
            { key: "heat", label: "Heat" },
          ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                sortBy === key ? "bg-purple-100 text-purple-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category subtitle */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-3xl">{category?.icon}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{category?.name} Methods</h3>
          <p className="text-xs text-gray-500">{currentMethods.length} methods · Sorted by {sortBy === "composite" ? "Best Match" : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</p>
        </div>
      </div>

      {/* Methods */}
      <div className="space-y-4">
        {currentMethods.map((method, idx) => {
          if (!method) return null;
          const isExpanded = expandedMethod === method.id;
          const pillarColors = method.pillar ? getPillarColors(method.pillar.id) : null;

          return (
            <div
              key={method.id}
              className={`rounded-xl border transition-all duration-300 ${
                isExpanded
                  ? `border-2 ${pillarColors?.border || "border-purple-300"} shadow-xl bg-gradient-to-br from-gray-50 to-white`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* ── Collapsed Card (always visible) ── */}
              <div
                className="cursor-pointer p-5"
                onClick={() => toggleMethod(method.id)}
                onDoubleClick={() => onDoubleClickMethod?.(method.name)}
              >
                <div className="flex items-start gap-4">
                  {/* Rank badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500">
                    {idx + 1}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold capitalize text-gray-900">{method.name}</h4>
                      {method.pillar && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pillarColors?.bg} ${pillarColors?.text}`}>
                          #{method.pillar.id}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${method.monicaClass.bgColor} ${method.monicaClass.color}`}>
                        {method.monicaClass.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{method.description}</p>

                    {/* Elemental bar */}
                    <div className="mt-2.5">
                      <ElementalBar effect={method.elementalEffect as unknown as Record<string, number>} />
                    </div>

                    {/* Key metrics row */}
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500">⏱️ {formatDuration(method)}</span>
                      <span className={`text-xs font-semibold ${method.gregsEnergy >= 0 ? "text-green-600" : "text-red-500"}`}>
                        ⚡ {method.gregsEnergy >= 0 ? "+" : ""}{method.gregsEnergy.toFixed(2)}
                      </span>
                      {method.monicaScoreResult && (
                        <span className="text-xs font-semibold text-purple-600">
                          🔮 {Math.round(method.monicaScoreResult.score)}/100
                        </span>
                      )}
                      {method.kinetics && (
                        <span className="text-xs font-semibold text-indigo-600">
                          ⚙️ P={method.kinetics.power.toFixed(2)}
                        </span>
                      )}
                      {method.thermodynamicProperties && (
                        <span className="text-xs text-red-500">
                          🔥 {(method.thermodynamicProperties.heat * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini radar (collapsed view) */}
                  <div className="hidden md:block flex-shrink-0">
                    <KineticRadar profile={method.kProfile} size={80} />
                  </div>
                </div>
              </div>

              {/* ── Expanded View ── */}
              {isExpanded && (
                <div className="border-t border-gray-200 px-5 pb-5">
                  {/* Tab bar */}
                  <div className="flex gap-1 py-3 border-b border-gray-100 mb-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={(e) => { e.stopPropagation(); setExpandedTab(tab.key); }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          expandedTab === tab.key
                            ? "bg-gray-900 text-white shadow"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  {expandedTab === "overview" && renderOverviewTab(method)}
                  {expandedTab === "thermo" && renderThermoTab(method)}
                  {expandedTab === "kinetics" && renderKineticsTab(method)}
                  {expandedTab === "conditions" && renderConditionsTab(method)}
                </div>
              )}

              {/* Expand indicator */}
              <div className="text-center pb-2">
                <span className="text-[10px] text-gray-400">
                  {isExpanded ? "▲ collapse" : "▼ expand"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        Alchemical Cooking System · 14 Pillars · ESMS · P=IV Kinetics · Monica Constants · Planetary Alignments
      </div>
    </div>
  );
}
