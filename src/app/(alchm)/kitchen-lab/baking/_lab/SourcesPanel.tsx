"use client";

import { useState, type JSX } from "react";
import { BAKING_INGREDIENTS, bakingIngredient } from "@/data/baking";
import { CITATIONS, citation } from "@/lib/baking/citations";
import { SIM } from "@/lib/baking/sim/constants";
import type { BakingIngredient, Basis, BasisKind, ProvenanceField } from "@/lib/baking/types";

function ProvenanceChip({ basis }: { basis: Basis }): JSX.Element {
  const c = citation(basis.source);
  const fdc = basis.fdcId === undefined ? "" : ` · FDC ${basis.fdcId}`;
  const title = [c?.full ?? basis.source, basis.note].filter((s) => s !== undefined && s !== "").join(" — ");
  return (
    <span className="bl-chip" data-kind={basis.kind} title={title}>
      {basis.kind} · {c?.short ?? basis.source}
      {fdc}
    </span>
  );
}

const FIELDS: ReadonlyArray<[ProvenanceField, string, (i: BakingIngredient) => string]> = [
  ["composition", "Composition (water / fat / protein / starch)", (i): string => `${i.waterPct.toFixed(1)} / ${i.fatPct.toFixed(1)} / ${i.proteinPct.toFixed(1)} / ${i.starchPct.toFixed(1)} g`],
  ["sugars", "Sugars", (i): string => `${i.sugarPct.toFixed(1)} g`],
  ["pod", "POD (sucrose = 100)", (i): string => i.pod.toFixed(1)],
  ["pac", "PAC (sucrose = 100)", (i): string => i.pac.toFixed(1)],
  ["reducingSugarScore", "Reducing share", (i): string => i.reducingSugarScore.toFixed(2)],
  ["solidFatIndex", "Solid fat at 20 °C", (i): string => (i.solidFatIndex === null ? "—" : i.solidFatIndex.toFixed(2))],
  ["meltingPointC", "Fat clear point", (i): string => (i.meltingPointC === null ? "—" : `${i.meltingPointC.toFixed(1)} °C`)],
  ["glutenPotency", "Gluten-forming share of protein", (i): string => i.glutenPotency.toFixed(2)],
  ["coagulationTempC", "Protein setting window", (i): string => (i.coagulationTempC === null ? "—" : `${i.coagulationTempC}–${i.coagulationEndC ?? "?"} °C`)],
  ["gelatinizationTempC", "Starch gelatinization onset", (i): string => (i.gelatinizationTempC === null ? "—" : `${i.gelatinizationTempC.toFixed(1)} °C`)],
  ["fiberWaterBinding", "Fibre water binding", (i): string => `${i.fiberWaterBinding.toFixed(2)} g/g`],
  ["pH", "pH", (i): string => (i.pH === null ? "—" : i.pH.toFixed(2))],
  ["acidMmolPerG", "Titratable acid", (i): string => (i.acidMmolPerG === null ? "unquantified" : `${i.acidMmolPerG.toFixed(3)} mmol/g`)],
  ["bicarbonateMmolPerG", "Bicarbonate", (i): string => `${i.bicarbonateMmolPerG.toFixed(2)} mmol/g`],
  ["leaveningGasYield", "CO₂ potential", (i): string => `${i.leaveningGasYield.toFixed(3)} g/g`],
  ["naclPct", "NaCl", (i): string => `${i.naclPct.toFixed(1)} g`],
];

function census(): Record<BasisKind, number> {
  const out: Record<BasisKind, number> = { MEASURED: 0, DERIVED: 0, COMPUTED: 0, DECLARED: 0, ABSENT: 0 };
  for (const i of BAKING_INGREDIENTS) for (const [field] of FIELDS) out[i.provenance[field].kind] += 1;
  return out;
}

function IngredientDetail({ id }: { id: string }): JSX.Element {
  const i = bakingIngredient(id);
  return (
    <div className="mt-3">
      {i.fdc === null ? (
        <p className="text-[12px] text-white/55">No FoodData Central record: the composition is {i.provenance.composition.kind.toLowerCase()}.</p>
      ) : (
        <p className="text-[12px] text-white/55">
          FDC{" "}
          <a className="underline" href={`https://fdc.nal.usda.gov/food-details/${i.fdc.fdcId}/nutrients`} target="_blank" rel="noreferrer">
            {i.fdc.fdcId}
          </a>{" "}
          · {i.fdc.description} · {i.fdc.dataType}
        </p>
      )}
      <table className="bl-table mt-2">
        <tbody>
          {FIELDS.map(([field, label, read]) => (
            <tr key={field}>
              <td className="text-white/70">{label}</td>
              <td className="bl-num">{read(i)}</td>
              <td>
                <ProvenanceChip basis={i.provenance[field]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {i.notes.length > 0 ? <ul className="mt-2 space-y-1 text-[12px] text-white/55">{i.notes.map((n) => <li key={n}>• {n}</li>)}</ul> : null}
    </div>
  );
}

function ModelConstants(): JSX.Element {
  return (
    <table className="bl-table">
      <tbody>
        {Object.entries(SIM).map(([key, c]) => (
          <tr key={key}>
            <td className="text-white/70">{c.label}</td>
            <td className="bl-num whitespace-nowrap">
              {Number(c.value.toPrecision(6))} {c.unit}
            </td>
            <td>
              <ProvenanceChip basis={c.basis} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SourcesPanel(): JSX.Element {
  const [id, setId] = useState(BAKING_INGREDIENTS[0]?.id ?? "");
  const counts = census();
  return (
    <div className="space-y-4">
      <div className="bl-card">
        <h2 className="text-xl">Where every number comes from</h2>
        <p className="mt-1 text-sm text-white/65">
          {BAKING_INGREDIENTS.length} ingredients × {FIELDS.length} fields: {counts.MEASURED} measured · {counts.DERIVED} derived · {counts.COMPUTED} computed · {counts.DECLARED} declared model choices · {counts.ABSENT} absent (no value claimed).
        </p>
        <label htmlFor="bl-src-ing" className="mt-3 block">
          <span className="bl-label">Ingredient</span>{" "}
          <select id="bl-src-ing" className="bl-input" value={id} onChange={(e) => setId(e.target.value)}>
            {BAKING_INGREDIENTS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <IngredientDetail id={id} />
      </div>
      <div className="bl-card">
        <h3 className="text-lg">Simulator constants</h3>
        <ModelConstants />
      </div>
      <div className="bl-card">
        <h3 className="text-lg">References</h3>
        <ul className="space-y-1 text-[12px] text-white/65">
          {Object.entries(CITATIONS).map(([key, c]) => (
            <li key={key}>
              <span className="bl-chip mr-1">{c.confidence}</span>
              {c.url === null ? c.full : <a className="underline" href={c.url} target="_blank" rel="noreferrer">{c.full}</a>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
