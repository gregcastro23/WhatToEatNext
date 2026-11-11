/**
 * Entry point for a FRESH process: `TZ=<zone> bun run planetaryHourGoldenInZone.ts`.
 *
 * Node latches the zone once, at start-up, and a jest test cannot change it for
 * itself (`planetaryHourGoldenVectors.test.ts` explains why the repo's other
 * zone tests do not try). So the test that wants a real host clock in another
 * zone starts a process with `TZ` in its environment and reads the one JSON line
 * this prints: the zone the process actually has, its offset on two dates (so the
 * caller can see the zone took), and how often `PlanetaryHourCalculator` and the
 * golden vectors disagree in it.
 */
import { evaluateCalculator, loadGolden, type Mismatch } from "./planetaryHourGolden";

const evaluation = evaluateCalculator(loadGolden());
const everyMismatch: Mismatch[] = [
  ...evaluation.wrongRuler.day,
  ...evaluation.wrongRuler["evening night"],
  ...evaluation.wrongRuler["pre-dawn night"],
  ...evaluation.wrongHour,
  ...evaluation.wrongDayRuler,
];

console.log(
  JSON.stringify({
    zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offsetJune: new Date("2025-06-15T12:00:00Z").getTimezoneOffset(),
    offsetDecember: new Date("2025-12-14T12:00:00Z").getTimezoneOffset(),
    checked: evaluation.checked,
    wrongRuler: {
      day: evaluation.wrongRuler.day.length,
      eveningNight: evaluation.wrongRuler["evening night"].length,
      preDawnNight: evaluation.wrongRuler["pre-dawn night"].length,
    },
    wrongHour: evaluation.wrongHour.length,
    wrongDayRuler: evaluation.wrongDayRuler.length,
    firstMismatches: everyMismatch.slice(0, 3),
  }),
);
