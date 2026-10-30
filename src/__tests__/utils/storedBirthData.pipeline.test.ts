/**
 * The edges of the temporal pipeline's use: what is never sent to it, and what is
 * claimed when it names no zone. The pipeline is wrapped, not replaced — every
 * call still reaches the real implementation unless a test says otherwise.
 *
 * Separate from `storedBirthData.test.ts` because `jest.mock` is per file.
 */

import {
  resolveBirthZone,
  wallClockToInstant,
} from "@/utils/astrology/birthTimezone";
import { readStoredBirthData } from "@/utils/astrology/storedBirthData";
import {
  freudRow,
  homerRow,
  placeholderAgentRow,
  socratesLegacyRow,
  socratesRow,
  yearOnlyRow,
} from "../helpers/companionFixtures";

jest.mock("@/utils/astrology/birthTimezone", () => {
  const actual = jest.requireActual("@/utils/astrology/birthTimezone");
  return {
    ...actual,
    resolveBirthZone: jest.fn(actual.resolveBirthZone),
    wallClockToInstant: jest.fn(actual.wallClockToInstant),
  };
});

const actualResolve = jest.requireActual("@/utils/astrology/birthTimezone").resolveBirthZone;

beforeEach(() => {
  jest.mocked(resolveBirthZone).mockClear();
  jest.mocked(wallClockToInstant).mockClear();
  jest.mocked(resolveBirthZone).mockImplementation(actualResolve);
});

describe("what is never sent to the pipeline", () => {
  it.each([
    ["the year-1 'unknown date' (Homer, at 0,0)", homerRow().birth_data],
    ["the year-1 'unknown date' with a real place (Socrates)", socratesRow().birth_data],
    ["an ISO expanded year (470 BC)", socratesLegacyRow().birth_data],
    ["a year-only birth at (0, 0)", yearOnlyRow().birth_data],
    ["the agent sentinel", placeholderAgentRow().birth_data],
    ["a (0, 0) pin", { date: "1856-05-06", time: "18:30", location: { lat: 0, lon: 0 } }],
    ["a year-99 date", { date: "0099-06-01", time: "12:00", location: { lat: 41.9, lon: 12.5 } }],
    ["an unreadable record", { date: "sometime", time: "12:00", location: { lat: 41.9, lon: 12.5 } }],
    ["nothing at all", {}],
  ])("%s", (_label, stored) => {
    expect(readStoredBirthData(stored).kind).toBe("none");
    expect(resolveBirthZone).not.toHaveBeenCalled();
    expect(wallClockToInstant).not.toHaveBeenCalled();
  });

  it("while a real birth does reach it — so the assertions above can fail", () => {
    expect(readStoredBirthData(freudRow().birth_data).kind).toBe("birth");
    expect(resolveBirthZone).toHaveBeenCalledTimes(1);
    expect(wallClockToInstant).toHaveBeenCalledTimes(1);
  });
});

describe("when the pipeline names no zone", () => {
  beforeEach(() => {
    jest.mocked(resolveBirthZone).mockReturnValue({
      zone: null,
      basis: "ABSENT",
      storedDisagrees: false,
      storedIsRawOffset: false,
    });
  });

  it("keeps the wall clock and says so — no instant, no zone, nothing invented", () => {
    const result = readStoredBirthData(freudRow().birth_data);
    expect(result).toEqual({
      kind: "birth",
      birthData: {
        dateTime: "1856-05-06T18:30:00.000Z",
        latitude: 49.6116,
        longitude: 17.2381,
        timezoneBasis: "ABSENT",
      },
    });
    expect(wallClockToInstant).not.toHaveBeenCalled();
  });

  it("does not accept a zone whose basis is not derived from the coordinates", () => {
    jest.mocked(resolveBirthZone).mockReturnValue({
      zone: "America/New_York",
      basis: "STORED_IANA_STRING",
      storedDisagrees: false,
      storedIsRawOffset: false,
    });
    const result = readStoredBirthData(freudRow().birth_data);
    expect(result.kind === "birth" ? result.birthData.timezoneBasis : "none").toBe("ABSENT");
    expect(result.kind === "birth" ? result.birthData.utcInstant : "none").toBeUndefined();
  });
});
