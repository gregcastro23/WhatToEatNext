
import datetime
try:
    import swisseph as swe
except ImportError:
    swe = None

NAKSHATRAS = [
    {"name": "Ashwini", "start_long": 0.0, "end_long": 13.33, "food_type": "Quick & Light"},
    {"name": "Bharani", "start_long": 13.33, "end_long": 26.66, "food_type": "Spicy/Transformative"},
    {"name": "Krittika", "start_long": 26.66, "end_long": 40.0, "food_type": "Fiery & Sharp"},
    {"name": "Rohini", "start_long": 40.0, "end_long": 53.33, "food_type": "Sweet/Nurturing"},
    {"name": "Mrigashira", "start_long": 53.33, "end_long": 66.66, "food_type": "Light & Airy"},
    {"name": "Ardra", "start_long": 66.66, "end_long": 80.0, "food_type": "Moist & Soft"},
    {"name": "Punarvasu", "start_long": 80.0, "end_long": 93.33, "food_type": "Nourishing & Restorative"},
    {"name": "Pushya", "start_long": 93.33, "end_long": 106.66, "food_type": "Rich & Milky"},
    {"name": "Ashlesha", "start_long": 106.66, "end_long": 120.0, "food_type": "Pungent & Intense"},
    {"name": "Magha", "start_long": 120.0, "end_long": 133.33, "food_type": "Royal & Grand"},
    {"name": "Purva Phalguni", "start_long": 133.33, "end_long": 146.66, "food_type": "Sweet & Oily"},
    {"name": "Uttara Phalguni", "start_long": 146.66, "end_long": 160.0, "food_type": "Simple & Wholesome"},
    {"name": "Hasta", "start_long": 160.0, "end_long": 173.33, "food_type": "Light & Easy-to-digest"},
    {"name": "Chitra", "start_long": 173.33, "end_long": 186.66, "food_type": "Colorful & Artistic"},
    {"name": "Swati", "start_long": 186.66, "end_long": 200.0, "food_type": "Windy & Gassy"},
    {"name": "Vishakha", "start_long": 200.0, "end_long": 213.33, "food_type": "Rich & Festive"},
    {"name": "Anuradha", "start_long": 213.33, "end_long": 226.66, "food_type": "Mild & Balanced"},
    {"name": "Jyeshtha", "start_long": 226.66, "end_long": 240.0, "food_type": "Heavy & Pungent"},
    {"name": "Mula", "start_long": 240.0, "end_long": 253.33, "food_type": "Root Vegetables"},
    {"name": "Purva Ashadha", "start_long": 253.33, "end_long": 266.66, "food_type": "Liquid & Flowing"},
    {"name": "Uttara Ashadha", "start_long": 266.66, "end_long": 280.0, "food_type": "Simple & Pure"},
    {"name": "Shravana", "start_long": 280.0, "end_long": 293.33, "food_type": "Light & Sattvic"},
    {"name": "Dhanishta", "start_long": 293.33, "end_long": 306.66, "food_type": "Rich & Rhythmic"},
    {"name": "Shatabhisha", "start_long": 306.66, "end_long": 320.0, "food_type": "Cleansing & Bitter"},
    {"name": "Purva Bhadrapada", "start_long": 320.0, "end_long": 333.33, "food_type": "Fiery & Hot"},
    {"name": "Uttara Bhadrapada", "start_long": 333.33, "end_long": 346.66, "food_type": "Grounding & Stable"},
    {"name": "Revati", "start_long": 346.66, "end_long": 360.0, "food_type": "Sweet & Nourishing"},
]

def get_lunar_mansion(moon_longitude):
    """
    Determines the current lunar mansion (Nakshatra) based on the Moon's longitude.
    """
    for mansion in NAKSHATRAS:
        if mansion["start_long"] <= moon_longitude < mansion["end_long"]:
            return mansion
    return None

def get_moon_longitude(julian_day):
    """Gets the longitude of the Moon."""
    # result is a tuple: ((longitude, latitude, distance, long_speed, ...), flags)
    result, _ = swe.calc_ut(julian_day, swe.MOON, swe.FLG_SWIEPH)
    return result[0]

def get_optimal_cooking_windows(days=7):
    """
    Predicts the optimal cooking windows for the next number of days.
    """
    if not swe:
        return {"error": "pyswisseph is not installed. Please install it to use the lunar oracle."}

    swe.set_ephe_path('') # Use built-in ephemeris

    windows = []
    now = datetime.datetime.utcnow()

    for day in range(days):
        date = now + datetime.timedelta(days=day)
        julian_day = swe.julday(date.year, date.month, date.day, date.hour, date.minute)
        moon_longitude = get_moon_longitude(julian_day)
        mansion = get_lunar_mansion(moon_longitude)

        if mansion:
            windows.append({
                "date": date.strftime("%Y-%m-%d"),
                "mansion": mansion["name"],
                "food_type": mansion["food_type"],
                "start_time": date.strftime("%H:%M"), # This is a simplification
            })

    return windows

if __name__ == "__main__":
    windows = get_optimal_cooking_windows()
    if "error" in windows:
        print(windows["error"])
    else:
        print("Optimal Cooking Windows for the next 7 days:")
        for window in windows:
            print(f"  - {window['date']} ({window['mansion']}): Best for {window['food_type']} foods. Optimal cooking time starts around {window['start_time']} UTC.")

