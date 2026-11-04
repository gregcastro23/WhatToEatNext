import swisseph as swe
import datetime
import math
import pytz # For robust timezone handling
from typing import List, Dict, Any, Optional
import os
from ..utils.transit_engine import get_transit_details, PLANETARY_ELEMENTS # Import these
from ..utils.seasonal_engine import get_seasonal_modifiers # Import for current zodiac
from ..utils.lunar_oracle import julian_day_utc

# Assuming project root is accessible or ephemeris path is configured globally
# Set the path to the Swiss Ephemeris data files.
# The user needs to ensure these files are available on the Mac Mini.
# Common paths for ephemeris data are often in /usr/local/share/sweph/ephe
# or relative to the application's entry point.
# For now, we'll try a common relative path, but this might need adjustment.
EPHE_PATH = os.environ.get('SWISSEPH_PATH', os.path.join(os.path.dirname(__file__), '..', '..', 'sweph_ephe'))
swe.set_ephe_path(EPHE_PATH)

# Chaldean order for planetary rulers (retrograde for hourly sequence)
# Starting with Saturn, then Jupiter, Mars, Sun, Venus, Mercury, Moon
CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]

# Map day of week (weekday() returns Monday=0, Sunday=6) to first hour ruler (Chaldean order)
# Sunday (6): Sun, Monday (0): Moon, Tuesday (1): Mars, Wednesday (2): Mercury,
# Thursday (3): Jupiter, Friday (4): Venus, Saturday (5): Saturn
DAY_OF_WEEK_RULERS = {
    6: "Sun",      # Sunday
    0: "Moon",     # Monday
    1: "Mars",     # Tuesday
    2: "Mercury",  # Wednesday
    3: "Jupiter",  # Thursday
    4: "Venus",    # Friday
    5: "Saturn"    # Saturday
}

# --- Elemental/Transmutation Mapping (Adjustable based on alchemical principles) ---
# These mappings define which planets are favorable for balancing certain imbalances.
# "Spirit/Kinetic" corresponds to planets that are generally considered more active, fiery, or energetic.
# "Matter/Grounding" corresponds to planets that are generally considered more stable, earthy, or nourishing.
PLANETARY_INFLUENCES = {
    "Matter Stagnation": { # Needs Spirit/Kinetic
        "favorable": ["Mars", "Sun", "Jupiter"],
        "recommendation_type": "High-Spirit (Kinetic) transmutation"
    },
    "Spirit Volatility": { # Needs Matter/Grounding
        "favorable": ["Saturn", "Venus", "Moon"],
        "recommendation_type": "Matter-balancing (Grounding) transmutation"
    }
}

def utc_datetime_from_julian_day(jd_utc: float) -> datetime.datetime:
    """The timezone-aware UTC datetime of a Julian day (UT): the inverse of lunar_oracle.julian_day_utc.

    swe.revjul returns (year, month, day, hour) with the time of day as ONE decimal-hours float.
    It has no minute or second to unpack: unpacking six values from it raised
    "not enough values to unpack (expected 6, got 4)".
    """
    year, month, day, hour = swe.revjul(jd_utc)
    return datetime.datetime(year, month, day, tzinfo=pytz.utc) + datetime.timedelta(hours=hour)


