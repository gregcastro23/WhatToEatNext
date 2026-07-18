/**
 * Guest palate — account-free personalization from a birthday alone.
 *
 * A first-time visitor can type just their birth date (no account, no birth
 * time/place) and we derive their sun sign and its element. That is the
 * honest ceiling of what a bare date supports: sign → element per
 * ZODIAC_ELEMENTS (full quantities need planetary positions, which need an
 * ignited chart — see src/utils/planetaryAlchemyMapping.ts). The value is
 * stored only in localStorage on the visitor's device.
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

const STORAGE_KEY = "alchm:guest:birthday";

/** Fired on window whenever the guest birthday is saved or cleared. */
export const GUEST_PALATE_EVENT = "alchm:guest-palate-changed";

export type PalateElement = "Fire" | "Earth" | "Air" | "Water";

export interface GuestPalate {
  /** ISO date, yyyy-mm-dd */
  birthday: string;
  sign: ZodiacSignType;
  /** Capitalised sign name, e.g. "Leo" */
  signLabel: string;
  /** Unicode glyph, e.g. "♌" */
  glyph: string;
  element: PalateElement;
}

export const ELEMENT_TAGLINES: Record<PalateElement, string> = {
  Fire: "bold heat, char & spice",
  Earth: "depth, roast & slow comfort",
  Air: "bright, crisp & herbal",
  Water: "soothing broth, cream & brine",
};

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

function derivePalate(iso: string): GuestPalate | null {
  const date = parseIsoDate(iso);
  if (!date) return null;
  const sign = getZodiacSignType(date);
  return {
    birthday: iso,
    sign,
    signLabel: sign.charAt(0).toUpperCase() + sign.slice(1),
    glyph: SIGN_GLYPHS[sign],
    element: getElementForZodiac(sign),
  };
}

export function loadGuestPalate(): GuestPalate | null {
  try {
    const iso = window.localStorage.getItem(STORAGE_KEY);
    if (!iso) return null;
    return derivePalate(iso);
  } catch {
    return null;
  }
}

/** Validates and stores the birthday; returns the derived palate (or null). */
export function saveGuestBirthday(iso: string): GuestPalate | null {
  const palate = derivePalate(iso);
  if (!palate) return null;
  try {
    window.localStorage.setItem(STORAGE_KEY, iso);
    window.dispatchEvent(new Event(GUEST_PALATE_EVENT));
  } catch {
    /* localStorage unavailable — palate still returned for this render */
  }
  return palate;
}

export function clearGuestBirthday(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(GUEST_PALATE_EVENT));
  } catch {
    /* ignore */
  }
}
