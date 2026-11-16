"use client";

import Link from "next/link";
import { type JSX } from "react";
import type { MappingReport as Report } from "@/lib/baking/recipes/sourceTypes";
import { MappingReport } from "./MappingReport";

/**
 * A site recipe the lab will not bake: the reasons, then everything it could
 * read. No formula, telemetry or bake is shown, because any number here would
 * describe something other than the recipe.
 */
export function RefusedGood({ id, name, report }: { id: string; name: string; report: Report }): JSX.Element {
  const reasons = report.verdict.simulable ? [] : report.verdict.reasons;
  return (
    <div className="space-y-4">
      <div className="bl-card">
        <h2 className="text-xl">{name}</h2>
        <p className="mt-1 text-sm text-white/65">
          The lab will not simulate this recipe: a formula, water activity or bake built from it would describe something other than the recipe.{" "}
          <Link className="underline" href={`/recipes/${id}`}>
            Read the recipe itself →
          </Link>
        </p>
        <ul className="mt-3 space-y-2">
          {reasons.map((r) => (
            <li key={r} className="bl-warn text-[13px]">
              {r}
            </li>
          ))}
        </ul>
      </div>
      <MappingReport report={report} title={name} />
    </div>
  );
}
