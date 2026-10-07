/**
 * The builder's selections → the crucible's chip rows, in display order.
 * A row is present only when it has at least one chip.
 *
 * @file src/components/recipe-builder/crucible/queueGroups.ts
 */
import type { RecipeBuilderContextType } from "@/contexts/RecipeBuilderContext";
import type { QueueChip, QueueGroup } from "./QueueChipGroup";

function chipsFor(values: readonly string[], remove: (value: string) => void): QueueChip[] {
  return values.map((value) => ({
    key: value,
    label: value,
    removeLabel: `Remove ${value}`,
    onRemove: () => remove(value),
  }));
}

export function buildQueueGroups(builder: RecipeBuilderContextType): QueueGroup[] {
  const { mealType, setMealType } = builder;
  const groups: QueueGroup[] = [
    {
      title: "Meal Target",
      tone: "purple",
      icon: "🍽️",
      chips: mealType
        ? [{ key: mealType, label: mealType, removeLabel: "Clear meal type", onRemove: () => setMealType(null) }]
        : [],
    },
    {
      title: "Flavor Notes",
      tone: "pink",
      capitalize: true,
      chips: builder.flavors.map((flavor) => ({
        key: flavor,
        label: flavor,
        removeLabel: `Remove ${flavor}`,
        onRemove: () => builder.removeFlavor(flavor),
      })),
    },
    { title: "Dietary Regimens", tone: "teal", chips: chipsFor(builder.dietaryPreferences, builder.removeDietaryPreference) },
    { title: "Exclusions", tone: "red", icon: "🚫", chips: chipsFor(builder.allergies, builder.removeAllergy) },
    {
      title: "Ingredients",
      tone: "emerald",
      icon: "🌿",
      chips: chipsFor(
        builder.selectedIngredients.map((ingredient) => ingredient.name),
        builder.removeIngredient,
      ),
    },
    { title: "Cuisines", tone: "purple", icon: "🌍", chips: chipsFor(builder.selectedCuisines, builder.removeCuisine) },
    { title: "Techniques", tone: "amber", icon: "🔥", chips: chipsFor(builder.selectedCookingMethods, builder.removeCookingMethod) },
  ];
  return groups.filter((group) => group.chips.length > 0);
}
