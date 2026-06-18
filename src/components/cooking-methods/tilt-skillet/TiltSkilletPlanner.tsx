"use client";

/**
 * Tilt Skillet — large-batch "recipe as a circuit" planner.
 * Premium tool under /cooking-methods (inherits the Molecular Alchemy theme from the route layout).
 * Builds staged ingredient lists by volume, computes a live recipe-as-a-circuit reading via the
 * existing WTEN engine (computeBatchCircuit → quantityScaling + kalchm/monica + cookingMethodKinetics),
 * and generates a full LLM batch plan through the PA backend proxy.
 */
import { useMemo, useState } from "react";
import { Activity, Flame, FlaskConical, Loader2, Plus, Sparkles, Trash2, Zap } from "lucide-react";
import {
  accentClass,
  ElementBar,
  EquationBlock,
  MaChip,
  MaDataReadout,
  MaPanel,
  MaSectionHeader,
  type ElementName,
} from "@/components/cooking-methods/primitives";
import { computeBatchCircuit, type BatchStageInput, type StageCircuit } from "@/utils/tiltSkilletCircuit";
import type { TiltSkilletBatchPlan, TiltSkilletBody } from "@/types/tiltSkilletSchema";

const UNITS = ["cup", "l", "ml", "tbsp", "tsp", "g", "kg", "piece"] as const;
type Unit = (typeof UNITS)[number];

interface IngredientRow {
  name: string;
  amount: number;
  unit: Unit;
}
interface StageRow {
  name: string;
  ingredients: IngredientRow[];
}

type CircuitRole = TiltSkilletBatchPlan["stages"][number]["circuit_role"];
const ROLE_TONE: Record<CircuitRole, "ember" | "accent" | "cyan" | "emerald"> = {
  source: "ember",
  resistor: "accent",
  capacitor: "cyan",
  load: "emerald",
};

const DEFAULT_STAGES: StageRow[] = [
  {
    name: "Sear the base",
    ingredients: [
      { name: "olive oil", amount: 0.25, unit: "cup" },
      { name: "beef", amount: 4, unit: "cup" },
      { name: "onion", amount: 2, unit: "cup" },
      { name: "garlic", amount: 0.25, unit: "cup" },
    ],
  },
  {
    name: "Braise the bulk",
    ingredients: [
      { name: "stock", amount: 6, unit: "cup" },
      { name: "tomato", amount: 3, unit: "cup" },
      { name: "carrot", amount: 2, unit: "cup" },
    ],
  },
];

function fmt(x: number): string {
  if (!Number.isFinite(x)) return "—";
  const a = Math.abs(x);
  if (a !== 0 && (a >= 100000 || a < 0.001)) return x.toExponential(2);
  if (a >= 100) return x.toFixed(1);
  return x.toFixed(3);
}

