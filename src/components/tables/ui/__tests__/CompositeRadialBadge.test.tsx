import { render, screen } from "@testing-library/react";
import {
  CompositeRadialBadge,
  computeElementArcs,
} from "@/components/tables/ui/CompositeRadialBadge";

describe("computeElementArcs", () => {
  it("splits the circumference proportionally to the element values", () => {
    const arcs = computeElementArcs(
      { Fire: 3, Water: 1, Earth: 0, Air: 0 },
      100,
    );
    const byElement = Object.fromEntries(arcs.map((a) => [a.element, a]));
    expect(byElement.Fire.length).toBeCloseTo(75);
    expect(byElement.Fire.offset).toBeCloseTo(0);
    expect(byElement.Water.length).toBeCloseTo(25);
    expect(byElement.Earth.length).toBeCloseTo(0);
    expect(byElement.Air.length).toBeCloseTo(0);
  });

  it("stacks arc offsets so segments tile the ring end to end", () => {
    const arcs = computeElementArcs(
      { Fire: 1, Water: 1, Earth: 1, Air: 1 },
      100,
    );
    expect(arcs.map((a) => a.offset)).toEqual([0, 25, 50, 75]);
    expect(arcs.map((a) => a.fraction)).toEqual([0.25, 0.25, 0.25, 0.25]);
  });

  it("renders four equal quarters for an all-zero vector", () => {
    const arcs = computeElementArcs({}, 200);
    for (const arc of arcs) {
      expect(arc.length).toBeCloseTo(50);
      expect(arc.fraction).toBeCloseTo(0.25);
    }
  });
});

describe("CompositeRadialBadge composite variant", () => {
  const values = { Fire: 0.1, Water: 0.5, Earth: 0.25, Air: 0.15 };

  it("draws one arc per non-zero element with proportional dash lengths", () => {
    const { container } = render(
      <CompositeRadialBadge values={values} size={48} />,
    );
    const arcs = container.querySelectorAll("circle[data-element]");
    expect(arcs).toHaveLength(4);

    // Reconstruct the geometry the component uses (size 48 → stroke 3).
    const radius = 48 / 2 - 3 / 2;
    const circumference = 2 * Math.PI * radius;
    const water = container.querySelector('circle[data-element="Water"]');
    const [waterLength] = (water?.getAttribute("stroke-dasharray") ?? "").split(
      " ",
    );
    expect(Number(waterLength)).toBeCloseTo(0.5 * circumference, 5);
  });

  it("announces percentages summing to exactly 100 for uneven thirds", () => {
    render(
      <CompositeRadialBadge values={{ Fire: 1, Water: 1, Earth: 1, Air: 0 }} />,
    );
    expect(
      screen.getByRole("img", {
        name: "Elemental composition: Fire 34%, Water 33%, Earth 33%, Air 0%",
      }),
    ).toBeInTheDocument();
  });

  it("announces 25% quarters summing to 100 for an all-zero vector", () => {
    render(<CompositeRadialBadge values={{}} />);
    expect(
      screen.getByRole("img", {
        name: "Elemental composition: Fire 25%, Water 25%, Earth 25%, Air 25%",
      }),
    ).toBeInTheDocument();
  });

  it("skips zero-value elements and labels the mix for screen readers", () => {
    const { container } = render(
      <CompositeRadialBadge
        values={{ Fire: 1, Water: 1, Earth: 0, Air: 0 }}
      />,
    );
    expect(container.querySelectorAll("circle[data-element]")).toHaveLength(2);
    expect(
      screen.getByRole("img", { name: /Fire 50%, Water 50%/ }),
    ).toBeInTheDocument();
  });
});

describe("CompositeRadialBadge compatibility variant", () => {
  it("exposes the match percentage as a progressbar with a % label", () => {
    render(<CompositeRadialBadge variant="compatibility" value={0.87} />);
    const ring = screen.getByRole("progressbar");
    expect(ring).toHaveAttribute("aria-valuenow", "87");
    expect(ring).toHaveAttribute("aria-valuemin", "0");
    expect(ring).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("87%")).toBeInTheDocument();
  });

  it("clamps out-of-range values", () => {
    render(<CompositeRadialBadge variant="compatibility" value={1.4} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
  });
});
