import Link from "next/link";
import React from "react";
import type { SynastryData, ViewerProfileData, InterchartAspect } from "./types";

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
};

const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
};

const EL_COLOR: Record<string, string> = {
  fire: "var(--el-fire)",
  water: "var(--el-water)",
  earth: "var(--el-earth)",
  air: "var(--el-air)",
  Fire: "var(--el-fire)",
  Water: "var(--el-water)",
  Earth: "var(--el-earth)",
  Air: "var(--el-air)",
};

const STANCE_META = {
  mirror: {
    label: "MIRROR",
    color: "var(--accent)",
    aura: "rgba(180,140,255,0.55)",
    cone: ["var(--accent)", "var(--el-water)", "var(--el-air)", "var(--accent)"],
    desc: (name: string): string => `${name} is in Mirror mode. Your signatures rhyme — match their elemental output to double your alchemical yield.`,
  },
  absorb: {
    label: "ABSORB",
    color: "var(--el-water)",
    aura: "rgba(96,165,250,0.5)",
    cone: ["var(--el-water)", "var(--accent)", "var(--el-air)", "var(--el-water)"],
    desc: (name: string): string => `${name} is in Absorb mode. You fill each other's gaps — let them temper your excesses and cook from the balanced midpoint.`,
  },
  clash: {
    label: "CLASH",
    color: "var(--el-fire)",
    aura: "rgba(239,68,68,0.5)",
    cone: ["var(--el-fire)", "var(--accent-2)", "var(--el-earth)", "var(--el-fire)"],
    desc: (name: string): string => `${name} is in Clash mode. Opposing constitutions generate heat — use it deliberately for bold, high-contrast plates, not comfort food.`,
  },
};

interface StanceCenterpieceProps {
  stanceKey: "mirror" | "absorb" | "clash";
  viewerProfile: ViewerProfileData | null;
  agentName: string;
  dominantElement?: string;
}

const StanceCenterpiece: React.FC<StanceCenterpieceProps> = ({
  stanceKey,
  viewerProfile,
  agentName,
  dominantElement,
}) => {
  const stance = STANCE_META[stanceKey];

  return (
    <div className="md:col-span-2 flex flex-col items-center justify-center gap-4 relative py-6">
      <div
        className="absolute w-48 h-48 rounded-full blur-[10px] opacity-70 animate-slow-spin pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, ${stance.cone.join(", ")})`,
          maskImage: "radial-gradient(circle, #000 18%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 70%)",
        }}
      />
      <div
        className="absolute w-36 h-36 rounded-full blur-[2px] opacity-90 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${stance.aura}, transparent 70%)`,
        }}
      />

      <div className="relative text-center z-10">
        <h3 className="text-3xl font-black tracking-widest" style={{ color: stance.color }}>
          {stance.label}
        </h3>
        <span className="text-[8px] uppercase tracking-[0.2em] font-mono text-white/40 block mt-1">
          Resonance Stance
        </span>
      </div>

      {viewerProfile?.dominantElement && (
        <div className="relative z-10 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1" style={{ color: EL_COLOR[viewerProfile.dominantElement] ?? "#fff" }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EL_COLOR[viewerProfile.dominantElement] }} />
            You
          </span>
          <span className="text-white/30">↔</span>
          <span className="flex items-center gap-1" style={{ color: dominantElement ? EL_COLOR[dominantElement] : "#fff" }}>
            {agentName.split(" ")[0]}
            {dominantElement && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EL_COLOR[dominantElement] }} />}
          </span>
        </div>
      )}
    </div>
  );
};

