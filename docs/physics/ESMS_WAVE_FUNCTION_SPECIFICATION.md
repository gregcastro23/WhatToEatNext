# ESMS Wave Function & Gaussian Operator Field Specification

*Version: 2.0.0 | Date: July 2026*  
*Authoritative Mathematical Physics Specification for Alchm.kitchen (WTEN), AlchmAgentsETH, Pentacles, and PlanetaryAgents.*

---

## 1. Abstract & Vector Field Formalism

This document establishes the continuous field theory governing the four fundamental alchemical coins: **Spirit ($\psi_S$)**, **Essence ($\psi_E$)**, **Matter ($\psi_M$)**, and **Substance ($\psi_\Sigma$)**.

Let the ecliptic circle be the 1-dimensional manifold $S^1 = \mathbb{R} / 2\pi\mathbb{Z}$ parameterized by angular longitude $\theta \in [0, 2\pi)$.

The complete state of the sky at time $t$ is described by a 4-dimensional vector wave function $\mathbf{\Psi}: S^1 \times \mathbb{R} \to \mathbb{R}^4$ in the Hilbert space $\mathcal{H}_{\text{ESMS}} \cong \mathbb{R}^4$:

$$\mathbf{\Psi}(\theta, t) = \begin{bmatrix} \psi_S(\theta, t) \\ \psi_E(\theta, t) \\ \psi_M(\theta, t) \\ \psi_\Sigma(\theta, t) \end{bmatrix} = \psi_S(\theta, t) \mathbf{e}_S + \psi_E(\theta, t) \mathbf{e}_E + \psi_M(\theta, t) \mathbf{e}_M + \psi_\Sigma(\theta, t) \mathbf{e}_\Sigma$$

where $\{\mathbf{e}_S, \mathbf{e}_E, \mathbf{e}_M, \mathbf{e}_\Sigma\}$ is the canonical orthonormal basis of $\mathbb{R}^4$.

---

## 2. The Master Field Equation

The total vector wave function is given by the matrix operator product:

$$\mathbf{\Psi}(\theta, t) = \mathbf{S}(\text{sect}(t)) \; \mathbf{\Lambda}(r(t)) \; \mathbf{g}(\theta - \boldsymbol{\theta}(t))$$

### Operators & Matrices:
1. **Sect Operator Matrix $\mathbf{S} \in \{0, 1\}^{4 \times N}$**:
   A $4 \times N$ binary indicator matrix whose $k$-th column $\mathbf{s}_k(\text{sect}) \in \{0, 1\}^4$ maps planet $k$ to its sectarian ESMS allocation.
2. **Gravitational Mass-Distance Tensor $\mathbf{\Lambda}(r) \in \mathbb{R}_+^{N \times N}$**:
   A diagonal matrix encoding physical mass $M_k$ and inverse-square geocentric distance $r_k(t)$ in AU:
   $$\mathbf{\Lambda}(r) = \operatorname{diag}\left( \frac{M_1}{r_1^2}, \frac{M_2}{r_2^2}, \dots, \frac{M_N}{r_N^2} \right)$$
3. **Gaussian Wave Packet Vector $\mathbf{g}(\theta - \boldsymbol{\theta}) \in \mathbb{R}^N$**:
   A vector of continuous spatial Gaussian distributions centered at longitudes $\theta_k$:
   $$\mathbf{g}(\theta - \boldsymbol{\theta}) = \begin{bmatrix} g_1(\theta - \theta_1) \\ g_2(\theta - \theta_2) \\ \vdots \\ g_N(\theta - \theta_N) \end{bmatrix}, \quad g_k(\theta) = \frac{1}{\sqrt{2\pi}\sigma_k} \exp\left( -\frac{(\theta - \theta_k)^2}{2\sigma_k^2} \right)$$

---

## 3. Explicit Scalar Wave Functions for the 4 ESMS Coins

By projecting $\mathbf{\Psi}(\theta, t)$ onto the basis vectors $\mathbf{e}_K$, we obtain the 4 explicit scalar wave functions:

### 3.1. Spirit Wave Function $\psi_S(\theta, t)$
Projecting onto $\mathbf{e}_S = [1, 0, 0, 0]^T$:

