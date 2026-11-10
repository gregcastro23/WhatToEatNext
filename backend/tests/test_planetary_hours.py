"""Planetary hours: which planet rules a moment at a place (backend/utils/planetary_hours.py).

`transit_engine.get_planetary_hour`, and a copy of it in the `/api/tokens/calculate` route, ruled the
hours wrongly. Run against the oracle in transmutation_oracle.py at the middle of every hour of a
week (hours of 40 minutes or more), it agreed on these shares of the hours (measured, 4 places x 2
seasons x 7 weekdays; London December, whose short days leave only the night hours to count):

    London    summer 12 of 12 hours on Tuesday and 0 of 12 on each of the other six days
    New York  summer 2-5 of 24 hours on every weekday, Tuesday included
    Tokyo, Auckland   1-6 of 24 hours on every weekday

(The route's copy is tested in test_tokens_planetary_hour.py.) Four causes, each reproduced by running it: the day's ruler was `CHALDEAN_ORDER[(weekday + 1) % 7]`, the
planets by orbital speed indexed by the weekday, right on Tuesday only; the weekday was that of the
moment in UTC, so every evening after 00:00 UTC (19:00 or 20:00 in New York) belonged to tomorrow's
planet; between midnight and sunrise it used the new calendar day's planet; and astral's
`sun(observer, date)` stamps the date it was asked about on a time of day it computed, so where the event
is on the neighbouring UTC date the answer is a day out (New York's summer sunset came back as the
PREVIOUS evening's, before the sunrise, so the daytime branch could never run).

The expected values here do not come from the code under test:
  * the hours of each weekday are the classical table, written out (src/lib/PlanetaryHourCalculator.ts
    carries the same one) and indexed by the weekday of the CIVIL date in the place's own zone;
  * the sun's times are checked against astral (a NOAA-based calculation) and against `swe.azalt`;
  * a few moments are worked by hand from an almanac's sunrise and sunset;
  * the oracle, with its own sun definition, civil-zone weekday and bracket logic, is a second implementation.
Needs pyswisseph, astral, pytz and pydantic (the CI step installs them).
"""
import datetime
import time
import types

import pytest
import pytz
import swisseph as swe
from astral import Observer
from astral.sun import sunrise as astral_sunrise, sunset as astral_sunset

import backend.utils.planetary_hours as planetary_hours
import backend.utils.transit_engine as transit_engine
from backend.schemas.planetary import CelestialCoordinates
from backend.utils.lunar_oracle import julian_day_utc
from backend.utils.planetary_hours import planetary_hour_at
from backend.utils.transmutation_oracle import TransmutationOracle

UTC = datetime.timezone.utc

# The hours of each weekday, Monday=0 as date.weekday() has it: the seven planets in the order the
# Chaldeans gave them (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, then Saturn again), starting
# from the planet of the day. Hour i of the day (0-23 from sunrise) is entry i % 7. Written out, not computed.
SEQUENCES = {
    0: "Moon Saturn Jupiter Mars Sun Venus Mercury".split(),    # Monday
    1: "Mars Sun Venus Mercury Moon Saturn Jupiter".split(),
    2: "Mercury Moon Saturn Jupiter Mars Sun Venus".split(),
    3: "Jupiter Mars Sun Venus Mercury Moon Saturn".split(),
    4: "Venus Mercury Moon Saturn Jupiter Mars Sun".split(),
    5: "Saturn Jupiter Mars Sun Venus Mercury Moon".split(),
    6: "Sun Venus Mercury Moon Saturn Jupiter Mars".split(),    # Sunday
}

# name: (latitude, longitude, timezone). Places whose civil date is the local mean solar date; the zones
# where it is not (Kiritimati, the Chatham Islands) are the documented limit in planetary_hours.py.
PLACES = {
    "New York": (40.7128, -74.0060, "America/New_York"),
    "London": (51.5074, -0.1278, "Europe/London"),
    "Tokyo": (35.6762, 139.6503, "Asia/Tokyo"),
    "Sydney": (-33.8688, 151.2093, "Australia/Sydney"),
    "Auckland": (-36.8485, 174.7633, "Pacific/Auckland"),
    "Honolulu": (21.3069, -157.8583, "Pacific/Honolulu"),
    "Kolkata": (22.5726, 88.3639, "Asia/Kolkata"),
    "Quito": (-0.1807, -78.4678, "America/Guayaquil"),
    "Anchorage": (61.2181, -149.9003, "America/Anchorage"),
    "Reykjavik": (64.1466, -21.9426, "Atlantic/Reykjavik"),
}
# Two weeks starting on a Sunday (June and December), and the weeks in which New York's clocks change
# (DST begins Sunday 2025-03-09 at 02:00 and ends Sunday 2025-11-02 at 02:00).
WEEKS = [datetime.date(2025, 6, 15), datetime.date(2025, 12, 14), datetime.date(2025, 3, 9), datetime.date(2025, 11, 2)]
DAYS = [(week + datetime.timedelta(days=k)) for week in WEEKS for k in range(7)]


