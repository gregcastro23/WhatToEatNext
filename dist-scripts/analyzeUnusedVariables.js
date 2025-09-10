"use strict";
/*
  Unused variable analyzer with domain-aware categorization.
  - Scans files using ESLint programmatically to collect no-unused-vars findings
  - Classifies variables via domainPreservation rules
  - Outputs a JSON and human-readable report with confidence scoring

  Usage:
    yarn ts-node src/scripts/unused-vars/analyzeUnusedVariables.ts --out reports/unused-vars.json --max 2000
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = __importDefault(require("node:child_process"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const domainPreservation_1 = require("./domainPreservation");
function parseArgs(argv) {
    const outIndex = argv.indexOf('--out');
    const maxIndex = argv.indexOf('--max');
    const outPath = outIndex !== -1 && argv[outIndex + 1] ? argv[outIndex + 1] : 'reports/unused-vars.json';
    const maxFiles = maxIndex !== -1 && argv[maxIndex + 1] ? Number(argv[maxIndex + 1]) : undefined;
    return { outPath, maxFiles };
}
async function collectUnusedVariables(maxFiles) {
    const outputFile = node_path_1.default.resolve(process.cwd(), 'temp-lint.json');
    const cmd = `eslint --config eslint.config.cjs src --format=json --max-warnings=10000 --output-file ${outputFile}`;
    try {
        node_child_process_1.default.execSync(cmd, { stdio: 'inherit' });
    }
    catch (error) {
        // ESLint exits 1 if issues found, but file is written
        console.warn('ESLint exited with code 1 (expected if issues found)');
    }
    if (!node_fs_1.default.existsSync(outputFile)) {
        throw new Error('Lint output file not created');
    }
    const json = node_fs_1.default.readFileSync(outputFile, 'utf8');
    const results = JSON.parse(json);
    const limited = typeof maxFiles === 'number' ? results.slice(0, Math.max(0, maxFiles)) : results;
    const findings = [];
    for (const res of limited) {
        const filePath = res.filePath;
        const fileKind = (0, domainPreservation_1.classifyFileKind)(filePath);
        for (const msg of res.messages) {
            if (msg.ruleId !== 'no-unused-vars' && msg.ruleId !== '@typescript-eslint/no-unused-vars')
                continue;
            const quoted = msg.message.match(/'(.*?)'/)?.[1];
            const fallback = msg.message.match(/([A-Za-z_$][A-Za-z0-9_$]*)/)?.[1];
            const variableName = quoted || fallback || 'unknown';
            const decision = (0, domainPreservation_1.decidePreservation)(variableName, filePath);
            findings.push({
                filePath,
                fileKind,
                variableName,
                line: msg.line ?? 0,
                column: msg.column ?? 0,
                preserve: decision.preserve,
                reason: decision.reason,
                confidence: decision.confidence,
            });
        }
    }
    node_fs_1.default.unlinkSync(outputFile); // Clean up temp file
    return findings;
}
function ensureDir(dirPath) {
    if (!node_fs_1.default.existsSync(dirPath)) {
        node_fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
}
function generateHumanReadableReport(findings) {
    const total = findings.length;
    const preserve = findings.filter(f => f.preserve).length;
    const eliminate = total - preserve;
    const byReason = findings.reduce((acc, f) => {
        acc[f.reason] = (acc[f.reason] || 0) + 1;
        return acc;
    }, {});
    const lines = [
        `Unused variable analysis`,
        `Total findings: ${total}`,
        `Preserve: ${preserve}`,
        `Eliminate: ${eliminate}`,
        `Breakdown by reason:`,
    ];
    for (const [reason, count] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) {
        lines.push(`  - ${reason}: ${count}`);
    }
    return lines.join('\n');
}
async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const findings = await collectUnusedVariables(opts.maxFiles);
    ensureDir(node_path_1.default.dirname(opts.outPath));
    node_fs_1.default.writeFileSync(opts.outPath, JSON.stringify({ generatedAt: new Date().toISOString(), findings }, null, 2));
    const humanReport = generateHumanReadableReport(findings);
    const txtOut = opts.outPath.replace(/\.json$/, '.txt');
    node_fs_1.default.writeFileSync(txtOut, humanReport, 'utf8');
    // Console summary
    // eslint-disable-next-line no-console
    console.log(humanReport);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
//# sourceMappingURL=analyzeUnusedVariables.js.map