const InterchartAspectHighlights: React.FC<{ aspects: InterchartAspect[] }> = ({ aspects }) => {
  if (aspects.length === 0) return null;
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-2">
        Inter-Chart Aspect Highlights
      </p>
      <div className="flex flex-wrap gap-2">
        {aspects.slice(0, 5).map((asp, i) => {
          const isFriction = asp.harmonic === "friction";
          const color = isFriction ? "border-red-500/20 text-red-300 bg-red-500/5" : "border-purple-500/20 text-purple-300 bg-purple-500/5";
          return (
            <span key={asp.planetA + asp.planetB + i} className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${color} flex items-center gap-1`}>
              <span>{PLANET_GLYPH[asp.planetA]}</span>
              <span className="text-[9px] opacity-75">{ASPECT_GLYPH[asp.type]}</span>
              <span>{PLANET_GLYPH[asp.planetB]}</span>
              <span className="text-[8px] opacity-40 ml-1">({asp.orb}°)</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

const ResonanceBars: React.FC<{ synastryData: SynastryData }> = ({ synastryData }) => {
  const stanceKey = synastryData.dominantStance;
  return (
    <div className="space-y-4">
      {[
        { label: "HARMONY", v: synastryData.scores.harmony, color: "var(--el-water)", active: stanceKey === "absorb" },
        { label: "TENSION", v: synastryData.scores.tension, color: "var(--el-fire)", active: stanceKey === "clash" },
        { label: "INTENSIFICATION", v: synastryData.scores.intensification, color: "var(--accent)", active: stanceKey === "mirror" },
      ].map((item) => (
        <div key={item.label}>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[9px] uppercase tracking-widest font-mono text-white/50">{item.label}</span>
            <span className="text-xs font-mono font-black" style={{ color: item.active ? item.color : "#fff" }}>
              {Math.round(item.v * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full rounded-full"
              style={{
                width: `${item.v * 100}%`,
                backgroundColor: item.color,
                boxShadow: item.active ? `0 0 10px ${item.color}` : "none",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

interface ResonanceLedgerProps {
  synastryData: SynastryData;
  agentName: string;
}

const ResonanceLedger: React.FC<ResonanceLedgerProps> = ({ synastryData, agentName }) => {
  const stanceKey = synastryData.dominantStance;
  const stance = STANCE_META[stanceKey];

  return (
    <div className="md:col-span-3 flex flex-col gap-6">
      <ResonanceBars synastryData={synastryData} />
      <div
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: `color-mix(in oklch, ${stance.color}, transparent 92%)`,
          borderColor: `color-mix(in oklch, ${stance.color}, transparent 60%)`,
        }}
      >
        <p className="text-xs text-white/80 leading-relaxed">{stance.desc(agentName)}</p>
      </div>
      <InterchartAspectHighlights aspects={synastryData.interchartAspects} />
    </div>
  );
};

const SynastryEmptyOrLoading: React.FC<{ isLoggedIn: boolean; loadingSynastry: boolean; agentName: string }> = ({
  isLoggedIn,
  loadingSynastry,
  agentName,
}) => {
  if (!isLoggedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-white/60 mb-4">
          Sign in to synchronize your alchemical signature and calculate resonance alignment with {agentName}.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-[0.2em] transition-all"
        >
          Sign In ✦
        </Link>
      </div>
    );
  }

  if (loadingSynastry) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
          Aligning planetary houses...
        </span>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-sm text-white/60 mb-4">
        Add your birth date and location to calculate alignment compatibility aspects and resonance with {agentName}.
      </p>
      <Link
        href="/profile/birthchart"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-[0.2em] transition-all"
      >
        Configure Natal Chart ✦
      </Link>
    </div>
  );
};

interface SynastrySectionProps {
  synastryData: SynastryData | null;
  loadingSynastry: boolean;
  viewerProfile: ViewerProfileData | null;
  agentName: string;
  dominantElement?: string;
  isLoggedIn: boolean;
}

export const SynastrySection: React.FC<SynastrySectionProps> = ({
  synastryData,
  loadingSynastry,
  viewerProfile,
  agentName,
  dominantElement,
  isLoggedIn,
}) => (
  <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8 relative overflow-hidden">
    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
      Planetary Alignment & Resonance
    </h2>

    {!isLoggedIn || loadingSynastry || !synastryData ? (
      <SynastryEmptyOrLoading
        isLoggedIn={isLoggedIn}
        loadingSynastry={loadingSynastry}
        agentName={agentName}
      />
    ) : (
      <div className="grid md:grid-cols-5 gap-8 items-center">
        <StanceCenterpiece
          stanceKey={synastryData.dominantStance}
          viewerProfile={viewerProfile}
          agentName={agentName}
          dominantElement={dominantElement}
        />
        <ResonanceLedger synastryData={synastryData} agentName={agentName} />
      </div>
    )}
  </section>
);
