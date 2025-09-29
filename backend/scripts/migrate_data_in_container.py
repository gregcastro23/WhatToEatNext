#!/usr/bin/env python3
"""
Data Migration Script - Run inside PostgreSQL container
Migrates sample data to the database from within the container
"""

import sys
import os
import json
from pathlib import Path

# Add the backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Import database modules
from database import get_db_session, config
from database.models import (
    Ingredient, Recipe, ElementalProperties, PlanetaryInfluence,
    RecipeIngredient
)


def load_sample_data(data_type: str) -> list:
    """Load sample data from JSON files."""
    sample_dir = backend_dir / "data" / "sample"
    data_file = sample_dir / f"{data_type}.json"

    if not data_file.exists():
        print(f"❌ Sample data file not found: {data_file}")
        return []

    try:
        with open(data_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Failed to load {data_type} data: {e}")
        return []


def migrate_ingredients():
    """Migrate ingredient sample data."""
    print("🌱 Migrating ingredient data...")

    ingredients_data = load_sample_data("ingredients")
    if not ingredients_data:
        return False

    with get_db_session() as session:
        success_count = 0

        for ingredient_data in ingredients_data:
            try:
                name = ingredient_data['name']

                # Check if ingredient already exists
                existing = session.query(Ingredient).filter(Ingredient.name == name).first()
                if existing:
                    print(f"⚠️  Ingredient '{name}' already exists, skipping")
                    continue

                # Create ingredient
                ingredient = Ingredient(
                    name=name,
                    common_name=ingredient_data.get('common_name'),
                    scientific_name=ingredient_data.get('scientific_name'),
                    category=ingredient_data.get('category', 'unknown'),
                    subcategory=ingredient_data.get('subcategory'),
                    description=ingredient_data.get('description'),
                    calories=ingredient_data.get('calories'),
                    protein=ingredient_data.get('protein'),
                    carbohydrates=ingredient_data.get('carbohydrates'),
                    fat=ingredient_data.get('fat'),
                    fiber=ingredient_data.get('fiber'),
                    sugar=ingredient_data.get('sugar'),
                    flavor_profile=ingredient_data.get('flavor_profile', {}),
                    preparation_methods=ingredient_data.get('preparation_methods', []),
                    is_active=ingredient_data.get('is_active', True),
                    confidence_score=ingredient_data.get('confidence_score', 0.8)
                )

                session.add(ingredient)
                session.flush()  # Get the ID

                # Migrate elemental properties
                elemental_data = ingredient_data.get('elemental_properties', {})
                if elemental_data:
                    elemental = ElementalProperties(
                        entity_type='ingredient',
                        entity_id=str(ingredient.id),
                        fire=elemental_data.get('fire', 0.25),
                        water=elemental_data.get('water', 0.25),
                        earth=elemental_data.get('earth', 0.25),
                        air=elemental_data.get('air', 0.25),
                        calculation_method='imported'
                    )
                    session.add(elemental)

                # Migrate planetary influences
                astro_data = ingredient_data.get('astrological_profile', {})
                ruling_planets = astro_data.get('ruling_planets', [])
                for planet in ruling_planets:
                    influence = PlanetaryInfluence(
                        entity_type='ingredient',
                        entity_id=str(ingredient.id),
                        planet=planet,
                        influence_strength=0.8,
                        is_primary=(planet == ruling_planets[0])
                    )
                    session.add(influence)

                session.commit()
                success_count += 1
                print(f"✅ Migrated ingredient: {name}")

            except Exception as e:
                print(f"❌ Failed to migrate ingredient {ingredient_data.get('name', 'unknown')}: {e}")
                session.rollback()

    print(f"📊 Migrated {success_count} ingredients")
    return success_count > 0


def migrate_recipes():
    """Migrate recipe sample data."""
    print("🍳 Migrating recipe data...")

    recipes_data = load_sample_data("recipes")
    if not recipes_data:
        return False

    with get_db_session() as session:
        success_count = 0

        for recipe_data in recipes_data:
            try:
                name = recipe_data['name']

                # Check if recipe already exists
                existing = session.query(Recipe).filter(Recipe.name == name).first()
                if existing:
                    print(f"⚠️  Recipe '{name}' already exists, skipping")
                    continue

                # Create recipe
                recipe = Recipe(
                    name=name,
                    description=recipe_data.get('description'),
                    cuisine=recipe_data.get('cuisine', 'General'),
                    category=recipe_data.get('category', 'main'),
                    instructions=recipe_data.get('instructions', {}),
                    prep_time_minutes=recipe_data.get('prep_time_minutes', 30),
                    cook_time_minutes=recipe_data.get('cook_time_minutes', 30),
                    servings=recipe_data.get('servings', 4),
                    difficulty_level=recipe_data.get('difficulty_level', 2),
                    dietary_tags=recipe_data.get('dietary_tags', []),
                    allergens=recipe_data.get('allergens', []),
                    is_public=recipe_data.get('is_public', True),
                    is_verified=recipe_data.get('is_verified', False)
                )

                session.add(recipe)
                session.flush()  # Get the ID

                # Migrate recipe ingredients
                ingredients_list = recipe_data.get('ingredients', [])
                for i, ingredient_data in enumerate(ingredients_list):
                    ingredient_name = ingredient_data.get('name', '')

                    # Find ingredient by name
                    ingredient = session.query(Ingredient).filter(
                        Ingredient.name.ilike(ingredient_name)
                    ).first()

                    if ingredient:
                        recipe_ingredient = RecipeIngredient(
                            recipe_id=str(recipe.id),
                            ingredient_id=str(ingredient.id),
                            quantity=ingredient_data.get('amount', 1),
                            unit=ingredient_data.get('unit', 'piece'),
                            preparation_notes=ingredient_data.get('preparation'),
                            is_optional=ingredient_data.get('optional', False),
                            order_index=i
                        )
                        session.add(recipe_ingredient)

                session.commit()
                success_count += 1
                print(f"✅ Migrated recipe: {name}")

            except Exception as e:
                print(f"❌ Failed to migrate recipe {recipe_data.get('name', 'unknown')}: {e}")
                session.rollback()

    print(f"📊 Migrated {success_count} recipes")
    return success_count > 0


def main():
    """Main migration function."""
    print("🚀 Starting data migration in container...")
    print("=" * 50)

    # Test database connection
    try:
        with get_db_session() as session:
            result = session.execute("SELECT 1 as test").fetchone()
            print("✅ Database connection successful")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

    # Run migrations
    results = []

    if "--ingredients" in sys.argv or "--all" in sys.argv:
        results.append(("Ingredients", migrate_ingredients()))

    if "--recipes" in sys.argv or "--all" in sys.argv:
        results.append(("Recipes", migrate_recipes()))

    # Default to all if no specific component requested
    if not any(arg in ["--ingredients", "--recipes", "--all"] for arg in sys.argv):
        results.append(("Ingredients", migrate_ingredients()))
        results.append(("Recipes", migrate_recipes()))

    print("\n" + "=" * 50)

    success_count = sum(1 for _, success in results if success)
    total_count = len(results)

    for component, success in results:
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{component}: {status}")

    print(f"\n📊 Migration Results: {success_count}/{total_count} components successful")

    if success_count == total_count:
        print("🎉 Data migration completed successfully!")
        print("\n📝 Next steps:")
        print("1. Verify data integrity")
        print("2. Test API endpoints")
        print("3. Update frontend services")
        return True
    else:
        print("⚠️  Some migrations failed")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
