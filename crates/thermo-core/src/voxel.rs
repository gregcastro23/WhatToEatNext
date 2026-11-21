//! 3D transient conduction on a uniform cell-centred grid — the "voxel engine".
//!
//! The Rust half of a two-runtime pair; the TypeScript half is
//! `src/lib/cooking/voxelConduction.ts`. As with the rest of this crate, the
//! only thing keeping the two from drifting is that both reproduce the same
//! golden vectors EXACTLY (`tests/voxel_golden_vectors.json`, asserted by
//! `tests/voxel_golden.rs` here and by
//! `src/__tests__/voxelConductionCrossRuntimeParity.test.ts` there).
//!
//! ## Why a 3D model exists at all
//!
//! A bone that runs THROUGH a steak's thickness (porterhouse, T-bone, bone-in
//! ribeye, chops, crosscut shank) is a lateral obstacle: heat reaches the meat
//! beside it along a path the 1D slab column cannot represent.
//!
//! ## Formulation (the contract both runtimes implement)
//!
//! - Finite volumes on an `nx × ny × nz` grid (x = width, y = thickness,
//!   z = length), spacings `dx, dy, dz` in metres. Cell index
//!   `c = i + nx·(j + ny·k)`. Each cell carries a material index into a table of
//!   `{k W/m·K, ρc J/m³·K}`.
//! - Interior face between cells a, b a distance `d` apart through area `A`:
//!   `G = A / (d·0.5/k_a + d·0.5/k_b)` — two half-cell resistances in series.
//!   The 0.5 is geometry (centre to face of a cell), not a fitted factor.
//! - Domain face (order x−, x+, y−, y+, z−, z+), each `{h W/m²K, medium °C}`:
//!   `G = A / (1/h + d·0.5/k)` — film resistance in series with the half
//!   cell. `h == 0` is an adiabatic face: `G = 0`, no division by zero.
//! - Explicit forward Euler, double-buffered:
//!   `T' = T + (dt/C)·Σ G_n·(T_n − T)`, `C = ρc·dx·dy·dz`, every neighbour read
//!   from the PRE-step array, accumulated in the fixed order x−, x+, y−, y+,
//!   z−, z+.
//! - `stable_dt = min_c C/ΣG` — the forward-Euler positivity bound. The caller
//!   multiplies by a safety factor ≤ 0.9.
//!
//! ## Bit-exactness rules
//!
//! Only `+ − × ÷` and comparisons, in the written order, on `f64`. No
//! transcendental functions (their last bit belongs to each platform's libm),
//! no fused multiply-add (Rust never contracts without being asked, and
//! wasm32 MVP has no FMA instruction). `dt / C` is cached per `dt`; computing
//! it once or every step yields the same bits, so the cache is pure speed.

/// Largest grid accepted, in cells.
///
/// BASIS: 2¹⁶. The engine holds twelve `f64` arrays per cell (six face
/// conductances, conductivity, capacity, `dt/C`, the temperature double buffer
/// and peaks), so this caps linear memory at 65 536 × 12 × 8 B ≈ 6.3 MB — a
/// bound a bad JS argument cannot push past.
pub const VOXEL_MAX_CELLS: usize = 65_536;

/// Number of domain faces, and floats per face (`h`, `medium`).
pub const VOXEL_FACE_COUNT: usize = 6;
pub const VOXEL_FACE_FLOATS: usize = VOXEL_FACE_COUNT * 2;

/// Why the engine refused an input. Mirrored by the `RangeError` messages of
/// the TypeScript half; a refusal on one side only is drift.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VoxelError {
    /// A dimension is zero.
    EmptyGrid,
    /// More than [`VOXEL_MAX_CELLS`] cells.
    TooManyCells,
    /// A spacing is not a finite positive length.
    NonPositiveSpacing,
    /// `material.len() != nx·ny·nz`, or the property tables differ in length
    /// or are empty / longer than 256 entries.
    ShapeMismatch,
    /// A cell names a material index past the end of the property tables.
    UnknownMaterial,
    /// A conductivity or volumetric heat capacity is not finite and positive.
    NonPositiveProperty,
    /// A temperature (initial or medium) is not finite.
    NonFiniteTemperature,
    /// `set_faces` was not given exactly 12 floats, or an `h` is negative or
    /// not finite.
    BadFaces,
    /// `dt` is not a finite positive number of seconds.
    BadTimeStep,
}

