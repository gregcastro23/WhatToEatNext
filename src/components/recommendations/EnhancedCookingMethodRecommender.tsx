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
  Chip,
  Divider,
  ELEMENT_ACCENT,
  elementAccent,
  HarmonyRing,
  InstrumentLabel,
  Readout,
} from "@/components/recommendations/instrument";
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
import { elementalSignature } from "@/utils/elemental/signature";
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
    const position = contextPositions[planet] ?? contextPositions[planet.toLowerCase()];
    normalized[planet] = extractZodiacSignType(position);
  }
  return normalized;
}

/**
 * Volatility band for the Monica constant.
 *
 * `[CHANGED]` These were `bg-red-100` / `text-red-700` pairs — Tailwind's
 * light-mode ramp, which on `#07060B` rendered as bright pastel lozenges with
 * near-black text. Each band is now a tinted border over a 10% wash of its own
 * hue, which is the chip grammar used everywhere else on this surface.
 */
function classifyMonica(monica: number | null): { label: string; color: string; bgColor: string; badgeColor: string } {
  if (monica === null || isNaN(monica))
    return { label: "Undefined", color: "text-alchm-fg-mute", bgColor: "border-alchm-line-hi bg-white/[0.03]", badgeColor: "bg-alchm-fg-faint" };
  if (monica > 10)
    return { label: "Highly Volatile", color: "text-red-300", bgColor: "border-red-400/35 bg-red-500/10", badgeColor: "bg-red-400" };
  if (monica > 5)
    return { label: "Volatile", color: "text-orange-300", bgColor: "border-orange-400/35 bg-orange-500/10", badgeColor: "bg-orange-400" };
  if (monica > 2)
    return { label: "Transformative", color: "text-amber-300", bgColor: "border-amber-400/35 bg-amber-500/10", badgeColor: "bg-amber-400" };
  if (monica > 1)
    return { label: "Balanced", color: "text-emerald-300", bgColor: "border-emerald-400/35 bg-emerald-500/10", badgeColor: "bg-emerald-400" };
  if (monica > 0.5)
    return { label: "Stable", color: "text-sky-300", bgColor: "border-sky-400/35 bg-sky-500/10", badgeColor: "bg-sky-400" };
  return { label: "Very Stable", color: "text-indigo-300", bgColor: "border-indigo-400/35 bg-indigo-500/10", badgeColor: "bg-indigo-400" };
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

/**
 * Per-pillar accent.
 *
 * `[CHANGED]` The 14 entries were `bg-*-50` / `text-*-800` / `border-*-300` —
 * fourteen pale chips on a near-black page. Each is now the same hue expressed
 * as a 10% wash plus a 35% border, so the pillar identity survives without any
 * surface going light. `accent` is unchanged: it is consumed as a raw SVG
 * stroke, where it was already dark-safe.
 */
function getPillarColors(pillarId: number) {
  const map: Record<number, { bg: string; text: string; border: string; accent: string }> = {
    1: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-400/35", accent: "#3b82f6" },
    2: { bg: "bg-cyan-500/10", text: "text-cyan-300", border: "border-cyan-400/35", accent: "#06b6d4" },
    3: { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-400/35", accent: "#0ea5e9" },
    4: { bg: "bg-indigo-500/10", text: "text-indigo-300", border: "border-indigo-400/35", accent: "#6366f1" },
    5: { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-400/35", accent: "#a855f7" },
    6: { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-400/35", accent: "#eab308" },
    7: { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-400/35", accent: "#ef4444" },
    8: { bg: "bg-green-500/10", text: "text-green-300", border: "border-green-400/35", accent: "#22c55e" },
    9: { bg: "bg-teal-500/10", text: "text-teal-300", border: "border-teal-400/35", accent: "#14b8a6" },
    10: { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-400/35", accent: "#f97316" },
    11: { bg: "bg-pink-500/10", text: "text-pink-300", border: "border-pink-400/35", accent: "#ec4899" },
    12: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-400/35", accent: "#10b981" },
    13: { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-400/35", accent: "#8b5cf6" },
    14: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-400/35", accent: "#f59e0b" },
  };
  return map[pillarId] || { bg: "bg-white/[0.03]", text: "text-alchm-fg-dim", border: "border-alchm-line-hi", accent: "#6E6884" };
}

// ============================================================================
// SVG Spider Chart — Elemental Quadrant Map
// ============================================================================

/**
 * `[CHANGED]` Both charts drew their rings and spokes in `#e5e7eb` / `#d1d5db`
 * — Tailwind's grey-200/300, chosen for a white page. On `#07060B` those are
 * near-white, so the graticule out-shouted the data polygon it was meant to
 * sit behind. Rings and spokes are now white at 8–14%, which is the same
 * hairline weight the panels use, and the axis dots carry the colour.
 */
const CHART_RING = "rgba(255,255,255,0.14)";
const CHART_SPOKE = "rgba(255,255,255,0.22)";

function ElementalSpider({ effect, size = 100 }: { effect: Record<string, number>; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const axes = [
    { key: "Fire", label: "🔥", value: effect.Fire || 0, color: ELEMENT_ACCENT.Fire },
    { key: "Air", label: "💨", value: effect.Air || 0, color: ELEMENT_ACCENT.Air },
    { key: "Water", label: "💧", value: effect.Water || 0, color: ELEMENT_ACCENT.Water },
    { key: "Earth", label: "🌍", value: effect.Earth || 0, color: ELEMENT_ACCENT.Earth },
  ];
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  const points = axes.map((a, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return {
      x: cx + r * a.value * Math.cos(angle),
      y: cy + r * a.value * Math.sin(angle),
      // `[FIXED]` The label radius was a FIXED `r + 14`. At the 80 px size this
      // chart is actually rendered at, r is 30.4, so labels landed at ±4.4 —
      // outside the `0 0 80 80` viewBox on all four axes, and every one of them
      // was clipped away. Measured in the DOM: x = -4.4 and 84.4, y = -4.4 and
      // 84.4. Scaling the offset with the chart keeps them inside at any size.
      lx: cx + (r + size * 0.09) * Math.cos(angle),
      ly: cy + (r + size * 0.09) * Math.sin(angle),
      ...a,
    };
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(" ");
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {rings.map(ring => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => {
            const angle = -Math.PI / 2 + i * angleStep;
            return `${cx + r * ring * Math.cos(angle)},${cy + r * ring * Math.sin(angle)}`;
          }).join(" ")}
          fill="none" stroke={CHART_RING} strokeWidth="0.5"
        />
      ))}
      {axes.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke={CHART_SPOKE} strokeWidth="0.5" />;
      })}
      <polygon points={polygon} fill="rgba(192, 140, 255, 0.18)" stroke="#C08CFF" strokeWidth="1.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill={p.color} />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="text-[10px]" fill={p.color}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

/**
 * Two elemental signatures on ONE graticule.
 *
 * The compare view previously drew two separate spiders side by side, which
 * makes the reader estimate a difference across a gap — the one thing a shared
 * axis exists to prevent. Solid trace is the left method, dashed is the right,
 * matching the legend beneath it.
 */
const SPIDER_AXES = ["Fire", "Air", "Water", "Earth"] as const;

function ElementalSpiderCompare({
  a,
  b,
  accentA,
  accentB,
  size = 160,
}: {
  a: Record<string, number>;
  b: Record<string, number>;
  accentA: string;
  accentB: string;
  size?: number;
}): React.ReactElement {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const angleStep = (2 * Math.PI) / SPIDER_AXES.length;
  const angleAt = (i: number) => -Math.PI / 2 + i * angleStep;

  const trace = (effect: Record<string, number>) =>
    SPIDER_AXES.map((key, i) => {
      const value = effect[key] || 0;
      return `${cx + r * value * Math.cos(angleAt(i))},${cy + r * value * Math.sin(angleAt(i))}`;
    }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Elemental signatures compared">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={SPIDER_AXES.map((_, i) => `${cx + r * ring * Math.cos(angleAt(i))},${cy + r * ring * Math.sin(angleAt(i))}`).join(" ")}
          fill="none"
          stroke={CHART_RING}
          strokeWidth="0.5"
        />
      ))}
      {SPIDER_AXES.map((key, i) => (
        <g key={key}>
          <line x1={cx} y1={cy} x2={cx + r * Math.cos(angleAt(i))} y2={cy + r * Math.sin(angleAt(i))} stroke={CHART_SPOKE} strokeWidth="0.5" />
          <text
            x={cx + (r + 16) * Math.cos(angleAt(i))}
            y={cy + (r + 16) * Math.sin(angleAt(i))}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={ELEMENT_ACCENT[key]}
            className="font-mono text-[9px] uppercase"
          >
            {key}
          </text>
        </g>
      ))}
      <polygon points={trace(a)} fill={`${accentA}22`} stroke={accentA} strokeWidth="1.5" />
      <polygon points={trace(b)} fill="none" stroke={accentB} strokeWidth="1.5" strokeDasharray="4 2" />
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
          fill="none" stroke={CHART_RING} strokeWidth="0.5"
        />
      ))}
      {axes.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke={CHART_SPOKE} strokeWidth="0.5" />;
      })}
      <polygon points={polygon} fill="rgba(192, 140, 255, 0.2)" stroke="#C08CFF" strokeWidth="1.5" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.5" fill="#C08CFF" />
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" className="fill-alchm-fg-mute text-[8px] font-bold">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ============================================================================
// Volatility Badge
// ============================================================================

