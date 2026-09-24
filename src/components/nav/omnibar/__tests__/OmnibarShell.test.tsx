/**
 * @jest-environment jsdom
 *
 * The header search end to end in the DOM (plan Phase 3 exit criteria):
 * typing "spinich" shows the correction, the hero and the recipes; the
 * keyboard walks every row; Smart Enter; ⌘K; the mobile sheet. `fetch` answers
 * with real responses (static catalog, the API's own core and serializer),
 * and next/dynamic loads the real lazy chunk.
 *
 * Queries pass `hidden: true` because jsdom ignores the stylesheet's
 * breakpoint, so the desktop half renders `display: none` here.
 */
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

// The real chunks, imported with the rest of this file: jest.config's
// resetModules would give a chunk required mid-test its own copy of React.
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
let desktop = true;

beforeAll(async () => {
  index = await loadIndex();
  // Plain functions, not jest.fn: jest.config's restoreMocks would strip a mock's implementation.
  const answer = async (url: string): Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }> => {
    const query = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    return { ok: true, status: 200, json: async () => wire(index, query) };
  };
  Object.defineProperty(globalThis, "fetch", { value: answer, configurable: true, writable: true });
  // The jest setup defines matchMedia writable but not configurable.
  Reflect.set(window, "matchMedia", () => ({ matches: desktop }));
  Element.prototype.scrollIntoView = (): void => undefined;
}, 120_000);

beforeEach(() => {
  desktop = true;
  push.mockClear();
  clearOmniSearchCache();
  window.localStorage.clear();
});

function openInput(): HTMLElement {
  render(<OmnibarShell />);
  const input = screen.getByRole("combobox", { name: /search ingredients/i, hidden: true });
  fireEvent.focus(input);
  return input;
}

async function type(input: HTMLElement, value: string): Promise<HTMLElement> {
  fireEvent.change(input, { target: { value } });
  const listbox = await screen.findByRole("listbox", { hidden: true });
  await waitFor(() => expect(screen.queryByText("Searching…")).not.toBeInTheDocument());
  return listbox;
}

function options(listbox: HTMLElement): HTMLElement[] {
  return within(listbox).getAllByRole("option", { hidden: true });
}

describe("desktop dropdown", () => {
  it("typing 'spinich' shows the correction, the spinach hero, and the recipes that use it", async () => {
    const listbox = await type(openInput(), "spinich");
    expect(screen.getByText(/Showing results for/)).toHaveTextContent("Showing results for spinach · no exact match for “spinich”");
    const [hero] = options(listbox);
    expect(hero).toHaveAttribute("href", "/ingredients/spinach");
    expect(hero).toHaveTextContent(/Spinach/);
    expect(hero).toHaveTextContent(/\d+RECIPES/);
    expect(within(listbox).getByText(/^RECIPES WITH SPINACH · \d+$/)).toBeInTheDocument();
    expect(options(listbox).filter((o) => o.getAttribute("href")?.startsWith("/recipes/")).length).toBeGreaterThan(0);
  });

  it("the keyboard walks every row, hero included, and ↵ opens the active one", async () => {
    const input = openInput();
    const listbox = await type(input, "spinach");
    const rows = options(listbox);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => expect(input).toHaveAttribute("aria-activedescendant", rows[0]?.id));
    expect(rows[0]).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => expect(input).toHaveAttribute("aria-activedescendant", rows[1]?.id));
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => expect(input).toHaveAttribute("aria-activedescendant", rows.at(-1)?.id));
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith(rows[1]?.getAttribute("href"));
  });

  it("a row chosen while results load stays chosen when they arrive", async () => {
    const input = openInput();
    fireEvent.change(input, { target: { value: "spinach" } });
    const listbox = await screen.findByRole("listbox", { hidden: true });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => expect(input).toHaveAttribute("aria-activedescendant"));
    const chosen = document.getElementById(input.getAttribute("aria-activedescendant") ?? "");
    expect(chosen).toHaveTextContent("See all results");
    await waitFor(() => expect(listbox.querySelector(".omni-opt-hero")).not.toBeNull());
    // The row itself, not its old position: "See all" is now last, and the hero took index 0.
    const selected = within(listbox).getAllByRole("option", { selected: true, hidden: true });
    expect(selected.map((o) => o.textContent)).toEqual([expect.stringContaining("See all results")]);
    await waitFor(() => expect(input).toHaveAttribute("aria-activedescendant", selected[0]?.id));
  });

  it.each([
    ["spinach", "/ingredients/spinach"],
    ["spinich", "/search?q=spinich"],
    ["pantry", "/pantry"],
  ])("Smart Enter on %s → %s", async (query, href) => {
    const input = openInput();
    await type(input, query);
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(push).toHaveBeenCalledWith(href));
  });

  it("pantry: the page leads and the server's fuzzy food hero is not shown", async () => {
    const listbox = await type(openInput(), "pantry");
    expect(options(listbox)[0]).toHaveAttribute("href", "/pantry");
    expect(listbox.querySelector(".omni-opt-hero")).toBeNull();
    expect(screen.queryByText(/Showing results for/)).not.toBeInTheDocument();
  });

  it("Esc closes the list, a second Esc clears the query", async () => {
    const input = openInput();
    await type(input, "thai");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox", { hidden: true })).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("");
  });

  it("⌘K focuses the input and opens recent picks and quick actions", async () => {
    render(<OmnibarShell />);
    act(() => {
      fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: true });
    });
    const input = screen.getByRole("combobox", { name: /search ingredients/i, hidden: true });
    expect(input).toHaveFocus();
    expect(await screen.findByText("QUICK ACTIONS")).toBeInTheDocument();
  });
});

describe("mobile sheet", () => {
  it("⌘K opens a modal sheet with its own search; Esc closes it and focus returns to the icon", async () => {
    desktop = false;
    render(<OmnibarShell />);
    act(() => {
      fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: true });
    });
    const sheet = await screen.findByRole("dialog", { name: "Search" });
    const input = within(sheet).getByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.change(input, { target: { value: "spinich" } });
    expect(await within(sheet).findByText(/Showing results for/)).toHaveTextContent("spinach");
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus();
  });

  it("Tab stays inside the sheet (input ⇄ Cancel)", async () => {
    render(<OmnibarShell />);
    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    const sheet = await screen.findByRole("dialog", { name: "Search" });
    const input = within(sheet).getByRole("combobox");
    await waitFor(() => expect(input).toHaveFocus());
    fireEvent.keyDown(input, { key: "Tab" });
    expect(within(sheet).getByRole("button", { name: "Cancel" })).toHaveFocus();
    fireEvent.keyDown(within(sheet).getByRole("button", { name: "Cancel" }), { key: "Tab" });
    expect(input).toHaveFocus();
  });
});
