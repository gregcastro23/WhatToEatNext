import datetime
from typing import Dict, Any, Optional

# Assuming swisseph and ephem are installed and available
try:
    import swisseph as swe
except ImportError:
    swe = None

try:
    import ephem
except ImportError:
    ephem = None

def calculate_planetary_positions_swisseph(
    year: int, month: int, day: int, hour: int = 0, minute: int = 0,
    zodiac_system: str = "tropical"
) -> Dict[str, Any]:
    """
    Calculate planetary positions using Swiss Ephemeris (high precision).
    Falls back to pyephem if pyswisseph is not available.
    """
    if not swe:
        print("pyswisseph not available, falling back to pyephem")
        return calculate_planetary_positions_pyephem(year, month, day, hour, minute, zodiac_system)
    try:
        # Set ephemeris path (use built-in ephemeris)
        swe.set_ephe_path('')

        # Calculate Julian day
        # month is 1-indexed in the input
        julian_day = swe.julday(year, month, day, hour + minute / 60.0)

        # For sidereal, set ayanamsa (default to Lahiri)
        if zodiac_system.lower() == "sidereal":
            swe.set_sid_mode(swe.SIDM_LAHIRI)

        # Define planets and their Swiss Ephemeris IDs
        planets = {
            "Sun": swe.SUN,
            "Moon": swe.MOON,
            "Mercury": swe.MERCURY,
            "Venus": swe.VENUS,
            "Mars": swe.MARS,
            "Jupiter": swe.JUPITER,
            "Saturn": swe.SATURN,
            "Uranus": swe.URANUS,
            "Neptune": swe.NEPTUNE,
            "Pluto": swe.PLUTO,
        }

        # Zodiac signs (lowercase as per CLAUDE.md convention)
        zodiac_signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        positions = {}

        for planet_name, planet_id in planets.items():
            try:
                # Calculate position with speed
                # swe.calc_ut returns ((longitude, latitude, distance, long_speed, ...), flags)
                # FLG_SPEED is required to get velocity data
                if zodiac_system.lower() == "sidereal":
                    result = swe.calc_ut(julian_day, planet_id, swe.FLG_SIDEREAL | swe.FLG_SPEED)
                else:
                    result = swe.calc_ut(julian_day, planet_id, swe.FLG_SWIEPH | swe.FLG_SPEED)

                # Extract values correctly - result is ((positions...), flags)
                positions_array = result[0]
                longitude = positions_array[0]
                longitude_speed = positions_array[3]

                # Normalize longitude to 0-360
                longitude = longitude % 360

                # Calculate zodiac sign (each sign is 30 degrees)
                sign_index = int(longitude / 30)
                degree_in_sign = longitude % 30
                degree = int(degree_in_sign)
                minute_in_sign = int((degree_in_sign - degree) * 60)

                # Check retrograde (negative speed means retrograde)
                is_retrograde = longitude_speed < 0

                # Convert speed to arcminutes/day for more meaningful tracking
                arcminutes_per_day = longitude_speed * 60  # degrees/day * 60 = arcminutes/day

                # Generate retrograde symbol
                retrograde_symbol = "℞" if is_retrograde else ""

                positions[planet_name] = {
                    "sign": zodiac_signs[sign_index],
                    "degree": degree,
                    "minute": minute_in_sign, # Typo
                    "exactLongitude": longitude,
                    "isRetrograde": is_retrograde,
                    "retrogradeSymbol": retrograde_symbol,
                    "longitudeSpeed": longitude_speed,  # degrees/day
                    "arcminutesPerDay": round(arcminutes_per_day, 2),  # arcminutes/day (more granular)
                    "speedDisplay": f"{arcminutes_per_day:+.1f}'/day" if abs(arcminutes_per_day) < 60 else f"{longitude_speed:+.2f}°/day"
                }
            except Exception as planet_error:
                print(f"Error calculating {planet_name}: {planet_error}")
                # Continue with other planets

        # Add North and South Nodes
        try:
            if zodiac_system.lower() == "sidereal":
                node_result = swe.calc_ut(julian_day, swe.MEAN_NODE, swe.FLG_SIDEREAL | swe.FLG_SPEED)
            else:
                node_result = swe.calc_ut(julian_day, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SPEED)

            # Extract correctly - result is ((positions...), flags)
            node_positions_array = node_result[0]
            north_node_longitude = node_positions_array[0] % 360
            node_speed = node_positions_array[3]
            node_arcminutes_per_day = node_speed * 60

            sign_index = int(north_node_longitude / 30)
            degree_in_sign = north_node_longitude % 30

            positions["North Node"] = {
                "sign": zodiac_signs[sign_index],
                "degree": int(degree_in_sign),
                "minute": int((degree_in_sign - int(degree_in_sign)) * 60),
                "exactLongitude": north_node_longitude,
                "isRetrograde": True,  # North Node is always retrograde (mean node)
                "retrogradeSymbol": "℞",
                "longitudeSpeed": node_speed,
                "arcminutesPerDay": round(node_arcminutes_per_day, 2),
                "speedDisplay": f"{node_arcminutes_per_day:+.1f}'/day"
            }

            # South Node is always 180 degrees opposite
            south_node_longitude = (north_node_longitude + 180) % 360
            sign_index = int(south_node_longitude / 30)
            degree_in_in_sign = south_node_longitude % 30

            positions["South Node"] = {
                "sign": zodiac_signs[sign_index],
                "degree": int(degree_in_in_sign),
                "minute": int((degree_in_in_sign - int(degree_in_in_sign)) * 60),
                "exactLongitude": south_node_longitude,
                "isRetrograde": True,  # South Node is always retrograde (mean node)
                "retrogradeSymbol": "℞",
                "longitudeSpeed": node_speed,
                "arcminutesPerDay": round(node_arcminutes_per_day, 2),
                "speedDisplay": f"{node_arcminutes_per_day:+.1f}'/day"
            }
        except Exception as node_error:
            print(f"Error calculating nodes: {node_error}")

        return {
            "positions": positions,
            "source": "pyswisseph",
            "precision": "NASA JPL DE (sub-arcsecond)",
            "zodiacSystem": zodiac_system
        }

    except Exception as e:
        print(f"Swiss Ephemeris calculation failed: {e}")
        # Fallback to pyephem
        return calculate_planetary_positions_pyephem(year, month, day, hour, minute, zodiac_system)

