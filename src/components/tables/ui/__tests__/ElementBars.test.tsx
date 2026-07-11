import { render, screen } from "@testing-library/react";
import {
  ElementBars,
  elementPercentages,
} from "@/components/tables/ui/ElementBars";

describe("elementPercentages", () => {
  it("normalizes raw values into whole percentages", () => {
    expect(
      elementPercentages({ Fire: 2, Water: 2, Earth: 0, Air: 0 }),
    ).toEqual({ Fire: 50, Water: 50, Earth: 0, Air: 0 });
  });

  it("treats missing and negative values as zero", () => {
    expect(elementPercentages({ Fire: 1, Water: -5 })).toEqual({
      Fire: 100,
      Water: 0,
      Earth: 0,
      Air: 0,
    });
  });
});

describe("ElementBars", () => {
  it("renders one progressbar per element with normalized percentages", () => {
    render(
      <ElementBars values={{ Fire: 0.35, Water: 0.4, Earth: 0.15, Air: 0.1 }} />,
    );
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(4);
    expect(screen.getByRole("progressbar", { name: "Water 40%" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByRole("progressbar", { name: "Fire 35%" })).toHaveAttribute("aria-valuenow", "35");
    expect(screen.getByRole("progressbar", { name: "Earth 15%" })).toHaveAttribute("aria-valuenow", "15");
    expect(screen.getByRole("progressbar", { name: "Air 10%" })).toHaveAttribute("aria-valuenow", "10");
  });

  it("sizes each fill to its percentage", () => {
    render(<ElementBars values={{ Fire: 3, Water: 1, Earth: 0, Air: 0 }} />);
    const fire = screen.getByRole("progressbar", { name: "Fire 75%" });
    expect(fire.firstElementChild).toHaveStyle({ width: "75%" });
  });

  it("shows the tiny mono % labels", () => {
    render(<ElementBars values={{ Fire: 1, Water: 1, Earth: 1, Air: 1 }} />);
    expect(screen.getAllByText("25%")).toHaveLength(4);
  });
});
