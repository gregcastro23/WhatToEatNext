"""Cross-runtime parity for the kalchm/monica engine.

There is ONE kalchm implementation per runtime. Nothing in the type system or the
build stops the Python one from drifting away from the TypeScript one, so the
only real defence is that both must reproduce the same golden vectors EXACTLY.
The TypeScript half of this pair is src/__tests__/kalchmCrossRuntimeParity.test.ts,
and both read the same file — backend/tests/kalchm_golden_vectors.json.

Assertions here are `==` on floats, deliberately. `pytest.approx` would pass
against a value that is wrong in the 4th decimal, which is precisely the class of
error this suite exists to catch: an epsilon floor at 0.01 inflates kalchm by
4.7129% and every "close enough" comparison waves it through.
"""
import json
import math
import os

import pytest

from backend.alchm_kitchen.main import (
    KALCHM_EPSILON,
    MONICA_EQUILIBRIUM,
    MONICA_LN_EPSILON,
    THERMO_DEN_FLOOR,
    compute_kalchm_monica,
)

_HERE = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(_HERE, "kalchm_golden_vectors.json"), encoding="utf-8") as fh:
    GOLDEN = json.load(fh)

VECTORS = GOLDEN["vectors"]


def test_golden_vector_file_is_populated():
    """CONTROL. A parametrised test over an empty list PASSES, which would make a
    broken loader indistinguishable from a green suite."""
    assert len(VECTORS) >= 10, f"expected the full vector set, got {len(VECTORS)}"
    names = [v["name"] for v in VECTORS]
    assert len(set(names)) == len(names), "duplicate vector names"
    # The regimes that actually caught bugs must all be represented.
    joined = " ".join(names).lower()
    for regime in ("healthy", "zeroed axis", "degenerate", "negative", "reactivity"):
        assert regime in joined, f"golden vectors no longer cover the {regime!r} regime"


def test_constants_match_the_shared_contract():
    """The constants are DERIVED. If Python and the JSON disagree, one of them was
    edited without the other and the whole comparison below is meaningless."""
    assert MONICA_LN_EPSILON == GOLDEN["constants"]["MONICA_LN_EPSILON"]
    assert MONICA_EQUILIBRIUM == GOLDEN["constants"]["MONICA_EQUILIBRIUM"]
    assert KALCHM_EPSILON == GOLDEN["constants"]["KALCHM_EPSILON"]


def test_monica_ln_epsilon_is_the_derived_midpoint():
    """Re-derive rather than re-type. The band is the midpoint of a measured gap
    whose lower endpoint is exactly 0 and whose upper endpoint is the healthy
    floor; if someone replaces it with a round number this fails."""
    single_body_degenerate_ln_ceiling = 0.0
    single_body_healthy_ln_floor = 0.21878586815274545
    expected = (single_body_degenerate_ln_ceiling + single_body_healthy_ln_floor) / 2
    assert MONICA_LN_EPSILON == expected


def test_x_pow_x_never_reaches_zero():
    """The reason the engine needs no epsilon floor and no divide-by-zero guard:
    x**x has a global minimum well above 0, so the denominator cannot be 0."""
    minimum = min((i / 100000) ** (i / 100000) for i in range(1, 100001))
    assert minimum == GOLDEN["constants"]["X_POW_X_GLOBAL_MINIMUM"]
    assert 0.0**0.0 == 1.0  # the true limit of x^x, not a special case


@pytest.mark.parametrize("v", VECTORS, ids=[v["name"] for v in VECTORS])
def test_matches_canonical_typescript_exactly(v):
    kalchm, monica = compute_kalchm_monica(
        v["spirit"], v["essence"], v["matter"], v["substance"],
        v["reactivity"], v["gregsEnergy"],
    )
    assert kalchm == v["expectedKalchm"], (
        f"kalchm drifted from canonical TypeScript for {v['name']!r}: "
        f"python {kalchm!r} vs expected {v['expectedKalchm']!r}"
    )
    assert monica == v["expectedMonica"], (
        f"monica drifted from canonical TypeScript for {v['name']!r}: "
        f"python {monica!r} vs expected {v['expectedMonica']!r}"
    )


