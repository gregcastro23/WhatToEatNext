"""
ESMS token quantization - the RULED §6 contract (mainnet gate).

Mirror of src/lib/economy/esmsQuantization.ts. 1 on-chain unit = 1e-6 K-units
("micro-ESMS"); on-chain amounts are integers only. quantize_esms is the ONE
quantization boundary in this runtime, applied once at mint/settlement to the
FULL-PRECISION float64 K the engine returns.

Floor, never round: a quantizer can only under-credit (the mint-cost-pole rule
- economic errors favor the ledger). Conservation: sum(q(parts)) <= q(whole).

Cross-runtime determinism: MEASURED - all 80 unrounded K values over the 20
golden charts are BIT-IDENTICAL across runtimes, so math.floor(k * 1e6) here
and Math.floor(k * 1e6) in TS agree exactly. The fixture's expected_micro
integers are the shared witness; both conformance suites assert equality.

AMENDMENT to §6 rule 5 (idempotence), with its measurement: the drafted pin
quantize(dequantize(q)) == q is UNSATISFIABLE with pure floor - q/1e6 is
inexact in binary, and when it rounds low the EXACT product with 1e6 is
already below q, so floor loses a micro. MEASURED: 1.48% of the reachable
integer range violates it (first violator q=249 -> 248), identically in both
runtimes. There is therefore NO float dequantize: format_micro_esms renders
the exact decimal via integer math, parse_micro_esms inverts it exactly, and
quantized integers never re-enter the quantizer as floats.
"""

import math
import re

# RULED §6: 1 K-unit = 1e6 micro-ESMS.
MICRO_ESMS_PER_K = 1_000_000

# Upper guard for a single coin's K. BASIS: max reachable coin over the golden
# set is 8.81 (chart_20, all bodies at measured 2026 minimum distances); 100 is
# over an order of magnitude above any reachable K.
ESMS_K_MAX = 100


def quantize_esms(k: float) -> int:
    """THE quantization boundary: full-precision K -> integer micro-ESMS, floor.

    Raises on malformed input rather than inventing an amount (§18k k7):
    non-finite, negative, or beyond ESMS_K_MAX.
    """
    if not isinstance(k, (int, float)) or isinstance(k, bool) or not math.isfinite(k):
        raise TypeError(f"quantize_esms: K must be finite, got {k!r}")
    if k < 0:
        raise TypeError(f"quantize_esms: K must be non-negative, got {k!r}")
    if k > ESMS_K_MAX:
        raise TypeError(f"quantize_esms: K={k!r} exceeds ESMS_K_MAX={ESMS_K_MAX} - malformed input, not physics")
    return math.floor(k * MICRO_ESMS_PER_K)


def format_micro_esms(q: int) -> str:
    """Exact decimal rendering of integer micro-ESMS via integer math only."""
    if not isinstance(q, int) or isinstance(q, bool) or q < 0:
        raise TypeError(f"format_micro_esms: expected a non-negative integer, got {q!r}")
    whole, frac = divmod(q, MICRO_ESMS_PER_K)
    return f"{whole}.{frac:06d}"


_MICRO_RE = re.compile(r"^(\d+)\.(\d{6})$")


def parse_micro_esms(s: str) -> int:
    """Exact inverse of format_micro_esms - integer parsing only."""
    m = _MICRO_RE.match(s if isinstance(s, str) else "")
    if not m:
        raise TypeError(f'parse_micro_esms: expected "<int>.<6 digits>", got {s!r}')
    return int(m.group(1)) * MICRO_ESMS_PER_K + int(m.group(2))