def civil_noon(place, day):
    latitude, longitude, zone_name = PLACES[place]
    zone = pytz.timezone(zone_name)
    return zone.localize(datetime.datetime(day.year, day.month, day.day, 12, 0)).astimezone(UTC)


def planetary_day_of(place, day):
    """The planetary day that begins on the civil date `day` at `place` (the one that holds its local noon)."""
    latitude, longitude, _zone = PLACES[place]
    return planetary_hour_at(civil_noon(place, day), latitude, longitude)


def midpoints(h):
    """The middle of each of the 24 hours of the planetary day `h` is in."""
    day_hour = (h.sunset - h.sunrise) / 12
    night_hour = (h.next_sunrise - h.sunset) / 12
    return [h.sunrise + day_hour * (i + 0.5) for i in range(12)] + [h.sunset + night_hour * (i + 0.5) for i in range(12)]


# --- the classical table -------------------------------------------------------------------------

@pytest.mark.parametrize("place", sorted(PLACES))
@pytest.mark.parametrize("day", DAYS, ids=str)
def test_every_hour_of_the_day_is_ruled_as_the_classical_table_has_it(place, day):
    latitude, longitude, _zone = PLACES[place]
    whole = planetary_day_of(place, day)
    table = SEQUENCES[day.weekday()]
    assert whole.day_ruler == table[0], f"{day:%A}"
    for index, moment in enumerate(midpoints(whole)):
        h = planetary_hour_at(moment, latitude, longitude)
        assert (h.hour, h.is_daytime, h.day_ruler) == (index, index < 12, table[0]), f"{day} hour {index}"
        assert h.ruler == table[index % 7], f"{day:%A} hour {index}: {h.ruler}, the table has {table[index % 7]}"
        # swe.rise_trans solves for the event iteratively, so searched from another moment it lands within
        # about 10 ms of the same instant (measured 9 ms): the same day is the same to the second.
        for found, expected in ((h.sunrise, whole.sunrise), (h.sunset, whole.sunset), (h.next_sunrise, whole.next_sunrise)):
            assert abs(found - expected) < datetime.timedelta(seconds=1)


def test_a_microsecond_before_the_end_of_the_day_or_the_night_is_still_in_its_last_hour():
    whole = planetary_day_of("New York", datetime.date(2025, 6, 24))
    one = datetime.timedelta(microseconds=1)
    assert planetary_hour_at(whole.sunset - one, 40.7128, -74.0060).hour == 11
    assert planetary_hour_at(whole.next_sunrise - one, 40.7128, -74.0060).hour == 23


def with_events(monkeypatch, sunrise, sunset, next_sunrise):
    """Put the three events of one planetary day in place of the library's: the first sunrise asked for begins the day."""
    asked = {"rise": 0}

    def events(after, event, latitude, longitude):
        if event == swe.CALC_SET:
            return sunset
        asked["rise"] += 1
        return sunrise if asked["rise"] == 1 else next_sunrise

    monkeypatch.setattr(planetary_hours, "_next_event", events)


def test_the_last_microsecond_of_an_hour_belongs_to_it_however_the_span_divides(monkeypatch):
    # A span that is not a multiple of 12 microseconds: dividing it by 12 first rounds the hour down, and a
    # moment a microsecond before the end then lands in the next hour (hour 12 of the day, hour 24 of the night).
    start = datetime.datetime(2025, 6, 21, 9, 0, tzinfo=UTC)
    sunset = start + datetime.timedelta(hours=13, microseconds=5)
    next_sunrise = sunset + datetime.timedelta(hours=11, microseconds=5)
    with_events(monkeypatch, start, sunset, next_sunrise)
    one = datetime.timedelta(microseconds=1)
    assert planetary_hour_at(sunset - one, 40.7128, -74.0060).hour == 11
    with_events(monkeypatch, start, sunset, next_sunrise)
    assert planetary_hour_at(next_sunrise - one, 40.7128, -74.0060).hour == 23