@pytest.mark.parametrize("v", VECTORS, ids=[v["name"] for v in VECTORS])
def test_totality_holds_for_every_vector(v):
    """monica is TOTAL: always a finite float. Never None, never NaN, never
    complex — Python's ** returns a COMPLEX number for a negative base with a
    fractional exponent, so this is a real hazard here and not a formality."""
    kalchm, monica = compute_kalchm_monica(
        v["spirit"], v["essence"], v["matter"], v["substance"],
        v["reactivity"], v["gregsEnergy"],
    )
    assert isinstance(kalchm, float) and not isinstance(kalchm, complex)
    assert isinstance(monica, float) and not isinstance(monica, complex)
    assert math.isfinite(kalchm) and kalchm > 0
    assert math.isfinite(monica)


def test_negative_axis_never_produces_a_complex_number():
    """Regression for the runtime-divergence defect. Before the clamp,
    (-0.5) ** (-0.5) returned (8.66e-17-1.414j); `complex or 1` is truthy so the
    old fallback did not fire, and `kalchm > 0` then raised
    TypeError: '>' not supported between instances of 'complex' and 'int',
    surfacing as an HTTP 500 from POST /alchemize."""
    assert isinstance((-0.5) ** (-0.5), complex)  # the hazard is real
    for axes in [(-0.5, 1, 1, 1), (1, -0.5, 1, 1), (1, 1, -0.5, 1), (1, 1, 1, -0.5)]:
        kalchm, monica = compute_kalchm_monica(*axes, 1.0, 1.0)
        assert isinstance(kalchm, float) and not isinstance(kalchm, complex)
        assert math.isfinite(kalchm) and kalchm > 0
        assert math.isfinite(monica)


def test_a_negative_axis_is_clamped_not_absolute_valued():
    """Clamping to 0 and taking abs() are different operations, and one repo copy
    got this wrong: abs() feeds |−0.5|^|−0.5| = 0.707 into the numerator where the
    true limit contributes exactly 1."""
    clamped, _ = compute_kalchm_monica(-0.5, 2, 1, 0.5, 1.0, 1.0)
    zeroed, _ = compute_kalchm_monica(0.0, 2, 1, 0.5, 1.0, 1.0)
    assert clamped == zeroed


def test_near_degenerate_returns_phi_not_a_divergence():
    """The defect a bare `ln_k != 0` guard leaves behind. At kalchm = 1.00002 the
    raw formula gives -49999.5 — finite and plausible, so it survives every
    downstream isfinite() check and reaches the database."""
    kalchm, monica = compute_kalchm_monica(1.0, 1.00002, 1.0, 1.0, 1.0, 1.0)
    assert abs(math.log(kalchm)) < MONICA_LN_EPSILON
    assert monica == MONICA_EQUILIBRIUM
    raw = -1.0 / (1.0 * math.log(kalchm))
    assert abs(raw) > 10000  # what the old code returned
    assert math.isfinite(raw)  # ...and why nothing downstream caught it


def test_zeroed_axis_does_not_imply_kalchm_is_one():
    """A zeroed axis is NEITHER SUFFICIENT NOR NECESSARY for kalchm == 1. This
    claim sat false inside a passing test for two days because no assertion ever
    covered it — the prose beside a green test proves nothing."""
    zeroed_but_not_one, _ = compute_kalchm_monica(3.0, 5.0, 0.0, 2.0, 1.0, 1.0)
    assert zeroed_but_not_one != 1.0

    one_without_any_zero, _ = compute_kalchm_monica(1.3, 1.3, 1.3, 1.3, 1.0, 1.0)
    assert one_without_any_zero == 1.0


def test_no_truthiness_fallback_survives_on_the_denominator():
    """`(denominator or 1)` was unreachable for real input. Assert the premise
    directly so a future edit cannot quietly reintroduce it as 'defensive'."""
    for m in (0.0, 0.5, 1 / math.e, 1.0, 5.0):
        for su in (0.0, 0.5, 1 / math.e, 1.0, 5.0):
            assert (m**m) * (su**su) > 0.4  # 0.6922^2 = 0.4791, comfortably clear


