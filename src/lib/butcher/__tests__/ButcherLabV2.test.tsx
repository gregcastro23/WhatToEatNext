/**
 * @jest-environment jsdom
 *
 * V2 UI integration through the headless SVG stage: the Show Bone Landmarks
 * (X-ray) toggle, Quick Compare drawer, Prep & Trim controls, the slice-angle
 * colour cue, a Master fabrication round with yield economics, and Species
 * Mastery badges.
 */
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ButcherLabApp } from "@/app/(alchm)/kitchen-lab/butcher/_lab/ButcherLabApp";
import { BUTCHER_PROGRESS_STORAGE_KEY } from "@/lib/butcher/science/butcherProgress";

jest.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

// Synchronous next/dynamic stand-in. jest.config sets resetModules, so an async
// import() inside a test would load a second React and break hooks; instead the
// loader's `.then((m) => m.X)` names the export and it is required up front.
jest.mock("next/dynamic", () => (loader: () => unknown): unknown => {
  const LAZY_MODULES: Readonly<Record<string, string>> = {
    ButcherStageCanvas: "ButcherStageCanvas",
    ButchersBlockPanel: "ButchersBlockPanel",
    ThermalGrainPanel: "ThermalGrainPanel",
    ButcherElementsPanel: "ButcherElementsPanel",
    ButcherSourcesPanel: "ButcherSourcesPanel",
    BoneLandmarkNotes: "BoneLandmarkNotes",
    ComparisonTable: "CutComparisonTable",
  };
  const name = /\.then\(\(?(\w+)\)?\s*=>\s*\1\.(\w+)\)/.exec(String(loader))?.[2] ?? "";
  const file = LAZY_MODULES[name];
  if (file === undefined) throw new Error(`next/dynamic mock: unmapped loader ${String(loader)}`);
  return jest.requireActual<Record<string, unknown>>(`@/app/(alchm)/kitchen-lab/butcher/_lab/${file}`)[name];
});

function clickFirst(name: RegExp): void {
  const [btn] = screen.getAllByRole("button", { name });
  if (!btn) throw new Error(`no button ${String(name)}`);
  fireEvent.click(btn);
}



