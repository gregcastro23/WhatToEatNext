/**
 * Pages and quick actions, matched on the client with no network round-trip
 * (plan D6), so navigation stays instant while server results load.
 */
import { getAllNavRoutes } from "@/config/navigation";
import type { LinkRow } from "./omnibarTypes";

/** Carried over from the ⌘K palette the omnibar replaces. */
const QUICK_ACTIONS: readonly LinkRow[] = [
  { id: "action:compose", label: "Compose tonight's menu", hint: "RECIPE BUILDER", href: "/recipe-builder" },
  { id: "action:pantry", label: "Open the pantry", hint: "PANTRY", href: "/pantry" },
  { id: "action:commensal", label: "Plan a commensal gathering", hint: "COMMENSAL", href: "/commensal" },
  { id: "action:vault", label: "Open the ESMS vault", hint: "TOKENS", href: "/vault" },
  { id: "action:security", label: "Account & sessions", hint: "SECURITY", href: "/profile/security" },
].map((action) => ({ ...action, type: "link", kind: "page", icon: "flask", external: false }));

export function quickActions(): readonly LinkRow[] {
  return QUICK_ACTIONS;
}

let navCache: readonly LinkRow[] | null = null;

function navRows(): readonly LinkRow[] {
  navCache ??= getAllNavRoutes().map((route) => ({
    type: "link",
    id: route.key,
    kind: "page",
    label: route.label,
    hint: route.hint.toUpperCase(),
    href: route.path,
    icon: route.glyph,
    external: route.external ?? false,
  }));
  return navCache;
}

/** Case- and accent-folded, single-spaced. */
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** The label is the query, allowing a plural ("recipe" is the Recipes page). */
function isExactLabel(label: string, query: string): boolean {
  return label === query || label === `${query}s` || `${label}s` === query;
}

/** Every query word starts a label word: "pan" → Pantry, "recipe b" → Recipe Builder. */
function wordsStartLabel(label: string, query: string): boolean {
  const words = label.split(/[^\p{L}\p{N}]+/u);
  return query.split(" ").every((q) => words.some((word) => word.startsWith(q)));
}

export interface NavMatches {
  rows: LinkRow[];
  /** A page whose label is the query. It wins Enter and suppresses a server hero. */
  exact: LinkRow | null;
}

export function matchNav(query: string, limit: number): NavMatches {
  const folded = foldText(query);
  if (!folded) return { rows: [], exact: null };
  const seen = new Set<string>();
  const exact: LinkRow[] = [];
  const partial: LinkRow[] = [];
  for (const row of [...navRows(), ...QUICK_ACTIONS]) {
    const label = foldText(row.label);
    if (seen.has(row.href) || !wordsStartLabel(label, folded)) continue;
    seen.add(row.href);
    (isExactLabel(label, folded) ? exact : partial).push(row);
  }
  return { rows: [...exact, ...partial].slice(0, limit), exact: exact[0] ?? null };
}
