# Phase 4 Daily Metrics Setup

## Automatic Daily Metrics Capture

### Option 1: Cron Job (Recommended for Development)

Add this line to your crontab to capture metrics daily at midnight:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path to your project):
0 0 * * * cd /Users/GregCastro/Desktop/WhatToEatNext && ./scripts/daily-metrics.sh >> .quality-gates/metrics/daily-metrics.log 2>&1
```

This will:

- Run daily at midnight
- Capture error metrics snapshot
- Save to `.quality-gates/metrics/metrics-YYYY-MM-DD.json`
- Log output to `.quality-gates/metrics/daily-metrics.log`

### Option 2: GitHub Actions (CI/CD)

Create `.github/workflows/daily-metrics.yml`:

```yaml
name: Daily Metrics Capture

on:
  schedule:
    - cron: "0 0 * * *" # Daily at midnight UTC
  workflow_dispatch: # Manual trigger

jobs:
  capture-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: yarn install

      - name: Capture metrics
        run: node src/scripts/quality-gates/simple-metrics.js capture

      - name: Commit metrics
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .quality-gates/metrics/
          git commit -m "chore: daily metrics capture" || echo "No changes"
          git push
```

### Option 3: Manual

Run manually whenever needed:

```bash
# Capture current metrics
./scripts/daily-metrics.sh

# Or directly:
node src/scripts/quality-gates/simple-metrics.js capture
```

## Viewing Metrics

```bash
# View 7-day progress
node src/scripts/quality-gates/simple-metrics.js report 7

# View 30-day progress
node src/scripts/quality-gates/simple-metrics.js report 30

# Compare two specific dates
node src/scripts/quality-gates/simple-metrics.js compare 2025-10-01 2025-10-09

# Export to CSV
node src/scripts/quality-gates/simple-metrics.js export ./metrics-report.csv
```

## Metrics Files

All metrics are stored in `.quality-gates/metrics/`:

- `metrics-YYYY-MM-DD.json` - Daily snapshots
- `metrics-latest.json` - Latest capture (for quick reference)
- `daily-metrics.log` - Cron job logs (if using cron)

## What Gets Tracked

Each daily snapshot includes:

- Total error count
- Error counts by type (TS1005, TS1109, etc.)
- Top 10 most common errors
- Top 10 files with most errors
- Error distribution by file

## Retention

Metrics files are small (~2KB each). Keep them indefinitely to track long-term progress.

If storage is a concern, you can archive old metrics:

```bash
# Archive metrics older than 90 days
find .quality-gates/metrics -name "metrics-*.json" -mtime +90 -exec gzip {} \;
```
