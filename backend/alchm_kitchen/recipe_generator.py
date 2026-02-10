from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
from database.models import Ingredient, Recipe

def calculate_alchemical_scores(recipe_id: Optional[str], db: Session, metrics: Optional[Dict[str, float]] = None) -> Dict[str, float]:
    """
    Calculate the 6-metric alchemical scores based on nutritional metrics.
    If metrics are provided, use them. Otherwise, aggregate from recipe ingredients.
    """
    # Initialize values
    sodium_val = 0.0
    fiber_val = 0.0
    potassium_val = 0.0
    water_content_val = 0.0
    vitamin_c_val = 0.0
    iron_val = 0.0

    if metrics:
        sodium_val = metrics.get('sodium', 0.0)
        fiber_val = metrics.get('fiber', 0.0)
        potassium_val = metrics.get('potassium', 0.0)
        water_content_val = metrics.get('water_content', 0.0)
        vitamin_c_val = metrics.get('vitamin_c', 0.0)
        iron_val = metrics.get('iron', 0.0)
    elif recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if not recipe or not recipe.ingredients:
            return {}

        for ri in recipe.ingredients:
            ing = ri.ingredient
            qty = ri.quantity  # primitive weighting by quantity if needed, but for now just summing or using profiles
            # Assuming 100g base for nutritional maps if simple sum, otherwise we need unit conversion logic.
            # For this task, we'll assume linear accumulation from ingredient profiles if available.

            # Helper to get val
            def get_val(key):
                if ing.nutritional_profile and key in ing.nutritional_profile:
                    return float(ing.nutritional_profile[key])
                return 0.0

            sodium_val += get_val('sodium')
            fiber_val += (float(ing.fiber) if ing.fiber else 0.0)
            potassium_val += get_val('potassium')
            water_content_val += get_val('water_content')
            vitamin_c_val += get_val('vitamin_c')
            iron_val += get_val('iron')

    # Mapping Logic (Elemental Synthesis)
    # Fire (Spirit) - Metabolic Heat / Blood Vitality
    spirit_fire = (vitamin_c_val * 0.1) + (iron_val * 2.0)  # Weights arbitrated for now

    # Water (Essence) - Hydration / Aqueous Balance
    essence_water = (water_content_val * 0.05) + (potassium_val * 0.02)

    # Earth (Matter) - Structural Density
    matter_earth = fiber_val * 2.0

    # Earth/Water (Substance) - Retention / Physical Presence
    substance_earth_water = sodium_val * 0.05

    return {
        "spirit_fire": spirit_fire,
        "essence_water": essence_water,
        "matter_earth": matter_earth,
        "substance_earth_water": substance_earth_water,
        "raw_metrics": {
            "sodium": sodium_val,
            "fiber": fiber_val,
            "potassium": potassium_val,
            "water_content": water_content_val,
            "vitamin_c": vitamin_c_val,
            "iron": iron_val
        }
    }


def get_recipes_by_sign_affinity(sign: str, db: Session, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Helper function to get recipes based on zodiac affinity.
    """
    query = text("""
        SELECT DISTINCT
            r.id, r.name, r.description, r.cuisine,
            AVG(za.affinity_strength) as avg_affinity,
            COUNT(za.id) as ingredient_matches
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.id
        JOIN zodiac_affinities za ON za.entity_id = i.id
            AND za.entity_type = 'ingredient'
            AND za.zodiac_sign = :zodiac_sign
            AND za.affinity_strength >= 0.6
        WHERE r.is_public = true
        GROUP BY r.id, r.name, r.description, r.cuisine
        ORDER BY avg_affinity DESC, ingredient_matches DESC
        LIMIT :limit
    """)

    result = db.execute(query, {"zodiac_sign": sign, "limit": limit}).fetchall()

    recommendations = []
    for row in result:
        # Check if row is a tuple or object; SQLAlchemy returns Row objects which act like tuples/mappings
        # We can access by index or name.
        recipe_id, name, description, cuisine, avg_affinity, ingredient_matches = row

        recommendations.append({
            "recipe_id": str(recipe_id),
            "name": name,
            "description": description,
            "cuisine": cuisine,
            "zodiac_affinity_score": float(avg_affinity),
            "matching_ingredients": ingredient_matches,
            "zodiac_sign": sign
        })

    return recommendations

def get_astrological_recipes(
    sun_sign: str,
    moon_sign: str,
    ascendant_sign: str,
    db: Session
) -> Dict[str, Any]:
    """
    Get recipes based on Sun, Moon, and Ascendant signs.
    """

    # We can fetch recipes for each placement.
    # Ascendant usually dictates preferences/body (physical), Sun (personality/ego), Moon (emotional/comfort).

    # Let's get a few for each
    ascendant_recipes = get_recipes_by_sign_affinity(ascendant_sign, db, limit=3)
    sun_recipes = get_recipes_by_sign_affinity(sun_sign, db, limit=3)
    moon_recipes = get_recipes_by_sign_affinity(moon_sign, db, limit=3)

    return {
        "ascendant": {
            "sign": ascendant_sign,
            "recipes": ascendant_recipes,
            "description": "Recipes aligning with your physical vitality and Ascendant sign."
        },
        "sun": {
            "sign": sun_sign,
            "recipes": sun_recipes,
            "description": "Recipes that resonate with your core essence and Sun sign."
        },
        "moon": {
            "sign": moon_sign,
            "recipes": moon_recipes,
            "description": "Comfort foods and recipes that nurture your emotional Moon sign."
        }
    }
