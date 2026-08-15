/**
 * Canonical ESMS token display constants — glyph, color, label per token.
 *
 * Until now this mapping existed only as ~15 inline copies (shop page,
 * TokenBalanceBar, feed page, quantities page, grimoire, profile, …), any of
 * which can drift. The palette below is the one `src/app/globals.css:167`
 * already declares canonical ("Spirit amber, Essence blue, Matter emerald,
 * Substance purple"), and the glyph set is the dominant one across the
 * economy surfaces. New surfaces import from here (ADR-011); migrating the
 * existing copies is tracked as an ADR-011 open item.
 */

import type { TokenType } from "@/types/economy";

export interface TokenVisual {
  token: TokenType;
  /** Lowercase key as used by balance columns and CoinVector shapes. */
  key: "spirit" | "essence" | "matter" | "substance";
  glyph: string;
  /** Canonical hex — matches the `.grad-*` classes in globals.css. */
  color: string;
}

export const TOKEN_VISUALS: readonly TokenVisual[] = [
  { token: "Spirit", key: "spirit", glyph: "🝇", color: "#fbbf24" },
  { token: "Essence", key: "essence", glyph: "🝑", color: "#60a5fa" },
  { token: "Matter", key: "matter", glyph: "🝙", color: "#34d399" },
  { token: "Substance", key: "substance", glyph: "🝉", color: "#c084fc" },
] as const;

export function tokenVisualFor(token: TokenType): TokenVisual {
  const visual = TOKEN_VISUALS.find((v) => v.token === token);
  if (!visual) {
    throw new Error(`tokenVisualFor: unknown token ${String(token)}`);
  }
  return visual;
}
