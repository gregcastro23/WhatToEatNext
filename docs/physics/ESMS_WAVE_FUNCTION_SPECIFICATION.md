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
