"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cuisineLabel, minutesLabel } from "./engine/phrases";
import styles from "./quiz.module.css";
import { QuizResultActions } from "./QuizResultActions";
import type { QuizOutcome } from "./engine/result";
import type { ScoredDish } from "./engine/types";
import type { QuizBrain } from "./useQuizBrain";

const DIET_BADGES: Readonly<Record<string, string>> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  pescatarian: "Pescatarian",
};

function DishMeta({ scored }: { scored: ScoredDish }): React.JSX.Element {
  const { dish } = scored;
  const diet = dish.diets.find((key) => key === "vegan") ?? dish.diets.find((key) => key === "vegetarian");
  return (
    <p className={styles.dishMeta}>
      {cuisineLabel(dish.cuisine)} · {minutesLabel(dish.minutes)}
      {dish.servings ? ` · serves ${dish.servings}` : ""}
      {diet ? ` · ${DIET_BADGES[diet] ?? diet}` : ""}
    </p>
  );
}

function Reasons({ outcome }: { outcome: QuizOutcome }): React.JSX.Element | null {
  if (outcome.reasons.length === 0) return null;
  return (
    <div className={styles.reasons}>
      <h4>Why this, why now</h4>
      <ul>
        {outcome.reasons.map((reason) => (
          <li key={`${reason.question}-${reason.answer}`}>
            <span className={styles.reasonAnswer}>“{reason.answer}”</span> {reason.because}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Alternates({ outcome, onPick }: { outcome: QuizOutcome; onPick: (scored: ScoredDish) => void }): React.JSX.Element | null {
  if (outcome.alternates.length === 0) return null;
  return (
    <div className={styles.alternates}>
      {outcome.alternates.map(({ tag, scored }) => (
        <button key={scored.dish.id} type="button" className={styles.alternate} onClick={() => onPick(scored)}>
          <span className={styles.eyebrow}>{tag}</span>
          <span className={styles.alternateName}>
            <span aria-hidden="true">{scored.dish.emoji}</span> {scored.dish.name}
          </span>
          <DishMeta scored={scored} />
        </button>
      ))}
    </div>
  );
}

function Profile({ outcome, brain }: { outcome: QuizOutcome; brain: QuizBrain }): React.JSX.Element {
  return (
    <div className={styles.profile}>
      {outcome.profile.length > 0 && (
        <p>
          <span className={styles.eyebrow}>Your craving right now</span>
          {outcome.profile.map(({ key, label }) => (
            <span key={key} className={styles.chipStatic}>
              {label}
            </span>
          ))}
        </p>
      )}
      {outcome.skyNote && <p className={styles.skyLine}>☽ {outcome.skyNote}</p>}
      {outcome.runnersUp.length > 0 && (
        <p className={styles.runners}>
          <span className={styles.eyebrow}>Also in the running</span>
          {outcome.runnersUp.map(({ dish }) => (
            <Link key={dish.id} href={`/recipes/${encodeURIComponent(dish.id)}`} className={styles.chipLink}>
              {dish.emoji} {dish.name}
            </Link>
          ))}
        </p>
      )}
      <p className={styles.fineprint}>
        Matched against {brain.dishes.length} recipes using features computed from each recipe&apos;s own ingredients
        and method. ≈{outcome.inPlay} dishes were still realistic contenders at the end.
      </p>
    </div>
  );
}

export function QuizResultView({ brain, outcome }: { brain: QuizBrain; outcome: QuizOutcome }): React.JSX.Element {
  const [featured, setFeatured] = useState<ScoredDish>(outcome.hero);
  useEffect(() => setFeatured(outcome.hero), [outcome.hero]);
  const isHero = featured.dish.id === outcome.hero.dish.id;
  const { dish } = featured;
  return (
    <div className={styles.result}>
      <section className={styles.heroDish} aria-labelledby="quiz-result-heading">
        <span className={styles.heroEmoji} aria-hidden="true">
          {dish.emoji}
        </span>
        <span className={styles.eyebrow}>{isHero ? "Your dish, right now" : "Your pick from the shortlist"}</span>
        <h3 id="quiz-result-heading" data-quiz-heading tabIndex={-1}>
          {dish.name}
        </h3>
        <DishMeta scored={featured} />
        {dish.blurb && <p className={styles.blurb}>{dish.blurb}</p>}
        {isHero ? <Reasons outcome={outcome} /> : (
          <button type="button" className={styles.ghostButton} onClick={() => setFeatured(outcome.hero)}>
            ← Back to the top match
          </button>
        )}
      </section>
      <QuizResultActions dish={dish} outcome={outcome} maxMinutes={brain.maxMinutes} />
      <Alternates outcome={outcome} onPick={setFeatured} />
      <Profile outcome={outcome} brain={brain} />
    </div>
  );
}
