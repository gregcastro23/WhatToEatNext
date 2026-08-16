"use client";

/**
 * Enhanced Cooking Method Recommender — Refined UI
 *
 * "Zen-to-Expert" experience featuring:
 * - Harmony Index scoring via Resonance Gap model
 * - Focus dropdown (Alchemical Harmony / Quickest / Stability / Flavorful)
 * - User Intent selector (Crispy / Tender / Fast / Flavorful)
 * - Alchemist's Hook descriptions & Culinary Archetypes
 * - Spider Chart (Elemental Quadrant Map) for visual comparison
 * - Color-coded Volatility Badge for Monica constant
 * - Compare mode with Delta View
 * - Tabbed expanded views (Overview / Thermodynamics / Kinetics / Conditions)
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { calculateGregsEnergy } from "@/calculations/gregsEnergy";
import type { KineticMetrics } from "@/calculations/kinetics";
import {
  ConditionsTab,
  CookTimeExplorer,
  EquipmentPhysicsPanel,
  PhysicsTab,
  ReactionsTab,
} from "@/components/cooking-methods/MethodPhysicsPanels";
import { CookingEquipmentPanel } from "@/components/CookingEquipmentPanel";
import {
  ALCHEMICAL_PILLARS,
  calculateOptimalCookingConditions,
  calculatePillarMonicaModifiers,
  getCookingMethodThermodynamics,
} from "@/constants/alchemicalPillars";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import {
  dryCookingMethods,
  wetCookingMethods,
  molecularCookingMethods,
  traditionalCookingMethods,
  transformationMethods,
} from "@/data/cooking/methods";
import type { MethodPhysicalReference } from "@/data/cooking/physicalReference";
import { METHOD_PHYSICAL_REFERENCE } from "@/data/cooking/physicalReference";
import {
  calculateKalchm,
  calculateMonica,
} from "@/data/unified/alchemicalCalculations";
import { useUserElementalBias } from "@/hooks/useUserElementalBias";
import { buildMethodMetrics } from "@/lib/cooking/methodMetrics";
import type {
  AlchemicalProperties,
  ElementalProperties,
} from "@/types/celestial";
import { getCookingMethodPillar } from "@/utils/alchemicalPillarUtils";
import { isCurrentSkyDiurnal } from "@/utils/astrology/positions";
import {
  calculateMethodSpecificKinetics,
  getKineticProfile,
} from "@/utils/cookingMethodKinetics";
import { projectZScoreTarget } from "@/utils/enhancedCompatibilityScoring";
import { calculateMonicaOptimizationScore } from "@/utils/monicaKalchmCalculations";
import {
  calculateAlchemicalFromPlanets,
  type AlchemicalPlanetPositions,
} from "@/utils/planetaryAlchemyMapping";
import {
  calculateHarmonyIndex,
  type FocusMode,
  type UserIntent,
  type HarmonyResult as _HarmonyResult,
} from "@/utils/resonanceGapScoring";



// ============================================================================
// Types
// ============================================================================

interface MethodData {
  name: string;
  description: string;
  shortDescription?: string;
  culinaryArchetype?: string;
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

/**
 * Tab order encodes the editorial ruling behind this surface: physical
 * behaviour first, alchemical quantities last and clearly labelled.
 *
 * The alchemical layer is not removed — it drives matching against the sky and
 * is genuinely load-bearing — but it no longer sets, or appears alongside, any
 * number a cook would act on. See `src/lib/cooking/thermo.ts` for what the old
 * arrangement was producing.
 */
type ExpandedTab =
  | "overview"
  | "physics"
  | "reactions"
  | "conditions"
  | "equipment"
  | "alchemy"
  | "recipes";

interface CurrentMomentPayload {
  success: boolean;
  timestamp: string;
  historicalContext?: {
    metrics: {
      heat?: { mean: number; stdDev: number };
      entropy?: { mean: number; stdDev: number };
      reactivity?: { mean: number; stdDev: number };
      charge?: { mean: number; stdDev: number };
      power?: { mean: number; stdDev: number };
      currentFlow?: { mean: number; stdDev: number };
      kalchm?: { mean: number; stdDev: number };
      monica?: { mean: number; stdDev: number };
    };
  };
  quantities: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  dominantElement: string;
  heat: number;
  entropy: number;
  reactivity: number;
  energy: number;
  kalchm: number;
  monica: number;
  circuit: {
    charge: number;
    potentialDifference: number;
    currentFlow: number;
    power: number;
    inertia: number;
    forceMagnitude: number;
    forceClassification: "accelerating" | "decelerating" | "balanced";
    thermalDirection: "heating" | "cooling" | "stable";
    elementalBalance: {
      Fire: number;
      Water: number;
      Earth: number;
      Air: number;
    };
  };
}


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

const FOCUS_OPTIONS: Array<{ key: FocusMode; label: string; desc: string }> = [
  { key: "harmony", label: "Alchemical Harmony", desc: "Overall resonance" },
  { key: "quickest", label: "Quickest Transformation", desc: "Speed-first" },
  { key: "stability", label: "Highest Stability", desc: "Low volatility" },
  { key: "flavorful", label: "Most Flavorful", desc: "Max flavor" },
];

const INTENT_OPTIONS: Array<{ key: UserIntent; label: string; icon: string }> = [
  { key: null, label: "Any", icon: "✨" },
  { key: "crispy", label: "Crispy", icon: "🍞" },
  { key: "tender", label: "Tender", icon: "🍖" },
  { key: "fast", label: "Fast", icon: "⚡" },
  { key: "flavorful", label: "Flavorful", icon: "🌿" },
];

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

function classifyMonica(monica: number | null): { label: string; color: string; bgColor: string; badgeColor: string } {
  if (monica === null || isNaN(monica)) return { label: "Undefined", color: "text-gray-500", bgColor: "bg-white/10", badgeColor: "bg-gray-400" };
  if (monica > 10) return { label: "Highly Volatile", color: "text-red-700", bgColor: "bg-red-100", badgeColor: "bg-red-500" };
  if (monica > 5) return { label: "Volatile", color: "text-orange-700", bgColor: "bg-orange-100", badgeColor: "bg-orange-500" };
  if (monica > 2) return { label: "Transformative", color: "text-yellow-700", bgColor: "bg-yellow-100", badgeColor: "bg-yellow-500" };
  if (monica > 1) return { label: "Balanced", color: "text-green-700", bgColor: "bg-green-100", badgeColor: "bg-green-500" };
  if (monica > 0.5) return { label: "Stable", color: "text-blue-700", bgColor: "bg-blue-100", badgeColor: "bg-blue-500" };
  return { label: "Very Stable", color: "text-indigo-700", bgColor: "bg-indigo-100", badgeColor: "bg-indigo-500" };
}

