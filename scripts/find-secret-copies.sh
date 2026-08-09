#!/usr/bin/env bash
#
# find-secret-copies.sh — enumerate every copy of a secret BY VALUE.
#
# Why this exists
# ---------------
# On 2026-08-08 the production Postgres password was rotated. The service list
# you would guess was wrong twice:
#
#   * `device-sessions-cleanup` held its own literal copy of the password. It was
#     on nobody's list and was found ONLY by scanning every service's variables
#     for the literal value.
#   * The GitHub Actions secret DATABASE_PUBLIC_URL also held it. That one was
#     missed, and CI went red on the next push — along with two scheduled
#     workflows that would have failed silently at 06:45 and 07:15.
#
# Railway variables are copied LITERALLY between services far more often than
# they are referenced with ${{...}}. So enumerate by value, never by memory.
#
# Usage
# -----
#   ./scripts/find-secret-copies.sh --stdin        # paste/pipe the secret
#   ./scripts/find-secret-copies.sh --file <path>  # read it from a file
#
# The secret is NEVER accepted as an argument: argv is visible to every other
# process on the machine via `ps`.
#
set -uo pipefail

RAILWAY_CALLER="${RAILWAY_CALLER:-script:find-secret-copies}"
export RAILWAY_CALLER

die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }
hdr() { printf '\n\033[1m%s\033[0m\n' "$*"; }

SECRET=""
case "${1:-}" in
  --stdin)
    printf 'Paste the secret, then press Enter: ' >&2
    IFS= read -r SECRET
    ;;
  --file)
    [ -n "${2:-}" ] || die "--file needs a path"
    [ -f "$2" ] || die "no such file: $2"
    SECRET="$(cat "$2")"
    ;;
  *)
    die "usage: $0 --stdin | --file <path>   (never pass the secret as an argument)"
    ;;
esac

SECRET="${SECRET%$'\n'}"
[ -n "$SECRET" ] || die "empty secret"
[ "${#SECRET}" -ge 8 ] || die "refusing to scan for a value under 8 chars — too many false positives"

printf 'Scanning for a %d-character secret (…%s)\n' "${#SECRET}" "${SECRET: -4}"

FOUND=0
BLIND=0

# ---------------------------------------------------------------------------
# 1. Railway — every service in the linked project, read by value.
# ---------------------------------------------------------------------------
hdr "1. Railway (all services in the linked project)"
if ! command -v railway >/dev/null 2>&1; then
  printf '  \033[33mSKIPPED\033[0m — railway CLI not installed. THIS IS A BLIND SPOT.\n'
  BLIND=$((BLIND + 1))
else
  # "serviceName" is the precise key. Do NOT use "name" — that also matches
  # volumes, environments and the workspace, so you scan phantoms and miss the
  # point that this list must be COMPLETE.
  SERVICES="$(railway status --json 2>/dev/null \
    | grep -oE '"serviceName"[[:space:]]*:[[:space:]]*"[^"]*"' \
    | sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/' \
    | sort -u)"

  printf '  services discovered: %s\n' "$(printf '%s' "$SERVICES" | tr '\n' ' ')"

  if [ -z "$SERVICES" ]; then
    printf '  \033[33mNo services resolved\033[0m — is the project linked? BLIND SPOT.\n'
    BLIND=$((BLIND + 1))
  else
    while IFS= read -r svc; do
      [ -n "$svc" ] || continue
      KV="$(railway variables -s "$svc" --kv 2>/dev/null)" || continue
      [ -n "$KV" ] || continue
      HITS="$(printf '%s\n' "$KV" | grep -F -- "$SECRET" | cut -d= -f1)"
      if [ -n "$HITS" ]; then
        while IFS= read -r k; do
          printf '  \033[31mFOUND\033[0m  railway/%s  %s\n' "$svc" "$k"
          FOUND=$((FOUND + 1))
        done <<< "$HITS"
      fi
    done <<< "$SERVICES"
  fi
fi

# ---------------------------------------------------------------------------
# 2. Vercel — readable vars only. "Sensitive" ones pull as [SENSITIVE].
# ---------------------------------------------------------------------------
hdr "2. Vercel (production)"
if ! command -v vercel >/dev/null 2>&1; then
  printf '  \033[33mSKIPPED\033[0m — vercel CLI not installed. THIS IS A BLIND SPOT.\n'
  BLIND=$((BLIND + 1))
