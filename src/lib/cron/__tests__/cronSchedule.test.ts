/**
 * Cron-expression arithmetic used by the heartbeat watchdog and /admin/jobs.
 */

import {
  countFiresBetween,
  describeSchedule,
  expectedIntervalMinutes,
  parseSchedule,
} from "@/lib/cron/cronSchedule";

const HOUR_MS = 3_600_000;
const T0 = Date.UTC(2026, 8, 22, 0, 0, 0);

describe("parseSchedule", () => {
  it("reads steps, ranges, and lists", () => {
    expect(parseSchedule("*/15 * * * *")?.minutes).toEqual([0, 15, 30, 45]);
    expect(parseSchedule("2,17,32,47 * * * *")?.minutes).toEqual([2, 17, 32, 47]);
    expect(parseSchedule("5-59/20 * * * *")?.minutes).toEqual([5, 25, 45]);
    expect(parseSchedule("30 0 * * *")).toEqual({ minutes: [30], hours: [0] });
  });

  it("refuses what it cannot represent rather than approximating", () => {
    expect(parseSchedule("0 9 * * 1-5")).toBeNull(); // weekday-constrained
    expect(parseSchedule("60 * * * *")).toBeNull(); // out of range
    expect(parseSchedule("1,,2 * * * *")).toBeNull(); // empty list item
    expect(parseSchedule("garbage")).toBeNull();
  });
});

describe("expectedIntervalMinutes", () => {
  it("is the widest gap between fires, wrapping the hour and the day", () => {
    expect(expectedIntervalMinutes("2,17,32,47 * * * *")).toBe(15);
    expect(expectedIntervalMinutes("13,43 * * * *")).toBe(30);
    expect(expectedIntervalMinutes("0,50 * * * *")).toBe(50);
    expect(expectedIntervalMinutes("5 * * * *")).toBe(60);
    expect(expectedIntervalMinutes("5 0 * * *")).toBe(1440);
  });
});

describe("countFiresBetween", () => {
  it("counts the fires a schedule owed in a window", () => {
    expect(countFiresBetween("2,17,32,47 * * * *", T0, T0 + 24 * HOUR_MS)).toBe(96);
    expect(countFiresBetween("5 * * * *", T0, T0 + 24 * HOUR_MS)).toBe(24);
    // A daily job is owed once in any 24h window…
    expect(countFiresBetween("0 9 * * *", T0 + 10 * HOUR_MS, T0 + 34 * HOUR_MS)).toBe(1);
    // …and a half-open window excludes the fire exactly at its end.
    expect(countFiresBetween("0 9 * * *", T0, T0 + 9 * HOUR_MS)).toBe(0);
  });

  it("is null, not zero, for a schedule it cannot read", () => {
    expect(countFiresBetween("0 9 * * 1", T0, T0 + 24 * HOUR_MS)).toBeNull();
  });
});

describe("describeSchedule", () => {
  it("names the common shapes", () => {
    expect(describeSchedule("20 * * * *")).toBe("hourly at :20");
    expect(describeSchedule("2,17,32,47 * * * *")).toBe("every 15 min (:02 :17 :32 :47)");
    expect(describeSchedule("30 0 * * *")).toBe("daily 00:30 UTC");
  });
});