def test_a_sunset_that_does_not_come_between_the_two_sunrises_is_no_planetary_day(monkeypatch):
    start = datetime.datetime(2025, 6, 21, 9, 0, tzinfo=UTC)
    next_sunrise = start + datetime.timedelta(hours=24)
    for sunset in (start - datetime.timedelta(hours=1), next_sunrise + datetime.timedelta(hours=1)):
        with_events(monkeypatch, start, sunset, next_sunrise)
        with pytest.raises(ValueError, match="does not rise and set"):
            planetary_hour_at(start + datetime.timedelta(hours=10), 40.7128, -74.0060)


@pytest.mark.parametrize("place", ["New York", "Tokyo", "Auckland", "Kolkata"])
def test_the_hour_changes_exactly_at_sunrise_sunset_and_the_next_sunrise(place):
    latitude, longitude, _zone = PLACES[place]
    day = datetime.date(2025, 6, 24)  # a Tuesday
    whole = planetary_day_of(place, day)
    tick = datetime.timedelta(seconds=1)

    def at(moment):
        return planetary_hour_at(moment, latitude, longitude)

    monday, tuesday, wednesday = SEQUENCES[0], SEQUENCES[1], SEQUENCES[2]
    assert (at(whole.sunrise - tick).hour, at(whole.sunrise - tick).ruler) == (23, monday[23 % 7])
    assert (at(whole.sunrise + tick).hour, at(whole.sunrise + tick).ruler) == (0, tuesday[0])
    assert (at(whole.sunset - tick).hour, at(whole.sunset - tick).is_daytime) == (11, True)
    assert (at(whole.sunset + tick).hour, at(whole.sunset + tick).is_daytime) == (12, False)
    assert (at(whole.next_sunrise - tick).hour, at(whole.next_sunrise - tick).ruler) == (23, tuesday[23 % 7])
    assert (at(whole.next_sunrise + tick).hour, at(whole.next_sunrise + tick).ruler) == (0, wednesday[0])


# --- the moments that were wrong, worked by hand --------------------------------------------------

# New York, Saturday 2025-06-21 (the Saturn day). An almanac gives sunrise 05:25 and sunset 20:31 EDT:
# a day of 15 h 06 min (hours of 75.5 min) and a night of 8 h 54 min (hours of 44.5 min).
EDT = datetime.timezone(datetime.timedelta(hours=-4))
BY_HAND = [
    # (local moment, planetary hour 0-23, why it is that hour, expected ruler from the Saturday row)
    (datetime.datetime(2025, 6, 21, 13, 30, tzinfo=EDT), 6, "8h05 after sunrise = 485 min = 6.4 day hours", "Moon"),
    (datetime.datetime(2025, 6, 21, 17, 30, tzinfo=EDT), 9, "12h05 after sunrise = 725 min = 9.6 day hours", "Mars"),
    (datetime.datetime(2025, 6, 21, 21, 0, tzinfo=EDT), 12, "29 min after sunset = 0.65 night hours; 01:00 UTC is already Sunday", "Mercury"),
    (datetime.datetime(2025, 6, 22, 3, 0, tzinfo=EDT), 20, "6h29 after Saturday's sunset = 389 min = 8.7 night hours; still Saturday's day", "Moon"),
]


@pytest.mark.parametrize("moment,hour,why,ruler", BY_HAND, ids=[b[2][:28] for b in BY_HAND])
def test_new_york_summer_moments_worked_by_hand(moment, hour, why, ruler):
    h = planetary_hour_at(moment, 40.7128, -74.0060)
    assert (h.hour, h.day_ruler, h.ruler) == (hour, "Saturn", ruler), why


def test_the_utc_weekday_is_not_the_weekday_of_the_place():
    # 01:00 UTC on Sunday 2025-06-22 is 21:00 on Saturday in New York: Saturn's planetary day, not the Sun's.
    h = planetary_hour_at(datetime.datetime(2025, 6, 22, 1, 0, tzinfo=UTC), 40.7128, -74.0060)
    assert h.day_ruler == "Saturn"


