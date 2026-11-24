"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import styles from "./quiz.module.css";
import { useQuiz } from "./QuizProvider";

const QuizStage = dynamic(
  () => import("./QuizStage").then((module) => module.QuizStage),
  {
    loading: () => (
      <div className={styles.stage} role="status">
        Preparing your kitchen…
      </div>
    ),
  },
);

/** Below this width the site's bottom tab bar covers the foot of the viewport. */
const TAB_BAR_QUERY = "(max-width: 899px)";
const TAB_BAR_RESERVE_PX = 96;
const GAP_BELOW_HEADER_PX = 12;

/**
 * When the opened stage runs past the visible viewport (a phone, where the tip
 * strip sits above the bar), scroll the bar up to just under the sticky site
 * header so the whole stage, footer included, is on screen. Runs only on the
 * visitor's own open; on a desktop the stage already fits and nothing moves.
 */
function useKeepStageInView(slotRef: React.RefObject<HTMLDivElement | null>, isOpen: boolean): void {
  useEffect(() => {
    const slot = slotRef.current;
    const bar = document.getElementById("meal-quiz-trigger");
    if (!isOpen || !slot || !bar) return;
    const reserve = window.matchMedia(TAB_BAR_QUERY).matches ? TAB_BAR_RESERVE_PX : 0;
    if (slot.getBoundingClientRect().bottom <= window.innerHeight - reserve) return;
    const header = document.querySelector("[data-alchm-header]");
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const top = window.scrollY + bar.getBoundingClientRect().top - headerHeight - GAP_BELOW_HEADER_PX;
    window.scrollTo({ top: Math.max(0, top) });
  }, [slotRef, isOpen]);
}

/**
 * Where the quiz opens: directly under its bar at the top of the hero, pushing
 * the rest of the hero down. (It used to overlay the hero's tile grid, which sat
 * far below the bar once the bar moved to the top.) The stage scrolls its own
 * body, so this slot gives it a definite height.
 */
export function QuizSurface(): React.JSX.Element | null {
  const { state } = useQuiz();
  const slotRef = useRef<HTMLDivElement | null>(null);
  useKeepStageInView(slotRef, state.isOpen);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !state.isOpen)
      document
        .getElementById("meal-quiz-trigger")
        ?.focus({ preventScroll: true });
    wasOpen.current = state.isOpen;
  }, [state.isOpen]);
  if (!state.isOpen) return null;
  return (
    <div ref={slotRef} className={styles.inline}>
      <QuizStage />
    </div>
  );
}
