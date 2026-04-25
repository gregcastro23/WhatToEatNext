import re

with open('src/contexts/MenuPlannerContext.tsx', 'r') as f:
    code = f.read()

# Pattern for addMealToSlot
pattern = r"""        const updatedMeals = currentMenu\.meals\.map\(\(meal\) => \{
          if \(meal\.dayOfWeek === dayOfWeek && meal\.mealType === mealType\) \{
            return \{
              \.\.\.meal,
              recipe,
              servings,
              updatedAt: new Date\(\),
            \};
          \}
          return meal;
        \}\);

        const updatedMenu = \{
          \.\.\.currentMenu,
          meals: updatedMeals,
          updatedAt: new Date\(\),
        \};

        setCurrentMenu\((?:updatedMenu|updatedMenu as any)\);"""

replacement = """        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.dayOfWeek === dayOfWeek && meal.mealType === mealType) {
              return {
                ...meal,
                recipe,
                servings,
                updatedAt: new Date(),
              };
            }
            return meal;
          });

          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          };
        });"""

code = re.sub(pattern, replacement, code)

# Let's fix moveMeal
pattern_move = r"""        const updatedMeals = currentMenu\.meals\.map\(\(meal\) => \{
          if \(meal\.id === targetMealSlotId\) \{
            // Add recipe to target slot
            return \{
              \.\.\.meal,
              recipe: sourceMeal\.recipe,
              servings: sourceMeal\.servings,
              updatedAt: new Date\(\),
            \};
          \}
          if \(meal\.id === sourceMealSlotId\) \{
            // Clear source slot
            const \{ recipe: _recipe, \.\.\.mealWithoutRecipe \} = meal;
            return \{
              \.\.\.mealWithoutRecipe,
              updatedAt: new Date\(\),
            \};
          \}
          return meal;
        \}\);

        const updatedMenu = \{
          \.\.\.currentMenu,
          meals: updatedMeals,
          updatedAt: new Date\(\),
        \};

        setCurrentMenu\(updatedMenu\);"""

replacement_move = """        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.id === targetMealSlotId) {
              // Add recipe to target slot
              return {
                ...meal,
                recipe: sourceMeal.recipe,
                servings: sourceMeal.servings,
                updatedAt: new Date(),
              };
            }
            if (meal.id === sourceMealSlotId) {
              // Clear source slot
              const { recipe: _recipe, ...mealWithoutRecipe } = meal;
              return {
                ...mealWithoutRecipe,
                updatedAt: new Date(),
              };
            }
            return meal;
          });

          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          };
        });"""

code = re.sub(pattern_move, replacement_move, code)

# Let's fix removeMealFromSlot
pattern_remove = r"""        const updatedMeals = currentMenu\.meals\.map\(\(meal\) => \{
          if \(meal\.id === mealSlotId\) \{
            const \{ recipe: _recipe, \.\.\.mealWithoutRecipe \} = meal;
            return \{
              \.\.\.mealWithoutRecipe,
              updatedAt: new Date\(\),
            \};
          \}
          return meal;
        \}\);

        const updatedMenu = \{
          \.\.\.currentMenu,
          meals: updatedMeals,
          updatedAt: new Date\(\),
        \};

        setCurrentMenu\(updatedMenu\);"""

replacement_remove = """        setCurrentMenu((prevMenu) => {
          if (!prevMenu) return prevMenu;
          const updatedMeals = prevMenu.meals.map((meal) => {
            if (meal.id === mealSlotId) {
              const { recipe: _recipe, ...mealWithoutRecipe } = meal;
              return {
                ...mealWithoutRecipe,
                updatedAt: new Date(),
              };
            }
            return meal;
          });

          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          };
        });"""

code = re.sub(pattern_remove, replacement_remove, code)

with open('src/contexts/MenuPlannerContext.tsx', 'w') as f:
    f.write(code)

print("Done")