/**
 * Kalchm spans eight orders of magnitude across the method corpus
 * (`[MEASURED 2026-08-16]` 8.6e-3 to 3.6e+5 on fallback ESMS, and past 9.5e+5
 * on live sky data), because it is a ratio of terms of the form Sᔆ·Eᴱ/(Mᴹ·Suˢᵘ).
 *
 * Rendered with `.toFixed(3)` that produced "958634.963" — ten characters of
 * false precision in a fixed-width card, which overflowed into the Monica cell
 * beside it. Neither the digits nor the layout survived.
 *
 * Scientific notation past four digits keeps every magnitude legible at a
 * constant width, and the log form is what actually carries meaning: Kalchm is
 * an equilibrium constant, so ln K is the quantity that behaves additively.
 */
function formatKalchm(kalchm: number | null): { display: string; lnK: string | null } {
  if (kalchm === null || !Number.isFinite(kalchm) || kalchm <= 0) {
    return { display: "N/A", lnK: null };
  }
  const lnK = Math.log(kalchm);
  if (kalchm >= 10000 || kalchm < 0.01) {
    return { display: kalchm.toExponential(2), lnK: lnK.toFixed(2) };
  }
  return { display: kalchm.toFixed(3), lnK: lnK.toFixed(2) };
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
  return map[pillarId] || { bg: "bg-white/5", text: "text-gray-200", border: "border-white/10", accent: "#6b7280" };
}

// ============================================================================
// SVG Spider Chart — Elemental Quadrant Map
// ============================================================================

function ElementalSpider({ effect, size = 100 }: { effect: Record<string, number>; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const axes = [
    { key: "Fire", label: "🔥", value: effect.Fire || 0, color: "#ef4444" },
    { key: "Air", label: "💨", value: effect.Air || 0, color: "#38bdf8" },
    { key: "Water", label: "💧", value: effect.Water || 0, color: "#3b82f6" },
    { key: "Earth", label: "🌍", value: effect.Earth || 0, color: "#d97706" },
  ];
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  const points = axes.map((a, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return {
      x: cx + r * a.value * Math.cos(angle),
      y: cy + r * a.value * Math.sin(angle),
      lx: cx + (r + 14) * Math.cos(angle),
      ly: cy + (r + 14) * Math.sin(angle),
      ...a,
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(" ");
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      {rings.map(ring => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            return `${cx + r * ring * Math.cos(angle)},${cy + r * ring * Math.sin(angle)}`;
          }).join(" ")}
          fill="none" stroke="#e5e7eb" strokeWidth="0.5"
        />
      ))}
      {axes.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#d1d5db" strokeWidth="0.5" />;
      })}
      <polygon points={polygon} fill="rgba(99, 102, 241, 0.15)" stroke="#6366f1" strokeWidth="1.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={p.color} />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="text-[10px]" fill={p.color}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
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
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
      {rings.map(ring => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            return `${cx + r * ring * Math.cos(angle)},${cy + r * ring * Math.sin(angle)}`;
          }).join(" ")}
          fill="none" stroke="#e5e7eb" strokeWidth="0.5"
        />
      ))}
      {axes.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="#d1d5db" strokeWidth="0.5" />;
      })}
      <polygon points={polygon} fill="rgba(139, 92, 246, 0.2)" stroke="#8b5cf6" strokeWidth="1.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill="#8b5cf6" />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold fill-gray-500">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ============================================================================
// Harmony Ring — circular progress indicator
// ============================================================================