class TransmutationOracle:
    def __init__(self, latitude: float, longitude: float, timezone_str: str):
        self.latitude = latitude
        self.longitude = longitude
        self.timezone = pytz.timezone(timezone_str)

    def _start_of_local_day_utc(self, target_date: datetime.date) -> datetime.datetime:
        """The UTC instant at which `target_date` begins on the wall clock of the oracle's timezone.

        Local midnight is not 00:00 UTC, and not a fixed number of hours from the next local
        midnight: a day with a daylight-saving change is 23 or 25 hours long. A few zones change
        the clock AT midnight (Cuba, Lebanon, Chile, Paraguay, Brazil until 2019), and then pytz
        needs to be told which midnight is meant: when 00:00 is skipped the date begins when the
        gap ends, and when 00:00 happens twice it begins at the first.
        """
        midnight = datetime.datetime(target_date.year, target_date.month, target_date.day)
        try:
            local_midnight = self.timezone.localize(midnight, is_dst=None)
        except pytz.AmbiguousTimeError:
            local_midnight = self.timezone.localize(midnight, is_dst=True)
        except pytz.NonExistentTimeError:
            local_midnight = self.timezone.localize(midnight, is_dst=False)
        return local_midnight.astimezone(pytz.utc)

    def _next_sun_event_utc(self, after_utc: datetime.datetime, event: int) -> Optional[datetime.datetime]:
        """The first sunrise (event=swe.CALC_RISE) or sunset (swe.CALC_SET) after `after_utc`, in UTC.

        None when the Sun neither rises nor sets in the next day or so (polar day or night).
        The Sun's centre against the true horizon, with no refraction: the convention this
        oracle's hours have always used (BIT_DISC_CENTER | BIT_NO_REFRACTION).
        swe.rise_trans takes the event flags third and the observer as (longitude, latitude,
        altitude) fourth.
        """
        found, times = swe.rise_trans(
            julian_day_utc(after_utc), swe.SUN,
            event | swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION,
            (self.longitude, self.latitude, 0.0),
        )
        if found != 0:
            return None
        return utc_datetime_from_julian_day(times[0])

    def get_daily_planetary_hours(self, target_date: datetime.date) -> Optional[Dict[str, Any]]:
        """
        Calculates planetary hours for a given date and the oracle's location.

        The day hours run from the date's sunrise to its sunset, the night hours from that sunset to
        the next sunrise, twelve equal parts each. Every boundary is computed in UTC and converted to
        local time at the end, so a night that crosses a daylight-saving change keeps its true
        length and every local time carries the offset in force at that instant.
        """
        # Each event is searched for after the one before it, so the three are in order whatever the
        # latitude; the first is searched for from the start of the local date.
        sunrise_utc = self._next_sun_event_utc(self._start_of_local_day_utc(target_date), swe.CALC_RISE)
        sunset_utc = self._next_sun_event_utc(sunrise_utc, swe.CALC_SET) if sunrise_utc else None
        next_sunrise_utc = self._next_sun_event_utc(sunset_utc, swe.CALC_RISE) if sunset_utc else None

        if not (sunrise_utc and sunset_utc and next_sunrise_utc):
            print(f"Error calculating sunrise/sunset for {target_date}. Check coordinates and ephemeris path.")
            return None

        # Localized sunrise and sunset datetimes
        sunrise_local = sunrise_utc.astimezone(self.timezone)
        sunset_local = sunset_utc.astimezone(self.timezone)

        # Determine the ruling planet for the first hour of the day
        day_of_week = sunrise_local.weekday()  # Monday=0, Sunday=6
        first_hour_ruler = DAY_OF_WEEK_RULERS.get(day_of_week)
        if not first_hour_ruler:
            print(f"Could not determine first hour ruler for {sunrise_local.strftime('%A')}.")
            return None

        # Find the index of the first hour ruler in the Chaldean order
        try:
            start_index = CHALDEAN_ORDER.index(first_hour_ruler)
        except ValueError:
            print(f"Ruler '{first_hour_ruler}' not found in Chaldean order.")
            return None

        # Calculate length of each planetary hour (UTC datetimes: the arithmetic is on instants)
        day_hour_length = (sunset_utc - sunrise_utc) / 12
        night_hour_length = (next_sunrise_utc - sunset_utc) / 12

        planetary_hours: List[Dict[str, Any]] = []
        current_time = sunrise_utc

        # Day hours
        for i in range(12):
            end_time = current_time + day_hour_length
            ruler_index = (start_index - i) % 7 # Chaldean order is retrograde
            ruling_planet = CHALDEAN_ORDER[ruler_index]
            planetary_hours.append({
                "period": "day",
                "hour_number": i + 1,
                "start_time": current_time.astimezone(self.timezone),
                "end_time": end_time.astimezone(self.timezone),
                "ruling_planet": ruling_planet
            })
            current_time = end_time

        # Night hours
        current_time = sunset_utc
        # The ruling planet sequence continues from where the day left off.
        # The next planet in the sequence after the 12th day hour ruler is the 1st night hour ruler.
        night_start_ruler_index = (start_index - 12) % 7

        for i in range(12):
            end_time = current_time + night_hour_length
            ruler_index = (night_start_ruler_index - i) % 7
            ruling_planet = CHALDEAN_ORDER[ruler_index]
            planetary_hours.append({
                "period": "night",
                "hour_number": i + 1,
                "start_time": current_time.astimezone(self.timezone),
                "end_time": end_time.astimezone(self.timezone),
                "ruling_planet": ruling_planet
            })
            current_time = end_time

        return {
            "date": target_date.isoformat(),
            "sunrise": sunrise_local,
            "sunset": sunset_local,
            "planetary_hours": planetary_hours
        }

    def get_transmutation_recommendation(self, imbalance_type: str, num_days_forecast: int = 3) -> List[Dict[str, Any]]:
        """
        Generates transmutation recommendations based on current imbalance and upcoming planetary hours.
        """
        recommendations = []
        now_local = datetime.datetime.now(self.timezone)
        
        if imbalance_type not in PLANETARY_INFLUENCES:
            return [{"error": f"Unknown imbalance type: {imbalance_type}"}]

        favorable_planets = PLANETARY_INFLUENCES[imbalance_type]["favorable"]
        recommendation_type = PLANETARY_INFLUENCES[imbalance_type]["recommendation_type"]

        # --- Get common astrological context for Steam synergy calculation ---
        transit_info = get_transit_details()
        common_sun_element = transit_info.get("sun_element")

        seasonal_modifiers = get_seasonal_modifiers()
        current_zodiac_season = seasonal_modifiers.get('current_zodiac')
        # --- End common astrological context ---

        for i in range(num_days_forecast):
            target_date = (now_local + datetime.timedelta(days=i)).date()
            daily_hours = self.get_daily_planetary_hours(target_date)

            if daily_hours:
                for ph in daily_hours["planetary_hours"]:
                    if ph["ruling_planet"] in favorable_planets:
                        # Only recommend for future hours
                        if ph["end_time"] > now_local:
                            recommendations.append({
                                "date": ph["start_time"].strftime("%A, %B %d, %Y"),
                                "time_range": f"{ph['start_time'].strftime('%I:%M %p')} - {ph['end_time'].strftime('%I:%M %p %Z')}",
                                "ruling_planet": ph["ruling_planet"],
                                "imbalance_to_address": imbalance_type,
                                "recommendation_text": (
                                    f"You are {imbalance_type.replace(' Stagnation', '-heavy').replace(' Volatility', '-heavy')}; "
                                    f"the upcoming {ph['ruling_planet']} Hour on "
                                    f"{ph['start_time'].strftime('%A')} at {ph['start_time'].strftime('%I:%M %p')} "
                                    f"is an optimal window for a {recommendation_type}."
                                ),
                                "total_potency_score_multiplier": self._calculate_potency_multiplier(
                                    ph["ruling_planet"],
                                    imbalance_type,
                                    common_sun_element, # Pass sun_element
                                    current_zodiac_season # Pass current_zodiac_season
                                )
                            })
        return recommendations

    def _calculate_potency_multiplier(self, ruling_planet: str, imbalance_type: str, 
                                      sun_element: Optional[str], current_zodiac_season: Optional[str]) -> float:
        """
        Calculates a hypothetical potency multiplier based on the ruling planet, imbalance,
        and "Steam" synergy for Fire/Water conflicts.
        """
        # Base multiplier
        multiplier = 1.0

        # Boost for favorable planets (general affinity)
        if ruling_planet in PLANETARY_INFLUENCES[imbalance_type]["favorable"]:
            multiplier *= 1.5 # 50% boost for favorable planet

        # --- Apply "Steam" modifier for elemental conflicts ---
        # This part requires the planetary element map
        hour_element = PLANETARY_ELEMENTS.get(ruling_planet)
        
        # Determine current solar season element from current_zodiac_season
        solar_season_element = None
        if current_zodiac_season:
            # Simplified mapping: Aries, Leo, Sagittarius (Fire), Taurus, Virgo, Capricorn (Earth), etc.
            if current_zodiac_season in ['Aries', 'Leo', 'Sagittarius']:
                solar_season_element = "Fire"
            elif current_zodiac_season in ['Taurus', 'Virgo', 'Capricorn']:
                solar_season_element = "Earth"
            elif current_zodiac_season in ['Gemini', 'Libra', 'Aquarius']:
                solar_season_element = "Air"
            elif current_zodiac_season in ['Cancer', 'Scorpio', 'Pisces']:
                solar_season_element = "Water"

        if solar_season_element and hour_element:
            # Check for "Steam" conflict conditions (Fire/Water or Air/Earth opposition)
            if (solar_season_element == "Fire" and hour_element == "Water") or \
               (solar_season_element == "Water" and hour_element == "Fire") or \
               (solar_season_element == "Air" and hour_element == "Earth") or \
               (solar_season_element == "Earth" and hour_element == "Air"):
                multiplier *= 1.5 # Additional 50% boost for "Steam" synergy

        return round(multiplier, 2)


