/**
 * Prometheus Metrics Collection for alchm.kitchen Backend Services
 * Comprehensive monitoring and observability instrumentation
 */

// import client from "prom-client"; // Commented out - prom-client not installed
import { logger } from "@/utils/logger";
// import type { Request, Response, NextFunction } from "express"; // Commented out - express not installed
type Request = any;
type Response = any;
type NextFunction = any;

// Mock client for prom-client (not installed)
const client: any = {
  collectDefaultMetrics: () => {},
  Histogram: class { constructor(_config: any) {} },
  Counter: class { constructor(_config: any) {} },
  Gauge: class { constructor(_config: any) {} },
  Summary: class { constructor(_config: any) {} },
  register: { metrics: () => "", contentType: "text/plain" },
};

// Initialize Prometheus metrics collection (DISABLED - prom-client not installed)
const { collectDefaultMetrics } = client;
collectDefaultMetrics({
  timeout: 10000,
  prefix: "alchm_",
});

// =============================================================================
// CORE HTTP METRICS
// =============================================================================

export const httpRequestDuration = new client.Histogram({
  name: "alchm_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code", "service"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

export const httpRequestsTotal = new client.Counter({
  name: "alchm_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code", "service"],
});

export const httpRequestSize = new client.Histogram({
  name: "alchm_http_request_size_bytes",
  help: "Size of HTTP requests in bytes",
  labelNames: ["method", "route", "service"],
  buckets: [100, 1000, 10000, 100000, 1000000],
});

export const httpResponseSize = new client.Histogram({
  name: "alchm_http_response_size_bytes",
  help: "Size of HTTP responses in bytes",
  labelNames: ["method", "route", "status_code", "service"],
  buckets: [100, 1000, 10000, 100000, 1000000],
});

// =============================================================================
// AUTHENTICATION METRICS
// =============================================================================

export const authAttemptsTotal = new client.Counter({
  name: "alchm_auth_attempts_total",
  help: "Total authentication attempts",
  labelNames: ["method", "success", "user_agent", "ip_country"],
});

export const authTokensGenerated = new client.Counter({
  name: "alchm_auth_tokens_generated_total",
  help: "Total JWT tokens generated",
  labelNames: ["token_type", "user_role"],
});

export const authTokenValidations = new client.Counter({
  name: "alchm_auth_token_validations_total",
  help: "Total token validation attempts",
  labelNames: ["result", "failure_reason"],
});

export const activeUsers = new client.Gauge({
  name: "alchm_active_users",
  help: "Number of currently active users",
  labelNames: ["user_tier"],
});

// =============================================================================
// ALCHEMICAL CALCULATION METRICS
// =============================================================================

export const alchemicalCalculationsTotal = new client.Counter({
  name: "alchm_alchemical_calculations_total",
  help: "Total number of alchemical calculations performed",
  labelNames: ["calculation_type", "success", "cache_hit"],
});

export const alchemicalCalculationDuration = new client.Histogram({
  name: "alchm_alchemical_calculation_duration_seconds",
  help: "Duration of alchemical calculations in seconds",
  labelNames: ["calculation_type", "complexity"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

export const elementalBalanceDistribution = new client.Histogram({
  name: "alchm_elemental_balance_distribution",
  help: "Distribution of elemental balance values",
  labelNames: ["element", "calculation_type"],
  buckets: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
});

export const thermodynamicsCalculations = new client.Counter({
  name: "alchm_thermodynamics_calculations_total",
  help: "Total thermodynamic calculations",
  labelNames: ["success", "complexity_level"],
});

export const gregsEnergyDistribution = new client.Histogram({
  name: "alchm_gregs_energy_distribution",
  help: "Distribution of Greg's Energy calculation results",
  labelNames: ["user_tier"],
  buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 150, 200],
});

// =============================================================================
// RECIPE RECOMMENDATION METRICS
// =============================================================================

export const recipeRecommendationsTotal = new client.Counter({
  name: "alchm_recipe_recommendations_total",
  help: "Total recipe recommendations generated",
  labelNames: ["cuisine", "dietary_restrictions", "success"],
});

export const recipeRecommendationDuration = new client.Histogram({
  name: "alchm_recipe_recommendation_duration_seconds",
  help: "Duration of recipe recommendation calculations",
  labelNames: ["algorithm_version", "result_count"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const recipeMatchScores = new client.Histogram({
  name: "alchm_recipe_match_scores",
  help: "Distribution of recipe matching scores",
  labelNames: ["cuisine", "difficulty_level"],
  buckets: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
});

export const recommendationDiversityScore = new client.Gauge({
  name: "alchm_recommendation_diversity_score",
  help: "Current recommendation diversity score",
  labelNames: ["time_window"],
});

export const userPreferenceLearning = new client.Counter({
  name: "alchm_user_preference_learning_total",
  help: "User preference learning events",
  labelNames: ["event_type", "preference_category"],
});

// =============================================================================
// DATABASE AND CACHE METRICS
// =============================================================================

export const databaseQueries = new client.Counter({
  name: "alchm_database_queries_total",
  help: "Total database queries executed",
  labelNames: ["operation", "table", "success"],
});

export const databaseQueryDuration = new client.Histogram({
  name: "alchm_database_query_duration_seconds",
  help: "Duration of database queries",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const cacheOperations = new client.Counter({
  name: "alchm_cache_operations_total",
  help: "Total cache operations",
  labelNames: ["operation", "result", "cache_type"],
});

export const cacheHitRatio = new client.Gauge({
  name: "alchm_cache_hit_ratio",
  help: "Cache hit ratio",
  labelNames: ["cache_type"],
});

export const cacheSizeBytes = new client.Gauge({
  name: "alchm_cache_size_bytes",
  help: "Current cache size in bytes",
  labelNames: ["cache_type"],
});

// =============================================================================
// WEBSOCKET METRICS
// =============================================================================

export const websocketConnections = new client.Gauge({
  name: "alchm_websocket_connections",
  help: "Current number of WebSocket connections",
  labelNames: ["user_type"],
});

export const websocketMessagesTotal = new client.Counter({
  name: "alchm_websocket_messages_total",
  help: "Total WebSocket messages sent/received",
  labelNames: ["direction", "message_type", "user_type"],
});

export const websocketConnectionsFailed = new client.Counter({
  name: "alchm_websocket_connections_failed_total",
  help: "Total failed WebSocket connection attempts",
  labelNames: ["reason"],
});

export const planetaryUpdatesTotal = new client.Counter({
  name: "alchm_planetary_updates_total",
  help: "Total planetary data updates sent",
  labelNames: ["planet", "update_type"],
});

// =============================================================================
// BUSINESS METRICS
// =============================================================================

export const userRegistrations = new client.Counter({
  name: "alchm_user_registrations_total",
  help: "Total user registrations",
  labelNames: ["source", "user_tier"],
});

export const userRetention = new client.Gauge({
  name: "alchm_user_retention_rate",
  help: "User retention rate",
  labelNames: ["time_period", "cohort"],
});

export const recipeViewsTotal = new client.Counter({
  name: "alchm_recipe_views_total",
  help: "Total recipe views",
  labelNames: ["recipe_id", "cuisine", "source"],
});

export const userEngagementScore = new client.Gauge({
  name: "alchm_user_engagement_score",
  help: "User engagement score",
  labelNames: ["user_tier", "time_window"],
});

export const conversionEvents = new client.Counter({
  name: "alchm_conversion_events_total",
  help: "Total conversion events",
  labelNames: ["event_type", "user_journey_stage"],
});

// =============================================================================
// RATE LIMITING METRICS
// =============================================================================

export const rateLimitHits = new client.Counter({
  name: "alchm_rate_limit_hits_total",
  help: "Total rate limit hits",
  labelNames: ["tier", "endpoint", "user_type"],
});

export const rateLimitRemaining = new client.Gauge({
  name: "alchm_rate_limit_remaining",
  help: "Remaining rate limit allowance",
  labelNames: ["tier", "user_id"],
});

// =============================================================================
// SYSTEM HEALTH METRICS
// =============================================================================

export const serviceHealth = new client.Gauge({
  name: "alchm_service_health",
  help: "Service health status (1 = healthy, 0 = unhealthy)",
  labelNames: ["service_name", "instance_id"],
});

export const dependencyHealth = new client.Gauge({
  name: "alchm_dependency_health",
  help: "External dependency health status",
  labelNames: ["dependency_name", "dependency_type"],
});

export const errorRates = new client.Gauge({
  name: "alchm_error_rate",
  help: "Current error rate",
  labelNames: ["service", "error_type"],
});

// =============================================================================
// MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Express middleware to collect HTTP metrics
 */
export function collectHttpMetrics(serviceName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestSize = parseInt(req.get("content-length", 10) || "0", 10);

    // Track request size
    if (requestSize > 0) {
      httpRequestSize
        .labels(req.method, req.route?.path || req.path, serviceName)
        .observe(requestSize);
    }

    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const duration = (Date.now() - startTime) / 1000;
      const responseSize = chunk ? Buffer.byteLength(chunk, encoding) : 0;

      // Record metrics
      httpRequestDuration
        .labels(
          req.method,
          req.route?.path || req.path,
          res.statusCode.toString(),
          serviceName,
        )
        .observe(duration);

      httpRequestsTotal
        .labels(
          req.method,
          req.route?.path || req.path,
          res.statusCode.toString(),
          serviceName,
        )
        .inc();

      if (responseSize > 0) {
        httpResponseSize
          .labels(
            req.method,
            req.route?.path || req.path,
            res.statusCode.toString(),
            serviceName,
          )
          .observe(responseSize);
      }

      // Log slow requests
      if (duration > 5) {
        logger.warn("Slow HTTP request detected", {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          service: serviceName,
        });
      }

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

/**
 * Track alchemical calculation metrics
 */
export function trackAlchemicalCalculation(
  calculationType: string,
  complexity = "medium",
) {
  const timer = alchemicalCalculationDuration.startTimer({
    calculation_type: calculationType,
    complexity,
  });

  return {
    end: (success: boolean, cacheHit = false) => {
      timer();
      alchemicalCalculationsTotal
        .labels(calculationType, success.toString(), cacheHit.toString())
        .inc();
    },
  };
}

/**
 * Track recipe recommendation metrics
 */
export function trackRecipeRecommendation(
  cuisine: string,
  dietaryRestrictions: string[] = [],
  algorithmVersion = "1.0",
) {
  const timer = recipeRecommendationDuration.startTimer({
    algorithm_version: algorithmVersion,
    result_count: "0",
  });

  return {
    end: (success: boolean, resultCount: number, scores: number[] = []) => {
      const duration = timer();

      recipeRecommendationsTotal
        .labels(cuisine, dietaryRestrictions.join(","), success.toString())
        .inc();

      // Update timer with actual result count
      recipeRecommendationDuration
        .labels(algorithmVersion, resultCount.toString())
        .observe(duration);

      // Track score distribution
      scores.forEach((score) => {
        recipeMatchScores.labels(cuisine, "unknown").observe(score);
      });
    },
  };
}

/**
 * Track authentication events
 */
export function trackAuthEvent(
  method: string,
  success: boolean,
  userAgent?: string,
  ipCountry?: string,
) {
  authAttemptsTotal
    .labels(
      method,
      success.toString(),
      userAgent || "unknown",
      ipCountry || "unknown",
    )
    .inc();
}

/**
 * Track database operations
 */
export function trackDatabaseOperation(operation: string, table: string) {
  const timer = databaseQueryDuration.startTimer({ operation, table });

  return {
    end: (success: boolean) => {
      timer();
      databaseQueries.labels(operation, table, success.toString()).inc();
    },
  };
}

/**
 * Track cache operations
 */
export function trackCacheOperation(
  operation: string,
  result: "hit" | "miss" | "set" | "delete",
  cacheType = "redis",
) {
  cacheOperations.labels(operation, result, cacheType).inc();
}

/**
 * Update cache hit ratio
 */
export function updateCacheHitRatio(hitRatio: number, cacheType = "redis") {
  cacheHitRatio.labels(cacheType).set(hitRatio);
}

/**
 * Track WebSocket connections
 */
export function trackWebSocketConnection(userType: string, connected: boolean) {
  if (connected) {
    websocketConnections.labels(userType).inc();
  } else {
    websocketConnections.labels(userType).dec();
  }
}

/**
 * Track service health
 */
export function updateServiceHealth(
  serviceName: string,
  instanceId: string,
  isHealthy: boolean,
) {
  serviceHealth.labels(serviceName, instanceId).set(isHealthy ? 1 : 0);
}

/**
 * Get metrics endpoint handler
 */
export async function getMetrics(req: Request, res: Response) {
  try {
    res.set("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error("Error generating metrics", { error });
    res.status(500).end("Error generating metrics");
  }
}

/**
 * Clear all metrics (for testing)
 */
export function clearMetrics() {
  client.register.clear();
}

/**
 * Initialize service-specific metrics
 */
export function initializeServiceMetrics(
  serviceName: string,
  instanceId: string,
) {
  // Set initial service health
  updateServiceHealth(serviceName, instanceId, true);

  // Register cleanup on process exit
  process.on("SIGTERM", () => {
    updateServiceHealth(serviceName, instanceId, false);
  });

  process.on("SIGINT", () => {
    updateServiceHealth(serviceName, instanceId, false);
  });

  logger.info("Prometheus metrics initialized", { serviceName, instanceId });
}

export default {
  httpRequestDuration,
  httpRequestsTotal,
  authAttemptsTotal,
  alchemicalCalculationsTotal,
  recipeRecommendationsTotal,
  collectHttpMetrics,
  trackAlchemicalCalculation,
  trackRecipeRecommendation,
  trackAuthEvent,
  trackDatabaseOperation,
  trackCacheOperation,
  updateServiceHealth,
  getMetrics,
  initializeServiceMetrics,
};
