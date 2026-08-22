#!/usr/bin/env bash
#
# Build the browser physics engine: crates/thermo-wasm -> public/wasm.
#
# Output lands in public/ rather than under src/ for a measured reason.
# `[MEASURED 2026-08-16]` The first version emitted to src/lib/wasm/generated
# and the loader imported it through the `@/` alias with `webpackIgnore: true`.
# That combination can never work: webpackIgnore tells the bundler to leave the
# specifier alone, so the BROWSER has to resolve `@/lib/wasm/generated/...`, and
# it cannot — the alias is a build-time convention. The browser reported
# `Failed to resolve module specifier`, the loader caught it, and the canvas
# silently ran the TypeScript fallback forever while claiming a WASM engine had
# been built. Dropping webpackIgnore is not an option either: a fresh checkout
# has not run this script, so a statically resolved import would fail the build.
#
# public/ removes the dilemma. The artifact is served at a real URL that the
# browser can fetch at runtime, and its absence is a 404 the loader handles.
#
# Deliberately does NOT use wasm-pack. wasm-pack wraps the same two steps this
# script runs (cargo build, then wasm-bindgen) behind its own version and its
# own opinions about package.json, and it is a third tool to keep installed on
# every machine and in CI for no gain here. `cargo` and `wasm-bindgen-cli` are
# the actual toolchain.
#
# ⚠️ THE ONE FOOTGUN, HANDLED: the `wasm-bindgen` CRATE version and the
# `wasm-bindgen` CLI version must match EXACTLY. When they do not, the CLI
# aborts with a schema-mismatch error that reads like a corrupt binary and sends
# you looking in the wrong place. Rather than pin the version in two files and
# hope they stay together, this script reads the resolved version out of
# Cargo.lock — the single source of truth — and installs or replaces the CLI to
# match.
#
# Usage:  bun run build:wasm
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

OUT_DIR="public/wasm"
WASM="target/wasm32-unknown-unknown/release/thermo_wasm.wasm"

# ── 0. Make the artifact reproducible ───────────────────────────────────────
#
# public/wasm/ is COMMITTED, so every developer who runs this script must get
# the SAME bytes out of the same source. Without the remaps below they do not.
#
# `[MEASURED 2026-08-22]` the compiled .wasm embeds absolute build-host paths in
# its panic-location strings — the local checkout showed
#
#     /Users/<user>/.cargo/registry/src/index.crates.io-<hash>/wasm-bindgen-0.2.127/src/externref.rs
#
# which means two developers on two machines produce two different binaries from
# identical source, and every rebuild is a spurious diff in review. Remapping
# CARGO_HOME and the workspace root to fixed sentinels removes the only
# host-dependent bytes; rustc already normalises its own stdlib paths to
# /rustc/<hash>/ (pinned by rust-toolchain.toml) and dlmalloc to /rust/deps/.
#
# Verified after this change: no /Users, /home, or username strings survive in
# the binary.
CARGO_HOME_PATH="${CARGO_HOME:-$HOME/.cargo}"
export RUSTFLAGS="--remap-path-prefix=${CARGO_HOME_PATH}=/cargo --remap-path-prefix=${ROOT}=/w ${RUSTFLAGS:-}"

# ── 1. Resolve the required CLI version from Cargo.lock ─────────────────────
if [ ! -f Cargo.lock ]; then
  echo "Cargo.lock missing — running cargo metadata to generate it..."
  cargo metadata --format-version 1 >/dev/null
fi

REQUIRED="$(awk '/^name = "wasm-bindgen"$/{found=1; next} found && /^version = /{gsub(/[",]/,"",$3); print $3; exit}' Cargo.lock)"
if [ -z "$REQUIRED" ]; then
  echo "error: could not read the wasm-bindgen version from Cargo.lock" >&2
  exit 1
fi
echo "wasm-bindgen crate version (from Cargo.lock): $REQUIRED"

