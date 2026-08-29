import type { Element, ElementalAffinity } from "./alchemy";

/** Legacy calculation-engine wire shape at the canonical affinity boundary. */
export interface EngineElementalAffinity {
  [key: string]: unknown;
  element: Element;
  strength: number;
  source: string;
  secondary?: Element;
  compatibility: Record<Element, number>;
}

/** Canonical affinity with lossless engine provenance for round-trip adapters. */
export interface AdaptedElementalAffinity extends ElementalAffinity {
  engine?: {
    source: string;
    metadata: Record<string, unknown>;
  };
}
