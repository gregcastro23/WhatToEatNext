"""TransmutationOracle.get_daily_planetary_hours runs, and it runs for the right local day.

It raised on every call, three defects deep, each hidden by the one before (pyswisseph 2.10.3.2):

  swe.julday(y, m, d, hours, minutes, seconds, swe.UTC)   AttributeError: swisseph has no `UTC`, and
        julday takes ONE decimal-hours argument and then the CALENDAR FLAG (0 Julian, 1 Gregorian).
  swe.rise_trans(jd, swe.SUN, lon, lat, rsmi=...)         TypeError: the third parameter is the event
        flags and the observer is ONE (longitude, latitude, altitude) sequence, fourth.
  year, month, day, hour, minute, second = swe.revjul(jd) ValueError: revjul returns four values, the
        time of day as a decimal.

Two more were waiting behind them. The search began at 00:00 UTC of the date instead of at local
midnight, which for a place east of Greenwich is after sunrise (the NEXT day's sunrise) and for one far
west is before the previous sunset (the PREVIOUS day's sunset); and the hours were stepped in the
sunrise's fixed UTC offset, so a night that crosses a daylight-saving change printed an hour that
never was.

These tests run the real function with the real library. The expected values do not come from the
code under test: the sun's times come from astral (a NOAA-based calculation that shares no code with
Swiss Ephemeris), the Sun's altitude from swe.azalt, the start of a local date from a minute-by-minute
scan of the zone's own clock, and the weekdays' planets from the classical table.
Needs pyswisseph, astral, pytz and pydantic (the CI step installs them).
"""
import datetime
import types

import pytest
import pytz
import swisseph as swe
from astral import Observer, SunDirection
from astral.sun import time_at_elevation

import backend.utils.transmutation_oracle as oracle_module
from backend.utils.lunar_oracle import julian_day_utc
from backend.utils.transmutation_oracle import TransmutationOracle, utc_datetime_from_julian_day

ONE_DAY = datetime.timedelta(days=1)

# name: (latitude, longitude, timezone). Mid-latitude to sub-polar, both hemispheres, offsets from -10
# to +13:45, whole-, half- and quarter-hour, with and without daylight saving.
PLACES = {
    "New York": (40.7128, -74.0060, "America/New_York"),
    "London": (51.5074, -0.1278, "Europe/London"),
    "Tokyo": (35.6762, 139.6503, "Asia/Tokyo"),
    "Sydney": (-33.8688, 151.2093, "Australia/Sydney"),
    "Honolulu": (21.3069, -157.8583, "Pacific/Honolulu"),
    "Auckland": (-36.8485, 174.7633, "Pacific/Auckland"),
    "Kolkata": (22.5726, 88.3639, "Asia/Kolkata"),
    "Kathmandu": (27.7172, 85.3240, "Asia/Kathmandu"),
    "Chatham Islands": (-43.95, -176.55, "Pacific/Chatham"),
    "Quito": (-0.1807, -78.4678, "America/Guayaquil"),
    "Anchorage": (61.2181, -149.9003, "America/Anchorage"),
    "Reykjavik": (64.1466, -21.9426, "Atlantic/Reykjavik"),
}
# The solstices and equinoxes, and the days the clock changes in the US, the EU, Australia and New Zealand.
DATES = [datetime.date(2025, month, day) for month, day in (
    (1, 15), (3, 9), (3, 20), (3, 30), (4, 6), (6, 21), (9, 28), (10, 5), (10, 26), (11, 2), (12, 21),
)]

# The planet of each weekday, Monday=0 as date.weekday() has it: the classical table, restated here
# rather than read from the module under test.
WEEKDAY_PLANET = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]


def hours_for(place, day):
    latitude, longitude, zone = PLACES[place]
    return TransmutationOracle(latitude, longitude, zone).get_daily_planetary_hours(day)


# --- the pieces of the answer -------------------------------------------------------------------

