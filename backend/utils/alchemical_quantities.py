
from typing import Dict, Any

def calculate_alchemical_quantities(
    recipe: Any, # Assuming recipe object with elementalProperties
    kinetic_rating: float,
    planetary_hour_ruler: str,
    thermo_rating: float
) -> Dict[str, float]:
    """
    Calculates the four fundamental alchemical quantities: Spirit, Essence, Matter, and Substance.
    """
    elemental_properties = recipe.elementalProperties
    if not elemental_properties:
        elemental_properties = {"Fire": 0.25, "Water": 0.25, "Earth": 0.25, "Air": 0.25} # Default neutral

    # Spirit (Kinetic + Air/Fire)
    # The energetic velocity and transformational potential.
    spirit_score = (kinetic_rating * 0.5) + (elemental_properties.get("Air", 0) * 0.25) + (elemental_properties.get("Fire", 0) * 0.25)

    # Essence (Planetary Hour + Water)
    # The vibrational quality and timing affinity.
    # Assuming planetary_hour_ruler element alignment boosts Essence
    ESSENCE_BONUS = 0.0
    if planetary_hour_ruler:
        PLANETARY_ELEMENTS = {
            "Sun": "Fire", "Venus": "Earth", "Mercury": "Air", "Moon": "Water",
            "Saturn": "Earth", "Jupiter": "Fire", "Mars": "Fire"
        }
        if PLANETARY_ELEMENTS.get(planetary_hour_ruler) == "Water":
            ESSENCE_BONUS = 0.3 # Boost if Water planet rules the hour

    essence_score = (elemental_properties.get("Water", 0) * 0.7) + (ESSENCE_BONUS * 0.3)

    # Matter (Nutritional Density + Earth)
    # The physical body and caloric weight.
    # Nutritional Density is approximated here; in a real scenario, it would come from recipe.nutritional_profile
    nutritional_density = recipe.nutritional_profile.get("calories", 500) / 1000 if recipe.nutritional_profile else 0.5 # Placeholder
    matter_score = (nutritional_density * 0.6) + (elemental_properties.get("Earth", 0) * 0.4)

    # Substance (Thermodynamic Stability + Earth/Water)
    # The enduring structure and heat retention.
    substance_score = (thermo_rating * 0.5) + (elemental_properties.get("Earth", 0) * 0.25) + (elemental_properties.get("Water", 0) * 0.25)

    # Normalize scores to be between 0 and 1, if they exceed 1.0 due to bonuses
    spirit_score = min(spirit_score, 1.0)
    essence_score = min(essence_score, 1.0)
    matter_score = min(matter_score, 1.0)
    substance_score = min(substance_score, 1.0)

    return {
        "spirit_score": spirit_score,
        "essence_score": essence_score,
        "matter_score": matter_score,
        "substance_score": substance_score,
        "kinetic_val": kinetic_rating, # Include kinetic_rating in the return
        "thermo_val": thermo_rating,   # Include thermo_rating in the return
    }
