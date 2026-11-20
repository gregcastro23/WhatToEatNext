"use client";

/**
 * Expanded dossier & batch-scaler drawer content for SauceResultCard.
 *
 * @file src/components/recommendations/sauces/SauceDrawerContent.tsx
 */
import React, { useMemo, useState } from "react";
import { ALL_ESMS_NAMES, ESMS_META } from "@/components/menu-planner/redesign/elementUtils";
import type { Sauce as DataSauce } from "@/data/sauces";
import type { CuisineSauceResult } from "@/utils/cuisine/cuisineSauceProfiler";
import { roundedCalories } from "@/utils/roundedCalories";
import { formatScaledYield, scaleSauceIngredients } from "@/utils/sauceScaling";

export interface SauceDrawerContentProps {
  drawerId: string;
  result: CuisineSauceResult;
  dataSauce?: DataSauce;
}

function ReasoningBox({ reasoning }: { reasoning: readonly string[] }): React.ReactElement | null {
  if (reasoning.length === 0) return null;
  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-950/20 p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-violet-300 mb-2">Alchemical Reasoning</p>
      <ul className="space-y-1.5">
        {reasoning.map((reason, idx) => (
          <li key={idx} className="text-xs text-white/75 flex items-start gap-2 leading-relaxed">
            <span className="text-emerald-400 mt-0.5" aria-hidden="true">✦</span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EsmsBox({ esms }: { esms?: DataSauce["alchemicalProperties"] }): React.ReactElement | null {
  if (!esms) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
      <span className="text-[10px] font-mono uppercase tracking-widest text-violet-300 block">Authored ESMS Signature</span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ALL_ESMS_NAMES.map((key) => {
          const meta = ESMS_META[key];
          return (
            <div key={key} className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5" title={meta.principle}>
              <div className={`text-[10px] font-mono ${meta.text}`}>{meta.symbol} {meta.label}</div>
              <div className="text-xs font-mono font-bold text-white tabular-nums">{esms[key].toFixed(1)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BatchStepper({
  scaleMultiplier,
  onDecrease,
  onReset,
  onIncrease,
}: {
  scaleMultiplier: number;
  onDecrease: () => void;
  onReset: () => void;
  onIncrease: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-center border border-white/15 rounded-lg bg-black/40 overflow-hidden">
      <button
        type="button"
        disabled={scaleMultiplier <= 0.5}
        onClick={onDecrease}
        aria-label="Decrease batch scale"
        className="min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] px-2.5 py-1 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed text-xs text-white/80 focus-visible:outline-2 focus-visible:outline-violet-400"
      >
        −
      </button>
      {scaleMultiplier === 1 ? (
        <span className="px-2 py-1 text-[11px] font-mono text-white/90 border-x border-white/10 tabular-nums">1x</span>
      ) : (
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset batch scale to 1x"
          title="Click to reset batch scale to 1x"
          className="min-h-[36px] sm:min-h-[32px] px-2 py-1 text-[11px] font-mono text-amber-200 hover:bg-white/10 border-x border-white/10 tabular-nums focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          {scaleMultiplier}x ↺
        </button>
      )}
      <button
        type="button"
        disabled={scaleMultiplier >= 4}
        onClick={onIncrease}
        aria-label="Increase batch scale"
        className="min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] px-2.5 py-1 hover:bg-white/10 disabled:opacity-35 disabled:cursor-not-allowed text-xs text-white/80 focus-visible:outline-2 focus-visible:outline-violet-400"
      >
        +
      </button>
    </div>
  );
}

function DosageHeader({
  yieldLabel,
  scaleMultiplier,
  onDecrease,
  onReset,
  onIncrease,
}: {
  yieldLabel: string;
  scaleMultiplier: number;
  onDecrease: () => void;
  onReset: () => void;
  onIncrease: () => void;
}): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Recipe Dosage</span>
        <h5 className="text-xs font-medium text-white">Ingredients & Proportions</h5>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-violet-300 tabular-nums">{yieldLabel}</span>
        <BatchStepper
          scaleMultiplier={scaleMultiplier}
          onDecrease={onDecrease}
          onReset={onReset}
          onIncrease={onIncrease}
        />
      </div>
    </div>
  );
}

function RecipeDosageBox({
  sauce,
  dataSauce,
}: {
  sauce: CuisineSauceResult["sauce"];
  dataSauce?: DataSauce;
}): React.ReactElement | null {
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const rawIngredients = sauce.ingredients ?? dataSauce?.ingredients;
  const yieldText = sauce.yield ?? dataSauce?.yield;
  const scaled = useMemo(
    () => (rawIngredients ? scaleSauceIngredients([...rawIngredients], scaleMultiplier) : []),
    [rawIngredients, scaleMultiplier],
  );
  const yieldLabel = useMemo(() => formatScaledYield(yieldText, scaleMultiplier), [yieldText, scaleMultiplier]);
  if (!rawIngredients || rawIngredients.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
      <DosageHeader
        yieldLabel={yieldLabel}
        scaleMultiplier={scaleMultiplier}
        onDecrease={() => setScaleMultiplier((m) => Math.max(0.5, m - 0.5))}
        onReset={() => setScaleMultiplier(1)}
        onIncrease={() => setScaleMultiplier((m) => Math.min(4, m + 0.5))}
      />
      <ul className="text-xs space-y-1.5 divide-y divide-white/5">
        {scaled.map((ing, idx) => (
          <li key={idx} className="pt-1.5 first:pt-0 text-white/80">{ing}</li>
        ))}
      </ul>
    </div>
  );
}

function TagChipRow({
  label,
  items,
  chipClass,
}: {
  label: string;
  items?: readonly string[];
  chipClass: string;
}): React.ReactElement | null {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/50 block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`text-[11px] px-2 py-0.5 rounded-md border ${chipClass}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function StepsAndTags({
  sauce,
  dataSauce,
}: {
  sauce: CuisineSauceResult["sauce"];
  dataSauce?: DataSauce;
}): React.ReactElement {
  const steps = sauce.preparationSteps ?? dataSauce?.preparationSteps;
  const culinaryUses = sauce.culinaryUses ?? dataSauce?.culinaryUses;
  const { variants } = sauce;

  return (
    <>
      {steps && steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/50">Execution Method</p>
          <ol className="space-y-2">
            {steps.map((step, idx) => (
              <li key={idx} className="text-xs text-white/75 flex items-start gap-2.5 leading-relaxed bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <span className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {culinaryUses && (
        <TagChipRow
          label="Culinary Uses"
          items={culinaryUses}
          chipClass="bg-white/[0.04] border-white/10 text-white/75"
        />
      )}
      {variants && (
        <TagChipRow
          label="Derivatives & Regional Variants"
          items={variants}
          chipClass="bg-amber-500/10 border-amber-500/25 text-amber-200 italic"
        />
      )}
    </>
  );
}

function MetaFooter({
  sauce,
  dataSauce,
}: {
  sauce: CuisineSauceResult["sauce"];
  dataSauce?: DataSauce;
}): React.ReactElement | null {
  const prepNotes = sauce.preparationNotes ?? dataSauce?.preparationNotes;
  const tips = sauce.technicalTips ?? dataSauce?.technicalTips;
  const storage = sauce.storageInstructions ?? dataSauce?.storageInstructions;
  const difficulty = sauce.difficulty ?? dataSauce?.difficulty;
  const prepTime = sauce.prepTime ?? dataSauce?.prepTime;
  const cookTime = sauce.cookTime ?? dataSauce?.cookTime;
  const yieldText = sauce.yield ?? dataSauce?.yield;
  const nutrition = sauce.nutritionalProfile ?? dataSauce?.nutritionalProfile;
  const hasNotes = [prepNotes, tips, storage].some(Boolean);
  const hasStats = [difficulty, prepTime, cookTime, yieldText, nutrition].some(Boolean);
  if (!hasNotes && !hasStats) return null;

  return (
    <>
      {hasNotes && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-2 text-xs leading-relaxed">
          {prepNotes && <p className="text-white/80">📝 {prepNotes}</p>}
          {tips && <p className="text-amber-200">💡 {tips}</p>}
          {storage && <p className="text-white/65">🧊 {storage}</p>}
        </div>
      )}
      {hasStats && (
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-white/60 pt-1">
          {difficulty && <span>Difficulty: {difficulty}</span>}
          {prepTime && <span>Prep: {prepTime}</span>}
          {cookTime && <span>Cook: {cookTime}</span>}
          {yieldText && <span>Yield: {yieldText}</span>}
          {nutrition && (
            <span>
              {roundedCalories(nutrition.calories) ?? "—"} cal · {nutrition.protein ?? 0}g P ·{" "}
              {nutrition.fat ?? 0}g F · {nutrition.carbs ?? 0}g C
            </span>
          )}
        </div>
      )}
    </>
  );
}

export default function SauceDrawerContent({
  drawerId,
  result,
  dataSauce,
}: SauceDrawerContentProps): React.ReactElement {
  const { sauce } = result;
  const esms = sauce.alchemicalProperties ?? dataSauce?.alchemicalProperties;

  return (
    <div id={drawerId} className="pt-4 border-t border-white/10 space-y-4">
      <ReasoningBox reasoning={result.reasoning} />
      {esms && <EsmsBox esms={esms} />}
      <RecipeDosageBox sauce={sauce} {...(dataSauce ? { dataSauce } : {})} />
      <StepsAndTags sauce={sauce} {...(dataSauce ? { dataSauce } : {})} />
      <MetaFooter sauce={sauce} {...(dataSauce ? { dataSauce } : {})} />
    </div>
  );
}
