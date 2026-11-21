/**
 * @jest-environment jsdom
 *
 * Integration tests for `<ButcherLabApp />` in a headless DOM environment:
 *  - Verifies automatic fallback to `ButcherSvgStage` when WebGL is unavailable
 *  - Verifies shared callback contract (`onSelectCut`, `onSliceAngleChange`)
 *  - Verifies SystemBadge epistemic boundary (`real` vs `alchm` on Elements tab)
 *  - Verifies executing a full Butcher's Block order round through the UI
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ButcherLabApp } from "@/app/(alchm)/kitchen-lab/butcher/_lab/ButcherLabApp";

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



describe("<ButcherLabApp />", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, "", "/kitchen-lab/butcher");
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        recipes: [
          {
            id: "pan-seared-ribeye",
            name: "Cast-Iron Pan-Seared Ribeye",
            cuisine: "American",
            description: "Basted with butter, thyme, and garlic.",
          },
        ],
      }),
    });
  });

  it("renders the headless 2D SVG fallback stage and switches species, cuts, and tabs cleanly", async () => {
    render(<ButcherLabApp />);

    // Real-physics SystemBadge on default Breakdown tab
    const banner = screen.getByRole("note");
    expect(banner).toHaveAttribute("data-system", "real");

    // Lazy stage resolves to 2D SVG fallback in jsdom
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /beef anatomical primal/i })).toBeInTheDocument();
    });

    // Switch species to Pork and pick Pork Belly via shared SVG cut button callback
    fireEvent.click(screen.getByRole("button", { name: "Pork" }));
    await waitFor(() => {
      expect(screen.getByRole("img", { name: /pork anatomical primal/i })).toBeInTheDocument();
    });

    const bellyButtons = screen.getAllByRole("button", { name: /pork belly/i });
    const firstBellyBtn = bellyButtons[0];
    expect(firstBellyBtn).toBeDefined();
    if (firstBellyBtn) {
      fireEvent.click(firstBellyBtn);
    }
    expect(window.location.search).toContain("cut=pork-belly");

    // Switch to Elements tab -> banner must flip to `alchm` and grid switches to full-width single column
    fireEvent.click(screen.getByRole("button", { name: "Elements" }));
    expect(screen.getByRole("note")).toHaveAttribute("data-system", "alchm");
    expect(await screen.findByText(/pork belly: .*-led projection/i)).toBeInTheDocument();
    expect(document.querySelector(".bt-grid--single")).not.toBeNull();

    // Switch to Sources & Recipes tab -> displays USDA FDC record and mocked recipe link
    fireEvent.click(screen.getByRole("button", { name: "Sources & Recipes" }));
    expect(screen.getByRole("note")).toHaveAttribute("data-system", "real");
    await waitFor(() => {
      expect(screen.getByText("Cast-Iron Pan-Seared Ribeye")).toBeInTheDocument();
    });
  });

  it("syncs explode presets, renders overlay color legends, and sets full-width DonenessBandBar SVG", async () => {
    render(<ButcherLabApp />);

    const wholeBtn = screen.getByRole("button", { name: "Whole Carcass" });
    const explodedBtn = screen.getByRole("button", { name: "Exploded Primals" });
    const explodeSlider = screen.getByLabelText(/explode primals/i);

    expect(wholeBtn).toHaveAttribute("aria-pressed", "true");
    expect(explodeSlider).toHaveValue("0");

    fireEvent.change(explodeSlider, { target: { value: "1" } });
    expect(explodedBtn).toHaveAttribute("aria-pressed", "true");
    expect(wholeBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(wholeBtn);
    expect(wholeBtn).toHaveAttribute("aria-pressed", "true");
    expect(explodeSlider).toHaveValue("0");

    fireEvent.click(screen.getByRole("button", { name: "Fat class" }));
    expect(screen.getByLabelText("Color overlay legend")).toHaveTextContent(/≥20 g fat/i);

    fireEvent.click(screen.getByRole("button", { name: "Thermal & Grain" }));
    const bandSvg = await screen.findByRole("img", { name: /cross-section thickness/i });
    expect(bandSvg).toHaveAttribute("preserveAspectRatio", "none");
  });

  it("runs a complete Butcher's Block order and carve round via the headless SVG stage controls", async () => {
    render(<ButcherLabApp />);

    fireEvent.click(screen.getByRole("button", { name: "Butcher's Block" }));

    await waitFor(() => {
      expect(screen.getByText(/bistro strip order/i)).toBeInTheDocument();
    });

    // Select the requested NY Strip cut via the fallback stage button
    const stripButtons = screen.getAllByRole("button", { name: /new york strip/i });
    const stageStripBtn = stripButtons[0];
    expect(stageStripBtn).toBeDefined();
    if (stageStripBtn) {
      fireEvent.click(stageStripBtn);
    }

    // Dial 90-degree cross-grain knife angle directly via the fallback stage slider
    const svgAngleSlider = screen.getByLabelText(/2d knife angle/i);
    fireEvent.change(svgAngleSlider, { target: { value: "90" } });

    const massSlider = screen.getByLabelText(/portion trim mass/i);
    fireEvent.change(massSlider, { target: { value: "350" } });

    // Execute order via persistent aria-live="polite" scorecard region
    const liveStatus = screen.getByRole("status");
    expect(liveStatus).toHaveAttribute("aria-live", "polite");
    expect(liveStatus).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole("button", { name: /execute cut & fulfill order/i }));

    expect(screen.getByText(/scorecard: grade s/i)).toBeInTheDocument();
    expect(screen.getByText(/ticket fulfilled/i)).toBeInTheDocument();
    expect(liveStatus).toHaveTextContent(/scorecard: grade s/i);
  });
});
