"""`elemental_balance_from_longitudes`: the element of each body's sign, shared out evenly.

transit_engine.py's `get_transit_details()` called `calculate_current_elemental_balance`, which
nothing defined, so every route that asks for transit details raised. The basis of the function
that now answers it (each body counts once, for the element of the sign it stands in; shares sum
to 1) is in backend/utils/elemental_balance.py. The sign-to-element table is checked against the
seasonal engine's own sets, so the two cannot drift apart. Standard library + pytest only.
"""
import pytest

from backend.utils.elemental_balance import ELEMENTS, elemental_balance_from_longitudes
from backend.utils.seasonal_engine import AIR_SIGNS, EARTH_SIGNS, FIRE_SIGNS, WATER_SIGNS
from backend.utils.zodiac_signs import ZODIAC_SIGNS

ELEMENT_OF_SIGN = {
    **{sign: "Fire" for sign in FIRE_SIGNS},
    **{sign: "Earth" for sign in EARTH_SIGNS},
    **{sign: "Air" for sign in AIR_SIGNS},
    **{sign: "Water" for sign in WATER_SIGNS},
}


def only(element):
    return {name: 1.0 if name == element else 0.0 for name in ELEMENTS}


def test_the_seasonal_engines_sign_sets_cover_the_twelve_signs_once():
    assert sorted(ELEMENT_OF_SIGN) == sorted(ZODIAC_SIGNS)


@pytest.mark.parametrize("index,sign", list(enumerate(ZODIAC_SIGNS)))
def test_a_body_in_the_middle_of_each_sign_counts_for_that_signs_element(index, sign):
    assert elemental_balance_from_longitudes([30.0 * index + 15.0]) == only(ELEMENT_OF_SIGN[sign])


def test_sign_boundaries_belong_to_the_sign_they_open():
    assert elemental_balance_from_longitudes([0.0]) == only("Fire")      # 0 deg Aries
    assert elemental_balance_from_longitudes([29.999]) == only("Fire")   # last of Aries
    assert elemental_balance_from_longitudes([30.0]) == only("Earth")    # 0 deg Taurus
    assert elemental_balance_from_longitudes([359.999]) == only("Water") # last of Pisces


def test_a_longitude_outside_0_to_360_wraps_round_the_zodiac():
    assert elemental_balance_from_longitudes([360.0]) == only("Fire")
    assert elemental_balance_from_longitudes([-1.0]) == only("Water")
    assert elemental_balance_from_longitudes([375.0]) == only("Fire")


def test_the_shares_are_a_count_over_the_bodies_and_sum_to_one():
    # Aries (Fire), Cancer (Water), Libra (Air), Capricorn (Earth)
    assert elemental_balance_from_longitudes([10.0, 100.0, 190.0, 280.0]) == {name: 0.25 for name in ELEMENTS}
    shares = elemental_balance_from_longitudes([10.0, 20.0, 100.0])  # two Fire, one Water
    assert shares == {"Fire": pytest.approx(2 / 3), "Water": pytest.approx(1 / 3), "Earth": 0.0, "Air": 0.0}
    assert sum(shares.values()) == pytest.approx(1.0)


def test_no_bodies_gives_every_element_a_zero_share_not_an_error():
    assert elemental_balance_from_longitudes([]) == {name: 0.0 for name in ELEMENTS}


def test_every_element_is_always_present():
    assert set(elemental_balance_from_longitudes([10.0])) == set(ELEMENTS)
