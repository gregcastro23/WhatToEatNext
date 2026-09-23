import { isMissingRelation, isPgEnumMismatch } from "../pgErrors";

describe("pgErrors", () => {
  describe("isMissingRelation", () => {
    it("returns true for 42P01 code", () => {
      expect(isMissingRelation({ code: "42P01" })).toBe(true);
    });

    it("returns false for other codes or non-objects", () => {
      expect(isMissingRelation({ code: "22P02" })).toBe(false);
      expect(isMissingRelation(null)).toBe(false);
      expect(isMissingRelation(undefined)).toBe(false);
      expect(isMissingRelation("42P01")).toBe(false);
    });
  });

  describe("isPgEnumMismatch", () => {
    it("returns true for 22P02 with enum in message", () => {
      const err = {
        code: "22P02",
        message: 'invalid input value for enum notification_type: "agent_broadcast"',
      };
      expect(isPgEnumMismatch(err)).toBe(true);
    });

    it("returns false for 22P02 with uuid syntax error in message", () => {
      const err = {
        code: "22P02",
        message: 'invalid input syntax for type uuid: "notif_123456_abc"',
      };
      expect(isPgEnumMismatch(err)).toBe(false);
    });

    it("returns false for 22P02 with boolean or integer syntax error in message", () => {
      const err = {
        code: "22P02",
        message: 'invalid input syntax for type boolean: "1756-01-27"',
      };
      expect(isPgEnumMismatch(err)).toBe(false);
    });

    it("falls back to true for 22P02 without message", () => {
      expect(isPgEnumMismatch({ code: "22P02" })).toBe(true);
    });

    it("returns false for non-22P02 errors", () => {
      expect(isPgEnumMismatch({ code: "23503" })).toBe(false);
      expect(isPgEnumMismatch(null)).toBe(false);
    });
  });
});