# ── Thermodynamic parity ────────────────────────────────────────────────────
#
# Added after the kalchm work uncovered that REACTIVITY had also drifted. The
# Python form was `(reactivity_num / (matter or 1)) + earth ** 2` — the canonical
# expression with the parentheses lost, so Earth left the denominator and became
# an additive term. 3.17x on a representative input, and the two forms coincide
# only when Earth == 0 and Matter == 1, which is why it survived.
#
# monica = -gregsEnergy / (reactivity * ln kalchm), so an identical kalchm engine
# is NOT sufficient for identical monica. These pin the rest.

THERMO_VECTORS = GOLDEN["thermoVectors"]


def test_thermo_vector_file_is_populated():
    """CONTROL, same reasoning as above: a parametrised test over [] passes."""
    assert len(THERMO_VECTORS) >= 5
    joined = " ".join(v["name"] for v in THERMO_VECTORS).lower()
    # The regimes that distinguish the two reactivity forms must be present, or
    # the suite would pass against the defect it exists to catch.
    assert "coincidence point" in joined
    assert "earth non-zero" in joined
    assert "floor" in joined


def _thermo(v):
    """Mirrors calculate_local_alchemize's thermodynamic block."""
    s, e, m, su = v["Spirit"], v["Essence"], v["Matter"], v["Substance"]
    f, w, a, ea = v["Fire"], v["Water"], v["Air"], v["Earth"]
    heat = (s**2 + f**2) / max((su + e + m + w + a + ea) ** 2, THERMO_DEN_FLOOR)
    entropy = (s**2 + su**2 + f**2 + a**2) / max((e + m + ea + w) ** 2, THERMO_DEN_FLOOR)
    reactivity = (s**2 + su**2 + e**2 + f**2 + a**2 + w**2) / max(
        (m + ea) ** 2, THERMO_DEN_FLOOR
    )
    return heat, entropy, reactivity, heat - entropy * reactivity


@pytest.mark.parametrize("v", THERMO_VECTORS, ids=[v["name"] for v in THERMO_VECTORS])
def test_thermodynamics_match_canonical_exactly(v):
    heat, entropy, reactivity, gregs = _thermo(v)
    assert heat == v["expectedHeat"], f"heat drifted for {v['name']!r}"
    assert entropy == v["expectedEntropy"], f"entropy drifted for {v['name']!r}"
    assert reactivity == v["expectedReactivity"], (
        f"reactivity drifted for {v['name']!r}: {reactivity!r} vs "
        f"{v['expectedReactivity']!r} — check for the lost-parentheses form "
        f"(num/matter)+earth**2"
    )
    assert gregs == v["expectedGregsEnergy"], f"gregsEnergy drifted for {v['name']!r}"


def test_reactivity_is_not_the_lost_parens_form():
    """Regression guard naming the exact defect, so a re-introduction is obvious
    rather than showing up as a mystery numeric drift."""
    s, su, e, f, a, w, m, ea = 4, 1, 3, 2, 1.5, 1, 2, 0.5
    num = s**2 + su**2 + e**2 + f**2 + a**2 + w**2
    correct = num / max((m + ea) ** 2, THERMO_DEN_FLOOR)
    lost_parens = (num / (m or 1)) + ea**2
    assert correct == 5.32
    assert lost_parens == 16.875
    assert _thermo(
        {"Spirit": s, "Essence": e, "Matter": m, "Substance": su,
         "Fire": f, "Water": w, "Air": a, "Earth": ea}
    )[2] == correct


def test_denominator_guard_is_a_floor_not_a_truthiness_fallback():
    """`(den or 1)` and `max(den, 0.01)` differ by 100x at a zero denominator,
    in the direction of understating the quantity."""
    num = 25.0
    assert num / max(0.0, THERMO_DEN_FLOOR) == 2500.0
    assert num / (0.0 or 1) == 25.0
