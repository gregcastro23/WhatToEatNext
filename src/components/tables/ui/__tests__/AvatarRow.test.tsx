import { render, screen } from "@testing-library/react";
import { AvatarRow } from "@/components/tables/ui/AvatarRow";
import type { AvatarPerson } from "@/components/tables/ui/AvatarCircle";

// Real historical-agent roster identities (spec §4.8) — sigil fallbacks.
const ROSTER: AvatarPerson[] = [
  { name: "Leonardo da Vinci", element: "Air" },
  { name: "William Shakespeare", element: "Water" },
  { name: "Nikola Tesla", element: "Fire" },
  { name: "Marie Curie", element: "Earth" },
  { name: "Cleopatra VII", element: "Fire" },
  { name: "Albert Einstein", element: "Air" },
];

it("collapses guests beyond max into a +N overflow cell", () => {
  render(<AvatarRow people={ROSTER} max={3} />);
  expect(screen.getByText("+3")).toBeInTheDocument();
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(screen.getByRole("img", { name: "Leonardo da Vinci" })).toBeInTheDocument();
  expect(screen.queryByRole("img", { name: "Marie Curie" })).not.toBeInTheDocument();
});

it("renders no overflow cell when everyone fits", () => {
  render(<AvatarRow people={ROSTER.slice(0, 3)} max={3} />);
  expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  expect(screen.getAllByRole("img")).toHaveLength(3);
});

it("labels the row with the guest count", () => {
  render(<AvatarRow people={ROSTER} />);
  expect(screen.getByLabelText("6 guests")).toBeInTheDocument();
});
