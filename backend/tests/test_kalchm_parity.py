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

# Imports the ENGINE module, not the FastAPI app. Importing
# backend.alchm_kitchen.main pulls in fastapi/sqlalchemy/pyswisseph and this
# suite could not be COLLECTED at all without them — a parity gate that cannot
# run is worse than no gate, because its absence reads as a pass.
from backend.alchm_kitchen.thermodynamics import (
    AXES,
    MONICA_REACTIVITY_FLOOR,
    MONICA_EQUILIBRIUM,
    MONICA_LN_EPSILON,
    PLANETARY_SECTARIAN_ESMS,
    THERMO_DEN_FLOOR,
    planetary_hour_esms,
    compute_kalchm_monica,
    thermo_quotient,
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
    """If Python and the JSON disagree, one of them was edited without the other
    and the whole comparison below is meaningless.

    CONTROL on the pin itself: a dict subscript raises KeyError on a renamed key,
    so Python cannot silently compare a constant against a missing entry — but
    assert the key set anyway, because the TypeScript half of this pair reads the
    same file through an index signature where a miss yields ``undefined``.
    """
    expected_keys = {
        "MONICA_LN_EPSILON",
        "MONICA_EQUILIBRIUM",
        "MONICA_REACTIVITY_FLOOR",
        "X_POW_X_GLOBAL_MINIMUM",
        "THERMO_DEN_FLOOR",
    }
    assert set(GOLDEN["constants"]) == expected_keys, (
        "the shared constants block changed shape; both runtimes must be updated "
        "together or one of them is pinning nothing"
    )
    assert MONICA_LN_EPSILON == GOLDEN["constants"]["MONICA_LN_EPSILON"]
    assert MONICA_EQUILIBRIUM == GOLDEN["constants"]["MONICA_EQUILIBRIUM"]
    assert MONICA_REACTIVITY_FLOOR == GOLDEN["constants"]["MONICA_REACTIVITY_FLOOR"]
    # `[ADDED 2026-07-30]` THERMO_DEN_FLOOR was in `expected_keys` above but its
    # VALUE was never compared — the only constant in the set Python did not
    # actually pin. The TypeScript half has always pinned it
    # (`kalchmCrossRuntimeParity.test.ts:122`), so the contract was one-sided:
    # editing `thermodynamics.py`'s copy to any number at all left every gate
    # green while the two runtimes served different physics. Asserting presence
    # is not asserting agreement.
    assert THERMO_DEN_FLOOR == GOLDEN["constants"]["THERMO_DEN_FLOOR"]


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
    """Mirrors calculate_local_alchemize's thermodynamic block.

    The NUMERATOR/DENOMINATOR structure is deliberately re-typed here — that is
    what catches the lost-parentheses reactivity form below. The DENOMINATOR
    RULE is not: it comes from ``thermo_quotient``, the shipped implementation,
    so this reference cannot keep asserting the old ``max(den, floor)``
    semantics after production has moved off them.
    """
    s, e, m, su = v["Spirit"], v["Essence"], v["Matter"], v["Substance"]
    f, w, a, ea = v["Fire"], v["Water"], v["Air"], v["Earth"]
    heat = thermo_quotient(s**2 + f**2, (su + e + m + w + a + ea) ** 2)
    entropy = thermo_quotient(s**2 + su**2 + f**2 + a**2, (e + m + ea + w) ** 2)
    reactivity = thermo_quotient(
        s**2 + su**2 + e**2 + f**2 + a**2 + w**2, (m + ea) ** 2
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
    correct = thermo_quotient(num, (m + ea) ** 2)
    lost_parens = (num / (m or 1)) + ea**2
    assert correct == 5.32
    assert lost_parens == 16.875
    assert _thermo(
        {"Spirit": s, "Essence": e, "Matter": m, "Substance": su,
         "Fire": f, "Water": w, "Air": a, "Earth": ea}
    )[2] == correct


def test_denominator_guard_is_a_pole_substitution_not_an_interpolation():
    """The guard fires ONLY at an exact zero, and is exact everywhere else.

    Three distinct wrong shapes are excluded here, in increasing subtlety:

      * ``(den or 1)`` — a truthiness fallback; 100x low at the pole.
      * ``max(den, floor)`` — interpolates across the whole open band
        ``(0, 0.01)``, understating without bound as ``den -> 0``. This is the
        shape that shipped, and it is the reason for this test.
      * dropping the guard entirely — would divide by zero at the pole.
    """
    num = 25.0

    # At the pole: substitute the published cap. Unchanged from before.
    assert thermo_quotient(num, 0.0) == 2500.0
    assert num / (0.0 or 1) == 25.0  # the old truthiness shape, 100x low

    # INSIDE the open band: exact, NOT clamped. `max` would have returned
    # 2500.0 for every one of these, i.e. the same answer as the pole.
    assert thermo_quotient(num, 1e-3) == 25000.0
    assert thermo_quotient(num, 1e-6) == 25000000.0
    assert thermo_quotient(num, 0.005) == 5000.0
    for den in (1e-3, 1e-6, 0.005, 0.009999):
        assert thermo_quotient(num, den) == num / den
        assert thermo_quotient(num, den) != num / max(den, THERMO_DEN_FLOOR)

    # OUTSIDE the band the two shapes agree, which is why this went unnoticed.
    for den in (0.01, 0.5, 6.25, 100.0):
        assert thermo_quotient(num, den) == num / max(den, THERMO_DEN_FLOOR)


def test_thermo_quotient_matches_the_measured_alchemize_divergence():
    """The k30 note's own worked example, re-derived rather than quoted."""
    # Diurnal ESMS with Matter = Substance = 0 and Earth = 0.001 -> den = 1e-6.
    spirit, essence, earth = 2.3684111079749997, 1.5543791025227327, 0.001
    num = spirit**2 + essence**2
    den = (0.0 + earth) ** 2
    assert den == 1e-06
    exact = thermo_quotient(num, den)
    clamped = num / max(den, THERMO_DEN_FLOOR)
    assert exact == num / den
    assert round(exact / clamped) == 10000  # the documented 10,000x understatement


# ── Planet -> ESMS table parity ─────────────────────────────────────────────
#
# The token-rates endpoint needs a planet -> ESMS mapping, so a SECOND copy of
# that table now exists in Python. A second copy of anything in this project is a
# divergence hazard: the reactivity formula below drifted from its TypeScript
# original for months and was 3.17x wrong, and nothing in either type system
# noticed. These pin the table the same way the formula is pinned — against a
# contract file GENERATED from the canonical TypeScript symbol.

GOLDEN_ESMS = GOLDEN["planetarySectarianEsms"]


def test_esms_table_contract_is_populated():
    """CONTROL. Every assertion below iterates the contract, so an empty or
    truncated contract would make all of them pass vacuously."""
    assert len(GOLDEN_ESMS) == 11, f"expected 10 planets + Ascendant, got {len(GOLDEN_ESMS)}"
    assert "Ascendant" in GOLDEN_ESMS, "the grounding vessel is missing from the contract"
    for body, sects in GOLDEN_ESMS.items():
        assert set(sects) == {"diurnal", "nocturnal"}, f"{body} is missing a sect"


def test_python_esms_table_matches_canonical_typescript_exactly():
    """Entry for entry, both sects. `==` on the numbers, not approx."""
    assert set(PLANETARY_SECTARIAN_ESMS) == set(GOLDEN_ESMS), (
        "the Python table and the canonical TypeScript table disagree on WHICH "
        f"bodies exist: python-only={set(PLANETARY_SECTARIAN_ESMS) - set(GOLDEN_ESMS)}, "
        f"ts-only={set(GOLDEN_ESMS) - set(PLANETARY_SECTARIAN_ESMS)}"
    )
    for body, sects in GOLDEN_ESMS.items():
        for sect, axes in sects.items():
            for axis, value in axes.items():
                assert PLANETARY_SECTARIAN_ESMS[body][sect][axis] == value, (
                    f"{body}.{sect}.{axis}: python "
                    f"{PLANETARY_SECTARIAN_ESMS[body][sect][axis]!r} vs canonical {value!r}"
                )


def test_the_ascendant_is_a_vessel_on_every_axis_in_both_sects():
    """Asserting the prose. The Ascendant is not a planet — it is the grounding
    vessel, and it is 1 on all four axes precisely so that a single body can
    produce a non-degenerate kalchm. A green test beside that claim proves
    nothing unless the claim is asserted."""
    for sect in ("diurnal", "nocturnal"):
        for axis in AXES:
            assert PLANETARY_SECTARIAN_ESMS["Ascendant"][sect][axis] == 1


def test_a_planetary_hour_is_never_degenerate_without_the_vessel_being_the_reason():
    """Every real ruler must give a kalchm that carries information. If a future
    edit drops the vessel, most rulers collapse to kalchm 1.0 and this fails."""
    informative = 0
    for ruler in GOLDEN_ESMS:
        if ruler == "Ascendant":
            continue
        for is_day in (True, False):
            e = planetary_hour_esms(ruler, is_day)
            assert sum(e.values()) == 5.0, f"{ruler} lost the vessel: {e}"
            kalchm, _ = compute_kalchm_monica(
                e["Spirit"], e["Essence"], e["Matter"], e["Substance"], 1.0, 1.0)
            assert math.isfinite(kalchm) and kalchm > 0
            if kalchm != 1.0:
                informative += 1
    assert informative == 20, (
        f"only {informative} of 20 planetary hours produce a non-degenerate "
        "kalchm — the previous implementation produced 0 of 20 by returning the "
        "literal 1.0 for every hour"
    )


def test_an_unknown_ruler_degrades_to_the_vessel_rather_than_raising():
    """This feeds a rate endpoint; a KeyError there is a 500. The vessel alone is
    (1,1,1,1) -> kalchm 1.0, which is honestly degenerate rather than invented."""
    e = planetary_hour_esms("Nibiru", True)
    assert e == {"Spirit": 1.0, "Essence": 1.0, "Matter": 1.0, "Substance": 1.0}
    kalchm, _ = compute_kalchm_monica(1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
    assert kalchm == 1.0
