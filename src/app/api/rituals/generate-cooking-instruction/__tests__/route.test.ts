import { POST } from "../route";

describe("POST /api/rituals/generate-cooking-instruction", () => {
  it("returns ritual instruction, dominant transit, potency score, and alchemical quantities", async () => {
    const request = new Request("http://localhost:3000/api/rituals/generate-cooking-instruction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe_id: "test-recipe-123" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      success: boolean;
      recipe_id: string | null;
      ritual_instruction: string;
      dominant_transit: string | null;
      total_potency_score: number;
      alchemical_quantities: {
        spirit_score: number;
        essence_score: number;
        matter_score: number;
        substance_score: number;
      };
    };

    expect(json.success).toBe(true);
    expect(json.recipe_id).toBe("test-recipe-123");
    expect(typeof json.ritual_instruction).toBe("string");
    expect(json.ritual_instruction.length).toBeGreaterThan(10);
    expect(typeof json.dominant_transit).toBe("string");
    expect(typeof json.total_potency_score).toBe("number");
    expect(json.total_potency_score).toBeGreaterThanOrEqual(60);
    expect(json.total_potency_score).toBeLessThanOrEqual(100);

    expect(json.alchemical_quantities).toBeDefined();
    expect(typeof json.alchemical_quantities.spirit_score).toBe("number");
    expect(typeof json.alchemical_quantities.essence_score).toBe("number");
    expect(typeof json.alchemical_quantities.matter_score).toBe("number");
    expect(typeof json.alchemical_quantities.substance_score).toBe("number");
  });

  it("handles empty body gracefully", async () => {
    const request = new Request("http://localhost:3000/api/rituals/generate-cooking-instruction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = (await response.json()) as {
      success: boolean;
      recipe_id: string | null;
      ritual_instruction: string;
    };

    expect(json.success).toBe(true);
    expect(json.recipe_id).toBeNull();
    expect(typeof json.ritual_instruction).toBe("string");
  });
});
