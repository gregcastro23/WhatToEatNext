/**
 * Postal-code recognition and resolution guards.
 *
 * The property under test is not "does it parse" but **does it ever hand a
 * geocoder a code without the country that disambiguates it**. `[MEASURED
 * 2026-08-17]` the bare code `80202` matches four countries — Lithuania, Bosnia,
 * the USA and Kenya — so an omitted country is not a missing nicety, it is a
 * cook placed on the wrong continent.
 */

import {
  parsePostalCode,
  POSTAL_CENTROID_CAVEAT,
  POSTAL_FORMAT_LABEL,
} from "@/lib/location/postalCode";
import { resolvePostalCode } from "@/services/geocodingService";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";

describe("parsePostalCode", () => {
  it("recognises a US ZIP and attributes it to the US", () => {
    expect(parsePostalCode("80202")).toEqual({
      code: "80202",
      country: "us",
      format: "us-zip",
    });
  });

  it("normalises ZIP+4 down to the 5-digit code the geocoder indexes", () => {
    // Both spellings MUST produce one identical result: measured, the geocoder
    // returns the same centroid for `80202-1234` and `80202`, so keeping the +4
    // would only create a second cache key for the same answer.
    expect(parsePostalCode("80202-1234")).toEqual(parsePostalCode("80202"));
  });

  it("recognises a Canadian postal code and normalises spacing and case", () => {
    const expected = { code: "M5V 3L9", country: "ca", format: "ca-postal" };
    expect(parsePostalCode("M5V 3L9")).toEqual(expected);
    expect(parsePostalCode("m5v3l9")).toEqual(expected);
    expect(parsePostalCode("  M5V3L9  ")).toEqual(expected);
  });

  it("recognises a UK postcode and normalises spacing and case", () => {
    const expected = { code: "SW1A 1AA", country: "gb", format: "uk-postcode" };
    expect(parsePostalCode("SW1A 1AA")).toEqual(expected);
    expect(parsePostalCode("sw1a1aa")).toEqual(expected);
  });

  it("keeps the Canadian and UK patterns disjoint", () => {
    // A UK inward code always ends in two letters; a Canadian one always ends in
    // a digit. If that ever stops holding, one country's codes start resolving
    // in the other's territory.
    expect(parsePostalCode("M5V 3L9")?.country).toBe("ca");
    expect(parsePostalCode("M1 1AE")?.country).toBe("gb");
    expect(parsePostalCode("EC1A 1BB")?.country).toBe("gb");
    expect(parsePostalCode("K1A 0B1")?.country).toBe("ca");
  });

  it("refuses input it cannot attribute to a country", () => {
    // A bare 4-digit code is used by dozens of countries and nothing in the
    // string says which. Guessing one is the failure mode this returns null to
    // avoid; the caller falls through to free-text place search.
    expect(parsePostalCode("1010")).toBeNull();
    expect(parsePostalCode("8010")).toBeNull();

    // Partial Canadian code — measured to return ZERO geocoder results, so
    // accepting it would resolve to nothing rather than to a place.
    expect(parsePostalCode("M5V")).toBeNull();

    expect(parsePostalCode("Denver")).toBeNull();
    expect(parsePostalCode("Denver, CO")).toBeNull();
    expect(parsePostalCode("")).toBeNull();
    expect(parsePostalCode("   ")).toBeNull();
    expect(parsePostalCode("123456")).toBeNull();
  });

  it("labels every format it can return", () => {
    // A format with no label would render as `undefined` in the UI that has to
    // tell the user what kind of code it wants.
    for (const input of ["80202", "M5V 3L9", "SW1A 1AA"]) {
      const parsed = parsePostalCode(input);
      expect(parsed).not.toBeNull();
      expect(POSTAL_FORMAT_LABEL[parsed!.format]).toBeTruthy();
    }
  });
});

