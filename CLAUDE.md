# WhatToEatNext - Agent Guidance

## Build and Test Commands
- Build: `bun run build`
- Typecheck: `bun run typecheck`
- Verify: `bun run verify`
- Test: `bun run test`

## Agent skills

### Issue tracker

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations. Pull requests are not a request surface for triage. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage states are mapped 1-to-1 to the labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Uses a single-context domain model layout with `CONTEXT.md` at the root and ADRs in `docs/adr/`. See `docs/agents/domain.md`.
