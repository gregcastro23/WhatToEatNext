/**
 * @jest-environment jsdom
 *
 * SolverPanel — UI honesty, lid visibility, refusal states, and instrument controls.
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { SolverPanel } from "../SolverPanel";

async function renderSettled(): Promise<ReturnType<typeof render>> {
  const view = render(<SolverPanel />);
  await waitFor(() => {
    expect(screen.getByText(/engine: typescript fallback/i)).toBeInTheDocument();
  });
  return view;
}

describe("SolverPanel", () => {
  it("renders the five input steps, result rail, and honest engine label", async () => {
    await renderSettled();

    expect(screen.getByText(/thermal cooking solver/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Filter solvable ingredients")).toBeInTheDocument();
    expect(screen.getByLabelText(/air velocity/i)).toBeInTheDocument();
    expect(screen.getByText(/surface h/i)).toBeInTheDocument();
    expect(screen.getByText(/biot regime/i)).toBeInTheDocument();
  });

  it("filters solvable ingredients by name or FDC id without falling back to unsolvable items", async () => {
    await renderSettled();
    const search = screen.getByLabelText("Filter solvable ingredients");
    fireEvent.change(search, { target: { value: "vanilla" } });

    const select = screen.getByLabelText("Ingredient");
    expect(select).toHaveValue("vanilla_extract");
    expect(screen.getByText(/unaccounted/i)).toBeInTheDocument();
  });

  it("shows vessel thermal mass and only renders lid controls when the vessel has a lid", async () => {
    await renderSettled();
    expect(screen.queryByRole("group", { name: "lid seal" })).not.toBeInTheDocument();

    const vesselSelect = screen.getByLabelText("Cookware vessel");
    fireEvent.change(vesselSelect, { target: { value: "skillet_12in_carbon" } });
    expect(screen.getByText(/thermal mass/i)).toBeInTheDocument();
    expect(screen.getByText(/open pan \(no lid fitted\)/i)).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "lid seal" })).not.toBeInTheDocument();

    fireEvent.change(vesselSelect, { target: { value: "dutch_oven_55qt" } });
    expect(screen.getByRole("group", { name: "lid seal" })).toBeInTheDocument();
    expect(screen.getByText(/returned as condensate/i)).toBeInTheDocument();
  });

  it("renders an honest refusal instead of NaN or zero when the medium cannot reach the target core", async () => {
    const { container } = await renderSettled();
    fireEvent.change(screen.getByLabelText("Cooking method"), { target: { value: "sous_vide" } });
    fireEvent.change(screen.getByLabelText(/target doneness/i), { target: { value: "200" } });

    expect(screen.getByText(/core time:.*not between/i)).toBeInTheDocument();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\bNaN\b/);
    expect(text).not.toMatch(/\bN\/A\b/);
  });
});
