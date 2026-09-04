#!/usr/bin/env bash
# Proves a refactor is runtime-neutral by diffing esbuild's emitted JS for a file
# against its committed version. Type-only edits (cast removal, annotations,
# generics) erase at compile time and emit byte-identical JS; any change to access
# patterns, guards, operators or control flow emits different JS and fails.
#
# Deliberately strict: identifier renames also fail (esbuild does not mangle names
# under --minify-whitespace). Prefer a false alarm over a silent semantic change.
#
# Usage: scripts/checkEmitEquivalence.sh <file> [ref]
#   0 = RUNTIME-NEUTRAL    2 = could not compare (never treat as a pass)
#   1 = BEHAVIOUR-BEARING
set -uo pipefail
FILE="${1:?usage: checkEmitEquivalence.sh <file> [ref]}"; REF="${2:-HEAD}"
[ -f "$FILE" ] || { echo "no such file: $FILE" >&2; exit 2; }
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
EXT="${FILE##*.}"
git show "$REF:$FILE" > "$TMP/before.$EXT" 2>/dev/null || { echo "not in $REF: $FILE" >&2; exit 2; }
cp "$FILE" "$TMP/after.$EXT"
for n in before after; do
  npx esbuild "$TMP/$n.$EXT" --format=esm --minify-whitespace --jsx=automatic \
    > "$TMP/$n.js" 2>"$TMP/$n.err" || { echo "esbuild failed on $n: $(head -3 "$TMP/$n.err")" >&2; exit 2; }
  [ -s "$TMP/$n.js" ] || { echo "REFUSING: $n emitted 0 bytes (vacuous comparison)" >&2; exit 2; }
done
if cmp -s "$TMP/before.js" "$TMP/after.js"; then
  echo "RUNTIME-NEUTRAL  $FILE  ($(wc -c < "$TMP/after.js" | tr -d ' ') bytes emitted)"; exit 0
fi
echo "BEHAVIOUR-BEARING  $FILE"
python3 - "$TMP/before.js" "$TMP/after.js" <<'PY'
import sys
a=open(sys.argv[1]).read(); b=open(sys.argv[2]).read()
i=0
while i<min(len(a),len(b)) and a[i]==b[i]: i+=1
ja,jb=len(a),len(b)
while ja>i and jb>i and a[ja-1]==b[jb-1]: ja-=1; jb-=1
print(f"  first divergence at byte {i} (emitted {len(a)} -> {len(b)})")
print(f"  context : ...{a[max(0,i-70):i]}<<<HERE>>>")
print(f"  before  : {a[i:ja][:220]}")
print(f"  after   : {b[i:jb][:220]}")
PY
exit 1
