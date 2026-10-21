import {
  Award,
  Compass,
  Crown,
  Layers,
  Minus,
  Orbit,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { VesselAppearanceProfile } from "@/lib/agents/vessel-appearance-manifest";
import { VESSEL_RELIC_LABELS } from "@/lib/agents/vessel-appearance-manifest";

export interface AgentVesselData {
  level: number;
  totalXp: number;
  xpToNextLevel: number | null;
  levelBoost: number;
  baseOverall: number;
  trainedOverall: number;
  currentOverall: number;
  transitDelta: number;
  progressionStatus: "live" | "estimated" | "unavailable";
  archetype: {
    title: string;
    primary: string;
    secondary: string;
  };
  stats: Record<string, number>;
  statDeltas?: Record<string, number>;
  appearance?: VesselAppearanceProfile;
}

interface AgentVesselCardProps {
  vessel: AgentVesselData;
  agentName: string;
  dominantElement?: string | null;
  accentColor?: string;
}

const SACRED_STAT_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  power: { label: "Power", color: "from-red-500 to-amber-500", desc: "Decisive raw impact" },
  resonance: { label: "Resonance", color: "from-blue-500 to-cyan-400", desc: "Celestial frequency attunement" },
  wisdom: { label: "Wisdom", color: "from-purple-500 to-indigo-400", desc: "Strategic and alchemical knowledge" },
  charisma: { label: "Charisma", color: "from-amber-400 to-yellow-300", desc: "Magnetic resonance & presence" },
  intuition: { label: "Intuition", color: "from-teal-400 to-emerald-400", desc: "Prescient culinary instinct" },
  adaptability: { label: "Adaptability", color: "from-emerald-400 to-cyan-500", desc: "Transmutation of constraints" },
  vitality: { label: "Vitality", color: "from-rose-500 to-red-400", desc: "Constitutional vessel endurance" },
};

const PLANETARY_STAT_LABELS: Record<string, { label: string; body: string }> = {
  solarAgency: { label: "Solar Agency", body: "Sun" },
  lunarReceptivity: { label: "Lunar Receptivity", body: "Moon" },
  mercurialVelocity: { label: "Mercurial Velocity", body: "Mercury" },
  venusianCoherence: { label: "Venusian Coherence", body: "Venus" },
  martialImpetus: { label: "Martial Impetus", body: "Mars" },
  jovianExpansion: { label: "Jovian Expansion", body: "Jupiter" },
  saturnianStructure: { label: "Saturnian Structure", body: "Saturn" },
  chironicAdaptation: { label: "Chironic Adaptation", body: "Chiron" },
  uranianSurprisal: { label: "Uranian Surprisal", body: "Uranus" },
  neptunianResonance: { label: "Neptunian Resonance", body: "Neptune" },
  plutonicIntegration: { label: "Plutonic Integration", body: "Pluto" },
  kineticAlignment: { label: "Kinetic Alignment", body: "All Bodies" },
};

function calculateProgressPercent(level: number, totalXp: number): number {
  if (level >= 100) return 100;
  const currentLevelFloor = 100 * (level - 1) ** 2;
  const nextLevelCeil = 100 * level ** 2;
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((totalXp - currentLevelFloor) /
          Math.max(1, nextLevelCeil - currentLevelFloor)) *
          100,
      ),
    ),
  );
}

function CameoMedallion({
  accentColor,
  portraitSvgDataUri,
  agentName,
  level,
}: {
  accentColor: string;
  portraitSvgDataUri: string | null;
  agentName: string;
  level: number;
}): React.JSX.Element {
  return (
    <div className="relative shrink-0 group">
      <div
        className="w-28 h-28 md:w-32 md:h-32 rounded-3xl p-1 relative flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${accentColor}88, rgba(255,255,255,0.1), ${accentColor}33)`,
          boxShadow: `0 0 35px ${accentColor}33`,
        }}
      >
        {portraitSvgDataUri ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={portraitSvgDataUri}
            alt={`${agentName} Vessel Cameo`}
            className="w-full h-full object-cover rounded-[22px] bg-[#0c0d18] border border-white/10"
          />
        ) : (
          <div
            className="w-full h-full rounded-[22px] flex items-center justify-center text-4xl font-serif font-bold text-white shadow-inner bg-[#0c0d18]"
            style={{ color: accentColor }}
          >
            {agentName.charAt(0)}
          </div>
        )}
        <div
          className="absolute inset-0 rounded-3xl animate-pulse pointer-events-none opacity-40"
          style={{ border: `1.5px solid ${accentColor}` }}
        />
      </div>

      <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-black/90 border border-purple-500/50 shadow-lg flex items-center gap-1">
        <span className="text-[10px] uppercase tracking-wider text-purple-300 font-bold font-mono">
          LVL
        </span>
        <span className="text-xs font-bold text-white font-mono">{level}</span>
      </div>
    </div>
  );
}

