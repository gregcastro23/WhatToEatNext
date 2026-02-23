from datetime import datetime
import math
import sys
import os

# ---------------------------------------------------------------------------
# Allow the module to be imported whether the package root is on sys.path or
# whether the file is executed directly (e.g. python -m pytest).
# ---------------------------------------------------------------------------
try:
    from backend.utils.planetary_weights import normalize_planet_weight, PLANET_MASS_RELATIVE
except ImportError:
    # Running from inside the backend directory
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from backend.utils.planetary_weights import normalize_planet_weight, PLANET_MASS_RELATIVE


def get_current_lunar_phase():
    """Calculates the approximate current lunar phase name and illumination."""
    known_new_moon = datetime(2023, 1, 21, 20, 53)
    now_utc = datetime.utcnow()
    synodic_period = 29.53058867
    days_since_new_moon = (now_utc - known_new_moon).total_seconds() / 86400
    phase_position = (days_since_new_moon / synodic_period) % 1.0
    illumination = 0.5 * (1 - math.cos(2 * math.pi * phase_position))

    phase_name = "Unknown"
    if phase_position < 0.03 or phase_position > 0.97:
        phase_name = "New Moon"
    elif 0.22 < phase_position < 0.28:
        phase_name = "First Quarter"
    elif 0.47 < phase_position < 0.53:
        phase_name = "Full Moon"
    elif 0.72 < phase_position < 0.78:
        phase_name = "Last Quarter"
    elif phase_position < 0.25:
        phase_name = "Waxing Crescent"
    elif phase_position < 0.5:
        phase_name = "Waxing Gibbous"
    elif phase_position < 0.75:
        phase_name = "Waning Gibbous"
    else:
        phase_name = "Waning Crescent"

    return {
        "phase_name": phase_name,
        "illumination_fraction": round(illumination, 3)
    }


# ---------------------------------------------------------------------------
# Lunar phase → boosted ingredient categories (per GEMINI.md spec)
# ---------------------------------------------------------------------------
LUNAR_PHASE_BOOSTS: dict = {
    "New Moon":       {"Seeds", "Sprouts"},
    "Waxing Crescent": {"Leafy Greens"},
    "First Quarter":  {"Vegetables"},
    "Waxing Gibbous": {"Fruits"},
    "Full Moon":      {"Grains", "Flowers"},
    "Waning Gibbous": {"Roots"},
    "Last Quarter":   {"Fungi"},
    "Waning Crescent": {"Herbs", "Spices"},
}


def get_lunar_modifier(phase_name: str, ingredient_category: str, planet: str = "Moon") -> float:
    """Return the lunar modifier for a given phase, ingredient category, and ruling planet.

    The base modifier is determined by whether the current lunar phase boosts
    the ingredient's category (per GEMINI.md).  The modifier is then scaled by
    the ruling planet's log-normalized physical mass so that a recipe ruled by
    the Sun (mass weight ≈ 1.0) receives a larger boost than one ruled by
    Mercury (mass weight ≈ 0.31).

    A floor of 0.5× planet-weight scaling ensures no planet drives the
    modifier to zero.

    Parameters
    ----------
    phase_name:
        Current lunar phase name (e.g. ``"Full Moon"``).
    ingredient_category:
        Ingredient's lunar category (e.g. ``"Grains"``).
    planet:
        The ruling planet of the recipe/ingredient.  Defaults to ``"Moon"``.

    Returns
    -------
    float
        Combined lunar modifier (>= 1.0 when phase boosts the category).
    """
    # Base modifier from phase ↔ category match
    boosted_categories = LUNAR_PHASE_BOOSTS.get(phase_name, set())
    base_modifier = 1.20 if ingredient_category in boosted_categories else 1.0

    # Legacy secondary boosts (kept for backwards-compatibility)
    if phase_name == "New Moon" and ingredient_category == "Root/Grounding":
        base_modifier = max(base_modifier, 1.20)
    elif phase_name == "Full Moon" and ingredient_category == "High-Water/Cooling":
        base_modifier = max(base_modifier, 1.20)
    elif "Waning" in phase_name and ingredient_category == "Detoxifying":
        base_modifier = max(base_modifier, 1.10)

    # Scale by actual planetary mass (relative-to-Earth), normalized inline via log₁₀.
    # Floor at 0.5 so even the lightest planet still contributes.
    rel_mass = PLANET_MASS_RELATIVE.get(planet, 1.0)
    mass_scale = 0.5 + 0.5 * normalize_planet_weight(rel_mass)

    return round(base_modifier * mass_scale, 4)
