"use strict";
/*
  Progress tracking and reporting utilities for the unused-variable campaign.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDir = exports.updateProgress = exports.createBaselineReport = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function createBaselineReport(targetFile = 'reports/unused-vars-baseline.json', baseline = 965) {
    ensureDir(node_path_1.default.dirname(targetFile));
    const initial = {
        baselineUnusedVars: baseline,
        analyzedFindings: 0,
        preserved: 0,
        eliminated: 0,
        transformed: 0,
        batchesCompleted: 0,
        batchesTotal: 0,
        lastUpdated: new Date().toISOString(),
    };
    node_fs_1.default.writeFileSync(targetFile, JSON.stringify(initial, null, 2));
}
exports.createBaselineReport = createBaselineReport;
function updateProgress(metrics, targetFile = 'reports/unused-vars-baseline.json') {
    ensureDir(node_path_1.default.dirname(targetFile));
    let current;
    if (node_fs_1.default.existsSync(targetFile)) {
        current = JSON.parse(node_fs_1.default.readFileSync(targetFile, 'utf8'));
    }
    else {
        current = {
            baselineUnusedVars: 965,
            analyzedFindings: 0,
            preserved: 0,
            eliminated: 0,
            transformed: 0,
            batchesCompleted: 0,
            batchesTotal: 0,
            lastUpdated: new Date().toISOString(),
        };
    }
    const updated = {
        ...current,
        ...metrics,
        lastUpdated: new Date().toISOString(),
    };
    node_fs_1.default.writeFileSync(targetFile, JSON.stringify(updated, null, 2));
}
exports.updateProgress = updateProgress;
function ensureDir(dirPath) {
    if (!node_fs_1.default.existsSync(dirPath))
        node_fs_1.default.mkdirSync(dirPath, { recursive: true });
}
exports.ensureDir = ensureDir;
//# sourceMappingURL=progressReporter.js.map