interface SilhouetteAttributesProps {
  app: AgentVesselData["appearance"];
  archetype: AgentVesselData["archetype"];
  relicLabel: string;
}

function SilhouetteAttributes({
  app,
  archetype,
  relicLabel,
}: SilhouetteAttributesProps): React.JSX.Element {
  return (
    <div className="space-y-2 text-center sm:text-left">
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
        {app?.era && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] capitalize">
            {app.era} Era
          </Badge>
        )}
        <Badge variant="outline" className="bg-white/5 text-white/70 border-white/10 text-[10px]">
          {archetype.primary} · {archetype.secondary}
        </Badge>
      </div>

      <div className="space-y-1 text-xs">
        {app?.headSilhouette.crownStyle && (
          <p className="text-white/80 flex items-center justify-center sm:justify-start gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px] text-white/90 capitalize">
              {app.headSilhouette.crownStyle.replace(/-/g, " ")}
            </span>
          </p>
        )}
        {app?.garmentSilhouette.mantleStyle && (
          <p className="text-white/60 flex items-center justify-center sm:justify-start gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="font-mono text-[11px] capitalize">
              {app.garmentSilhouette.mantleStyle.replace(/-/g, " ")}
            </span>
          </p>
        )}
        {relicLabel && (
          <p className="text-white/60 flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-mono text-[11px] capitalize text-cyan-200/90">{relicLabel}</span>
          </p>
        )}
      </div>
    </div>
  );
}

