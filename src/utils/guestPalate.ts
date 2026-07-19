/**
 * Guest table — account-free personalization from birthdays alone.
 *
 * Visitors add one or several birthdays ("Who's eating tonight?") with no
 * account and no birth time/place. Each date yields a sun sign and its
 * element — the honest ceiling of a bare date: sign → element per
 * ZODIAC_ELEMENTS (full quantities need planetary positions, which need an
 * ignited chart — see src/utils/planetaryAlchemyMapping.ts). The table is
 * stored only in localStorage on the visitor's device.
 *
 * The composite palate is a normalized mean of per-person element vectors:
 * date-only guests contribute a softened one-hot vector for their sun-sign
 * element, while a signed-in chart member contributes their real
 * elementalBalance — that asymmetry is what lets a full chart outweigh a
 * bare sun sign. The composite is an ELEMENTAL bias only and must never be
 * converted to ESMS quantities.
 */

import type { ZodiacSignType } from "@/types/alchemy";
import { getElementForZodiac, getZodiacSignType } from "@/utils/zodiacUtils";

// Local glyph map — chartRendering's getZodiacGlyph uses the capitalized
// ZodiacSignType variant, incompatible with the lowercase signs used here.
const SIGN_GLYPHS: Record<ZodiacSignType, string> = {
  aries: "♈",
  taurus: "♉",
  gemini: "♊",
  cancer: "♋",
  leo: "♌",
  virgo: "♍",
  libra: "♎",
  scorpio: "♏",
  sagittarius: "♐",
  capricorn: "♑",
  aquarius: "♒",
  pisces: "♓",
};

/** Glyph for a lowercase sign — used for chart-member chips in the hero. */
export function signGlyph(sign: ZodiacSignType): string {
  return SIGN_GLYPHS[sign];
}

const TABLE_KEY = "alchm:guest:table:v1";
/** Pre-table single-birthday key; migrated into the table on first load. */
const LEGACY_KEY = "alchm:guest:birthday";

/** Fired on window whenever the guest table changes. */
export const GUEST_PALATE_EVENT = "alchm:guest-palate-changed";

export const MAX_TABLE_SIZE = 8;

export type PalateElement = "Fire" | "Earth" | "Air" | "Water";

export const ELEMENT_ORDER: readonly PalateElement[] = [
  "Fire",
  "Earth",
  "Air",
  "Water",
];

export const ELEMENT_TAGLINES: Record<PalateElement, string> = {
  Fire: "bold heat, char & spice",
  Earth: "depth, roast & slow comfort",
  Air: "bright, crisp & herbal",
  Water: "soothing broth, cream & brine",
};

/** What we persist per person (raw). */
interface StoredMember {
  id: string;
  name?: string;
  /** ISO date, yyyy-mm-dd */
  birthday: string;
}

/** A table member with the sun-sign reading derived from their birthday. */
export interface TablePerson {
  id: string;
  name?: string;
  birthday: string;
  sign: ZodiacSignType;
  /** Capitalised sign name, e.g. "Leo" */
  signLabel: string;
  /** Unicode glyph, e.g. "♌" */
  glyph: string;
  element: PalateElement;
}

export type ElementVector = Record<PalateElement, number>;

export interface TableComposite {
  /** Normalized 0–1 vector — the bias the quiz and recommenders consume. */
  vector: ElementVector;
  /** Display percentages, adjusted to sum to exactly 100. */
  pct: ElementVector;
  /** Strongest element (ELEMENT_ORDER breaks ties). */
  leaning: PalateElement;
  /** How many vectors went into the mean. */
  size: number;
}

/** Parse yyyy-mm-dd into a LOCAL date (avoids the UTC-midnight day-shift). */
function parseIsoDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31)
    return null;
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  if (date.getTime() > Date.now()) return null;
  return date;
}

