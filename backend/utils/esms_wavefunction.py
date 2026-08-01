"""
ESMS Quantum Wave Function & Gaussian Operator Field Theory - Python Implementation

Mathematical formalization of the 4 ESMS field components:
  - Spirit   (ψ_S): Kinetic velocity, light, conscious drive
  - Essence  (ψ_E): Vibrational quality, fluid timing, emotional resonance
  - Matter   (ψ_M): Biological density, physical mass, structural inertia
  - Substance (ψ_Σ): Thermodynamic heat capacity, structural endurance

Field Operator:
  Ψ(θ, t) = S(sect) · Λ(r) · g(θ - θ_p)

Where:
  - S ∈ {0, 1}^(4 × N) is the Sectarian Projection Operator
  - Λ(r) = diag(M_1/r_1^2, ..., M_N/r_N^2) is the Gravitational Mass-Distance Tensor
  - g(θ - θ_p) is the vector of Gaussian wave packet kernels on S^1
"""

import math
from typing import Dict, Any, List, Tuple, NamedTuple
from backend.utils.planetary_alchemy import (
    ESMS_PLANETS,
    PLANETARY_SECTARIAN_ESMS,
    ZODIAC_ELEMENTS,
    get_gravitational_inertia,
    get_inertial_mass_weight,
    calculate_positional_ascendant_vessel,
)

class EsmsStateVector(NamedTuple):
    spirit: float
    essence: float
    matter: float
    substance: float

