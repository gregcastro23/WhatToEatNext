import type { BatchCircuit, StageCircuit } from "@/utils/cauldronVesselCore";
import type { ProfileMapping } from "@/utils/cauldronVesselProfile";
import type { JSX } from "react";

/**
 * Read-outs for the alchm cauldron: the ruled vessel → circuit mapping, each
 * stage's ESMS and circuit, and the series totals.
 *
 * @file src/components/lab/cauldron/CauldronReadouts.tsx
 */

function fmt(x: number): string {
  if (!Number.isFinite(x)) return "—";
  const a = Math.abs(x);
  if (a !== 0 && (a >= 100000 || a < 0.001)) return x.toExponential(2);
  if (a >= 100) return x.toFixed(1);
  return x.toFixed(3);
}

const CELL = "py-1.5 pr-3 font-mono tabular-nums";
const HEAD = "py-1.5 pr-3 text-left text-[10px] font-medium uppercase tracking-wider text-white/40";

export function ProfileMappingTable({ mappings }: { mappings: readonly ProfileMapping[] }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] border-collapse text-xs">
        <caption className="mb-2 text-left text-xs text-white/45">
          How the SI vessel drives the circuit.{" "}
          <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber-200">
            Proposed ruling
          </span>{" "}
          The readings are computed; which reading drives which field is a choice, shown in full.
        </caption>
        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className={HEAD}>Field</th>
            <th scope="col" className={HEAD}>Value</th>
            <th scope="col" className={HEAD}>SI reading</th>
            <th scope="col" className={HEAD}>Mapping</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map((m) => (
            <tr key={m.field} className="border-b border-white/5 align-top">
              <td className="py-1.5 pr-3 text-white/75">{m.label}</td>
              <td className={`${CELL} text-white/90`}>{fmt(m.value)}</td>
              <td className={`${CELL} text-white/55`}>{m.reading}</td>
              <td className={`${CELL} text-white/45`}>{m.formula}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STAGE_COLUMNS: ReadonlyArray<[string, (s: StageCircuit) => number]> = [
  ["Spirit", (s): number => s.esms.Spirit],
  ["Essence", (s): number => s.esms.Essence],
  ["Matter", (s): number => s.esms.Matter],
  ["Substance", (s): number => s.esms.Substance],
  ["Kalchm", (s): number => s.kalchm],
  ["Monica", (s): number => s.monica],
  ["Q", (s): number => s.charge],
  ["V", (s): number => s.potentialDifference],
  ["I", (s): number => s.currentFlow],
  ["P", (s): number => s.power],
  ["R", (s): number => s.resistance],
  ["η", (s): number => s.efficiency],
];

export function StageCircuitTable({ circuit }: { circuit: BatchCircuit }): JSX.Element {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-xs">
        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className={HEAD}>Stage</th>
            {STAGE_COLUMNS.map(([label]) => (
              <th key={label} scope="col" className={HEAD}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {circuit.stages.map((s, i) => (
            <tr key={`${i}-${s.name}`} className="border-b border-white/5">
              <td className="py-1.5 pr-3 text-white/75">{s.name}</td>
              {STAGE_COLUMNS.map(([label, read]) => (
                <td key={label} className={`${CELL} text-white/70`}>{fmt(read(s))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SeriesSummary({ circuit }: { circuit: BatchCircuit }): JSX.Element {
  const { series } = circuit;
  const cells: ReadonlyArray<[string, number]> = [
    ["Total charge Q", series.totalCharge],
    ["Total potential V", series.totalPotential],
    ["Series current I", series.seriesCurrent],
    ["Total power P", series.totalPower],
    ["Total resistance R", series.totalResistance],
    ["Net efficiency η", series.netEfficiency],
    ["Net Kalchm", series.netKalchm],
    ["Mean Monica", series.netMonica],
  ];
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cells.map(([label, value]) => (
        <div key={label} className="rounded border border-white/10 bg-white/[0.02] px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-white/40">{label}</dt>
          <dd className="mt-0.5 font-mono text-sm tabular-nums text-white/90">{fmt(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
