/**
 * Performance Metrics Analytics
 *
 * Computes simple descriptive statistics over a metrics payload and produces
 * a human-readable summary so `BuildPerformanceMonitor` consumers can display
 * meaningful feedback instead of "No analysis available".
 */

export interface PerformanceReport {
  summary: string;
  metrics: Record<string, number>;
  timestamp: string;
  insights?: string[];
  [key: string]: unknown;
}

interface MetricStats {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  p95: number;
}

function collectNumericMetrics(input: unknown): Record<string, number> {
  if (!input || typeof input !== "object") return {};
  const flat: Record<string, number> = {};
  const visit = (obj: Record<string, unknown>, prefix: string) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "number" && Number.isFinite(v)) {
        flat[key] = v;
      } else if (Array.isArray(v)) {
        if (v.every((x) => typeof x === "number")) {
          // Summarize arrays of numbers with mean + count
          const arr = v as number[];
          flat[`${key}.count`] = arr.length;
          if (arr.length > 0) {
            flat[`${key}.mean`] = arr.reduce((a, b) => a + b, 0) / arr.length;
            flat[`${key}.max`] = Math.max(...arr);
          }
        }
      } else if (v && typeof v === "object" && !Array.isArray(v)) {
        visit(v as Record<string, unknown>, key);
      }
    }
  };
  visit(input as Record<string, unknown>, "");
  return flat;
}

function summarizeArray(values: number[]): MetricStats {
  if (values.length === 0) {
    return { count: 0, mean: 0, median: 0, min: 0, max: 0, p95: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const pick = (q: number) => {
    const idx = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
    return sorted[idx];
  };
  return {
    count: sorted.length,
    mean: sum / sorted.length,
    median: pick(0.5),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: pick(0.95),
  };
}

function buildInsights(
  metrics: Record<string, number>,
  stats: MetricStats,
): string[] {
  const insights: string[] = [];

  // Call out slow build / compile metrics if present
  const durationKey = Object.keys(metrics).find(
    (k) =>
      /duration/i.test(k) ||
      /buildTime/i.test(k) ||
      /compileTime/i.test(k),
  );
  if (durationKey) {
    const value = metrics[durationKey];
    if (value > 30_000) {
      insights.push(
        `${durationKey} is ${(value / 1000).toFixed(1)}s — consider profiling`,
      );
    }
  }

  // Memory pressure heuristic
  const memKey = Object.keys(metrics).find((k) => /memory/i.test(k));
  if (memKey && metrics[memKey] > 500_000_000) {
    insights.push(
      `${memKey} is ${(metrics[memKey] / 1_000_000).toFixed(0)}MB — watch for leaks`,
    );
  }

  // Error/warning counts
  const errorKey = Object.keys(metrics).find((k) => /error/i.test(k));
  if (errorKey && metrics[errorKey] > 0) {
    insights.push(`${metrics[errorKey]} error signal(s) in ${errorKey}`);
  }

  // Variance warning when measurements span a wide range
  if (stats.count >= 3 && stats.max > stats.mean * 3) {
    insights.push(
      `High variance detected — max (${stats.max.toFixed(2)}) is ${(
        stats.max / stats.mean
      ).toFixed(1)}× the mean`,
    );
  }

  return insights;
}

function formatSummary(
  count: number,
  stats: MetricStats,
  insights: string[],
): string {
  if (count === 0) {
    return "No numeric metrics to analyze";
  }
  const parts = [
    `${count} metric${count === 1 ? "" : "s"} analyzed`,
    `mean=${stats.mean.toFixed(2)}`,
    `median=${stats.median.toFixed(2)}`,
    `p95=${stats.p95.toFixed(2)}`,
  ];
  let summary = parts.join(" · ");
  if (insights.length > 0) {
    summary += ` — ${insights.length} insight${insights.length === 1 ? "" : "s"}`;
  }
  return summary;
}

export class PerformanceMetricsAnalytics {
  /**
   * Analyze an arbitrary metrics payload. Flattens nested objects, skips
   * non-numeric fields, and produces a compact descriptive report.
   */
  static analyzeMetrics(metrics: unknown): PerformanceReport {
    const flat = collectNumericMetrics(metrics);
    const values = Object.values(flat);
    const stats = summarizeArray(values);
    const insights = buildInsights(flat, stats);

    return {
      summary: formatSummary(values.length, stats, insights),
      metrics: flat,
      timestamp: new Date().toISOString(),
      insights,
      stats: stats as unknown as Record<string, number>,
    };
  }
}
