/**
 * The generated-recipe PAGE over the real /api/recipes/custom handler.
 *
 * The page's own `fetch(...).then(readJson(res, parseCustomRecipeResponse))` runs
 * against the Response the REAL route handler builds from a stored row (only the
 * route's database client is faked). This gives the evidence the parser suites
 * cannot: that the page renders what the parser returns, that a stored recipe the
 * page cannot render ends in not-found instead of a render-time TypeError, and,
 * the point of the pass-through design, that clicking Like POSTs EXACTLY the recipe
 * the route sent (`payload: recipe`), extras included.
 */
import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { GET } from "@/app/api/recipes/custom/route";
import Page from "@/app/(alchm)/generated-recipe/[id]/page";
import { isJsonRecord } from "@/lib/api/json";

let mockRows: unknown[] = [];
let mockDbFails = false;

jest.mock("next/navigation", () => ({
  useParams: (): { id: string } => ({ id: "db-uuid-1" }),
  useRouter: (): { back: () => void } => ({ back: (): void => undefined }),
  notFound: (): never => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children?: React.ReactNode }): React.ReactElement =>
    React.createElement("a", { href }, children),
}));
jest.mock("@/utils/generatedRecipeStore", () => ({ getRecipeFromStore: (): undefined => undefined }));
jest.mock("@/lib/database/connection", () => ({
  executeQuery: async (): Promise<{ rows: unknown[] }> => {
    if (mockDbFails) throw new Error("connection refused");
    return { rows: mockRows };
  },
}));
jest.mock("@/lib/logger", () => ({ _logger: { error: (): void => undefined, warn: (): void => undefined, info: (): void => undefined } }));

/** Reports WHICH error ended the render, so not-found can be told apart from a TypeError. */
class Boundary extends React.Component<{ children?: React.ReactNode }, { failure: string | null }> {
  state: { failure: string | null } = { failure: null };
  static getDerivedStateFromError(error: unknown): { failure: string } {
    return { failure: error instanceof Error ? error.message : String(error) };
  }
  render(): React.ReactNode {
    return this.state.failure === null ? this.props.children : <p>{`BOUNDARY: ${this.state.failure}`}</p>;
  }
}

const originalFetch = globalThis.fetch;
let served: unknown = null;
let posted: unknown = null;
let likeResponseFactory: () => Response = () =>
  new Response(JSON.stringify({ authenticated: true, wasExisting: false }), { status: 200 });

function installFetch(): void {
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === "string" ? input : String(input);
    if (url.startsWith("/api/recipes/custom")) {
      const response = await GET(new Request(`http://localhost${url}`));
      served = await response.clone().json();
      return response;
    }
    if (url === "/api/users/me/recipes/custom") {
      posted = JSON.parse(String(init?.body));
      return likeResponseFactory();
    }
    throw new Error(`unexpected fetch ${url}`);
  };
}

const ELEMENTS = { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 };

function generatedPayload(): Record<string, unknown> {
  return {
    id: "cosmic-1731576000000-a1b2c",
    name: "Moonlit Saffron Risotto",
    description: "A risotto for a waxing Moon.",
    cuisine: "Italian",
    mealType: ["dinner"],
    prepTime: "45 min",
    numberOfServings: 4,
    ingredients: [{ name: "arborio rice", amount: 300, unit: "g" }, { name: "saffron", amount: 0.5, unit: "g", notes: "bloomed" }],
    instructions: ["Bloom the saffron.", "Toast the rice."],
    elementalProperties: ELEMENTS,
    nutrition: { calories: 520, protein: 14, carbs: 88, fat: 11 },
    alchemicalProperties: { totalKalchm: 1.2, monicaConstant: 7.25, thermodynamicProfile: { heat: 0.6 } },
    monicaOptimization: { originalMonica: null, optimizedMonica: 7.25, optimizationScore: 0, temperatureAdjustments: [], timingAdjustments: [], intensityModifications: ["lower-heat"], planetaryTimingRecommendations: ["Venus is strong tonight."] },
    seasonalAdaptation: { currentSeason: "spring", seasonalScore: 0, seasonalIngredientSubstitutions: [], seasonalCookingMethodAdjustments: [{ method: "roast", adjustment: "longer", reason: "denser" }] },
    cuisineIntegration: { authenticity: 0, fusionPotential: 0, culturalNotes: ["Rooted in northern Italian rice country."], traditionalVariations: [], modernAdaptations: [] },
    nutritionalOptimization: { kalchmNutritionalBalance: 0.5 },
  };
}

function storeRow(payload: unknown): void {
  mockRows = [{ id: "db-uuid-1", name: "Stored Name", cuisine: null, payload, notes: null }];
}

function mountPage(): void {
  render(
    <Boundary>
      <Page />
    </Boundary>,
  );
}