$$\psi_S(\theta, t) = \mathbf{e}_S^T \mathbf{\Psi}(\theta, t) = \sum_{p \in \mathcal{P}_S(\text{sect})} \frac{M_p}{r_p^2} \; \frac{1}{\sqrt{2\pi}\sigma_p} \exp\left( -\frac{(\theta - \theta_p)^2}{2\sigma_p^2} \right)$$

* **Physical Quality**: Energetic velocity, conscious drive, transformational potential, light.
* **Contributing Bodies**:
  * **Diurnal Sect (Day)**: $\mathcal{P}_S(\text{Day}) = \{ \text{Sun}, \text{Mercury}, \text{Jupiter}, \text{Saturn}, \text{Ascendant} \}$
  * **Nocturnal Sect (Night)**: $\mathcal{P}_S(\text{Night}) = \{ \text{Sun}, \text{Ascendant} \}$

---

### 3.2. Essence Wave Function $\psi_E(\theta, t)$
Projecting onto $\mathbf{e}_E = [0, 1, 0, 0]^T$:

$$\psi_E(\theta, t) = \mathbf{e}_E^T \mathbf{\Psi}(\theta, t) = \sum_{p \in \mathcal{P}_E(\text{sect})} \frac{M_p}{r_p^2} \; \frac{1}{\sqrt{2\pi}\sigma_p} \exp\left( -\frac{(\theta - \theta_p)^2}{2\sigma_p^2} \right)$$

* **Physical Quality**: Vibrational quality, fluid timing, emotional resonance, soul.
* **Contributing Bodies**:
  * **Diurnal Sect (Day)**: $\mathcal{P}_E(\text{Day}) = \{ \text{Moon}, \text{Venus}, \text{Mars}, \text{Uranus}, \text{Neptune}, \text{Pluto}, \text{Ascendant} \}$
  * **Nocturnal Sect (Night)**: $\mathcal{P}_E(\text{Night}) = \{ \text{Jupiter}, \text{Ascendant} \}$

---

### 3.3. Matter Wave Function $\psi_M(\theta, t)$
Projecting onto $\mathbf{e}_M = [0, 0, 1, 0]^T$:

$$\psi_M(\theta, t) = \mathbf{e}_M^T \mathbf{\Psi}(\theta, t) = \sum_{p \in \mathcal{P}_M(\text{sect})} \frac{M_p}{r_p^2} \; \frac{1}{\sqrt{2\pi}\sigma_p} \exp\left( -\frac{(\theta - \theta_p)^2}{2\sigma_p^2} \right)$$

* **Physical Quality**: Physical caloric mass, biological density, structural inertia, body.
* **Contributing Bodies**:
  * **Diurnal Sect (Day)**: $\mathcal{P}_M(\text{Day}) = \{ \text{Ascendant} \}$
  * **Nocturnal Sect (Night)**: $\mathcal{P}_M(\text{Night}) = \{ \text{Moon}, \text{Venus}, \text{Mars}, \text{Saturn}, \text{Uranus}, \text{Pluto}, \text{Ascendant} \}$

---

### 3.4. Substance Wave Function $\psi_\Sigma(\theta, t)$
Projecting onto $\mathbf{e}_\Sigma = [0, 0, 0, 1]^T$:

$$\psi_\Sigma(\theta, t) = \mathbf{e}_\Sigma^T \mathbf{\Psi}(\theta, t) = \sum_{p \in \mathcal{P}_\Sigma(\text{sect})} \frac{M_p}{r_p^2} \; \frac{1}{\sqrt{2\pi}\sigma_p} \exp\left( -\frac{(\theta - \theta_p)^2}{2\sigma_p^2} \right)$$

* **Physical Quality**: Thermodynamic heat capacity, structural endurance, molecular binding.
* **Contributing Bodies**:
  * **Diurnal Sect (Day)**: $\mathcal{P}_\Sigma(\text{Day}) = \{ \text{Ascendant} \}$
  * **Nocturnal Sect (Night)**: $\mathcal{P}_\Sigma(\text{Night}) = \{ \text{Mercury}, \text{Neptune}, \text{Ascendant} \}$

---

## 4. Manifold Integrals & Thermodynamic Observables

Integrating the vector wave function around $S^1$ yields the total integrated ESMS vector $\mathbf{K} \in \mathbb{R}^4$:

