import {
  ELEMENT_TYPES,
  type AdaptedElementalAffinity,
  type Element,
  type EngineElementalAffinity,
} from "@/types";

const DEFAULT_COMPATIBILITY: Record<Element, number> = {
  Fire: 0.7,
  Water: 0.7,
  Earth: 0.7,
  Air: 0.7,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isElement(value: unknown): value is Element {
  return (
    typeof value === "string" &&
    ELEMENT_TYPES.some((element) => element === value)
  );
}

function readCompatibility(value: unknown): Record<Element, number> {
  if (!isRecord(value)) return { ...DEFAULT_COMPATIBILITY };

  const readScore = (score: unknown, fallback: number): number =>
    typeof score === "number" && Number.isFinite(score) && score >= 0.7
      ? score
      : fallback;

  return {
    Fire: readScore(value.Fire, DEFAULT_COMPATIBILITY.Fire),
    Water: readScore(value.Water, DEFAULT_COMPATIBILITY.Water),
    Earth: readScore(value.Earth, DEFAULT_COMPATIBILITY.Earth),
    Air: readScore(value.Air, DEFAULT_COMPATIBILITY.Air),
  };
}

/** Convert the legacy engine wire shape into the canonical affinity model. */
export function toStandardElementalAffinity(
  engineAffinity: unknown,
): AdaptedElementalAffinity {
  const data = isRecord(engineAffinity) ? engineAffinity : {};
  const primary = isElement(data.element)
    ? data.element
    : isElement(data.base)
      ? data.base
      : isElement(data.primary)
        ? data.primary
        : "Fire";
  const secondary = isElement(data.secondary) ? data.secondary : undefined;
  const strength =
    typeof data.strength === "number" && Number.isFinite(data.strength)
      ? data.strength
      : 1;
  const {
    element: _element,
    base: _base,
    primary: _primary,
    secondary: _secondary,
    strength: _strength,
    compatibility: _compatibility,
    source,
    ...metadata
  } = data;

  return {
    primary,
    secondary,
    strength,
    compatibility: readCompatibility(data.compatibility),
    engine: {
      source: typeof source === "string" ? source : "default",
      metadata,
    },
  };
}

/** Convert the canonical affinity model into the legacy engine wire shape. */
export function toEngineElementalAffinity(
  standardAffinity: AdaptedElementalAffinity,
): EngineElementalAffinity {
  return {
    ...standardAffinity.engine?.metadata,
    element: standardAffinity.primary,
    strength: standardAffinity.strength,
    source: standardAffinity.engine?.source ?? "default",
    secondary: standardAffinity.secondary,
    compatibility: { ...standardAffinity.compatibility },
  };
}
