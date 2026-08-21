import { motion } from "framer-motion";
import React from "react";
import type { TransitOverlayData, TransitActivation } from "./types";

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

const BoostBar: React.FC<{ boostElement: string | null; boostMagnitude: number }> = ({
  boostElement,
  boostMagnitude,
}) => (
  <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{
        width: `${boostElement ? Math.min(100, boostMagnitude * 200) : 30}%`,
      }}
      transition={{ duration: 0.8 }}
      className="h-full rounded-full"
      style={{
        background: boostElement ? EL_COLOR[boostElement] : "var(--el-fire)",
        boxShadow: boostElement ? `0 0 10px ${EL_COLOR[boostElement]}` : "none",
      }}
    />
  </div>
);

const BoostMeter: React.FC<{ transitOverlay: TransitOverlayData }> = ({ transitOverlay }) => {
  const { boostElement, boostMagnitude, summary } = transitOverlay;

  return (
    <div
      className="p-5 rounded-2xl border bg-white/[0.01] flex flex-col gap-4"
      style={{
        background: boostElement
          ? `linear-gradient(100deg, color-mix(in oklch, ${EL_COLOR[boostElement]}, transparent 92%), rgba(255,255,255,0.01))`
          : "rgba(255,255,255,0.01)",
        borderColor: boostElement
          ? `color-mix(in oklch, ${EL_COLOR[boostElement]}, transparent 60%)`
          : "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${boostElement ? "" : "bg-red-500 animate-pulse"}`}
            style={{ backgroundColor: boostElement ? EL_COLOR[boostElement] : undefined }}
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
            {boostElement ? `${boostElement} boost` : "Tension · no boost"}
          </span>
        </div>
        <span
          className="text-xl font-black tabular-nums"
          style={{ color: boostElement ? EL_COLOR[boostElement] : "var(--el-fire)" }}
        >
          {boostElement ? `+${Math.round(boostMagnitude * 100)}%` : "STRESS"}
        </span>
      </div>
      <BoostBar boostElement={boostElement} boostMagnitude={boostMagnitude} />
      <p className="text-xs text-white/60 leading-relaxed font-mono">{summary}</p>
    </div>
  );
};

const PlanetaryTriggerCard: React.FC<{ act: TransitActivation; index: number }> = ({ act, index }) => (
  <div key={act.transitPlanet + act.natalPoint + index} className="grid grid-cols-3 gap-2 items-center p-3 border border-white/5 bg-white/[0.01] rounded-xl">
    <div className="flex items-center gap-1.5 font-mono text-sm text-white/80">
      <span>{PLANET_GLYPH[act.transitPlanet] ?? act.transitPlanet[0]}</span>
      <span className="text-purple-400 text-xs">{ASPECT_GLYPH[act.type]}</span>
      <span style={{ color: EL_COLOR[act.natalElement] }}>{PLANET_GLYPH[act.natalPoint] ?? act.natalPoint[0]}</span>
    </div>
    <div className="text-left leading-tight">
      <div className="text-xs font-bold text-white capitalize">{act.transitPlanet} {act.type} {act.natalPoint}</div>
      <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-0.5">orb {act.orb}°</div>
    </div>
    <div className="text-right">
      <span className="text-xs font-mono font-black text-white">{(act.exactness * 100).toFixed(0)}%</span>
      <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden mt-1 ml-auto">
        <div className="h-full rounded-full" style={{ width: `${act.exactness * 100}%`, backgroundColor: EL_COLOR[act.natalElement] }} />
      </div>
    </div>
  </div>
);

const StressNotesList: React.FC<{ notes: string[] }> = ({ notes }) => {
  if (notes.length === 0) return null;
  return (
    <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5">
      <span className="text-[9px] uppercase tracking-widest text-red-400 font-bold block mb-2">Stress Notes</span>
      <ul className="list-disc pl-4 space-y-1.5 text-xs text-white/70">
        {notes.map((note, i) => (
          <li key={note + i}>{note}</li>
        ))}
      </ul>
    </div>
  );
};

const TransitContent: React.FC<{ transitOverlay: TransitOverlayData }> = ({ transitOverlay }) => (
  <div className="space-y-6">
    <BoostMeter transitOverlay={transitOverlay} />
    <div>
      <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold mb-3">Planetary Triggers</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {transitOverlay.activations.map((act, i) => (
          <PlanetaryTriggerCard key={act.transitPlanet + act.natalPoint + i} act={act} index={i} />
        ))}
      </div>
    </div>
    <StressNotesList notes={transitOverlay.stressNotes} />
  </div>
);

interface TransitOverlaySectionProps {
  transitOverlay: TransitOverlayData | null;
  loadingTransit: boolean;
  agentName: string;
}

export const TransitOverlaySection: React.FC<TransitOverlaySectionProps> = ({
  transitOverlay,
  loadingTransit,
  agentName,
}) => (
  <section className="glass-card-premium rounded-3xl p-6 md:p-8 border-white/8 mb-8 relative overflow-hidden">
    <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">
      Live Celestial Weather & Sky Alignment
    </h2>

    {loadingTransit ? (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
          Scanning orbital telemetry...
        </span>
      </div>
    ) : transitOverlay ? (
      <TransitContent transitOverlay={transitOverlay} />
    ) : (
      <div className="text-center py-8">
        <p className="text-sm text-white/60">No active transit triggers detected for {agentName}.</p>
      </div>
    )}
  </section>
);
