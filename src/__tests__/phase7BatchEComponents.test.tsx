import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { resolveIngredientModality } from "@/components/RecipeBuilder";
import { AstrologicalRecommendations } from "@/components/astrological/AstrologicalRecommendations";
import { TokenBalanceBar } from "@/components/economy/TokenBalanceBar";
import TokenShopModal from "@/components/economy/TokenShopModal";

jest.mock("@/components/economy/PlanetaryInfluenceTooltip", () => ({
  PlanetaryInfluenceTooltip: () => null,
}));

const structuredCloneDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "structuredClone",
);

beforeAll(() => {
  if (typeof globalThis.structuredClone !== "function") {
    Object.defineProperty(globalThis, "structuredClone", {
      configurable: true,
      value: <T,>(value: T): T => value,
    });
  }
});

afterAll(() => {
  if (structuredCloneDescriptor) {
    Object.defineProperty(globalThis, "structuredClone", structuredCloneDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "structuredClone");
  }
});

function mockFetch(body: unknown, ok = true): jest.Mock {
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async (): Promise<unknown> => body,
  });
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Phase 7 Batch E component boundaries", () => {
  it("passes qualities before elemental properties when deriving recipe modality", () => {
    expect(
      resolveIngredientModality({
        id: "root-vegetable",
        name: "Root Vegetable",
        qualities: ["grounding"],
        elementalProperties: { Fire: 0, Water: 0, Earth: 0, Air: 1 },
      }),
    ).toBe("Fixed");
  });

  it("surfaces a malformed astrological recommendation response", async () => {
    mockFetch({ recommendations: "not-an-array", insights: [] });
    render(<AstrologicalRecommendations />);

    fireEvent.change(screen.getByLabelText("Select your zodiac sign"), {
      target: { value: "Aries" },
    });

    expect(
      await screen.findByText("Invalid cooking recommendation response"),
    ).toBeInTheDocument();
  });

  it("does not render balances from a malformed economy response", async () => {
    const fetchMock = mockFetch({ success: true, balances: null });
    const { container } = render(<TokenBalanceBar />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(container).toBeEmptyDOMElement();
  });

  it("surfaces a malformed token-shop response after the open event", async () => {
    mockFetch({ success: true, items: "not-an-array" });
    render(<TokenShopModal />);

    act(() => {
      window.dispatchEvent(new Event("open-token-shop"));
    });

    expect(await screen.findByText("Invalid shop response")).toBeInTheDocument();
  });
});
