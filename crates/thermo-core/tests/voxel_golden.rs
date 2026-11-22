//! Cross-runtime golden vectors for the voxel (3D conduction) engine — the Rust
//! half, AND the generator for `voxel_golden_vectors.json`.
//!
//! Regenerate after a deliberate change to `src/voxel.rs`:
//!
//!     cargo test -p thermo-core --test voxel_golden -- --ignored emit_voxel_golden_vectors
//!
//! The generator lives here rather than in `examples/emit_golden.rs` so that
//! adding the voxel engine leaves `thermo_golden_vectors.json` byte-identical.
//!
//! As with `golden.rs`, "Rust reproduces a fixture Rust wrote" is nearly a
//! tautology; the job of `voxel_fixture_is_current` is to fail when the kernel
//! changes and nobody regenerated. The real drift detector is the `===`
//! comparison in `src/__tests__/voxelConductionCrossRuntimeParity.test.ts`, and
//! the physics anchors below (energy conservation, mirror symmetry, the
//! one-term plane-wall solution) are judged against bands that are not read
//! back from the values they judge.
//!
//! Materials table BASIS: lean = `LEAN_MEAT_K_W_M_K` / ρ·cp (Singh & Heldman,
//! see lib.rs); cortical bone and yellow marrow = IT'IS v4.1 averages, the same
//! figures as `ITIS_TISSUE` in `src/lib/butcher/science/slabColumn.ts`.

use thermo_core::*;

const FIXTURE_PATH: &str = "tests/voxel_golden_vectors.json";

/// Shortest round-trip form; `null` for NaN (see `examples/emit_golden.rs`).
fn j(v: f64) -> String {
    if v.is_nan() {
        return "null".to_string();
    }
    assert!(v.is_finite(), "infinite value {v} has no JSON representation");
    let s = format!("{v:?}");
    let back: f64 = s.parse().expect("formatted value must parse");
    assert_eq!(back.to_bits(), v.to_bits(), "value {v} did not round-trip");
    s
}

fn arr(v: &[f64]) -> String {
    v.iter().map(|x| j(*x)).collect::<Vec<_>>().join(", ")
}

fn materials() -> ([f64; 3], [f64; 3]) {
    let k = [LEAN_MEAT_K_W_M_K, 0.32, 0.192135101333333];
    let rho_c = [
        LEAN_MEAT_RHO_KG_M3 * LEAN_MEAT_C_J_KG_K,
        1908.0 * 1312.83333333333,
        980.0 * 2065.0,
    ];
    (k, rho_c)
}

struct Stage {
    faces: [f64; 12],
    reset_peaks: bool,
    steps: u32,
}

struct Case {
    name: &'static str,
    dims: (usize, usize, usize),
    spacing: (f64, f64, f64),
    material: Vec<u8>,
    initial_c: f64,
    stages: Vec<Stage>,
}

fn three_material_case() -> Case {
    let (nx, ny, nz) = (5, 4, 3);
    let mut material = Vec::new();
    for k in 0..nz {
        for jj in 0..ny {
            for i in 0..nx {
                let m = if i == 2 {
                    1
                } else if i == 3 && k == 1 && (jj == 1 || jj == 2) {
                    2
                } else {
                    0
                };
                material.push(m);
            }
        }
    }
    Case {
        name: "three-material-six-faces",
        dims: (nx, ny, nz),
        spacing: (0.002, 0.0025, 0.003),
        material,
        initial_c: 10.0,
        stages: vec![
            // x− pan contact, x+ pan air side, y− gentle pan, y+ ADIABATIC,
            // z− braise liquid, z+ low oven.
            Stage {
                faces: [225.0, 202.0, 12.0, 25.0, 72.0, 100.0, 0.0, 50.0, 950.0, 98.0, 13.0, 92.0],
                reset_peaks: false,
                steps: 30,
            },
            // Rest: still air on five faces, z− now the adiabatic one.
            Stage {
                faces: [22.0, 22.0, 10.0, 22.0, 22.0, 22.0, 22.0, 22.0, 0.0, 22.0, 22.0, 22.0],
                reset_peaks: true,
                steps: 30,
            },
        ],
    }
}