impl VoxelError {
    /// Stable, human-readable reason; the WASM skin forwards it as a JsError.
    pub fn message(self) -> &'static str {
        match self {
            VoxelError::EmptyGrid => "voxel grid dimensions must be at least 1",
            VoxelError::TooManyCells => "voxel grid exceeds 65536 cells",
            VoxelError::NonPositiveSpacing => "voxel spacing must be finite and positive",
            VoxelError::ShapeMismatch => "voxel material/property arrays have the wrong length",
            VoxelError::UnknownMaterial => "voxel cell names an unknown material",
            VoxelError::NonPositiveProperty => "voxel k and rhoC must be finite and positive",
            VoxelError::NonFiniteTemperature => "voxel temperature must be finite",
            VoxelError::BadFaces => "voxel faces need 12 finite floats with h >= 0",
            VoxelError::BadTimeStep => "voxel dt must be finite and positive",
        }
    }
}

/// Interior conductance between two cells, W/K.
#[inline]
fn interior_g(area: f64, d: f64, k_a: f64, k_b: f64) -> f64 {
    area / (d * 0.5 / k_a + d * 0.5 / k_b)
}

/// Domain-face conductance, W/K. `h == 0` is adiabatic.
#[inline]
fn boundary_g(area: f64, d: f64, h: f64, k: f64) -> f64 {
    if h == 0.0 { 0.0 } else { area / (1.0 / h + d * 0.5 / k) }
}

fn finite_positive(x: f64) -> bool {
    x.is_finite() && x > 0.0
}

fn zeros(n: usize) -> Vec<f64> {
    let mut v = Vec::new();
    v.resize(n, 0.0);
    v
}

/// The engine state. Construct with [`VoxelGrid::new`].
#[derive(Debug, Clone)]
pub struct VoxelGrid {
    nx: usize,
    ny: usize,
    nz: usize,
    dx: f64,
    dy: f64,
    dz: f64,
    material: Vec<u8>,
    k: Vec<f64>,
    cap: Vec<f64>,
    /// Face conductances per cell, in face order x−, x+, y−, y+, z−, z+.
    g: [Vec<f64>; VOXEL_FACE_COUNT],
    medium: [f64; VOXEL_FACE_COUNT],
    factor: Vec<f64>,
    factor_dt: f64,
    temps: Vec<f64>,
    next: Vec<f64>,
    peaks: Vec<f64>,
}

