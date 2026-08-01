"""
ESMS 2.0 Unified Physics Model - Python Conformance Test Suite

Loads docs/physics/esms_conformance.json and runs calculate_natal_alchemical_quantities
over all 20 golden test charts to verify zero-drift performance using standard unittest.
"""

import json
import math
import os
import unittest
from backend.utils.esms_quantization import (
    ESMS_K_MAX,
    format_micro_esms,
    parse_micro_esms,
    quantize_esms,
)
from backend.utils.natal_alchemy import calculate_natal_alchemical_quantities
from backend.utils.planetary_alchemy import (
    ASCENDANT_VESSEL_WEIGHT,
    PLANET_MASS_WEIGHTS,
    PLANET_MEAN_GEOCENTRIC_AU,
    calculate_alchemical_from_planets,
    get_gravitational_inertia,
    get_inertial_mass_weight,
)

CONF_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "docs", "physics", "esms_conformance.json"
)

def load_conformance_fixture():
    with open(CONF_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

class TestEsmsConformance(unittest.TestCase):
    def test_canonical_engine_applies_dignity_aspects_and_nonzero_pluto(self):
        square = calculate_alchemical_from_planets({
            "Sun": {"sign": "aries", "degree": 0, "exactLongitude": 0},
            "Moon": {"sign": "cancer", "degree": 0, "exactLongitude": 90},
        })
        self.assertEqual(square, {
            "Spirit": 0.9700000000000001,
            "Essence": 0.10939121418131065,
            "Matter": 0.2,
            "Substance": 0.0,
        })
        pluto = calculate_alchemical_from_planets({"Pluto": "Aquarius"}, is_diurnal=False)
        self.assertGreater(pluto["Matter"], 0.1)

    def test_all_20_conformance_charts(self):
        fixture = load_conformance_fixture()
        self.assertEqual(fixture["version"], "2.3.0")
        charts = fixture["charts"]
        self.assertEqual(len(charts), 20)

        for chart in charts:
            chart_id = chart["id"]
            positions = chart["planetary_positions"]
            is_diurnal = chart.get("is_diurnal", True)
            
            res = calculate_natal_alchemical_quantities(positions, is_diurnal=is_diurnal)
            
            # Assert keys exist
            for key in ["spirit", "essence", "matter", "substance", "reactivity", "inertia", "monica"]:
                self.assertIn(key, res, f"[{chart_id}] Missing key {key}")
                val = res[key]
                self.assertIsNotNone(val, f"[{chart_id}] Key {key} is None")
                self.assertFalse(val != val, f"[{chart_id}] Key {key} is NaN")

            # Elemental balance sums to 1.0
            elem_sum = sum(res["elemental_balance"].values())
            self.assertAlmostEqual(elem_sum, 1.0, places=3, msg=f"[{chart_id}] Elemental balance sum != 1.0")

    def test_vessel_actually_contributes_no_day_chart_collapse(self):
        """The grounding vessel must land in every chart.

        REGRESSION: before ASCENDANT_VESSEL_WEIGHT, get_normalized_alchm_weight
        ("Ascendant") returned exactly 0.0 (the period table's 0.003 entry IS the
        log-scale minimum), so the vessel was multiplied by zero and 11/20 of
        these charts — every diurnal one — collapsed to Matter = Substance = 0.
        The finiteness assertions above passed throughout; only a value
        assertion can see this defect.
        """
        fixture = load_conformance_fixture()
        for chart in fixture["charts"]:
            res = calculate_natal_alchemical_quantities(
                chart["planetary_positions"],
                is_diurnal=chart.get("is_diurnal", True),
            )
            cid = chart["id"]
            # Vessel components are >= 0.5 and the vessel weight is 1.0, so every
            # coin must clear this floor no matter the sect.
            self.assertGreater(res["matter"], 0.0, f"[{cid}] Matter collapsed to 0 — vessel inert")
            self.assertGreater(res["substance"], 0.0, f"[{cid}] Substance collapsed to 0 — vessel inert")

    def test_ascendant_weight_is_ruled_not_derived(self):
        """The Ascendant weight is the RULED anchor 1.0, off any derived scale."""
        self.assertEqual(get_inertial_mass_weight("Ascendant"), ASCENDANT_VESSEL_WEIGHT)
        self.assertEqual(ASCENDANT_VESSEL_WEIGHT, 1.0)
        self.assertEqual(get_gravitational_inertia("Ascendant"), 1.0)  # r = 1.0 AU
        # ANTI-ANNIHILATION CONTROL — the period scale (deleted with its last
        # caller when elementals unified onto the inertial-mass scale) zeroed
        # its extremum body, the Ascendant. The inertial scale anchors one
        # decade BELOW Pluto precisely so its extremum body survives.
        self.assertGreater(get_inertial_mass_weight("Pluto"), 0.1)

    def test_elementals_and_esms_share_one_scale(self):
        """The mixed-scale defect must stay dead.

        REGRESSION: natal elementals were weighted by the orbital-period scale
        (Pluto = 1.0 max, Sun ~ 0.513) while the ESMS vector in the SAME
        function used the inertial-mass scale (Sun = 1.0, Pluto ~ 0.109) — two
        roughly anti-correlated weightings in one output. Pin one ratio the two
        scales order OPPOSITELY: a Sun sign must now outweigh a Pluto sign in
        the elemental balance.
        """
        res = calculate_natal_alchemical_quantities({
            "Sun": {"sign": "aries", "degree": 0, "exactLongitude": 0},
            "Pluto": {"sign": "cancer", "degree": 0, "exactLongitude": 90},
        })
        balance = res["elemental_balance"]
        # Sun (aries -> Fire) carries weight 1.0; Pluto (cancer -> Water) ~0.109.
        # Under the deleted period scale this ordering was INVERTED.
        self.assertGreater(balance["Fire"], balance["Water"])

    def test_golden_expected_values(self):
        """The engine must reproduce the fixture's expected ESMS exactly.

        The fixture's `expected` blocks were generated by THIS engine under the
        RULED Lambda tensor; equality here plus the TS suite asserting the same
        numbers from the TS functions makes the fixture the cross-runtime parity
        witness. Before this, both suites asserted only finiteness — which is how
        a 2x cross-runtime divergence and the Moon-dominance defect stayed green.
        """
        fixture = load_conformance_fixture()
        for chart in fixture["charts"]:
            res = calculate_natal_alchemical_quantities(
                chart["planetary_positions"],
                is_diurnal=chart.get("is_diurnal", True),
            )
            for key, want in chart["expected"].items():
                self.assertEqual(
                    res[key], want,
                    f"[{chart['id']}] {key}: engine {res[key]} != golden {want}",
                )

    def test_mass_basis_tables_match_fixture(self):
        """Source tables and the fixture's copies must be identical — the fixture
        is the single witness both runtimes pin against."""
        fixture = load_conformance_fixture()
        self.assertEqual(fixture["epoch_mean_geocentric_au"], PLANET_MEAN_GEOCENTRIC_AU)
        self.assertEqual(fixture["mass_weights"], PLANET_MASS_WEIGHTS)

    def test_inertial_scale_annihilates_no_charted_body(self):
        """The inertial mass scale anchors its zero OFF the charted set.

        REGRESSION: normalizePlanetWeight (TS) anchors AT Pluto, so Pluto's
        weight is exactly 0 on that scale — the same extremum-annihilation that
        zeroed the Ascendant on the period scale. The inertial scale is anchored
        one decade below Pluto (RULED), so every charted body is strictly > 0.
        """
        self.assertEqual(get_inertial_mass_weight("Sun"), 1.0)
        for body in PLANET_MEAN_GEOCENTRIC_AU:
            self.assertGreater(get_inertial_mass_weight(body), 0.0, f"{body} annihilated")
        # POSITIVE CONTROL — the trap is real: anchoring AT Pluto gives exactly 0.
        at_pluto_anchor = (math.log10(0.0022) - math.log10(0.0022)) / 1.0
        self.assertEqual(at_pluto_anchor, 0.0)
        # Pinned value, re-derivable: (log10(0.0022) - log10(0.00022)) / (log10(Sun) - log10(0.00022))
        expect_pluto = (math.log10(0.0022) - math.log10(0.00022)) / (
            math.log10(333054.2532) - math.log10(0.00022)
        )
        self.assertAlmostEqual(get_inertial_mass_weight("Pluto"), expect_pluto, places=12)

    def test_lambda_is_relative_not_absolute(self):
        """Lambda = Mhat*(rbar/r)^2: at r = rbar the factor is exactly the weight,
        and the Moon's REAL distance no longer detonates the tensor.

        REGRESSION: under the old M/r^2, get_gravitational_inertia("Moon",
        0.00257) returned ~43,043 (vs Sun 0.51) — live natal ESMS was 99.99%
        Moon and canonical kalchm overflowed into the phi fallback.
        """
        rbar = PLANET_MEAN_GEOCENTRIC_AU["Moon"]
        self.assertEqual(get_gravitational_inertia("Moon", rbar), get_inertial_mass_weight("Moon"))
        at_perigee = get_gravitational_inertia("Moon", 0.002384073736896684)
        self.assertLess(at_perigee, 0.25)   # ~0.19 * 1.163 — O(weight), not 43,043
        self.assertGreater(at_perigee, get_inertial_mass_weight("Moon"))  # perigee amplifies

    def test_quantized_goldens_byte_identical(self):
        """§6 mainnet gate: quantize the engine's full-precision K and match the
        fixture's expected_micro integers EXACTLY. The TS suite asserts the same
        integers from the TS quantizer — byte-identical across runtimes."""
        fixture = load_conformance_fixture()
        for chart in fixture["charts"]:
            res = calculate_natal_alchemical_quantities(
                chart["planetary_positions"], is_diurnal=chart.get("is_diurnal", True)
            )
            for coin, want in chart["expected_micro"].items():
                got = quantize_esms(res[coin])
                self.assertEqual(got, want, f"[{chart['id']}] {coin}: {got} != {want}")
                self.assertIsInstance(got, int)

    def test_quantization_conservation(self):
        """§6 rule 4: sum(q(parts)) <= q(whole), MEASURED over the golden set.

        Parts are the base-Lambda per-body coin contributions (sect ESMS x
        inertia, with the vessel as its own part). This isolates the floor-law
        witness from the canonical engine's later dignity and aspect transforms.
        The mathematical property holds for exact reals; with float sums an
        adversarial all-integer-micro portfolio could violate it by one ulp, so
        this is pinned over the REACHABLE base parts, not claimed universally.
        """
        from backend.utils.planetary_alchemy import (
            ESMS_PLANETS,
            PLANETARY_SECTARIAN_ESMS,
            calculate_positional_ascendant_vessel,
        )
        fixture = load_conformance_fixture()
        checked = 0
        for chart in fixture["charts"]:
            positions = chart["planetary_positions"]
            sect = "diurnal" if chart.get("is_diurnal", True) else "nocturnal"
            parts = {"Spirit": [], "Essence": [], "Matter": [], "Substance": []}
            for body, pos in positions.items():
                clean = body.strip().title()
                if clean not in ESMS_PLANETS:
                    continue
                inertia = get_gravitational_inertia(clean, pos.get("distance"))
                for coin, val in PLANETARY_SECTARIAN_ESMS[clean][sect].items():
                    parts[coin].append(val * inertia)
            asc = positions.get("Ascendant", {"sign": "aries", "degree": 0})
            vessel = calculate_positional_ascendant_vessel(asc["sign"], asc.get("degree", 0))
            asc_inertia = get_gravitational_inertia("Ascendant")
            for coin in parts:
                parts[coin].append(vessel[coin] * asc_inertia)
                whole = sum(parts[coin])
                self.assertLessEqual(
                    sum(quantize_esms(p) for p in parts[coin]),
                    quantize_esms(whole),
                    f"[{chart['id']}] {coin}: parts quantize above the whole",
                )
                checked += 1
        self.assertEqual(checked, 80)

    def test_quantizer_floor_and_guards(self):
        """Floor never round; malformed input throws instead of minting."""
        self.assertEqual(quantize_esms(1.9999999), 1_999_999)  # floor, not round
        self.assertEqual(quantize_esms(0.0), 0)
        for bad in (float("nan"), float("inf"), -0.001, ESMS_K_MAX + 1):
            with self.assertRaises(TypeError):
                quantize_esms(bad)

    def test_no_float_dequantize_and_exact_round_trip(self):
        """AMENDMENT to §6 rule 5, with its measurement.

        NEGATIVE CONTROL — the drafted float idempotence is impossible with
        floor: q=249's float representative multiplies back to 248.99…, so
        floor loses a micro. This is why there is NO float dequantize.
        """
        self.assertEqual(math.floor((249 / 1e6) * 1e6), 248)  # the measured trap
        # The exact decimal path is lossless for every integer.
        for q in list(range(0, 2000)) + [249, 999_999, 1_000_000, 4_560_831, 10**8]:
            self.assertEqual(parse_micro_esms(format_micro_esms(q)), q)
        self.assertEqual(format_micro_esms(249), "0.000249")
        fixture = load_conformance_fixture()
        for chart in fixture["charts"]:
            for q in chart["expected_micro"].values():
                self.assertEqual(parse_micro_esms(format_micro_esms(q)), q)

    def test_sect_changes_the_result(self):
        """is_diurnal must matter: the onboarding route used to omit it entirely,
        silently giving every user a day chart."""
        fixture = load_conformance_fixture()
        positions = fixture["charts"][0]["planetary_positions"]
        day = calculate_natal_alchemical_quantities(positions, is_diurnal=True)
        night = calculate_natal_alchemical_quantities(positions, is_diurnal=False)
        self.assertNotEqual(
            (day["spirit"], day["essence"], day["matter"], day["substance"]),
            (night["spirit"], night["essence"], night["matter"], night["substance"]),
            "day and night sect produced identical ESMS — sect is not being applied",
        )

if __name__ == "__main__":
    unittest.main()
