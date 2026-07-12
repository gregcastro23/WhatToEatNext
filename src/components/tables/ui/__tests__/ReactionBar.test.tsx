import { fireEvent, render, screen } from "@testing-library/react";
import { ReactionBar } from "@/components/tables/ui/ReactionBar";

it("always renders all five reactions with their counts", () => {
  render(
    <ReactionBar counts={{ spark: 12, Fire: 4, Water: 9, Earth: 2, Air: 5 }} />,
  );
  const buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(5);
  expect(screen.getByRole("button", { name: "React with a spark" })).toHaveTextContent("12");
  expect(screen.getByRole("button", { name: "React with Fire" })).toHaveTextContent("4");
  expect(screen.getByRole("button", { name: "React with Water" })).toHaveTextContent("9");
  expect(screen.getByRole("button", { name: "React with Earth" })).toHaveTextContent("2");
  expect(screen.getByRole("button", { name: "React with Air" })).toHaveTextContent("5");
});

it("renders all five even when no counts are provided", () => {
  render(<ReactionBar />);
  expect(screen.getAllByRole("button")).toHaveLength(5);
});

it("fires onReact with the pressed kind", () => {
  const onReact = jest.fn();
  render(<ReactionBar onReact={onReact} />);
  fireEvent.click(screen.getByRole("button", { name: "React with Water" }));
  expect(onReact).toHaveBeenCalledWith("Water");
  fireEvent.click(screen.getByRole("button", { name: "React with a spark" }));
  expect(onReact).toHaveBeenCalledWith("spark");
});

it("marks the viewer's reactions with aria-pressed", () => {
  render(<ReactionBar active={["Water", "spark"]} />);
  expect(screen.getByRole("button", { name: "React with Water" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "React with a spark" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "React with Fire" })).toHaveAttribute("aria-pressed", "false");
});
