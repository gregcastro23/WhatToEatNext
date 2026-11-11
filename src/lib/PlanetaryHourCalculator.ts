import SunCalc from "suncalc";
import { FOREST_HILLS_COORDINATES } from "@/config/locationConfig";
import { _logger } from "@/lib/logger";
import type { Planet } from "@/types/celestial";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * The classical planetary hours.
 *
 * The planetary DAY runs from one sunrise to the next, not from midnight to
 * midnight. Its first hour belongs to the planet of the weekday on which that
 * sunrise falls; the time from sunrise to sunset is divided into 12 equal day
 * hours and the time from sunset to the next sunrise into 12 equal night hours,
 * and each hour belongs to the next planet in the Chaldean order after the one
 * before it (see `planetaryHours` below, which is that order from each weekday's
 * planet).
 *
 * So the hours between midnight and dawn are the LAST night hours of the day
 * that began at yesterday's sunrise, and their planets come from yesterday's
 * row. The weekday is the one at the PLACE, never the host's: see
 * `localMeanSolarWeekday`. The Python reference is
 * `planetary_hour_at` in backend/utils/planetary_hours.py, and both are held
 * to the same golden vectors (backend/tests/planetary_hour_golden_vectors.json).
 */
export class PlanetaryHourCalculator {
  // Planetary hour configuration according to traditional planetary rulers
  private static readonly planetaryHours: Record<string, Planet[]> = {
    Sunday: ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"],
    Monday: ["Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury"],
    Tuesday: ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"],
    Wednesday: ["Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun", "Venus"],
    Thursday: ["Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn"],
    Friday: ["Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars", "Sun"],
    Saturday: ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"],
  };

  private static readonly dayNames: string[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Planetary rulers for each day of the week (0 = Sunday)
  private static readonly dayRulers: Planet[] = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
  ];

  // Minute rulers - each planet rules approximately 8.57 minutes in sequence
  private static readonly minuteRulers: Planet[] = [
    "Sun",
    "Venus",
    "Mercury",
    "Moon",
    "Saturn",
    "Jupiter",
    "Mars",
  ];

