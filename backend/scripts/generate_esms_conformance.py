"""Regenerate the frozen ESMS conformance fixture for the v2.4 engine.

This is intentionally a one-way v2.3.0 -> v2.4.0 transition. Expected values
come only from the Python canonical engine; expected_micro comes only from the
Python quantizer. TypeScript independently asserts both fields exactly.

v2.4.0 regenerates for the degree-level 5-fold dignity manifest, which replaced
the sign-level +10/+7/0/-7/-10 scale as Layer 2 in BOTH runtimes.

Regeneration is deliberately gated on both runtimes already agreeing. The
fixture is the shared TS<->Python contract, so producing it from a runtime the
other has not yet caught up to would pin one engine's intermediate state and
make the conformance suite assert agreement with a moving target rather than
prove it. The manifest tables were verified bit-exact across all 7200
(planet x degree x sect) cells before this was run.
"""

import json
from pathlib import Path

from backend.utils.esms_quantization import quantize_esms
from backend.utils.natal_alchemy import calculate_natal_alchemical_quantities


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "docs" / "physics" / "esms_conformance.json"
SOURCE_VERSION = "2.3.0"
TARGET_VERSION = "2.4.0"
COINS = ("spirit", "essence", "matter", "substance")


def main() -> None:
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    source_version = fixture.get("version")
    if source_version != SOURCE_VERSION:
        raise RuntimeError(
            f"refusing regeneration: expected frozen {SOURCE_VERSION}, got {source_version!r}"
        )

    fixture["version"] = TARGET_VERSION
    fixture["description"] += (
        " v2.4.0: Layer 2 is the degree-level 5-fold dignity manifest D(theta) "
        "(domicile +5, exaltation +4, triplicity +3, term +2, face +1, "
        "detriment -5, fall -4, summed, D = 1 + score/50), replacing the "
        "sign-level +10/+7/0/-7/-10 scale in both runtimes. Triplicity is "
        "sect-dependent, so dignity now differs by sect where the old scale was "
        "sect-blind. `expected` and `expected_micro` were regenerated once from "
        "the Python canonical engine, after the manifest tables were verified "
        "bit-exact against TypeScript across all 7200 cells."
    )

    for chart in fixture["charts"]:
        result = calculate_natal_alchemical_quantities(
            chart["planetary_positions"],
            is_diurnal=chart.get("is_diurnal", True),
        )
        expected = {coin: result[coin] for coin in COINS}
        chart["expected"] = expected
        chart["expected_micro"] = {
            coin: quantize_esms(expected[coin]) for coin in COINS
        }

    FIXTURE_PATH.write_text(
        json.dumps(fixture, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