$$\mathbf{K} = \begin{bmatrix} Spirit \\ Essence \\ Matter \\ Substance \end{bmatrix} = \int_{S^1} \mathbf{\Psi}(\theta, t) \, d\theta = \mathbf{S} \; \mathbf{\Lambda}(r) \; \mathbf{1}_N$$

Derived non-linear physical observables are calculated as expectations:

1. **Reactivity Observable $\langle \hat{R} \rangle$**:
   $$\langle \hat{R} \rangle = \left( \mathbf{e}_M^T \mathbf{K} + E_{\text{Earth}} \right)^2 = (\text{Matter} + \text{Earth})^2$$
2. **Monica Equilibrium Observable $\Phi(\mathbf{\Psi})$**:
   $$\Phi(\mathbf{\Psi}) = 1.618 \cdot \ln\left( \frac{(\mathbf{e}_S + \mathbf{e}_E)^T \mathbf{K} + \epsilon}{(\mathbf{e}_M + \mathbf{e}_\Sigma)^T \mathbf{K} + \epsilon} \right)$$

---

## 5. Discrete Equivalence & Code Parity

In computational execution (TypeScript & Python), the spatial Gaussian kernel $g_p(\theta)$ is integrated over $S^1$ in the Dirac-delta limit ($\sigma_p \to 0$):

$$\lim_{\sigma_p \to 0} \int_{S^1} g_p(\theta) \, d\theta = 1$$

This proves that our shipped codebase functions in `backend/utils/planetary_alchemy.py` and `src/utils/planetaryAlchemyMapping.ts` are **exact discrete Riemann-sum quadratures** of this continuous Gaussian field theory.

---

## 6. Token Quantization Contract (DRAFT — for ruling, no code until ruled)

*Added 2026-07-31. Status: PROPOSED. Nothing mints until this section is RULED and the two blockers in §7 are resolved.*

Mainnet requires the continuous integrated vector $\mathbf{K} \in \mathbb{R}^4$ to become discrete on-chain units **deterministically and identically in both runtimes**. The current code disagrees even with itself (`evaluate_field` rounds to 1e-6, `integrate_field` to 1e-4) and across runtimes (§7.1).

1. **Unit**: 1 on-chain unit = $10^{-6}$ K-units ("micro-ESMS"). On-chain amounts are integers only.
2. **Boundary**: one named function per runtime — `quantizeEsms(K) = ⌊K · 10⁶⌋` per coin — applied **once**, at the mint/settlement boundary. All upstream math stays full-precision `float64`; the 1e-6/1e-4 roundings inside the field engine are display conventions and MUST NOT feed the quantizer.
3. **Rounding**: `floor`, never `round`. A quantizer can only under-credit, mirroring the mint-cost-pole rule: economic errors must favor the ledger, not the minter.
4. **Conservation**: `floor` gives $\sum_k q(K_k) \le q(\sum_k K_k)$ — a portfolio of parts can never quantize to more than the whole. Pinned by test.
5. **Idempotence**: `quantize(dequantize(q)) === q` exactly. Pinned by test.
6. **Cross-runtime determinism**: TS and Python MUST produce byte-identical integers over the 20-chart golden fixture, asserted by both conformance suites. This is the mainnet gate.

**Blockers**: (a) the mass-basis unification (TS uses physical-mass weights, Python uses orbital-period weights — same skies differ up to 2×; RULED: physical mass, both); (b) the $\mathbf{\Lambda}(r)$ dimensional defect below — a quantity whose *scale* is undecided cannot have its units fixed.

---

## 7. The Λ(r) Dimensional Defect (MEASURED BLOCKER)

*Added 2026-07-31 from production measurement. The §2 tensor as shipped is dimensionally incoherent.*

$\mathbf{\Lambda} = \operatorname{diag}(M_k / r_k^2)$ divides a **dimensionless log-normalized weight** by a **physical distance squared**. The `PLANET_MEAN_DISTANCES` table papered over this by pinning Moon (and Mercury) to `1.000` AU — but both live chart calculators (swisseph and pyephem) emit **real** geocentric distances, and the engine prefers a supplied distance over the table.

**MEASURED consequences with the Moon's real $r \approx 0.00257$ AU:**

