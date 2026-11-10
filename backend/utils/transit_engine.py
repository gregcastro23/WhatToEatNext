import datetime
import math
from backend.config.celestial_config import FOREST_HILLS_COORDINATES
from backend.utils.planetary_weights import normalize_planet_weight, PLANET_MASS_RELATIVE
from backend.utils.elemental_balance import elemental_balance_from_longitudes
from backend.utils.ephemeris import swe
from backend.utils.planetary_hours import planetary_hour_at

_UTC = datetime.timezone.utc  # the module's own name for it: tests replace `datetime` here with a clock
PLANETARY_ELEMENTS = {
    "Sun": "Fire", "Venus": "Earth", "Mercury": "Air", "Moon": "Water",
    "Saturn": "Earth", "Jupiter": "Fire", "Mars": "Fire"
}
# User's birth data (from src/components/CosmicRecipeWidget.tsx, but now using centralized config)
BIRTH_DATA = {
    "year": 1990, # Original birth year from prompt
    "month": 10, # Original birth month from prompt
    "day": 15,   # Original birth day from prompt
    "hour": 7,
    "minute": 15,
    "latitude": FOREST_HILLS_COORDINATES["latitude"],
    "longitude": FOREST_HILLS_COORDINATES["longitude"],
}

from backend.schemas.planetary import CelestialCoordinates, PotencyScore

def get_planetary_hour(coords: CelestialCoordinates):
    """The planet that rules the current planetary hour at `coords`; None when pyswisseph is not installed.

    The rule, and what was wrong with this function before, are in backend/utils/planetary_hours.py.
    Raises ValueError where the Sun does not rise and set around now (the polar day and night).
    `coords.timezone` is not used: the weekday comes from the longitude.
    """
    if not swe:
        return None
    return planetary_hour_at(datetime.datetime.now(_UTC), coords.latitude, coords.longitude).ruler

def get_julian_day(year, month, day, hour, minute):
    """Calculates the Julian day."""
    return swe.julday(year, month, day, hour + minute / 60.0)

def get_planetary_positions(julian_day):
    """Gets the positions of the planets."""
    planets = {
        "Sun": swe.SUN,
        "Mars": swe.MARS,
        "Venus": swe.VENUS,
        "Saturn": swe.SATURN,
    }
    positions = {}
    for planet_name, planet_id in planets.items():
        # result is a tuple: ((longitude, latitude, distance, long_speed, ...), flags)
        result, _ = swe.calc_ut(julian_day, planet_id, swe.FLG_SWIEPH)
        positions[planet_name] = result[0]
    return positions

def get_dominant_transit(birth_chart, current_transits):
    """
    Determines the most influential transit by comparing the birth chart
    with current planetary positions. This is a simplified example.
    A real implementation would involve more complex astrological calculations.
    """
    # For simplicity, we'll just check for conjunctions (same degree)
    for planet, natal_pos in birth_chart.items():
        transit_pos = current_transits[planet]
        if abs(natal_pos - transit_pos) < 1.0: # 1 degree orb for conjunction
            return planet
    return None

def get_cooking_ritual(recipe, dominant_transit):
    """
    Generates a custom cooking ritual based on the dominant transit
    and the specific recipe.
    """
    recipe_name = recipe.name.lower()
    recipe_description = recipe.description.lower() if recipe.description else ""

    if dominant_transit == "Mars":
        if "stir-fry" in recipe_name or "saute" in recipe_description:
            return f"For '{recipe.name}', embrace the fiery energy of Mars. Use high heat and quick, aggressive motions. Channel your energy into the sizzle of the pan. This is a ritual of action and transformation."
        else:
            return f"For '{recipe.name}', stir with intention and energy. Embrace the transformative power of fire and heat. This is a moment of action and creation."
    elif dominant_transit == "Venus":
        if "salad" in recipe_name or "garnish" in recipe_description:
            return f"For '{recipe.name}', focus on the beauty and aesthetics of the dish. Arrange the ingredients with care and artistry. Appreciate the colors, textures, and aromas. This is a ritual of love and pleasure."
        else:
            return f"For '{recipe.name}', focus on the beauty of the ingredients. Appreciate the colors, textures, and aromas. This is an act of love and pleasure."
    elif dominant_transit == "Saturn":
        if "soup" in recipe_name or "stew" in recipe_name or "braise" in recipe_description:
            return f"For '{recipe.name}', move with deliberation and patience. Connect with the slow nourishment of the earth. Allow the flavors to meld and deepen over time. This is a ritual of grounding and stability."
        else:
            return f"For '{recipe.name}', move with deliberation and patience. Connect with the earth and the slow nourishment it provides. This is a ritual of grounding and stability."
    else:
        return f"For '{recipe.name}', simply cook with mindfulness and enjoy the moment."

def get_dominant_element(elemental_properties):
    """The element with the strictly greatest share, or None when there is not one.

    A tie has no dominant element, and neither has a profile with nothing in it. max() would answer
    with whichever tied key comes first in the dict, which is "Fire" for the order the by-chart
    recommender builds, so a recipe tied between Water and Air would be scored as Fire-dominant (the
    highest potency of the four). 34 of the 1099 public recipes in production have an exact tie for
    the top share (42 within 1e-9). None is the engines' "no profile": a neutral score.
    """
    if not elemental_properties:
        return None
    if not all(math.isfinite(share) for share in elemental_properties.values()):
        return None  # max() and == treat a NaN by its position, so it must not take part
    top = max(elemental_properties.values())
    leaders = [name for name, share in elemental_properties.items() if math.isclose(share, top, rel_tol=0.0, abs_tol=1e-9)]
    if len(leaders) != 1 or top <= 0:
        return None
    return leaders[0]