def calculate_planetary_positions_pyephem(
    year: int, month: int, day: int, hour: int = 0, minute: int = 0,
    zodiac_system: str = "tropical"
) -> Dict[str, Any]:
    """
    Fallback planetary position calculation using pyephem.
    Lower precision than Swiss Ephemeris but more reliable availability.
    """
    if not ephem:
        print("pyephem not available, cannot calculate planetary positions.")
        return {"error": "pyephem not installed or available."}

    try:
        # Create observer at Greenwich (0, 0) for geocentric calculations
        observer = ephem.Observer()
        observer.lat = '0'
        observer.lon = '0'
        observer.date = f"{year}/{month}/{day} {hour}:{minute}:00"

        # Define planets
        planets_map = {
            "Sun": ephem.Sun(),
            "Moon": ephem.Moon(),
            "Mercury": ephem.Mercury(),
            "Venus": ephem.Venus(),
            "Mars": ephem.Mars(),
            "Jupiter": ephem.Jupiter(),
            "Saturn": ephem.Saturn(),
            "Uranus": ephem.Uranus(),
            "Neptune": ephem.Neptune(),
            "Pluto": ephem.Pluto(),
        }

        zodiac_signs = [
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
        ]

        positions = {}

        for planet_name, planet_obj in planets_map.items():
            try:
                planet_obj.compute(observer)

                # Get ecliptic longitude in degrees
                longitude_rad = float(planet_obj.hlon)
                longitude = longitude_rad * 180 / 3.14159265359  # Convert to degrees

                # Normalize to 0-360
                longitude = longitude % 360

                # Calculate sign and position
                sign_index = int(longitude / 30)
                degree_in_sign = longitude % 30
                degree = int(degree_in_sign)
                minute_in_sign = int((degree_in_sign - degree) * 60)

                # Approximate retrograde detection (compare with position 1 day later)
                observer.date = observer.date + 1  # Add 1 day
                planet_obj.compute(observer)
                future_longitude = float(planet_obj.hlon) * 180 / 3.14159265359
                observer.date = observer.date - 1  # Reset

                # Calculate if retrograde (future position is less than current)
                delta = ((future_longitude - longitude + 540) % 360) - 180
                is_retrograde = delta < 0 if planet_name not in ["Sun", "Moon"] else False

                positions[planet_name] = {
                    "sign": zodiac_signs[sign_index],
                    "degree": degree,
                    "minute": minute_in_sign,
                    "exactLongitude": longitude,
                    "isRetrograde": is_retrograde
                }
            except Exception as planet_error:
                print(f"Error calculating {planet_name} with pyephem: {planet_error}")

        return {
            "positions": positions,
            "source": "pyephem-fallback",
            "precision": "moderate (arcminute)",
            "zodiacSystem": zodiac_system
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planetary calculation failed: {str(e)}")