impl VoxelGrid {
    /// Build a grid at a uniform `initial_c`, every domain face adiabatic.
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        nx: usize,
        ny: usize,
        nz: usize,
        dx: f64,
        dy: f64,
        dz: f64,
        material: &[u8],
        k: &[f64],
        rho_c: &[f64],
        initial_c: f64,
    ) -> Result<VoxelGrid, VoxelError> {
        if nx == 0 || ny == 0 || nz == 0 {
            return Err(VoxelError::EmptyGrid);
        }
        let n = match nx.checked_mul(ny).and_then(|p| p.checked_mul(nz)) {
            Some(n) if n <= VOXEL_MAX_CELLS => n,
            _ => return Err(VoxelError::TooManyCells),
        };
        if !finite_positive(dx) || !finite_positive(dy) || !finite_positive(dz) {
            return Err(VoxelError::NonPositiveSpacing);
        }
        if material.len() != n || k.is_empty() || k.len() != rho_c.len() || k.len() > 256 {
            return Err(VoxelError::ShapeMismatch);
        }
        if k.iter().chain(rho_c.iter()).any(|v| !finite_positive(*v)) {
            return Err(VoxelError::NonPositiveProperty);
        }
        if material.iter().any(|m| (*m as usize) >= k.len()) {
            return Err(VoxelError::UnknownMaterial);
        }
        if !initial_c.is_finite() {
            return Err(VoxelError::NonFiniteTemperature);
        }
        let mut cell_k = zeros(n);
        let mut cap = zeros(n);
        for c in 0..n {
            let m = material[c] as usize;
            cell_k[c] = k[m];
            cap[c] = rho_c[m] * dx * dy * dz;
        }
        let mut temps = zeros(n);
        temps.fill(initial_c);
        let mut grid = VoxelGrid {
            nx,
            ny,
            nz,
            dx,
            dy,
            dz,
            material: material.to_vec(),
            k: cell_k,
            cap,
            g: [zeros(n), zeros(n), zeros(n), zeros(n), zeros(n), zeros(n)],
            medium: [0.0; VOXEL_FACE_COUNT],
            factor: zeros(n),
            factor_dt: f64::NAN,
            next: zeros(n),
            peaks: temps.clone(),
            temps,
        };
        grid.build_interior();
        Ok(grid)
    }

    fn build_interior(&mut self) {
        let (nx, ny, nz) = (self.nx, self.ny, self.nz);
        let (ax, ay, az) = (self.dy * self.dz, self.dx * self.dz, self.dx * self.dy);
        let (sy, sz) = (nx, nx * ny);
        for kk in 0..nz {
            for j in 0..ny {
                for i in 0..nx {
                    let c = i + nx * (j + ny * kk);
                    if i + 1 < nx {
                        let g = interior_g(ax, self.dx, self.k[c], self.k[c + 1]);
                        self.g[1][c] = g;
                        self.g[0][c + 1] = g;
                    }
                    if j + 1 < ny {
                        let g = interior_g(ay, self.dy, self.k[c], self.k[c + sy]);
                        self.g[3][c] = g;
                        self.g[2][c + sy] = g;
                    }
                    if kk + 1 < nz {
                        let g = interior_g(az, self.dz, self.k[c], self.k[c + sz]);
                        self.g[5][c] = g;
                        self.g[4][c + sz] = g;
                    }
                }
            }
        }
    }

    /// Set the six domain faces from `[h, medium] × 6` (x−, x+, y−, y+, z−, z+).
    pub fn set_faces(&mut self, faces: &[f64]) -> Result<(), VoxelError> {
        if faces.len() != VOXEL_FACE_FLOATS {
            return Err(VoxelError::BadFaces);
        }
        for f in 0..VOXEL_FACE_COUNT {
            let (h, m) = (faces[2 * f], faces[2 * f + 1]);
            if !h.is_finite() || h < 0.0 {
                return Err(VoxelError::BadFaces);
            }
            if !m.is_finite() {
                return Err(VoxelError::NonFiniteTemperature);
            }
        }
        let (nx, ny, nz) = (self.nx, self.ny, self.nz);
        let (ax, ay, az) = (self.dy * self.dz, self.dx * self.dz, self.dx * self.dy);
        for kk in 0..nz {
            for j in 0..ny {
                for i in 0..nx {
                    let c = i + nx * (j + ny * kk);
                    let kc = self.k[c];
                    if i == 0 { self.g[0][c] = boundary_g(ax, self.dx, faces[0], kc); }
                    if i + 1 == nx { self.g[1][c] = boundary_g(ax, self.dx, faces[2], kc); }
                    if j == 0 { self.g[2][c] = boundary_g(ay, self.dy, faces[4], kc); }
                    if j + 1 == ny { self.g[3][c] = boundary_g(ay, self.dy, faces[6], kc); }
                    if kk == 0 { self.g[4][c] = boundary_g(az, self.dz, faces[8], kc); }
                    if kk + 1 == nz { self.g[5][c] = boundary_g(az, self.dz, faces[10], kc); }
                }
            }
        }
        for f in 0..VOXEL_FACE_COUNT {
            self.medium[f] = faces[2 * f + 1];
        }
        Ok(())
    }

    /// `min_c C/ΣG`, seconds. `+∞` when no cell exchanges heat at all.
    pub fn stable_dt(&self) -> f64 {
        let mut best = f64::INFINITY;
        for c in 0..self.cap.len() {
            let s = self.g[0][c] + self.g[1][c] + self.g[2][c] + self.g[3][c] + self.g[4][c] + self.g[5][c];
            if s > 0.0 {
                let r = self.cap[c] / s;
                if r < best {
                    best = r;
                }
            }
        }
        best
    }

    /// Advance `n` explicit steps of `dt` seconds, updating the running peaks
    /// after every step.
    pub fn step(&mut self, dt: f64, n: u32) -> Result<(), VoxelError> {
        if !finite_positive(dt) {
            return Err(VoxelError::BadTimeStep);
        }
        if dt != self.factor_dt {
            for c in 0..self.cap.len() {
                self.factor[c] = dt / self.cap[c];
            }
            self.factor_dt = dt;
        }
        for _ in 0..n {
            self.step_once();
        }
        Ok(())
    }

    fn step_once(&mut self) {
        let (nx, ny, nz) = (self.nx, self.ny, self.nz);
        let (sy, sz) = (nx, nx * ny);
        let t_in = &self.temps;
        let g = &self.g;
        let md = &self.medium;
        for kk in 0..nz {
            for j in 0..ny {
                for i in 0..nx {
                    let c = i + nx * (j + ny * kk);
                    let t = t_in[c];
                    let mut s = 0.0;
                    s += g[0][c] * ((if i > 0 { t_in[c - 1] } else { md[0] }) - t);
                    s += g[1][c] * ((if i + 1 < nx { t_in[c + 1] } else { md[1] }) - t);
                    s += g[2][c] * ((if j > 0 { t_in[c - sy] } else { md[2] }) - t);
                    s += g[3][c] * ((if j + 1 < ny { t_in[c + sy] } else { md[3] }) - t);
                    s += g[4][c] * ((if kk > 0 { t_in[c - sz] } else { md[4] }) - t);
                    s += g[5][c] * ((if kk + 1 < nz { t_in[c + sz] } else { md[5] }) - t);
                    let v = t + self.factor[c] * s;
                    self.next[c] = v;
                    if v > self.peaks[c] {
                        self.peaks[c] = v;
                    }
                }
            }
        }
        core::mem::swap(&mut self.temps, &mut self.next);
    }

    /// Restart peak tracking from the current temperatures.
    pub fn reset_peaks(&mut self) {
        self.peaks.copy_from_slice(&self.temps);
    }

    fn extreme_where(&self, material: u8, want_min: bool) -> f64 {
        let mut found = false;
        let mut best = 0.0;
        for c in 0..self.temps.len() {
            if self.material[c] != material {
                continue;
            }
            let t = self.temps[c];
            if !found || (want_min && t < best) || (!want_min && t > best) {
                best = t;
                found = true;
            }
        }
        if found { best } else { f64::NAN }
    }

    /// Coldest temperature among cells of `material`; NaN when there are none.
    pub fn min_temp_where(&self, material: u8) -> f64 {
        self.extreme_where(material, true)
    }

    /// Hottest temperature among cells of `material`; NaN when there are none.
    pub fn max_temp_where(&self, material: u8) -> f64 {
        self.extreme_where(material, false)
    }

    /// Σ C·T in cell-index order, J relative to 0 °C.
    pub fn energy_j(&self) -> f64 {
        let mut e = 0.0;
        for c in 0..self.temps.len() {
            e += self.cap[c] * self.temps[c];
        }
        e
    }

    /// Temperature of one cell; NaN past the end.
    pub fn temp_at(&self, index: usize) -> f64 {
        if index < self.temps.len() { self.temps[index] } else { f64::NAN }
    }

    pub fn temps(&self) -> &[f64] {
        &self.temps
    }

    pub fn peaks(&self) -> &[f64] {
        &self.peaks
    }

    pub fn materials(&self) -> &[u8] {
        &self.material
    }

    pub fn capacities(&self) -> &[f64] {
        &self.cap
    }

    pub fn nx(&self) -> usize {
        self.nx
    }

    pub fn ny(&self) -> usize {
        self.ny
    }

    pub fn nz(&self) -> usize {
        self.nz
    }

    pub fn cell_count(&self) -> usize {
        self.temps.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn lean_box(nx: usize, ny: usize, nz: usize) -> VoxelGrid {
        let n = nx * ny * nz;
        let mut m = Vec::new();
        m.resize(n, 0u8);
        VoxelGrid::new(nx, ny, nz, 0.002, 0.002, 0.002, &m, &[0.45], &[3.675e6], 10.0).unwrap()
    }

    #[test]
    fn refuses_bad_inputs_rather_than_panicking() {
        let m = [0u8; 8];
        let ok = |m: &[u8], k: &[f64], r: &[f64]| VoxelGrid::new(2, 2, 2, 0.01, 0.01, 0.01, m, k, r, 5.0);
        assert_eq!(ok(&m[..7], &[0.4], &[1e6]).unwrap_err(), VoxelError::ShapeMismatch);
        assert_eq!(ok(&[1u8; 8], &[0.4], &[1e6]).unwrap_err(), VoxelError::UnknownMaterial);
        assert_eq!(ok(&m, &[0.0], &[1e6]).unwrap_err(), VoxelError::NonPositiveProperty);
        assert_eq!(ok(&m, &[f64::NAN], &[1e6]).unwrap_err(), VoxelError::NonPositiveProperty);
        assert_eq!(
            VoxelGrid::new(300, 300, 1, 0.01, 0.01, 0.01, &[], &[0.4], &[1e6], 5.0).unwrap_err(),
            VoxelError::TooManyCells
        );
        assert_eq!(
            VoxelGrid::new(2, 2, 2, 0.0, 0.01, 0.01, &m, &[0.4], &[1e6], 5.0).unwrap_err(),
            VoxelError::NonPositiveSpacing
        );
        let mut g = ok(&m, &[0.4], &[1e6]).unwrap();
        assert_eq!(g.set_faces(&[1.0; 11]).unwrap_err(), VoxelError::BadFaces);
        let mut neg = [0.0; 12];
        neg[4] = -1.0;
        assert_eq!(g.set_faces(&neg).unwrap_err(), VoxelError::BadFaces);
        assert_eq!(g.step(f64::NAN, 1).unwrap_err(), VoxelError::BadTimeStep);
        assert!(g.min_temp_where(3).is_nan());
    }

    #[test]
    fn all_adiabatic_box_is_inert_and_has_no_stable_dt_bound_from_faces() {
        let g = lean_box(1, 1, 1);
        assert!(g.stable_dt().is_infinite());
    }

    #[test]
    fn heats_toward_the_medium_and_tracks_peaks() {
        let mut g = lean_box(3, 5, 3);
        let mut faces = [0.0; 12];
        faces[4] = 200.0;
        faces[5] = 100.0;
        g.set_faces(&faces).unwrap();
        let dt = 0.9 * g.stable_dt();
        g.step(dt, 50).unwrap();
        assert!(g.max_temp_where(0) > 10.0 && g.max_temp_where(0) < 100.0);
        // y+ is adiabatic, so the coldest cells are the top layer.
        assert_eq!(g.min_temp_where(0), g.temp_at(1 + 3 * (4 + 5 * 1)));
        for (p, t) in g.peaks().iter().zip(g.temps()) {
            assert!(p >= t);
        }
    }
}
