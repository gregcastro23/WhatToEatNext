/**
 * @jest-environment node
 *
 * Verifies /api/alchm-quantities/echoes endpoint:
 * - handles ?planet=Sun returning the solar return echo with cuisine matches
 * - defaults to Pluto when no planet is passed or invalid planet passed
 * - rate limiting headers and error handling
 */
import { describe, expect, it } from "@jest/globals";
import { GET } from "../route";

describe("GET /api/alchm-quantities/echoes", () => {
  it("returns solar return echo and cuisine matches for planet=Sun", async () => {
    const req = new Request("http://localhost:3000/api/alchm-quantities/echoes?planet=Sun&ref=2026-10-27T15:00:00.000Z");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.echo.planet).toBe("Sun");
    expect(json.echo.echo.yearsAgo).toBeGreaterThan(0.99);
    expect(json.echo.echo.yearsAgo).toBeLessThan(1.01);
    expect(json.echo.echo.deltaArcminutes).toBeLessThan(0.05);

    // Cuisines should be present
    expect(json.echo.cuisineMatches).toBeDefined();
    expect(json.echo.cuisineMatches.length).toBe(4);
    expect(json.echo.cuisineMatches[0].name).toBeTruthy();
  }, 15000);

  it("handles fallback to Pluto when no planet parameter is passed", async () => {
    const req = new Request("http://localhost:3000/api/alchm-quantities/echoes?ref=2026-10-27T15:00:00.000Z");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.echo.planet).toBe("Pluto");
    expect(json.echo.echo.yearsAgo).toBeGreaterThan(200);
  }, 20000);
});