@pytest.mark.parametrize("place", sorted(PLACES))
@pytest.mark.parametrize("day", DATES, ids=str)
def test_sunrise_and_sunset_are_on_the_local_date_in_order(place, day):
    result = hours_for(place, day)
    assert result is not None
    ph = result["planetary_hours"]
    assert result["sunrise"].date() == day
    assert result["sunset"].date() == day
    # the night ends at the NEXT local date's sunrise, whatever the zone's offset from UTC
    assert ph[-1]["end_time"].date() == day + ONE_DAY
    assert result["sunrise"] < result["sunset"] < ph[-1]["end_time"]


@pytest.mark.parametrize("place", sorted(PLACES))
@pytest.mark.parametrize("day", DATES, ids=str)
def test_the_twenty_four_hours_tile_the_day_and_the_night(place, day):
    result = hours_for(place, day)
    ph = result["planetary_hours"]
    assert [h["period"] for h in ph] == ["day"] * 12 + ["night"] * 12
    assert [h["hour_number"] for h in ph] == list(range(1, 13)) * 2
    # timedelta / 12 rounds to a microsecond, so twelve hours miss the exact span by at most 12 of them
    rounding = datetime.timedelta(microseconds=12)
    assert ph[0]["start_time"] == result["sunrise"]
    assert abs(ph[11]["end_time"] - result["sunset"]) <= rounding
    assert ph[12]["start_time"] == result["sunset"]
    for first, second in zip(ph, ph[1:]):
        if first["period"] == second["period"]:
            assert first["end_time"] == second["start_time"]
    for period in ("day", "night"):
        lengths = {h["end_time"] - h["start_time"] for h in ph if h["period"] == period}
        assert len(lengths) == 1, f"the {period} hours are not of equal length"


@pytest.mark.parametrize("place", sorted(PLACES))
def test_the_first_hour_belongs_to_the_planet_of_the_weekday(place):
    for offset in range(7):
        day = datetime.date(2025, 6, 16) + datetime.timedelta(days=offset)
        first = hours_for(place, day)["planetary_hours"][0]
        assert first["ruling_planet"] == WEEKDAY_PLANET[day.weekday()], f"{day:%A}"


# --- against independent calculations -----------------------------------------------------------

def astral_events(place, day, direction):
    """astral's events that fall on the LOCAL date `day`.

    astral reads its `date` argument as a UTC date, so for a zone east of Greenwich it can answer with
    the event of the day after (measured: Auckland, 2025-01-15, asked for the 15th, answered the 16th).
    The local day's event is among the answers for the days around it. Sun's centre on the geometric
    horizon: elevation 0 without refraction, the oracle's BIT_DISC_CENTER | BIT_NO_REFRACTION.
    """
    latitude, longitude, zone_name = PLACES[place]
    zone = pytz.timezone(zone_name)
    observer = Observer(latitude=latitude, longitude=longitude, elevation=0)
    events = []
    for offset in (-1, 0, 1):
        event = time_at_elevation(
            observer, 0, day + datetime.timedelta(days=offset), direction, zone, with_refraction=False,
        )
        if event.date() == day:
            events.append(event)
    return events


@pytest.mark.parametrize("place", sorted(PLACES))
@pytest.mark.parametrize("day", DATES, ids=str)
def test_sunrise_and_sunset_agree_with_an_independent_solar_calculation(place, day):
    # NOAA states its sunrise and sunset to be accurate to a minute between 72 degrees north and
    # south, which astral implements; measured over these 12 places and 11 dates the two differ by at
    # most 5.8 seconds. A wrong day, a wrong zone offset or a swapped latitude is hours.
    tolerance = datetime.timedelta(seconds=60)
    result = hours_for(place, day)
    for key, direction in (("sunrise", SunDirection.RISING), ("sunset", SunDirection.SETTING)):
        independent = astral_events(place, day, direction)
        assert len(independent) == 1, f"astral gave {len(independent)} {key}s on {day}"
        assert abs(result[key] - independent[0]) <= tolerance, f"{key}: {result[key]} vs astral {independent[0]}"


