"use client";

/**
 * Cook with this / Add to pantry for one ingredient card (omnibar Phase 4,
 * #870), on the full results page and the dossier. The pantry is local
 * (owner decision: account sync is a follow-up), so this is a client island.
 */
import Link from "next/link";
import { useState, type JSX } from "react";
import { usePantry } from "@/hooks/usePantry";
import { cookHref } from "@/lib/recipe-builder/prefillLink";

const BUTTON =
  "inline-flex items-center gap-2 min-h-[40px] rounded-full border px-4 text-sm no-underline transition-colors";

export function IngredientActions({
  name,
  category,
  label,
  butcherHref = null,
  butcherCutName = null,
}: {
  name: string;
  category: string;
  label: string;
  butcherHref?: string | null;
  butcherCutName?: string | null;
}): JSX.Element {
  const { hasItem, addItem, isLoaded } = usePantry();
  const [failed, setFailed] = useState(false);
  const stocked = isLoaded && hasItem(name);
  const add = (): void => {
    // The ingredients page's convention for a card added from a list: one unit.
    const added = addItem({ name, quantity: 1, unit: "unit", category: category === "" ? "other" : category });
    setFailed(added === null);
  };
  return (
    <div className="omni-page-actions" role="group" aria-label={`Actions for ${label}`} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Link href={cookHref(name)} prefetch={false} className={BUTTON} style={{ borderColor: "var(--line-hi)", color: "var(--fg)" }}>
        Cook with this
      </Link>
      {butcherHref !== null && butcherHref.length > 0 ? (
        <Link href={butcherHref} prefetch={false} className={BUTTON} style={{ borderColor: "var(--el-fire)", color: "var(--fg)" }}>
          Inspect {butcherCutName ?? "Cut"} in 3D Butcher Shop →
        </Link>
      ) : null}
      {stocked ? (
        <Link href="/pantry" prefetch={false} className={BUTTON} style={{ borderColor: "var(--line)", color: "var(--el-earth)" }}>
          In your pantry
        </Link>
      ) : (
        <button type="button" onClick={add} className={BUTTON} style={{ borderColor: "var(--line)", color: "var(--fg-dim)", background: "transparent" }}>
          Add to pantry
        </button>
      )}
      <span role="status" aria-live="polite" style={{ fontSize: 12, color: "var(--fg-mute)", alignSelf: "center" }}>
        {failed ? "Could not add to your pantry" : ""}
      </span>
    </div>
  );
}