function HarmonyRing({ value, size = 56 }: { value: number; size?: number }) {
  const getColor = (v: number) => {
    if (v >= 75) return "text-emerald-500";
    if (v >= 60) return "text-green-500";
    if (v >= 45) return "text-yellow-500";
    if (v >= 30) return "text-orange-500";
    return "text-red-500";
  };
  const r = 15.9;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" viewBox="0 0 36 36" width={size} height={size}>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#f3f4f6" strokeWidth="2.5" />
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeDasharray={`${value} 100`} strokeLinecap="round"
          className={getColor(value)} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-black ${getColor(value)}`}>{Math.round(value)}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// Volatility Badge
// ============================================================================

function VolatilityBadge({ monica }: { monica: number | null }) {
  const cls = classifyMonica(monica);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${cls.bgColor} ${cls.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cls.badgeColor}`} />
      {cls.label}
    </span>
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
  const [focusMode, setFocusMode] = useState<FocusMode>("harmony");
  const [userIntent, setUserIntent] = useState<UserIntent>(null);
  // Visitor's elemental bias (chart/table) — adds the "Personal" harmony
  // dimension; null keeps scoring bit-identical to unpersonalized.
  const { bias: userBias, source: biasSource } = useUserElementalBias();
  const [showPillarsGuide, setShowPillarsGuide] = useState(false);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, string>>(DEFAULT_PLANETARY_POSITIONS);
  const [positionsSource, setPositionsSource] = useState<"real" | "fallback">("fallback");
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelections, setCompareSelections] = useState<string[]>([]);
  const [currentMoment, setCurrentMoment] = useState<CurrentMomentPayload | null>(null);
  const [momentStatus, setMomentStatus] = useState<"loading" | "ready" | "error">("loading");
  const [alignedRecipes, setAlignedRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [fetchedMethodRecipes, setFetchedMethodRecipes] = useState<Record<string, any[]>>({});

  // Get planetary positions from AlchemicalContext
  const alchemicalContext = useAlchemical();
  const contextPlanetaryPositions = alchemicalContext?.planetaryPositions;
  const refreshPlanetaryPositions = alchemicalContext?.refreshPlanetaryPositions;

  useEffect(() => {
    if (contextPlanetaryPositions && Object.keys(contextPlanetaryPositions).length > 0) {
      const normalized = normalizePlanetaryPositions(contextPlanetaryPositions);
      setPlanetaryPositions(normalized);
      setPositionsSource("real");
    }
  }, [contextPlanetaryPositions]);

  // Kick off one refresh on mount only. The provider already polls every 30
  // minutes, so we don't need to re-fetch on every context change (which was
  // previously thrashing /api/astrologize).
  useEffect(() => {
    if (!refreshPlanetaryPositions) return;
    refreshPlanetaryPositions()
      .then((positions) => {
        if (positions && Object.keys(positions).length > 0) {
          setPlanetaryPositions(normalizePlanetaryPositions(positions));
          setPositionsSource("real");
        }
      })
      .catch(() => {
        console.warn("[EnhancedCookingMethodRecommender] Failed to refresh planetary positions");
      });
  }, [refreshPlanetaryPositions]);

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentMoment = async () => {
      try {
        const response = await fetch("/api/alchm-quantities", { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as CurrentMomentPayload;
        if (!cancelled && data?.success) {
          setCurrentMoment(data);
          setMomentStatus("ready");
        }
      } catch {
        if (!cancelled) setMomentStatus("error");
      }
    };

    void fetchCurrentMoment();
    const interval = setInterval(() => {
      void fetchCurrentMoment();
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ── Compute all methods with full metrics + Harmony Index ──
  const currentMethods = useMemo(() => {
    const category = categories.find((cat) => cat.id === selectedCategory);
    if (!category) return [];

    const esmsPositions: AlchemicalPlanetPositions =
      contextPlanetaryPositions &&
      Object.keys(contextPlanetaryPositions).length > 0
        ? (Object.fromEntries(
            Object.entries(contextPlanetaryPositions).filter(
              ([, position]) => position != null,
            ),
          ) as AlchemicalPlanetPositions)
        : planetaryPositions;
    const planetaryDerivedESMS = calculateAlchemicalFromPlanets(
      esmsPositions,
      isCurrentSkyDiurnal(),
    );
    const baseAlchemicalProperties = currentMoment?.quantities
      ? {
        Spirit: currentMoment.quantities.Spirit,
        Essence: currentMoment.quantities.Essence,
        Matter: currentMoment.quantities.Matter,
        Substance: currentMoment.quantities.Substance,
      }
      : planetaryDerivedESMS;

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

      const { gregsEnergy } = calculateGregsEnergy({
        Spirit: transformedESMS.Spirit, Essence: transformedESMS.Essence,
        Matter: transformedESMS.Matter, Substance: transformedESMS.Substance,
        Fire: method.elementalEffect.Fire, Water: method.elementalEffect.Water,
        Air: method.elementalEffect.Air, Earth: method.elementalEffect.Earth,
      });

      const kalchm = calculateKalchm(transformedESMS);
      const { reactivity } = methodThermo;
      const monica = gregsEnergy !== null && kalchm ? calculateMonica(gregsEnergy, reactivity, kalchm) : null;
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
          planetaryPositions: (contextPlanetaryPositions && Object.keys(contextPlanetaryPositions).length > 0) ? contextPlanetaryPositions : planetaryPositions,
        });
      } catch { /* skip */ }

      const monicaScoreResult = calculateMonicaOptimizationScore(
        [id],
        baseAlchemicalProperties ?? { Spirit: 4, Essence: 4, Matter: 4, Substance: 2 },
        method.elementalEffect as any,
      );

      const kProfile = getKineticProfile(id, (method as any).kineticProfile);
      const referenceProfile = METHOD_PHYSICAL_REFERENCE[id];
      // Physical behaviour — independent of everything above it. Null only when
      // a method has no physics profile, which a coverage test forbids.
      const physicsMetrics = buildMethodMetrics(id);

      const projHeat = currentMoment ? projectZScoreTarget(currentMoment.heat ?? 0.5, currentMoment.historicalContext?.metrics?.heat, "heat") : null;
      const projEntropy = currentMoment ? projectZScoreTarget(currentMoment.entropy ?? 0.5, currentMoment.historicalContext?.metrics?.entropy, "entropy") : null;
      const projReactivity = currentMoment ? projectZScoreTarget(currentMoment.reactivity ?? 0.5, currentMoment.historicalContext?.metrics?.reactivity, "reactivity") : null;

      const thermoAlignmentScore = projHeat !== null
        ? Math.max(
          0,
          100 -
          ((Math.abs(projHeat - methodThermo.heat) +
            Math.abs(projEntropy! - methodThermo.entropy) +
            Math.abs(projReactivity! - methodThermo.reactivity)) /
            3) *
          100,
        )
        : null;

      // Null when the method has no registered kinetic profile. The lookup used
      // to return six 0.50 midpoints on a miss, which produced a real-looking
      // power proxy for a method the registry knows nothing about.
      const methodPowerProxy = kProfile
        ? Math.max(0, Math.min(1, kProfile.voltage * kProfile.current * (1 - kProfile.resistance)))
        : null;
      const currentPowerProxy = currentMoment
        ? Math.max(0, Math.min(1, Math.abs(currentMoment.circuit.power) * 20))
        : null;
      const kineticAlignmentScore =
        currentPowerProxy === null || methodPowerProxy === null
          ? null
          : Math.max(0, 100 - Math.abs(methodPowerProxy - currentPowerProxy) * 100);

      // Calculate Harmony Index via Resonance Gap model
      const duration = method.duration || method.time_range;
      const harmony = calculateHarmonyIndex(
        {
          transformedESMS,
          elementalEffect: method.elementalEffect,
          thermodynamics: methodThermo,
          gregsEnergy,
          kalchm,
          monica,
          duration: duration || undefined,
          kineticPower: kinetics?.power,
          userElementalBias: userBias,
        },
        userIntent,
        {
          highStress:
            currentMoment?.circuit.forceClassification === "accelerating" &&
            currentMoment.circuit.forceMagnitude > 0.25,
        },
        focusMode,
      );

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
        harmony,
        referenceProfile,
        physicsMetrics,
        thermoAlignmentScore,
        kineticAlignmentScore,
      };
    });

    // Sort by Harmony Index (primary sort for all focus modes)
    return methods.sort((a, b) => b.harmony.harmonyIndex - a.harmony.harmonyIndex);
  }, [selectedCategory, planetaryPositions, contextPlanetaryPositions, focusMode, userIntent, currentMoment, userBias]);


  const loadAlignedRecipes = useCallback(async (methodId: string) => {
    if (fetchedMethodRecipes[methodId]) {
      setAlignedRecipes(fetchedMethodRecipes[methodId]);
      return;
    }
    setIsLoadingRecipes(true);
    try {
      const heat = currentMoment?.heat ?? 0.5;
      const entropy = currentMoment?.entropy ?? 0.5;
      const reactivity = currentMoment?.reactivity ?? 0.5;
      const res = await fetch(`/api/recommendations/recipes?method=${methodId}&heat=${heat}&entropy=${entropy}&reactivity=${reactivity}`);
      const data = await res.json();
      if (data.success) {
        setAlignedRecipes(data.recipes);
        setFetchedMethodRecipes(prev => ({ ...prev, [methodId]: data.recipes }));
      }
    } catch (err) {
      console.warn("Failed to fetch aligned recipes", err);
    } finally {
      setIsLoadingRecipes(false);
    }
  }, [currentMoment, fetchedMethodRecipes]);

  const toggleMethod = useCallback((methodId: string) => {
    if (compareMode) {
      setCompareSelections(prev => {
        if (prev.includes(methodId)) return prev.filter(id => id !== methodId);
        if (prev.length >= 2) return [prev[1], methodId];
        return [...prev, methodId];
      });
      return;
    }
    if (expandedMethod === methodId) {
      setExpandedMethod(null);
    } else {
      setExpandedMethod(methodId);
      setExpandedTab("overview");
    }
  }, [compareMode, expandedMethod]);

  const formatDuration = (method: MethodData) => {
    const t = method.duration || method.time_range;
    if (!t) return "Variable";
    if (t.min >= 1440) return `${Math.floor(t.min / 1440)}-${Math.floor(t.max / 1440)} days`;
    if (t.min >= 60) return `${Math.floor(t.min / 60)}-${Math.floor(t.max / 60)} hrs`;
    return `${t.min}-${t.max} min`;
  };

  const category = categories.find((cat) => cat.id === selectedCategory);

  // Compare mode data
  const compareData = useMemo(() => {
    if (!compareMode || compareSelections.length !== 2) return null;
    const [a, b] = compareSelections.map(id => currentMethods.find(m => m.id === id));
    if (!a || !b) return null;
    return { a, b };
  }, [compareMode, compareSelections, currentMethods]);

  // ============================================================================
  // RENDER: Tabs for expanded view
  // ============================================================================

  useEffect(() => {
    if (expandedTab === "recipes" && expandedMethod) {
      void loadAlignedRecipes(expandedMethod);
    }
  }, [expandedTab, expandedMethod, loadAlignedRecipes]);

  const tabs: Array<{ key: ExpandedTab; label: string; icon: string }> = [
    { key: "overview", label: "Overview", icon: "📋" },
    { key: "physics", label: "Heat Transfer", icon: "🌡️" },
    { key: "reactions", label: "Reactions", icon: "🧫" },
    { key: "conditions", label: "Conditions", icon: "🎯" },
    { key: "equipment", label: "Equipment", icon: "🍳" },
    { key: "alchemy", label: "Alchemy", icon: "🔮" },
    { key: "recipes", label: "Aligned Recipes", icon: "🍱" },
  ];

  const renderRecipesTab = (method: (typeof currentMethods)[0]) => (
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-transparent/5 p-5 shadow-sm">
          <h4 className="text-sm font-bold text-gray-200 mb-2 flex items-center gap-2">
            <span>🍱</span> Current Moment Aligned Recipes
          </h4>
          <p className="text-xs text-gray-400 mb-4">Recipes using {method.name} that perfectly target current live thermodynamic constraints.</p>

          {isLoadingRecipes && <div className="text-sm text-gray-500 animate-pulse">Scanning recipe calculus...</div>}

          {!isLoadingRecipes && alignedRecipes.length === 0 && (
            <div className="text-sm text-gray-500">No perfectly aligned recipes found for this specific technique.</div>
          )}

          {!isLoadingRecipes && alignedRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {alignedRecipes.map(recipe => (
                <div key={recipe.id} className="group relative flex flex-col justify-between rounded-lg border border-white/5 bg-transparent/5 p-4 hover:border-purple-500/50 hover:bg-transparent/10 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-gray-200 text-sm">{recipe.name}</h5>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {Math.round(recipe.matchScore)}% Match
                      </span>
                    </div>
                    <div className="text-xs text-brand text-purple-400">{recipe.cuisine || "Global"}</div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {recipe.elementalProperties && (
                      <div className="flex gap-1">
                        {Object.entries(recipe.elementalProperties).map(([el, val]) => (
                          <span key={el} className="text-[10px] bg-black/40 px-1.5 rounded text-gray-400">{el} {Number(val).toFixed(2)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );

  // ============================================================================
  // RENDER: Overview Tab
  // ============================================================================
  const renderOverviewTab = (method: (typeof currentMethods)[0]) => {
    const { pillar, harmony, physicsMetrics: physics } = method;
    const pillarColors = pillar ? getPillarColors(pillar.id) : null;

    return (
      <div className="space-y-4">
        {/* Harmony Index + Transformation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Harmony Index */}
          <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-300 mb-3">Harmony Index</h4>
            <div className="flex items-center gap-5">
              <HarmonyRing value={harmony.harmonyIndex} size={80} />
              <div className="space-y-2 flex-1">
                <div className="text-lg font-bold text-gray-200">{harmony.label}</div>
                <div className="space-y-1">
                  {[
                    { n: "Stability", v: harmony.breakdown.stabilityResonance },
                    { n: "Intent", v: harmony.breakdown.intentAlignment },
                    { n: "Thermo", v: harmony.breakdown.thermoEfficiency },
                    { n: "Balance", v: harmony.breakdown.alchemicalBalance },
                    { n: "Speed", v: harmony.breakdown.speedFactor },
                    ...(harmony.breakdown.personalAlignment != null
                      ? [{ n: "Personal", v: harmony.breakdown.personalAlignment }]
                      : []),
                  ].map(({ n, v }) => (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-14 text-gray-500">{n}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(100, v)}%` }} />
                      </div>
                      <span className="w-8 text-right font-semibold text-gray-400">{Math.round(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Physical character.
              `[CHANGED 2026-08-16]` This card used to be "Transformation
              Overview" — Kalchm, Greg's Energy and a volatility badge. Those
              are correspondence quantities and now live in the Alchemy tab; the
              headline card leads with what the method physically does. */}
          <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-300 mb-3">Physical character</h4>
            {physics ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Paced by</div>
                  <div className="mt-0.5 text-sm font-bold capitalize text-gray-200">
                    {physics.rateLimiter.replace(/-/g, " ")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Medium</div>
                  <div className="mt-0.5 text-sm font-bold tabular-nums text-sky-300">
                    {Math.round(physics.medium.fahrenheit)}°F
                    <span className="ml-1 text-[11px] font-normal text-gray-500">
                      {Math.round(physics.medium.celsius)}°C
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Transfer coefficient</div>
                  <div className="mt-0.5 text-sm font-bold tabular-nums text-amber-300">
                    {physics.transfer ? (
                      <>
                        {physics.transfer.typical.toLocaleString()}
                        <span className="ml-1 text-[11px] font-normal text-gray-500">W·m⁻²·K⁻¹</span>
                      </>
                    ) : (
                      <span className="text-gray-500">not heat-limited</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Browning</div>
                  <div className="mt-0.5 text-sm font-bold text-gray-200">
                    {physics.browning.available ? "Reachable" : "Unreachable"}
                  </div>
                </div>
                {physics.reference.result && (
                  <div className="col-span-2 border-t border-white/5 pt-2">
                    <div className="text-xs text-gray-500">
                      25 mm slab, 5 °C → 60 °C core
                    </div>
                    <div className="mt-0.5 text-sm font-bold tabular-nums text-gray-200">
                      {physics.reference.result.minutes.toFixed(0)} min
                      {physics.reference.z !== null && (
                        <span className="ml-2 font-mono text-[11px] font-normal text-gray-500">
                          z = {physics.reference.z >= 0 ? "+" : ""}
                          {physics.reference.z.toFixed(2)} vs comparable methods
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {pillar && (
                  <div className="col-span-2">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${pillarColors?.bg} ${pillarColors?.text}`}>
                      Pillar #{pillar.id} {pillar.name}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No physics profile registered for this method.</p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {method.suitable_for && method.suitable_for.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-transparent p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-300 mb-2">Suitable For</h4>
              <div className="flex flex-wrap gap-1">
                {method.suitable_for.slice(0, 6).map((item, i) => (
                  <span key={i} className="rounded-md bg-green-50 px-2 py-0.5 text-xs text-green-700">{item}</span>
                ))}
              </div>
            </div>
          )}
          {method.benefits && method.benefits.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-transparent p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-300 mb-2">Benefits</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-400">
                {method.benefits.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {method.expertTips && method.expertTips.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-transparent p-4 shadow-sm">
              <h4 className="text-xs font-bold text-gray-300 mb-2">Expert Tips</h4>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-400">
                {method.expertTips.slice(0, 2).map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: Alchemy Tab
  //
  // Every metaphysical quantity on this surface lives here and nowhere else:
  // ESMS, Kalchm, Monica, Greg's Energy, the P=IV analogue, planetary hours and
  // lunar phases. They drive matching against the live sky and are genuinely
  // load-bearing for that — they are simply not statements about heat, and are
  // no longer presented next to numbers a cook would act on.
  // ============================================================================
  const renderAlchemyTab = (method: (typeof currentMethods)[0]) => {
    const { gregsEnergy, kalchm, monica, monicaClass, kinetics, kProfile, optimalConditions } = method;
    const thermo = method.thermodynamicProperties;
    const kalchmFmt = formatKalchm(kalchm);
    const metrics = thermo
      ? [
        { name: "Heat", value: thermo.heat, icon: "🔥", color: "bg-red-500", desc: "Active energy" },
        { name: "Entropy", value: thermo.entropy, icon: "🌀", color: "bg-orange-500", desc: "System disorder" },
        { name: "Reactivity", value: thermo.reactivity, icon: "⚡", color: "bg-pink-500", desc: "Change potential" },
      ]
      : [];

    return (
      <div className="space-y-4">
        {/* Standing disclaimer — the sequestration only works if it is stated. */}
        <div className="rounded-xl border border-violet-400/25 bg-violet-500/[0.06] p-4">
          <h4 className="text-sm font-bold text-violet-200">Alchemical layer</h4>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-400">
            These are dimensionless correspondence quantities derived from the live planetary positions and
            the method&apos;s alchemical pillar. They rank how a method resonates with the current sky, which
            is what drives recommendation order. They are <strong className="text-gray-300">not</strong>{" "}
            thermodynamic measurements and set no temperature, time or equipment choice — those live in the
            Heat Transfer and Conditions tabs, from published physics.
          </p>
        </div>

        {metrics.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-300 mb-1">Heat · Entropy · Reactivity</h4>
            <p className="mb-4 text-[11px] text-gray-500">
              Elemental scalars on a 0–1 scale, not calories or joules.
            </p>
            <div className="space-y-3">
              {metrics.map(({ name, value, icon, color, desc }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{icon}</span>
                  <div className="w-20">
                    <div className="text-sm font-bold text-gray-300">{name}</div>
                    <div className="text-[10px] text-gray-400">{desc}</div>
                  </div>
                  <div className="flex-1">
                    {/* The label sits OUTSIDE the track. Centring it over the
                        full track put the glyphs half on the fill and half off
                        it, so at 55 % the "%" appeared to fall out of the bar. */}
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${color} transition-all duration-500 rounded-full`} style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold tabular-nums text-gray-400">
                    {value.toFixed(3)}
                    <span className="ml-1 text-[10px] text-gray-600">{(value * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Derived Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-transparent p-4 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Greg&apos;s Energy</div>
            <div className={`text-2xl font-black tabular-nums ${gregsEnergy >= 0 ? "text-green-500" : "text-red-500"}`}>
              {gregsEnergy >= 0 ? "+" : ""}{gregsEnergy.toFixed(3)}
            </div>
            <div className="text-[10px] text-gray-400 mt-1">H − (S × R)</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-transparent p-4 shadow-sm text-center overflow-hidden">
            <div className="text-xs text-gray-500 mb-1">Kalchm</div>
            <div className="text-2xl font-black tabular-nums text-purple-400 break-all">{kalchmFmt.display}</div>
            <div className="text-[10px] text-gray-400 mt-1">
              Equilibrium K{kalchmFmt.lnK !== null && <> · ln K = {kalchmFmt.lnK}</>}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-transparent p-4 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">Monica</div>
            <div className={`text-xl font-black tabular-nums ${monicaClass.color}`}>
              {monica !== null && !isNaN(monica) ? monica.toFixed(3) : "N/A"}
            </div>
            <div className="mt-1"><VolatilityBadge monica={monica} /></div>
          </div>
        </div>

        {/* ESMS */}
        <div className="rounded-xl border border-purple-400/25 bg-transparent p-5 shadow-sm">
          <h4 className="text-sm font-bold text-gray-300 mb-3">Alchemical Matrix (ESMS)</h4>
          <div className="grid grid-cols-4 gap-3">
            {[
              { name: "Spirit", value: method.alchemicalProperties.Spirit, color: "bg-yellow-400", icon: "✨" },
              { name: "Essence", value: method.alchemicalProperties.Essence, color: "bg-blue-400", icon: "💫" },
              { name: "Matter", value: method.alchemicalProperties.Matter, color: "bg-green-500", icon: "🌿" },
              { name: "Substance", value: method.alchemicalProperties.Substance, color: "bg-purple-400", icon: "🔮" },
            ].map(({ name, value, color, icon }) => (
              <div key={name} className="text-center">
                <div className="text-lg">{icon}</div>
                <div className="text-xs font-semibold text-gray-400 mt-1">{name}</div>
                <div className="text-lg font-black tabular-nums text-gray-200">{value.toFixed(2)}</div>
                <div className="mt-1 mx-auto h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(0, Math.min(100, ((value + 5) / 10) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
          {method.pillar && (
            <div className="mt-3 text-center text-xs text-gray-500">
              Pillar Effects: {Object.entries(method.pillar.effects).map(([p, v]) => `${p} ${(v) > 0 ? "+" : ""}${v}`).join(", ")}
            </div>
          )}
        </div>

        {/* Celestial timing — sequestered here, away from the physical conditions. */}
        {optimalConditions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
              <div className="text-xs font-bold text-gray-300 mb-2">Best Planetary Hours</div>
              <div className="flex flex-wrap gap-1.5">
                {optimalConditions.planetaryHours.map((p) => (
                  <span key={p} className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 border border-amber-400/25">{p}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
              <div className="text-xs font-bold text-gray-300 mb-2">Lunar Phases</div>
              <div className="flex flex-wrap gap-1.5">
                {optimalConditions.lunarPhases.map((ph) => (
                  <span key={ph} className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300 border border-indigo-400/25">{ph.replace("_", " ")}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {method.pillar && (
          <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
            <h4 className="text-xs font-bold text-gray-300 mb-2">Pillar #{method.pillar.id} · {method.pillar.name}</h4>
            <p className="text-xs text-gray-400">{method.pillar.description}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              {method.pillar.planetaryAssociations && <span>Planets: {method.pillar.planetaryAssociations.join(", ")}</span>}
              {method.pillar.tarotAssociations && <span>Tarot: {method.pillar.tarotAssociations.join(", ")}</span>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {kProfile && (
            <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
              <h4 className="text-sm font-bold text-gray-300 mb-1">Circuit analogue — method profile</h4>
              {/* `[FIXED 2026-08-16]` These six were labelled "Voltage / Current /
                  Resistance" in volts, amps and ohms next to a panel labelling
                  DIFFERENT numbers with the same units — the profile inputs and
                  the sky-modulated outputs both claimed to be "V" and "I", and
                  disagreed (0.95 vs 0.705). They are dimensionless 0–1 weights
                  in an electrical ANALOGY, and are now named as such. */}
              <p className="mb-3 text-[11px] text-gray-500">
                Dimensionless 0–1 weights, not volts or amps. Real heat transfer is in the Heat Transfer tab.
              </p>
              <div className="flex justify-center">
                <KineticRadar profile={kProfile} size={180} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Drive", value: kProfile.voltage },
                  { label: "Transfer", value: kProfile.current },
                  { label: "Impedance", value: kProfile.resistance },
                  { label: "Velocity", value: kProfile.velocityFactor },
                  { label: "Carry-over", value: kProfile.momentumRetention },
                  { label: "Structural", value: kProfile.forceImpact },
                ].map(({ label, value }) => (
                  <div key={label} className="text-xs">
                    <div className="text-gray-500">{label}</div>
                    <div className="font-bold tabular-nums text-gray-300">{value.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kinetics && (
            <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
              <h4 className="text-sm font-bold text-gray-300 mb-1">Circuit analogue — sky-modulated</h4>
              <p className="mb-3 text-[11px] text-gray-500">
                The profile above after the live planetary positions act on it. Different quantities from the
                profile, deliberately — that is what the modulation does.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  // Labelled P = I·V·(1−R) because that is what the code computes
                  // (`cookingMethodKinetics.ts`); it was captioned "P=IV", which
                  // the resistance term makes false.
                  { label: "Power  I·V·(1−R)", value: kinetics.power, color: "text-indigo-400" },
                  { label: "Force magnitude", value: kinetics.forceMagnitude, color: "text-pink-400" },
                  { label: "Charge", value: kinetics.charge, color: "text-green-400" },
                  { label: "Drive (modulated)", value: kinetics.potentialDifference, color: "text-blue-400" },
                  { label: "Transfer (modulated)", value: kinetics.currentFlow, color: "text-amber-400" },
                  { label: "Inertia", value: kinetics.inertia, color: "text-gray-400" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="text-[10px] text-gray-500">{label}</div>
                    <div className={`text-lg font-black tabular-nums ${color}`}>{value.toFixed(3)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${kinetics.forceClassification === "accelerating" ? "bg-green-100 text-green-700"
                  : kinetics.forceClassification === "balanced" ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                  }`}>{kinetics.forceClassification}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${kinetics.thermalDirection === "heating" ? "bg-red-100 text-red-700"
                  : kinetics.thermalDirection === "cooling" ? "bg-blue-100 text-blue-700"
                    : "bg-white/10 text-gray-300"
                  }`}>
                  {kinetics.thermalDirection === "heating" ? "🔥" : kinetics.thermalDirection === "cooling" ? "❄️" : "➖"} {kinetics.thermalDirection}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Elemental Flow */}
        {kinetics && (
          <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
            <h4 className="text-sm font-bold text-gray-300 mb-3">Elemental Flow</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["Fire", "Water", "Earth", "Air"] as const).map((el) => {
                const icons: Record<string, string> = { Fire: "🔥", Water: "💧", Earth: "🌍", Air: "💨" };
                const colors: Record<string, string> = { Fire: "bg-red-400", Water: "bg-blue-400", Earth: "bg-amber-600", Air: "bg-sky-300" };
                const v = kinetics.velocity[el];
                const m = kinetics.momentum[el];
                const f = kinetics.force[el];
                return (
                  <div key={el} className="text-center p-3 rounded-lg bg-white/5">
                    <div className="text-xl">{icons[el]}</div>
                    <div className="text-xs font-bold text-gray-300 mt-1">{el}</div>
                    <div className="mt-2 space-y-1">
                      {[
                        { label: "vel", value: v },
                        { label: "mom", value: m },
                        { label: "frc", value: f },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center gap-1 text-[10px]">
                          <span className="text-gray-400 w-6">{label}</span>
                          <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[el]} rounded-full`} style={{ width: `${Math.min(100, value * 200)}%` }} />
                          </div>
                          <span className="text-gray-500 w-8 text-right">{value.toFixed(2)}</span>
                        </div>
                      ))}
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
  //
  // `[FIXED 2026-08-16]` This tab used to lead with a computed "optimal
  // temperature" of `200 + heat × 300 + monicaAdjustment`, where `heat` is an
  // elemental scalar and the adjustment is a step function of the Monica
  // constant. Across all 26 servable methods that put 23 of them OUTSIDE the
  // published envelope printed directly beneath it — cryogenic cooking at
  // +240 °F against a −321…32 °F envelope, fermentation at +285 °F against
  // 55–95 °F. The envelope, the per-ingredient targets and the environmental
  // corrections are now the whole tab; nothing alchemical sets a temperature.
  // Reproduce the old behaviour with `scripts/audit-cooking-method-physics.ts`.
  // ============================================================================
  const renderConditionsTab = (method: (typeof currentMethods)[0]) => {
    const reference = method.referenceProfile as MethodPhysicalReference | undefined;
    if (!method.physicsMetrics) {
      return (
        <p className="py-8 text-center text-sm text-gray-500">
          No physics profile registered for this method.
        </p>
      );
    }
    return (
      <ConditionsTab
        metrics={method.physicsMetrics}
        reference={reference}
        optimalTemperatures={(method as { optimalTemperatures?: Record<string, number> }).optimalTemperatures}
      />
    );
  };

  // ============================================================================
  // RENDER: Heat Transfer, Reactions, Equipment
  //
  // All three read only from `src/lib/cooking/*`. A missing physics profile is
  // reported as missing rather than filled with defaults — a coverage test
  // (`cookingMethodPhysicsCoverage.test.ts`) asserts every servable method has
  // one, so this branch means a genuine registry gap.
  // ============================================================================
  const renderMissingPhysics = (name: string) => (
    <p className="py-8 text-center text-sm text-gray-500">
      No physics profile registered for {name}.
    </p>
  );

  const renderPhysicsTab = (method: (typeof currentMethods)[0]) =>
    method.physicsMetrics ? (
      <div className="space-y-4">
        <PhysicsTab metrics={method.physicsMetrics} />
        <CookTimeExplorer metrics={method.physicsMetrics} />
      </div>
    ) : (
      renderMissingPhysics(method.name)
    );

  const renderReactionsTab = (method: (typeof currentMethods)[0]) =>
    method.physicsMetrics ? (
      <ReactionsTab
        metrics={method.physicsMetrics}
        reference={method.referenceProfile}
      />
    ) : (
      renderMissingPhysics(method.name)
    );

  const renderEquipmentTab = (method: (typeof currentMethods)[0]) => (
    <div className="space-y-4">
      {method.physicsMetrics ? (
        <EquipmentPhysicsPanel metrics={method.physicsMetrics} />
      ) : (
        renderMissingPhysics(method.name)
      )}
      {method.toolsRequired && method.toolsRequired.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 shadow-sm">
          <h4 className="text-sm font-bold text-gray-200">Tools this method needs</h4>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {method.toolsRequired.map((tool, i) => (
              <span key={i} className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-300">
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
      <CookingEquipmentPanel methodKey={method.id} methodName={method.name} />
    </div>
  );

  // ============================================================================
  // RENDER: Compare Delta View
  // ============================================================================
  const renderCompareView = () => {
    if (!compareData) {
      return (
        <div className="rounded-xl border-2 border-dashed border-indigo-200 p-8 text-center">
          <p className="text-gray-500">Select exactly 2 methods to compare by clicking on their cards.</p>
          <p className="text-xs text-gray-400 mt-1">Selected: {compareSelections.length}/2</p>
        </div>
      );
    }

    const { a, b } = compareData;

    const deltaRow = (label: string, aVal: number, bVal: number, fmt = (v: number) => v.toFixed(3)) => {
      const diff = bVal - aVal;
      return (
        <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
          <span className="w-32 text-xs font-medium text-gray-400">{label}</span>
          <span className="w-20 text-right text-sm font-bold text-gray-300">{fmt(aVal)}</span>
          <span className={`w-20 text-center text-xs font-bold ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-400"}`}>
            {diff > 0 ? "+" : ""}{fmt(diff)}
          </span>
          <span className="w-20 text-right text-sm font-bold text-gray-300">{fmt(bVal)}</span>
        </div>
      );
    };

    return (
      <div className="rounded-xl border border-indigo-200 bg-transparent p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-100">Delta View</h3>
          <button onClick={() => { setCompareMode(false); setCompareSelections([]); }}
            className="text-xs text-gray-400 hover:text-gray-400">Close Compare</button>
        </div>

        {/* Headers */}
        <div className="flex items-center gap-3 pb-2 border-b border-white/10">
          <span className="w-32" />
          <span className="w-20 text-right text-xs font-bold text-indigo-600 capitalize">{a.name}</span>
          <span className="w-20 text-center text-xs font-bold text-gray-400">Δ Delta</span>
          <span className="w-20 text-right text-xs font-bold text-indigo-600 capitalize">{b.name}</span>
        </div>

        {deltaRow("Harmony Index", a.harmony.harmonyIndex, b.harmony.harmonyIndex, v => `${Math.round(v)}%`)}
        {deltaRow("Monica (Mᴄ)", a.monica ?? 0, b.monica ?? 0)}
        {deltaRow("Greg's Energy", a.gregsEnergy, b.gregsEnergy)}
        {deltaRow("Kalchm (K)", a.kalchm ?? 0, b.kalchm ?? 0)}
        {deltaRow("Heat", a.thermodynamicProperties?.heat ?? 0, b.thermodynamicProperties?.heat ?? 0)}
        {deltaRow("Entropy", a.thermodynamicProperties?.entropy ?? 0, b.thermodynamicProperties?.entropy ?? 0)}
        {deltaRow("Reactivity", a.thermodynamicProperties?.reactivity ?? 0, b.thermodynamicProperties?.reactivity ?? 0)}
        {deltaRow("Power (P=IV)", a.kinetics?.power ?? 0, b.kinetics?.power ?? 0)}

        {/* Side-by-side Spider Charts */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <h4 className="text-xs font-bold text-gray-400 mb-2 capitalize">{a.name}</h4>
            <div className="flex justify-center">
              <ElementalSpider effect={a.elementalEffect as unknown as Record<string, number>} size={120} />
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-xs font-bold text-gray-400 mb-2 capitalize">{b.name}</h4>
            <div className="flex justify-center">
              <ElementalSpider effect={b.elementalEffect as unknown as Record<string, number>} size={120} />
            </div>
          </div>
        </div>
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
        <h2 className="text-3xl md:text-4xl font-black text-gray-100">Cooking Methods</h2>
        <p className="text-gray-500 mt-1">Alchemical Transformation System · Harmony Index · 14 Pillars</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${positionsSource === "real" ? "bg-green-100 text-green-700" : "bg-white/10 text-gray-400"
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

      {/* Current Moment Panel */}
      <div className="rounded-xl border border-white/10 bg-transparent p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-sm font-bold text-gray-200">Current Moment Metrics</h3>
          <span className="flex items-center gap-2">
            {userBias && (
              <span className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-violet-500/15 text-violet-300">
                {biasSource === "chart" ? "Tuned to your chart" : "Tuned to your table"}
              </span>
            )}
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${momentStatus === "ready" ? "bg-emerald-100 text-emerald-700" : momentStatus === "loading" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              }`}>
              {momentStatus === "ready" ? "LIVE /api/alchm-quantities" : momentStatus === "loading" ? "Loading..." : "Unavailable"}
            </span>
          </span>
        </div>
        {currentMoment ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
              <div className="font-bold text-purple-800 mb-1">ESMS</div>
              <div className="text-gray-300">S {currentMoment.quantities.Spirit.toFixed(2)}</div>
              <div className="text-gray-300">E {currentMoment.quantities.Essence.toFixed(2)}</div>
              <div className="text-gray-300">M {currentMoment.quantities.Matter.toFixed(2)}</div>
              <div className="text-gray-300">Su {currentMoment.quantities.Substance.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="font-bold text-amber-800 mb-1">Elemental</div>
              <div className="text-gray-300">🔥 {currentMoment.circuit.elementalBalance.Fire.toFixed(3)}</div>
              <div className="text-gray-300">💧 {currentMoment.circuit.elementalBalance.Water.toFixed(3)}</div>
              <div className="text-gray-300">🌍 {currentMoment.circuit.elementalBalance.Earth.toFixed(3)}</div>
              <div className="text-gray-300">💨 {currentMoment.circuit.elementalBalance.Air.toFixed(3)}</div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
              <div className="font-bold text-rose-800 mb-1">Thermodynamic</div>
              <div className="text-gray-300">Heat {currentMoment.heat.toFixed(3)}</div>
              <div className="text-gray-300">Entropy {currentMoment.entropy.toFixed(3)}</div>
              <div className="text-gray-300">Reactivity {currentMoment.reactivity.toFixed(3)}</div>
              <div className="text-gray-300">Monica {currentMoment.monica.toFixed(3)}</div>
            </div>
            <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
              <div className="font-bold text-cyan-800 mb-1">Kinetic / Circuit</div>
              <div className="text-gray-300">Power {currentMoment.circuit.power.toFixed(4)}</div>
              <div className="text-gray-300">Force {currentMoment.circuit.forceMagnitude.toFixed(4)}</div>
              <div className="text-gray-300">State {currentMoment.circuit.forceClassification}</div>
              <div className="text-gray-300">Thermal {currentMoment.circuit.thermalDirection}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Using planetary fallback values while current-moment metrics load.</p>
        )}
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setExpandedMethod(null); setCompareSelections([]); }}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all duration-200 ${selectedCategory === cat.id
              ? "bg-gray-900 text-white shadow-lg scale-105"
              : "bg-transparent text-gray-300 border border-white/10 hover:border-gray-400 hover:shadow"
              }`}
          >
            <span className="mr-1.5">{cat.icon}</span>{cat.name}
          </button>
        ))}
      </div>

      {/* Controls: Focus dropdown + Intent + Compare toggle */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-transparent rounded-xl border border-white/10 p-4 shadow-sm">
        {/* Focus dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="cooking-method-focus" className="text-xs font-semibold text-gray-500">Focus:</label>
          <select
            id="cooking-method-focus"
            value={focusMode}
            onChange={(e) => setFocusMode(e.target.value as FocusMode)}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-sm font-medium text-gray-300 shadow-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
          >
            {FOCUS_OPTIONS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* User Intent chips */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Intent:</span>
          <div className="flex gap-1">
            {INTENT_OPTIONS.map(({ key, label, icon }) => (
              <button
                key={label}
                onClick={() => setUserIntent(key)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${userIntent === key
                  ? "bg-indigo-100 text-indigo-700 shadow-sm ring-1 ring-indigo-300"
                  : "text-gray-500 hover:bg-white/10"
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Compare toggle */}
        <button
          onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareSelections([]); }}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${compareMode
            ? "bg-indigo-600 text-white shadow-md"
            : "bg-white/10 text-gray-400 hover:bg-gray-200"
            }`}
        >
          {compareMode ? "✔ Compare On" : "↔ Compare"}
        </button>
      </div>

      {/* Category subtitle */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-3xl">{category?.icon}</span>
        <div>
          <h3 className="text-xl font-bold text-gray-100">{category?.name} Methods</h3>
          <p className="text-xs text-gray-500">
            {currentMethods.length} methods · Focus: {FOCUS_OPTIONS.find(f => f.key === focusMode)?.label}
            {userIntent && ` · Intent: ${userIntent}`}
          </p>
        </div>
      </div>

      {/* Compare Delta View */}
      {compareMode && renderCompareView()}

      {/* Methods */}
      <div className="space-y-4">
        {currentMethods.map((method, idx) => {
          if (!method) return null;
          const isExpanded = expandedMethod === method.id;
          const isCompareSelected = compareSelections.includes(method.id);
          const pillarColors = method.pillar ? getPillarColors(method.pillar.id) : null;

          return (
            <div
              key={method.id}
              className={`rounded-xl border transition-all duration-300 ${isCompareSelected
                ? "border-2 border-indigo-400 shadow-lg bg-indigo-50/30"
                : isExpanded
                  ? `border-2 ${pillarColors?.border || "border-purple-300"} shadow-xl bg-gradient-to-br from-gray-50 to-white`
                  : "border-white/10 bg-transparent hover:border-white/10 hover:shadow-md"
                }`}
            >
              {/* -- Collapsed Card (always visible) -- */}
              <div
                className="cursor-pointer p-5"
                onClick={() => toggleMethod(method.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleMethod(method.id);
                  }
                }}
                onDoubleClick={() => onDoubleClickMethod?.(method.name)}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <div className="flex items-start gap-4">
                  {/* Rank badge */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-gray-500">
                    {idx + 1}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold capitalize text-gray-100">{method.name}</h4>
                      {method.culinaryArchetype && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white/10 text-gray-400 italic">
                          {method.culinaryArchetype}
                        </span>
                      )}
                      {method.pillar && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pillarColors?.bg} ${pillarColors?.text}`}>
                          #{method.pillar.id}
                        </span>
                      )}
                      <VolatilityBadge monica={method.monica} />
                    </div>

                    {/* Alchemist's Hook */}
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1 italic">
                      {method.shortDescription || method.description}
                    </p>

                    {/* Key metrics row.
                        `[CHANGED 2026-08-16]` This row used to read
                        "⚡ −12.92 · ⚙️ P=0.28 · 🌡️ 87% thermo · ⚡ 77% kinetic" —
                        four alchemical scores in the most-read line on the card,
                        two of them wearing physics units they do not have. It now
                        leads with what the method physically does; the alchemical
                        scores are one tab away, labelled as such. */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3">
                      <HarmonyRing value={method.harmony.harmonyIndex} size={40} />
                      <span className="text-xs text-gray-500">⏱️ {formatDuration(method)}</span>
                      {method.physicsMetrics && (
                        <>
                          <span className="text-xs font-semibold text-sky-400">
                            🌡️ {Math.round(method.physicsMetrics.medium.fahrenheit)}°F medium
                          </span>
                          {method.physicsMetrics.transfer && (
                            <span
                              className="text-xs font-semibold text-amber-400"
                              title={method.physicsMetrics.transfer.regime}
                            >
                              ⇄ h={method.physicsMetrics.transfer.typical.toLocaleString()}
                              {method.physicsMetrics.transfer.z !== null && (
                                <span className="ml-1 font-normal text-gray-500">
                                  z{method.physicsMetrics.transfer.z >= 0 ? "+" : ""}
                                  {method.physicsMetrics.transfer.z.toFixed(1)}
                                </span>
                              )}
                            </span>
                          )}
                          {method.physicsMetrics.reference.result && (
                            <span className="text-xs font-semibold text-emerald-400">
                              ◷ {method.physicsMetrics.reference.result.minutes.toFixed(0)} min to core
                            </span>
                          )}
                          {method.physicsMetrics.browning.available && (
                            <span className="text-xs font-semibold text-orange-400">🥖 browns</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Spider Chart (elemental quadrant map) */}
                  <div className="hidden md:block flex-shrink-0">
                    <ElementalSpider effect={method.elementalEffect as unknown as Record<string, number>} size={80} />
                  </div>
                </div>
              </div>

              {/* -- Expanded View -- */}
              {isExpanded && !compareMode && (
                <div className="border-t border-white/10 px-5 pb-5">
                  {/* Tab bar */}
                  <div className="flex gap-1 py-3 border-b border-gray-100 mb-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={(e) => { e.stopPropagation(); setExpandedTab(tab.key); }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${expandedTab === tab.key
                          ? "bg-gray-900 text-white shadow"
                          : "text-gray-500 hover:bg-white/10"
                          }`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  {expandedTab === "overview" && renderOverviewTab(method)}
                  {expandedTab === "physics" && renderPhysicsTab(method)}
                  {expandedTab === "reactions" && renderReactionsTab(method)}
                  {expandedTab === "conditions" && renderConditionsTab(method)}
                  {expandedTab === "equipment" && renderEquipmentTab(method)}
                  {expandedTab === "alchemy" && renderAlchemyTab(method)}
                  {expandedTab === "recipes" && renderRecipesTab(method)}
                </div>
              )}

              {/* Expand indicator */}
              {!compareMode && (
                <div className="text-center pb-2">
                  <span className="text-[10px] text-gray-400">
                    {isExpanded ? "▲ collapse" : "▼ expand"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        Alchemical Cooking System · Harmony Index · 14 Pillars · ESMS · P=IV Kinetics · Monica Constants
      </div>
    </div>
  );
}