def test_between_midnight_and_sunrise_the_planetary_day_is_yesterdays():
    # 03:00 on Tuesday 2025-06-24 in London, before sunrise (04:43): Monday's planetary day.
    h = planetary_hour_at(datetime.datetime(2025, 6, 24, 2, 0, tzinfo=UTC), 51.5074, -0.1278)
    assert h.day_ruler == "Moon" and not h.is_daytime and h.hour >= 12


def test_east_of_greenwich_the_sunrise_on_the_previous_utc_date_begins_the_day():
    # Auckland's Tuesday sunrise (07:34 NZST on 2025-06-24) is 19:34 UTC on Monday the 23rd.
    h = planetary_hour_at(datetime.datetime(2025, 6, 24, 0, 0, tzinfo=UTC), -36.8485, 174.7633)  # noon on Tuesday there
    assert (h.day_ruler, h.is_daytime) == ("Mars", True)
    assert (h.sunrise.day, h.sunrise.hour) == (23, 19)


# --- the sun's times ------------------------------------------------------------------------------

def time_of_day_gap(a, b):
    """The distance between two times of day, around the clock: astral stamps a date on a time of day."""
    seconds = (a.hour * 3600 + a.minute * 60 + a.second) - (b.hour * 3600 + b.minute * 60 + b.second)
    return abs((seconds + 43200) % 86400 - 43200)


@pytest.mark.parametrize("place", ["New York", "London", "Tokyo", "Sydney", "Auckland", "Honolulu", "Kolkata", "Quito"])
@pytest.mark.parametrize("day", [datetime.date(2025, 3, 20), datetime.date(2025, 6, 21), datetime.date(2025, 12, 21)], ids=str)
def test_the_suns_times_are_those_of_an_independent_calculation(place, day):
    # NOAA states its sunrise and sunset accurate to a minute, which is what astral implements; both put the
    # Sun's centre 0.8333 degrees below the horizon. Measured over these places and dates the two differ by at
    # most 16.4 s (at 35, 40 and 52 degrees; at 61 and 64 degrees north in June they differ by 35 s and 67 s,
    # where the Sun crosses the horizon so slowly that a hundredth of a degree is 10 s, and the altitude
    # test below, which is exact to 0.0001 degrees, covers those places). astral's date stamp can be a day
    # out (the reason this module does not use it), so the TIME OF DAY is compared.
    tolerance = 60
    latitude, longitude, _zone = PLACES[place]
    whole = planetary_day_of(place, day)
    observer = Observer(latitude=latitude, longitude=longitude)
    for moment, function in ((whole.sunrise, astral_sunrise), (whole.sunset, astral_sunset), (whole.next_sunrise, astral_sunrise)):
        candidates = [function(observer, moment.date() + datetime.timedelta(days=k), tzinfo=UTC) for k in (-1, 0, 1)]
        gap = min(time_of_day_gap(moment, candidate) for candidate in candidates)
        assert gap <= tolerance, f"{function.__name__} at {moment}: nearest astral time of day is {gap} s away"


@pytest.mark.parametrize("place", ["New York", "Tokyo", "Auckland", "Quito", "London", "Anchorage", "Reykjavik"])
def test_the_sun_is_at_the_standard_depression_at_sunrise_and_sunset(place):
    # The standard sunrise has the Sun's centre 0.8333 degrees below the horizon (34' of refraction + 16' of
    # semidiameter). swe.azalt gives the altitude from the Earth's centre, 8.8" (0.0024 degrees) above the
    # one from the surface. Measured agreement over 7 places and 3 dates: 0.0001 degrees. Tolerance 0.005: an
    # eighth of the 0.041 degrees by which swe.rise_trans' own default horizon differs (which is what this
    # module used before it asked for 0.8333 explicitly), so that mismatch fails; five minutes' error is
    # 0.8 degrees, a latitude/longitude swap 7, and the Sun's centre on the horizon 0.83.
    latitude, longitude, _zone = PLACES[place]
    whole = planetary_day_of(place, datetime.date(2025, 6, 21))
    for moment in (whole.sunrise, whole.sunset, whole.next_sunrise):
        jd = julian_day_utc(moment)
        (sun_longitude, sun_latitude, distance, *_rest), _flags = swe.calc_ut(jd, swe.SUN)
        _azimuth, true_altitude, _apparent = swe.azalt(
            jd, swe.ECL2HOR, (longitude, latitude, 0.0), 0.0, 0.0, (sun_longitude, sun_latitude, distance),
        )
        assert abs(true_altitude - (-0.8333 + 0.0024)) < 0.005, f"{place} {moment}: the Sun is at {true_altitude}"


