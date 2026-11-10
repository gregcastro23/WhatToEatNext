"""Write backend/tests/planetary_hour_golden_vectors.json from the reference, planetary_hour_at.

usage (cwd = the repo root of a checkout that has backend/utils/planetary_hours.py: PR #996's branch, or master once it has merged):
    python scripts/gen_planetary_hour_golden_vectors.py backend/tests/planetary_hour_golden_vectors.json
Needs pyswisseph (2.10.3.2, the repo's pin) and pytz. Deterministic: no clock, no randomness, no timestamp in the output.

One record per planetary day (4 places x two weeks x 7 days = 56), and in each the middle of every one of its 24 hours.
The middle of an hour is half an hour from each of its boundaries, and the shortest hour at these places is 36.8 minutes
(recorded in the file as basis.shortestHourMinutes), so a sunrise or sunset that another implementation puts a minute or two
away cannot move an instant into another hour.
"""
import datetime
import json
import sys

sys.path.insert(0, ".")
import pytz
import swisseph as swe
from backend.utils.planetary_hours import STANDARD_DEPRESSION, planetary_hour_at

UTC = datetime.timezone.utc

# name: (latitude, longitude, the zone whose civil noon picks the planetary day). The zone only chooses WHICH day
# to record; it is not part of any expected value.
PLACES = {
    "New York": (40.7128, -74.0060, "America/New_York"),
    "London": (51.5074, -0.1278, "Europe/London"),
    "Tokyo": (35.6762, 139.6503, "Asia/Tokyo"),
    "Sydney": (-33.8688, 151.2093, "Australia/Sydney"),
}
# Two weeks, Sunday to Saturday: one in each solstice season, so day and night hours are both long and short.
WEEKS = (datetime.date(2025, 6, 15), datetime.date(2025, 12, 14))
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def to_second(moment):
    """Round to the nearest whole second (the file stores seconds, and the reference is asked at the stored instant)."""
    return (moment + datetime.timedelta(milliseconds=500)).replace(microsecond=0)


def iso(moment):
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


def build():
    days = []
    shortest_hour = None
    for place, (latitude, longitude, zone_name) in PLACES.items():
        zone = pytz.timezone(zone_name)
        for first in WEEKS:
            for k in range(7):
                day = first + datetime.timedelta(days=k)
                noon = zone.localize(datetime.datetime(day.year, day.month, day.day, 12)).astimezone(UTC)
                whole = planetary_hour_at(noon, latitude, longitude)
                day_hour = (whole.sunset - whole.sunrise) / 12
                night_hour = (whole.next_sunrise - whole.sunset) / 12
                shortest_hour = min(filter(None, [shortest_hour, day_hour, night_hour]))
                middles = [whole.sunrise + day_hour * (i + 0.5) for i in range(12)]
                middles += [whole.sunset + night_hour * (i + 0.5) for i in range(12)]
                local_date = (whole.sunrise + datetime.timedelta(hours=longitude / 15.0)).date()
                hours = []
                for index, middle in enumerate(middles):
                    stored = to_second(middle)
                    answer = planetary_hour_at(stored, latitude, longitude)
                    # The reference, asked at the instant that is stored, must put it in the hour it was made the middle of.
                    assert (answer.hour, answer.is_daytime, answer.day_ruler) == (index, index < 12, whole.day_ruler), (place, day, index)
                    assert abs(answer.sunrise - whole.sunrise) < datetime.timedelta(seconds=1), (place, day, index)
                    hours.append([iso(stored), answer.ruler])
                days.append({
                    "place": place, "localDate": str(local_date), "weekday": WEEKDAYS[local_date.weekday()],
                    "dayRuler": whole.day_ruler, "sunrise": iso(to_second(whole.sunrise)), "sunset": iso(to_second(whole.sunset)),
                    "nextSunrise": iso(to_second(whole.next_sunrise)), "hours": hours,
                })
    return days, shortest_hour


