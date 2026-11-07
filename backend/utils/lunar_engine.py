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


# `ingredients.category` is free text (VARCHAR(100)) and production's values are lowercase and
# mostly singular ('fruit'; vinegars and meats are plural, and the separators differ), while the
# table above names capitalized, plural groups, so none of the 401 production ingredients matched
# any phase. Measured 2026-11-03 (SELECT category, count(*) FROM ingredients GROUP BY 1):
# fruit 90, vegetable 64, grain 49, oil 48, culinary_herb 46, spice 43, protein 37, vinegars 14,
# seasoning 6, meats 1, medicinal herb 1, mineral salt 1, salt 1.
#
# This maps each production category that has a counterpart in the table to it, by the names
# alone: the same word, singular to plural, and both herb categories to "Herbs". A category not
# listed (oil, protein, vinegars, seasoning, meats, mineral salt, salt) has no counterpart and is
# boosted by no phase. The table's Seeds, Sprouts, Leafy Greens, Flowers, Roots and Fungi have no
# production category. Subcategories exist for a few (leafy_green 4 ingredients, root_vegetable 3,
# fungi 2) but would make an ingredient a member of two groups; that is not decided here.
INGREDIENT_CATEGORY_TO_LUNAR: dict = {
    "fruit": "Fruits",
    "vegetable": "Vegetables",
    "grain": "Grains",
    "spice": "Spices",
    "culinary_herb": "Herbs",
    "medicinal herb": "Herbs",
}


def lunar_category(ingredient_category):
    """The table category an ingredient category stands for.

    A production spelling in INGREDIENT_CATEGORY_TO_LUNAR matches whatever its case and
    surrounding whitespace. Anything else is returned as it is: a table name included, so a table
    name has to match exactly ('fruits' is not 'Fruits'), and so are an unlisted category and a
    non-string.
    """
    if isinstance(ingredient_category, str):
        return INGREDIENT_CATEGORY_TO_LUNAR.get(ingredient_category.strip().lower(), ingredient_category)
    return ingredient_category


def get_lunar_modifier(phase_name: str, ingredient_category: str, planet: str = "Moon") -> float:
    """Return the lunar modifier for a given phase, ingredient category, and ruling planet.

    The base modifier is determined by whether the current lunar phase boosts
    the ingredient's category (per GEMINI.md; docs/GEMINI.md has no lunar table,
    no +20% and no floor, so the table above, its +20% and the floor stand as the
    code had them).  The ruling planet's log-normalized physical mass then scales
    the BOOST (the part above 1.0), not the whole modifier, so a recipe ruled by
    the Sun (mass weight 1.0) receives a larger boost than one ruled by Mercury
    (mass weight 0.17).

    A floor of 0.5× planet-weight scaling means even the lightest planet keeps
    half of the boost.  A category the phase does not boost gets exactly 1.0 for
    every planet: the planet changes what a boost is worth, never whether an
    unboosted ingredient is penalised.

    Parameters
    ----------
    phase_name:
        Current lunar phase name (e.g. ``"Full Moon"``).
    ingredient_category:
        Ingredient's category: a table name (e.g. ``"Grains"``) or one of
        production's (e.g. ``"grain"``; see INGREDIENT_CATEGORY_TO_LUNAR).
    planet:
        The ruling planet of the recipe/ingredient.  Defaults to ``"Moon"``.

    Returns
    -------
    float
        1.0 when the phase does not boost the category, for any planet.  When it
        does, ``1 + 0.20 * mass_scale`` (``0.10`` for the legacy "Detoxifying"
        boost): 1.20 for the Sun, 1.1091 for the Moon, 1.10 for Pluto, the floor.
    """
    category = lunar_category(ingredient_category)

    # Base modifier from phase ↔ category match
    boosted_categories = LUNAR_PHASE_BOOSTS.get(phase_name, set())
    base_modifier = 1.20 if category in boosted_categories else 1.0

    # Legacy secondary boosts (kept for backwards-compatibility)
    if phase_name == "New Moon" and category == "Root/Grounding":
        base_modifier = max(base_modifier, 1.20)
    elif phase_name == "Full Moon" and category == "High-Water/Cooling":
        base_modifier = max(base_modifier, 1.20)
    elif "Waning" in phase_name and category == "Detoxifying":
        base_modifier = max(base_modifier, 1.10)

    # Scale by actual planetary mass (relative-to-Earth), normalized inline via log₁₀.
    # Floor at 0.5 so even the lightest planet still contributes.
    rel_mass = PLANET_MASS_RELATIVE.get(planet, 1.0)
    mass_scale = 0.5 + 0.5 * normalize_planet_weight(rel_mass)

    # The planet scales the BOOST (base_modifier - 1), not the whole modifier. Multiplying the whole
    # modifier by mass_scale gave 0.6548 for a boosted category and 0.5457 for every other one with
    # the Moon (0.9785 and 0.8154 for Jupiter): only the Sun could return 1.0 or more, so lunar data
    # cut every other planet's scores by 2 to 50 percent, against this function's own contract.
    return round(1.0 + (base_modifier - 1.0) * mass_scale, 4)
