import {
  interleave,
  KITCHEN_TIPS,
  localDayNumber,
  TIPS_PER_DAY,
  tipsForDay,
  type KitchenTip,
} from "../tipOfTheDay";

const DAY = localDayNumber(new Date(2026, 10, 24, 12, 0));

function tip(id: string): KitchenTip {
  return { id, text: `${id}.`, basis: "house", link: { href: "/", label: "Home", external: false } };
}

describe("localDayNumber", () => {
  it("turns over at the visitor's local midnight", () => {
    const lateEvening = new Date(2026, 10, 24, 23, 59);
    expect(localDayNumber(new Date(2026, 10, 24, 0, 1))).toBe(localDayNumber(lateEvening));
    expect(localDayNumber(new Date(2026, 10, 25, 0, 1))).toBe(localDayNumber(lateEvening) + 1);
  });
});

describe("tipsForDay", () => {
  it("gives a day TIPS_PER_DAY different tips, the same ones every time it's asked", () => {
    const today = tipsForDay(DAY);
    expect(today).toHaveLength(TIPS_PER_DAY);
    expect(new Set(today.map((t) => t.id)).size).toBe(TIPS_PER_DAY);
    expect(tipsForDay(DAY).map((t) => t.id)).toEqual(today.map((t) => t.id));
  });

  it("starts each day where the previous day ended", () => {
    const today = tipsForDay(DAY).map((t) => t.id);
    const tomorrow = tipsForDay(DAY + 1).map((t) => t.id);
    const pool = KITCHEN_TIPS.map((t) => t.id);
    const lastToday = pool.indexOf(today[today.length - 1] ?? "");
    expect(lastToday).toBeGreaterThanOrEqual(0);
    expect(tomorrow[0]).toBe(pool[(lastToday + 1) % pool.length]);
  });

  it("shows every tip in the pool before any tip comes round again", () => {
    const days = Math.ceil(KITCHEN_TIPS.length / TIPS_PER_DAY);
    const seen = new Set<string>();
    for (let d = 0; d < days; d++) for (const t of tipsForDay(DAY + d)) seen.add(t.id);
    expect(seen.size).toBe(KITCHEN_TIPS.length);
  });

  it("copes with a pool smaller than a day's worth, and with an empty one", () => {
    expect(tipsForDay(DAY, [tip("a"), tip("b")]).map((t) => t.id).sort()).toEqual(["a", "b"]);
    expect(tipsForDay(DAY, [])).toEqual([]);
  });
});

describe("KITCHEN_TIPS", () => {
  it("has unique ids, and every tip reads as a sentence", () => {
    expect(new Set(KITCHEN_TIPS.map((t) => t.id)).size).toBe(KITCHEN_TIPS.length);
    for (const t of KITCHEN_TIPS) expect(t.text).toMatch(/[.!?]$/);
  });

  it("never puts two tips from the same method side by side", () => {
    const methodOf = (t: KitchenTip): string | null => (t.basis === "method" ? t.link.href : null);
    for (let i = 1; i < KITCHEN_TIPS.length; i++) {
      const [previous, current] = [KITCHEN_TIPS[i - 1], KITCHEN_TIPS[i]];
      if (!previous || !current) continue;
      const method = methodOf(current);
      if (method !== null) expect(methodOf(previous)).not.toBe(method);
    }
  });
});

describe("interleave", () => {
  it("takes the first of each group, then the second of each, and so on", () => {
    expect(interleave([["a1", "a2", "a3"], ["b1"], ["c1", "c2"]])).toEqual([
      "a1",
      "b1",
      "c1",
      "a2",
      "c2",
      "a3",
    ]);
    expect(interleave([])).toEqual([]);
  });
});
