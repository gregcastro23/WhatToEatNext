"""Planetary degree dignity manifest D(theta) — Python port.

This is the Python port of ``src/calculations/dignityManifest.ts``. Keep the
tables byte-for-byte equivalent: dignity is Layer 2 of the cross-runtime ESMS
conformance contract, and ``docs/physics/esms_conformance.json`` is generated
from THIS runtime and asserted by both.

D(theta) = diag( D_1(theta_1), ..., D_N(theta_N) ) modulates the gravitational
mass-distance tensor of docs/physics/ESMS_WAVE_FUNCTION_SPECIFICATION.md 2:

    Lambda_dignified(r, theta) = D(theta) . Lambda(r) = diag( D_p * M_p / r_p^2 )

Dignity is a positional field property: it depends only on a body's own ecliptic
longitude, never on pair-wise angular separation. Aspects are Layer 3.

BASIS OF EVERY TABLE (see the TS module for the full statement):
  DIGNITY_POINTS        RULED     - Phase 2 specification
  DIGNITY_SCORE_DIVISOR RULED     - 50.0; see the TS module for the measurement
                                    that rejected the drafted 10.0
  EGYPTIAN_TERMS        CLASSICAL - Ptolemy, Tetrabiblos I.21; Lilly CA p.104
  DOROTHEAN_TRIPLICITY  CLASSICAL - Dorotheus of Sidon, Carmen Astrologicum
  CHALDEAN_ORDER        CLASSICAL - descending mean apparent orbital speed
  FACE_RULERS           DERIVED   - generated from CHALDEAN_ORDER, not typed
  TRADITIONAL_RULERSHIP CLASSICAL - the seven-planet scheme
  EXALTATION            CLASSICAL - matches EXACT_EXALTATION_DEGREE in
                                    src/lib/degree-planetary-agent-mapping.ts
  MODERN_OVERLAY        RULED     - mirrors dignity_scales.py / astrologyUtils

``assert_manifest_invariants()`` reconstructs each table from its stated basis
and raises on drift, mirroring the TS assertions one-for-one.
"""

from typing import Dict, List, Optional, Tuple

MANIFEST_PLANETS: List[str] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
]

CLASSICAL_PLANETS: List[str] = [
    "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
]

SIGNS: List[str] = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]

# Fire -> Earth -> Air -> Water, repeating every four signs. DERIVED from index.
_ELEMENT_CYCLE = ["Fire", "Earth", "Air", "Water"]

DIGNITY_POINTS: Dict[str, int] = {
    "domicile": 5,
    "exaltation": 4,
    "triplicity": 3,
    "term": 2,
    "face": 1,
    "detriment": -5,
    "fall": -4,
}

DIGNITY_SCORE_DIVISOR = 50.0

# Whether the three modern outers receive domicile/exaltation/detriment/fall.
# True for parity with the live lookup. Outers never take triplicity, term or
# face - those tables are seven-planet by construction.
INCLUDE_MODERN_OVERLAY = True

TRADITIONAL_RULERSHIP: Dict[str, str] = {
    "aries": "Mars",
    "taurus": "Venus",
    "gemini": "Mercury",
    "cancer": "Moon",
    "leo": "Sun",
    "virgo": "Mercury",
    "libra": "Venus",
    "scorpio": "Mars",
    "sagittarius": "Jupiter",
    "capricorn": "Saturn",
    "aquarius": "Saturn",
    "pisces": "Jupiter",
}

EXALTATION: Dict[str, Tuple[str, int]] = {
    "Sun": ("aries", 19),
    "Moon": ("taurus", 3),
    "Mercury": ("virgo", 15),
    "Venus": ("pisces", 27),
    "Mars": ("capricorn", 28),
    "Jupiter": ("cancer", 15),
    "Saturn": ("libra", 21),
}

MODERN_OVERLAY: Dict[str, Dict[str, str]] = {
    "Uranus": {"domicile": "aquarius", "exaltation": "scorpio"},
    "Neptune": {"domicile": "pisces", "exaltation": "leo"},
    "Pluto": {"domicile": "scorpio", "exaltation": "sagittarius"},
}