fn column_case() -> Case {
    let ny = 9;
    let material = (0..ny).map(|jj| if jj == 4 { 1 } else { 0 }).collect();
    Case {
        name: "column-1x9x1",
        dims: (1, ny, 1),
        spacing: (0.01, 0.002, 0.01),
        material,
        initial_c: 4.0,
        stages: vec![Stage {
            faces: [5.0, 30.0, 5.0, 30.0, 280.0, 210.0, 13.0, 92.0, 0.0, 0.0, 0.0, 0.0],
            reset_peaks: false,
            steps: 80,
        }],
    }
}

fn build(case: &Case) -> VoxelGrid {
    let (k, rho_c) = materials();
    let (nx, ny, nz) = case.dims;
    let (dx, dy, dz) = case.spacing;
    VoxelGrid::new(nx, ny, nz, dx, dy, dz, &case.material, &k, &rho_c, case.initial_c).unwrap()
}

fn render_case(case: &Case) -> String {
    let (k, rho_c) = materials();
    let mut grid = build(case);
    let mut stages = Vec::new();
    for st in &case.stages {
        grid.set_faces(&st.faces).unwrap();
        if st.reset_peaks {
            grid.reset_peaks();
        }
        let stable = grid.stable_dt();
        let dt = 0.9 * stable;
        grid.step(dt, st.steps).unwrap();
        let mins: Vec<f64> = (0..3u8).map(|m| grid.min_temp_where(m)).collect();
        let maxs: Vec<f64> = (0..3u8).map(|m| grid.max_temp_where(m)).collect();
        stages.push(format!(
            "      {{ \"faces\": [{}], \"resetPeaks\": {}, \"steps\": {}, \"stableDt\": {}, \"dt\": {},\n        \
\"energyJ\": {}, \"minByMaterial\": [{}], \"maxByMaterial\": [{}],\n        \
\"temps\": [{}],\n        \"peaks\": [{}] }}",
            arr(&st.faces), st.reset_peaks, st.steps, j(stable), j(dt), j(grid.energy_j()),
            arr(&mins), arr(&maxs), arr(grid.temps()), arr(grid.peaks())
        ));
    }
    let (nx, ny, nz) = case.dims;
    let (dx, dy, dz) = case.spacing;
    let mats: Vec<String> = case.material.iter().map(|m| m.to_string()).collect();
    format!(
        "    {{ \"name\": \"{}\", \"nx\": {nx}, \"ny\": {ny}, \"nz\": {nz}, \"dx\": {}, \"dy\": {}, \"dz\": {},\n      \
\"k\": [{}], \"rhoC\": [{}], \"initialC\": {}, \"initialEnergyJ\": {},\n      \"material\": [{}],\n      \
\"stages\": [\n{}\n      ] }}",
        case.name, j(dx), j(dy), j(dz), arr(&k), arr(&rho_c), j(case.initial_c),
        j(build(case).energy_j()), mats.join(", "), stages.join(",\n")
    )
}

fn render() -> String {
    let cases: Vec<String> = [three_material_case(), column_case()].iter().map(render_case).collect();
    format!(
        "{{\n  \"_comment\": \"GENERATED by `cargo test -p thermo-core --test voxel_golden -- --ignored \
emit_voxel_golden_vectors`. Asserted by crates/thermo-core/tests/voxel_golden.rs AND \
src/__tests__/voxelConductionCrossRuntimeParity.test.ts. Both must reproduce every value EXACTLY.\",\n  \
\"cases\": [\n{}\n  ]\n}}\n",
        cases.join(",\n")
    )
}

#[test]
#[ignore = "generator: writes tests/voxel_golden_vectors.json"]
fn emit_voxel_golden_vectors() {
    let path = std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(FIXTURE_PATH);
    std::fs::write(&path, render()).expect("write fixture");
}

#[test]
fn voxel_fixture_is_current() {
    let committed = include_str!("voxel_golden_vectors.json");
    assert!(
        render() == committed,
        "voxel_golden_vectors.json no longer describes src/voxel.rs — regenerate it (see the header) and read the diff"
    );
}