COMMENT = [
    "SHARED golden vectors for the planetary hour: which planet rules a moment at a place. Read by BOTH runtimes:",
    "  Python     backend/tests/test_planetary_hour_golden_vectors.py",
    "  TypeScript src/lib/__tests__/planetaryHourGoldenVectors.test.ts",
    "",
    "This file is the contract. There is one planetary-hour engine per runtime (backend/utils/planetary_hours.py and",
    "src/lib/PlanetaryHourCalculator.ts) and the only thing that keeps them from drifting apart is that both must",
    "reproduce every vector below.",
    "",
    "BASIS of every value. The rulers, the hour numbers and the day rulers come from the Python reference,",
    "planetary_hour_at (PR #996, commit 6961ee36): the Sun's events from the Swiss Ephemeris (pyswisseph 2.10.3.2,",
    "Moshier, as on Railway) at the standard depression of 0.8333 degrees, the weekday of the local mean solar date of",
    "the sunrise that began the planetary day (UTC + longitude / 15 hours), the classical Chaldean sequence from the",
    "planet of that weekday. The reference was asked at every stored instant (not only at the hour it was derived from).",
    "They do NOT come from the TypeScript code under test, and both tests re-derive each ruler from the classical",
    "table, written out in the test, without calling either engine.",
    "",
    "Each record is one planetary day, from one sunrise to the next: the sunrise, the sunset and the next sunrise the",
    "reference found (rounded to the second), the local mean solar date of that sunrise and its weekday, the planet of",
    "that weekday, and the middle of each of the 24 hours: index 0-11 are the day hours from sunrise, 12-23 the night",
    "hours from sunset, each [instant UTC, ruling planet]. A night hour whose instant is past local midnight belongs",
    "to the planetary day that began the evening before: that is the case the old TypeScript code got wrong.",
    "",
    "Regenerate with scripts/gen_planetary_hour_golden_vectors.py (needs backend/utils/planetary_hours.py). Do not edit by hand.",
]


def main(out):
    days, shortest_hour = build()
    basis = {
        "reference": "backend/utils/planetary_hours.py planetary_hour_at, PR #996 @ 6961ee36",
        "ephemeris": "Swiss Ephemeris via pyswisseph 2.10.3.2, Moshier (no sweph_ephe/ files, as in the Railway image)",
        "sunCentreBelowHorizonDegrees": round(-STANDARD_DEPRESSION, 4),
        "weekday": "local mean solar date of the sunrise that began the planetary day: UTC + longitude / 15 hours",
        "instants": "the middle of each of the 24 planetary hours of the day, to the second",
        "shortestHourMinutes": round(shortest_hour.total_seconds() / 60, 1),
    }
    places = {name: {"latitude": lat, "longitude": lon} for name, (lat, lon, _zone) in PLACES.items()}
    lines = ["{", '  "_comment": ' + json.dumps(COMMENT, indent=2).replace("\n", "\n  ") + ","]
    lines.append('  "basis": ' + json.dumps(basis, indent=2).replace("\n", "\n  ") + ",")
    lines.append('  "places": ' + json.dumps(places, indent=2).replace("\n", "\n  ") + ",")
    lines.append('  "days": [')
    for d, day in enumerate(days):
        lines.append("    {")
        for key in ("place", "localDate", "weekday", "dayRuler", "sunrise", "sunset", "nextSunrise"):
            lines.append(f'      "{key}": {json.dumps(day[key])},')
        lines.append('      "hours": [')
        for h, (instant, ruler) in enumerate(day["hours"]):
            lines.append(f'        [{json.dumps(instant)}, {json.dumps(ruler)}]' + ("," if h < 23 else ""))
        lines.append("      ]")
        lines.append("    }" + ("," if d < len(days) - 1 else ""))
    lines.append("  ]")
    lines.append("}")
    text = "\n".join(lines) + "\n"
    json.loads(text)  # the hand-assembled text must be JSON
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(text)
    print(f"{len(days)} planetary days, {sum(len(d['hours']) for d in days)} hours, shortest hour {basis['shortestHourMinutes']} min -> {out}")


if __name__ == "__main__":
    main(sys.argv[1])
