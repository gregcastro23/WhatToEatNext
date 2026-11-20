"use client";

/**
 * Steps 3 & 4 of the Sauce Pairing Studio console: harmonic role, flavor
 * accents, dietary boundaries, cosmic synchrony, user bias, and pantry filter.
 *
 * @file src/components/recommendations/sauces/SauceIntentionSyncSteps.tsx
 */
import React from "react";
import type { FlavorAxis, SauceRole } from "@/utils/cuisine/cuisineSauceProfiler";
import { DIETARY_OPTIONS, FLAVOR_AXES, ROLES } from "./constants";

export interface StepIntentionProps {
  role: SauceRole;
  onRoleChange: (role: SauceRole) => void;
  flavorTargets: readonly FlavorAxis[];
  onToggleFlavor: (axis: FlavorAxis) => void;
  dietary: readonly string[];
  onToggleDietary: (diet: string) => void;
}

function RoleSelector({ role, onRoleChange }: { role: SauceRole; onRoleChange: (r: SauceRole) => void }): React.ReactElement {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase text-white/60 mb-1.5 block">Harmonic Role</span>
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map((r) => {
          const selected = role === r.key;
          return (
            <button
              key={r.key}
              type="button"
              aria-pressed={selected}
              onClick={() => onRoleChange(r.key)}
              className={`p-2.5 min-h-[44px] rounded-xl text-left border transition-all focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 ${
                selected ? "bg-violet-600/25 border-violet-400/70 text-white ring-1 ring-violet-400/40" : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/25 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-1.5 font-medium text-xs text-white mb-0.5">
                <span aria-hidden="true">{r.glyph}</span>
                <span>{r.label}</span>
              </div>
              <p className="text-[10px] text-white/60 leading-tight">{r.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FlavorSelector({
  flavorTargets,
  onToggleFlavor,
}: {
  flavorTargets: readonly FlavorAxis[];
  onToggleFlavor: (axis: FlavorAxis) => void;
}): React.ReactElement {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase text-white/60 mb-1.5 block">Target Flavor Accents</span>
      <div className="flex flex-wrap gap-1.5">
        {FLAVOR_AXES.map((f) => {
          const active = flavorTargets.includes(f.key);
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleFlavor(f.key)}
              className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono transition-all border focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 ${
                active ? `${f.tone} ring-1 ring-white/25` : "bg-white/[0.03] border-white/10 text-white/65 hover:border-white/25 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DietarySelector({
  dietary,
  onToggleDietary,
}: {
  dietary: readonly string[];
  onToggleDietary: (diet: string) => void;
}): React.ReactElement {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase text-white/60 mb-1.5 block">Dietary Boundaries</span>
      <div className="flex flex-wrap gap-1.5">
        {DIETARY_OPTIONS.map((d) => {
          const active = dietary.includes(d.key);
          return (
            <button
              key={d.key}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleDietary(d.key)}
              className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-mono transition-all border flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${
                active ? "bg-emerald-500/20 border-emerald-400/60 text-emerald-200" : "bg-white/[0.03] border-white/10 text-white/65 hover:border-white/25 hover:text-white"
              }`}
            >
              <span aria-hidden="true">{d.icon}</span>
              <span>{d.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StepIntention({
  role,
  onRoleChange,
  flavorTargets,
  onToggleFlavor,
  dietary,
  onToggleDietary,
}: StepIntentionProps): React.ReactElement {
  return (
    <section className="space-y-3 pt-3 border-t border-white/5">
      <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
          3
        </span>
        Alchemical Intention
      </h3>
      <RoleSelector role={role} onRoleChange={onRoleChange} />
      <FlavorSelector flavorTargets={flavorTargets} onToggleFlavor={onToggleFlavor} />
      <DietarySelector dietary={dietary} onToggleDietary={onToggleDietary} />
    </section>
  );
}

export interface StepSynchronyProps {
  cosmicSync: boolean;
  onToggleCosmicSync: () => void;
  strictCuisine: boolean;
  onToggleStrictCuisine: () => void;
  applyUserBias: boolean;
  onToggleUserBias: () => void;
  hasUserBias: boolean;
  biasSource: string | null;
  pantryFirst: boolean;
  onTogglePantryFirst: () => void;
  pantryCount: number;
  currentZodiac?: string;
  planetaryHour?: string | null;
  detectedSeason: string;
  isDaytime: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

function SyncSwitchGrid(props: Pick<StepSynchronyProps, "cosmicSync" | "onToggleCosmicSync" | "strictCuisine" | "onToggleStrictCuisine" | "detectedSeason" | "isDaytime">): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        aria-pressed={props.cosmicSync}
        onClick={props.onToggleCosmicSync}
        className={`p-2.5 min-h-[44px] rounded-xl border text-left transition-all focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 ${
          props.cosmicSync ? "bg-purple-950/40 border-purple-500/60 text-white" : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
        }`}
      >
        <div className="text-xs font-mono font-medium flex items-center justify-between">
          <span>Cosmic Sync</span>
          <span>{props.cosmicSync ? "ON" : "OFF"}</span>
        </div>
        <div className="text-[10px] text-white/55 mt-0.5">{props.detectedSeason} · {props.isDaytime ? "Daytime" : "Night"}</div>
      </button>

      <button
        type="button"
        aria-pressed={props.strictCuisine}
        onClick={props.onToggleStrictCuisine}
        className={`p-2.5 min-h-[44px] rounded-xl border text-left transition-all focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2 ${
          props.strictCuisine ? "bg-amber-950/40 border-amber-500/60 text-white" : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
        }`}
      >
        <div className="text-xs font-mono font-medium flex items-center justify-between">
          <span>Tradition Gate</span>
          <span>{props.strictCuisine ? "STRICT" : "GLOBAL"}</span>
        </div>
        <div className="text-[10px] text-white/55 mt-0.5">{props.strictCuisine ? "Cuisine native only" : "Cross-cultural bridges"}</div>
      </button>
    </div>
  );
}

export function StepSynchrony(props: StepSynchronyProps): React.ReactElement {
  return (
    <section className="space-y-3 pt-3 border-t border-white/5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold">
            4
          </span>
          Cosmic & Kitchen Sync
        </h3>
        <span className="text-[10px] font-mono text-purple-300/80">
          {props.currentZodiac ? `☉ ${props.currentZodiac}` : ""}
          {props.planetaryHour ? ` · ♃ ${props.planetaryHour}` : ""}
        </span>
      </div>

      <SyncSwitchGrid
        cosmicSync={props.cosmicSync}
        onToggleCosmicSync={props.onToggleCosmicSync}
        strictCuisine={props.strictCuisine}
        onToggleStrictCuisine={props.onToggleStrictCuisine}
        detectedSeason={props.detectedSeason}
        isDaytime={props.isDaytime}
      />

      {props.hasUserBias && (
        <button
          type="button"
          aria-pressed={props.applyUserBias}
          onClick={props.onToggleUserBias}
          className={`w-full min-h-[44px] p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 ${
            props.applyUserBias ? "bg-violet-950/40 border-violet-500/40 text-violet-200" : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
          }`}
        >
          <span>✦ Personal {props.biasSource === "chart" ? "Natal Chart" : "Commensal Table"} Alignment</span>
          <span className="text-[10px] uppercase font-bold text-violet-300">{props.applyUserBias ? "ACTIVE" : "BYPASSED"}</span>
        </button>
      )}

      {props.pantryCount > 0 && (
        <button
          type="button"
          aria-pressed={props.pantryFirst}
          onClick={props.onTogglePantryFirst}
          className={`w-full min-h-[44px] p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-2 ${
            props.pantryFirst ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200" : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
          }`}
        >
          <span>🧺 Prioritize Pantry Matches ({props.pantryCount} stocked)</span>
          <span className="text-[10px] uppercase font-bold text-emerald-300">{props.pantryFirst ? "FIRST" : "OFF"}</span>
        </button>
      )}

      {props.hasActiveFilters && (
        <button
          type="button"
          onClick={props.onResetFilters}
          className="w-full min-h-[40px] py-2 px-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono uppercase tracking-wider text-white/75 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2"
        >
          Reset Composition Filters
        </button>
      )}
    </section>
  );
}
