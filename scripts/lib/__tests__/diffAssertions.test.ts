import {
  checkFileAssertionDiff,
  resolveBaseRef,
} from "../diffAssertions";

describe("diffAssertions", () => {
  describe("checkFileAssertionDiff", () => {
    it("reports 0 added assertions when current matches base", () => {
      const baseCode = "const a = 1;\nconst b = (x as Foo);";
      const currentCode = "const a = 1;\nconst b = (x as Foo);";
      const diff = checkFileAssertionDiff("src/test.ts", baseCode, currentCode);

      expect(diff.baseCount).toBe(1);
      expect(diff.currentCount).toBe(1);
      expect(diff.addedAssertions).toBe(0);
    });

    it("detects new 'as Type' assertion added to existing file", () => {
      const baseCode = "const a = 1;";
      const currentCode = "const a = 1;\nconst b = (x as Foo);";
      const diff = checkFileAssertionDiff("src/test.ts", baseCode, currentCode);

      expect(diff.baseCount).toBe(0);
      expect(diff.currentCount).toBe(1);
      expect(diff.addedAssertions).toBe(1);
    });

    it("detects new chained 'as unknown as Type' assertion", () => {
      const baseCode = "const a = 1;";
      const currentCode = "const a = 1;\nconst b = (x as unknown as Bar);";
      const diff = checkFileAssertionDiff("src/test.ts", baseCode, currentCode);

      expect(diff.baseCount).toBe(0);
      expect(diff.currentCount).toBe(1);
      expect(diff.addedAssertions).toBe(1);
    });

    it("does not flag 'as const' additions", () => {
      const baseCode = "const a = 1;";
      const currentCode = "const a = 1;\nconst b = [1, 2, 3] as const;";
      const diff = checkFileAssertionDiff("src/test.ts", baseCode, currentCode);

      expect(diff.baseCount).toBe(0);
      expect(diff.currentCount).toBe(0);
      expect(diff.addedAssertions).toBe(0);
    });

    it("reports 0 added assertions when assertions are deleted", () => {
      const baseCode = "const a = (x as Foo);\nconst b = (y as Bar);";
      const currentCode = "const a = (x as Foo);";
      const diff = checkFileAssertionDiff("src/test.ts", baseCode, currentCode);

      expect(diff.baseCount).toBe(2);
      expect(diff.currentCount).toBe(1);
      expect(diff.addedAssertions).toBe(0);
    });

    it("handles brand-new files (baseContent is null)", () => {
      const currentCode = "export const x = 42;\nexport const y = (z as string);";
      const diff = checkFileAssertionDiff("src/newFile.ts", null, currentCode);

      expect(diff.baseCount).toBe(0);
      expect(diff.currentCount).toBe(1);
      expect(diff.addedAssertions).toBe(1);
    });

    it("handles brand-new files with 0 assertions", () => {
      const currentCode = "export const x = 42;\nexport const y = [1, 2] as const;";
      const diff = checkFileAssertionDiff("src/newFile.ts", null, currentCode);

      expect(diff.baseCount).toBe(0);
      expect(diff.currentCount).toBe(0);
      expect(diff.addedAssertions).toBe(0);
    });
  });

  describe("resolveBaseRef", () => {
    it("returns explicit ref when provided", () => {
      expect(resolveBaseRef("HEAD~1")).toBe("HEAD~1");
    });

    it("resolves a fallback string (origin/master, master, or HEAD)", () => {
      const resolved = resolveBaseRef();
      expect(["origin/master", "master", "HEAD"]).toContain(resolved);
    });
  });
});