// ── Physics anchors: bands NOT read back from the values they judge ─────────

fn three_material_grid_after_heating() -> VoxelGrid {
    let case = three_material_case();
    let mut g = build(&case);
    g.set_faces(&case.stages[0].faces).unwrap();
    let dt = 0.9 * g.stable_dt();
    g.step(dt, 40).unwrap();
    g
}

#[test]
fn adiabatic_box_conserves_heat_content() {
    let mut g = three_material_grid_after_heating();
    g.set_faces(&[0.0; 12]).unwrap();
    let before = g.energy_j();
    let dt = 0.9 * g.stable_dt();
    g.step(dt, 2000).unwrap();
    let rel = ((g.energy_j() - before) / before).abs();
    assert!(rel < 1e-12, "Σ C·T drifted {rel:e} relative in an adiabatic box");
    // And it has equilibrated: every cell within 0.05 °C of the mean.
    let spread = g.max_temp_where(0) - g.min_temp_where(0);
    assert!(spread < 0.05, "spread {spread}");
}

#[test]
fn an_x_symmetric_problem_stays_symmetric() {
    let (nx, ny, nz) = (7, 5, 3);
    let mut material = Vec::new();
    for _k in 0..nz {
        for _j in 0..ny {
            for i in 0..nx {
                material.push(if i == 3 { 1 } else if i == 0 || i == 6 { 2 } else { 0 });
            }
        }
    }
    let (k, rho_c) = materials();
    let mut g = VoxelGrid::new(nx, ny, nz, 0.002, 0.0025, 0.003, &material, &k, &rho_c, 8.0).unwrap();
    g.set_faces(&[40.0, 150.0, 40.0, 150.0, 225.0, 202.0, 12.0, 25.0, 950.0, 98.0, 13.0, 92.0])
        .unwrap();
    let dt = 0.9 * g.stable_dt();
    g.step(dt, 300).unwrap();
    let t = g.temps();
    for c in 0..t.len() {
        let i = c % nx;
        let mirror = c - i + (nx - 1 - i);
        let d = (t[c] - t[mirror]).abs() / (t[c] - 8.0).abs().max(1.0);
        assert!(d < 1e-12, "cell {c} vs mirror {mirror}: {} vs {}", t[c], t[mirror]);
    }
}

#[test]
fn a_convective_slab_reproduces_the_one_term_plane_wall_centre() {
    // 30 mm lean slab, h = 50 on y±, x/z adiabatic: Bi = h·L/k = 1.667.
    let (k, rho_c, h, half) = (LEAN_MEAT_K_W_M_K, LEAN_MEAT_RHO_KG_M3 * LEAN_MEAT_C_J_KG_K, 50.0, 0.015);
    let ny = 31;
    let material = [0u8; 3 * 31 * 3];
    let mut g = VoxelGrid::new(3, ny, 3, 0.004, 2.0 * half / ny as f64, 0.004, &material, &[k], &[rho_c], 5.0)
        .unwrap();
    g.set_faces(&[0.0, 0.0, 0.0, 0.0, h, 95.0, h, 95.0, 0.0, 0.0, 0.0, 0.0]).unwrap();
    let alpha = k / rho_c;
    let lambda = slab_eigenvalue(h * half / k).unwrap();
    let a1 = slab_coefficient(lambda);
    let dt0 = 0.9 * g.stable_dt();
    let centre = 1 + 3 * ((ny - 1) / 2 + ny);
    let mut elapsed = 0.0;
    for fo in [0.4, 0.8, 1.5] {
        let t_target = fo * half * half / alpha;
        let n = ((t_target - elapsed) / dt0).ceil();
        let dt = (t_target - elapsed) / n;
        g.step(dt, n as u32).unwrap();
        elapsed = t_target;
        let theta_num = (g.temp_at(centre) - 95.0) / (5.0 - 95.0);
        let theta_exact = a1 * (-lambda * lambda * fo).exp();
        let rel = (theta_num - theta_exact).abs() / theta_exact;
        assert!(rel < 0.015, "Fo {fo}: numeric θ {theta_num} vs one-term {theta_exact} ({rel:e})");
    }
}
