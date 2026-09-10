import {
  compareRouteValidation,
  inspectRouteFileContent,
  routeValidationBaselineSchema,
  updateRouteValidationBaseline,
  type RouteValidationBaseline,
  type RouteValidationSummary,
} from "../routeValidation";

describe("routeValidation gate", () => {
  describe("inspectRouteFileContent", () => {
    it("detects request.json() and safeParse()", () => {
      const code = `
        import { MySchema } from "@/lib/validation";
        export async function POST(request: Request) {
          const body = await request.json();
          const parsed = MySchema.safeParse(body);
          return Response.json({ ok: true });
        }
      `;
      const result = inspectRouteFileContent(code, "src/app/api/foo/route.ts");
      expect(result.readsBody).toBe(true);
      expect(result.hasSafeParse).toBe(true);
    });

    it("detects req.formData() without safeParse()", () => {
      const code = `
        export async function POST(req: Request) {
          const form = await req.formData();
          return Response.json({ form });
        }
      `;
      const result = inspectRouteFileContent(code, "src/app/api/upload/route.ts");
      expect(result.readsBody).toBe(true);
      expect(result.hasSafeParse).toBe(false);
    });

    it("does NOT treat Response.json() or comments as reading request body", () => {
      const code = `
        // In this handler we do not call r.json()
        export async function GET() {
          return Response.json({ status: "healthy" });
        }
      `;
      const result = inspectRouteFileContent(code, "src/app/api/health/route.ts");
      expect(result.readsBody).toBe(false);
      expect(result.hasSafeParse).toBe(false);
    });

    it("red-proof: flags route as UNVALIDATED if body is read but safeParse only inspects query params", () => {
      const code = `
        import { QuerySchema } from "@/lib/validation";
        export async function POST(req: Request) {
          const body = await req.json();
          const query = QuerySchema.safeParse({ search: "test" });
          return Response.json({ body, query });
        }
      `;
      const result = inspectRouteFileContent(code, "src/app/api/unrelated/route.ts");
      expect(result.readsBody).toBe(true);
      expect(result.hasSafeParse).toBe(false);
    });

    it("detects body read and safeParse with non-standard parameter name (e.g. c: Request)", () => {
      const code = `
        import { MySchema } from "@/lib/validation";
        export async function POST(c: Request) {
          const payload = await c.json();
          const parsed = MySchema.safeParse(payload);
          return Response.json(parsed);
        }
      `;
      const result = inspectRouteFileContent(code, "src/app/api/custom-param/route.ts");
      expect(result.readsBody).toBe(true);
      expect(result.hasSafeParse).toBe(true);
    });

    it("detects validated formData extraction", () => {
      const code = `
        import { FormSchema } from "@/lib/validation";
        export async function POST(req: Request) {
          const formData = await req.formData();
          const parsed = FormSchema.safeParse(formData);
          return Response.json(parsed);
        }
      `;
      const result = inspectRouteFileContent(code, "src/app/api/form-valid/route.ts");
      expect(result.readsBody).toBe(true);
      expect(result.hasSafeParse).toBe(true);
    });
  });

  describe("compareRouteValidation", () => {
    const baseline: RouteValidationBaseline = {
      totalUnvalidated: 2,
      totalBodyReading: 10,
      allowlist: ["src/app/api/a/route.ts", "src/app/api/b/route.ts"],
    };

    it("passes when summary matches baseline exactly", () => {
      const summary: RouteValidationSummary = {
        totalRoutes: 20,
        totalBodyReading: 10,
        validated: ["src/app/api/c/route.ts"],
        unvalidated: ["src/app/api/a/route.ts", "src/app/api/b/route.ts"],
      };
      const cmp = compareRouteValidation(summary, baseline);
      expect(cmp.exceedsBaseline).toBe(false);
      expect(cmp.allowlistViolations).toEqual([]);
      expect(cmp.totalIncreasedBy).toBe(0);
    });

    it("passes when unvalidated count decreases (ratchet candidate)", () => {
      const summary: RouteValidationSummary = {
        totalRoutes: 20,
        totalBodyReading: 10,
        validated: ["src/app/api/b/route.ts", "src/app/api/c/route.ts"],
        unvalidated: ["src/app/api/a/route.ts"],
      };
      const cmp = compareRouteValidation(summary, baseline);
      expect(cmp.exceedsBaseline).toBe(false);
      expect(cmp.allowlistViolations).toEqual([]);
      expect(cmp.totalIncreasedBy).toBe(0);
    });

    it("fails when an unallowlisted route lacks safeParse (RED PROOF)", () => {
      const summary: RouteValidationSummary = {
        totalRoutes: 20,
        totalBodyReading: 10,
        validated: [],
        unvalidated: ["src/app/api/a/route.ts", "src/app/api/new-rogue/route.ts"],
      };
      const cmp = compareRouteValidation(summary, baseline);
      expect(cmp.exceedsBaseline).toBe(true);
      expect(cmp.allowlistViolations).toEqual(["src/app/api/new-rogue/route.ts"]);
    });

    it("fails when total unvalidated count increases", () => {
      const summary: RouteValidationSummary = {
        totalRoutes: 20,
        totalBodyReading: 11,
        validated: [],
        unvalidated: [
          "src/app/api/a/route.ts",
          "src/app/api/b/route.ts",
          "src/app/api/c/route.ts",
        ],
      };
      const cmp = compareRouteValidation(summary, baseline);
      expect(cmp.exceedsBaseline).toBe(true);
      expect(cmp.totalIncreasedBy).toBe(1);
    });
  });

  describe("updateRouteValidationBaseline", () => {
    it("ratchets baseline down and sorts allowlist", () => {
      const baseline: RouteValidationBaseline = {
        totalUnvalidated: 5,
        totalBodyReading: 20,
        allowlist: ["src/app/api/z/route.ts", "src/app/api/a/route.ts"],
      };
      const summary: RouteValidationSummary = {
        totalRoutes: 30,
        totalBodyReading: 20,
        validated: ["src/app/api/z/route.ts"],
        unvalidated: ["src/app/api/a/route.ts"],
      };

      const updated = updateRouteValidationBaseline(summary, baseline);
      expect(updated.totalUnvalidated).toBe(1);
      expect(updated.totalBodyReading).toBe(20);
      expect(updated.allowlist).toEqual(["src/app/api/a/route.ts"]);
      expect(() => routeValidationBaselineSchema.parse(updated)).not.toThrow();
    });
  });
});
