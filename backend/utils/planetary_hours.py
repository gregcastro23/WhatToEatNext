"""Which planet rules a moment at a place: the classical planetary hours.

The rule (the classical one, in the order the Chaldeans gave the planets):

  * The planetary DAY runs from one sunrise to the next. Its first hour belongs to the planet of the
    weekday on which that sunrise falls (DAY_RULERS).
  * The time from sunrise to sunset is divided into 12 equal day hours, and from sunset to the next
    sunrise into 12 equal night hours. They are unequal in minutes except at the equinoxes.
  * Each hour belongs to the NEXT planet in CHALDEAN_ORDER after the one before it, wrapping from the
    Moon to Saturn. So the 25th hour, the first of the next day, is three planets on, which is
    DAY_RULERS' next entry (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn): the table and the order
    agree only when the hours advance, which is how the days got the planets they have.

The code that stood here (transit_engine.get_planetary_hour, and a copy in the /api/tokens/calculate
route) had four defects, found by running it against the oracle in transmutation_oracle.py:

  1. The day's ruler was CHALDEAN_ORDER[(weekday + 1) % 7]: the planets by orbital speed indexed by the
     weekday number, which is the right planet on Tuesday only (1 day of 7).
  2. The weekday was that of the current moment in UTC, not at the place, so every evening after 00:00 UTC
     (from 19:00 or 20:00 in New York) the hour belonged to tomorrow's planet.
  3. Between midnight and sunrise it used the new calendar day's planet; the planetary day that is
     still running began at yesterday's sunrise.
  4. It asked astral for sunrise and sunset "on a date". astral computes a time of day and stamps the
     UTC date it was asked about on it, so wherever the event falls on the neighbouring UTC date the
     answer is a day out: New York's sunset on a summer evening (00:30 UTC) came back as the PREVIOUS
     evening's, before the sunrise, and the daytime branch could never run; near 00:00 UTC astral also
     answers two dates with one event. Here the sun's events come from swe.rise_trans, which finds the
     next real event after an instant and has no date convention.

Sunrise and sunset are the usual ones: the Sun's centre 0.8333 degrees below the horizon, which is its upper
limb on the horizon through 34' of standard refraction (the Sun's semidiameter is 16'). NOAA, the USNO and astral
use that figure, and so did this function when it asked astral. swe.rise_trans' own default, the upper limb
through the library's refraction model, puts the centre at 0.8746 degrees, up to a minute away at 64N. The oracle
in transmutation_oracle.py uses the Sun's centre on the horizon with no refraction, the astrological
convention, about four minutes from these at mid latitudes.

The weekday is that of the LOCAL MEAN SOLAR date of the sunrise (UTC plus longitude / 15 hours): it needs
no timezone database and no timezone from the caller. It is the civil weekday everywhere except where the
civil date is on the other side of the date line from the longitude (Kiritimati, the Chatham Islands,
Tonga, Samoa) or the sunrise is within a few hours of midnight (the polar summer), where it can be a day
out.
"""
import datetime
from typing import NamedTuple, Optional

from backend.utils.ephemeris import swe
from backend.utils.lunar_oracle import julian_day_utc

# The planets by slowest apparent orbit first. Each hour of the day belongs to the next one in this list.
CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]

# The planet of each weekday, Monday=0 as date.weekday() has it: Monday is the Moon's day, Sunday the Sun's.
DAY_RULERS = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]

# The Sun's centre below the horizon at sunrise and sunset: 34' of refraction + 16' of semidiameter.
STANDARD_DEPRESSION = -(34 + 16) / 60

# A planetary day is the time between two sunrises. Where the Sun rises daily, consecutive sunrises are
# 24 hours apart to within 0.75 hours (measured with swe.rise_trans: 39,593 consecutive gaps at latitudes
# 0 to 80 and -30, -60 and -75, five longitudes, every day of 2025; the largest was 23.25 hours at 76N in
# April; backend/tests/test_planetary_hours.py repeats a sample of it). A longer span means a sunrise is
# missing, and there are no planetary hours: the bound is 24 hours plus 2.
LONGEST_PLANETARY_DAY = datetime.timedelta(hours=26)


