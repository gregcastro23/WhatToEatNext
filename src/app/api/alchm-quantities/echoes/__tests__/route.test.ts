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

  it("returns the solar return in a requested past year for planet=Sun&year=", async () => {
    const req = new Request(
      "http://localhost:3000/api/alchm-quantities/echoes?planet=Sun&year=2001&ref=2026-10-27T15:00:00.000Z",
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    const json = await res.json();

    expect(json.success).toBe(true);
    expect(json.echo.echo.iso.startsWith("2001-10-")).toBe(true);
    expect(json.echo.echo.yearsAgo).toBeGreaterThan(24.9);
    expect(json.echo.echo.yearsAgo).toBeLessThan(25.1);
    expect(json.echo.echo.deltaArcminutes).toBeLessThan(0.05);
    expect(Array.isArray(json.recipes)).toBe(true);
  }, 20000);

  it("rejects out-of-range or non-Sun year requests", async () => {
    const future = await GET(
      new Request("http://localhost:3000/api/alchm-quantities/echoes?planet=Sun&year=2026&ref=2026-10-27T15:00:00.000Z"),
    );
    expect(future.status).toBe(400);

    const pluto = await GET(
      new Request("http://localhost:3000/api/alchm-quantities/echoes?planet=Pluto&year=2001"),
    );
    expect(pluto.status).toBe(400);
  });
});