DOROTHEAN_TRIPLICITY: Dict[str, Dict[str, str]] = {
    "Fire": {"day": "Sun", "night": "Jupiter", "participating": "Saturn"},
    "Earth": {"day": "Venus", "night": "Moon", "participating": "Mars"},
    "Air": {"day": "Saturn", "night": "Mercury", "participating": "Jupiter"},
    "Water": {"day": "Venus", "night": "Mars", "participating": "Moon"},
}

# Each entry is (ruler, upper_bound_exclusive) in degrees within the sign.
# Bounds are cumulative and the final bound is always 30.
EGYPTIAN_TERMS: Dict[str, List[Tuple[str, int]]] = {
    "aries": [("Jupiter", 6), ("Venus", 12), ("Mercury", 20), ("Mars", 25), ("Saturn", 30)],
    "taurus": [("Venus", 8), ("Mercury", 14), ("Jupiter", 22), ("Saturn", 27), ("Mars", 30)],
    "gemini": [("Mercury", 6), ("Jupiter", 12), ("Venus", 17), ("Mars", 24), ("Saturn", 30)],
    "cancer": [("Mars", 7), ("Venus", 13), ("Mercury", 19), ("Jupiter", 26), ("Saturn", 30)],
    "leo": [("Jupiter", 6), ("Venus", 11), ("Saturn", 18), ("Mercury", 24), ("Mars", 30)],
    "virgo": [("Mercury", 7), ("Venus", 17), ("Jupiter", 21), ("Mars", 28), ("Saturn", 30)],
    "libra": [("Saturn", 6), ("Mercury", 14), ("Jupiter", 21), ("Venus", 28), ("Mars", 30)],
    "scorpio": [("Mars", 7), ("Venus", 11), ("Mercury", 19), ("Jupiter", 24), ("Saturn", 30)],
    "sagittarius": [("Jupiter", 12), ("Venus", 17), ("Mercury", 21), ("Saturn", 26), ("Mars", 30)],
    "capricorn": [("Mercury", 7), ("Jupiter", 14), ("Venus", 22), ("Saturn", 26), ("Mars", 30)],
    "aquarius": [("Mercury", 7), ("Venus", 13), ("Jupiter", 20), ("Mars", 25), ("Saturn", 30)],
    "pisces": [("Venus", 12), ("Jupiter", 16), ("Mercury", 19), ("Mars", 28), ("Saturn", 30)],
}

CHALDEAN_ORDER: List[str] = [
    "Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon",
]

# Aries' first face is Mars - offset 2 into CHALDEAN_ORDER.
_CHALDEAN_START_OFFSET = 2

# DERIVED, not typed: the 36 faces, index 0 = 0-10 Aries. This is the Chaldean
# FACE, which is what classical scoring means by the +1 dignity. It is NOT the
# table in src/data/tarot/decanAlchemyMap.ts, which uses the decanate scheme
# with modern outers despite calling itself Chaldean.
FACE_RULERS: List[str] = [
    CHALDEAN_ORDER[(i + _CHALDEAN_START_OFFSET) % len(CHALDEAN_ORDER)]
    for i in range(36)
]

_FOLD_KEYS = ("domicile", "exaltation", "triplicity", "term", "face", "detriment", "fall")


def element_of_sign(sign_index: int) -> str:
    return _ELEMENT_CYCLE[sign_index % 4]


def _opposing_sign(sign: str) -> str:
    return SIGNS[(SIGNS.index(sign) + 6) % 12]


def _domiciles_of(planet: str) -> List[str]:
    classical = [s for s in SIGNS if TRADITIONAL_RULERSHIP[s] == planet]
    if classical:
        return classical
    if INCLUDE_MODERN_OVERLAY and planet in MODERN_OVERLAY:
        return [MODERN_OVERLAY[planet]["domicile"]]
    return []


def _exaltation_of(planet: str) -> Optional[str]:
    if planet in EXALTATION:
        return EXALTATION[planet][0]
    if INCLUDE_MODERN_OVERLAY and planet in MODERN_OVERLAY:
        return MODERN_OVERLAY[planet]["exaltation"]
    return None


def _empty_folds() -> Dict[str, float]:
    return {k: 0.0 for k in _FOLD_KEYS}


