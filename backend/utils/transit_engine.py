
import datetime
from backend.config.celestial_config import FOREST_HILLS_COORDINATES
try:
    import swisseph as swe
    from astral.sun import sun
    from astral import LocationInfo
except ImportError:
    swe = None
    sun = None
    LocationInfo = None

CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]
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

def get_planetary_hour(latitude, longitude):
    """Calculates the current planetary hour."""
    if not sun or not LocationInfo:
        return None

    city = LocationInfo("Forest Hills", "USA", FOREST_HILLS_COORDINATES["timezone"], latitude, longitude)
    s = sun(city.observer, date=datetime.datetime.now())
    sunrise = s["sunrise"]
    sunset = s["sunset"]

    now = datetime.datetime.now(sunrise.tzinfo) # Use timezone-aware datetime

    if sunrise < now < sunset:
        # Daytime
        hour_length = (sunset - sunrise) / 12
        hour_index = int((now - sunrise) / hour_length)
        day_of_week = now.weekday()
        # Monday is 0 in weekday(), but we need Sunday = 0 for Chaldean order
        day_of_week = (day_of_week + 1) % 7
        
        # Get the ruler of the day
        day_ruler = CHALDEAN_ORDER[day_of_week]
        day_ruler_index = CHALDEAN_ORDER.index(day_ruler)

        hour_ruler_index = (day_ruler_index + hour_index) % 7
        return CHALDEAN_ORDER[hour_ruler_index]
    else:
        # Nighttime
        # Find previous sunset
        yesterday = now - datetime.timedelta(days=1)
        s_yesterday = sun(city.observer, date=yesterday)
        prev_sunset = s_yesterday["sunset"]

        if now < sunrise: # Before sunrise
            hour_length = (sunrise - prev_sunset) / 12
            hour_index = int((now - prev_sunset) / hour_length)
        else: # After sunset
            tomorrow = now + datetime.timedelta(days=1)
            s_tomorrow = sun(city.observer, date=tomorrow)
            next_sunrise = s_tomorrow["sunrise"]
            hour_length = (next_sunrise - sunset) / 12
            hour_index = int((now - sunset) / hour_length)

        day_of_week = now.weekday()
        day_of_week = (day_of_week + 1) % 7
        
        # Get the ruler of the day
        day_ruler = CHALDEAN_ORDER[day_of_week]
        day_ruler_index = CHALDEAN_ORDER.index(day_ruler)

        # The first hour of the night is ruled by the planet that is 3 places after the day ruler
        hour_ruler_index = (day_ruler_index + 12 + hour_index) % 7
        return CHALDEAN_ORDER[hour_ruler_index]

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
    """Gets the dominant element from a recipe's elemental properties."""
    if not elemental_properties:
        return None
    return max(elemental_properties, key=elemental_properties.get)

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

    # 5. Kinetic Rating
    kinetic_rating = 0.5
    if dominant_transit == "Mars":
        kinetic_rating = 1.0
    elif dominant_transit == "Venus":
        kinetic_rating = 0.3
    elif dominant_transit == "Saturn":
        kinetic_rating = 0.1

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

    return {
        "total_potency_score": total_potency_score,
        "kinetic_rating": kinetic_rating,
        "thermo_rating": thermo_rating,
    }


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

def get_transit_details():
    """
    Main function to get transit details.
    """
    if not swe:
        return {"error": "pyswisseph is not installed. Please install it to use the transit engine."}

    # Set ephemeris path
    swe.set_ephe_path('') # Use built-in ephemeris

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
