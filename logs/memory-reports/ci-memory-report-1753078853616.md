# CI/CD Memory Monitoring Report

**Generated:** 2025-07-21T06:20:53.591Z **Duration:** 12.44s **Environment:**
Local **Node Version:** v20.19.3 **Node Options:** not set

## Memory Analysis

| Metric     | Initial | Final   | Delta   |
| ---------- | ------- | ------- | ------- |
| Heap Used  | 3.33MB  | 3.67MB  | 0.34MB  |
| Heap Total | 4.06MB  | 4.31MB  | 0.25MB  |
| RSS        | 33.38MB | 30.97MB | -2.41MB |

## Memory Alerts

| Time       | Level | Message                                                                           |
| ---------- | ----- | --------------------------------------------------------------------------------- |
| 2:20:53 AM | ERROR | Command execution failed: Command failed: yarn test:memory-safe --passWithNoTests |

## Recommendations

✅ No specific recommendations. Memory usage is within acceptable limits.

## Memory Thresholds

- **Warning:** 100MB
- **Critical:** 200MB
- **Emergency:** 400MB
