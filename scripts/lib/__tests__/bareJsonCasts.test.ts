import {
  bareJsonCastsBaselineSchema,
  compareBareJsonCasts,
  isBareJsonCast,
  scanBareJsonCastsInSource,
  updateBareJsonCastsBaseline,
  type BareJsonCastsBaseline,
  type BareJsonCastsSummary,
} from "../bareJsonCasts";
import ts from "typescript";

describe("bareJsonCasts gate", () => {
  describe("isBareJsonCast", () => {
    function parseNode(code: string): ts.Node {
      const sf = ts.createSourceFile("test.ts", code, ts.ScriptTarget.Latest, true);
      let found: ts.Node | undefined;
      function visit(node: ts.Node) {
        if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
          found = node;
          return;
        }
        ts.forEachChild(node, visit);
      }
      visit(sf);
      if (!found) throw new Error(`No assertion found in: ${code}`);
      return found;
    }

    it("detects res.json() as T", () => {
      const node = parseNode("const x = res.json() as Promise<Data>;");
      expect(isBareJsonCast(node)).toBe(true);
    });

    it("detects (await res.json()) as T", () => {
      const node = parseNode("const x = (await res.json()) as Data;");
      expect(isBareJsonCast(node)).toBe(true);
    });

    it("detects <Data>(await res.json())", () => {
      const node = parseNode("const x = <Data>(await res.json());");
      expect(isBareJsonCast(node)).toBe(true);
    });

    it("does not flag non-json assertions", () => {
      const node = parseNode("const x = obj as Data;");
      expect(isBareJsonCast(node)).toBe(false);
    });
  });

  describe("compareBareJsonCasts", () => {
    const base: BareJsonCastsBaseline = {
      total: 220,
      production: 211,
      test: 9,
      byFile: { "src/a.ts": 2, "src/b.ts": 1 },
    };

    it("passes when counts match baseline", () => {
      const current: BareJsonCastsSummary = {
        total: 220,
        production: 211,
        test: 9,
        sites: [],
        byFile: { "src/a.ts": 2, "src/b.ts": 1 },
      };
      const cmp = compareBareJsonCasts(current, base);
      expect(cmp.exceedsBaseline).toBe(false);
      expect(cmp.totalIncreasedBy).toBe(0);
      expect(cmp.productionIncreasedBy).toBe(0);
      expect(cmp.regressedFiles).toEqual([]);
    });

    it("passes when counts decrease", () => {
      const current: BareJsonCastsSummary = {
        total: 210,
        production: 201,
        test: 9,
        sites: [],
        byFile: { "src/a.ts": 1, "src/b.ts": 1 },
      };
      const cmp = compareBareJsonCasts(current, base);
      expect(cmp.exceedsBaseline).toBe(false);
    });

    it("fails when production count increases", () => {
      const current: BareJsonCastsSummary = {
        total: 222,
        production: 213,
        test: 9,
        sites: [],
        byFile: { "src/a.ts": 4, "src/b.ts": 1 },
      };
      const cmp = compareBareJsonCasts(current, base);
      expect(cmp.exceedsBaseline).toBe(true);
      expect(cmp.productionIncreasedBy).toBe(2);
      expect(cmp.regressedFiles).toEqual([
        { file: "src/a.ts", current: 4, baseline: 2 },
      ]);
    });
  });

  describe("updateBareJsonCastsBaseline", () => {
    it("ratchets production and total down while sorting files", () => {
      const base: BareJsonCastsBaseline = {
        total: 220,
        production: 211,
        test: 9,
        byFile: { "src/b.ts": 2, "src/a.ts": 1 },
      };
      const current: BareJsonCastsSummary = {
        total: 200,
        production: 195,
        test: 5,
        sites: [],
        byFile: { "src/b.ts": 1, "src/a.ts": 1 },
      };
      const updated = updateBareJsonCastsBaseline(current, base);
      expect(updated).toEqual({
        total: 200,
        production: 195,
        test: 5,
        byFile: { "src/a.ts": 1, "src/b.ts": 1 },
      });
    });
  });
});
