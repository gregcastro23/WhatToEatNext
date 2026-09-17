import {
  PRICED_BODIES,
  ZODIAC_SIGNS,
  backendPlanetPositionSchema,
  backendPlanetaryPositionsResponseSchema,
  calculatePlanetaryPositionsBackend,
  calculatePlanetaryPositionsWithMeta,
} from "../serverPlanetaryCalculations";

const VALID_GOLDEN_BACKEND_PAYLOAD = {
  birth_info: {
    year: 2026,
    month: 9,
    date: 17,
    hour: 17,
    minute: 45,
  },
  planetary_positions: {
    Sun: {
      sign: "virgo",
      degree: 24,
      minute: 51,
      exactLongitude: 174.857328677447,
      isRetrograde: false,
    },
    Moon: {
      sign: "sagittarius",
      degree: 12,
      minute: 34,
      exactLongitude: 252.57051158650566,
      isRetrograde: false,
    },
    Mercury: {
      sign: "libra",
      degree: 11,
      minute: 28,
      exactLongitude: 191.4829078214909,
      isRetrograde: false,
    },
    Venus: {
      sign: "scorpio",
      degree: 4,
      minute: 18,
      exactLongitude: 214.30571159732622,
      isRetrograde: false,
    },
    Mars: {
      sign: "cancer",
      degree: 23,
      minute: 47,
      exactLongitude: 113.79426346782628,
      isRetrograde: false,
    },
    Jupiter: {
      sign: "leo",
      degree: 17,
      minute: 6,
      exactLongitude: 137.10373838914455,
      isRetrograde: false,
    },
    Saturn: {
      sign: "aries",
      degree: 12,
      minute: 35,
      exactLongitude: 12.58788025255397,
      isRetrograde: true,
    },
    Uranus: {
      sign: "gemini",
      degree: 5,
      minute: 40,
      exactLongitude: 65.67641365444423,
      isRetrograde: true,
    },
    Neptune: {
      sign: "aries",
      degree: 3,
      minute: 13,
      exactLongitude: 3.228558158719206,
      isRetrograde: true,
    },
    Pluto: {
      sign: "aquarius",
      degree: 3,
      minute: 15,
      exactLongitude: 303.2524263526133,
      isRetrograde: true,
    },
    "North Node": {
      sign: "aquarius",
      degree: 28,
      minute: 25,
      exactLongitude: 328.41747511364724,
      isRetrograde: true,
    },
    "South Node": {
      sign: "leo",
      degree: 28,
      minute: 25,
      exactLongitude: 148.41747511364724,
      isRetrograde: true,
    },
    Ascendant: {
      sign: "capricorn",
      degree: 24,
      minute: 16,
      exactLongitude: 294.27569846701607,
      isRetrograde: false,
    },
    MC: {
      sign: "libra",
      degree: 28,
      minute: 10,
      exactLongitude: 208.1811638160915,
      isRetrograde: false,
    },
  },
  metadata: {
    source: "pyswisseph",
    precision: "NASA JPL DE (sub-arcsecond)",
    zodiacSystem: "tropical",
    timestamp: "2026-09-17T17:56:16.328304",
    calculatedAt: "2026-09-17T17:45:00",
  },
};

describe("Ephemeris Boundary Zod Schema", () => {
  describe("PRICED_BODIES and ZODIAC_SIGNS constants", () => {
    it("contains exactly the 10 canonical priced planets", () => {
      expect([...PRICED_BODIES]).toEqual([
        "Sun",
        "Moon",
        "Mercury",
        "Venus",
        "Mars",
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune",
        "Pluto",
      ]);
    });

    it("defines the 12 standard lowercase zodiac signs", () => {
      expect(ZODIAC_SIGNS).toHaveLength(12);
      expect(ZODIAC_SIGNS).toContain("aries");
      expect(ZODIAC_SIGNS).toContain("pisces");
    });
  });

  describe("backendPlanetPositionSchema", () => {
    it("accepts a valid planet position", () => {
      const valid = {
        sign: "cancer",
        degree: 27,
        minute: 48,
        exactLongitude: 117.8035,
        isRetrograde: false,
      };
      const result = backendPlanetPositionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects uppercase signs (must be lowercase ZodiacSignType)", () => {
      const invalid = {
        sign: "Cancer",
        degree: 27,
        exactLongitude: 117.8,
        isRetrograde: false,
      };
      const result = backendPlanetPositionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toEqual(["sign"]);
      }
    });

    it("rejects non-existent zodiac signs", () => {
      const invalid = {
        sign: "ophiuchus",
        degree: 15,
        exactLongitude: 240,
        isRetrograde: false,
      };
      const result = backendPlanetPositionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects out-of-bounds degrees (< 0 or > 30)", () => {
      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: -1,
          exactLongitude: 10,
          isRetrograde: false,
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 31,
          exactLongitude: 10,
          isRetrograde: false,
        }).success,
      ).toBe(false);
    });

    it("rejects out-of-bounds exactLongitude (< 0 or >= 360)", () => {
      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 0,
          exactLongitude: -0.01,
          isRetrograde: false,
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "pisces",
          degree: 29,
          exactLongitude: 360,
          isRetrograde: false,
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "pisces",
          degree: 29,
          exactLongitude: 360.5,
          isRetrograde: false,
        }).success,
      ).toBe(false);
    });

    it("rejects non-finite longitudes (NaN, Infinity)", () => {
      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 10,
          exactLongitude: Number.NaN,
          isRetrograde: false,
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 10,
          exactLongitude: Number.POSITIVE_INFINITY,
          isRetrograde: false,
        }).success,
      ).toBe(false);
    });

    it("strictly requires boolean isRetrograde without coercion", () => {
      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 10,
          exactLongitude: 10,
          isRetrograde: "false",
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 10,
          exactLongitude: 10,
          isRetrograde: 0,
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 10,
          exactLongitude: 10,
        }).success,
      ).toBe(false);
    });

    it("strictly rejects string-encoded numbers (no z.coerce)", () => {
      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: "10",
          exactLongitude: 10,
          isRetrograde: false,
        }).success,
      ).toBe(false);

      expect(
        backendPlanetPositionSchema.safeParse({
          sign: "aries",
          degree: 10,
          exactLongitude: "10.5",
          isRetrograde: false,
        }).success,
      ).toBe(false);
    });
  });

  describe("backendPlanetaryPositionsResponseSchema", () => {
    it("validates the golden Railway backend payload", () => {
      const result = backendPlanetaryPositionsResponseSchema.safeParse(
        VALID_GOLDEN_BACKEND_PAYLOAD,
      );
      expect(result.success).toBe(true);
    });

    it("rejects when any of the 10 PRICED_BODIES is missing", () => {
      for (const body of PRICED_BODIES) {
        const payload = JSON.parse(JSON.stringify(VALID_GOLDEN_BACKEND_PAYLOAD));
        delete payload.planetary_positions[body];

        const result = backendPlanetaryPositionsResponseSchema.safeParse(payload);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toMatch(
            /Missing required priced celestial bodies/,
          );
        }
      }
    });

    it("accepts responses that lack optional non-priced bodies (e.g. Ascendant)", () => {
      const minimalPayload = {
        planetary_positions: Object.fromEntries(
          PRICED_BODIES.map((body) => [
            body,
            VALID_GOLDEN_BACKEND_PAYLOAD.planetary_positions[body],
          ]),
        ),
      };
      const result =
        backendPlanetaryPositionsResponseSchema.safeParse(minimalPayload);
      expect(result.success).toBe(true);
    });
  });
});

