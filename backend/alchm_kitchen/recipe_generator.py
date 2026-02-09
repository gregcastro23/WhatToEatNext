from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any

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
