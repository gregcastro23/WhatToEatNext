import {
  ServerProfileResponseSchema,
  ServerProfileDataSchema,
  toDomainUserProfile,
} from "../userProfileResponseSchemas";

describe("userProfile producer-to-consumer round-trip coverage", () => {
  const honoProducerPayload = {
    success: true,
    profile: {
      userId: "usr_celestial_01",
      name: "Greg Castro",
      email: "greg@alchm.kitchen",
      onboardingComplete: true,
      preferences: {
        theme: "dark",
        notificationsEnabled: true,
      },
      dietaryPreferences: {
        allergies: ["peanuts"],
        excludedCuisines: [],
      },
      birthData: {
        dateTime: "1991-06-23T14:24:00.000Z",
        utcInstant: "1991-06-23T18:24:00.000Z",
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
        timezoneBasis: "DERIVED_FROM_COORDINATES",
      },
      natalChart: {
        ascendant: "Scorpio",
        dominantElement: "Water",
        dominantModality: "Fixed",
        planets: [
          { name: "Sun", sign: "Cancer", position: 91.5 },
          { name: "Moon", sign: "Scorpio", position: 215.2 },
        ],
        planetaryPositions: {
          Sun: "Cancer",
          Moon: "Scorpio",
        },
      },
      groupMembers: [],
      diningGroups: [],
      savedCharts: [
        {
          id: "chart_secondary_01",
          label: "Hermetic Solstice",
          chartType: "manual",
          isPrimary: false,
        },
      ],
      tokenEconomy: {
        balances: {
          spirit: 120,
          essence: 45,
          matter: 80,
          substance: 15,
        },
        isPremium: true,
        streakCount: 14,
        lastDailyClaimAt: "2026-09-21T12:00:00.000Z",
      },
      stats: {
        heat: 42,
        entropy: 33,
      },
    },
  };

  const directDbRowProducerPayload = {
    id: "usr_db_direct_99",
    name: "Alchemist Direct",
    email: "direct@alchm.kitchen",
    onboardingComplete: true,
    preferences: {
      spiceTolerance: "hot",
    },
    birthData: {
      dateTime: "1988-11-04T08:15:00.000Z",
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: "America/Los_Angeles",
    },
    natalChart: {
      ascendant: "Sagittarius",
      dominantElement: "Fire",
      dominantModality: "Mutable",
      planets: [
        { name: "Sun", sign: "Scorpio", position: 222.0 },
        { name: "Mars", sign: "Aries", position: 15.4 },
      ],
    },
  };

  it("round-trips full Hono API response through ServerProfileResponseSchema and toDomainUserProfile", () => {
    const parsed = ServerProfileResponseSchema.parse(honoProducerPayload);
    expect(parsed.success).toBe(true);
    expect(parsed.profile).toBeDefined();

    if (!parsed.profile) throw new Error("Expected profile to be defined");
    const domain = toDomainUserProfile(parsed.profile);
    expect(domain.userId).toBe("usr_celestial_01");
    expect(domain.name).toBe("Greg Castro");
    expect(domain.email).toBe("greg@alchm.kitchen");
    expect(domain.onboardingComplete).toBe(true);
    expect(domain.birthData?.dateTime).toBe("1991-06-23T14:24:00.000Z");
    expect(domain.natalChart?.dominantElement).toBe("Water");
    expect(domain.tokenEconomy?.balances.spirit).toBe(120);
    expect(domain.savedCharts?.[0]?.label).toBe("Hermetic Solstice");
  });

  it("round-trips direct database row payload through ServerProfileDataSchema and toDomainUserProfile", () => {
    const parsed = ServerProfileDataSchema.parse(directDbRowProducerPayload);
    const domain = toDomainUserProfile(parsed, "fallback-user-id");

    expect(domain.userId).toBe("usr_db_direct_99");
    expect(domain.name).toBe("Alchemist Direct");
    expect(domain.email).toBe("direct@alchm.kitchen");
    expect(domain.birthData?.latitude).toBe(37.7749);
    expect(domain.natalChart?.dominantElement).toBe("Fire");
  });

  it("falls back to fallbackUserId when producer payload omits userId and id", () => {
    const minimalPayload = {
      name: "Anonymous Traveler",
    };
    const parsed = ServerProfileDataSchema.parse(minimalPayload);
    const domain = toDomainUserProfile(parsed, "fallback_session_user");

    expect(domain.userId).toBe("fallback_session_user");
    expect(domain.name).toBe("Anonymous Traveler");
  });

  it("resiliently drops corrupted nested shapes without throwing", () => {
    const corruptedPayload = {
      userId: "usr_corrupted",
      birthData: "not a birth data object", // invalid
      natalChart: 12345, // invalid
      groupMembers: "not an array", // invalid
      savedCharts: "not an array", // invalid
    };

    const parsed = ServerProfileDataSchema.parse(corruptedPayload);
    const domain = toDomainUserProfile(parsed);

    expect(domain.userId).toBe("usr_corrupted");
    expect(domain.birthData).toBeUndefined();
    expect(domain.natalChart).toBeUndefined();
    expect(domain.groupMembers).toEqual([]);
    expect(domain.savedCharts).toEqual([]);
  });
});
