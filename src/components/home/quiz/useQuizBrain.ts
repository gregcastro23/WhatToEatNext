"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { hardLimits } from "./engine/effects";
import { dishesInPlay, posterior } from "./engine/posterior";
import { quizOutcome, type QuizOutcome } from "./engine/result";
import { nextQuestion } from "./engine/selector";
import { computeSky } from "./engine/sky";
import { loadQuizCatalog } from "./quizCatalogClient";
import type { QuizDish, QuizMoment, ScoredDish } from "./engine/types";
import type { QuizApi } from "./QuizProvider";

export type CatalogStatus = "loading" | "ready" | "error";

export interface QuizBrain {
  status: CatalogStatus;
  dishes: readonly QuizDish[];
  retry: () => void;
  moment: QuizMoment;
  scored: readonly ScoredDish[];
  inPlay: number;
  outcome: QuizOutcome | null;
  maxMinutes: number | null;
}

function useCatalog(): { status: CatalogStatus; dishes: readonly QuizDish[]; retry: () => void } {
  const [status, setStatus] = useState<CatalogStatus>("loading");
  const [dishes, setDishes] = useState<readonly QuizDish[]>([]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setStatus("loading");
    loadQuizCatalog()
      .then((loaded) => {
        if (!active) return;
        setDishes(loaded);
        setStatus(loaded.length ? "ready" : "error");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return (): void => {
      active = false;
    };
  }, [attempt]);
  const retry = useCallback((): void => setAttempt((value) => value + 1), []);
  return { status, dishes, retry };
}

export function useQuizBrain(api: QuizApi): QuizBrain {
  const { state, context, ask, reveal, summarize } = api;
  const { status, dishes, retry } = useCatalog();
  // The sky at the moment the quiz opened; null if astronomy is unavailable.
  const [sky] = useState(() => computeSky(new Date()));
  const moment = useMemo<QuizMoment>(
    () => ({
      timeOfDay: context.timeOfDay,
      season: context.season,
      tableSize: context.tableSize,
      elementalBias: context.elementalBias,
      planetaryHour: context.planetaryHour ?? null,
      sky,
    }),
    [context.timeOfDay, context.season, context.tableSize, context.elementalBias, context.planetaryHour, sky],
  );
  const { asked, answers, rules, phase, cursor, seed, target } = state;
  const input = useMemo(
    () => ({ dishes, questions: asked, answers, rules, moment }),
    [dishes, asked, answers, rules, moment],
  );
  const scored = useMemo(() => (status === "ready" ? posterior(input) : []), [status, input]);
  const outcome = useMemo(
    () => (status === "ready" && phase === "result" ? quizOutcome(input) : null),
    [status, phase, input],
  );
  useEffect(() => {
    if (status !== "ready" || phase !== "asking" || cursor !== asked.length) return;
    const question = nextQuestion({ dishes, asked, answers, rules, moment, seed, target });
    if (question) ask(question);
    else reveal();
  }, [status, phase, cursor, asked, answers, rules, moment, seed, target, dishes, ask, reveal]);
  const heroName = outcome?.hero.dish.name;
  const heroEmoji = outcome?.hero.dish.emoji;
  useEffect(() => {
    if (heroName && heroEmoji && state.summary?.name !== heroName) summarize({ name: heroName, emoji: heroEmoji });
  }, [heroName, heroEmoji, state.summary?.name, summarize]);
  return {
    status,
    dishes,
    retry,
    moment,
    scored,
    inPlay: scored.length ? dishesInPlay(scored) : 0,
    outcome,
    maxMinutes: hardLimits(asked, answers).maxMinutes,
  };
}
