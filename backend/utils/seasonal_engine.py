import datetime
import sys
import os

# ---------------------------------------------------------------------------
# Import planetary weights (handles both package and direct invocation)
# ---------------------------------------------------------------------------
try:
    from backend.utils.planetary_weights import normalize_planet_weight, PLANET_MASS_RELATIVE
except ImportError:
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
    from backend.utils.planetary_weights import normalize_planet_weight, PLANET_MASS_RELATIVE


# ---------------------------------------------------------------------------
# Sign → element mappings (per GEMINI.md)
# ---------------------------------------------------------------------------
FIRE_SIGNS  = {"Aries", "Leo", "Sagittarius"}
EARTH_SIGNS = {"Taurus", "Virgo", "Capricorn"}
AIR_SIGNS   = {"Gemini", "Libra", "Aquarius"}
WATER_SIGNS = {"Cancer", "Scorpio", "Pisces"}

# Elemental type → ingredient examples (per GEMINI.md)
ELEMENTAL_INGREDIENTS: dict = {
    "Thermogenic":    ["chili", "pepper", "garlic"],       # Fire
    "Rooted":         ["grains", "potatoes", "squash"],    # Earth
    "Light/Sprouted": ["microgreens", "sprouts"],          # Air
    "Hydrating":      ["soups", "broths", "melons"],       # Water
}

# Planet → primary element (used to determine seasonal match)
PLANET_ELEMENTS: dict = {
    "Sun":     "Fire",
    "Moon":    "Water",
    "Mercury": "Air",
    "Venus":   "Earth",
    "Mars":    "Fire",
    "Jupiter": "Fire",
    "Saturn":  "Earth",
    "Uranus":  "Air",
    "Neptune": "Water",
    "Pluto":   "Water",
}


def get_zodiac_sign(date: datetime.date) -> str:
    """Return the tropical zodiac sign for a given date."""
    day = date.day
    month = date.month

    if (month == 3 and day >= 21) or (month == 4 and day <= 19):
        return "Aries"
    elif (month == 4 and day >= 20) or (month == 5 and day <= 20):
        return "Taurus"
    elif (month == 5 and day >= 21) or (month == 6 and day <= 20):
        return "Gemini"
    elif (month == 6 and day >= 21) or (month == 7 and day <= 22):
        return "Cancer"
    elif (month == 7 and day >= 23) or (month == 8 and day <= 22):
        return "Leo"
    elif (month == 8 and day >= 23) or (month == 9 and day <= 22):
        return "Virgo"
    elif (month == 9 and day >= 23) or (month == 10 and day <= 22):
        return "Libra"
    elif (month == 10 and day >= 23) or (month == 11 and day <= 21):
        return "Scorpio"
    elif (month == 11 and day >= 22) or (month == 12 and day <= 21):
        return "Sagittarius"
    elif (month == 12 and day >= 22) or (month == 1 and day <= 19):
        return "Capricorn"
    elif (month == 1 and day >= 20) or (month == 2 and day <= 18):
        return "Aquarius"
    elif (month == 2 and day >= 19) or (month == 3 and day <= 20):
        return "Pisces"
    return "Unknown"


# ---------------------------------------------------------------------------
# Element boosting per zodiac season
# ---------------------------------------------------------------------------

def get_elemental_boosts(zodiac_sign: str) -> dict:
    """Return ingredient boosts for the current zodiac season."""
    fire_boost: list  = []
    earth_boost: list = []
    air_boost: list   = []
    water_boost: list = []

    if zodiac_sign in FIRE_SIGNS:
        fire_boost = ELEMENTAL_INGREDIENTS["Thermogenic"]
    elif zodiac_sign in EARTH_SIGNS:
        earth_boost = ELEMENTAL_INGREDIENTS["Rooted"]
    elif zodiac_sign in AIR_SIGNS:
        air_boost = ELEMENTAL_INGREDIENTS["Light/Sprouted"]
    elif zodiac_sign in WATER_SIGNS:
        water_boost = ELEMENTAL_INGREDIENTS["Hydrating"]

    return {
        "fire":  fire_boost,
        "earth": earth_boost,
        "air":   air_boost,
        "water": water_boost,
        "current_zodiac": zodiac_sign,
    }


