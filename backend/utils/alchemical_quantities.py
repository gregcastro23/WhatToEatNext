"""
Alchemical Quantities Calculation - Python Backend

Calculates fundamental alchemical quantities (Spirit, Essence, Matter, Substance)
for recipes and culinary preparations without artificial clamping, preserving
continuous thermodynamic scale.
"""

from typing import Dict, Any
from backend.schemas.planetary import AlchemicalQuantities
from backend.utils.planetary_alchemy import ZODIAC_ELEMENTS

def calculate_alchemical_quantities(
    recipe: Any,
    kinetic_rating: float,
    planetary_hour_ruler: str,
    thermo_rating: float
) -> AlchemicalQuantities:
    """
    Calculates the four fundamental alchemical quantities for a recipe:
    Spirit, Essence, Matter, and Substance without artificial [0, 1] clamps.
    """
    elemental_properties = getattr(recipe, "elementalProperties", None) or getattr(recipe, "elemental_properties", None)
    if not elemental_properties or not isinstance(elemental_properties, dict):
        elemental_properties = {"Fire": 0.25, "Water": 0.25, "Earth": 0.25, "Air": 0.25}

    air_val = float(elemental_properties.get("Air", 0.25))
    fire_val = float(elemental_properties.get("Fire", 0.25))
    water_val = float(elemental_properties.get("Water", 0.25))
    earth_val = float(elemental_properties.get("Earth", 0.25))

    # Planetary Ruler Element Bonus
    ruler_bonus = 0.0
    if planetary_hour_ruler:
        ruler_clean = planetary_hour_ruler.strip().title()
        PLANETARY_RULER_ELEMENTS = {
            "Sun": "Fire", "Venus": "Earth", "Mercury": "Air", "Moon": "Water",
            "Saturn": "Earth", "Jupiter": "Fire", "Mars": "Fire", "Uranus": "Air",
            "Neptune": "Water", "Pluto": "Water"
        }
        if PLANETARY_RULER_ELEMENTS.get(ruler_clean) == "Water":
            ruler_bonus = 0.3

    # Spirit: Kinetic velocity + Fire + Air
    spirit_score = (kinetic_rating * 0.5) + (air_val * 0.25) + (fire_val * 0.25)

    # Essence: Timing & Water affinity + planetary ruler
    essence_score = (water_val * 0.7) + (ruler_bonus * 0.3)

    # Matter: Physical caloric density + Earth
    nutritional_density = 0.5
    profile = getattr(recipe, "nutritional_profile", None)
    if isinstance(profile, dict) and "calories" in profile:
        try:
            nutritional_density = float(profile["calories"]) / 1000.0
        except (ValueError, TypeError):
            nutritional_density = 0.5
    matter_score = (nutritional_density * 0.6) + (earth_val * 0.4)

    # Substance: Thermodynamic stability + Earth + Water
    substance_score = (thermo_rating * 0.5) + (earth_val * 0.25) + (water_val * 0.25)

    # Note: Artificial min(score, 1.0) clamping removed per Unified Physics Model v2 directive
    # to preserve genuine thermodynamic scale and prevent artificial ceiling distortion.

    return AlchemicalQuantities(
        spirit_score=round(spirit_score, 4),
        essence_score=round(essence_score, 4),
        matter_score=round(matter_score, 4),
        substance_score=round(substance_score, 4),
        kinetic_val=round(kinetic_rating, 4),
        thermo_val=round(thermo_rating, 4),
    )