  private readonly planetaryRulers = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
  ];

  private coordinates = {
    latitude: FOREST_HILLS_COORDINATES.latitude,
    longitude: FOREST_HILLS_COORDINATES.longitude,
  };

  constructor(latitude?: number, longitude?: number) {
    if (latitude !== undefined && longitude !== undefined) {
      this.coordinates = { latitude, longitude };
    }
  }

  /**
   * Set the location coordinates
   */
  public setCoordinates(latitude: number, longitude: number): void {
    this.coordinates = { latitude, longitude };
  }

  /**
   * Calculate the current planetary day
   * @returns The planet ruling the current day
   */
  getCurrentPlanetaryDay(): Planet {
    return this.getPlanetaryDay(new Date());
  }

  /** Resolve the hour sequence for a weekday index, naming the invariant if it is out of range. */
  private static sequenceFor(dayOfWeek: number): Planet[] {
    const dayName = PlanetaryHourCalculator.dayNames[dayOfWeek];
    const sequence =
      dayName === undefined
        ? undefined
        : PlanetaryHourCalculator.planetaryHours[dayName];
    if (sequence === undefined) {
      throw new Error(
        `PlanetaryHourCalculator: no planetary hour sequence for day index ${dayOfWeek}`,
      );
    }
    return sequence;
  }

  /** Resolve the ruling planet for a weekday index and continuous hour index. */
  private static rulerFor(dayOfWeek: number, hourIndex: number): Planet {
    const ruler = PlanetaryHourCalculator.sequenceFor(dayOfWeek)[hourIndex % 7];
    if (ruler === undefined) {
      throw new Error(
        `PlanetaryHourCalculator: no ruler at hour index ${hourIndex} for day ${dayOfWeek}`,
      );
    }
    return ruler;
  }

  /**
   * The weekday (0 = Sunday) at this calculator's longitude of an instant, by
   * LOCAL MEAN SOLAR TIME: UTC shifted by longitude / 15 hours.
   *
   * Chosen over the host's `getDay()` because the host is not the place. A
   * server in UTC (Vercel) called Saturday evening in New York "Sunday" from
   * 20:00 local, and a laptop in Tokyo called it by Tokyo's date. It is chosen
   * over a civil timezone because the calculator is given only a latitude and a
   * longitude, and no timezone database can turn those into a zone offline; this
   * needs none and is the same on every machine. It is also exactly what the
   * Python reference does, so the golden vectors apply with no per-zone special
   * case.
   *
   * It is the civil weekday everywhere except where the civil date is on the
   * other side of the date line from the longitude (Kiritimati, the Chatham
   * Islands, Tonga, Samoa), or where the instant asked about is within a few
   * hours of local midnight, which for the weekday of a SUNRISE means the polar
   * summer. There it can be a day out; the reference documents the same limit.
   */
  private localMeanSolarWeekday(instant: number): number {
    return new Date(
      instant + (this.coordinates.longitude / 15) * HOUR_MS,
    ).getUTCDay();
  }

  /**
   * Where `date` falls in the planetary day it belongs to, from the sunrise and
   * sunset SunCalc finds for the solar day CONTAINING `date` (see `sunTimesFor`).
   *
   * That solar day runs from about solar midnight to the next, so for a moment
   * between midnight and sunrise it is the day that is just beginning, while
   * the planetary day in progress is yesterday's: it began at yesterday's
   * sunrise, and its night began at yesterday's sunset. Those two are taken as
   * this solar day's, one day earlier. (Reading `date - sunset` there, as this
   * once did, is negative; the hour index was clamped to 0 and every pre-dawn
   * moment was "night hour 1" of the wrong day's row.)
   *
   * The lengths are the ones this class has always used: the day is
   * sunset - sunrise, the night is 24 hours less that, and each is split in 12.
   * Moving the hour logic here changed the ruler and the pre-dawn hour number
   * and no time: the end of an hour and the start and end of a detailed hour
   * are the same to the millisecond (checked against the previous
   * implementation on 12,800 random moments).
   *
   * @returns `dayStart`, the sunrise that began the planetary day; `periodStart`,
   *   the sunrise (day hours) or the sunset (night hours) the hours are counted
   *   from; and `hourIndex` (0-11) in that period, `hourLength` in ms.
   */
  private locateHour(
    date: Date,
    sunrise: Date,
    sunset: Date,
  ): {
    isDaytime: boolean;
    hourIndex: number;
    hourLength: number;
    periodStart: number;
    dayStart: number;
  } {
    const at = date.getTime();
    const rise = sunrise.getTime();
    const set = sunset.getTime();

    const isDaytime = at >= rise && at <= set;
    const dayLength = set - rise;
    const nightLength = rise + DAY_MS - set;
    const hourLength = (isDaytime ? dayLength : nightLength) / 12;

    // Before sunrise the planetary day in progress began YESTERDAY.
    const dayStart = at < rise ? rise - DAY_MS : rise;
    // Night hours count from the sunset that began this night: today's if it
    // has happened, otherwise yesterday's.
    const nightStart = at >= set ? set : set - DAY_MS;
    const periodStart = isDaytime ? rise : nightStart;

    let hourIndex = Math.floor((at - periodStart) / hourLength);
    if (hourIndex < 0) hourIndex = 0;
    if (hourIndex > 11) hourIndex = 11;

    return { isDaytime, hourIndex, hourLength, periodStart, dayStart };
  }

  /**
   * The planet of the PLANETARY day `date` is in: the planet of the weekday, at
   * this place, on which the sunrise that began it fell. Between midnight and
   * sunrise that is yesterday's planet (at 3am on a Monday the day still running
   * is Sunday's, the Sun's), and the weekday is the place's, not the host's: see
   * `localMeanSolarWeekday`.
   *
   * Where the Sun does not rise (the polar night and the midnight sun) there is
   * no sunrise to begin a day, so the planet of the local mean solar date of
   * `date` itself is returned.
   *
   * @param date The instant to find the planetary day of
   * @returns The planet ruling that day
   */
  getPlanetaryDay(date: Date): Planet {
    const { sunrise } = this.sunTimesFor(date);
    const sunriseAt = sunrise?.getTime();
    // The instant the planetary day began; with no sunrise to begin one, the
    // instant itself.
    let begun = date.getTime();
    if (sunriseAt !== undefined && !Number.isNaN(sunriseAt)) {
      begun = begun < sunriseAt ? sunriseAt - DAY_MS : sunriseAt;
    }
    const dayOfWeek = this.localMeanSolarWeekday(begun);

    const ruler = PlanetaryHourCalculator.dayRulers[dayOfWeek];
    if (ruler === undefined) {
      throw new Error(`PlanetaryHourCalculator: no day ruler for index ${dayOfWeek}`);
    }
    return ruler;
  }

  /**
   * Calculate the current planetary minute
   * @returns The planet ruling the current minute
   */
  getCurrentPlanetaryMinute(): Planet {
    return this.getPlanetaryMinute(new Date());
  }

  /**
   * Calculate the planetary minute for a given date
   * @param date The date to calculate the planetary minute for
   * @returns The planet ruling that minute
   */
  getPlanetaryMinute(date: Date): Planet {
    // Day of the week (0 = Sunday1 = Monday, etc.)
    const dayOfWeek = date.getDay();

    // Current hour and minute
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Total minutes since the day began;
    const _totalMinutesSinceDayBegan = hour * 60 + minute;

    // In traditional planetary hour systems, each planet rules for about 8.57 minutes
    // (60 minutes / 7 planets) within each hour, and follows the same sequence as planetary hours
    // We'll calculate the planet ruling the current minute based on this

    // First, determine which planetary sequence to use (based on day of week)
    const planetarySequence = PlanetaryHourCalculator.sequenceFor(dayOfWeek);

    // Calculate the hour ruler index (0-6) to determine start of sequence
    const hourSinceDay = hour % 24;
    const rulerSequenceStart = hourSinceDay % 7;

    // Calculate which 8.57-minute segment of the hour we're in (0-6)
    const minuteWithinHour = minute % 60;
    const minuteSegment = Math.floor(minuteWithinHour / (60 / 7));
    // The minute ruler is the hour ruler + minute segment, wrapping around if needed
    const minuteRulerIndex = (rulerSequenceStart + minuteSegment) % 7;

    const minuteRuler = planetarySequence[minuteRulerIndex];
    if (minuteRuler === undefined) {
      throw new Error(
        `PlanetaryHourCalculator: no minute ruler at index ${minuteRulerIndex}`,
      );
    }
    return minuteRuler;
  }

  /**
   * Calculate the current planetary hour
   * @returns The planet ruling the current hour
   */
  getCurrentPlanetaryHour(): {
    planet: Planet;
    hourNumber: number;
    isDaytime: boolean;
  } {
    return this.getPlanetaryHour(new Date());
  }

  /**
   * Sun times for the solar day CONTAINING `date`, resolved at this
   * calculator's coordinates.
   *
   * All three call sites used to pass
   * `new Date(date.getFullYear(), date.getMonth(), date.getDate())` — midnight
   * in the RUNNER'S timezone — and then ask for solar times at a different
   * longitude. Those two disagree whenever they fall on opposite sides of a
   * date boundary, which is the normal case in production: Vercel runs in UTC,
   * so for a New York fix (lng -74) the synthesized midnight 2026-01-15T00:00Z
   * is 2026-01-14 19:00 locally, and SunCalc returned the PREVIOUS day's
   * sunrise and sunset. Every planetary hour was then computed against the
   * wrong solar day — wrong ruling planet, wrong isDaytime, wrong boundaries —
   * and the error was invisible to anyone developing west of UTC, where the
   * two happen to agree.
   *
   * Passing the instant itself is SunCalc's intended usage and is timezone
   * independent: the solar day is resolved at the coordinates, not at the host.
   */
  private sunTimesFor(date: Date): ReturnType<typeof SunCalc.getTimes> {
    return SunCalc.getTimes(
      date,
      this.coordinates.latitude,
      this.coordinates.longitude,
    );
  }

  /**
   * Calculate the planetary hour for a given date
   *
   * The planet is the classical one: the sequence of the weekday, at this
   * place, of the sunrise that began the planetary day `date` is in, entry
   * `hour % 7` of its 24 hours. Between midnight and sunrise that is
   * yesterday's sequence (see `locateHour`).
   *
   * @param date The date to calculate the planetary hour for
   * @returns Object containing the planet ruling the hour, the hour number (0-11
   *   within the day or the night) and if it's daytime
   */
  getPlanetaryHour(date: Date): {
    planet: Planet;
    hourNumber: number;
    isDaytime: boolean;
  } {
    // Get sun times for the day
    const times = this.sunTimesFor(date);

    const { sunrise } = times;
    const { sunset } = times;

    if (!sunrise || !sunset) {
      _logger.warn("Could not calculate sunrise or sunset times");
      // Fallback to approximate calculation
      return this.getFallbackPlanetaryHour(date);
    }

    const { isDaytime, hourIndex, dayStart } = this.locateHour(
      date,
      sunrise,
      sunset,
    );

    // The weekday of the sunrise that began the planetary day, at this place.
    const dayOfWeek = this.localMeanSolarWeekday(dayStart);

    // The Day sequence array already begins with the Day's ruler,
    // so we just calculate the continuous hour from sunrise (0 to 23)
    const continuousHourIndex = isDaytime ? hourIndex : hourIndex + 12;

    return {
      planet: PlanetaryHourCalculator.rulerFor(dayOfWeek, continuousHourIndex),
      hourNumber: hourIndex,
      isDaytime,
    };
  }

  /**
   * Determine if the current time is during daylight hours
   * @param date The date to check
   * @returns True if it's daytime (6am-6pm), false otherwise
   */
  isDaytime(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 6 && hour < 18;
  }

  /**
   * Get all planetary hours for a specific day
   * @param date The date to calculate hours for
   * @returns Map of hour (0-23) to ruling planet
   */
  getDailyPlanetaryHours(date: Date): Map<number, Planet> {
    const day = date.getDay();
    const rulers = PlanetaryHourCalculator.sequenceFor(day);
    const result = new Map<number, Planet>();

    // Calculate all 24 hours - 12 daytime hours and 12 nighttime hours
    // Each planetary hour spans approximately 1.714 clock hours

    // Day hours (6am to 6pm)
    for (let i = 0; i < 7; i++) {
      const ruler = rulers[i];
      if (ruler === undefined) {
        throw new Error(`PlanetaryHourCalculator: no ruler at sequence index ${i}`);
      }
      const startHour = Math.floor(6 + i * 1.714);
      const endHour = Math.floor(6 + (i + 1) * 1.714) - 1;

      for (let hour = startHour; hour <= endHour; hour++) {
        result.set(hour, ruler);
      }
    }

    // Night hours (6pm to 6am)
    for (let i = 0; i < 7; i++) {
      const ruler = rulers[i];
      if (ruler === undefined) {
        throw new Error(`PlanetaryHourCalculator: no ruler at sequence index ${i}`);
      }
      const startHour = Math.floor(18 + i * 1.714) % 24;
      const endHour = (Math.floor(18 + (i + 1) * 1.714) % 24) - 1;

      if (endHour < startHour) {
        // Handle hours that cross midnight
        for (let hour = startHour; hour < 24; hour++) {
          result.set(hour, ruler);
        }
        for (let hour = 0; hour <= endHour; hour++) {
          result.set(hour, ruler);
        }
      } else {
        for (let hour = startHour; hour <= endHour; hour++) {
          result.set(hour, ruler);
        }
      }
    }

    return result;
  }

  /**
   * Calculate planetary hour using the traditional system
   * This is the legacy method for compatibility
   * @param date The date to calculate for
   * @returns The ruling planet for that hour
   */
  calculatePlanetaryHour(date: Date): Planet {
    return this.getPlanetaryHour(date).planet;
  }

  /**
   * Get the next transition time to the following planetary hour
   */
  getNextPlanetaryHourTransition(date: Date = new Date()): Date {
    const times = this.sunTimesFor(date);
    const { sunrise, sunset } = times;
    if (!sunrise || !sunset) {
      const nextHour = new Date(date);
      nextHour.setHours(date.getHours() + 1, 0, 0, 0);
      return nextHour;
    }

    // The same place in the planetary day that `getPlanetaryHour` finds: one
    // function, not two copies of the pre-dawn arithmetic.
    const { hourIndex, hourLength, periodStart } = this.locateHour(
      date,
      sunrise,
      sunset,
    );

    return new Date(periodStart + (hourIndex + 1) * hourLength);
  }

  /**
   * Get full planetary hour details including boundaries and next planet
   */
  getDetailedPlanetaryHour(date: Date = new Date()): {
    planet: Planet;
    hourNumber: number;
    isDaytime: boolean;
    start: Date;
    end: Date;
    nextPlanet: Planet;
  } {
    const hourInfo = this.getPlanetaryHour(date);
    const nextTransition = this.getNextPlanetaryHourTransition(date);
    const nextPlanetHour = this.getPlanetaryHour(new Date(nextTransition.getTime() + 60000));

    const times = this.sunTimesFor(date);
    const { sunrise, sunset } = times;
    const dayLength = sunrise && sunset ? sunset.getTime() - sunrise.getTime() : 12 * 60 * 60 * 1000;
    const nightLength = 24 * 60 * 60 * 1000 - dayLength;
    const hourLength = hourInfo.isDaytime ? dayLength / 12 : nightLength / 12;
    const start = new Date(nextTransition.getTime() - hourLength);

    return {
      ...hourInfo,
      start,
      end: nextTransition,
      nextPlanet: nextPlanetHour.planet,
    };
  }

  // Fallback calculation in case SunCalc fails
  private getFallbackPlanetaryHour(date: Date): {
    planet: Planet;
    hourNumber: number;
    isDaytime: boolean;
  } {
    const hour = date.getHours();
    const dayOfWeek = date.getDay();

    // Approximate planetary hour based on 24-hour day divided into 12 day and 12 night hours;
    let hourIndex;
    if (hour >= 6 && hour < 18) {
      // Daytime hour
      hourIndex = Math.floor(((hour - 6) / 12) * 12);
    } else {
      // Nighttime hour
      hourIndex = Math.floor((((hour < 6 ? hour + 24 : hour) - 18) / 12) * 12);
    }

    const continuousHourIndex = this.isDaytime(date) ? hourIndex : hourIndex + 12;

    return {
      planet: PlanetaryHourCalculator.rulerFor(dayOfWeek, continuousHourIndex),
      hourNumber: hourIndex,
      isDaytime: this.isDaytime(date),
    };
  }
}
