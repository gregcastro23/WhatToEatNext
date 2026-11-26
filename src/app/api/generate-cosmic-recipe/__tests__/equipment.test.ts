/**
 * @jest-environment node
 *
 * The recipe bar's equipment list: it reaches the model through the prompt,
 * a long list is refused, and it joins the idempotency fingerprint only when
 * named, so keys claimed before equipment existed still match.
 */
import { NextRequest } from "next/server";
import { installFetchMock } from "@/__tests__/helpers/fetchMock";
import { computeCosmicRequestFingerprint } from "@/lib/cooking/cosmicGenerationOperations";
import { VALID_RECIPE } from "./helpers/validCosmicRecipe";

jest.mock("@/lib/auth/demoAccess", () => ({
  gateDemoOrAuth: async () => ({ mode: "demo", remaining: 1 }),
}));

jest.mock("@/services/FoodDiaryService", () => ({
  foodDiaryService: { getEntries: async () => [] },
}));

async function post(body: Record<string, unknown>): Promise<Response> {
  const mod = await import("@/app/api/generate-cosmic-recipe/route");
  return mod.POST(
    new NextRequest("https://alchm.kitchen/api/generate-cosmic-recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "something warm", ...body }),
    }),
  );
}

it("writes the equipment into the prompt the model receives", async () => {
  const upstream = installFetchMock(
    jest.fn(async () => ({ ok: true, status: 200, json: async () => VALID_RECIPE, text: async () => JSON.stringify(VALID_RECIPE) })),
  );
  await post({ equipment: ["Wok", "Rice cooker"] });
  const sent = upstream.mock.calls
    .map(([, init]) => String(Reflect.get(Object(init), "body")))
    .find((body) => body.includes("prompt"));
  expect(sent).toContain("Available equipment: Wok, Rice cooker.");
});

it("refuses more equipment than the schema allows", async () => {
  const response = await post({ equipment: Array.from({ length: 21 }, (_, at) => `pan ${at}`) });
  expect(response.status).toBe(400);
});

it("keeps the old fingerprint when no equipment is named", () => {
  const base = { prompt: "soup", ingredientsMain: ["leek"] };
  expect(computeCosmicRequestFingerprint({ ...base, equipment: [] })).toBe(computeCosmicRequestFingerprint(base));
  expect(computeCosmicRequestFingerprint({ ...base, equipment: ["Wok"] })).not.toBe(computeCosmicRequestFingerprint(base));
});
