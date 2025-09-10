"use strict";
/*
  Batch elimination and transformation framework for unused variables.
  - Reads findings JSON from analyzeUnusedVariables
  - Splits into batches respecting safety protocols
  - Eliminates low-risk variables; prefixes high-value variables instead
  - Runs type-check after each batch; auto-rollback on failure

  Usage:
    yarn ts-node src/scripts/unused-vars/batchEliminateUnused.ts --in reports/unused-vars.json --dry-run
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
    const inIndex = argv.indexOf('--in');
    const dry = argv.includes('--dry-run');
    const maxBatchIdx = argv.indexOf('--max-batch');
    const maxBatchCriticalIdx = argv.indexOf('--max-batch-critical');
    return {
        inPath: inIndex !== -1 && argv[inIndex + 1] ? argv[inIndex + 1] : 'reports/unused-vars.json',
        dryRun: dry,
        maxBatch: maxBatchIdx !== -1 && argv[maxBatchIdx + 1] ? Number(argv[maxBatchIdx + 1]) : 15,
        maxBatchCritical: maxBatchCriticalIdx !== -1 && argv[maxBatchCriticalIdx + 1]
            ? Number(argv[maxBatchCriticalIdx + 1])
            : 8,
    };
}
function execCmd(cmd) {
    try {
        const stdout = node_child_process_1.default.execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
        return { code: 0, stdout, stderr: '' };
    }
    catch (err) {
        const e = err;
        return {
            code: e.status ?? 1,
            stdout: e.stdout ? e.stdout.toString() : '',
            stderr: e.stderr ? e.stderr.toString() : 'Execution failed',
        };
    }
}
function runTypeCheck() {
    const { code } = execCmd('yarn tsc --noEmit --skipLibCheck | cat');
    return code === 0;
}
function readFindings(inPath) {
    const content = node_fs_1.default.readFileSync(inPath, 'utf8');
    const data = JSON.parse(content);
    return data.findings || [];
}
function groupByFile(findings) {
    const map = new Map();
    for (const f of findings) {
        const existing = map.get(f.filePath);
        if (existing) {
            existing.push(f);
        }
        else {
            map.set(f.filePath, [f]);
        }
    }
    return map;
}
function sortFilesForSafety(files) {
    return files.sort((a, b) => {
        const aImpact = (0, domainPreservation_1.isHighImpactFile)(a) ? 1 : 0;
        const bImpact = (0, domainPreservation_1.isHighImpactFile)(b) ? 1 : 0;
        if (aImpact !== bImpact)
            return aImpact - bImpact; // low impact first
        return a.localeCompare(b);
    });
}
function writeBackup(filePath, content) {
    const backupDir = node_path_1.default.join('.lint-backup-' + Date.now().toString());
    if (!node_fs_1.default.existsSync(backupDir))
        node_fs_1.default.mkdirSync(backupDir, { recursive: true });
    const rel = node_path_1.default.relative(process.cwd(), filePath).replace(/[\/]/g, '__');
    const backupPath = node_path_1.default.join(backupDir, rel + '.bak');
    node_fs_1.default.writeFileSync(backupPath, content, 'utf8');
    return backupPath;
}
function restoreFromBackups(backups) {
    for (const b of backups) {
        if (node_fs_1.default.existsSync(b.backup)) {
            const content = node_fs_1.default.readFileSync(b.backup, 'utf8');
            node_fs_1.default.writeFileSync(b.file, content, 'utf8');
        }
    }
}
function applyEditsToFile(filePath, eliminations, transformations, dryRun) {
    const original = node_fs_1.default.readFileSync(filePath, 'utf8');
    const lines = original.split(/\r?\n/);
    const markForDeletion = new Set();
    const renameMap = new Map();
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
        node_fs_1.default.writeFileSync(filePath, updated, 'utf8');
        return backupPath;
    }
    return null;
}
function processBatch(files, fileFindings, dryRun) {
    const backups = [];
    for (const file of files) {
        const findings = (fileFindings.get(file) || []).filter(f => !f.preserve);
        if (findings.length === 0)
            continue;
        // Prefix preserved variables instead of removing
        const transformations = (fileFindings.get(file) || []).filter(f => f.preserve);
        const backup = applyEditsToFile(file, findings, transformations, dryRun);
        if (backup)
            backups.push({ file, backup });
    }
    if (dryRun)
        return true;
    const ok = runTypeCheck();
    if (!ok) {
        restoreFromBackups(backups);
    }
    return ok;
}
function batchFiles(files, maxBatch, maxBatchCritical) {
    const batches = [];
    let current = [];
    for (const file of files) {
        const isCritical = (0, domainPreservation_1.isHighImpactFile)(file);
        const limit = isCritical ? maxBatchCritical : maxBatch;
        if (current.length >= limit) {
            batches.push(current);
            current = [];
        }
        current.push(file);
    }
    if (current.length)
        batches.push(current);
    return batches;
}
async function main() {
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
//# sourceMappingURL=batchEliminateUnused.js.map