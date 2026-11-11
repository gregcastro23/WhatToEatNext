"""Cross-runtime parity for the planetary hour: the Python half that stands on its own.

There is one planetary-hour engine per runtime (backend/utils/planetary_hours.py and
src/lib/PlanetaryHourCalculator.ts), and nothing in either build stops them drifting apart. The defence is
the one the kalchm engine uses: both read the SAME golden vectors, backend/tests/planetary_hour_golden_vectors.json,
and the TypeScript half is src/lib/__tests__/planetaryHourGoldenVectors.test.ts.

This file reads the vectors and holds them to the classical planetary hours WITHOUT calling either engine: the
table is written out below, the weekday is recomputed from the sunrise the file records (local mean solar time,
UTC + longitude / 15 hours), and every ruler, day ruler and instant is checked against them. So a file that was
regenerated with an engine that has the old defects in it (the weekday indexed into the order of the planets by
speed; the UTC or the host's weekday; the new calendar day's row between midnight and sunrise) fails here
instead of becoming the new contract.

What it does not do is ask planetary_hour_at to reproduce the vectors: that function imports pyswisseph, and
this step installs pytest alone (like the kalchm parity step it sits beside). That check is
test_planetary_hours_golden.py, in the step that installs pyswisseph, next to test_planetary_hours.py.

Standard library and pytest only.
"""
import datetime
import json
import os

import pytest

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "planetary_hour_golden_vectors.json"), encoding="utf-8") as fh:
    GOLDEN = json.load(fh)

UTC = datetime.timezone.utc

# The hours of each weekday, Monday=0 as date.weekday() has it: the seven planets in the order the Chaldeans
# gave them (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, then Saturn again), starting from the planet of
# the day. Hour i of a planetary day (0-23 from sunrise) is entry i % 7. Written out, not computed.
SEQUENCES = {
    0: "Moon Saturn Jupiter Mars Sun Venus Mercury".split(),    # Monday
    1: "Mars Sun Venus Mercury Moon Saturn Jupiter".split(),
    2: "Mercury Moon Saturn Jupiter Mars Sun Venus".split(),
    3: "Jupiter Mars Sun Venus Mercury Moon Saturn".split(),
    4: "Venus Mercury Moon Saturn Jupiter Mars Sun".split(),
    5: "Saturn Jupiter Mars Sun Venus Mercury Moon".split(),
    6: "Sun Venus Mercury Moon Saturn Jupiter Mars".split(),    # Sunday
}
WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
CHALDEAN_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]
DAY_PLANETS = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]


def parse(instant):
    return datetime.datetime.strptime(instant, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=UTC)


def local_mean_solar_date(instant, longitude):
    return (parse(instant) + datetime.timedelta(hours=longitude / 15.0)).date()


DAYS = GOLDEN["days"]
PLACES = GOLDEN["places"]


def day_id(day):
    return f"{day['place']} {day['localDate']}"


def test_golden_vector_file_is_populated():
    """CONTROL. A parametrised test over an empty list PASSES, which would make a broken loader
    indistinguishable from a green suite."""
    assert len(DAYS) == 56
    assert all(len(day["hours"]) == 24 for day in DAYS)
    assert sorted(PLACES) == ["London", "New York", "Sydney", "Tokyo"]
    for place in PLACES:
        mine = [day for day in DAYS if day["place"] == place]
        assert len(mine) == 14
        for half in (mine[:7], mine[7:]):
            assert len({day["weekday"] for day in half}) == 7, place
    pre_dawn = evening = 0
    for day in DAYS:
        for index, (instant, _ruler) in enumerate(day["hours"]):
            if index >= 12:
                if local_mean_solar_date(instant, PLACES[day["place"]]["longitude"]).isoformat() == day["localDate"]:
                    evening += 1
                else:
                    pre_dawn += 1
    # The part of the day the old code got wrong must be well represented.
    assert evening + pre_dawn == 672
    assert evening > 250 and pre_dawn > 250


def test_the_table_written_out_is_the_chaldean_order_from_each_weekdays_planet():
    """CONTROL on the table this file writes out, which every check below leans on."""
    for weekday, row in SEQUENCES.items():
        assert len(row) == 7
        assert row[0] == DAY_PLANETS[weekday]
        for i in range(7):
            assert row[(i + 1) % 7] == CHALDEAN_ORDER[(CHALDEAN_ORDER.index(row[i]) + 1) % 7]


@pytest.mark.parametrize("day", DAYS, ids=day_id)
def test_the_weekday_is_that_of_the_local_mean_solar_date_of_the_sunrise(day):
    # The sunrise that began the planetary day, not the moment asked about and not UTC or the host.
    date = local_mean_solar_date(day["sunrise"], PLACES[day["place"]]["longitude"])
    assert date.isoformat() == day["localDate"]
    assert WEEKDAY_NAMES[date.weekday()] == day["weekday"]
    assert SEQUENCES[date.weekday()][0] == day["dayRuler"]


@pytest.mark.parametrize("day", DAYS, ids=day_id)
def test_every_ruler_is_the_classical_tables_without_either_engine(day):
    row = SEQUENCES[WEEKDAY_NAMES.index(day["weekday"])]
    wrong = [(index, instant, ruler) for index, (instant, ruler) in enumerate(day["hours"]) if ruler != row[index % 7]]
    assert wrong == []


@pytest.mark.parametrize("day", DAYS, ids=day_id)
def test_each_instant_lies_in_the_hour_it_is_the_middle_of(day):
    sunrise, sunset, next_sunrise = parse(day["sunrise"]), parse(day["sunset"]), parse(day["nextSunrise"])
    assert sunrise < sunset < next_sunrise
    day_hour = (sunset - sunrise) / 12
    night_hour = (next_sunrise - sunset) / 12
    for index, (instant, _ruler) in enumerate(day["hours"]):
        start, length = (sunrise, day_hour) if index < 12 else (sunset, night_hour)
        into = (parse(instant) - start) / length - (index % 12)
        # Stored to the second, so within a few seconds of the exact middle.
        assert abs(into - 0.5) < 0.01, f"hour {index}: {into}"


def test_a_night_hour_past_local_midnight_belongs_to_the_day_that_began_the_evening_before():
    """The case the old TypeScript code got wrong, read off the file: every night hour whose local mean solar date is
    LATER than its planetary day's has the ruler of the day's own row, not of the next calendar day's."""
    checked = 0
    for day in DAYS:
        longitude = PLACES[day["place"]]["longitude"]
        own = SEQUENCES[WEEKDAY_NAMES.index(day["weekday"])]
        next_calendar_day = SEQUENCES[(WEEKDAY_NAMES.index(day["weekday"]) + 1) % 7]
        for index, (instant, ruler) in enumerate(day["hours"]):
            if index >= 12 and local_mean_solar_date(instant, longitude).isoformat() != day["localDate"]:
                checked += 1
                assert ruler == own[index % 7]
                # ...and the two rows differ at hours 12-23 on every weekday, so this is not vacuous.
                assert own[index % 7] != next_calendar_day[index % 7]
    assert checked > 250