describe("calculatePlanetaryPositionsBackend", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("successfully parses and normalizes a valid Railway response", async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.endsWith("/health")) {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(VALID_GOLDEN_BACKEND_PAYLOAD),
      });
    });

    const positions = await calculatePlanetaryPositionsBackend(
      new Date("2026-07-20T12:00:00Z"),
    );

    expect(positions).not.toBeNull();
    expect(positions?.Sun?.sign).toBe("virgo");
    expect(positions?.Sun?.degree).toBe(24);
    expect(positions?.Sun?.minute).toBe(51);
    expect(positions?.Sun?.exactLongitude).toBeCloseTo(174.8573);
    expect(positions?.Sun?.isRetrograde).toBe(false);
    expect(positions?.Saturn?.isRetrograde).toBe(true);
    // Extra bodies like Ascendant and MC should still be preserved
    expect(positions?.Ascendant?.sign).toBe("capricorn");
    expect(positions?.MC?.sign).toBe("libra");
  });

  it("logs backend-schema-invalid and returns null on corrupt response (missing body)", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const corruptPayload = JSON.parse(
      JSON.stringify(VALID_GOLDEN_BACKEND_PAYLOAD),
    );
    delete corruptPayload.planetary_positions.Pluto;

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.endsWith("/health")) {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(corruptPayload),
      });
    });

    const positions = await calculatePlanetaryPositionsBackend(
      new Date("2026-07-20T12:00:00Z"),
    );

    expect(positions).toBeNull();

    // Verify structured logging
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("backend-schema-invalid:"),
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: "planetary_positions",
            message: expect.stringMatching(
              /Missing required priced celestial bodies/,
            ),
          }),
        ]),
      }),
    );
  });

  it("logs backend-schema-invalid and returns null on corrupt coordinate (out-of-range degree)", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const corruptPayload = JSON.parse(
      JSON.stringify(VALID_GOLDEN_BACKEND_PAYLOAD),
    );
    corruptPayload.planetary_positions.Mars.degree = 45; // Invalid: > 30

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.endsWith("/health")) {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(corruptPayload),
      });
    });

    const positions = await calculatePlanetaryPositionsBackend(
      new Date("2026-07-20T12:00:00Z"),
    );

    expect(positions).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("backend-schema-invalid:"),
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: "planetary_positions.Mars.degree",
          }),
        ]),
      }),
    );
  });

  it("falls back to astronomy-engine and signals backend-schema-invalid when backend schema fails validation", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});

    const corruptPayload = JSON.parse(
      JSON.stringify(VALID_GOLDEN_BACKEND_PAYLOAD),
    );
    delete corruptPayload.planetary_positions.Saturn;

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.endsWith("/health")) {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(corruptPayload),
      });
    });

    const meta = await calculatePlanetaryPositionsWithMeta(
      new Date("2026-07-20T12:00:00Z"),
    );

    expect(meta.source).toBe("astronomy-engine");
    expect(meta.positions.Saturn).toBeDefined();
    expect(meta.positions.Saturn.sign).toBeDefined();
    expect(meta.degraded?.reasons).toContain("backend-schema-invalid");
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("backend-schema-invalid:"),
      expect.any(Object),
    );
  });
});
