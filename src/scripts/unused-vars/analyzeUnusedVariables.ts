/*
  Unused variable analyzer with domain-aware categorization.
  - Scans files using ESLint programmatically to collect no-unused-vars findings
  - Classifies variables via domainPreservation rules
  - Outputs a JSON and human-readable report with confidence scoring

  Usage:
    yarn ts-node src/scripts/unused-vars/analyzeUnusedVariables.ts --out reports/unused-vars.json --max 2000
*/

import childProcess from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { classifyFileKind, decidePreservation } from './domainPreservation';

type CliOptions = {
  outPath: string;
  maxFiles?: number;
};

type Finding = {
  filePath: string,
  fileKind: ReturnType<typeof classifyFileKind>,
  variableName: string,
  line: number,
  column: number,
  preserve: boolean,
  reason: string,
  confidence: number,
};

function parseArgs(argv: string[]): CliOptions {
  const outIndex = argv.indexOf('--out');
  const maxIndex = argv.indexOf('--max');
  const outPath =
    outIndex !== -1 && argv[outIndex + 1] ? argv[outIndex + 1] : 'reports/unused-vars.json';
  const maxFiles = maxIndex !== -1 && argv[maxIndex + 1] ? Number(argv[maxIndex + 1]) : undefined;
  return { outPath, maxFiles };
}

async function collectUnusedVariables(maxFiles?: number): Promise<Finding[]> {
  const outputFile = path.resolve(process.cwd(), 'temp-lint.json');
  const cmd = `eslint --config eslint.config.cjs src --format=json --max-warnings=10000 --output-file ${outputFile}`;
  try {
    childProcess.execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    // ESLint exits 1 if issues found, but file is written
    console.warn('ESLint exited with code 1 (expected if issues found)');
  }
  if (!fs.existsSync(outputFile)) {
    throw new Error('Lint output file not created');
  }
  const json = fs.readFileSync(outputFile, 'utf8');
  type EslintMessage = { ruleId?: string; message: string; line?: number; column?: number };
  type EslintResult = { filePath: string; messages: EslintMessage[] };
  const results: EslintResult[] = JSON.parse(json);
  const limited = typeof maxFiles === 'number' ? results.slice(0, Math.max(0, maxFiles)) : results;

  const findings: Finding[] = [];
  for (const res of limited) {
    const filePath = res.filePath;
    const fileKind = classifyFileKind(filePath);
    for (const msg of res.messages) {
      if (msg.ruleId !== 'no-unused-vars' && msg.ruleId !== '@typescript-eslint/no-unused-vars')
        continue;
      const quoted = msg.message.match(/'(.*?)'/)?.[1];
      const fallback = msg.message.match(/([A-Za-z_$][A-Za-z0-9_$]*)/)?.[1];
      const variableName = quoted || fallback || 'unknown';
      const decision = decidePreservation(variableName, filePath);
      findings.push({
        filePath,
        fileKind,
        variableName,
        line: msg.line ?? 0,
        column: msg.column ?? 0,
        preserve: decision.preserve,
        reason: decision.reason,
        confidence: decision.confidence
      });
    }
  }
  fs.unlinkSync(outputFile); // Clean up temp file
  return findings;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateHumanReadableReport(findings: Finding[]): string {
  const total = findings.length;
  const preserve = findings.filter(f => f.preserve).length;
  const eliminate = total - preserve;
  const byReason = findings.reduce<Record<string, number>>((acc, f) => {;
    acc[f.reason] = (acc[f.reason] || 0) + 1;
    return acc;
  }, {});
  const lines = [;
    `Unused variable analysis`,
    `Total findings: ${total}`,
    `Preserve: ${preserve}`,
    `Eliminate: ${eliminate}`,
    `Breakdown by reason:`
  ];
  for (const [reason, count] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) {
    lines.push(`  - ${reason}: ${count}`);
  }
  return lines.join('\n');
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const findings = await collectUnusedVariables(opts.maxFiles);

  ensureDir(path.dirname(opts.outPath));
  fs.writeFileSync(
    opts.outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2),
  );

  const humanReport = generateHumanReadableReport(findings);
  const txtOut = opts.outPath.replace(/\.json$/, '.txt');
  fs.writeFileSync(txtOut, humanReport, 'utf8');

  // Console summary
   
  // // console.log(humanReport);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