function derivePerson(member: StoredMember): TablePerson | null {
  const date = parseIsoDate(member.birthday);
  if (!date) return null;
  const sign = getZodiacSignType(date);
  return {
    id: member.id,
    name: member.name,
    birthday: member.birthday,
    sign,
    signLabel: sign.charAt(0).toUpperCase() + sign.slice(1),
    glyph: SIGN_GLYPHS[sign],
    element: getElementForZodiac(sign),
  };
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

// In-memory mirror so the table still works this session when localStorage
// is unavailable (private-mode quotas, cookie-blocked embeds). State readers
// only see writeMembers' event, so a failed setItem must not lose the add.
let memoryMembers: StoredMember[] | null = null;

function readMembers(): StoredMember[] {
  try {
    const raw = window.localStorage.getItem(TABLE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          // The table exists — tidy the superseded single-birthday key too.
          window.localStorage.removeItem(LEGACY_KEY);
          return parsed
            .filter(
              (m): m is StoredMember =>
                typeof m === "object" &&
                m !== null &&
                typeof (m as StoredMember).id === "string" &&
                typeof (m as StoredMember).birthday === "string",
            )
            .slice(0, MAX_TABLE_SIZE);
        }
      } catch {
        /* corrupt table JSON — fall through to the mirror/legacy paths */
      }
    }
    if (memoryMembers) return memoryMembers;
    // First load on this device since the table shipped: migrate the old
    // single-birthday value as a member named "You", so returning visitors'
    // readings stay tuned exactly as before.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy && parseIsoDate(legacy)) {
      const migrated: StoredMember[] = [
        { id: newId(), name: "You", birthday: legacy },
      ];
      window.localStorage.setItem(TABLE_KEY, JSON.stringify(migrated));
      window.localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
    return [];
  } catch {
    return memoryMembers ?? [];
  }
}

function writeMembers(members: StoredMember[]): void {
  memoryMembers = members;
  try {
    window.localStorage.setItem(TABLE_KEY, JSON.stringify(members));
  } catch {
    /* persistence failed — the in-memory mirror still serves this session */
  }
  try {
    window.dispatchEvent(new Event(GUEST_PALATE_EVENT));
  } catch {
    /* ignore */
  }
}

export function loadGuestTable(): TablePerson[] {
  return readMembers()
    .map(derivePerson)
    .filter((p): p is TablePerson => p !== null);
}

/** Validates and adds a person; returns them (or null on invalid/full). */
export function addTableMember(
  birthday: string,
  name?: string,
): TablePerson | null {
  if (!parseIsoDate(birthday)) return null;
  const members = readMembers();
  if (members.length >= MAX_TABLE_SIZE) return null;
  const trimmed = name?.trim();
  const member: StoredMember = {
    id: newId(),
    ...(trimmed ? { name: trimmed.slice(0, 24) } : {}),
    birthday,
  };
  writeMembers([...members, member]);
  return derivePerson(member);
}

export function removeTableMember(id: string): void {
  writeMembers(readMembers().filter((m) => m.id !== id));
}

export function clearGuestTable(): void {
  memoryMembers = null;
  try {
    window.localStorage.removeItem(TABLE_KEY);
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event(GUEST_PALATE_EVENT));
  } catch {
    /* ignore */
  }
}

/**
 * A date-only guest's contribution to the composite: their sun-sign element
 * softened (0.7 dominant, 0.1 each other) so one person never reads as a
 * 100/0/0/0 table.
 */
export function softenedElementVector(element: PalateElement): ElementVector {
  const vector: ElementVector = { Fire: 0.1, Earth: 0.1, Air: 0.1, Water: 0.1 };
  vector[element] = 0.7;
  return vector;
}

/**
 * Composite palate = normalized mean of the per-person vectors. Callers pass
 * softened one-hots for guests and a real chart elementalBalance for a
 * signed-in member.
 */
export function compositeFromVectors(
  vectors: readonly ElementVector[],
): TableComposite | null {
  if (vectors.length === 0) return null;

  const mean: ElementVector = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const v of vectors) {
    const sum = ELEMENT_ORDER.reduce((acc, el) => acc + (v[el] || 0), 0) || 1;
    for (const el of ELEMENT_ORDER) {
      mean[el] += (v[el] || 0) / sum / vectors.length;
    }
  }

  // Degenerate input (every vector all-zero) must read as "no composite",
  // not as a fabricated "Fire 100%" from the rounding remainder.
  const meanSum = ELEMENT_ORDER.reduce((acc, el) => acc + mean[el], 0);
  if (!(meanSum > 0)) return null;

  let leaning: PalateElement = ELEMENT_ORDER[0];
  for (const el of ELEMENT_ORDER) {
    if (mean[el] > mean[leaning]) leaning = el;
  }

  const pct: ElementVector = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  let assigned = 0;
  for (const el of ELEMENT_ORDER) {
    pct[el] = Math.round(mean[el] * 100);
    assigned += pct[el];
  }
  pct[leaning] += 100 - assigned;

  return { vector: mean, pct, leaning, size: vectors.length };
}
