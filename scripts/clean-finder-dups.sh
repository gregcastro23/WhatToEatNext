#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# clean-finder-dups.sh
#
# Removes macOS Finder-style duplicate files — names like
# "foo 2.ts", "package 2.json", "ARCHITECTURE 2.md" — that
# Finder produces when a copy/paste collides with an existing
# filename. These dups are matched by the `*\ [0-9]*` patterns
# in .gitignore so git never sees them, but they pile up on
# disk, confuse search, and can corrupt git internals (a stray
# ".git/refs/heads/master 2" once broke `git fetch origin master`
# in this repo).
#
# USAGE:
#   bash scripts/clean-finder-dups.sh                # dry-run, suffix " 2"
#   bash scripts/clean-finder-dups.sh --apply        # delete confirmed dups
#   bash scripts/clean-finder-dups.sh --suffix 3     # check " 3" suffix instead
#   bash scripts/clean-finder-dups.sh --suffix 3 --apply
#
# WHAT IT DOES:
#   For each file matching "* <N>.*" or "* <N>" (default N=2):
#     1. Derive the canonical name by stripping " <N>".
#     2. IDENTICAL    → safe to delete (byte-identical to canonical)
#     3. DIFFERS      → safe to delete (stale older version of canonical)
#     4. NO-CANONICAL → flag only; never delete (could be a legit
#                       "Variation 2" recipe or an orphan dup whose
#                       canonical was lost)
#
# EXIT:
#   0 if no NO-CANONICAL flags. 1 if any NO-CANONICAL flagged
#   (review needed). DIFFERS files are deleted under --apply
#   without prompting since their content is by definition stale.
# ─────────────────────────────────────────────────────────────

set -euo pipefail

APPLY=0
SUFFIX="2"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) APPLY=1; shift ;;
    --suffix) SUFFIX="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,30p' "$0" | sed 's/^# \?//'
      exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

if ! [[ "$SUFFIX" =~ ^[0-9]+$ ]]; then
  echo "--suffix must be a non-negative integer (got: $SUFFIX)" >&2
  exit 2
fi

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

# Collect candidates. Skip vendored / generated trees and the LFS-like
# wten-migration staging dir. NUL-delimited to survive spaces in names.
TMPDIR_LIST="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_LIST"' EXIT
CAND_FILE="$TMPDIR_LIST/candidates"
IDENT_FILE="$TMPDIR_LIST/identical"
DIFF_FILE="$TMPDIR_LIST/differs"
NOCAN_FILE="$TMPDIR_LIST/no_canonical"
touch "$CAND_FILE" "$IDENT_FILE" "$DIFF_FILE" "$NOCAN_FILE"

find . -type f \( -name "* ${SUFFIX}.*" -o -name "* ${SUFFIX}" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -not -path "./.next/*" \
  -not -path "./.venv*/*" \
  -not -path "./wten-migration-ui-components/*" \
  -print0 2>/dev/null > "$CAND_FILE"

cand_count=$(tr -dc '\0' < "$CAND_FILE" | wc -c | tr -d ' ')

if [[ "$cand_count" -eq 0 ]]; then
  echo "No \" ${SUFFIX}\" Finder dups found. Clean."
  exit 0
fi

while IFS= read -r -d '' dup; do
  base="$(basename "$dup")"
  dir="$(dirname "$dup")"
  if [[ "$base" == *" ${SUFFIX}."* ]]; then
    canonical_name="${base/ ${SUFFIX}./.}"
  elif [[ "$base" == *" ${SUFFIX}" ]]; then
    canonical_name="${base% ${SUFFIX}}"
  else
    continue
  fi
  canonical="$dir/$canonical_name"
  if [[ ! -e "$canonical" ]]; then
    printf '%s\0' "$dup" >> "$NOCAN_FILE"
  elif cmp -s "$dup" "$canonical"; then
    printf '%s\0' "$dup" >> "$IDENT_FILE"
  else
    printf '%s\0' "$dup" >> "$DIFF_FILE"
  fi
done < "$CAND_FILE"

ident_count=$(tr -dc '\0' < "$IDENT_FILE" | wc -c | tr -d ' ')
diff_count=$(tr -dc '\0' < "$DIFF_FILE" | wc -c | tr -d ' ')
nocan_count=$(tr -dc '\0' < "$NOCAN_FILE" | wc -c | tr -d ' ')

echo "Scanned ${cand_count} candidates with suffix \" ${SUFFIX}\":"
echo "  IDENTICAL    : ${ident_count}  (byte-identical to canonical — safe to delete)"
echo "  DIFFERS      : ${diff_count}  (older stale version of canonical — safe to delete)"
echo "  NO-CANONICAL : ${nocan_count}  (no canonical found — preserved for review)"
echo

if [[ "$nocan_count" -gt 0 ]]; then
  echo "Review these manually — could be a legit \"Variation ${SUFFIX}\" file or an orphan dup:"
  while IFS= read -r -d '' f; do printf '    %s\n' "$f"; done < "$NOCAN_FILE"
  echo
fi

if [[ $APPLY -eq 0 ]]; then
  echo "Dry-run. Re-run with --apply to delete the ${ident_count} IDENTICAL + ${diff_count} DIFFERS files."
  exit $(( nocan_count > 0 ? 1 : 0 ))
fi

cat "$IDENT_FILE" "$DIFF_FILE" | xargs -0 rm --

echo "Deleted $(( ident_count + diff_count )) Finder dup(s)."
exit $(( nocan_count > 0 ? 1 : 0 ))
