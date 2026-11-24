"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./KitchenTipStrip.module.css";
import {
  localDayNumber,
  TIP_ROTATE_MS,
  tipsForDay,
  type KitchenTip,
  type TipLink,
} from "./tipOfTheDay";

/**
 * KitchenTipStrip: the first line of the homepage, today's kitchen tips rotating.
 *
 * - The day's tips depend on the visitor's local date, which the server can't
 *   know, so they're chosen after mount. Until then the strip holds its place.
 * - Rotation is a timeout, never requestAnimationFrame: rAF stops in hidden tabs,
 *   which is how the homepage quiz once deadlocked. Hovering or focusing the strip
 *   holds the current tip, the pause button stops rotation (WCAG 2.2.2), and
 *   visitors who prefer reduced motion start paused.
 * - All of the day's tips share one grid cell, so the strip is as tall as the
 *   longest of them and the hero below doesn't jump as they change.
 */

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * True while the pointer is over the element or focus is inside it. Hover and
 * focus are tracked apart: the pointer leaving must not release a tip whose link
 * still has keyboard focus, or rotation would make that link inert under it.
 */
function useEngaged(ref: React.RefObject<HTMLElement | null>): boolean {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const enter = (): void => setHovered(true);
    const leave = (): void => setHovered(false);
    const focusIn = (): void => setFocused(true);
    const focusOut = (event: FocusEvent): void => {
      const { relatedTarget } = event;
      setFocused(relatedTarget instanceof Node && el.contains(relatedTarget));
    };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("focusin", focusIn);
    el.addEventListener("focusout", focusOut);
    return (): void => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("focusin", focusIn);
      el.removeEventListener("focusout", focusOut);
    };
  }, [ref]);
  return hovered || focused;
}

interface TipRotation {
  tips: KitchenTip[];
  index: number;
  stopped: boolean;
  rotating: boolean;
  toggleStopped: () => void;
  next: () => void;
}

function useTipRotation(held: boolean): TipRotation {
  const [tips, setTips] = useState<KitchenTip[]>([]);
  const [index, setIndex] = useState(0);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    setTips(tipsForDay(localDayNumber(new Date())));
    setStopped(prefersReducedMotion());
  }, []);

  const count = tips.length;
  const rotating = count > 1 && !stopped && !held;
  // Keyed on index, so a manual "next" restarts the clock for the new tip.
  useEffect(() => {
    if (!rotating) return undefined;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), TIP_ROTATE_MS);
    return (): void => window.clearTimeout(timer);
  }, [rotating, count, index]);

  return {
    tips,
    index,
    stopped,
    rotating,
    toggleStopped: (): void => setStopped((s) => !s),
    next: (): void => setIndex((i) => (count > 0 ? (i + 1) % count : 0)),
  };
}

function TipLinkView({ link }: { link: TipLink }): React.JSX.Element {
  if (link.external) {
    return (
      <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
        {link.label} <span aria-hidden="true">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link className={styles.link} href={link.href}>
      {link.label} <span aria-hidden="true">→</span>
    </Link>
  );
}

function TipItem({ tip, active }: { tip: KitchenTip; active: boolean }): React.JSX.Element {
  return (
    <p
      className={styles.item}
      data-active={active}
      aria-hidden={active ? undefined : true}
      inert={!active}
    >
      <span className={styles.text}>{tip.text}</span> <TipLinkView link={tip.link} />
    </p>
  );
}

interface TipControlsProps {
  stopped: boolean;
  onToggle: () => void;
  onNext: () => void;
}

function TipControls({ stopped, onToggle, onNext }: TipControlsProps): React.JSX.Element {
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.control}
        onClick={onToggle}
        aria-label={stopped ? "Resume rotating tips" : "Pause rotating tips"}
      >
        <span aria-hidden="true">{stopped ? "▶" : "❚❚"}</span>
      </button>
      <button type="button" className={styles.control} onClick={onNext} aria-label="Next tip">
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}

export function KitchenTipStrip(): React.JSX.Element {
  const stripRef = useRef<HTMLElement | null>(null);
  const held = useEngaged(stripRef);
  const { tips, index, stopped, rotating, toggleStopped, next } = useTipRotation(held);
  return (
    <aside ref={stripRef} className={styles.strip} aria-label="Kitchen tip of the day">
      <p className={`t-mono ${styles.label}`}>
        <span aria-hidden="true">✦</span> Tip of the day
        {tips.length > 1 && (
          <span className={styles.count}>
            {index + 1} / {tips.length}
          </span>
        )}
      </p>
      <div className={styles.stack} aria-live={rotating ? "off" : "polite"}>
        {tips.length === 0 ? (
          <p className={styles.item} data-active="true">
            &nbsp;
          </p>
        ) : (
          tips.map((tip, i) => <TipItem key={tip.id} tip={tip} active={i === index} />)
        )}
      </div>
      {tips.length > 1 && <TipControls stopped={stopped} onToggle={toggleStopped} onNext={next} />}
    </aside>
  );
}
