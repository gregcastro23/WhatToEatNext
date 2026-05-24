import json
import os
import sys

# Add root directory to path to import generate_markdown
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from scripts.extract_recipes_llm import generate_markdown

def main():
    db_file = "recipes_database.json"
    if not os.path.exists(db_file):
        print(f"Error: {db_file} not found.")
        return

    with open(db_file, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    updated = False
    for recipe in recipes:
        if recipe["title"] == "Tempeh Reuben Sandwich" and not recipe.get("instructions"):
            recipe["instructions"] = [
                "Assemble the sandwich by spreading avocado spread or Nayonaise on sliced Spelt Bread.",
                "Layer with Fried Tempeh, sliced tomato, mustard, ketchup, and sauerkraut.",
                "Garnish with pickles and serve immediately."
            ]
            print("Successfully populated instructions for Tempeh Reuben Sandwich.")
            updated = True
        
        elif recipe["title"] == "CHICKPEA CRÊPES WITH CURRIED CHICKPEAS, VEGETABLES & MANGO SAUCE" and not recipe.get("instructions"):
            recipe["instructions"] = [
                "Place a warm Chickpea Crêpe flat on a clean surface or plate.",
                "Spoon a generous portion of the Curried Chickpea and vegetable filling down the center of the crêpe.",
                "Fold or roll the crêpe to neatly enclose the filling.",
                "Garnish with Mango Sauce drizzle and fresh herbs. Serve warm."
            ]
            print("Successfully populated instructions for Curried Chickpea Crêpes.")
            updated = True
        
        elif recipe["title"] == "SCRAMBLED EGGS" and not recipe.get("ingredients"):
            recipe["ingredients"] = [
                "Eggs",
                "Salt",
                "White pepper",
                "Butter",
                "Milk or cream (optional)"
            ]
            print("Successfully populated ingredients for Scrambled Eggs.")
            updated = True

    if updated:
        with open(db_file, "w", encoding="utf-8") as f:
            json.dump(recipes, f, indent=2)
        print("Updated recipes_database.json successfully.")

        print("Regenerating Markdown files...")
        generate_markdown(recipes, output_dir="HSCArecipes")
        print("Markdown files successfully regenerated.")
    else:
        print("No updates needed.")

if __name__ == "__main__":
    main()