def test_consecutive_sunrises_are_a_day_apart_to_within_the_bound_the_module_relies_on():
    # LONGEST_PLANETARY_DAY is 24 h + 2: the measured largest deviation is 0.75 h (39,593 gaps over latitudes
    # 0-80 and -30/-60/-75, five longitudes, every day of 2025). This repeats a sample of it.
    worst = compared = 0.0
    for latitude in (0, 24, 48, 64, 72, 76, 80, -60):
        for longitude in (-170.0, 0.0, 90.0):
            for k in range(0, 370, 3):
                first = planetary_hours._next_event(datetime.datetime(2025, 1, 1, tzinfo=UTC) + datetime.timedelta(days=k), swe.CALC_RISE, latitude, longitude)
                second = first and planetary_hours._next_event(first + datetime.timedelta(minutes=1), swe.CALC_RISE, latitude, longitude)
                if first and second:
                    compared += 1
                    worst = max(worst, abs((second - first).total_seconds() / 3600 - 24))
    assert compared > 2000, "the sample must have gaps in it"
    assert worst < 1.0
    assert planetary_hours.LONGEST_PLANETARY_DAY == datetime.timedelta(hours=24 + 2)


# --- a second implementation ---------------------------------------------------------------------

@pytest.mark.parametrize("place", ["New York", "London", "Tokyo", "Sydney", "Auckland", "Honolulu", "Kolkata", "Quito"])
@pytest.mark.parametrize("day", [datetime.date(2025, 6, 21), datetime.date(2025, 12, 21), datetime.date(2025, 3, 9), datetime.date(2025, 11, 2)], ids=str)
def test_the_oracle_rules_the_same_hours(place, day):
    # The oracle (transmutation_oracle.py) finds the day with a civil-zone weekday, pytz and its own search,
    # and takes the Sun's centre without refraction, about four minutes from the standard sunrise: so only
    # the middle of hours of at least 40 minutes is compared, where that cannot decide.
    latitude, longitude, zone_name = PLACES[place]
    hours = TransmutationOracle(latitude, longitude, zone_name).get_daily_planetary_hours(day)["planetary_hours"]
    compared = 0
    for hour in hours:
        if hour["end_time"] - hour["start_time"] < datetime.timedelta(minutes=40):
            continue
        moment = (hour["start_time"] + (hour["end_time"] - hour["start_time"]) / 2).astimezone(UTC)
        assert planetary_hour_at(moment, latitude, longitude).ruler == hour["ruling_planet"], f"{hour['period']} hour {hour['hour_number']}"
        compared += 1
    assert compared >= 12


# --- the polar day and night ----------------------------------------------------------------------

TROMSO = (69.6492, 18.9553)


@pytest.mark.parametrize("day", [datetime.date(2025, 1, 5), datetime.date(2025, 6, 21), datetime.date(2025, 12, 21)], ids=str)
def test_there_are_no_planetary_hours_where_the_sun_does_not_rise_and_set(day):
    # Tromso: no standard sunrise from 26 November to 15 January and no sunset from 17 May to 25 July
    # (measured, 121 days of 2025 at 12:00 UTC).
    with pytest.raises(ValueError, match="does not rise and set"):
        planetary_hour_at(datetime.datetime(day.year, day.month, day.day, 12, tzinfo=UTC), *TROMSO)


def test_the_edge_of_the_polar_night_is_not_a_hole():
    # Late November the sunrises are 24 h 10 min apart, and swe.rise_trans looks about 24 hours ahead: asked
    # a minute after one it finds none. 23 and 24 November raised ValueError when it was asked that way.
    for day in (21, 22, 23, 24, 25):
        h = planetary_hour_at(datetime.datetime(2025, 11, day, 12, tzinfo=UTC), *TROMSO)
        assert h.next_sunrise - h.sunrise > datetime.timedelta(hours=24)


def test_a_planetary_day_whose_sunset_is_after_midnight_is_still_one_day():
    # Tromso, Saturday 2025-07-26: sunrise 01:13, sunset 00:09 on the 27th, next sunrise 01:32 (local time).
    h = planetary_hour_at(datetime.datetime(2025, 7, 26, 12, tzinfo=UTC), *TROMSO)
    assert h.day_ruler == "Saturn" and h.is_daytime
    assert h.sunrise < h.sunset < h.next_sunrise
    assert h.sunset - h.sunrise > datetime.timedelta(hours=22)


