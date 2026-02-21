import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add backend directory to path so we can resolve imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import Base and models to ensure they are registered
from database.models import (
    Base, Recipe, Ingredient, RecipeIngredient, ZodiacAffinity,
    ElementalProperties
)

# Connect to localhost:5434 (exposed port for host machine access)
DATABASE_URL = "postgresql://user:password@localhost:5434/whattoeatnext"

def init_db():
    print(f"Connecting to {DATABASE_URL}...")
    try:
        engine = create_engine(DATABASE_URL)
        print("Connected to database.")

        # Enable uuid-ossp extension
        with engine.connect() as conn:
            conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
            conn.commit()
            print("Enabled uuid-ossp extension.")
    except Exception as e:
        print(f"Failed to connect or enable extension: {e}")
        return

    print("Creating tables...")
    try:
        # Create all tables defined in models.py
        Base.metadata.create_all(engine)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Failed to create tables: {e}")
        return

    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        seed_data(session)
        session.commit()
        print("Seeding complete.")
    except Exception as e:
        session.rollback()
        print(f"Seeding failed: {e}")
        raise
    finally:
        session.close()

def seed_data(session):
    # Check if recipes already exist
    if session.query(Recipe).count() > 0:
        print("Data already exists. Skipping seed.")
        return

    print("Seeding recipes...")

    # 1. Libra Recipe: Balanced Berry Salad
    rec_libra = Recipe(
        name="Balanced Berry Salad",
        description="A harmonious mix of greens and berries to restore equilibrium, perfect for Libra.",
        cuisine="American",
        category="Salad",
        instructions={"steps": ["Wash greens", "Mix berries", "Toss with balsamic vinaigrette"]},
        prep_time_minutes=15,
        cook_time_minutes=0,
        servings=2,
        difficulty_level=1,
        dietary_tags=["Vegetarian", "Gluten Free"],
        is_public=True
    )
    session.add(rec_libra)
    session.flush() # get ID

    # Add elemental properties for recipe
    session.add(ElementalProperties(
        entity_type='recipe',
        entity_id=rec_libra.id,
        fire=0.1, water=0.3, earth=0.2, air=0.4 # High Air for Libra
    ))

    # Create ingredients for Libra recipe
    ing_strawberry = Ingredient(name="Strawberry", category="Fruit", flavor_profile={"sweet": 0.8})
    ing_spinach = Ingredient(name="Spinach", category="Vegetable", flavor_profile={"earthy": 0.5})
    session.add_all([ing_strawberry, ing_spinach])
    session.flush()

    # Link ingredients
    session.add(RecipeIngredient(recipe_id=rec_libra.id, ingredient_id=ing_strawberry.id, quantity=100, unit="g"))
    session.add(RecipeIngredient(recipe_id=rec_libra.id, ingredient_id=ing_spinach.id, quantity=50, unit="g"))

    # Add Zodiac affinity
    session.add(ZodiacAffinity(entity_type='ingredient', entity_id=ing_strawberry.id, zodiac_sign='Libra', affinity_strength=0.9))

    # 2. Scorpio Recipe: Spicy Dark Chocolate Mousse
    rec_scorpio = Recipe(
        name="Spicy Dark Chocolate Mousse",
        description="Intense dark chocolate with a kick of chili, embodying Scorpio's depth.",
        cuisine="French",
        category="Dessert",
        instructions={"steps": ["Melt chocolate", "Whip cream", "Fold in chili powder"]},
        prep_time_minutes=20,
        cook_time_minutes=10,
        servings=4,
        difficulty_level=3,
        dietary_tags=["Vegetarian", "Gluten Free"],
        is_public=True
    )
    session.add(rec_scorpio)
    session.flush()

    session.add(ElementalProperties(
        entity_type='recipe',
        entity_id=rec_scorpio.id,
        fire=0.3, water=0.5, earth=0.2, air=0.0 # High Water for Scorpio
    ))

    ing_choc = Ingredient(name="Dark Chocolate", category="Sweets", flavor_profile={"bitter": 0.6, "sweet": 0.4})
    ing_chili = Ingredient(name="Chili Powder", category="Spice", flavor_profile={"spicy": 0.9})
    session.add_all([ing_choc, ing_chili])
    session.flush()

    session.add(RecipeIngredient(recipe_id=rec_scorpio.id, ingredient_id=ing_choc.id, quantity=200, unit="g"))
    session.add(RecipeIngredient(recipe_id=rec_scorpio.id, ingredient_id=ing_chili.id, quantity=5, unit="g"))

    session.add(ZodiacAffinity(entity_type='ingredient', entity_id=ing_choc.id, zodiac_sign='Scorpio', affinity_strength=0.95))

    # 3. Leo Recipe: Golden Sunflower Risotto
    rec_leo = Recipe(
        name="Golden Sunflower Risotto",
        description="Creamy saffron risotto radiating golden hues, fit for a Leo king.",
        cuisine="Italian",
        category="Main Course",
        instructions={"steps": ["Sauté onions", "Toast rice", "Add saffron stock gradually"]},
        prep_time_minutes=10,
        cook_time_minutes=30,
        servings=4,
        difficulty_level=4,
        dietary_tags=["Gluten Free"],
        is_public=True
    )
    session.add(rec_leo)
    session.flush()

    session.add(ElementalProperties(
        entity_type='recipe',
        entity_id=rec_leo.id,
        fire=0.6, water=0.1, earth=0.2, air=0.1 # High Fire for Leo
    ))

    ing_rice = Ingredient(name="Arborio Rice", category="Grain", flavor_profile={"neutral": 1.0})
    ing_saffron = Ingredient(name="Saffron", category="Spice", flavor_profile={"floral": 0.8})
    session.add_all([ing_rice, ing_saffron])
    session.flush()

    session.add(RecipeIngredient(recipe_id=rec_leo.id, ingredient_id=ing_rice.id, quantity=300, unit="g"))
    session.add(RecipeIngredient(recipe_id=rec_leo.id, ingredient_id=ing_saffron.id, quantity=0.1, unit="g"))

    session.add(ZodiacAffinity(entity_type='ingredient', entity_id=ing_saffron.id, zodiac_sign='Leo', affinity_strength=1.0))

if __name__ == "__main__":
    init_db()