| quantity | fixture regime ($r_{Moon}=1.0$) | production regime (real $r$) |
|---|---|---|
| Moon inertia | 0.284 | **43,043** (Sun: 0.51) |
| day-chart ESMS | mixed | Essence ≈ 43,045 (99.99% Moon) |
| monica | continuous | sect binary: **+16.72 / −16.07** |
| reactivity (night) | O(1) | **1.85 × 10⁹** |
| canonical kalchm | finite | **overflows** → fallback 1.0 → monica φ |

The golden fixture inherits the same $r_{Moon}=1.0$ fudge, so **every conformance gate tests the sanitized regime while production runs the pathological one**. And the overflow row is the bitter one: feeding real-distance ESMS into the canonical engine recreates the exact φ-collapse the wave-function work was meant to escape.

**Options, measured over 2026 (6-hour grid, 1460 samples, real ephemeris):**

- **(A) True tidal physics** $M/r^3$ with real masses: Moon:Sun = 2.18:1, planets ≈ 10⁻⁵ — physically true, numerically tame, but planets stop mattering entirely.
- **(B) Mean distances only** (ignore live $r$): the current fudge made explicit; all distance modulation lost; $\mathbf{\Lambda}$ degenerates to a constant per sect.
- **(C) Relative-distance modulation** $\mathbf{\Lambda} = \operatorname{diag}\left(\hat{M}_k \cdot (\bar{r}_k / r_k)^2\right)$ — dimensionless by construction; each body oscillates about its own mean. MEASURED: 1460/1460 distinct states; $|\ln(\text{kalchm})| \le 16.9$ (canonical-safe, limit 709); day/night structure preserved (means +7.7 / −2.6); modulation ranges from the real sky: Moon ±13%, Mercury 0.53–3.4×, Venus 0.35–13.9×. **RECOMMENDED.**

Under (C) the $\bar{r}_k$ table becomes MEASURED per-epoch mean geocentric distances (2026: Sun 1.00015, Moon 0.00257, Mercury 1.05278, Venus 1.01621, Mars 1.94426, Jupiter 5.42979, Saturn 9.48438, Uranus 19.49877, Neptune 29.88355, Pluto 35.52719 AU), re-derived by a conformance test — not hand-maintained constants.

---

## 8. Harmonic-Oscillator Hamiltonian on ln(kalchm) (RULED destination)

*The oscillator coordinate is $x = \ln(\text{kalchm})$: it genuinely oscillates about a sect-conditional equilibrium (the canonical engine's φ-band already rules the well's minimum), unlike planetary longitudes, which circulate and would need an invented ω.*

$$\hat{H} = \frac{\hat{p}^2}{2m} + \frac{1}{2} m \omega^2 (x - \bar{x}_{\text{sect}})^2$$

**ω is DERIVED from the measured power spectrum of $x(t)$, never assigned.** Measured (2026, 6h grid, real distances, sect-demodulated day series):

- **Current Λ**: total swing ±155,724; the residual spectrum concentrates in the 25–40 d lunar band (synodic 29.53 d: 6.5×10⁹; anomalistic 27.55 d: 1.9×10⁹) — i.e. under the shipped tensor, the oscillator **is** the Moon's distance cycle and nothing else.
- **Under option C**: |x| ≤ 16.9; dominant peaks move to the annual/Venus-synodic scale (~2.5×10³ at ≈1 yr) with Mercury's 115.9 d synodic clearly resolved (4.6×10²) and the lunar months present but proportionate (~0.3–0.5).

**Consequences for implementation, once §7 is ruled:**
1. ω must be re-derived against the ruled Λ — deriving it now would calibrate a constant against a defect.
2. The Venus synodic period (584 d) exceeds a 1-year window; the ω-derivation epoch must span ≥ 2 synodic cycles (**2026–2029**).
3. The Gaussian packets as shipped have fixed σ — already the **coherent state** ($\sigma = \sigma_0$, no spreading). The oscillator adds the time dimension: packet centers transported along measured ephemeris (endpoints pinned to astronomy-engine — the transport rule is the only new machinery, no invented positions), reusable directly as the SpacetimeDB live-layer interpolant.
4. Squeezed states ($\sigma \ne \sigma_0$, width breathing at $2\omega$) are OUT OF SCOPE until a measurable basis for σ-dynamics exists; a breathing width with an assigned rate would be a fabricated constant wearing physics clothing.