export default function TiltSkilletPlanner() {
  const [prompt, setPrompt] = useState(
    "A hearty large-batch braise for the week ahead — deeply savory and freezer-friendly.",
  );
  const [batchServings, setBatchServings] = useState(16);
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("omnivore");
  const [stages, setStages] = useState<StageRow[]>(DEFAULT_STAGES);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TiltSkilletBatchPlan | null>(null);

  // Live deterministic circuit — instant, recomputed on every edit.
  const circuit = useMemo(
    () => computeBatchCircuit(stages as BatchStageInput[]),
    [stages],
  );

  const setStage = (si: number, patch: Partial<StageRow>) =>
    setStages((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const setIngredient = (si: number, ii: number, patch: Partial<IngredientRow>) =>
    setStages((prev) =>
      prev.map((s, i) =>
        i === si
          ? { ...s, ingredients: s.ingredients.map((g, j) => (j === ii ? { ...g, ...patch } : g)) }
          : s,
      ),
    );
  const addIngredient = (si: number) =>
    setStage(si, { ingredients: [...stages[si].ingredients, { name: "", amount: 1, unit: "cup" }] });
  const removeIngredient = (si: number, ii: number) =>
    setStage(si, { ingredients: stages[si].ingredients.filter((_, j) => j !== ii) });
  const addStage = () =>
    setStages((prev) => [
      ...prev,
      { name: `Stage ${prev.length + 1}`, ingredients: [{ name: "", amount: 1, unit: "cup" }] },
    ]);
  const removeStage = (si: number) => setStages((prev) => prev.filter((_, i) => i !== si));

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const body: TiltSkilletBody = {
        prompt,
        batchServings,
        cuisine: cuisine || undefined,
        diet: diet || undefined,
        stages: stages.map((s) => ({
          name: s.name,
          ingredients: s.ingredients
            .filter((g) => g.name.trim())
            .map((g) => ({ name: g.name, amount: g.amount, unit: g.unit })),
        })),
      };
      const res = await fetch("/api/generate-tilt-skillet-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Please sign in to generate a batch plan."
            : res.status === 402
              ? "Upgrade to premium to generate large-batch plans."
              : res.status === 429
                ? "Generating faster than the cosmos can keep up — try again in a moment."
                : res.status >= 500
                  ? "The batch planner is temporarily unavailable. Please try again shortly."
                  : (data?.message ?? data?.error ?? "Failed to generate the batch plan.");
        setError(String(msg));
        return;
      }
      setPlan(data as TiltSkilletBatchPlan);
    } catch {
      setError("Failed to connect to the batch planner. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${accentClass("ember")} mx-auto w-full max-w-7xl px-4 py-8 md:px-6`}>
      {/* Header */}
      <header className="mb-8">
        <div className="ma-label mb-2 text-ma-outline">COOKING_METHODS / TILT_SKILLET</div>
        <h1 className="font-grimoire text-3xl text-ma-fg md:text-4xl">
          <Flame className="mr-2 inline h-7 w-7 text-[var(--ma-accent)]" aria-hidden />
          The Foundry Plate — Batch Circuit Planner
        </h1>
        <p className="mt-2 max-w-3xl text-ma-fg-dim">
          Plan large-batch cooking as a series circuit. Each stage is a reaction with its own
          charge, voltage, current, resistance and power — wired source → load across the cook.
          Volumes drive the math; the planner grounds an LLM batch plan in the live circuit.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* LEFT — batch builder */}
        <div className="space-y-6">
          <MaPanel className="p-6">
            <MaSectionHeader number="01" icon={<FlaskConical className="h-5 w-5" />} title="BATCH_SETUP" />
            <div className="space-y-4">
              <label className="block">
                <span className="ma-label mb-1.5 block text-ma-outline">OBJECTIVE</span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-ma-line bg-ma-surface-low/60 p-2 text-sm text-ma-fg outline-none focus:border-[var(--ma-accent)]"
                />
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="ma-label mb-1.5 block text-ma-outline">SERVINGS</span>
                  <input
                    type="number"
                    min={1}
                    value={batchServings}
                    onChange={(e) => setBatchServings(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded border border-ma-line bg-ma-surface-low/60 p-2 text-sm text-ma-fg outline-none focus:border-[var(--ma-accent)]"
                  />
                </label>
                <label className="block">
                  <span className="ma-label mb-1.5 block text-ma-outline">CUISINE</span>
                  <input
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. French"
                    className="w-full rounded border border-ma-line bg-ma-surface-low/60 p-2 text-sm text-ma-fg outline-none focus:border-[var(--ma-accent)]"
                  />
                </label>
                <label className="block">
                  <span className="ma-label mb-1.5 block text-ma-outline">DIET</span>
                  <input
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    placeholder="omnivore"
                    className="w-full rounded border border-ma-line bg-ma-surface-low/60 p-2 text-sm text-ma-fg outline-none focus:border-[var(--ma-accent)]"
                  />
                </label>
              </div>
            </div>
          </MaPanel>

          {stages.map((stage, si) => (
            <MaPanel key={si} className="p-6">
              <div className="ma-rule mb-4 flex items-center gap-2 pb-3">
                <span className="ma-data text-sm text-ma-outline">{String(si + 1).padStart(2, "0")}</span>
                <input
                  value={stage.name}
                  onChange={(e) => setStage(si, { name: e.target.value })}
                  className="flex-1 bg-transparent font-grimoire text-xl text-ma-fg outline-none"
                />
                <button
                  onClick={() => removeStage(si)}
                  disabled={stages.length <= 1}
                  aria-label="Remove stage"
                  className="text-ma-outline hover:text-ma-ember-soft disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {stage.ingredients.map((g, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    <input
                      value={g.name}
                      onChange={(e) => setIngredient(si, ii, { name: e.target.value })}
                      placeholder="ingredient"
                      className="flex-1 rounded border border-ma-line bg-ma-surface-low/60 px-2 py-1.5 text-sm text-ma-fg outline-none focus:border-[var(--ma-accent)]"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.25"
                      value={g.amount}
                      onChange={(e) => setIngredient(si, ii, { amount: Number(e.target.value) || 0 })}
                      className="w-20 rounded border border-ma-line bg-ma-surface-low/60 px-2 py-1.5 text-sm text-ma-fg outline-none focus:border-[var(--ma-accent)]"
                    />
                    <select
                      value={g.unit}
                      onChange={(e) => setIngredient(si, ii, { unit: e.target.value as Unit })}
                      className="rounded border border-ma-line bg-ma-surface-low/60 px-2 py-1.5 text-sm text-ma-fg outline-none"
                      aria-label="unit"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeIngredient(si, ii)}
                      aria-label="Remove ingredient"
                      className="text-ma-outline hover:text-ma-ember-soft"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addIngredient(si)}
                  className="ma-label mt-1 flex items-center gap-1 text-[var(--ma-accent-soft)] hover:text-[var(--ma-accent)]"
                >
                  <Plus className="h-3.5 w-3.5" /> ADD_INGREDIENT
                </button>
              </div>
            </MaPanel>
          ))}

          <button
            onClick={addStage}
            className="ma-label flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ma-line py-3 text-ma-outline hover:border-[var(--ma-accent)] hover:text-[var(--ma-accent-soft)]"
          >
            <Plus className="h-4 w-4" /> ADD_STAGE
          </button>
        </div>

        {/* RIGHT — live circuit + plan */}
        <div className="space-y-6">
          <MaPanel glow className="p-6">
            <MaSectionHeader number="02" icon={<Zap className="h-5 w-5" />} title="LIVE_CIRCUIT" />
            <CircuitSchematic stages={circuit.stages} />
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MaDataReadout label="TOTAL_V" value={fmt(circuit.series.totalPotential)} valueClassName="text-[var(--ma-accent-soft)]" />
              <MaDataReadout label="SERIES_I" value={fmt(circuit.series.seriesCurrent)} valueClassName="text-[var(--ma-accent-soft)]" />
              <MaDataReadout label="TOTAL_R" value={fmt(circuit.series.totalResistance)} />
              <MaDataReadout label="TOTAL_P" value={fmt(circuit.series.totalPower)} />
              <MaDataReadout label="EFFICIENCY" value={`${Math.round(circuit.series.netEfficiency * 100)}%`} />
              <MaDataReadout label="LOSSES_I²R" value={fmt(circuit.series.totalLosses)} />
              <MaDataReadout label="KALCHM" value={fmt(circuit.series.netKalchm)} />
              <MaDataReadout label="MONICA" value={fmt(circuit.series.netMonica)} />
            </div>
            <div className="mt-5">
              <EquationBlock
                expression="P = I × V   ·   R = Entropy   ·   Losses = I²R"
                label="CIRCUIT_LAW"
                note="Charge Q = Matter + Substance · Voltage V = Greg's Energy / Q · Current I = Reactivity-scaled flow."
              />
            </div>
          </MaPanel>

          {/* per-stage readouts */}
          <MaPanel className="p-6">
            <MaSectionHeader number="03" icon={<Activity className="h-5 w-5" />} title="STAGE_TELEMETRY" />
            <div className="space-y-4">
              {circuit.stages.map((s, i) => (
                <StageReadout key={i} stage={s} />
              ))}
            </div>
          </MaPanel>

          {/* generate */}
          <MaPanel glow className="p-6">
            <MaSectionHeader number="04" icon={<Sparkles className="h-5 w-5" />} title="GENERATE_BATCH_PLAN" />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="ma-label flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--ma-accent)]/50 bg-[rgba(var(--ma-accent-rgb),0.12)] py-3 text-[var(--ma-accent-soft)] hover:bg-[rgba(var(--ma-accent-rgb),0.2)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> DESIGNING_CIRCUIT…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> GENERATE_BATCH_PLAN
                </>
              )}
            </button>
            {error ? (
              <p className="mt-3 rounded border border-ma-ember/40 bg-ma-ember/10 p-2 text-sm text-ma-ember-soft">
                {error}
              </p>
            ) : null}
            {plan ? <PlanView plan={plan} /> : null}
          </MaPanel>
        </div>
      </div>
    </div>
  );
}