def score_dignity(planet: str, longitude: float, sect: str) -> Dict[str, float]:
    """Exact 5-fold dignity for one body at one ecliptic longitude.

    Returns a dict of the seven signed fold contributions plus ``score`` and
    ``multiplier``. Pure and total: any longitude wraps into [0, 360). A body
    with no applicable dignity scores 0 and multiplies by exactly 1.0, so an
    absent dignity is inert rather than fabricated.
    """
    norm = longitude % 360.0
    sign_index = int(norm // 30)
    sign = SIGNS[sign_index]
    deg_in_sign = norm - sign_index * 30
    element = element_of_sign(sign_index)

    folds = _empty_folds()

    domiciles = _domiciles_of(planet)
    if sign in domiciles:
        folds["domicile"] += DIGNITY_POINTS["domicile"]
    if any(_opposing_sign(d) == sign for d in domiciles):
        folds["detriment"] += DIGNITY_POINTS["detriment"]

    exalt_sign = _exaltation_of(planet)
    if exalt_sign is not None:
        if exalt_sign == sign:
            folds["exaltation"] += DIGNITY_POINTS["exaltation"]
        if _opposing_sign(exalt_sign) == sign:
            folds["fall"] += DIGNITY_POINTS["fall"]

    # Only the seven classical bodies hold triplicity, terms or faces.
    if planet in CLASSICAL_PLANETS:
        trip = DOROTHEAN_TRIPLICITY[element]
        ruling = trip["day"] if sect == "diurnal" else trip["night"]
        if ruling == planet or trip["participating"] == planet:
            folds["triplicity"] += DIGNITY_POINTS["triplicity"]

        for ruler, upper in EGYPTIAN_TERMS[sign]:
            if deg_in_sign < upper:
                if ruler == planet:
                    folds["term"] += DIGNITY_POINTS["term"]
                break

        if FACE_RULERS[int(norm // 10)] == planet:
            folds["face"] += DIGNITY_POINTS["face"]

    score = sum(folds[k] for k in _FOLD_KEYS)
    folds["score"] = score
    folds["multiplier"] = 1.0 + score / DIGNITY_SCORE_DIVISOR
    folds["resolution"] = "degree"
    return folds


def dignity_folds_for_sign(planet: str, sign: str, sect: str) -> Dict[str, float]:
    """Expected dignity for a body known only by sign - E[D | sign].

    Domicile, exaltation, detriment, fall and triplicity are sign-level, so
    their mean over the sign equals their exact value. Only term and face vary
    within a sign, and both are piecewise-constant on integer degree
    boundaries, so averaging the 30 integer degrees yields the exact measure.

    Exists so a position carrying no degree is never defaulted to 0 degrees,
    which would mint Jupiter's Aries term and Mars' first face on every such
    body. Mirrors dignityFoldsForSign in the TS module.
    """
    sign_lower = str(sign).strip().lower()
    if sign_lower not in SIGNS:
        out = _empty_folds()
        out["score"] = 0.0
        out["multiplier"] = 1.0
        out["resolution"] = "sign-mean"
        return out

    idx = SIGNS.index(sign_lower)
    acc = _empty_folds()
    score = 0.0
    for d in range(30):
        f = score_dignity(planet, idx * 30 + d, sect)
        for k in _FOLD_KEYS:
            acc[k] += f[k]
        score += f["score"]
    for k in _FOLD_KEYS:
        acc[k] /= 30.0
    score /= 30.0

    acc["score"] = score
    acc["multiplier"] = 1.0 + score / DIGNITY_SCORE_DIVISOR
    acc["resolution"] = "sign-mean"
    return acc


def resolve_dignity_longitude(position: Dict, sign: str) -> Optional[float]:
    """Absolute longitude for dignity, or None when the position lacks one.

    Returns None rather than 0.0 deliberately. ``exactLongitude or degree or 0``
    would be wrong twice: a real 0 Aries body is falsy and would be discarded,
    and a sign-only body would silently become 0 Aries. Mirrors
    resolveDignityLongitude in planetaryAlchemyMapping.ts.
    """
    raw_lon = position.get("exactLongitude", position.get("exact_longitude"))
    if raw_lon is not None:
        try:
            lon = float(raw_lon)
            if lon == lon and lon not in (float("inf"), float("-inf")):
                return lon
        except (TypeError, ValueError):
            pass

    sign_lower = str(sign).strip().lower()
    if sign_lower not in SIGNS:
        return None
    raw_deg = position.get("degree")
    if raw_deg is None:
        return None
    try:
        deg = float(raw_deg)
    except (TypeError, ValueError):
        return None
    if deg != deg or deg in (float("inf"), float("-inf")):
        return None
    return SIGNS.index(sign_lower) * 30 + deg


def to_legacy_dignity_type(folds: Dict[str, float]) -> str:
    """Collapse cumulative folds to the narrow 5-state legacy dignity type.

    Uses the historic precedence chain (Domicile -> Exaltation -> Detriment ->
    Fall -> Neutral), NOT the highest-scoring fold: Mercury in Pisces holds both
    detriment (-5) and fall (-4), and highest-scoring would report Fall where
    every existing consumer expects Detriment.

    Tested against zero, not > 0: detriment and fall carry NEGATIVE points, so a
    positivity check silently degrades every debility to Neutral.
    """
    if folds["domicile"] != 0:
        return "Domicile"
    if folds["exaltation"] != 0:
        return "Exaltation"
    if folds["detriment"] != 0:
        return "Detriment"
    if folds["fall"] != 0:
        return "Fall"
    return "Neutral"


def to_legacy_esms_scale(score: float) -> float:
    """(D - 1) * 100, the percentage form existing consumers contract on."""
    return round(score * (100.0 / DIGNITY_SCORE_DIVISOR), 6)


def get_dignity_manifest_multiplier(planet: str, sign: str, position: Optional[Dict] = None,
                                    sect: str = "diurnal") -> float:
    """D_p for one body. Degree-resolved when the position carries geometry."""
    if planet not in MANIFEST_PLANETS:
        return 1.0
    longitude = resolve_dignity_longitude(position or {}, sign)
    if longitude is None:
        return dignity_folds_for_sign(planet, sign, sect)["multiplier"]
    return score_dignity(planet, longitude, sect)["multiplier"]


def assert_manifest_invariants() -> None:
    """Assert every table reconstructs from its stated basis. Mirrors the TS."""
    def fail(msg: str):
        raise AssertionError("[dignity_manifest] invariant violated: " + msg)

    non_luminaries = sorted(["Mercury", "Venus", "Mars", "Jupiter", "Saturn"])
    for sign in SIGNS:
        row = EGYPTIAN_TERMS[sign]
        if len(row) != 5:
            fail(f"{sign} has {len(row)} terms, expected 5")
        prev = 0
        for _, upper in row:
            if upper <= prev:
                fail(f"{sign} term bounds not strictly increasing at {upper}")
            prev = upper
        if prev != 30:
            fail(f"{sign} terms end at {prev}, expected 30")
        if sorted(r for r, _ in row) != non_luminaries:
            fail(f"{sign} term rulers are not each non-luminary exactly once")

    if len(FACE_RULERS) != 36:
        fail(f"FACE_RULERS has {len(FACE_RULERS)} entries, expected 36")
    if FACE_RULERS[0] != "Mars":
        fail(f"first face is {FACE_RULERS[0]}, expected Mars (Aries I)")
    if FACE_RULERS[35] != "Mars":
        fail(f"last face is {FACE_RULERS[35]}, expected Mars (Pisces III)")

    for planet in CHALDEAN_ORDER:
        if not _domiciles_of(planet):
            fail(f"{planet} rules no sign")

    for element, t in DOROTHEAN_TRIPLICITY.items():
        if len({t["day"], t["night"], t["participating"]}) != 3:
            fail(f"{element} triplicity rulers are not distinct")

    inert = score_dignity("Uranus", 65, "diurnal")
    if inert["multiplier"] != 1.0:
        fail(f"undignified Uranus at 65 returned {inert['multiplier']}, expected exactly 1.0")

    # The score extrema DIGNITY_SCORE_DIVISOR is calibrated against.
    lo, hi = float("inf"), float("-inf")
    for planet in MANIFEST_PLANETS:
        for d in range(360):
            for sect in ("diurnal", "nocturnal"):
                s = score_dignity(planet, d, sect)["score"]
                lo = min(lo, s)
                hi = max(hi, s)
    if hi != 11:
        fail(f"max summed score is {hi}, expected 11 (Mercury in Virgo)")
    if lo != -9:
        fail(f"min summed score is {lo}, expected -9 (Mercury in Pisces)")