# ── 2. Ensure the target is installed ───────────────────────────────────────
if ! rustup target list --installed | grep -qx wasm32-unknown-unknown; then
  echo "Installing the wasm32-unknown-unknown target..."
  rustup target add wasm32-unknown-unknown
fi

# ── 3. Ensure a MATCHING CLI ────────────────────────────────────────────────
INSTALLED=""
if command -v wasm-bindgen >/dev/null 2>&1; then
  INSTALLED="$(wasm-bindgen --version | awk '{print $2}')"
fi

if [ "$INSTALLED" != "$REQUIRED" ]; then
  if [ -n "$INSTALLED" ]; then
    echo "CLI is $INSTALLED but the crate is $REQUIRED — reinstalling to match."
  else
    echo "wasm-bindgen CLI not found — installing $REQUIRED."
  fi
  echo "(this compiles from source and takes a few minutes the first time)"
  cargo install wasm-bindgen-cli --version "$REQUIRED" --force
fi

# ── 4. Build ────────────────────────────────────────────────────────────────
echo "Building thermo-wasm (release)..."
cargo build -p thermo-wasm --target wasm32-unknown-unknown --release

if [ ! -f "$WASM" ]; then
  echo "error: expected artifact $WASM was not produced" >&2
  exit 1
fi

# ── 5. Generate the JS/TS bindings ──────────────────────────────────────────
echo "Generating bindings into $OUT_DIR..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
wasm-bindgen "$WASM" --out-dir "$OUT_DIR" --target web

# ── 5b. Record what produced it ─────────────────────────────────────────────
#
# The freshness gate for a committed build product. See the header of
# scripts/thermo-wasm-manifest.sh for why this hashes inputs instead of
# diffing the output bytes.
echo "Writing the source manifest..."
bash "$ROOT/scripts/thermo-wasm-manifest.sh" > "$ROOT/scripts/thermo-wasm.manifest.txt"

# ── 6. Report, and prove the artifact is real ───────────────────────────────
SIZE="$(wc -c < "$OUT_DIR/thermo_wasm_bg.wasm" | tr -d ' ')"
echo
echo "Built $OUT_DIR/thermo_wasm_bg.wasm  (${SIZE} bytes)"
echo "Exports found:"
grep -o 'export function [a-z_0-9]*' "$OUT_DIR/thermo_wasm.js" | sed 's/export function /  - /' | sort -u

# ── 7. Verify the compiled artifact, not just the source it came from ───────
#
# `cargo test` proves the HOST build of thermo-core is right. It says nothing
# about this binary: different target, different optimisation level, and a
# different libm for sin/tan/pow/log. The browser runs this file, so this file
# is what gets checked against the golden vectors.
echo
echo "Verifying the compiled module against the golden vectors..."
node scripts/verify-thermo-wasm-parity.mjs

# Second verifier: the TypeScript DECODE of the flat boundary buffer, A/B'd
# against the TypeScript solver. The check above proves the module agrees with
# the fixture; it says nothing about whether the browser reads the buffer at the
# right offsets, and a wrong offset is a full panel of plausible numbers.
echo ""
echo "Verifying the boundary-buffer decode against the TypeScript solver..."
bun "$ROOT/scripts/verify-boundary-solver-parity.mjs"

# ⚠️ $OUT_DIR IS COMMITTED — it was gitignored until 2026-08-22, and the change
# is the whole reason WASM reaches production at all. Vercel's build command is
# `next build`; it never ran this script, so public/wasm/ did not exist in any
# deploy and /wasm/thermo_wasm.js answered 404. The loader treats a 404 as
# "not built" and falls back, silently and by design — so production ran the
# TypeScript engine from the day the loader shipped, while every parity proof in
# CI guarded a path no visitor executed.
#
# Committing the ~68 KB output fixes that with zero deploy cost. The price is
# drift: STAGE THE RESULT. CI fails if the manifest above disagrees with the
# source.
echo
echo "Note: $OUT_DIR is COMMITTED. Stage it with your Rust change:"
echo "        git add public/wasm"
