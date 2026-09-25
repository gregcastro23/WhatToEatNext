/**
 * @jest-environment jsdom
 *
 * Phase 5 in the DOM: typing an intent shows its chips (with the basis as the
 * chip's title) and announces them; several ingredients lead with the recipes
 * that use them together. Same harness as OmnibarShell.test: real responses,
 * the real lazy chunk.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { SearchIndex } from "@/lib/search/searchIndex";
import * as mockDropdownChunk from "../OmnibarDropdown";
import * as mockSheetChunk from "../OmnibarSheet";
import { OmnibarShell } from "../OmnibarShell";
import { clearOmniSearchCache } from "../useOmniSearch";
import { loadIndex, wire } from "./helpers/wireSearch";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/",
}));

jest.mock("@vercel/analytics", () => ({ track: jest.fn() }));

// The real chunks, imported with the rest of this file (see OmnibarShell.test).
jest.mock("../omnibarChunks", () => ({
  loadDropdown: async () => mockDropdownChunk,
  loadSheet: async () => mockSheetChunk,
}));

jest.mock("next/dynamic", () => {
  const React: typeof import("react") = jest.requireActual("react");
  return (loader: () => Promise<React.ComponentType<object>>) => {
    const Lazy = React.lazy(() => loader().then((component) => ({ default: component })));
    return function DynamicLoaded(props: object) {
      return React.createElement(React.Suspense, { fallback: null }, React.createElement(Lazy, props));
    };
  };
});

let index: SearchIndex;

beforeAll(async () => {
  index = await loadIndex();
  // Plain functions, not jest.fn: jest.config's restoreMocks would strip a mock's implementation.
  const answer = async (url: string): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> => {
    const query = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    return { ok: true, status: 200, json: async () => wire(index, query) };
  };
  Object.defineProperty(globalThis, "fetch", { value: answer, configurable: true, writable: true });
  Reflect.set(window, "matchMedia", () => ({ matches: true }));
  Element.prototype.scrollIntoView = (): void => undefined;
}, 120_000);

beforeEach(() => {
  push.mockClear();
  clearOmniSearchCache();
  window.localStorage.clear();
});

async function search(value: string): Promise<{ input: HTMLElement; listbox: HTMLElement }> {
  render(<OmnibarShell />);
  const input = screen.getByRole("combobox", { name: /search ingredients/i, hidden: true });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  const listbox = await screen.findByRole("listbox", { hidden: true });
  await waitFor(() => expect(screen.queryByText("Searching…")).not.toBeInTheDocument());
  return { input, listbox };
}

describe("intent in the dropdown", () => {
  it("vegan breakfast: two chips carrying their basis, announced with the count", async () => {
    await search("vegan breakfast");
    const vegan = await screen.findByText("Vegan");
    expect(vegan).toHaveClass("omni-intent-chip");
    expect(vegan).toHaveAttribute("title", expect.stringContaining("ingredient classifier"));
    expect(screen.getByText("Breakfast")).toHaveAttribute("data-applied", "true");
    await waitFor(() => expect(screen.getByRole("status", { hidden: true })).toHaveTextContent(/^Vegan, Breakfast\. \d+ results$/));
  });

  it("gluten free pasta: the claim shows, muted, as not verified", async () => {
    await search("gluten free pasta");
    expect(await screen.findByText("Gluten-free · not verified")).toHaveAttribute("data-applied", "false");
  });

  it("spinach eggs feta: the recipes with all three come first, and ↵ opens the full list", async () => {
    const { input, listbox } = await search("spinach eggs feta");
    expect(within(listbox).getByText(/^RECIPES WITH SPINACH \+ CHICKEN EGG \+ FETA · \d+$/)).toBeInTheDocument();
    const [first] = within(listbox).getAllByRole("option", { hidden: true });
    expect(first).toHaveTextContent("USES 3 OF 3");
    expect(first?.getAttribute("href")).toMatch(/^\/recipes\//);
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/search?q=spinach%20eggs%20feta"));
  });
});
