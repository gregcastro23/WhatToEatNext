import datetime
import os
from typing import Dict, Any, Optional
from functools import lru_cache
from fastapi import HTTPException

# Assuming swisseph and ephem are installed and available
try:
    import swisseph as swe
    # Set ephemeris path once at module level (relative to this file)
    ephe_path = os.path.join(os.path.dirname(__file__), '..', '..', 'sweph_ephe')
    if os.path.exists(ephe_path):
        swe.set_ephe_path(ephe_path)
    else:
        # Fallback to local dir
        swe.set_ephe_path('sweph_ephe')
except ImportError:
    swe = None

try:
    import ephem
except ImportError:
    ephem = None

@lru_cache(maxsize=1024)
def calculate_planetary_positions_swisseph(
    year: int, month: int, day: int, hour: int = 0, minute: int = 0,
    latitude: float = 0.0, longitude: float = 0.0,
    zodiac_system: str = "tropical"
) -> Dict[str, Any]:
    """
    Calculate planetary positions using Swiss Ephemeris (high precision).
    Falls back to pyephem if pyswisseph is not available.
    """
    if not swe:
        print("pyswisseph not available, falling back to pyephem")
        return calculate_planetary_positions_pyephem(year, month, day, hour, minute, latitude, longitude, zodiac_system)
    try:
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
                # swe.calc_ut with FLG_SPEED returns:
                #   [0]=longitude(deg), [1]=latitude(deg), [2]=distance(AU),
                #   [3]=longitude_speed(deg/day), [4]=latitude_speed(deg/day), [5]=distance_speed(AU/day)
                positions_array = result[0]
                longitude = positions_array[0]
                ecliptic_latitude = positions_array[1]
                distance_au = positions_array[2]
                longitude_speed = positions_array[3]
                latitude_speed = positions_array[4]
                distance_speed = positions_array[5]

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
                    "longitudeSpeed": longitude_speed,  # degrees/day (signed; negative = retrograde)
                    "eclipticLatitude": ecliptic_latitude,  # degrees, positive = N of ecliptic
                    "latitudeSpeed": latitude_speed,  # degrees/day
                    "distance": distance_au,  # AU
                    "distanceSpeed": distance_speed,  # AU/day
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

        # Calculate Houses (specifically Ascendant and MC)
        try:
            # For sidereal, we already set the sidereal mode above if needed
            # swe.houses expects (julday, lat, lon), Returns (cusps, ascmc)
            # ascmc indices: 0 = Ascendant, 1 = MC, 2 = ARMC, 3 = Vertex, ...
            cusps, ascmc = swe.houses(julian_day, latitude, longitude)
            
            asc_longitude = ascmc[0] % 360
            mc_longitude = ascmc[1] % 360

            asc_sign_index = int(asc_longitude / 30)
            asc_degree_in_sign = asc_longitude % 30
            
            mc_sign_index = int(mc_longitude / 30)
            mc_degree_in_sign = mc_longitude % 30

            positions["Ascendant"] = {
                "sign": zodiac_signs[asc_sign_index],
                "degree": int(asc_degree_in_sign),
                "minute": int((asc_degree_in_sign - int(asc_degree_in_sign)) * 60),
                "exactLongitude": asc_longitude,
                "isRetrograde": False,
                "retrogradeSymbol": "",
            }

            positions["MC"] = {
                "sign": zodiac_signs[mc_sign_index],
                "degree": int(mc_degree_in_sign),
                "minute": int((mc_degree_in_sign - int(mc_degree_in_sign)) * 60),
                "exactLongitude": mc_longitude,
                "isRetrograde": False,
                "retrogradeSymbol": "",
            }
        except Exception as house_error:
            print(f"Error calculating houses: {house_error}")

        
        # Calculate Aspects
        aspects = []
        planet_names = list(planets.keys())
        for i in range(len(planet_names)):
            for j in range(i + 1, len(planet_names)):
                p1 = planet_names[i]
                p2 = planet_names[j]
                if p1 not in positions or p2 not in positions:
                    continue
                
                lon1 = positions[p1].get("exactLongitude", 0)
                lon2 = positions[p2].get("exactLongitude", 0)
                
                diff = abs(lon1 - lon2)
                if diff > 180:
                    diff = 360 - diff
                    
                # Aspects with orbs
                orb = 8
                aspect_types = [
                    ("Conjunction", 0, orb),
                    ("Sextile", 60, 6),
                    ("Square", 90, orb),
                    ("Trine", 120, orb),
                    ("Opposition", 180, orb)
                ]
                
                for a_name, a_angle, a_orb in aspect_types:
                    if abs(diff - a_angle) <= a_orb:
                        exactness = 1.0 - (abs(diff - a_angle) / a_orb)
                        aspects.append({
                            "planet1": p1,
                            "planet2": p2,
                            "aspect": a_name,
                            "angle": round(diff, 2),
                            "orb": a_orb,
                            "exactness": round(exactness, 4)
                        })
        positions["_aspects"] = aspects

        return {
            "positions": positions,
            "source": "pyswisseph",
            "precision": "NASA JPL DE (sub-arcsecond)",
            "zodiacSystem": zodiac_system
        }

    except Exception as e:
        print(f"Swiss Ephemeris calculation failed: {e}")
        # Fallback to pyephem
        return calculate_planetary_positions_pyephem(year, month, day, hour, minute, latitude, longitude, zodiac_system)

