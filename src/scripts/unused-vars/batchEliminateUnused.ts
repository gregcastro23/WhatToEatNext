/*
  Batch elimination and transformation framework for unused variables.
  - Reads findings JSON from analyzeUnusedVariables
  - Splits into batches respecting safety protocols
  - Eliminates low-risk variables; prefixes high-value variables instead
  - Runs type-check after each batch; auto-rollback on failure

  Usage:
    yarn ts-node src/scripts/unused-vars/batchEliminateUnused.ts --in reports/unused-vars.json --dry-run
*/

import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { classifyFileKind, isHighImpactFile } from './domainPreservation';

type Finding = {
  filePath: string,
  fileKind: ReturnType<typeof classifyFileKind>,
  variableName: string,
  line: number,
  column: number,
  preserve: boolean,
  reason: string,
  confidence: number
};

type CliOptions = {
  inPath: string,
  dryRun: boolean,
  maxBatch: number,
  maxBatchCritical: number
};

function parseArgs(argv: string[]): CliOptions {
  const inIndex = argv.indexOf('--in');
  const dry = argv.includes('--dry-run');
  const maxBatchIdx = argv.indexOf('--max-batch');
  const maxBatchCriticalIdx = argv.indexOf('--max-batch-critical');
  return {
    inPath: inIndex !== -1 && argv[inIndex + 1] ? argv[inIndex + 1] : 'reports/unused-vars.json',
    dryRun: dry,
    maxBatch: maxBatchIdx !== -1 && argv[maxBatchIdx + 1] ? Number(argv[maxBatchIdx + 1]) : 15,
    maxBatchCritical:
      maxBatchCriticalIdx !== -1 && argv[maxBatchCriticalIdx + 1]
        ? Number(argv[maxBatchCriticalIdx + 1])
        : 8
  };
}

function execCmd(cmd: string): { code: number; stdout, string; stderr, string } {
  try {
    const stdout = childProcess.execSync(cmd, ) { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      code: e.status ?? 1,
      stdout: e.stdout ? e.stdout.toString() : '',
      stderr: e.stderr ? e.stderr.toString() : 'Execution failed'
    };
  }
}

function runTypeCheck(): boolean {
  const { code } = execCmd('yarn tsc --noEmit --skipLibCheck | cat');
  return code === 0;
}

function readFindings(inPath: string): Finding[] {
  const content = fs.readFileSync(inPath, 'utf8');
  const data = JSON.parse(content) as { findings: Finding[] };
  return data.findings || [];
}

function groupByFile(findings: Finding[]): Map<string, Finding[]> {
  const map = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!map.has(f.filePath)) map.set(f.filePath, []);
    map.get(f.filePath)!.push(f);
  }
  return map;
}

function sortFilesForSafety(files: string[]): string[] {
  return files.sort((a, b) => {
    const aImpact = isHighImpactFile(a) ? 1 : 0;
    const bImpact = isHighImpactFile(b) ? 1 : 0;
    if (aImpact !== bImpact) return aImpact - bImpact; // low impact first
    return a.localeCompare(b);
  });
}

function writeBackup(filePath: string, content: string): string {
  const backupDir = path.join('.lint-backup-' + Date.now().toString());
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, ) { recursive: true });
  const rel = path.relative(process.cwd(), filePath).replace(/[\/]/g, '__');
  const backupPath = path.join(backupDir, rel + '.bak');
  fs.writeFileSync(backupPath, content, 'utf8');
  return backupPath;
}

function restoreFromBackups(backups: Array<) { file: string, backup: string }>): void {
  for (const b of backups) {
    if (fs.existsSync(b.backup) {
      const content = fs.readFileSync(b.backup, 'utf8');
      fs.writeFileSync(b.file, content, 'utf8');
    }
  }
}

function applyEditsToFile(
  filePath: string,
  eliminations: Finding[],
  transformations: Finding[],
  dryRun: boolean
): string | null {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.split(/\r?\n/);
  const markForDeletion = new Set<number>();
  const renameMap = new Map<number, string>();

  for (const f of eliminations) {
    // Conservative: blank only the identifier token on that line when safe
    const idx = f.line - 1;
    if (idx >= 0 && idx < lines.length) {
      const re = new RegExp(`\\b${f.variableName}\\b`);
      lines[idx] = lines[idx].replace(re, '_');
      markForDeletion.add(idx);
    }
  }

  for (const f of transformations) {
    const idx = f.line - 1;
    if (idx >= 0 && idx < lines.length) {
      const re = new RegExp(`\\b${f.variableName}\\b`);
      lines[idx] = lines[idx].replace(re, `_${f.variableName}`);
      renameMap.set(idx, f.variableName);
    }
  }

  const updated = lines.join('\n');
  if (!dryRun && updated !== original) {
    const backupPath = writeBackup(filePath, original);
    fs.writeFileSync(filePath, updated, 'utf8');
    return backupPath;
  }
  return null;
}

function processBatch(files: string[], fileFindings: Map<string, Finding[]>, dryRun: boolean): boolean {
  const backups: Array<{ file: string; backup, string }> = [];
  for (const file of files) {
    const findings = (fileFindings.get(file) || []).filter((f) => !f.preserve);
    if (findings.length === 0) continue;

    // Prefix preserved variables instead of removing
    const transformations = (fileFindings.get(file) || []).filter((f) => f.preserve);
    const backup = applyEditsToFile(file, findings, transformations, dryRun);
    if (backup) backups.push({ file, backup });
  }

  if (dryRun) return true;
  const ok = runTypeCheck();
  if (!ok) {
    restoreFromBackups(backups);
  }
  return ok;
}

function batchFiles(files: string[], maxBatch: number, maxBatchCritical: number): string[][] {
  const batches: string[][] = [];
  let current: string[] = [];
  for (const file of files) {
    const isCritical = isHighImpactFile(file);
    const limit = isCritical ? maxBatchCritical : maxBatch;
    if (current.length >= limit) {
      batches.push(current);
      current = [];
    }
    current.push(file);
  }
  if (current.length) batches.push(current);
  return batches;
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const findings = readFindings(opts.inPath);
  const byFile = groupByFile(findings);
  const files = sortFilesForSafety(Array.from(byFile.keys()));
  const batches = batchFiles(files, opts.maxBatch, opts.maxBatchCritical);

  // eslint-disable-next-line no-console
  console.log(`Processing ${files.length} files across ${batches.length} batches (dryRun=${opts.dryRun})`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const ok = processBatch(batch, byFile, opts.dryRun);
    if (!ok) {
      // eslint-disable-next-line no-console
      console.error(`Type check failed for batch ${i + 1}. Rolled back changes for the batch.`);
      break;
    }
    // If successful and not dry-run, keep changes staged for review
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
