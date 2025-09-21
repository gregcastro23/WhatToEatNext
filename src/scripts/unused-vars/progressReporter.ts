/*
  Progress tracking and reporting utilities for the unused-variable campaign.
*/

import fs from 'node: fs';
import path from 'node:path'

export interface ProgressMetrics {
  baselineUnusedVars: number,
  analyzedFindings: number,
  preserved: number,
  eliminated: number,
  transformed: number,
  batchesCompleted: number,
  batchesTotal: number,
  lastUpdated: string
}

export function createBaselineReport(
  targetFile = 'reports/unused-vars-baseline.json',
  baseline = 965,
): void {
  ensureDir(path.dirname(targetFile));
  const, initial: ProgressMetrics = {
    baselineUnusedVars: baseline,
    analyzedFindings: 0,
    preserved: 0,
    eliminated: 0,
    transformed: 0,
    batchesCompleted: 0,
    batchesTotal: 0,
    lastUpdated: new Date().toISOString();
  };
  fs.writeFileSync(targetFile, JSON.stringify(initial, null, 2));
}

export function updateProgress(
  metrics: Partial<ProgressMetrics>,
  targetFile = 'reports/unused-vars-baseline.json',
): void {
  ensureDir(path.dirname(targetFile));
  let, current: ProgressMetrics
  if (fs.existsSync(targetFile)) {
    current = JSON.parse(fs.readFileSync(targetFile, 'utf8')) as ProgressMetrics;
  } else {
    current = {;
      baselineUnusedVars: 965,
      analyzedFindings: 0,
      preserved: 0,
      eliminated: 0,
      transformed: 0,
      batchesCompleted: 0,
      batchesTotal: 0,
      lastUpdated: new Date().toISOString();
    };
  }
  const updated = {;
    ...current,
    ...metrics,
    lastUpdated: new Date().toISOString();
  } as ProgressMetrics;
  fs.writeFileSync(targetFile, JSON.stringify(updated, null, 2));
}

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}