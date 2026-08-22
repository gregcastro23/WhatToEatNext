#!/usr/bin/env bash
#
# Print the manifest of everything that determines public/wasm/'s contents.
#
# WHY THIS EXISTS
#
# public/wasm/ is COMMITTED (see the .gitignore note and vercel.json). That buys
# a WASM engine in production with zero build overhead, but it introduces the
# failure mode every committed build product has: the source moves and the
# artifact does not, so the browser runs physics that no longer matches the Rust
# it claims to be compiled from. Nothing reports that — the module loads, the
# exports are all present, and the numbers are merely stale.
#
# The obvious guard is `bun run build:wasm && git diff --exit-code public/wasm/`.
# It is not usable here. `[MEASURED 2026-08-22]` the artifact is only
# byte-reproducible across machines once BOTH host paths and the rustc version
# are pinned down, and even then macOS-host vs linux-host codegen identity is
# unproven — this repo has no way to test it (no docker, no linux box). A gate
# that might be red for a reason no human caused is a gate people learn to
# ignore, so the freshness check does not depend on rebuilding at all.
#
# Instead: hash the INPUTS. If every input is identical, the committed artifact
# is the one those inputs produce, whatever machine produced it. Host-independent,
# needs no cargo, and runs in milliseconds.
#
# Usage:
#   bash scripts/thermo-wasm-manifest.sh              # print
#   bash scripts/thermo-wasm-manifest.sh --check      # diff against the committed copy
#   bash scripts/thermo-wasm-manifest.sh --check PATH # diff against a snapshot
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Deliberately NOT inside public/wasm/. Everything under public/ is served to
# the internet, and this is build provenance — rustc version, source paths,
# hashes. It would also have shipped only by accident: .vercelignore excludes
# *.txt, so the file would vanish from deploys for a reason unrelated to
# anything here, and silently start being served again the day someone edits
# that rule. Provenance lives next to the script that writes it.
MANIFEST_PATH="scripts/thermo-wasm.manifest.txt"

# macOS ships `shasum`, most linux images ship `sha256sum`, GitHub runners ship
# both. Pick one rather than assume, and print only the hash.
sha() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

emit() {
  echo "# Inputs that determine public/wasm/. Regenerate: bun run build:wasm"
  echo "# Do not hand-edit — scripts/thermo-wasm-manifest.sh writes this."

  # Toolchain. Both are baked into the binary: rustc as the panic-location
  # prefix, wasm-bindgen as the JS shim it generates AND the schema section it
  # writes into the wasm. A mismatch in either changes the artifact.
  echo "rustc            $(rustc --version 2>/dev/null || echo UNAVAILABLE)"
  echo "wasm-bindgen-cli $(wasm-bindgen --version 2>/dev/null || echo UNAVAILABLE)"

  # Cargo.lock fixes every dependency version; the root Cargo.toml carries
  # [profile.release] (opt-level, lto, codegen-units, panic, strip), and every
  # one of those changes codegen.
  for f in Cargo.lock Cargo.toml rust-toolchain.toml; do
    [ -f "$f" ] && echo "$(sha "$f")  $f"
  done

  # The two crates that actually compile into the artifact. Named explicitly
  # rather than globbed from crates/*: this checkout also carries empty
  # `crates/thermo-core 2`-style directories (macOS duplicate leftovers, matched
  # by the `*\ [0-9]*` rule in .gitignore), and a glob would fold their presence
  # or absence into the hash.
  #
  # LC_ALL=C sort because `find` order is filesystem-dependent — on APFS it is
  # not the same as ext4, which would make the manifest host-dependent and
  # defeat the entire point of this file.
  find crates/thermo-core crates/thermo-wasm -type f ! -name '.DS_Store' \
    | LC_ALL=C sort \
    | while IFS= read -r f; do
        echo "$(sha "$f")  $f"
      done
}

if [ "${1:-}" = "--check" ]; then
  # An explicit second argument points at a manifest saved elsewhere. CI needs
  # this: `build-thermo-wasm.sh` has to run first (it installs the pinned
  # wasm-bindgen CLI, without which `emit` cannot report a real version), and
  # that run REWRITES public/wasm/SOURCE_MANIFEST.txt. Checking the rewritten
  # file against freshly-read sources compares a thing to itself and passes
  # unconditionally — a gate that cannot fail. CI therefore snapshots the
  # committed manifest before building and passes the snapshot here.
  MANIFEST_PATH="${2:-$MANIFEST_PATH}"
  if [ ! -f "$MANIFEST_PATH" ]; then
    echo "error: $MANIFEST_PATH is missing." >&2
    echo "       public/wasm/ is committed and must carry its manifest." >&2
    echo "       Run: bun run build:wasm && git add public/wasm" >&2
    exit 1
  fi
  if diff -u "$MANIFEST_PATH" <(emit); then
    echo "✓ public/wasm/ is current: every input hash matches the committed manifest."
  else
    echo "" >&2
    echo "✗ public/wasm/ is STALE — the Rust source or toolchain above changed" >&2
    echo "  without the committed artifact being regenerated. The browser would" >&2
    echo "  run physics that no longer matches crates/." >&2
    echo "" >&2
    echo "  Fix:  bun run build:wasm && git add public/wasm && git commit" >&2
    exit 1
  fi
else
  emit
fi
