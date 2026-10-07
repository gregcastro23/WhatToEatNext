/**
 * @jest-environment jsdom
 *
 * The panel's extracted pieces: the pantry shelf (one-tap and bulk add,
 * capped), the toggle-chip selectors (`aria-pressed`), free-text entries, and
 * the collapsible sections that hold them.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { JSX } from "react";
import { RecipeBuilderProvider, useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import CollapsibleSection from "../CollapsibleSection";
import PantryQuickSync, { PANTRY_BULK_ADD } from "../PantryQuickSync";
import AllergySelector from "../selectors/AllergySelector";
import MealTypeSelector from "../selectors/MealTypeSelector";

const mockPantryItems = Array.from({ length: 14 }, (_, i) => ({
  id: `p${i}`,
  name: `item ${i + 1}`,
  quantity: 1,
  unit: "unit",
  category: "pantry",
  addedDate: new Date(2026, 0, 1),
}));

jest.mock("@/hooks/usePantry", () => ({
  usePantry: () => ({ items: mockPantryItems, isLoaded: true }),
}));

function Queued(): JSX.Element {
  const { selectedIngredients, allergies, mealType } = useRecipeBuilder();
  return (
    <output data-testid="queued">
      {[...selectedIngredients.map((i) => i.name), ...allergies, mealType ?? ""].filter(Boolean).join(", ")}
    </output>
  );
}

function renderWithBuilder(ui: JSX.Element): void {
  render(
    <RecipeBuilderProvider>
      {ui}
      <Queued />
    </RecipeBuilderProvider>,
  );
}

beforeEach(() => window.localStorage.clear());

describe("PantryQuickSync", () => {
  it("queues one pantry item per tap and marks it in the crucible", () => {
    renderWithBuilder(<PantryQuickSync />);

    fireEvent.click(screen.getByRole("button", { name: "Add item 1 from pantry" }));

    expect(screen.getByRole("button", { name: "item 1 (in crucible)" })).toBeDisabled();
    expect(screen.getByTestId("queued")).toHaveTextContent(/^item 1$/);
  });

  it(`bulk-adds at most ${PANTRY_BULK_ADD} unqueued items`, () => {
    renderWithBuilder(<PantryQuickSync />);

    fireEvent.click(screen.getByRole("button", { name: `+ Add unqueued (${PANTRY_BULK_ADD})` }));

    expect(screen.getByTestId("queued").textContent?.split(", ")).toHaveLength(PANTRY_BULK_ADD);
    expect(screen.getByRole("button", { name: "+ Add unqueued (4)" })).toBeInTheDocument();
  });
});

describe("selectors", () => {
  it("toggles a meal type with aria-pressed, and pressing it again clears it", () => {
    renderWithBuilder(<MealTypeSelector />);
    const group = screen.getByRole("group", { name: "Meal Type" });
    const dinner = within(group).getByRole("button", { name: "Dinner" });

    fireEvent.click(dinner);
    expect(dinner).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("queued")).toHaveTextContent("Dinner");

    fireEvent.click(dinner);
    expect(dinner).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("queued")).toBeEmptyDOMElement();
  });

  it("adds a custom exclusion once, on Enter, and ignores blanks", () => {
    renderWithBuilder(<AllergySelector />);
    const input = screen.getByRole("textbox", { name: "Custom allergy or exclusion" });
    const add = screen.getByRole("button", { name: "Add" });

    fireEvent.change(input, { target: { value: "   " } });
    expect(add).toBeDisabled();

    fireEvent.change(input, { target: { value: " Sesame " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("");
    fireEvent.change(input, { target: { value: "Sesame" } });
    fireEvent.click(add);

    expect(screen.getByTestId("queued")).toHaveTextContent(/^Sesame$/);
  });
});

describe("CollapsibleSection", () => {
  it("discloses its panel and shows how many selections inside are active", () => {
    render(
      <CollapsibleSection title="Dietary" tone="teal" activeCount={2}>
        <p>inside</p>
      </CollapsibleSection>,
    );
    const trigger = screen.getByRole("button", { name: /Dietary/ });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("2 active");
    expect(screen.queryByText("inside")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("inside")).toBeInTheDocument();
  });
});