def test_a_sunrise_that_is_missing_between_two_is_not_one_long_day(monkeypatch):
    real = planetary_hours._next_event
    sunrises_asked_for = []

    def with_a_hole(after, event, latitude, longitude):
        found = real(after, event, latitude, longitude)
        if event == swe.CALC_RISE:
            sunrises_asked_for.append(after)
            if len(sunrises_asked_for) == 2:  # the sunrise after the one that began the day comes 16 hours late: 40 hours on
                return found + datetime.timedelta(hours=16)
        return found

    monkeypatch.setattr(planetary_hours, "_next_event", with_a_hole)
    with pytest.raises(ValueError, match="does not rise and set"):
        planetary_hour_at(datetime.datetime(2025, 6, 21, 17, 30, tzinfo=UTC), 40.7128, -74.0060)
    assert len(sunrises_asked_for) == 2


# --- the inputs -------------------------------------------------------------------------------------

def test_a_naive_moment_is_utc_whatever_the_machines_zone(monkeypatch):
    monkeypatch.setenv("TZ", "Pacific/Auckland")
    time.tzset()
    try:
        naive = planetary_hour_at(datetime.datetime(2025, 6, 21, 17, 30), 40.7128, -74.0060)
    finally:
        monkeypatch.undo()
        time.tzset()
    assert naive == planetary_hour_at(datetime.datetime(2025, 6, 21, 17, 30, tzinfo=UTC), 40.7128, -74.0060)
    assert naive.ruler == "Moon"  # 13:30 EDT, from the hand-worked table above


def test_the_same_instant_in_any_zone_is_the_same_hour():
    in_utc = planetary_hour_at(datetime.datetime(2025, 6, 21, 17, 30, tzinfo=UTC), 40.7128, -74.0060)
    in_new_york = planetary_hour_at(datetime.datetime(2025, 6, 21, 13, 30, tzinfo=EDT), 40.7128, -74.0060)
    in_tokyo = planetary_hour_at(datetime.datetime(2025, 6, 22, 2, 30, tzinfo=datetime.timezone(datetime.timedelta(hours=9))), 40.7128, -74.0060)
    assert in_utc == in_new_york == in_tokyo


def test_without_pyswisseph_it_says_so(monkeypatch):
    monkeypatch.setattr(planetary_hours, "swe", None)
    with pytest.raises(ImportError, match="pyswisseph"):
        planetary_hour_at(datetime.datetime(2025, 6, 21, 17, 30, tzinfo=UTC), 40.7128, -74.0060)


# --- transit_engine.get_planetary_hour -----------------------------------------------------------------

def freeze(monkeypatch, moment):
    class Clock(datetime.datetime):
        @classmethod
        def now(cls, tz=None):
            # a naive now() is the machine's local time: here UTC+5 whatever the machine is, so that code which
            # forgets to ask for UTC is wrong on every machine and not only on those that are not on UTC
            return moment.astimezone(tz) if tz else moment.astimezone(datetime.timezone(datetime.timedelta(hours=5))).replace(tzinfo=None)

    monkeypatch.setattr(transit_engine, "datetime", types.SimpleNamespace(datetime=Clock, timedelta=datetime.timedelta))


@pytest.mark.parametrize("moment,hour,why,ruler", BY_HAND, ids=[b[2][:28] for b in BY_HAND])
def test_get_planetary_hour_answers_for_now_in_new_york(monkeypatch, moment, hour, why, ruler):
    freeze(monkeypatch, moment)
    assert transit_engine.get_planetary_hour(CelestialCoordinates(latitude=40.7128, longitude=-74.0060)) == ruler, why


def test_get_planetary_hour_is_none_without_pyswisseph(monkeypatch):
    monkeypatch.setattr(transit_engine, "swe", None)
    assert transit_engine.get_planetary_hour(CelestialCoordinates(latitude=40.7128, longitude=-74.0060)) is None


def test_get_planetary_hour_raises_valueerror_where_the_sun_does_not_rise(monkeypatch):
    freeze(monkeypatch, datetime.datetime(2026, 12, 21, 12, tzinfo=UTC))
    with pytest.raises(ValueError):
        transit_engine.get_planetary_hour(CelestialCoordinates(latitude=69.65, longitude=18.96))
