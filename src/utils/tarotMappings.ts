/**
 * Tarot Mappings — Canonical suit-to-element and suit-to-token constants.
 *
 * Re-exports the full Decan Alchemy Map for downstream consumers.
 */

export { SUIT_TO_ELEMENT, SUIT_TO_TOKEN } from "@/data/tarot/decanAlchemyMap";

// Re-export the decan alchemy system for convenience
export {
  DECAN_ALCHEMY_MAP,
  getDecanAlchemy,
  getDecanAlchemyForDate,
  getDecanAlchemyForSign,
  getDecansForSign,
  getCurrentDecanESMS,
  computeDecanESMS,
} from "@/data/tarot/decanAlchemyMap";

export type {
  DecanAlchemyEntry,
  ESMSValues,
  TarotSuit,
  ESMSToken,
  DecanElement,
} from "@/data/tarot/decanAlchemyMap";
