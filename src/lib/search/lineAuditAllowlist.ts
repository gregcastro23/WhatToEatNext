/**
 * Ruled allowlist for intentional syntactic flags emitted by the independent
 * `lineAudit.ts` witness (docs/plans/reverse-index-rulings.md Rulings 17 & 20).
 *
 * CI asserts zero unruled flags and zero stale allowlist rows against the real
 * recipe corpus (`lineRulingsCorpus.test.ts`).
 */
import type { LineAudit, LineFlag } from "./lineAudit";

export interface RuledAuditFlag {
  line: string;
  flags: readonly LineFlag[];
  keys: readonly string[];
  basis: string;
}

export interface AllowlistAuditReport {
  ruled: LineAudit[];
  unruled: LineAudit[];
  stale: RuledAuditFlag[];
}

export const AUDIT_FLAG_ALLOWLIST: readonly RuledAuditFlag[] = [
  {
    line: "date sugar",
    flags: ["generic"],
    keys: ["sugar"],
    basis: "Rulings 2 & 3: sugar is not a derived head and no date_sugar card exists; stays generic sugar",
  },
  {
    line: "ice water",
    flags: ["generic"],
    keys: ["water"],
    basis: "Rulings 2 & 19: ice is a temperature modifier rather than a base substance; water head is intentional",
  },
  {
    line: "extra white bread flour for kneading",
    flags: ["generic"],
    keys: ["flour"],
    basis: "Ruling 8: white bread flour is bread wheat flour, not derived from white bread; generic flour is intentional",
  },
  {
    line: "unbleached white bread flour",
    flags: ["generic"],
    keys: ["flour"],
    basis: "Ruling 8: white bread flour is bread wheat flour, not derived from white bread; generic flour is intentional",
  },
  {
    line: "chopped jalapeno pepper",
    flags: ["modifier"],
    keys: ["jalapenos"],
    basis: "Ruling 5 class head: jalapeno + pepper intentionally resolves to jalapenos",
  },
  {
    line: "jalapeno pepper",
    flags: ["modifier"],
    keys: ["jalapenos"],
    basis: "Ruling 5 class head: jalapeno + pepper intentionally resolves to jalapenos",
  },
  {
    line: "jalapeño peppers",
    flags: ["modifier"],
    keys: ["jalapenos"],
    basis: "Ruling 5 class head: jalapeno + pepper intentionally resolves to jalapenos",
  },
  {
    line: "small jalapeno pepper",
    flags: ["modifier"],
    keys: ["jalapenos"],
    basis: "Ruling 5 class head: jalapeno + pepper intentionally resolves to jalapenos",
  },
  {
    line: "fine semolina flour",
    flags: ["modifier"],
    keys: ["semolina"],
    basis: "Ruling 5 class head: semolina + flour intentionally resolves to semolina (non-derived)",
  },
  {
    line: "semolina flour",
    flags: ["modifier"],
    keys: ["semolina"],
    basis: "Ruling 5 class head: semolina + flour intentionally resolves to semolina (non-derived)",
  },
  {
    line: "pistachio nuts",
    flags: ["modifier"],
    keys: ["pistachios"],
    basis: "Ruling 5 class head: pistachio + nut intentionally resolves to pistachios",
  },
  {
    line: "potato starch flour",
    flags: ["modifier"],
    keys: ["potato_starch"],
    basis: "Ruling 5 class head: potato starch + flour intentionally resolves to potato_starch",
  },
  {
    line: "tapioca starch flour",
    flags: ["modifier"],
    keys: ["tapioca_starch"],
    basis: "Ruling 5 class head: tapioca starch + flour intentionally resolves to tapioca_starch",
  },
  {
    line: "strong espresso coffee",
    flags: ["modifier"],
    keys: ["strong_espresso"],
    basis: "Ruling 5 class head: strong espresso + coffee intentionally resolves to strong_espresso",
  },
  {
    line: "pomegranate molasses",
    flags: ["modifier"],
    keys: ["pomegranate"],
    basis: "Ruling 8 false compound: pomegranate molasses is reduced pomegranate juice, not sugarcane molasses",
  },
  {
    line: "cinnamon sugar",
    flags: ["modifier"],
    keys: ["cinnamon"],
    basis: "Rulings 2, 3 & 19: sugar is not a derived head and no cinnamon_sugar card exists; preserves Churros under cinnamon",
  },
  {
    line: "coconut sugar",
    flags: ["modifier"],
    keys: ["coconut"],
    basis: "Rulings 2, 3 & 19: sugar is not a derived head and no coconut_sugar card exists; attributes coconut palm sugar to coconut",
  },
];

function sameMembers(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, idx) => value === sortedB[idx]);
}

/**
 * Partition flagged line audits into ruled vs unruled against `allowlist`, and
 * surface any stale allowlist rows that matched zero lines (Rulings 17 & 20).
 */
export function auditAllowlistGaps(
  audits: readonly LineAudit[],
  allowlist: readonly RuledAuditFlag[] = AUDIT_FLAG_ALLOWLIST,
): AllowlistAuditReport {
  const byLine = new Map<string, RuledAuditFlag>();
  for (const entry of allowlist) {
    if (!byLine.has(entry.line)) byLine.set(entry.line, entry);
  }
  const matchedEntries = new Set<RuledAuditFlag>();
  const ruled: LineAudit[] = [];
  const unruled: LineAudit[] = [];

  for (const audit of audits) {
    if (audit.flags.length === 0) continue;
    const entry = byLine.get(audit.line);
    if (entry && sameMembers(audit.flags, entry.flags) && sameMembers(audit.keys, entry.keys)) {
      matchedEntries.add(entry);
      ruled.push(audit);
    } else {
      unruled.push(audit);
    }
  }

  const stale = allowlist.filter((entry) => !matchedEntries.has(entry));
  return { ruled, unruled, stale };
}
