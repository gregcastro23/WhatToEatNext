import { render, screen } from "@testing-library/react";
import { RsvpChip } from "@/components/tables/ui/RsvpChip";

it("renders the joined state with the green-ish treatment", () => {
  render(<RsvpChip status="joined" />);
  const chip = screen.getByText("joined");
  expect(chip.className).toContain("text-green-300");
  expect(chip.className).toContain("border-green-400/30");
});

it("renders the invited state with the copper treatment", () => {
  render(<RsvpChip status="invited" />);
  const chip = screen.getByText("invited");
  expect(chip.className).toContain("text-alchm-copper-bright");
  expect(chip.className).toContain("border-alchm-copper-bright/40");
});

it("renders the declined state muted", () => {
  render(<RsvpChip status="declined" />);
  const chip = screen.getByText("declined");
  expect(chip.className).toContain("text-alchm-fg-mute");
});

it("uses the LabelXS signature style", () => {
  render(<RsvpChip status="joined" />);
  const chip = screen.getByText("joined");
  expect(chip.className).toContain("text-label-xs");
  expect(chip.className).toContain("uppercase");
});