def calculate_total_potency_score(recipe, dominant_transit, sun_sign_element, planetary_hour_ruler):
    """
    Calculates the Total Potency Score for a recipe.
    """
    # 1. Planetary Alignment
    planetary_alignment = 1.0 if dominant_transit else 0.5

    # 2. Elemental Match
    recipe_element = get_dominant_element(recipe.elementalProperties)
    elemental_match = 1.0 if sun_sign_element == recipe_element else 0.5

    # 3. Thermodynamic Parity (simplified)
    thermodynamic_parity = 0.5
    if recipe_element == "Fire":
        thermodynamic_parity = 1.0
    elif recipe_element == "Air":
        thermodynamic_parity = 0.7
    elif recipe_element == "Earth":
        thermodynamic_parity = 0.5
    elif recipe_element == "Water":
        thermodynamic_parity = 0.3
    
    # 4. Planetary Hour Bonus
    planetary_hour_bonus = 0.0
    if planetary_hour_ruler and PLANETARY_ELEMENTS.get(planetary_hour_ruler) == recipe_element:
        planetary_hour_bonus = 0.25

    total_potency_score = (planetary_alignment * 0.4) + (elemental_match * 0.3) + (thermodynamic_parity * 0.3) + planetary_hour_bonus

    # 5. Kinetic Rating — derived from the dominant transit planet's actual
    # physical mass (normalized via log₁₀).  A Sun or Jupiter transit carries
    # far more kinetic energy than a Moon or Mercury transit.
    # Fallback to Earth mass (neutral, w≈0.32) when no transit is detected.
    _transit_rel_mass = PLANET_MASS_RELATIVE.get(dominant_transit or "Earth", 1.0)
    kinetic_rating = normalize_planet_weight(_transit_rel_mass)
    # Examples: Sun≈1.00, Jupiter≈0.63, Mars≈0.21, Moon≈0.09, Pluto=0.00

    # 6. "Steam" modifier for elemental conflicts
    if planetary_hour_ruler:
        hour_element = PLANETARY_ELEMENTS.get(planetary_hour_ruler)
        if (sun_sign_element == "Fire" and hour_element == "Water") or \
           (sun_sign_element == "Water" and hour_element == "Fire") or \
           (sun_sign_element == "Air" and hour_element == "Earth") or \
           (sun_sign_element == "Earth" and hour_element == "Air"):
            kinetic_rating *= 1.5 # Boost kinetic rating for "Steam"

    # 7. Thermo Rating
    thermo_rating = thermodynamic_parity

    return PotencyScore(
        total_potency_score=total_potency_score,
        kinetic_rating=kinetic_rating,
        thermo_rating=thermo_rating,
    )


def get_zodiac_sign_and_element(longitude):
    """Gets the zodiac sign and element from a longitude."""
    zodiac_signs = [
        ("Aries", "Fire"), ("Taurus", "Earth"), ("Gemini", "Air"),
        ("Cancer", "Water"), ("Leo", "Fire"), ("Virgo", "Earth"),
        ("Libra", "Air"), ("Scorpio", "Water"), ("Sagittarius", "Fire"),
        ("Capricorn", "Earth"), ("Aquarius", "Air"), ("Pisces", "Water")
    ]
    sign_index = int(longitude / 30)
    return zodiac_signs[sign_index]

def calculate_current_elemental_balance(current_transits):
    """Share of the transiting bodies standing in each element's signs.

    `current_transits` maps body name to ecliptic longitude, as get_planetary_positions returns
    it. The basis and the weights are in backend/utils/elemental_balance.py.
    """
    return elemental_balance_from_longitudes(current_transits.values())


def get_transit_details():
    """
    Main function to get transit details.
    """
    if not swe:
        return {"error": "pyswisseph is not installed. Please install it to use the transit engine."}

    # 1. Get birth chart
    birth_jd = get_julian_day(BIRTH_DATA["year"], BIRTH_DATA["month"], BIRTH_DATA["day"], BIRTH_DATA["hour"], BIRTH_DATA["minute"])
    birth_chart = get_planetary_positions(birth_jd)

    # 2. Get current transits
    now = datetime.datetime.utcnow()
    current_jd = get_julian_day(now.year, now.month, now.day, now.hour, now.minute)
    current_transits = get_planetary_positions(current_jd)

    # 3. Determine dominant transit
    dominant_transit = get_dominant_transit(birth_chart, current_transits)

    # 4. Get Sun sign and element
    sun_longitude = current_transits["Sun"]
    sun_sign, sun_element = get_zodiac_sign_and_element(sun_longitude)

    # 5. Calculate current elemental balance from transits
    current_elemental_balance = calculate_current_elemental_balance(current_transits)

    return {
        "birth_chart": birth_chart,
        "current_transits": current_transits,
        "dominant_transit": dominant_transit,
        "sun_sign": sun_sign,
        "sun_element": sun_element,
        "current_elemental_balance": current_elemental_balance,
    }

if __name__ == "__main__":
    transit_info = get_transit_details()
    if "error" in transit_info:
        print(transit_info["error"])
    else:
        print("Transit Details:")
        print(f"  - Birth Chart: {transit_info['birth_chart']}")
        print(f"  - Current Transits: {transit_info['current_transits']}")
        print(f"  - Dominant Transit: {transit_info['dominant_transit']}")

        ritual = get_cooking_ritual("test-recipe", transit_info["dominant_transit"])
        print("\nSample Cooking Ritual:")
        print(ritual)