@pytest.mark.parametrize("place", ["New York", "Tokyo", "Auckland", "Reykjavik"])
@pytest.mark.parametrize("day", [datetime.date(2025, 1, 15), datetime.date(2025, 6, 21)], ids=str)
def test_the_sun_stands_on_the_horizon_at_the_returned_times(place, day):
    # swe.azalt's altitude is geocentric, and rise_trans's is topocentric: the Sun's horizontal parallax,
    # 8.8 arcseconds = 0.0024 degrees (measured 0.0024 to 0.0025), is the whole difference. The
    # tolerance, 0.01 degrees, adds about two seconds of the Sun's motion (at most 0.004 degrees a
    # second). Five minutes' error is 0.8 degrees and a latitude/longitude swap 7 degrees.
    latitude, longitude, _zone = PLACES[place]
    result = hours_for(place, day)
    for key in ("sunrise", "sunset"):
        jd = julian_day_utc(result[key])
        (sun_longitude, sun_latitude, distance, *_rest), _flags = swe.calc_ut(jd, swe.SUN)
        _azimuth, true_altitude, _apparent = swe.azalt(
            jd, swe.ECL2HOR, (longitude, latitude, 0.0), 0.0, 0.0, (sun_longitude, sun_latitude, distance),
        )
        assert abs(true_altitude) < 0.01, f"{place} {day} {key}: the Sun is at {true_altitude} degrees"


# --- local midnight, daylight saving ------------------------------------------------------------

def earliest_instant_on(zone_name, day):
    """The first minute whose wall-clock date in the zone is `day`, found by scanning the zone's own clock."""
    zone = pytz.timezone(zone_name)
    instant = datetime.datetime(day.year, day.month, day.day, tzinfo=pytz.utc) - datetime.timedelta(hours=16)
    while instant.astimezone(zone).date() < day:
        instant += datetime.timedelta(minutes=1)
    return instant


CLOCK_CHANGES = [
    ("America/New_York", datetime.date(2025, 3, 9)),     # 02:00 -> 03:00, a 23-hour day
    ("America/New_York", datetime.date(2025, 3, 10)),
    ("America/New_York", datetime.date(2025, 11, 2)),    # 02:00 -> 01:00, a 25-hour day
    ("America/New_York", datetime.date(2025, 11, 3)),
    ("Europe/London", datetime.date(2025, 3, 30)),
    ("Europe/London", datetime.date(2025, 10, 26)),
    ("Australia/Sydney", datetime.date(2025, 4, 6)),
    ("Australia/Sydney", datetime.date(2025, 10, 5)),
    ("Pacific/Auckland", datetime.date(2025, 9, 28)),
    ("Pacific/Chatham", datetime.date(2025, 4, 6)),
    # the clock changes AT midnight in these: 00:00 is skipped ...
    ("America/Havana", datetime.date(2025, 3, 9)),
    ("America/Sao_Paulo", datetime.date(2018, 11, 4)),
    ("Asia/Beirut", datetime.date(2025, 3, 30)),
    ("America/Santiago", datetime.date(2025, 9, 7)),
    # ... or happens twice
    ("America/Havana", datetime.date(2025, 11, 2)),
]


@pytest.mark.parametrize("zone_name,day", CLOCK_CHANGES, ids=[f"{z}-{d}" for z, d in CLOCK_CHANGES])
def test_a_local_date_begins_at_the_first_instant_the_zones_clock_reads_it(zone_name, day):
    oracle = TransmutationOracle(0.0, 0.0, zone_name)
    assert oracle._start_of_local_day_utc(day) == earliest_instant_on(zone_name, day)


