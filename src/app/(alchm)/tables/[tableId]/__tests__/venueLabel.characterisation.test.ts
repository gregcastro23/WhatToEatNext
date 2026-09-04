import {
  resolveVenueLabel,
  resolveErrorMessage,
} from "../helpers";

describe("tables/[tableId] characterisation", () => {
  describe("resolveVenueLabel", () => {
    it("returns named restaurant venue", () => {
      expect(
        resolveVenueLabel({ type: "restaurant", name: "Le Bernardin" }),
      ).toBe("Le Bernardin");
    });

    it("falls back to 'A restaurant' when restaurant name is empty or missing", () => {
      expect(resolveVenueLabel({ type: "restaurant", name: "" })).toBe(
        "A restaurant",
      );
      expect(resolveVenueLabel({ type: "restaurant", name: null })).toBe(
        "A restaurant",
      );
    });

    it("returns named home venue", () => {
      expect(resolveVenueLabel({ type: "home", name: "Castro's Loft" })).toBe(
        "Castro's Loft",
      );
    });

    it("falls back to 'Home' when home name is empty or missing", () => {
      expect(resolveVenueLabel({ type: "home", name: "" })).toBe("Home");
      expect(resolveVenueLabel({ type: "home", name: null })).toBe("Home");
    });

    it("returns named custom/other venue", () => {
      expect(resolveVenueLabel({ type: "park", name: "Central Park" })).toBe(
        "Central Park",
      );
    });

    it("falls back to 'Elsewhere' for other venues with empty name", () => {
      expect(resolveVenueLabel({ type: "park", name: "" })).toBe("Elsewhere");
      expect(resolveVenueLabel({ type: "park", name: null })).toBe("Elsewhere");
    });
  });

  describe("resolveErrorMessage", () => {
    it("returns circle message when statusCode is 403", () => {
      expect(resolveErrorMessage(403, "Not found")).toBe(
        "This table is set for its own circle.",
      );
    });

    it("returns custom error string when provided and not 403", () => {
      expect(resolveErrorMessage(500, "Database timeout")).toBe(
        "Database timeout",
      );
    });

    it("falls back to default message when error is empty or null", () => {
      expect(resolveErrorMessage(404, "")).toBe(
        "This table could not be found.",
      );
      expect(resolveErrorMessage(404, null)).toBe(
        "This table could not be found.",
      );
    });
  });
});
