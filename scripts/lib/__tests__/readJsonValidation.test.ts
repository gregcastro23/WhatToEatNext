import {
  compareReadJsonValidation,
  inspectReadJsonContent,
  readJsonBaselineSchema,
  updateReadJsonBaseline,
  type ReadJsonBaseline,
  type ReadJsonValidationSummary,
} from "../readJsonValidation";

describe("readJsonValidation gate", () => {
  describe("inspectReadJsonContent", () => {
    it("detects and validates calls using direct parser function", () => {
      const code = `
        import { readJson } from "@/lib/api/json";
        const parse = (v: unknown) => v;
        export async function getData(res: Response) {
          return await readJson(res, parse);
        }
      `;
      const sites = inspectReadJsonContent(code, "src/services/foo.ts");
      expect(sites).toHaveLength(1);
      expect(sites[0].isValidated).toBe(true);
      expect(sites[0].helper).toBe("readJson");
    });

    it("detects and validates calls using { parse: Schema.parse }", () => {
      const code = `
        import { readJson, safeReadJson } from "@/lib/api/json";
        import { MySchema } from "@/lib/validation";
        export async function getData(res: Response) {
          const a = await readJson(res, { parse: MySchema.parse });
          const b = await safeReadJson(res, null, { parse: (x) => MySchema.parse(x) });
          return { a, b };
        }
      `;
      const sites = inspectReadJsonContent(code, "src/services/foo.ts");
      expect(sites).toHaveLength(2);
      expect(sites[0].isValidated).toBe(true);
      expect(sites[1].isValidated).toBe(true);
    });

    it("tracks aliased imports (e.g. readJson as rj)", () => {
      const code = `
        import { readJson as rj } from "@/lib/api/json";
        export async function getData(res: Response) {
          return await rj(res);
        }
      `;
      const sites = inspectReadJsonContent(code, "src/services/foo.ts");
      expect(sites).toHaveLength(1);
      expect(sites[0].helper).toBe("readJson");
      expect(sites[0].isValidated).toBe(false);
    });

    it("fails bare generic calls without options: readJson<T>(res)", () => {
      const code = `
        import { readJson } from "@/lib/api/json";
        export async function getData(res: Response) {
          return await readJson<MyType>(res);
        }
      `;
      const sites = inspectReadJsonContent(code, "src/services/foo.ts");
      expect(sites).toHaveLength(1);
      expect(sites[0].isValidated).toBe(false);
    });

    it("fails when { parse: undefined } is passed", () => {
      const code = `
        import { readJson } from "@/lib/api/json";
        export async function getData(res: Response) {
          return await readJson(res, { parse: undefined });
        }
      `;
      const sites = inspectReadJsonContent(code, "src/services/foo.ts");
      expect(sites).toHaveLength(1);
      expect(sites[0].isValidated).toBe(false);
    });

    it("ignores locally declared readJson or fetchJson not imported from @/lib/api/json", () => {
      const code = `
        async function fetchJson<T>(url: string): Promise<T> {
          const res = await fetch(url);
          return await res.json();
        }
        export async function run() {
          return await fetchJson("/api/test");
        }
      `;
      const sites = inspectReadJsonContent(code, "src/lib/custom.ts");
      expect(sites).toHaveLength(0);
    });

    it("reports multiple calls in one file with distinct locations and validity", () => {
      const code = `
        import { readJson, safeReadJson } from "@/lib/api/json";
        import { Schema } from "@/lib/validation";
        export async function multi(res1: Response, res2: Response) {
          const valid = await readJson(res1, { parse: Schema.parse });
          const unvalidated = await safeReadJson(res2, null);
          return { valid, unvalidated };
        }
      `;
      const sites = inspectReadJsonContent(code, "src/services/multi.ts");
      expect(sites).toHaveLength(2);
      expect(sites[0].isValidated).toBe(true);
      expect(sites[1].isValidated).toBe(false);
      expect(sites[0].line).not.toBe(sites[1].line);
    });
  });

  describe("compareReadJsonValidation", () => {
    const baseline: ReadJsonBaseline = {
      totalUnvalidated: 2,
      totalCalls: 10,
      allowlist: [
        { file: "src/services/a.ts", line: 10, column: 5, helper: "readJson" },
        { file: "src/services/b.ts", line: 20, column: 5, helper: "safeReadJson" },
      ],
    };

    it("passes when unvalidated sites match baseline allowlist", () => {
      const summary: ReadJsonValidationSummary = {
        totalFilesScanned: 50,
        totalCalls: 10,
        validatedSites: [],
        unvalidatedSites: [
          { file: "src/services/a.ts", line: 10, column: 5, helper: "readJson", isValidated: false },
          { file: "src/services/b.ts", line: 20, column: 5, helper: "safeReadJson", isValidated: false },
        ],
      };
      const result = compareReadJsonValidation(summary, baseline);
      expect(result.exceedsBaseline).toBe(false);
      expect(result.allowlistViolations).toHaveLength(0);
    });

    it("passes when unvalidated site count decreases", () => {
      const summary: ReadJsonValidationSummary = {
        totalFilesScanned: 50,
        totalCalls: 10,
        validatedSites: [
          { file: "src/services/b.ts", line: 20, column: 5, helper: "safeReadJson", isValidated: true },
        ],
        unvalidatedSites: [
          { file: "src/services/a.ts", line: 10, column: 5, helper: "readJson", isValidated: false },
        ],
      };
      const result = compareReadJsonValidation(summary, baseline);
      expect(result.exceedsBaseline).toBe(false);
    });

    it("fails when an unallowlisted site is unvalidated (RED PROOF)", () => {
      const summary: ReadJsonValidationSummary = {
        totalFilesScanned: 50,
        totalCalls: 10,
        validatedSites: [],
        unvalidatedSites: [
          { file: "src/services/a.ts", line: 10, column: 5, helper: "readJson", isValidated: false },
          { file: "src/services/c.ts", line: 30, column: 5, helper: "readJson", isValidated: false },
        ],
      };
      const result = compareReadJsonValidation(summary, baseline);
      expect(result.exceedsBaseline).toBe(true);
      expect(result.allowlistViolations).toHaveLength(1);
      expect(result.allowlistViolations[0].file).toBe("src/services/c.ts");
    });
  });

  describe("updateReadJsonBaseline", () => {
    it("ratchets down baseline and sorts allowlist", () => {
      const baseline: ReadJsonBaseline = {
        totalUnvalidated: 2,
        totalCalls: 10,
        allowlist: [
          { file: "src/services/b.ts", line: 20, column: 5, helper: "safeReadJson" },
          { file: "src/services/a.ts", line: 10, column: 5, helper: "readJson" },
        ],
      };
      const summary: ReadJsonValidationSummary = {
        totalFilesScanned: 50,
        totalCalls: 10,
        validatedSites: [
          { file: "src/services/b.ts", line: 20, column: 5, helper: "safeReadJson", isValidated: true },
        ],
        unvalidatedSites: [
          { file: "src/services/a.ts", line: 10, column: 5, helper: "readJson", isValidated: false },
        ],
      };
      const updated = updateReadJsonBaseline(summary, baseline);
      expect(updated.totalUnvalidated).toBe(1);
      expect(updated.allowlist).toHaveLength(1);
      expect(updated.allowlist[0].file).toBe("src/services/a.ts");
      expect(readJsonBaselineSchema.safeParse(updated).success).toBe(true);
    });
  });
});
