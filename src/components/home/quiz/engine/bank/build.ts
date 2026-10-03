import { FEATURE_KEYS } from "@/lib/quiz/catalogContract";
import type { ChoiceEffect, FeatureKey, Leans, QuizChoice } from "../types";

export function pick(
  id: string,
  emoji: string,
  label: string,
  sub: string,
  effect: ChoiceEffect,
): QuizChoice {
  return { id, emoji, label, sub, effect };
}

export function neutral(id: string, label: string, sub: string): QuizChoice {
  return { id, emoji: "·", label, sub, effect: {}, neutral: true };
}

/** A multi-select "none of these" that clears the other picks. */
export function none(id: string, label: string, sub: string): QuizChoice {
  return { ...neutral(id, label, sub), exclusive: true };
}

/** Lean multipliers for the five slider stops, strongly low → strongly high. */
const STOPS: readonly number[] = [-1, -0.5, 0, 0.5, 1];

/**
 * A five-stop slider over one feature. `strength` is the lean at either end;
 * the middle stop expresses no preference but still counts as an answer.
 * `extra` adds companion leans that move with the slider.
 */
export function sliderStops(
  idPrefix: string,
  feature: FeatureKey,
  strength: number,
  labels: readonly string[],
  extra: Leans = {},
): QuizChoice[] {
  return labels.map((label, index) => {
    const step = STOPS[index] ?? 0;
    const leans: Leans = { [feature]: strength * step };
    for (const key of FEATURE_KEYS) {
      const value = extra[key];
      if (value !== undefined) leans[key] = value * step;
    }
    return {
      id: `${idPrefix}-${index}`,
      label,
      effect: step === 0 ? {} : { leans },
      neutral: step === 0,
    };
  });
}