describe("<ButcherLabApp /> v2", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/kitchen-lab/butcher");
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, recipes: [] }) });
  });

  it("toggles Show Bone Landmarks: skeleton overlay on the SVG stage plus why-the-cut-sits-there notes", async () => {
    render(<ButcherLabApp />);
    await waitFor(() => expect(screen.getByRole("img", { name: /beef anatomical primal/i })).toBeInTheDocument());
    const toggle = screen.getByRole("button", { name: "Show Bone Landmarks" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("bt-svg-skeleton")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("bt-svg-skeleton").querySelectorAll("line").length).toBeGreaterThanOrEqual(4);
    const notes = await screen.findByRole("list", { name: /bone landmarks and the cuts they explain/i });
    expect(within(notes).getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);

    fireEvent.click(toggle);
    expect(screen.queryByTestId("bt-svg-skeleton")).toBeNull();
  });

  it("pins two cuts and compares them side by side", async () => {
    render(<ButcherLabApp />);
    await waitFor(() => expect(screen.getByRole("img", { name: /beef anatomical primal/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /pin ribeye steak to compare/i }));
    expect(screen.getByText(/pin 1 more cut/i)).toBeInTheDocument();

    clickFirst(/^new york strip/i);
    fireEvent.click(screen.getByRole("button", { name: /pin new york strip to compare/i }));
    const table = await screen.findByRole("table", { name: /comparison of ribeye steak and new york strip/i });
    expect(within(table).getByRole("rowheader", { name: /fat \(g\/100 g, usda\)/i })).toBeInTheDocument();
    expect(within(table).getByRole("rowheader", { name: /gray band/i })).toBeInTheDocument();
  });

  it("drives the trajectory from Prep & Trim: fat cap, bone-in, and species-gated dry aging", async () => {
    window.history.replaceState(null, "", "/kitchen-lab/butcher?tab=thermal&species=beef&cut=prime-rib");
    render(<ButcherLabApp />);
    await waitFor(() => expect(screen.getByRole("group", { name: "Pre-cook prep" })).toBeInTheDocument());

    const boneBox = screen.getByRole("checkbox", { name: /bone-in/i });
    expect(boneBox).toBeChecked();
    expect(screen.getByRole("img", { name: /face b \(bone\)/i })).toBeInTheDocument();
    fireEvent.click(boneBox);
    expect(screen.getByRole("img", { name: /face b \(lean\)/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/fat cap on face a/i), { target: { value: "6" } });
    expect(screen.getByRole("img", { name: /face a \(fat\)/i })).toBeInTheDocument();
    expect(screen.getByText(/fat cap 6 mm/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dry-Aged 28 d" }));
    expect(screen.getByRole("button", { name: "Dry-Aged 28 d" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/basis for dry-aged 28 d/i)).toBeInTheDocument();
  });

  it("resets bone-in and the fat cap to each cut's own defaults on a cut change", async () => {
    window.history.replaceState(null, "", "/kitchen-lab/butcher?tab=thermal&species=beef&cut=prime-rib");
    render(<ButcherLabApp />);
    await waitFor(() => expect(screen.getByRole("group", { name: "Pre-cook prep" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("checkbox", { name: /bone-in/i }));
    fireEvent.change(screen.getByLabelText(/fat cap on face a/i), { target: { value: "9" } });
    expect(screen.getByRole("checkbox", { name: /bone-in/i })).not.toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Breakdown" }));
    clickFirst(/^ribeye steak/i);
    fireEvent.click(screen.getByRole("button", { name: "Thermal & Grain" }));
    expect(await screen.findByLabelText(/fat cap on face a: 0 mm/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /bone-in/i })).toBeChecked();
  });

  it("disables dry aging for poultry", async () => {
    window.history.replaceState(null, "", "/kitchen-lab/butcher?tab=thermal&species=poultry&cut=breast-supreme");
    render(<ButcherLabApp />);
    await waitFor(() => expect(screen.getByRole("group", { name: "Pre-cook prep" })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Dry-Aged 28 d" })).toBeDisabled();
    expect(screen.getByText(/boneless cut/i)).toBeInTheDocument();
  });

  it("runs a two-pull Master fabrication order, shows yield economics, and ranks beef mastery", async () => {
    render(<ButcherLabApp />);
    fireEvent.click(screen.getByRole("button", { name: "Butcher's Block" }));
    fireEvent.click(await screen.findByRole("button", { name: /master butcher/i }));
    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByRole("button", { name: /next order ticket/i }));
    await waitFor(() => expect(screen.getByText(/steakhouse short loin breakdown/i)).toBeInTheDocument());

    const angle = screen.getByLabelText(/2d knife angle/i);
    fireEvent.change(angle, { target: { value: "90" } });
    expect(screen.getByText("Cross-grain")).toHaveAttribute("data-band", "cross-grain");
    fireEvent.change(angle, { target: { value: "10" } });
    expect(screen.getByText("Parallel / stringy")).toHaveAttribute("data-band", "parallel");
    fireEvent.change(angle, { target: { value: "90" } });

    clickFirst(/^tenderloin \/ filet mignon/i);
    fireEvent.change(screen.getByLabelText(/portion trim mass/i), { target: { value: "220" } });
    fireEvent.click(screen.getByRole("button", { name: /pull tenderloin \/ filet mignon for step 1/i }));
    clickFirst(/^new york strip/i);
    fireEvent.change(screen.getByLabelText(/portion trim mass/i), { target: { value: "350" } });
    fireEvent.click(screen.getByRole("button", { name: /pull new york strip for step 2/i }));
    expect(screen.getByRole("button", { name: /all pulls recorded/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /execute cut & fulfill order/i }));
    expect(screen.getByText(/ticket fulfilled/i)).toBeInTheDocument();
    const yields = screen.getByRole("table", { name: /fabrication yield/i });
    expect(within(yields).getAllByRole("row")).toHaveLength(3);
    expect(within(yields).getAllByText("USDA")).toHaveLength(2);
    expect(screen.getByRole("list", { name: /species mastery/i })).toHaveTextContent(/beef: initiate/i);
    expect(window.localStorage.getItem(BUTCHER_PROGRESS_STORAGE_KEY)).toContain('"version":2');

    // One score per ticket: the button locks, and a forced second submit credits nothing.
    const execute = screen.getByRole("button", { name: /execute cut & fulfill order/i });
    expect(execute).toBeDisabled();
    fireEvent.click(execute);
    const stored: unknown = JSON.parse(window.localStorage.getItem(BUTCHER_PROGRESS_STORAGE_KEY) ?? "null");
    expect(stored).toMatchObject({ completedOrders: 1, speciesMastery: { beef: { passed: 1, masterPassed: 1 } } });
  });
});