class EsmsWaveFunction:
    """
    Continuous Gaussian Wave Function Field Engine for ESMS Quantities on S^1.
    """
    def __init__(self, sigma_degrees: float = 10.0):
        """
        :param sigma_degrees: Spatial variance of Gaussian wave packet (defaults to 10° decan width).
        """
        self.sigma_rad = math.radians(max(0.1, sigma_degrees))
        self.norm_factor = 1.0 / (self.sigma_rad * math.sqrt(2.0 * math.pi))

    def gaussian_packet(self, theta_rad: float, center_rad: float) -> float:
        """
        Periodic Gaussian Kernel g(θ - θ_p) on the manifold S^1.
        """
        delta = (theta_rad - center_rad + math.pi) % (2.0 * math.pi) - math.pi
        return self.norm_factor * math.exp(-(delta ** 2) / (2.0 * (self.sigma_rad ** 2)))

    def evaluate_field(
        self,
        theta_degrees: float,
        planetary_positions: Dict[str, Any],
        is_diurnal: bool = True
    ) -> EsmsStateVector:
        """
        Evaluates the local continuous 4D field vector Ψ(θ) = S · Λ(r) · g(θ - θ_p).
        """
        theta_rad = math.radians(theta_degrees % 360.0)
        sect_key = "diurnal" if is_diurnal else "nocturnal"

        psi_s, psi_e, psi_m, psi_sig = 0.0, 0.0, 0.0, 0.0

        for body, pos in planetary_positions.items():
            if not isinstance(pos, dict):
                continue
            body_clean = body.strip().title()
            if body_clean not in ESMS_PLANETS:
                continue

            sign = str(pos.get("sign", "aries")).strip().lower()
            deg_in_sign = float(pos.get("degree", 0.0))
            sign_index = list(ZODIAC_ELEMENTS.keys()).index(sign) if sign in ZODIAC_ELEMENTS else 0
            body_theta_deg = (sign_index * 30.0) + deg_in_sign
            body_theta_rad = math.radians(body_theta_deg)

            distance_au = pos.get("distance", None)
            distance_au = float(distance_au) if (distance_au is not None and float(distance_au) > 0) else None

            # Gravitational inertia amplitude under the RULED Lambda tensor —
            # Mhat * (rbar/r)^2, the SAME function natal_alchemy uses, so the
            # wave function cannot drift from the discrete engine.
            inertia_amplitude = get_gravitational_inertia(body_clean, distance_au)

            # Spatial wave packet kernel g(θ - θ_p)
            packet = self.gaussian_packet(theta_rad, body_theta_rad)

            # Sectarian projection s_k
            sect_esms = PLANETARY_SECTARIAN_ESMS[body_clean][sect_key]

            weight = inertia_amplitude * packet
            psi_s += sect_esms["Spirit"] * weight
            psi_e += sect_esms["Essence"] * weight
            psi_m += sect_esms["Matter"] * weight
            psi_sig += sect_esms["Substance"] * weight

        # Grounding Ascendant Vessel Wave Packet
        asc_pos = planetary_positions.get("Ascendant") or planetary_positions.get("ascendant")
        if isinstance(asc_pos, dict):
            asc_sign = str(asc_pos.get("sign", "aries"))
            asc_deg = float(asc_pos.get("degree", 0.0))
            asc_sign_index = list(ZODIAC_ELEMENTS.keys()).index(asc_sign) if asc_sign in ZODIAC_ELEMENTS else 0
            asc_theta_deg = (asc_sign_index * 30.0) + asc_deg
        else:
            asc_sign = "aries"
            asc_deg = 0.0
            asc_theta_deg = 0.0

        asc_vessel = calculate_positional_ascendant_vessel(asc_sign, asc_deg)
        asc_packet = self.gaussian_packet(theta_rad, math.radians(asc_theta_deg))
        asc_weight = get_inertial_mass_weight("Ascendant") * asc_packet

        psi_s += asc_vessel["Spirit"] * asc_weight
        psi_e += asc_vessel["Essence"] * asc_weight
        psi_m += asc_vessel["Matter"] * asc_weight
        psi_sig += asc_vessel["Substance"] * asc_weight

        return EsmsStateVector(
            spirit=round(psi_s, 6),
            essence=round(psi_e, 6),
            matter=round(psi_m, 6),
            substance=round(psi_sig, 6),
        )

    def integrate_field(
        self,
        planetary_positions: Dict[str, Any],
        is_diurnal: bool = True
    ) -> EsmsStateVector:
        """
        Integrates Ψ(θ) over S^1 to yield global state vector K = S · Λ · 1_N.
        """
        sect_key = "diurnal" if is_diurnal else "nocturnal"
        k_s, k_e, k_m, k_sig = 0.0, 0.0, 0.0, 0.0

        for body, pos in planetary_positions.items():
            if not isinstance(pos, dict):
                continue
            body_clean = body.strip().title()
            if body_clean not in ESMS_PLANETS:
                continue

            distance_au = pos.get("distance", None)
            distance_au = float(distance_au) if (distance_au is not None and float(distance_au) > 0) else None
            # Same RULED Lambda tensor as evaluate_field / natal_alchemy.
            inertia = get_gravitational_inertia(body_clean, distance_au)

            sect_esms = PLANETARY_SECTARIAN_ESMS[body_clean][sect_key]
            k_s += sect_esms["Spirit"] * inertia
            k_e += sect_esms["Essence"] * inertia
            k_m += sect_esms["Matter"] * inertia
            k_sig += sect_esms["Substance"] * inertia

        # Ascendant Vessel
        asc_pos = planetary_positions.get("Ascendant") or planetary_positions.get("ascendant")
        if isinstance(asc_pos, dict):
            asc_sign = str(asc_pos.get("sign", "aries"))
            asc_deg = float(asc_pos.get("degree", 0.0))
        else:
            asc_sign = "aries"
            asc_deg = 0.0

        asc_vessel = calculate_positional_ascendant_vessel(asc_sign, asc_deg)
        asc_inertia = get_inertial_mass_weight("Ascendant")
        k_s += asc_vessel["Spirit"] * asc_inertia
        k_e += asc_vessel["Essence"] * asc_inertia
        k_m += asc_vessel["Matter"] * asc_inertia
        k_sig += asc_vessel["Substance"] * asc_inertia

        return EsmsStateVector(
            spirit=round(k_s, 4),
            essence=round(k_e, 4),
            matter=round(k_m, 4),
            substance=round(k_sig, 4),
        )
