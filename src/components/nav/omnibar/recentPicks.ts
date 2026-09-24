/**
 * The last few omnibar picks, kept in this browser only (localStorage). Read
 * back through a schema: storage is user-writable, so only internal paths
 * survive, and a malformed entry is dropped rather than trusted.
 */
import { z } from "zod";
import { KIND_ICON, type LinkRow, type OmnibarRow } from "./omnibarTypes";

const RECENT_KEY = "alchm:omnibar:recent";
/** The ⌘K palette's list, read once so its picks carry over. */
const LEGACY_KEY = "alchm:palette:recent";
const KEEP = 8;

const PickSchema = z.object({
  id: z.string(),
  kind: z.enum(["page", "ingredient", "recipe", "cuisine", "method", "sauce", "search"]).catch("page"),
  label: z.string().min(1),
  hint: z.string().catch(""),
  href: z.string().regex(/^\/(?!\/)/),
});

type StoredPick = z.infer<typeof PickSchema>;

function readList(key: string): StoredPick[] {
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((entry: unknown) => {
    const pick = PickSchema.safeParse(entry);
    return pick.success ? [pick.data] : [];
  });
}

function toRow(pick: StoredPick): LinkRow {
  return { ...pick, id: `recent:${pick.id}`, type: "link", icon: KIND_ICON[pick.kind], external: false };
}

export function loadRecent(): LinkRow[] {
  try {
    const picks = readList(RECENT_KEY);
    return (picks.length > 0 ? picks : readList(LEGACY_KEY)).map(toRow);
  } catch {
    return [];
  }
}

export function pushRecent(row: OmnibarRow): void {
  if (row.kind === "search") return;
  const id = row.id.replace(/^recent:/, "");
  const pick: StoredPick = { id, kind: row.kind, label: row.label, hint: row.hint, href: row.href };
  if (!PickSchema.safeParse(pick).success) return;
  try {
    const rest = readList(RECENT_KEY).filter((prior) => prior.href !== pick.href);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify([pick, ...rest].slice(0, KEEP)));
  } catch {
    // Storage full or blocked (private mode): recents are a convenience only.
  }
}
