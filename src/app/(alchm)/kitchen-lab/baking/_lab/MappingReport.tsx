"use client";

import { type JSX } from "react";
import { bakingIngredient } from "@/data/baking";
import type { MappingReport as Report, SourceLine } from "@/lib/baking/recipes/sourceTypes";
import { ProvenanceChip } from "./SourcesPanel";

function lineText(line: SourceLine): string {
  const amount = Number.isInteger(line.amount) ? String(line.amount) : Number(line.amount.toFixed(3)).toString();
  return `${amount} ${line.unit} ${line.name}`.replace(/\s+/g, " ").trim();
}

function pct(share: number | null): string {
  return share === null ? "unknown" : `${(share * 100).toFixed(0)} %`;
}

function Matched({ report }: { report: Report }): JSX.Element {
  return (
    <details open className="bl-report">
      <summary>Matched lines ({report.matched.length})</summary>
      <div className="overflow-x-auto">
        <table className="bl-table">
          <thead>
            <tr>
              <th scope="col">Recipe line</th>
              <th scope="col">Vector</th>
              <th scope="col" className="text-right">Grams</th>
              <th scope="col">Basis</th>
            </tr>
          </thead>
          <tbody>
            {report.matched.map((m, i) => (
              <tr key={`${m.vectorId}-${i}`}>
                <td className="text-white/70">{lineText(m.source)}</td>
                <td>{bakingIngredient(m.vectorId).name}</td>
                <td className="bl-num text-right" title={m.how}>
                  {m.grams.toFixed(1)}
                </td>
                <td>
                  <ProvenanceChip basis={m.basis} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Unread({ report }: { report: Report }): JSX.Element | null {
  if (report.unmatched.length === 0 && report.setAside.length === 0) return null;
  return (
    <details open className="bl-report">
      <summary>
        Not read ({report.unmatched.length}) · set aside ({report.setAside.length})
      </summary>
      <ul className="space-y-1 text-[12px]">
        {report.unmatched.map((u, i) => (
          <li key={`u-${i}`}>
            <span className="text-amber-200/80">{lineText(u.source)}</span> — {u.reason}
            {u.structural ? <strong className="text-amber-200"> (its structure)</strong> : null}
            <span className="bl-num text-white/40"> · {u.grams === null ? "mass unknown" : `${u.bound ? "≤ " : ""}${u.grams.toFixed(1)} g`}</span>
          </li>
        ))}
        {report.setAside.map((a, i) => (
          <li key={`s-${i}`} className="text-white/55">
            {lineText(a.source)} — set aside: {a.reason}
          </li>
        ))}
      </ul>
    </details>
  );
}

function Assumptions({ report }: { report: Report }): JSX.Element {
  return (
    <details className="bl-report">
      <summary>Assumptions the lab supplied ({report.assumptions.length})</summary>
      <table className="bl-table">
        <tbody>
          {report.assumptions.map((a, i) => (
            <tr key={`a-${i}`}>
              <td className="text-white/70">{a.field}</td>
              <td className="bl-num">{a.value}</td>
              <td>
                <ProvenanceChip basis={a.basis} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-[11px] text-white/40">Hover a chip for its reason. Replace any of these on the Oven tab with your own.</p>
    </details>
  );
}

function Stated({ report }: { report: Report }): JSX.Element | null {
  if (report.stated.length === 0) return null;
  return (
    <details className="bl-report">
      <summary>Read from the recipe&apos;s own words ({report.stated.length})</summary>
      <ul className="space-y-1 text-[12px]">
        {report.stated.map((s, i) => (
          <li key={`r-${i}`}>
            <span className="text-white/70">{s.field}:</span> <span className="bl-num">{s.value}</span> <span className="text-white/40">— “{s.quote}”</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** How a site recipe became lab inputs: every line's fate and every value the lab had to supply. */
export function MappingReport({ report, title }: { report: Report; title: string }): JSX.Element {
  const lines = report.matched.length + report.unmatched.length + report.setAside.length;
  return (
    <section className="bl-card" aria-label={`Mapping report for ${title}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">How the recipe became a formula</h2>
        <span className="bl-num text-[11px] text-white/50">
          {report.matched.length} of {lines} lines matched · unread mass {pct(report.unreadMassShare)} · {report.assumptions.length} assumptions
        </span>
      </div>
      <Matched report={report} />
      <Unread report={report} />
      <Stated report={report} />
      <Assumptions report={report} />
    </section>
  );
}