# --- Example Usage (for testing purposes, will be integrated later) ---
if __name__ == "__main__":
    # Import config for coordinates
    from backend.config.celestial_config import FOREST_HILLS_COORDINATES

    print(f"Using Swiss Ephemeris data path: {EPHE_PATH}")
    if not os.path.exists(EPHE_PATH):
        print(f"WARNING: Swiss Ephemeris path '{EPHE_PATH}' does not exist. Please download the ephemeris files (e.g., from astro.com/ftp/swisseph/ephe/) and place them there, or set the SWISSEPH_PATH environment variable.")

    # Instantiate the oracle for Forest Hills
    oracle = TransmutationOracle(
        latitude=FOREST_HILLS_COORDINATES["latitude"],
        longitude=FOREST_HILLS_COORDINATES["longitude"],
        timezone_str=FOREST_HILLS_COORDINATES["timezone"]
    )

    print("\n--- Testing Matter Stagnation Recommendation ---")
    matter_stagnation_recs = oracle.get_transmutation_recommendation("Matter Stagnation")
    if matter_stagnation_recs:
        for rec in matter_stagnation_recs:
            print(f"  - {rec['recommendation_text']} (Potency Multiplier: {rec['total_potency_score_multiplier']})")
    else:
        print("  No Matter Stagnation recommendations found for the next 3 days.")

    print("\n--- Testing Spirit Volatility Recommendation ---")
    spirit_volatility_recs = oracle.get_transmutation_recommendation("Spirit Volatility")
    if spirit_volatility_recs:
        for rec in spirit_volatility_recs:
            print(f"  - {rec['recommendation_text']} (Potency Multiplier: {rec['total_potency_score_multiplier']})")
    else:
        print("  No Spirit Volatility recommendations found for the next 3 days.")

    print("\n--- Testing Unknown Imbalance Type ---")
    unknown_recs = oracle.get_transmutation_recommendation("Unknown Imbalance")
    print(f"  {unknown_recs[0]['error']}")