# ---------------------------------------------------------------------------
# Seasonal modifier with planetary-weight scaling (per GEMINI.md)
# ---------------------------------------------------------------------------

def get_seasonal_modifier(zodiac_sign: str, ingredient_elemental_type: str, planet: str = "Sun") -> float:
    """Return the seasonal score modifier for an ingredient and ruling planet.

    A 20% boost is applied when the ingredient's elemental type matches the
    current zodiac season's element; a 10% penalty is applied on mismatch.

    The raw modifier is then scaled by the ruling planet's log-normalized
    physical mass (floored at 0.5) so that massive planets amplify seasonal
    effects more strongly.

    Parameters
    ----------
    zodiac_sign:
        Current sun sign / zodiac season (e.g. ``"Leo"``).
    ingredient_elemental_type:
        Elemental type of the ingredient (``"Thermogenic"``, ``"Rooted"``,
        ``"Light/Sprouted"``, or ``"Hydrating"``).
    planet:
        Ruling planet for the recipe/ingredient.

    Returns
    -------
    float
        Seasonal modifier (typically 0.45–1.20 range after mass scaling).
    """
    # Determine season element
    if zodiac_sign in FIRE_SIGNS:
        season_element = "Fire"
    elif zodiac_sign in EARTH_SIGNS:
        season_element = "Earth"
    elif zodiac_sign in AIR_SIGNS:
        season_element = "Air"
    elif zodiac_sign in WATER_SIGNS:
        season_element = "Water"
    else:
        season_element = "Unknown"

    # Elemental type → element match
    ELEMENTAL_TYPE_TO_ELEMENT: dict = {
        "Thermogenic":    "Fire",
        "Rooted":         "Earth",
        "Light/Sprouted": "Air",
        "Hydrating":      "Water",
    }
    ingredient_element = ELEMENTAL_TYPE_TO_ELEMENT.get(ingredient_elemental_type, "Unknown")

    # 20% boost on match, 10% penalty on mismatch (per GEMINI.md)
    if season_element == "Unknown" or ingredient_element == "Unknown":
        base_modifier = 1.0
    elif season_element == ingredient_element:
        base_modifier = 1.2
    else:
        base_modifier = 0.9

    # Scale by actual planetary mass (relative-to-Earth), normalized inline via log₁₀
    rel_mass = PLANET_MASS_RELATIVE.get(planet, 1.0)
    mass_scale = 0.5 + 0.5 * normalize_planet_weight(rel_mass)

    return round(base_modifier * mass_scale, 4)


def get_seasonal_modifiers(date: datetime.date = None, planet: str = "Sun") -> dict:
    """Return the full seasonal modifiers dict for today (or the given date).

    Includes the elemental ingredient boosts and the current zodiac sign.
    An optional *planet* argument applies the planet-weight scalar to the
    returned ``seasonal_modifier`` value.
    """
    if date is None:
        date = datetime.date.today()

    zodiac_sign = get_zodiac_sign(date)
    boosts = get_elemental_boosts(zodiac_sign)

    return {
        **boosts,
        "planet": planet,
        "planet_weight": get_planet_weight(planet, scale="normalized"),
    }


if __name__ == "__main__":
    # Example output
    today = datetime.date.today()
    print(f"Seasonal modifiers for today ({today}): {get_seasonal_modifiers(today)}")

    leo_date = datetime.date(2024, 8, 10)
    print(f"\nSeasonal modifier (Leo/Thermogenic/Jupiter): "
          f"{get_seasonal_modifier('Leo', 'Thermogenic', 'Jupiter')}")

    taurus_date = datetime.date(2024, 5, 5)
    print(f"Seasonal modifier (Taurus/Rooted/Saturn):    "
          f"{get_seasonal_modifier('Taurus', 'Rooted', 'Saturn')}")