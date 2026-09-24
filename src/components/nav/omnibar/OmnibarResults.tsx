"use client";

/**
 * The results listbox (ARIA combobox pattern): sections of options, one
 * flat index across them, plus the did-you-mean line, a status line, the
 * key hints, and a polite live region announcing the result count.
 */
import Link from "next/link";
import { useEffect, type JSX, type MouseEvent } from "react";
import { Glyph } from "@/components/ui/alchm/Glyph";
import { OmnibarActionChip } from "./OmnibarActionChip";
import { OmnibarHeroRow } from "./OmnibarHeroRow";
import { optionId, type LinkRow, type HeroRow, type OmnibarCorrection, type OmnibarRow, type OmnibarSection } from "./omnibarTypes";
import type { OmnibarController } from "./useOmnibarController";

interface RowProps {
  row: LinkRow | HeroRow;
  id: string;
  selected: boolean;
  onHover: () => void;
  onPicked: () => void;
}

/**
 * No viewport prefetch: each result row is a page render (a recipe loads the
 * whole catalog when its instance is cold), and a dropdown shows a dozen rows
 * per keystroke. Production, 2026-09-24: one "aubergine" result list rendered
 * five recipe pages at once, each waiting on a 6 s catalog-query timeout.
 */
function OptionRow({ row, id, selected, onHover, onPicked }: RowProps): JSX.Element {
  const external = row.type === "link" && row.external;
  return (
    <Link
      id={id}
      role="option"
      prefetch={false}
      aria-selected={selected}
      tabIndex={-1}
      href={row.href}
      className={row.type === "hero" ? "omni-opt omni-opt-hero" : "omni-opt"}
      data-kind={row.kind}
      onMouseMove={selected ? undefined : onHover}
      onClick={onPicked}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {row.type === "hero" ? (
        <OmnibarHeroRow hero={row.hero} label={row.label} />
      ) : (
        <>
          <span className="omni-opt-icon" aria-hidden="true">
            <Glyph name={row.icon} size={12} stroke={1.4} />
          </span>
          <span className="omni-opt-text">
            <span className="omni-opt-label">{row.label}</span>
            <span className="omni-opt-hint">{row.hint}</span>
          </span>
        </>
      )}
    </Link>
  );
}

function CorrectionLine({ correction }: { correction: OmnibarCorrection }): JSX.Element {
  const why = correction.basis === "synonym" ? `“${correction.from}” is another name for it` : `no exact match for “${correction.from}”`;
  return (
    <div className="omni-correction">
      Showing results for <strong>{correction.to}</strong> <span className="omni-mute">· {why}</span>
    </div>
  );
}

function announcement(controller: OmnibarController): string {
  if (controller.notice !== null) return controller.notice;
  if (controller.status === "loading") return "Searching";
  if (controller.status === "error") return "Search is unavailable right now";
  const count = controller.rows.filter((row) => row.kind !== "search").length;
  return `${count} ${count === 1 ? "result" : "results"}`;
}

export interface OmnibarResultsProps {
  controller: OmnibarController;
  listboxId: string;
  /** The desktop dropdown keeps focus in the input while a row is clicked. */
  keepInputFocus: boolean;
}

function keepFocus(event: MouseEvent<HTMLDivElement>): void {
  event.preventDefault();
}

function Row({ row, at, controller, listboxId }: { row: OmnibarRow; at: number; controller: OmnibarController; listboxId: string }): JSX.Element {
  const shared = {
    id: optionId(listboxId, at),
    selected: at === controller.activeIndex,
    onHover: (): void => controller.setActiveIndex(at),
    onPicked: (): void => controller.onPicked(row),
  };
  return row.type === "action" ? (
    <OmnibarActionChip {...shared} row={row} onRun={() => controller.activate(row, false)} />
  ) : (
    <OptionRow {...shared} row={row} />
  );
}

/** A section's heading, or for the chips a group label only screen readers hear. */
function groupProps(section: OmnibarSection, listboxId: string): { "aria-labelledby"?: string; "aria-label"?: string; className?: string } {
  if (section.layout === "chips") return { "aria-label": section.label ?? "Actions", className: "omni-chips" };
  return section.title ? { "aria-labelledby": `${listboxId}-${section.id}` } : {};
}

function ResultList({ controller, listboxId, keepInputFocus }: OmnibarResultsProps): JSX.Element {
  let index = -1;
  return (
    <div
      id={listboxId}
      role="listbox"
      tabIndex={-1}
      aria-label="Search results"
      className="omni-listbox"
      onMouseDown={keepInputFocus ? keepFocus : undefined}
    >
      {controller.model.sections.map((section) => (
        <div key={section.id} role="group" data-section={section.id} {...groupProps(section, listboxId)}>
          {section.title ? (
            <div id={`${listboxId}-${section.id}`} className="omni-sec-title" role="presentation">
              {section.title}
            </div>
          ) : null}
          {section.rows.map((row) => {
            index += 1;
            return <Row key={row.id} row={row} at={index} controller={controller} listboxId={listboxId} />;
          })}
        </div>
      ))}
    </div>
  );
}

function ResultsFooter({ controller }: { controller: OmnibarController }): JSX.Element {
  const active = controller.rows[controller.activeIndex];
  const enterLabel = active ? "OPEN" : (controller.enter?.label ?? "OPEN");
  const onHero = active?.type === "hero" || active?.type === "action";
  return (
    <div className="omni-footer" aria-hidden="true">
      <span>
        <kbd>↑↓</kbd> NAVIGATE {onHero ? <><kbd>←→</kbd> ACTIONS </> : null}<kbd>↵</kbd> {enterLabel} <kbd>⌘↵</kbd> NEW TAB
      </span>
      <span>
        <kbd>ESC</kbd> CLOSE
      </span>
    </div>
  );
}

export function OmnibarResults(props: OmnibarResultsProps): JSX.Element {
  const { controller, listboxId } = props;
  const { model, activeIndex, status } = controller;
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(optionId(listboxId, activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);
  return (
    <div className="omni-results">
      {model.correction ? <CorrectionLine correction={model.correction} /> : null}
      {status === "error" ? <div className="omni-status">Search is unavailable right now. Pages still work.</div> : null}
      {status === "loading" ? <div className="omni-status">Searching…</div> : null}
      {controller.notice !== null ? <div className="omni-status omni-notice">{controller.notice}</div> : null}
      <ResultList {...props} />
      <ResultsFooter controller={controller} />
      <div className="omni-sr-only" role="status" aria-live="polite">
        {announcement(controller)}
      </div>
    </div>
  );
}