export function AgentVesselCard({
  vessel,
  agentName,
  accentColor = "#a855f7",
}: AgentVesselCardProps): React.JSX.Element {
  const [statTab, setStatTab] = useState<"sacred" | "planetary">("sacred");

  const {
    appearance: app,
    totalXp,
    level,
    xpToNextLevel: xpNeeded,
    transitDelta: delta,
  } = vessel;
  const relicKey = app?.signatureRelic ?? "";
  const relicLabel = VESSEL_RELIC_LABELS[relicKey] ?? relicKey.replace(/-/g, " ");

  const progressPercent = calculateProgressPercent(level, totalXp);

  const hasSurge = delta > 0.1;
  const hasTax = delta < -0.1;

  return (
    <Card className="glass-card-premium border-white/10 bg-black/60 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* Ambient background glow */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full blur-3xl opacity-10 bg-amber-500/20 pointer-events-none" />

      <CardHeader className="p-6 md:p-8 pb-4 relative z-10 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-lg md:text-xl font-serif text-white tracking-tight">
                Alchemical Vessel & Cosmic Likeness
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-white/50">
              Cross-site vessel progression, permanent earned capability, and live celestial sky attunement
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-xs font-semibold px-3 py-1"
            >
              <Award className="w-3.5 h-3.5 mr-1.5 text-amber-300 inline" />
              <span>{vessel.archetype.title}</span>
            </Badge>
            <Badge
              variant="outline"
              className="bg-white/5 text-white/60 border-white/10 text-xs uppercase tracking-wider"
            >
              {vessel.progressionStatus} Sky
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8 relative z-10">
        {/* ── Top Grid: Cameo Likeness + Level/Overall Progression ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Cameo Medallion (Left Rail) */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row items-center sm:items-start lg:items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <CameoMedallion
              accentColor={accentColor}
              portraitSvgDataUri={app?.portraitSvgDataUri ?? null}
              agentName={agentName}
              level={vessel.level}
            />

            {/* Silhouette Attributes */}
            <SilhouetteAttributes
              app={app}
              archetype={vessel.archetype}
              relicLabel={relicLabel}
            />
          </div>

          {/* Overall & Level Progression (Right Rail) */}
          <div className="lg:col-span-7 space-y-5">
            {/* OVR Cards Row */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Dynamic Current Overall */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span className="font-mono uppercase tracking-wider text-[10px]">
                    Current Overall
                  </span>
                  <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                    {vessel.currentOverall}
                  </span>
                  <span className="text-xs text-white/40 font-mono">/ 99</span>
                </div>

                {/* Celestial Transit Delta Indicator */}
                <div className="mt-2 flex items-center gap-1.5">
                  {hasSurge ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-[10px] font-mono font-semibold py-0.5 px-2">
                      <TrendingUp className="w-3 h-3 mr-1 inline text-emerald-400" />
                      +{delta} Transit Surge
                    </Badge>
                  ) : hasTax ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] font-mono font-semibold py-0.5 px-2">
                      <TrendingDown className="w-3 h-3 mr-1 inline text-amber-400" />
                      {delta} Sky Tax
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-white/5 text-white/60 border-white/10 text-[10px] font-mono py-0.5 px-2">
                      <Minus className="w-3 h-3 mr-1 inline" />
                      Equilibrium
                    </Badge>
                  )}
                </div>
              </div>

              {/* Trained Baseline Overall */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 relative">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span className="font-mono uppercase tracking-wider text-[10px]">
                    Trained Baseline
                  </span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-white/80 tracking-tight">
                    {vessel.trainedOverall}
                  </span>
                  <span className="text-xs text-white/40 font-mono">/ 99</span>
                </div>
                <div className="mt-2 text-[10px] text-white/50 font-mono">
                  Base: {vessel.baseOverall} · Boost: +{vessel.levelBoost}
                </div>
              </div>
            </div>

            {/* Level & XP Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white font-mono">
                    Vessel Level {vessel.level}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    (Permanent Earned Growth)
                  </span>
                </div>
                <span className="text-xs font-mono text-purple-300 font-semibold">
                  {totalXp.toLocaleString()} Total XP
                </span>
              </div>

              <Progress value={progressPercent} className="h-2 bg-white/10" />

              <div className="flex justify-between text-[10px] text-white/50 font-mono">
                <span>{progressPercent}% to Level {Math.min(100, level + 1)}</span>
                <span>
                  {xpNeeded !== null
                    ? `${xpNeeded.toLocaleString()} XP required`
                    : "Max Vessel Level Reached"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 19-Stat Framework Matrix ── */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-serif font-semibold text-white">
                19-Dimensional Alchemical Matrix
              </h4>
            </div>

            <div className="flex gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 self-start sm:self-auto">
              <button
                onClick={() => setStatTab("sacred")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statTab === "sacred"
                    ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Sacred 7 (25–99)
              </button>
              <button
                onClick={() => setStatTab("planetary")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statTab === "planetary"
                    ? "bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow"
                    : "text-white/50 hover:text-white"
                }`}
              >
                Planetary 12 (0–100)
              </button>
            </div>
          </div>

          {/* Sacred 7 Grid */}
          {statTab === "sacred" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
              {Object.entries(SACRED_STAT_LABELS).map(([key, meta]) => {
                const val = vessel.stats[key] ?? 60;
                const statDelta = vessel.statDeltas?.[key] ?? 0;
                const roundedDelta = Math.round(statDelta * 10) / 10;
                const isBoosted = roundedDelta > 0;
                const isTested = roundedDelta < 0;

                return (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">
                        {meta.label}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-sm font-bold text-white">{val}</span>
                        {isBoosted && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            +{roundedDelta}
                          </span>
                        )}
                        {isTested && (
                          <span className="text-[10px] text-amber-400 font-semibold">
                            {roundedDelta}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${meta.color}`}
                        style={{ width: `${Math.min(100, Math.max(0, ((val - 25) / 74) * 100))}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-white/40 leading-tight">
                      {meta.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Planetary 12 Grid */}
          {statTab === "planetary" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
              {Object.entries(PLANETARY_STAT_LABELS).map(([key, meta]) => {
                const val = vessel.stats[key] ?? 50;
                const statDelta = vessel.statDeltas?.[key] ?? 0;
                const roundedDelta = Math.round(statDelta * 10) / 10;

                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/80 text-[11px] font-medium truncate">
                        {meta.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-white shrink-0">
                        {val}
                      </span>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>{meta.body}</span>
                      {roundedDelta !== 0 && (
                        <span className={roundedDelta > 0 ? "text-emerald-400" : "text-amber-400"}>
                          {roundedDelta > 0 ? `+${roundedDelta}` : roundedDelta}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
