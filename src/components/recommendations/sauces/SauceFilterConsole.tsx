"use client";

/**
 * Accessible 4-step configuration console for the Sauce Pairing Studio.
 *
 * @file src/components/recommendations/sauces/SauceFilterConsole.tsx
 */
import React from "react";
import type { CuisineFingerprint, FlavorAxis, SauceRole } from "@/utils/cuisine/cuisineSauceProfiler";
import { COOKING_METHODS, PROTEINS, SEASONS, VEGETABLES, type SeasonValue } from "./constants";
import CuisineTelemetryCard from "./CuisineTelemetryCard";
import { StepIntention, StepSynchrony } from "./SauceIntentionSyncSteps";

export interface SauceFilterConsoleProps {
  availableCuisines: ReadonlyArray<{ key: string; name: string; sauceCount: number }>;
  cuisineKey: string;
  onCuisineChange: (key: string) => void;
  region?: string;
  onRegionChange: (region: string | undefined) => void;
  fingerprint: CuisineFingerprint | null;
  ingredientSlugs: Record<string, string>;
  protein?: string;
  onProteinChange: (protein: string | undefined) => void;
  vegetable?: string;
  onVegetableChange: (vegetable: string | undefined) => void;
  cookingMethod?: string;
  onCookingMethodChange: (method: string | undefined) => void;
  season: SeasonValue;
  onSeasonChange: (season: SeasonValue) => void;
  role: SauceRole;
  onRoleChange: (role: SauceRole) => void;
  flavorTargets: readonly FlavorAxis[];
  onToggleFlavor: (axis: FlavorAxis) => void;
  dietary: readonly string[];
  onToggleDietary: (diet: string) => void;
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

const SELECT_CLS =
  "w-full min-h-[44px] bg-[#15121f] text-white border border-white/15 rounded-xl px-3 py-2 text-base sm:text-sm [color-scheme:dark] focus:border-violet-400 focus-visible:outline-2 focus-visible:outline-violet-400 focus-visible:outline-offset-2 transition-colors";

function parseSeason(val: string): SeasonValue {
  const match = SEASONS.find((s) => s.key === val);
  return match ? match.key : "all";
}

function SelectField({
  id,
  name,
  label,
  value,
  emptyLabel,
  options,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  emptyLabel?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}): React.ReactElement {
  return (
    <div>
      <label htmlFor={id} className="text-[10px] font-mono uppercase text-white/60 mb-1 block">
        {label}
      </label>
      <select id={id} name={name} value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLS}>
        {emptyLabel !== undefined && <option value="" className="bg-[#15121f] text-white">{emptyLabel}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#15121f] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StepTradition(
  props: Pick<
    SauceFilterConsoleProps,
    "availableCuisines" | "cuisineKey" | "onCuisineChange" | "region" | "onRegionChange" | "fingerprint" | "ingredientSlugs"
  >,
): React.ReactElement {
  const cuisineOptions = props.availableCuisines.map((c) => ({
    value: c.key,
    label: c.sauceCount > 0 ? `${c.name} (${c.sauceCount})` : c.name,
  }));
  const regionOptions = (props.fingerprint?.regions ?? []).map((r) => ({ value: r.key, label: r.name }));

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center justify-center text-[10px] font-bold">
            1
          </span>
          Culinary Tradition
        </h3>
        <span className="text-[10px] font-mono text-violet-300/80 tabular-nums">
          {props.availableCuisines.length} Traditions
        </span>
      </div>
      <div className="space-y-3">
        <SelectField
          id="sauce-cuisine-key"
          name="cuisine"
          label="Cuisine Culture"
          value={props.cuisineKey}
          options={cuisineOptions}
          onChange={(val) => {
            props.onCuisineChange(val);
            props.onRegionChange(undefined);
          }}
        />
        {props.fingerprint && regionOptions.length > 0 && (
          <SelectField
            id="sauce-region"
            name="region"
            label="Regional Dialect"
            value={props.region ?? ""}
            emptyLabel={`Pan-${props.fingerprint.name} Tradition`}
            options={regionOptions}
            onChange={(val) => props.onRegionChange(val || undefined)}
          />
        )}
        <CuisineTelemetryCard fingerprint={props.fingerprint} ingredientSlugs={props.ingredientSlugs} />
      </div>
    </section>
  );
}

function StepComposition(
  props: Pick<
    SauceFilterConsoleProps,
    "protein" | "onProteinChange" | "vegetable" | "onVegetableChange" | "cookingMethod" | "onCookingMethodChange" | "season" | "onSeasonChange"
  >,
): React.ReactElement {
  return (
    <section className="space-y-3 pt-3 border-t border-white/5">
      <h3 className="text-xs font-mono uppercase tracking-wider text-white flex items-center gap-2">
        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold">
          2
        </span>
        Dish Composition
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SelectField id="sauce-protein" name="protein" label="Protein Core" value={props.protein ?? ""} emptyLabel="Any / Universal" options={PROTEINS.map((p) => ({ value: p.key, label: p.label }))} onChange={(v) => props.onProteinChange(v || undefined)} />
        <SelectField id="sauce-vegetable" name="vegetable" label="Produce / Botanical" value={props.vegetable ?? ""} emptyLabel="Any / Botanical" options={VEGETABLES.map((v) => ({ value: v.key, label: v.label }))} onChange={(v) => props.onVegetableChange(v || undefined)} />
        <SelectField id="sauce-cooking-method" name="cookingMethod" label="Culinary Method" value={props.cookingMethod ?? ""} emptyLabel="Any Technique" options={COOKING_METHODS.map((m) => ({ value: m.key, label: m.label }))} onChange={(v) => props.onCookingMethodChange(v || undefined)} />
        <SelectField id="sauce-season" name="season" label="Seasonal Alignment" value={props.season} options={SEASONS.map((s) => ({ value: s.key, label: s.label }))} onChange={(v) => props.onSeasonChange(parseSeason(v))} />
      </div>
    </section>
  );
}

export default function SauceFilterConsole(props: SauceFilterConsoleProps): React.ReactElement {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0c16]/90 p-5 md:p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] space-y-6">
      <StepTradition
        availableCuisines={props.availableCuisines}
        cuisineKey={props.cuisineKey}
        onCuisineChange={props.onCuisineChange}
        {...(props.region !== undefined ? { region: props.region } : {})}
        onRegionChange={props.onRegionChange}
        fingerprint={props.fingerprint}
        ingredientSlugs={props.ingredientSlugs}
      />
      <StepComposition
        {...(props.protein !== undefined ? { protein: props.protein } : {})}
        onProteinChange={props.onProteinChange}
        {...(props.vegetable !== undefined ? { vegetable: props.vegetable } : {})}
        onVegetableChange={props.onVegetableChange}
        {...(props.cookingMethod !== undefined ? { cookingMethod: props.cookingMethod } : {})}
        onCookingMethodChange={props.onCookingMethodChange}
        season={props.season}
        onSeasonChange={props.onSeasonChange}
      />
      <StepIntention
        role={props.role}
        onRoleChange={props.onRoleChange}
        flavorTargets={props.flavorTargets}
        onToggleFlavor={props.onToggleFlavor}
        dietary={props.dietary}
        onToggleDietary={props.onToggleDietary}
      />
      <StepSynchrony
        cosmicSync={props.cosmicSync}
        onToggleCosmicSync={props.onToggleCosmicSync}
        strictCuisine={props.strictCuisine}
        onToggleStrictCuisine={props.onToggleStrictCuisine}
        applyUserBias={props.applyUserBias}
        onToggleUserBias={props.onToggleUserBias}
        hasUserBias={props.hasUserBias}
        biasSource={props.biasSource}
        pantryFirst={props.pantryFirst}
        onTogglePantryFirst={props.onTogglePantryFirst}
        pantryCount={props.pantryCount}
        {...(props.currentZodiac ? { currentZodiac: props.currentZodiac } : {})}
        {...(props.planetaryHour !== undefined ? { planetaryHour: props.planetaryHour } : {})}
        detectedSeason={props.detectedSeason}
        isDaytime={props.isDaytime}
        hasActiveFilters={props.hasActiveFilters}
        onResetFilters={props.onResetFilters}
      />
    </div>
  );
}