function VolatilityBadge({ monica }: { monica: number | null }) {
  const cls = classifyMonica(monica);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.08em] ${cls.bgColor} ${cls.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cls.badgeColor}`} />
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

    const methods = Object.entries(category.methods).flatMap(([id, method]) => {
      // Thermodynamics gate — FIRST, because everything below it is scored.
      //
      // `[MEASURED 2026-08-17]` This chain used to end in
      // `|| { heat: 0.5, entropy: 0.5, reactivity: 0.5 }`. Those literals fed
      // monica, kinetics, and calculateHarmonyIndex — whose harmonyIndex is
      // the sort key at the bottom of this memo — so a method with no
      // thermodynamic data would have been ranked as though it were exactly
      // average in every dimension. The same absence was already handled
      // honestly three other times in this file (optimalConditions below,
      // the Alchemy panel, and the compare view's em dashes); line 669 was
      // the lone outlier, and the only one that moved list position.
      //
      // A ranking cannot honestly place an item it cannot score, so an
      // un-scoreable method is omitted rather than given invented merit.
      // This is a guard, not a code path in use: all 26 methods across all
      // five registries carry their own thermodynamicProperties, which
      // `methodRankingProvenance.test.ts` enforces — the registries are
      // handed in through an `as Record<string, MethodData>` cast, so the
      // optional field on MethodData cannot enforce it at compile time.
      const methodThermo = method.thermodynamicProperties ?? getCookingMethodThermodynamics(id);
      if (!methodThermo) return [];

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

      // `thermoAlignmentScore` and `kineticAlignmentScore` were computed here
      // and returned on every method object, and NOTHING ever read either one
      // (verified repo-wide: the only occurrences were this computation and
      // the property). Their supporting `projHeat`/`projEntropy`/
      // `projReactivity` projections and the two power proxies went with them.
      // Computed-but-never-rendered scores read as coverage on inspection
      // while proving nothing, so they are gone rather than wired up: neither
      // had a designed place in the UI.

      // Calculate Harmony Index via Resonance Gap model
      const duration = method.duration ?? method.time_range;
      const harmony = calculateHarmonyIndex(
        {
          transformedESMS,
          elementalEffect: method.elementalEffect,
          thermodynamics: methodThermo,
          gregsEnergy,
          kalchm,
          monica,
          duration: duration ?? undefined,
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

      return [{
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
      }];
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
    const t = method.duration ?? method.time_range;
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
                    <div className="text-xs text-brand text-purple-400">{recipe.cuisine ?? "Global"}</div>
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
            <div className="rounded-alchm border border-alchm-line bg-white/[0.02] p-4">
              <InstrumentLabel>Suitable for</InstrumentLabel>
              <div className="mt-2 flex flex-wrap gap-1">
                {method.suitable_for.slice(0, 6).map((item, i) => (
                  <span key={i} className="rounded-md border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-200">{item}</span>
                ))}
              </div>
            </div>
          )}
          {method.benefits && method.benefits.length > 0 && (
            <div className="rounded-alchm border border-alchm-line bg-white/[0.02] p-4">
              <InstrumentLabel>Benefits</InstrumentLabel>
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-alchm-fg-dim">
                {method.benefits.slice(0, 3).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {method.expertTips && method.expertTips.length > 0 && (
            <div className="rounded-alchm border border-alchm-line bg-white/[0.02] p-4">
              <InstrumentLabel>Expert tips</InstrumentLabel>
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-alchm-fg-dim">
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
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${kinetics.forceClassification === "accelerating" ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-300"
                  : kinetics.forceClassification === "balanced" ? "border-sky-400/35 bg-sky-500/10 text-sky-300"
                    : "border-orange-400/35 bg-orange-500/10 text-orange-300"
                  }`}>{kinetics.forceClassification}</span>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${kinetics.thermalDirection === "heating" ? "border-red-400/35 bg-red-500/10 text-red-300"
                  : kinetics.thermalDirection === "cooling" ? "border-sky-400/35 bg-sky-500/10 text-sky-300"
                    : "border-alchm-line-hi bg-white/[0.03] text-alchm-fg-dim"
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
                          <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
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
        <div className="rounded-alchm border border-dashed border-alchm-line-hi bg-white/[0.02] p-8 text-center">
          <p className="text-sm text-alchm-fg-dim">Select exactly two methods to compare by clicking their rows.</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-alchm-fg-mute">
            Selected {compareSelections.length}/2
          </p>
        </div>
      );
    }

    const { a, b } = compareData;

    /**
     * One comparison row.
     *
     * ⚠️ NULL IS NOT ZERO HERE, AND IT USED TO BE.
     *
     * `[FIXED]` Every row was written `a.monica ?? 0` / `a.kalchm ?? 0` /
     * `a.kinetics?.power ?? 0`. A method with no kinetic profile therefore
     * rendered "0.000" — a real, readable, wrong measurement — and the delta
     * column then subtracted the other method from that fabricated zero and
     * printed the difference as though the comparison had been made. The `??`
     * chain stops at the first non-nullish value, so an absent quantity became
     * the most confident number in the row.
     *
     * Absence now propagates: either side missing renders an em dash on that
     * side and suppresses the delta entirely, because there is no delta.
     */
    const deltaRow = (
      label: string,
      aVal: number | null | undefined,
      bVal: number | null | undefined,
      fmt: (v: number) => string = (v) => v.toFixed(3),
      absentNote = "not registered",
    ) => {
      const aOk = typeof aVal === "number" && Number.isFinite(aVal);
      const bOk = typeof bVal === "number" && Number.isFinite(bVal);
      const diff = aOk && bOk ? bVal - aVal : null;

      // ⚠️ The delta chip is deliberately ONE colour for every non-zero delta.
      // A green/amber pair was tried and is wrong here: it reads as good/bad,
      // and on the "to core" row a green +9 min would be asserting that slower
      // is better. Whether faster is better is exactly what the Intent control
      // above lets the cook decide — "Tender" wants the slow one. The sign
      // carries the direction; the colour must not smuggle in a verdict.

      return (
        <div key={label} className="grid grid-cols-[1fr_96px_1fr] items-center gap-3 border-b border-alchm-line py-2.5 last:border-0">
          <span className="flex items-baseline justify-between gap-2">
            <InstrumentLabel>{label}</InstrumentLabel>
            <span className={`font-mono text-[13px] font-bold tabular-nums ${aOk ? "text-alchm-fg" : "text-alchm-fg-faint"}`}>
              {aOk ? fmt(aVal) : "—"}
            </span>
          </span>
          <span className="text-center">
            {diff === null ? (
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-alchm-fg-faint">{absentNote}</span>
            ) : (
              <span
                className={`inline-block rounded border px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums ${diff === 0
                  ? "border-transparent text-alchm-fg-mute"
                  : "border-alchm-violet/30 bg-alchm-violet/10 text-alchm-violet-bright"
                  }`}
              >
                {diff > 0 ? "+" : ""}{fmt(diff)}
              </span>
            )}
          </span>
          <span className="flex items-baseline justify-between gap-2">
            <span className={`font-mono text-[13px] font-bold tabular-nums ${bOk ? "text-alchm-fg" : "text-alchm-fg-faint"}`}>
              {bOk ? fmt(bVal) : "—"}
            </span>
            <InstrumentLabel>{label}</InstrumentLabel>
          </span>
        </div>
      );
    };

    /** Categorical rows have no arithmetic delta — they either match or they don't. */
    const matchRow = (label: string, aText: string, bText: string) => (
      <div key={label} className="grid grid-cols-[1fr_96px_1fr] items-center gap-3 border-b border-alchm-line py-2.5 last:border-0">
        <span className="flex items-baseline justify-between gap-2">
          <InstrumentLabel>{label}</InstrumentLabel>
          <span className="font-mono text-[13px] font-bold capitalize text-alchm-fg">{aText}</span>
        </span>
        <span className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-alchm-fg-mute">
          {aText === bText ? "same" : "differs"}
        </span>
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[13px] font-bold capitalize text-alchm-fg">{bText}</span>
          <InstrumentLabel>{label}</InstrumentLabel>
        </span>
      </div>
    );

    const accentA = elementAccent(elementalSignature(a.elementalEffect).dominant);
    const accentB = elementAccent(elementalSignature(b.elementalEffect).dominant);

    return (
      <div className="space-y-5 rounded-alchm border border-alchm-line bg-white/[0.02] p-5 backdrop-blur-xl md:p-6">
        <div className="flex items-center justify-between">
          <InstrumentLabel>Delta view</InstrumentLabel>
          <button
            onClick={() => { setCompareMode(false); setCompareSelections([]); }}
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-alchm-fg-mute transition-colors hover:text-alchm-fg-dim"
          >
            Close compare
          </button>
        </div>

        {/* Column heads */}
        <div className="grid grid-cols-[1fr_96px_1fr] gap-3">
          <div className="border-b-2 pb-2 text-center" style={{ borderColor: accentA }}>
            <h3 className="font-display text-2xl capitalize leading-none text-alchm-fg">{a.name.replace(/_/g, " ")}</h3>
          </div>
          <div className="flex items-end justify-center border-b border-alchm-line pb-2">
            <InstrumentLabel>Δ</InstrumentLabel>
          </div>
          <div className="border-b-2 pb-2 text-center" style={{ borderColor: accentB }}>
            <h3 className="font-display text-2xl capitalize leading-none text-alchm-fg">{b.name.replace(/_/g, " ")}</h3>
          </div>
        </div>

        {/* Physical behaviour first — the numbers a cook acts on. */}
        <div>
          <InstrumentLabel className="text-sky-300">Physical</InstrumentLabel>
          <div className="mt-2">
            {matchRow(
              "Paced by",
              a.physicsMetrics?.rateLimiter.replace(/-/g, " ") ?? "—",
              b.physicsMetrics?.rateLimiter.replace(/-/g, " ") ?? "—",
            )}
            {deltaRow("Medium °F", a.physicsMetrics?.medium.fahrenheit, b.physicsMetrics?.medium.fahrenheit, v => `${Math.round(v)}°F`, "no profile")}
            {deltaRow("Transfer h", a.physicsMetrics?.transfer?.typical, b.physicsMetrics?.transfer?.typical, v => `${Math.round(v).toLocaleString()}`, "not heat-limited")}
            {deltaRow("To core", a.physicsMetrics?.reference.result?.minutes, b.physicsMetrics?.reference.result?.minutes, v => `${v.toFixed(0)} min`, "no reference")}
            {matchRow(
              "Browning",
              a.physicsMetrics?.browning.available ? "reachable" : "unreachable",
              b.physicsMetrics?.browning.available ? "reachable" : "unreachable",
            )}
          </div>
        </div>

        {/* Then the correspondence layer, named as such. */}
        <div>
          <InstrumentLabel className="text-alchm-violet-bright">
            Alchemical — dimensionless, sets nothing physical
          </InstrumentLabel>
          <div className="mt-2">
            {deltaRow("Harmony", a.harmony.harmonyIndex, b.harmony.harmonyIndex, v => `${Math.round(v)}%`)}
            {deltaRow("Monica", a.monica, b.monica)}
            {deltaRow("Greg's energy", a.gregsEnergy, b.gregsEnergy)}
            {deltaRow("ln Kalchm", a.kalchm !== null && a.kalchm > 0 ? Math.log(a.kalchm) : null, b.kalchm !== null && b.kalchm > 0 ? Math.log(b.kalchm) : null, v => v.toFixed(2))}
            {deltaRow("Heat", a.thermodynamicProperties?.heat, b.thermodynamicProperties?.heat)}
            {deltaRow("Entropy", a.thermodynamicProperties?.entropy, b.thermodynamicProperties?.entropy)}
            {deltaRow("Reactivity", a.thermodynamicProperties?.reactivity, b.thermodynamicProperties?.reactivity)}
            {deltaRow("Circuit power", a.kinetics?.power, b.kinetics?.power, v => v.toFixed(4), "no kinetic profile")}
          </div>
        </div>

        {/* One chart, two traces — a shared graticule is what makes the shapes
            comparable. Two separate spiders side by side left the reader
            measuring across a gap. */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <ElementalSpiderCompare
            a={a.elementalEffect as unknown as Record<string, number>}
            b={b.elementalEffect as unknown as Record<string, number>}
            accentA={accentA}
            accentB={accentB}
            size={180}
          />
          <div className="flex gap-5">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4" style={{ backgroundColor: accentA }} />
              <InstrumentLabel>{a.name.replace(/_/g, " ")}</InstrumentLabel>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: accentB }} />
              <InstrumentLabel>{b.name.replace(/_/g, " ")}</InstrumentLabel>
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6 px-2 py-4 md:px-6">
      {/* ── Masthead ── */}
      <header className="flex flex-col gap-4 border-b border-alchm-line pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-4xl font-semibold leading-none tracking-tight text-alchm-fg md:text-5xl">
            Cooking Methods
          </h2>
          <p className="mt-2 font-mono text-[10px] uppercase leading-none tracking-[0.12em] text-alchm-fg-mute">
            Measured thermophysics · ranked against the live sky
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userBias && (
            <Chip tone="accent">
              Tuned to your {biasSource === "chart" ? "chart" : "table"}
            </Chip>
          )}
          <Chip tone={positionsSource === "real" ? "live" : "stale"} pulse={positionsSource === "real"}>
            {positionsSource === "real" ? "Live planetary data" : "Fallback positions"}
          </Chip>
          <button
            type="button"
            onClick={() => setShowPillarsGuide(!showPillarsGuide)}
            className="rounded-full border border-alchm-line-hi px-2.5 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.1em] text-alchm-fg-mute transition-colors hover:border-alchm-violet/40 hover:text-alchm-violet-bright"
          >
            {showPillarsGuide ? "Hide" : "Show"} 14 pillars
          </button>
        </div>
      </header>

      {/* Pillars Guide (collapsible) */}
      {showPillarsGuide && (
        <div className="rounded-alchm border border-alchm-line bg-white/[0.02] p-5 backdrop-blur-xl">
          <InstrumentLabel className="text-alchm-violet-bright">The 14 alchemical pillars</InstrumentLabel>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
            {ALCHEMICAL_PILLARS.map((pillar) => {
              const c = getPillarColors(pillar.id);
              return (
                <div key={pillar.id} className={`rounded-lg border ${c.border} ${c.bg} p-2.5 text-center`}>
                  <div className={`text-xs font-bold ${c.text}`}>{pillar.id}. {pillar.name}</div>
                  <div className="mt-1 font-mono text-[10px] tabular-nums text-alchm-fg-mute">
                    {Object.entries(pillar.effects).map(([p, v]) => `${p[0]}${v > 0 ? "+" : ""}${v}`).join(" ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Current moment ──
          `[CHANGED]` This was four pastel cards (purple-50 / amber-50 / rose-50 /
          cyan-50) that read as a colour key rather than a readout. It is one
          strip now, divided by hairlines: the same instrument grammar as the
          per-method physics strips below, so the eye learns one pattern. */}
      <section className="overflow-x-auto rounded-alchm border border-alchm-line bg-white/[0.02] p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <InstrumentLabel>Current moment</InstrumentLabel>
          <Chip
            tone={momentStatus === "ready" ? "live" : momentStatus === "loading" ? "neutral" : "warn"}
            pulse={momentStatus === "ready"}
          >
            {momentStatus === "ready"
              ? "/api/alchm-quantities"
              : momentStatus === "loading"
                ? "Connecting…"
                : "Unavailable"}
          </Chip>
        </div>
        {currentMoment ? (
          <div className="flex min-w-max items-start gap-6">
            <div className="flex flex-col gap-2">
              <InstrumentLabel>ESMS</InstrumentLabel>
              <div className="flex gap-3 font-mono text-[13px] font-bold tabular-nums text-alchm-fg">
                <span><span className="text-alchm-fg-mute">S</span> {currentMoment.quantities.Spirit.toFixed(2)}</span>
                <span><span className="text-alchm-fg-mute">E</span> {currentMoment.quantities.Essence.toFixed(2)}</span>
                <span><span className="text-alchm-fg-mute">M</span> {currentMoment.quantities.Matter.toFixed(2)}</span>
                <span><span className="text-alchm-fg-mute">Su</span> {currentMoment.quantities.Substance.toFixed(2)}</span>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <InstrumentLabel>Elemental</InstrumentLabel>
              <div className="flex gap-3 font-mono text-[13px] font-bold tabular-nums">
                {(["Fire", "Water", "Earth", "Air"] as const).map((el) => (
                  <span key={el} style={{ color: ELEMENT_ACCENT[el] }}>
                    <span className="text-alchm-fg-mute">{el.slice(0, 2)}</span>{" "}
                    {currentMoment.circuit.elementalBalance[el].toFixed(3)}
                  </span>
                ))}
              </div>
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <InstrumentLabel>Thermodynamic</InstrumentLabel>
              <div className="flex gap-3 font-mono text-[13px] font-bold tabular-nums text-alchm-fg">
                <span><span className="text-alchm-fg-mute">H</span> {currentMoment.heat.toFixed(3)}</span>
                <span><span className="text-alchm-fg-mute">S</span> {currentMoment.entropy.toFixed(3)}</span>
                <span><span className="text-alchm-fg-mute">R</span> {currentMoment.reactivity.toFixed(3)}</span>
                <span><span className="text-alchm-fg-mute">M</span> {currentMoment.monica.toFixed(3)}</span>
              </div>
            </div>
            <Divider />
            <div className="flex flex-col gap-2">
              <InstrumentLabel>Circuit</InstrumentLabel>
              <div className="flex items-baseline gap-3 font-mono text-[13px] font-bold tabular-nums text-alchm-fg">
                <span><span className="text-alchm-fg-mute">P</span> {currentMoment.circuit.power.toFixed(4)}</span>
                <span><span className="text-alchm-fg-mute">F</span> {currentMoment.circuit.forceMagnitude.toFixed(4)}</span>
                <span className="font-normal text-[10px] uppercase tracking-[0.1em] text-alchm-fg-mute">
                  {currentMoment.circuit.forceClassification} · {currentMoment.circuit.thermalDirection}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="font-mono text-[11px] text-alchm-fg-mute">
            Using planetary fallback values while current-moment metrics load.
          </p>
        )}
      </section>

      {/* ── Category rail ── */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-alchm-line">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setExpandedMethod(null); setCompareSelections([]); }}
            className={`-mb-px border-b-2 pb-2.5 font-mono text-[11px] uppercase leading-none tracking-[0.12em] transition-colors ${selectedCategory === cat.id
              ? "border-alchm-violet text-alchm-violet-bright"
              : "border-transparent text-alchm-fg-mute hover:text-alchm-fg-dim"
              }`}
          >
            <span className="mr-1.5">{cat.icon}</span>{cat.name}
          </button>
        ))}
      </div>

      {/* ── Control bar ── */}
      <div className="flex flex-col items-start gap-4 rounded-alchm border border-alchm-line bg-white/[0.02] p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="cooking-method-focus">
            <InstrumentLabel>Focus</InstrumentLabel>
          </label>
          <select
            id="cooking-method-focus"
            value={focusMode}
            onChange={(e) => setFocusMode(e.target.value as FocusMode)}
            className="rounded-lg border border-alchm-line-hi bg-alchm-bg-elev px-3 py-1.5 text-xs font-medium text-alchm-fg-dim outline-none transition-colors focus:border-alchm-violet/50 focus:ring-1 focus:ring-alchm-violet/40"
          >
            {FOCUS_OPTIONS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <InstrumentLabel>Intent</InstrumentLabel>
          <div className="flex flex-wrap gap-1.5">
            {INTENT_OPTIONS.map(({ key, label, icon }) => (
              <button
                key={label}
                onClick={() => setUserIntent(key)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${userIntent === key
                  ? "border-alchm-violet/45 bg-alchm-violet/10 text-alchm-violet-bright"
                  : "border-alchm-line text-alchm-fg-mute hover:border-alchm-line-hi hover:text-alchm-fg-dim"
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareSelections([]); }}
          className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase leading-none tracking-[0.1em] transition-colors ${compareMode
            ? "border-alchm-violet/45 bg-alchm-violet/15 text-alchm-violet-bright"
            : "border-alchm-line text-alchm-fg-mute hover:border-alchm-line-hi hover:text-alchm-fg-dim"
            }`}
        >
          {compareMode ? "✔ Compare on" : "↔ Compare"}
        </button>
      </div>

      {/* ── Category subtitle ── */}
      {/* `flex-wrap` is load-bearing at 375 px: unwrapped, the three items
          competed for one line, the heading collapsed to "Dry" and the focus
          label overlapped it. */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
        <h3 className="whitespace-nowrap font-display text-2xl text-alchm-fg">{category?.name}</h3>
        <span className="ml-auto whitespace-nowrap font-mono text-[10px] font-bold tabular-nums tracking-[0.1em] text-alchm-fg-mute">
          {String(currentMethods.length).padStart(2, "0")}_METHODS
        </span>
        <InstrumentLabel className="w-full">
          Focus: {FOCUS_OPTIONS.find(f => f.key === focusMode)?.label}
          {userIntent && ` · Intent: ${userIntent}`}
        </InstrumentLabel>
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

          const physics = method.physicsMetrics;
          // The row's colour identity. Derived from the same canonical helper
          // the /cooking-methods atlas uses, so a method is the same colour on
          // both surfaces instead of each page inventing its own mapping.
          const accent = elementAccent(elementalSignature(method.elementalEffect).dominant);

          return (
            <div
              key={method.id}
              className={`overflow-hidden rounded-alchm border backdrop-blur-xl transition-colors duration-200 ${isCompareSelected
                ? "border-alchm-violet/50 bg-alchm-violet/[0.06]"
                : isExpanded
                  ? "border-alchm-line-hi bg-white/[0.035]"
                  : "border-alchm-line bg-white/[0.02] hover:border-alchm-line-hi"
                }`}
              style={{ boxShadow: `inset 2px 0 0 0 ${accent}` }}
            >
              {/* -- Collapsed row (always visible) -- */}
              <div
                className="cursor-pointer p-4 md:p-5"
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
                  <span className="font-mono text-2xl font-bold tabular-nums leading-none text-alchm-fg-faint">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <HarmonyRing value={method.harmony.harmonyIndex} size={44} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Normalised on READ, never renamed at the source: the
                          corpus keys are snake_case and `method.name` carries
                          them through verbatim, so "Sous_vide" was rendering
                          with the underscore intact in a 24 px display serif.
                          The atlas at /cooking-methods already does this same
                          replace; the id itself stays untouched because 27
                          registries key off it. */}
                      <h4 className="font-display text-2xl capitalize leading-none text-alchm-fg">
                        {method.name.replace(/_/g, " ")}
                      </h4>
                      {method.culinaryArchetype && (
                        <span className="rounded-full border border-alchm-line-hi px-2 py-0.5 text-[10px] font-medium italic text-alchm-fg-mute">
                          {method.culinaryArchetype}
                        </span>
                      )}
                      {method.pillar && (
                        <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold ${pillarColors?.bg} ${pillarColors?.text} ${pillarColors?.border}`}>
                          #{method.pillar.id}
                        </span>
                      )}
                      <VolatilityBadge monica={method.monica} />
                    </div>

                    <p className="mt-1.5 line-clamp-1 text-[13px] italic text-alchm-fg-dim">
                      {method.shortDescription ?? method.description}
                    </p>

                    {/* Physics strip.
                        `[CHANGED 2026-08-16]` This row used to read
                        "⚡ −12.92 · ⚙️ P=0.28 · 🌡️ 87% thermo · ⚡ 77% kinetic" —
                        four alchemical scores in the most-read line on the card,
                        two of them wearing physics units they do not have. It now
                        leads with what the method physically does; the alchemical
                        scores are one tab away, labelled as such.

                        `[CHANGED]` The values are now label-over-value readouts
                        with their z against the corpus, rather than emoji-prefixed
                        run-on text. Each cell states its own absence: a method
                        with no reference geometry shows the engine's own
                        `unavailableReason`, never a filled-in number. */}
                    <div className="mt-3 flex flex-wrap items-start gap-x-6 gap-y-3">
                      <Readout label="Duration" value={formatDuration(method)} />
                      {physics ? (
                        <>
                          <Readout
                            label="Paced by"
                            value={physics.rateLimiter.replace(/-/g, " ")}
                            className="capitalize"
                          />
                          <Readout
                            label="Medium"
                            tone="heat"
                            value={`${Math.round(physics.medium.fahrenheit)}°F`}
                            unit={`${Math.round(physics.medium.celsius)}°C`}
                          />
                          <Readout
                            label="Transfer"
                            tone="transfer"
                            value={physics.transfer ? physics.transfer.typical.toLocaleString() : undefined}
                            unit={physics.transfer ? "W·m⁻²·K⁻¹" : undefined}
                            z={physics.transfer?.z}
                            absent={physics.transfer ? null : "not heat-limited"}
                          />
                          <Readout
                            label="To core"
                            tone="time"
                            value={
                              physics.reference.result
                                ? `${physics.reference.result.minutes.toFixed(0)} min`
                                : undefined
                            }
                            z={physics.reference.result ? physics.reference.z : undefined}
                            absent={physics.reference.result ? null : physics.reference.unavailableReason}
                          />
                          <Readout
                            label="Browning"
                            tone={physics.browning.available ? "browning" : "default"}
                            value={physics.browning.available ? "reachable" : "unreachable"}
                          />
                        </>
                      ) : (
                        <Readout label="Physics" absent="no profile registered" />
                      )}
                    </div>
                  </div>

                  <div className="hidden shrink-0 md:block">
                    <ElementalSpider effect={method.elementalEffect as unknown as Record<string, number>} size={80} />
                  </div>
                </div>
              </div>

              {/* -- Expanded view -- */}
              {isExpanded && !compareMode && (
                <div className="border-t border-alchm-line px-4 pb-5 md:px-5">
                  {/* Tab rail */}
                  <div className="mb-4 flex gap-6 overflow-x-auto border-b border-alchm-line">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={(e) => { e.stopPropagation(); setExpandedTab(tab.key); }}
                        className={`-mb-px shrink-0 border-b-2 py-3 font-mono text-[10px] uppercase leading-none tracking-[0.12em] transition-colors ${expandedTab === tab.key
                          ? "border-alchm-violet text-alchm-violet-bright"
                          : "border-transparent text-alchm-fg-mute hover:text-alchm-fg-dim"
                          }`}
                      >
                        {tab.label}
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
                <div className="pb-2 text-center">
                  <span className="font-mono text-[10px] tracking-[0.1em] text-alchm-fg-faint">
                    {isExpanded ? "▲ COLLAPSE" : "▼ EXPAND"}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="border-t border-alchm-line pt-5 text-center">
        <InstrumentLabel>
          Physics from published correlations · alchemical layer ranks, never prescribes
        </InstrumentLabel>
      </footer>
    </div>
  );
}
