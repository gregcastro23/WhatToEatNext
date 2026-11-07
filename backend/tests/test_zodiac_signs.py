"""`db_zodiac_signs` must spell the signs the way the Postgres enum does.

`calculate_planetary_positions_swisseph` names each body's sign in lowercase ("pisces"). The
`zodiac_sign` enum (backend/database/init/01-schema.sql) is capitalized, and Postgres rejects a
lowercase literal for it (`invalid input value for enum zodiac_sign`). The by-chart recommender
bound the lowercase names straight into its query, so it failed before it read a single row.

Both ends are read from the source here, not restated: the enum from the schema file, the
lowercase names from the positions function. Standard library + pytest only.
"""
import ast
import re
from pathlib import Path

from backend.utils.zodiac_signs import ZODIAC_SIGNS, db_zodiac_signs

BACKEND = Path(__file__).resolve().parents[1]
SCHEMA = BACKEND / "database" / "init" / "01-schema.sql"
CELESTIAL = BACKEND / "utils" / "celestial_calculations.py"


def enum_labels():
    match = re.search(r"CREATE TYPE zodiac_sign AS ENUM \(([^)]*)\)", SCHEMA.read_text())
    assert match, "no `CREATE TYPE zodiac_sign AS ENUM (...)` in 01-schema.sql: the enum moved; update this test"
    return re.findall(r"'([^']+)'", match.group(1))


def positions_function_sign_names():
    """The list of sign names `calculate_planetary_positions_swisseph` indexes by sign number."""
    tree = ast.parse(CELESTIAL.read_text())
    function = next(
        node for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name == "calculate_planetary_positions_swisseph"
    )
    for node in ast.walk(function):
        if (
            isinstance(node, ast.Assign)
            and any(isinstance(t, ast.Name) and t.id == "zodiac_signs" for t in node.targets)
            and isinstance(node.value, ast.List)
        ):
            return [element.value for element in node.value.elts if isinstance(element, ast.Constant)]
    raise AssertionError("calculate_planetary_positions_swisseph no longer assigns a literal `zodiac_signs` list")


def test_the_signs_are_the_enum_labels_in_the_enum_order():
    assert list(ZODIAC_SIGNS) == enum_labels()


def test_the_positions_function_spells_the_signs_lowercase_and_in_the_enum_order():
    names = positions_function_sign_names()
    assert all(name == name.lower() for name in names), "it now returns capitalized names: this helper may be unneeded"
    assert [name.capitalize() for name in names] == enum_labels()


def test_signs_as_the_positions_function_names_them_are_spelled_as_the_enum_spells_them():
    positions = {f"Body{i}": {"sign": name} for i, name in enumerate(positions_function_sign_names())}
    assert db_zodiac_signs(positions) == tuple(sorted(enum_labels()))


def test_the_distinct_signs_of_a_chart_come_back_sorted():
    positions = {"Sun": {"sign": "gemini"}, "Moon": {"sign": "pisces"}, "Mars": {"sign": "gemini"}}
    assert db_zodiac_signs(positions) == ("Gemini", "Pisces")


def test_an_entry_without_a_sign_or_with_something_that_is_not_a_sign_is_left_out():
    positions = {
        "Sun": {"sign": "gemini"},
        "Ascendant": {"exactLongitude": 10.0},
        "Odd": {"sign": "ophiuchus"},
        "Empty": {"sign": None},
        "Number": {"sign": 5},
        "Text": "gemini",
    }
    assert db_zodiac_signs(positions) == ("Gemini",)


def test_a_chart_with_no_signs_gives_an_empty_tuple():
    assert db_zodiac_signs({}) == ()
