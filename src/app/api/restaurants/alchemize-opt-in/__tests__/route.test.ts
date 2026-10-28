import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "../route";

const mockExecuteQuery = vi.fn();

vi.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockExecuteQuery(...args),
}));

describe("Restaurant Recipe Alchemization Opt-In API (/api/restaurants/alchemize-opt-in)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/restaurants/alchemize-opt-in", () => {
    it("returns 400 when restaurantId is missing", async () => {
      const request = new NextRequest("http://localhost:3000/api/restaurants/alchemize-opt-in");
      const response = await GET(request);
      expect(response.status).toBe(400);
    });

    it("returns partner status and nomination history", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({ rows: [{ alchemize_opt_in: true }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "opt_1",
              restaurant_id: "partner_celestial_ramen",
              restaurant_name: "Celestial Ramen House",
              contact_email: "chef@celestialramen.com",
              role: "owner",
              signature_dishes_to_alchemize: ["Truffle Shoyu Ramen"],
              recipe_notes: "Crafted with 24-hr simmered broth",
              status: "approved",
              created_at: new Date().toISOString(),
            },
          ],
        });

      const request = new NextRequest(
        "http://localhost:3000/api/restaurants/alchemize-opt-in?restaurantId=partner_celestial_ramen",
      );
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.isAlchemizedPartner).toBe(true);
      expect(json.hasOptedIn).toBe(true);
      expect(json.optIns).toHaveLength(1);
    });
  });

  describe("POST /api/restaurants/alchemize-opt-in", () => {
    it("returns 400 on invalid email or missing role", async () => {
      const request = new NextRequest("http://localhost:3000/api/restaurants/alchemize-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "partner_celestial_ramen",
          restaurantName: "Celestial Ramen House",
          contactEmail: "invalid-email",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("registers an owner opt-in and marks status as approved", async () => {
      mockExecuteQuery
        .mockResolvedValueOnce({
          rows: [
            {
              id: "opt_2",
              restaurant_id: "partner_sol_taqueria",
              restaurant_name: "Sol & Luna Cantina",
              contact_email: "chef@solcantina.com",
              role: "chef",
              signature_dishes_to_alchemize: ["Birria de Res Tacos"],
              recipe_notes: "Slow braised with guajillo chilies",
              status: "approved",
              created_at: new Date().toISOString(),
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest("http://localhost:3000/api/restaurants/alchemize-opt-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: "partner_sol_taqueria",
          restaurantName: "Sol & Luna Cantina",
          contactEmail: "chef@solcantina.com",
          role: "chef",
          signatureDishesToAlchemize: ["Birria de Res Tacos"],
          recipeNotes: "Slow braised with guajillo chilies",
        }),
      });

      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.optIn.status).toBe("approved");
    });
  });
});