describe("resolvePostalCode", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function mockGeocoder(payload: unknown): jest.Mock {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => payload,
    });
    installFetchMock(fetchMock);
    return fetchMock;
  }

  const DENVER = [
    {
      display_name: "80202, Denver, Colorado, United States",
      lat: "39.7509685",
      lon: "-104.9968121",
      address: { city: "Denver", state: "Colorado", country: "United States" },
    },
  ];

  it("sends the country alongside the code, via the STRUCTURED parameter", async () => {
    const fetchMock = mockGeocoder(DENVER);
    await resolvePostalCode({ code: "80202", country: "us", format: "us-zip" });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    // The two properties that keep this out of Kenya: the code goes in the
    // structured `postalcode` field, and `country` is present.
    expect(url.searchParams.get("postalcode")).toBe("80202");
    expect(url.searchParams.get("country")).toBe("us");
    // NOT free text — `q` is how the four-country ambiguity gets in.
    expect(url.searchParams.get("q")).toBeNull();
  });

  it("returns the centroid and the resolved locality", async () => {
    mockGeocoder(DENVER);
    const result = await resolvePostalCode({
      code: "80202",
      country: "us",
      format: "us-zip",
    });

    expect(result).toMatchObject({
      postalCode: "80202",
      country: "us",
      locality: "Denver",
      latitude: 39.7509685,
      longitude: -104.9968121,
    });
  });

  it("reports a missing locality as null rather than inventing one", async () => {
    // The real `96950` case: a US ZIP whose geocoder entry carries no locality
    // and whose coordinate sits ~500 km out to sea. The null locality is the
    // only cheap tell that the pin is junk, so it must survive to the caller.
    mockGeocoder([
      {
        display_name: "96950, United States",
        lat: "17.4362793",
        lon: "130.0391985",
        address: { country: "United States" },
      },
    ]);

    const result = await resolvePostalCode({
      code: "96950",
      country: "us",
      format: "us-zip",
    });

    expect(result).not.toBeNull();
    expect(result!.locality).toBeNull();
    expect(result!.displayName).toBe("96950, United States");
  });

  it("tolerates a result with no address object at all", async () => {
    mockGeocoder([
      { display_name: "80202, United States", lat: "39.75", lon: "-104.99" },
    ]);
    const result = await resolvePostalCode({
      code: "80202",
      country: "us",
      format: "us-zip",
    });
    expect(result!.locality).toBeNull();
  });

  it("returns null for an empty result set instead of a nearby guess", async () => {
    mockGeocoder([]);
    await expect(
      resolvePostalCode({ code: "99999", country: "us", format: "us-zip" }),
    ).resolves.toBeNull();
  });

  it("returns null rather than 0,0 when the coordinate is unparseable", async () => {
    // 0,0 is a real place in the Gulf of Guinea. A parse failure that became
    // `0` would silently relocate the cook there.
    mockGeocoder([
      { display_name: "junk", lat: "not-a-number", lon: "-104.99", address: {} },
    ]);
    await expect(
      resolvePostalCode({ code: "80202", country: "us", format: "us-zip" }),
    ).resolves.toBeNull();
  });

  it("publishes NO accuracy radius, because the geocoder cannot supply one", async () => {
    // The geocoder returns a bounding box with every postal result and it is
    // synthetic — measured identical (to 0.00006°) for a 2 km² and a 5,000 km²
    // code. Any radius derived from it would be a constant presented as a
    // measurement, so the resolution must expose no such field for a caller to
    // start trusting.
    mockGeocoder([
      {
        ...DENVER[0],
        boundingbox: ["39.7059174", "39.7960193", "-105.0551763", "-104.9384480"],
      },
    ]);

    const result = await resolvePostalCode({
      code: "80202",
      country: "us",
      format: "us-zip",
    });

    const keys = Object.keys(result!);
    expect(keys).not.toContain("radiusMeters");
    expect(keys).not.toContain("accuracyM");
    expect(keys).not.toContain("boundingBox");
    // The caveat carries what the radius would have claimed, in words.
    expect(POSTAL_CENTROID_CAVEAT).toMatch(/not your street address/);
  });

  it("throws on an upstream failure instead of returning a fabricated place", async () => {
    installFetchMock(
      jest.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );

    await expect(
      resolvePostalCode({ code: "80202", country: "us", format: "us-zip" }),
    ).rejects.toThrow(/503/);
  });
});