NIGHTS_ACROSS_A_CLOCK_CHANGE = [
    # (zone, the date whose sunset starts the night, how the wall clock differs from the elapsed time)
    ("America/New_York", datetime.date(2025, 3, 8), datetime.timedelta(hours=1)),    # spring forward
    ("America/New_York", datetime.date(2025, 11, 1), -datetime.timedelta(hours=1)),  # fall back
    ("Europe/London", datetime.date(2025, 3, 29), datetime.timedelta(hours=1)),
    ("Europe/London", datetime.date(2025, 10, 25), -datetime.timedelta(hours=1)),
    ("Australia/Sydney", datetime.date(2025, 10, 4), datetime.timedelta(hours=1)),
    ("Australia/Sydney", datetime.date(2025, 4, 5), -datetime.timedelta(hours=1)),
]
ZONE_CENTRES = {
    "America/New_York": PLACES["New York"], "Europe/London": PLACES["London"], "Australia/Sydney": PLACES["Sydney"],
}


@pytest.mark.parametrize("zone_name,day,jump", NIGHTS_ACROSS_A_CLOCK_CHANGE, ids=[f"{z}-{d}" for z, d, _ in NIGHTS_ACROSS_A_CLOCK_CHANGE])
def test_the_hour_a_clock_change_falls_in_shows_the_jump_and_every_time_carries_its_own_offset(zone_name, day, jump):
    latitude, longitude, _zone = ZONE_CENTRES[zone_name]
    zone = pytz.timezone(zone_name)
    result = TransmutationOracle(latitude, longitude, zone_name).get_daily_planetary_hours(day)
    ph = result["planetary_hours"]
    # Every time carries the offset the zone has AT THAT INSTANT. Stepping the hours in the sunset's
    # fixed offset keeps the instants right but prints the wall clock an hour wrong after the change.
    for moment in [result["sunrise"], result["sunset"]] + [h[k] for h in ph for k in ("start_time", "end_time")]:
        assert moment.utcoffset() == moment.astimezone(zone).utcoffset(), moment
    # Exactly one night hour spans the change: its wall-clock span differs from the time that passed
    # by the size of the jump; the other twenty-three do not.
    skews = [
        (h["end_time"].replace(tzinfo=None) - h["start_time"].replace(tzinfo=None)) - (h["end_time"] - h["start_time"])
        for h in ph
    ]
    skewed = [(index, skew) for index, skew in enumerate(skews) if skew != datetime.timedelta(0)]
    assert len(skewed) == 1, skewed
    index, skew = skewed[0]
    assert skew == jump
    assert ph[index]["period"] == "night"


# --- the Julian day conversion ------------------------------------------------------------------

def unix_julian_day(moment):
    """Julian day (UT) from the Unix epoch, independent of swisseph: valid for Gregorian dates."""
    return 2440587.5 + (moment - datetime.datetime(1970, 1, 1, tzinfo=pytz.utc)).total_seconds() / 86400.0


UTC_MOMENTS = [
    datetime.datetime(1970, 1, 1, tzinfo=pytz.utc),
    datetime.datetime(2000, 1, 1, 12, 0, tzinfo=pytz.utc),          # J2000.0 = JD 2451545.0
    datetime.datetime(2024, 2, 29, 23, 59, 59, tzinfo=pytz.utc),    # a leap day, the last second
    datetime.datetime(2025, 3, 9, 7, 30, 15, 333062, tzinfo=pytz.utc),
    datetime.datetime(2025, 12, 31, 23, 59, 59, tzinfo=pytz.utc),   # the year's last second
    datetime.datetime(2100, 1, 1, tzinfo=pytz.utc),
]


@pytest.mark.parametrize("moment", UTC_MOMENTS, ids=str)
def test_a_julian_day_converts_back_to_the_utc_moment_it_came_from(moment):
    # JD 2.4e6 as a double resolves 2^-52 * 2.4e6 days = 0.5e-9 days = 40 microseconds; swe.julday adds
    # its own rounding, so 1 millisecond is the bound this holds to with room to spare.
    back = utc_datetime_from_julian_day(unix_julian_day(moment))
    assert back.tzinfo is not None and back.utcoffset() == datetime.timedelta(0)
    assert abs(back - moment) < datetime.timedelta(milliseconds=1)
    assert abs(utc_datetime_from_julian_day(julian_day_utc(moment)) - moment) < datetime.timedelta(milliseconds=1)