else
  # -u: reserve a NAME without creating the file. `vercel env pull` prompts to
  # overwrite an existing path and --yes does not answer that prompt, so a plain
  # mktemp makes this hang forever with no output.
  TMP="$(mktemp -u -t vercelenv)"
  trap 'rm -f "$TMP"' EXIT
  if vercel env pull "$TMP" --environment=production --yes >/dev/null 2>&1; then
    HITS="$(grep -F -- "$SECRET" "$TMP" 2>/dev/null | cut -d= -f1)"
    if [ -n "$HITS" ]; then
      while IFS= read -r k; do
        printf '  \033[31mFOUND\033[0m  vercel/production  %s\n' "$k"
        FOUND=$((FOUND + 1))
      done <<< "$HITS"
    fi
    # The blind spot that matters: anything marked Sensitive is write-only.
    SENS="$(grep -c '\[SENSITIVE\]' "$TMP" 2>/dev/null || echo 0)"
    if [ "$SENS" -gt 0 ]; then
      printf '  \033[33m%s Vercel var(s) are Sensitive and pull as [SENSITIVE].\033[0m\n' "$SENS"
      printf '  A by-value scan CANNOT see inside them. Names to check by hand:\n'
      grep '\[SENSITIVE\]' "$TMP" | cut -d= -f1 | sed 's/^/      /'
      BLIND=$((BLIND + 1))
    fi
  else
    printf '  \033[33mvercel env pull failed\033[0m — BLIND SPOT.\n'
    BLIND=$((BLIND + 1))
  fi
fi

# ---------------------------------------------------------------------------
# 3. GitHub Actions — values are WRITE-ONLY. By-value scanning is impossible.
#    This is the surface that broke CI on 2026-08-08.
# ---------------------------------------------------------------------------
hdr "3. GitHub Actions secrets"
printf '  \033[33mGitHub secret values cannot be read back — by-value scanning is\n'
printf '  IMPOSSIBLE here. This is the surface that was missed on 2026-08-08.\033[0m\n\n'
if command -v gh >/dev/null 2>&1; then
  printf '  Repo secrets (check each by NAME against what you just rotated):\n'
  gh secret list 2>/dev/null | sed 's/^/      /' || printf '      (could not list)\n'
  printf '\n  Workflows that consume secrets:\n'
  grep -rl 'secrets\.' .github/workflows 2>/dev/null | sed 's/^/      /' || printf '      (none found)\n'
else
  printf '  gh CLI not installed — cannot even list names.\n'
fi
BLIND=$((BLIND + 1))

# ---------------------------------------------------------------------------
# 4. Local working tree — tracked and untracked.
# ---------------------------------------------------------------------------
hdr "4. Local repo (tracked + untracked)"
# Driven by git rather than a recursive walk: `grep -r` over this repo takes
# minutes (.next is 4.4G, node_modules 3.8G), while git already knows every file
# that could plausibly be committed. The explicit .env* names are added because
# those are gitignored — invisible to both ls-files modes — and are exactly
# where a credential is most likely to sit.
LOCAL="$( { git ls-files -z 2>/dev/null
            git ls-files -z --others --exclude-standard 2>/dev/null
            printf '%s\0' .env .env.local .env.production .env.production.local
          } | sort -z -u | xargs -0 grep -l -I -F -- "$SECRET" 2>/dev/null )"
if [ -n "$LOCAL" ]; then
  while IFS= read -r f; do
    if git check-ignore -q "$f" 2>/dev/null; then
      printf '  \033[33mFOUND\033[0m  %s (gitignored)\n' "$f"
    else
      printf '  \033[31mFOUND — NOT IGNORED, would reach git!\033[0m  %s\n' "$f"
    fi
    FOUND=$((FOUND + 1))
  done <<< "$LOCAL"
else
  printf '  none\n'
fi

# ---------------------------------------------------------------------------
# Verdict — an unproven zero is not a zero.
# ---------------------------------------------------------------------------
hdr "Verdict"
printf '  copies found : %d\n' "$FOUND"
printf '  blind spots  : %d\n' "$BLIND"
if [ "$FOUND" -eq 0 ]; then
  cat <<'EOS'

  Zero hits is a CLAIM, not a result. Before trusting it, prove the scan can
  see anything at all — plant the value somewhere it must be found and re-run:

      printf 'canary %s\n' "$SECRET" > ./.credcanary.tmp
      ./scripts/find-secret-copies.sh --file <secret-file>   # must report it
      rm -f ./.credcanary.tmp

  A scan that finds nothing because it is broken looks exactly like a clean one.
EOS
fi
if [ "$BLIND" -gt 0 ]; then
  printf '\n  \033[33mThis scan was NOT exhaustive. Resolve the blind spots above by hand.\033[0m\n'
fi
