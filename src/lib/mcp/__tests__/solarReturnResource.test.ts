/**
 * @file src/lib/mcp/__tests__/solarReturnResource.test.ts
 *
 * Tests for the Solar Return MCP resource template and tool integration.
 */
import { resolveCaller } from "@/lib/mcp/auth";
import { RESOURCE_TEMPLATES } from "@/lib/mcp/resourceCatalog";
import { readResource } from "@/lib/mcp/resources";
import { invokeTool } from "@/lib/mcp/tools";

describe("Solar Return MCP Resource Template", () => {
  it("declares the alchm://solar-return/{year} URI template in RESOURCE_TEMPLATES", () => {
    const template = RESOURCE_TEMPLATES.find((t) => t.uriTemplate === "alchm://solar-return/{year}");
    expect(template).toBeDefined();
    expect(template?.name).toBe("Solar Return Ephemeris & Day Recipes");
    expect(template?.mimeType).toBe("application/json");
  });

  it("resolves alchm://solar-return/1990 with return echo, cuisines, and recipes", async () => {
    const caller = await resolveCaller({});
    const result = await readResource("alchm://solar-return/1990", caller);

    expect(result).not.toBeNull();
    const content = result?.contents[0];
    expect(content).toBeDefined();
    expect(content?.uri).toBe("alchm://solar-return/1990");
    expect(content?.mimeType).toBe("application/json");

    const payload = JSON.parse(content?.text ?? "{}");
    expect(payload.year).toBe(1990);
    expect(payload.echo).toBeDefined();
    expect(payload.echo?.planet).toBe("Sun");
    expect(payload.echo?.yearsAgo).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(payload.cuisineMatches)).toBe(true);
    expect(Array.isArray(payload.recipes)).toBe(true);
  });

  it("returns a structured error for an out-of-range or malformed year", async () => {
    const caller = await resolveCaller({});
    const tooOld = await readResource("alchm://solar-return/1750", caller);
    expect(tooOld).not.toBeNull();
    const tooOldPayload = JSON.parse(tooOld?.contents[0]?.text ?? "{}");
    expect(tooOldPayload.error).toBe("Invalid solar return year");
    expect(tooOldPayload.validRange?.min).toBe(1800);

    const nonInt = await readResource("alchm://solar-return/not-a-year", caller);
    expect(nonInt).not.toBeNull();
    const nonIntPayload = JSON.parse(nonInt?.contents[0]?.text ?? "{}");
    expect(nonIntPayload.error).toBe("Invalid solar return year");
  });
});

describe("what_to_cook_now Solar Return Synergy", () => {
  it("incorporates solarReturnYear to boost and annotate recommendations", async () => {
    const result = await invokeTool("what_to_cook_now", {
      availableIngredients: ["garlic", "olive oil"],
      solarReturnYear: 1999,
      limit: 3,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.solarReturn).toBeDefined();
    expect(result.data.solarReturn?.year).toBe(1999);
    expect(Array.isArray(result.data.solarReturn?.matchedCuisines)).toBe(true);
    expect(result.summary?.solarReturnYear).toBe(1999);
    expect(result.data.recommendations.length).toBeGreaterThanOrEqual(1);
  });
});
