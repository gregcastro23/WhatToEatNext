"use client";

/** One guide method: its numbers, steps, tips and doneness cues, all cited. */
import styles from "@/components/home/search/homeSearch.module.css";
import { formatQuantity } from "@/lib/cooking/foodGuides/formatQuantity";
import type { GuideMethod, GuideQuantity } from "@/lib/cooking/foodGuides/schema";
import { Cite, ClaimList, type CitationKey } from "./citations";
import type { JSX } from "react";

function Quantities({ quantities, cites }: { quantities: readonly GuideQuantity[]; cites: CitationKey }): JSX.Element {
  return (
    <dl className={styles.quantities}>
      {quantities.map((quantity) => (
        <div key={`${quantity.kind}-${quantity.label}`} className={styles.quantity}>
          <dt>{quantity.label}</dt>
          <dd>
            {formatQuantity(quantity)}
            <Cite ids={quantity.sources} cites={cites} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function MethodPanel({ method, cites }: { method: GuideMethod; cites: CitationKey }): JSX.Element {
  return (
    <div>
      <p className={styles.note}>
        {method.best ? "Recommended: " : "When to choose it: "}
        {method.why.text}
        <Cite ids={method.why.sources} cites={cites} />
      </p>
      {method.quantities.length > 0 && <Quantities quantities={method.quantities} cites={cites} />}
      {method.equipment.length > 0 && <p className={styles.status}>You will need: {method.equipment.join(", ")}.</p>}
      <h4 className={styles.subhead}>Steps</h4>
      <ClaimList claims={method.steps} cites={cites} ordered />
      {method.doneness.length > 0 && (
        <>
          <h4 className={styles.subhead}>How to tell it is done</h4>
          <ClaimList claims={method.doneness} cites={cites} />
        </>
      )}
      {method.tips.length > 0 && (
        <>
          <h4 className={styles.subhead}>Tips</h4>
          <ClaimList claims={method.tips} cites={cites} />
        </>
      )}
    </div>
  );
}
