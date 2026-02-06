
import datetime
try:
    import swisseph as swe
except ImportError:
    swe = None

# User's birth data (from src/components/CosmicRecipeWidget.tsx)
BIRTH_DATA = {
    "year": 1992,
    "month": 8,
    "day": 12,
    "hour": 7,
    "minute": 15,
    "latitude": 34.0522,
    "longitude": -118.2437,
}

def get_julian_day(year, month, day, hour, minute):
    """Calculates the Julian day."""
    return swe.julday(year, month, day, hour + minute / 60.0)

def get_planetary_positions(julian_day):
    """Gets the positions of the planets."""
    planets = {
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

    return {
        "birth_chart": birth_chart,
        "current_transits": current_transits,
        "dominant_transit": dominant_transit,
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