@lru_cache(maxsize=1024)
def calculate_planetary_positions_pyephem(
    year: int, month: int, day: int, hour: int = 0, minute: int = 0,
    latitude: float = 0.0, longitude: float = 0.0,
    zodiac_system: str = "tropical"
) -> Dict[str, Any]:
    """
    Fallback planetary position calculation using pyephem.

    Astrology is GEOCENTRIC: planet positions are computed as seen from Earth.
    pyephem's `body.hlon`/`body.hlat` are HELIOCENTRIC and must not be used here.
    We use `ephem.Ecliptic(body)` instead, which converts the apparent geocentric
    equatorial coords (already computed by `body.compute(observer)`) into geocentric
    ecliptic coordinates.

    Lower precision than Swiss Ephemeris but more reliable availability.
    """
    import math
    if not ephem:
        print("pyephem not available, cannot calculate planetary positions.")
        return {"error": "pyephem not installed or available."}

    try:
        # Create observer precisely at the birth location
        observer = ephem.Observer()
        observer.lat = str(latitude)
        observer.lon = str(longitude)
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
        # 1-hour finite difference for kinematics (degrees/day).
        DT_HOURS = 1.0
        DT_DAYS = DT_HOURS / 24.0
        future_observer = ephem.Observer()
        future_observer.lat = observer.lat
        future_observer.lon = observer.lon
        future_observer.date = observer.date + DT_HOURS / 24.0

        for planet_name, planet_obj in planets_map.items():
            try:
                # Geocentric apparent position from this observer
                planet_obj.compute(observer)
                ecl_now = ephem.Ecliptic(planet_obj)
                lon_deg = math.degrees(float(ecl_now.lon)) % 360
                lat_deg = math.degrees(float(ecl_now.lat))
                # pyephem reports earth_distance in AU for all bodies (including Moon).
                dist_au = float(planet_obj.earth_distance) \
                    if hasattr(planet_obj, "earth_distance") else 1.0

                # Finite-difference velocity at t + 1 hour
                future_planet = type(planet_obj)()
                future_planet.compute(future_observer)
                ecl_next = ephem.Ecliptic(future_planet)
                lon_next = math.degrees(float(ecl_next.lon)) % 360
                lat_next = math.degrees(float(ecl_next.lat))
                dist_next = float(future_planet.earth_distance) \
                    if hasattr(future_planet, "earth_distance") else dist_au

                d_lon = ((lon_next - lon_deg + 540) % 360) - 180  # wrap to (-180, 180]
                longitude_speed = d_lon / DT_DAYS
                latitude_speed = (lat_next - lat_deg) / DT_DAYS
                distance_speed = (dist_next - dist_au) / DT_DAYS

                is_retrograde = (
                    longitude_speed < 0
                    if planet_name not in ["Sun", "Moon"]
                    else False
                )

                sign_index = int(lon_deg / 30)
                degree_in_sign = lon_deg % 30
                degree = int(degree_in_sign)
                minute_in_sign = int((degree_in_sign - degree) * 60)
                arcminutes_per_day = longitude_speed * 60

                positions[planet_name] = {
                    "sign": zodiac_signs[sign_index],
                    "degree": degree,
                    "minute": minute_in_sign,
                    "exactLongitude": lon_deg,
                    "isRetrograde": is_retrograde,
                    "retrogradeSymbol": "℞" if is_retrograde else "",
                    "longitudeSpeed": longitude_speed,
                    "eclipticLatitude": lat_deg,
                    "latitudeSpeed": latitude_speed,
                    "distance": dist_au,
                    "distanceSpeed": distance_speed,
                    "arcminutesPerDay": round(arcminutes_per_day, 2),
                }
            except Exception as planet_error:
                print(f"Error calculating {planet_name} with pyephem: {planet_error}")

        
        # Calculate Aspects
        aspects = []
        planet_names = list(planets.keys())
        for i in range(len(planet_names)):
            for j in range(i + 1, len(planet_names)):
                p1 = planet_names[i]
                p2 = planet_names[j]
                if p1 not in positions or p2 not in positions:
                    continue
                
                lon1 = positions[p1].get("exactLongitude", 0)
                lon2 = positions[p2].get("exactLongitude", 0)
                
                diff = abs(lon1 - lon2)
                if diff > 180:
                    diff = 360 - diff
                    
                # Aspects with orbs
                orb = 8
                aspect_types = [
                    ("Conjunction", 0, orb),
                    ("Sextile", 60, 6),
                    ("Square", 90, orb),
                    ("Trine", 120, orb),
                    ("Opposition", 180, orb)
                ]
                
                for a_name, a_angle, a_orb in aspect_types:
                    if abs(diff - a_angle) <= a_orb:
                        exactness = 1.0 - (abs(diff - a_angle) / a_orb)
                        aspects.append({
                            "planet1": p1,
                            "planet2": p2,
                            "aspect": a_name,
                            "angle": round(diff, 2),
                            "orb": a_orb,
                            "exactness": round(exactness, 4)
                        })
        positions["_aspects"] = aspects

        return {
            "positions": positions,
            "source": "pyephem-fallback",
            "precision": "moderate (arcminute)",
            "zodiacSystem": zodiac_system
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Planetary calculation failed: {str(e)}")