/** Compact themed series-circuit schematic with animated current. */
function CircuitSchematic({ stages }: { stages: StageCircuit[] }) {
  const n = Math.max(stages.length, 1);
  const W = Math.max(560, 180 + n * 180);
  const H = 220;
  const left = 60;
  const right = W - 60;
  const top = 60;
  const bottom = 170;
  const loop = `M${left},${top} H${right} V${bottom} H${left} Z`;
  const padL = left + 50;
  const span = right - padL - 30;
  const centers = stages.map((_, i) => padL + ((i + 0.5) * span) / n);
  const iMag = Math.abs(
    stages.reduce((s, r) => s + r.currentFlow, 0) / Math.max(1, stages.length),
  );
  const dur = Math.min(8, Math.max(1.5, 4 / (iMag * 3 + 0.3)));

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-ma-line/40 bg-ma-surface-low/40">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Tilt skillet recipe circuit">
        <defs>
          <path id="ts-loop" d={loop} />
        </defs>
        <use href="#ts-loop" fill="none" stroke="var(--ma-line)" strokeWidth={2.5} />
        {iMag > 1e-9 &&
          [0, 0.33, 0.66].map((off, i) => (
            <circle key={i} r={4} fill="var(--ma-accent)">
              <animateMotion dur={`${dur}s`} begin={`${off * dur}s`} repeatCount="indefinite">
                <mpath href="#ts-loop" />
              </animateMotion>
            </circle>
          ))}
        {/* source marker on left rail */}
        <g transform={`translate(${left}, ${(top + bottom) / 2})`}>
          <line x1={-10} y1={-9} x2={10} y2={-9} stroke="var(--ma-accent)" strokeWidth={2.5} />
          <line x1={-6} y1={2} x2={6} y2={2} stroke="var(--ma-accent)" strokeWidth={2.5} />
        </g>
        {stages.map((s, i) => {
          const cx = centers[i];
          return (
            <g key={i} transform={`translate(${cx}, ${top})`}>
              <line x1={-18} y1={0} x2={18} y2={0} stroke="var(--ma-accent)" strokeWidth={2.5} />
              <rect x={-62} y={-46} width={124} height={40} rx={6} fill="rgba(var(--ma-accent-rgb),0.08)" stroke="var(--ma-accent)" strokeWidth={1.5} />
              <text x={0} y={-30} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--ma-fg)" style={{ fontFamily: "var(--font-grimoire), serif" }}>
                {s.name.length > 16 ? s.name.slice(0, 15) + "…" : s.name}
              </text>
              <text x={0} y={-15} textAnchor="middle" fontSize={9} fill="var(--ma-accent-soft)" style={{ fontFamily: "ui-monospace, monospace" }}>
                V {fmt(s.potentialDifference)} · I {fmt(s.currentFlow)}
              </text>
              <text x={0} y={22} textAnchor="middle" fontSize={9} fill="var(--ma-outline)" style={{ fontFamily: "ui-monospace, monospace" }}>
                P {fmt(s.power)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StageReadout({ stage }: { stage: StageCircuit }) {
  const elements: ElementName[] = ["Fire", "Water", "Earth", "Air"];
  return (
    <div className="rounded-lg border border-ma-line/40 bg-ma-surface-low/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-grimoire text-lg text-ma-fg">{stage.name}</span>
        <MaChip tone="accent">P {fmt(stage.power)} W</MaChip>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <MaDataReadout label="CHARGE_Q" value={fmt(stage.charge)} />
        <MaDataReadout label="VOLT_V" value={fmt(stage.potentialDifference)} />
        <MaDataReadout label="CURR_I" value={fmt(stage.currentFlow)} />
        <MaDataReadout label="RESIST_R" value={fmt(stage.resistance)} />
        <MaDataReadout label="KALCHM" value={fmt(stage.kalchm)} />
        <MaDataReadout label="MONICA" value={fmt(stage.monica)} />
        <MaDataReadout label="EFF" value={`${Math.round(stage.efficiency * 100)}%`} />
        <MaDataReadout label="GREGS_E" value={fmt(stage.gregsEnergy)} />
      </div>
      <div className="mt-3 space-y-2">
        {elements.map((el) => (
          <ElementBar key={el} element={el} percent={(stage.blendedElemental[el] ?? 0) * 100} />
        ))}
      </div>
    </div>
  );
}

function PlanView({ plan }: { plan: TiltSkilletBatchPlan }) {
  const cs = plan.circuit_summary;
  return (
    <div className="mt-5 space-y-4">
      <div>
        <h3 className="font-grimoire text-2xl text-ma-fg">{plan.title}</h3>
        <p className="text-sm text-ma-fg-dim">{plan.summary}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <MaChip>{plan.cuisine}</MaChip>
          <MaChip>{plan.batch_yield}</MaChip>
          <MaChip>{plan.total_time} MIN</MaChip>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--ma-accent)]/30 bg-[rgba(var(--ma-accent-rgb),0.06)] p-4">
        <p className="text-sm text-ma-fg">{cs.narrative}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MaDataReadout label="V" value={fmt(cs.total_voltage)} />
          <MaDataReadout label="I" value={fmt(cs.total_current)} />
          <MaDataReadout label="R" value={fmt(cs.total_resistance)} />
          <MaDataReadout label="P" value={fmt(cs.total_power)} />
          <MaDataReadout label="EFF" value={`${Math.round((cs.efficiency ?? 0) * 100)}%`} />
          <MaDataReadout label="KALCHM" value={fmt(cs.kalchm)} />
          <MaDataReadout label="MONICA" value={fmt(cs.monica)} />
        </div>
      </div>

      <ol className="space-y-3">
        {plan.stages.map((stage) => (
          <li key={stage.step_number} className="rounded-lg border border-ma-line/40 bg-ma-surface-low/40 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-grimoire text-lg text-ma-fg">
                {stage.step_number}. {stage.name}
              </span>
              <MaChip tone={ROLE_TONE[stage.circuit_role]}>{stage.circuit_role.toUpperCase()}</MaChip>
              <span className="ma-label text-ma-outline">
                {stage.temperature_f}°F · {stage.time_minutes}MIN · TILT {stage.tilt_angle_degrees}°
              </span>
            </div>
            {stage.add_to_skillet.length > 0 ? (
              <p className="mt-1 text-xs text-ma-outline">
                ADD: {stage.add_to_skillet.map((g) => `${g.quantity} ${g.unit} ${g.ingredient}`).join(", ")}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-ma-fg-dim">{stage.instruction}</p>
            <p className="mt-1 text-xs italic text-[var(--ma-accent-soft)]">⚡ {stage.reaction_note}</p>
          </li>
        ))}
      </ol>

      <div className="space-y-1 text-xs text-ma-outline">
        <p>
          <span className="ma-label text-ma-outline">FINISHING:</span>{" "}
          {plan.finishing_and_serving.serving_suggestions}
        </p>
        <p>
          <span className="ma-label text-ma-outline">STORAGE:</span>{" "}
          {plan.leftovers_and_storage.storage_instructions} ({plan.leftovers_and_storage.storage_lifespan_days} days)
        </p>
      </div>
    </div>
  );
}