def utc_datetime_from_julian_day(jd_utc: float) -> datetime.datetime:
    """The timezone-aware UTC datetime of a Julian day (UT): the inverse of lunar_oracle.julian_day_utc.

    swe.revjul returns (year, month, day, hour) with the time of day as ONE decimal-hours float.
    """
    year, month, day, hour = swe.revjul(jd_utc)
    return datetime.datetime(year, month, day, tzinfo=datetime.timezone.utc) + datetime.timedelta(hours=hour)


class PlanetaryHour(NamedTuple):
    ruler: str                        # the planet that rules the hour the moment is in
    is_daytime: bool                  # between sunrise and sunset
    hour: int                         # 0-23: whole hours since the planetary day began at sunrise (0-11 by day, 12-23 by night)
    day_ruler: str                    # the planet of the planetary day the moment is in
    sunrise: datetime.datetime        # the sunrise that began the planetary day, aware UTC
    sunset: datetime.datetime         # its sunset
    next_sunrise: datetime.datetime   # the sunrise that ends it


def _next_event(after: datetime.datetime, event: int, latitude: float, longitude: float) -> Optional[datetime.datetime]:
    """The first sunrise (event=swe.CALC_RISE) or sunset (swe.CALC_SET) after `after`, in UTC; None where there is none.

    The Sun's centre at STANDARD_DEPRESSION below the horizon, with no further refraction.
    """
    found, times = swe.rise_trans_true_hor(
        julian_day_utc(after), swe.SUN, event | swe.BIT_DISC_CENTER | swe.BIT_NO_REFRACTION,
        (longitude, latitude, 0.0), 0.0, 0.0, STANDARD_DEPRESSION,
    )
    if found != 0:
        return None
    return utc_datetime_from_julian_day(times[0])


def planetary_hour_at(moment: datetime.datetime, latitude: float, longitude: float) -> PlanetaryHour:
    """The planetary hour `moment` (aware; a naive one is taken as UTC) falls in at (latitude, longitude).

    Raises ValueError where the Sun does not rise and set around that moment (the polar day and night),
    and ImportError when pyswisseph is not installed.
    """
    if swe is None:
        raise ImportError("pyswisseph is required to compute planetary hours")
    if moment.tzinfo is None:
        moment = moment.replace(tzinfo=datetime.timezone.utc)
    moment = moment.astimezone(datetime.timezone.utc)

    # The latest sunrise at or before the moment, and the first after it. swe.rise_trans looks about 24 hours
    # ahead, and at the edge of the polar night consecutive sunrises are 24 h 10 min apart (Tromso, late
    # November: asked one minute after a sunrise it finds none), so each search starts six hours after the
    # sunrise before it; the first starts 30 hours back, which reaches the latest sunrise at or before the moment.
    sunrise = _next_event(moment - datetime.timedelta(hours=30), swe.CALC_RISE, latitude, longitude)
    start = None
    for _ in range(4):
        if sunrise is None or sunrise > moment:
            break
        start = sunrise
        sunrise = _next_event(start + datetime.timedelta(hours=6), swe.CALC_RISE, latitude, longitude)
    end = sunrise
    if start is None or end is None or end <= moment or end - start > LONGEST_PLANETARY_DAY:
        raise ValueError("The Sun does not rise and set around this moment at this location.")
    sunset = _next_event(start, swe.CALC_SET, latitude, longitude)
    if sunset is None or not start < sunset < end:
        raise ValueError("The Sun does not rise and set around this moment at this location.")

    local_date = (start + datetime.timedelta(hours=longitude / 15.0)).date()
    day_ruler = DAY_RULERS[local_date.weekday()]
    # timedelta // timedelta is an exact integer division: no rounding to a microsecond can push a moment just
    # before sunset into hour 12, or one just before the next sunrise into hour 24.
    if moment < sunset:
        hour = (moment - start) * 12 // (sunset - start)
        is_daytime = True
    else:
        hour = 12 + (moment - sunset) * 12 // (end - sunset)
        is_daytime = False
    ruler = CHALDEAN_ORDER[(CHALDEAN_ORDER.index(day_ruler) + hour) % 7]
    return PlanetaryHour(
        ruler=ruler, is_daytime=is_daytime, hour=hour, day_ruler=day_ruler,
        sunrise=start, sunset=sunset, next_sunrise=end,
    )
