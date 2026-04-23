import re

with open('src/contexts/MenuPlannerContext.tsx', 'r') as f:
    code = f.read()

pattern_add = r"""          return \{
            \.\.\.prevMenu,
            meals: updatedMeals,
            updatedAt: new Date\(\),
          \};
        \}\);"""

replacement_add = """          return {
            ...prevMenu,
            meals: updatedMeals,
            updatedAt: new Date(),
          } as any;
        });"""

code = re.sub(pattern_add, replacement_add, code)

with open('src/contexts/MenuPlannerContext.tsx', 'w') as f:
    f.write(code)

print("Fixed types")
