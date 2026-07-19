/**
 * useUserElementalBias — the one seam personalization flows through.
 *
 * Resolves the visitor's elemental bias with honest precedence: a signed-in
 * user's real natal-chart elementalBalance anchors the composite, date-only
 * guests from the "Who's eating tonight?" table contribute softened sun-sign
 * one-hots, and with neither the bias is null (callers must be bit-identical
 * to unpersonalized behavior on null). The bias is ELEMENTAL only — never
 * converted to ESMS quantities.
 */

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  compositeFromVectors,
  ELEMENT_ORDER,
  GUEST_PALATE_EVENT,
  loadGuestTable,
  signGlyph,
  softenedElementVector,
  type ElementVector,
  type TableComposite,
  type TablePerson,
} from "@/utils/guestPalate";

export interface UserElementalBias {
  /** True once localStorage has been read (SSR-safe gate for rendering). */
  hydrated: boolean;
  /** Date-only guests currently on the table. */
  table: TablePerson[];
  /** Whether a signed-in user's real chart anchors the composite. */
  chartOn: boolean;
  /** Zodiac glyph of the chart member's sun, when known. */
  chartSunGlyph: string | null;
  /** Full composite (pct, leaning, size) or null when nobody is present. */
  composite: TableComposite | null;
  /** Normalized bias vector for scoring seams — null = no personalization. */
  bias: ElementVector | null;
  source: "chart" | "table" | "chart+table" | null;
  /** People behind the bias (chart member included). */
  tableSize: number;
}

export function useUserElementalBias(): UserElementalBias {
  const { status } = useSession();
  const { currentUser } = useUser();
  const [hydrated, setHydrated] = useState(false);
  const [table, setTable] = useState<TablePerson[]>([]);

  useEffect(() => {
    const sync = () => setTable(loadGuestTable());
    sync();
    setHydrated(true);
    window.addEventListener(GUEST_PALATE_EVENT, sync);
    return () => window.removeEventListener(GUEST_PALATE_EVENT, sync);
  }, []);

  const chart = currentUser?.natalChart;
  const chartVector = useMemo<ElementVector | null>(() => {
    const b = chart?.elementalBalance as Record<string, number> | undefined;
    if (!b) return null;
    if (!ELEMENT_ORDER.every((el) => typeof b[el] === "number")) return null;
    const sum = ELEMENT_ORDER.reduce((acc, el) => acc + b[el], 0);
    if (!(sum > 0)) return null;
    return { Fire: b.Fire, Earth: b.Earth, Air: b.Air, Water: b.Water };
  }, [chart]);

  const chartOn = status === "authenticated" && chartVector !== null;

  const chartSunGlyph = useMemo(() => {
    const sun = chart?.planetaryPositions?.Sun;
    return sun ? signGlyph(sun) : null;
  }, [chart]);

  const composite = useMemo(() => {
    const vectors: ElementVector[] = [];
    if (chartOn && chartVector) vectors.push(chartVector);
    for (const p of table) vectors.push(softenedElementVector(p.element));
    return compositeFromVectors(vectors);
  }, [chartOn, chartVector, table]);

  const source: UserElementalBias["source"] = !composite
    ? null
    : chartOn && table.length > 0
      ? "chart+table"
      : chartOn
        ? "chart"
        : "table";

  // Scoring bias. A lone date-only guest gets a pure one-hot so the quiz's
  // 2-point tip lands exactly like the legacy single-birthday behavior —
  // migrated visitors keep getting the same dish for the same answers. The
  // softened composite is for display and multi-person blends only.
  const bias = useMemo<ElementVector | null>(() => {
    if (!composite) return null;
    if (!chartOn && table.length === 1) {
      const oneHot: ElementVector = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
      oneHot[table[0].element] = 1;
      return oneHot;
    }
    return composite.vector;
  }, [composite, chartOn, table]);

  return {
    hydrated,
    table,
    chartOn,
    chartSunGlyph,
    composite,
    bias,
    source,
    tableSize: table.length + (chartOn ? 1 : 0),
  };
}

/**
 * Serialize a bias vector for the `bias` query param consumed by
 * /api/cuisines/recommend — four normalized floats in ELEMENT_ORDER
 * (Fire,Earth,Air,Water). Returns null when there is no bias.
 */
export function biasQueryParam(bias: ElementVector | null): string | null {
  if (!bias) return null;
  return ELEMENT_ORDER.map((el) => (bias[el] ?? 0).toFixed(4)).join(",");
}