def test_j2000_is_noon_on_the_first_of_january_2000():
    assert utc_datetime_from_julian_day(2451545.0) == datetime.datetime(2000, 1, 1, 12, 0, tzinfo=pytz.utc)


# --- the polar day and night, and a sunset after midnight ---------------------------------------

TROMSO = (69.6492, 18.9553, "Europe/Oslo")


@pytest.mark.parametrize("day", [datetime.date(2025, 1, 15), datetime.date(2025, 6, 21), datetime.date(2025, 12, 21)], ids=str)
def test_there_are_no_hours_where_the_sun_does_not_rise_or_does_not_set(day, capsys):
    assert TransmutationOracle(*TROMSO).get_daily_planetary_hours(day) is None
    assert "Error calculating sunrise/sunset" in capsys.readouterr().out


def test_a_sunset_after_midnight_still_ends_its_own_day_not_the_one_before():
    # Tromso, 2025-07-22: the Sun rises at 01:12, sets at 00:11 on the 23rd and rises again at 01:30. The
    # first sunset after local midnight is the previous day's, at 00:3x on the 22nd, which is before
    # this day's sunrise: searched from midnight the day would be a negative length.
    result = TransmutationOracle(*TROMSO).get_daily_planetary_hours(datetime.date(2025, 7, 22))
    assert result["sunrise"].date() == datetime.date(2025, 7, 22)
    assert result["sunset"].date() == datetime.date(2025, 7, 23)
    assert result["sunrise"] < result["sunset"] < result["planetary_hours"][-1]["end_time"]
    assert (result["sunset"] - result["sunrise"]) > datetime.timedelta(hours=22)


# --- the recommendation built on the hours ------------------------------------------------------

FROZEN_NOW = datetime.datetime(2025, 6, 21, 16, 0, tzinfo=pytz.utc)  # Saturday 12:00 in New York


class FrozenClock(datetime.datetime):
    @classmethod
    def now(cls, tz=None):
        return FROZEN_NOW.astimezone(tz) if tz else FROZEN_NOW


@pytest.fixture
def frozen(monkeypatch):
    monkeypatch.setattr(
        oracle_module, "datetime",
        types.SimpleNamespace(datetime=FrozenClock, timedelta=datetime.timedelta, date=datetime.date),
    )


def test_matter_stagnation_is_offered_the_future_hours_of_mars_the_sun_and_jupiter(frozen):
    latitude, longitude, zone = PLACES["New York"]
    oracle = TransmutationOracle(latitude, longitude, zone)
    recommendations = oracle.get_transmutation_recommendation("Matter Stagnation", num_days_forecast=2)

    expected = []
    for day in (datetime.date(2025, 6, 21), datetime.date(2025, 6, 22)):
        for hour in oracle.get_daily_planetary_hours(day)["planetary_hours"]:
            if hour["ruling_planet"] in ("Mars", "Sun", "Jupiter") and hour["end_time"] > FROZEN_NOW:
                expected.append((hour["ruling_planet"], hour["start_time"].strftime("%I:%M %p")))
    assert expected, "the fixed days must contain such hours for this to test anything"
    assert [(r["ruling_planet"], r["time_range"].split(" - ")[0]) for r in recommendations] == expected
    assert {r["imbalance_to_address"] for r in recommendations} == {"Matter Stagnation"}
    # 1.5 for a favourable planet, and 1.5 more when the hour's element opposes the season's
    assert {r["total_potency_score_multiplier"] for r in recommendations} <= {1.5, 2.25}


def test_an_unknown_imbalance_is_reported_not_raised(frozen):
    latitude, longitude, zone = PLACES["New York"]
    result = TransmutationOracle(latitude, longitude, zone).get_transmutation_recommendation("Nonsense")
    assert result == [{"error": "Unknown imbalance type: Nonsense"}]
