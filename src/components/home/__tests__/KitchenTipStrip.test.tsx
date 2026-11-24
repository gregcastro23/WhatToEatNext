/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { KitchenTipStrip } from "../KitchenTipStrip";
import { localDayNumber, TIP_ROTATE_MS, tipsForDay } from "../tipOfTheDay";

const NOW = new Date(2026, 10, 24, 12, 0);
const TODAY = tipsForDay(localDayNumber(NOW));

function textOf(i: number): string {
  return TODAY[i]?.text ?? `missing tip ${i}`;
}

/** Whether the tip is the one on show (the others stay mounted, hidden). */
function isShown(i: number): boolean {
  return screen.getByText(textOf(i)).closest("p")?.getAttribute("data-active") === "true";
}

function setReducedMotion(reduce: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({ matches: reduce, media: query }),
  });
}

function advance(ms: number): void {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(NOW);
  setReducedMotion(false);
});

afterEach(() => {
  jest.useRealTimers();
});

it("shows the first of today's tips, linked to its source", () => {
  render(<KitchenTipStrip />);
  expect(TODAY.length).toBeGreaterThan(1);
  expect(isShown(0)).toBe(true);
  expect(isShown(1)).toBe(false);
  expect(screen.getByText(`1 / ${TODAY.length}`)).toBeInTheDocument();
  const link = screen.getByText(textOf(0)).closest("p")?.querySelector("a");
  expect(link?.getAttribute("href")).toBe(TODAY[0]?.link.href);
});

it("moves to the next tip on its own, and wraps after the last", () => {
  render(<KitchenTipStrip />);
  advance(TIP_ROTATE_MS - 1);
  expect(isShown(0)).toBe(true);
  advance(1);
  expect(isShown(1)).toBe(true);
  // One tip per step: each timeout is armed by the render that shows its tip.
  for (let i = 2; i <= TODAY.length; i++) advance(TIP_ROTATE_MS);
  expect(isShown(0)).toBe(true);
});

it("holds the tip while the pointer is over the strip", () => {
  render(<KitchenTipStrip />);
  const strip = screen.getByRole("complementary", { name: "Kitchen tip of the day" });
  fireEvent.mouseEnter(strip);
  advance(TIP_ROTATE_MS * 3);
  expect(isShown(0)).toBe(true);
  fireEvent.mouseLeave(strip);
  advance(TIP_ROTATE_MS);
  expect(isShown(1)).toBe(true);
});

it("holds the tip while keyboard focus is inside it, even after the pointer leaves", () => {
  render(<KitchenTipStrip />);
  const strip = screen.getByRole("complementary", { name: "Kitchen tip of the day" });
  const link = screen.getByText(textOf(0)).closest("p")?.querySelector("a");
  act(() => link?.focus());
  expect(document.activeElement).toBe(link);
  fireEvent.mouseEnter(strip);
  fireEvent.mouseLeave(strip);
  advance(TIP_ROTATE_MS * 2);
  expect(isShown(0)).toBe(true);
  act(() => link?.blur());
  advance(TIP_ROTATE_MS);
  expect(isShown(1)).toBe(true);
});

it("stops for good on pause, and still steps forward on Next", () => {
  render(<KitchenTipStrip />);
  fireEvent.click(screen.getByRole("button", { name: "Pause rotating tips" }));
  expect(document.activeElement).toBe(document.body); // only the pause holds it
  advance(TIP_ROTATE_MS * 3);
  expect(isShown(0)).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Next tip" }));
  expect(isShown(1)).toBe(true);
  expect(screen.getByText(`2 / ${TODAY.length}`)).toBeInTheDocument();
});

it("starts paused for visitors who prefer reduced motion", () => {
  setReducedMotion(true);
  render(<KitchenTipStrip />);
  expect(screen.getByRole("button", { name: "Resume rotating tips" })).toBeInTheDocument();
  advance(TIP_ROTATE_MS * 2);
  expect(isShown(0)).toBe(true);
});