beforeEach(() => {
  mockRows = [];
  mockDbFails = false;
  served = null;
  posted = null;
  likeResponseFactory = () =>
    new Response(JSON.stringify({ authenticated: true, wasExisting: false }), { status: 200 });
  installFetch();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("GeneratedRecipePage over the real /api/recipes/custom handler", () => {
  it("renders the stored recipe the route served", async () => {
    storeRow(generatedPayload());
    mountPage();
    await waitFor(() => expect(screen.getByText("Moonlit Saffron Risotto")).not.toBeNull());
    for (const text of ["Ingredients", "Instructions", "Elemental Profile", "arborio rice", "Bloom the saffron.", "kcal", "Why this recipe?"]) {
      expect(screen.getAllByText(new RegExp(text.replace("?", "\\?"))).length).toBeGreaterThan(0);
    }
    expect(screen.getByText(/Venus is strong tonight\./)).not.toBeNull();
    expect(screen.getByText(/Rooted in northern Italian rice country\./)).not.toBeNull();
  });

  it("Like POSTs EXACTLY the recipe the route sent: extras the page never reads are not truncated", async () => {
    storeRow(generatedPayload());
    mountPage();
    await waitFor(() => expect(screen.getByText("Like Recipe")).not.toBeNull());
    fireEvent.click(screen.getByText("Like Recipe"));
    await waitFor(() => expect(posted).not.toBeNull());
    const sent = isJsonRecord(served) ? served.recipe : undefined;
    expect(isJsonRecord(posted) ? posted.payload : undefined).toStrictEqual(sent);
    expect(posted).toHaveProperty("payload.nutritionalOptimization.kalchmNutritionalBalance", 0.5);
    expect(posted).toHaveProperty("payload.alchemicalProperties.thermodynamicProfile.heat", 0.6);
    expect(posted).toMatchObject({ name: "Moonlit Saffron Risotto", sourceRecipeId: "cosmic-1731576000000-a1b2c", action: "like" });
    await waitFor(() =>
      expect(screen.getByText("Saved to your cookbook. Recommendations will adapt.")).not.toBeNull(),
    );
  });

  it("Like shows the refreshed message only when wasExisting is boolean true, and degrades gracefully on non-JSON 200 bodies", async () => {
    storeRow(generatedPayload());
    likeResponseFactory = () =>
      new Response(JSON.stringify({ authenticated: true, wasExisting: true }), { status: 200 });
    const first = render(<Boundary><Page /></Boundary>);
    await waitFor(() => expect(screen.getByText("Like Recipe")).not.toBeNull());
    fireEvent.click(screen.getByText("Like Recipe"));
    await waitFor(() =>
      expect(screen.getByText("Already in your cookbook. Preferences refreshed.")).not.toBeNull(),
    );
    first.unmount();

    likeResponseFactory = () =>
      new Response(JSON.stringify({ authenticated: true, wasExisting: "yes" }), { status: 200 });
    const second = render(<Boundary><Page /></Boundary>);
    await waitFor(() => expect(screen.getByText("Like Recipe")).not.toBeNull());
    fireEvent.click(screen.getByText("Like Recipe"));
    await waitFor(() =>
      expect(screen.getByText("Saved to your cookbook. Recommendations will adapt.")).not.toBeNull(),
    );
    second.unmount();

    likeResponseFactory = () => new Response("", { status: 200 });
    render(<Boundary><Page /></Boundary>);
    await waitFor(() => expect(screen.getByText("Like Recipe")).not.toBeNull());
    fireEvent.click(screen.getByText("Like Recipe"));
    await waitFor(() =>
      expect(screen.getByText("Saved to your cookbook. Recommendations will adapt.")).not.toBeNull(),
    );
  });

  it("never adopts a non-OK response, even when its body parses as a recipe", async () => {
    storeRow(generatedPayload());
    const routed = globalThis.fetch;
    // The same body the real route served, behind a 502: only the page's `!res.ok` gate can refuse it.
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const response = await routed(input, init);
      return new Response(await response.text(), { status: 502 });
    };
    mountPage();
    await waitFor(() => expect(screen.getByText("BOUNDARY: NEXT_NOT_FOUND")).not.toBeNull());
    expect(screen.queryByText("Moonlit Saffron Risotto")).toBeNull();
  });

  it("a null element share (what JSON.stringify makes of NaN) shows as 0%, in the recipe profile and in an ingredient's alchemy", async () => {
    storeRow({
      ...generatedPayload(),
      elementalProperties: { Fire: null, Water: 0.2, Earth: 0.3, Air: 0.5 },
      ingredients: [{ name: "saffron", amount: 0.5, unit: "g", elementalProperties: { Fire: null, Water: 0.1, Earth: 0.2, Air: 0.3 } }],
    });
    mountPage();
    const profile = (await screen.findByText("Elemental Profile")).parentElement;
    if (profile === null) throw new Error("the elemental profile section has no container");
    expect(within(profile).getAllByText(/%$/).map((node) => node.textContent)).toEqual(["0%", "20%", "30%", "50%"]);
    fireEvent.click(await screen.findByText("Alchemy ▾"));
    const row = screen.getByText("saffron").closest("li");
    if (row === null) throw new Error("the ingredient row is not a list item");
    expect(within(row).getAllByText(/%$/).map((node) => node.textContent)).toEqual(["0%", "10%", "20%", "30%"]);
  });

  it.each([
    ["an adaptation-shaped payload with no optimisation blocks", (): void => storeRow({ ingredients: [{ name: "salt", amount: 1, unit: "tsp" }], instructions: ["Season."], elementalProperties: ELEMENTS })],
    ["a payload that is not an object", (): void => storeRow(null)],
    ["no row at all (404)", (): void => { mockRows = []; }],
    ["a database failure (500)", (): void => { mockDbFails = true; }],
  ])("%s ends in not-found, not a render-time TypeError", async (_name, arrange): Promise<void> => {
    arrange();
    mountPage();
    await waitFor(() => expect(screen.getByText("BOUNDARY: NEXT_NOT_FOUND")).not.toBeNull());
  });
});
