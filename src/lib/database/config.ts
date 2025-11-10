/**
 * Database Configuration - Environment Variables Handler
 * Created: September 26, 2025
 *
 * Centralized configuration management for database connections
 * and environment-specific settings
 */

import { logger } from "../logger";

// Environment variable validation and defaults
export const databaseConfig = {
  // Database connection
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://user:pass@localhost:5432/alchm_kitchen",
  // Individual connection parameters (fallback if DATABASE_URL not provided)
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "alchm_kitchen",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "pass",
  ssl: process.env.DB_SSL === "true",

  // Connection pool settings
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "10", 10),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "2000", 10),

  // Application settings
  environment: process.env.NODE_ENV || "development",
  logQueries: process.env.DB_LOG_QUERIES === "true",
  autoMigrate: process.env.DB_AUTO_MIGRATE !== "false", // Default true
  seedData: process.env.DB_SEED_DATA === "true", // Default false

  // Redis (optional)
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
};

// Validate configuration on import
export function validateDatabaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check database URL format
  if (databaseConfig.databaseUrl) {
    try {
      const url = new URL(databaseConfig.databaseUrl);
      if (url.protocol !== "postgresql:") {
        errors.push("DATABASE_URL must use postgresql:// protocol");
      }
    } catch {
      errors.push("DATABASE_URL is not a valid URL");
    }
  }

  // Check individual parameters if no DATABASE_URL
  if (!databaseConfig.databaseUrl) {
    if (!databaseConfig.host)
      errors.push("DB_HOST is required when DATABASE_URL is not provided");
    if (!databaseConfig.database)
      errors.push("DB_NAME is required when DATABASE_URL is not provided");
    if (!databaseConfig.user)
      errors.push("DB_USER is required when DATABASE_URL is not provided");
    if (databaseConfig.port <= 0 || databaseConfig.port > 65535) {
      errors.push("DB_PORT must be a valid port number (1-65535)");
    }
  }

  // Check connection pool settings
  if (
    databaseConfig.maxConnections < 1 ||
    databaseConfig.maxConnections > 100
  ) {
    errors.push("DB_MAX_CONNECTIONS must be between 1 and 100");
  }
  if (databaseConfig.idleTimeout < 1000) {
    errors.push("DB_IDLE_TIMEOUT must be at least 1000ms");
  }
  if (databaseConfig.connectionTimeout < 100) {
    errors.push("DB_CONNECTION_TIMEOUT must be at least 100ms");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Initialize configuration and log warnings
// DISABLED: Module-level logging causes Next.js build to hang during module scanning
// These validations and logs should be called at runtime, not during import
/*
const validation = validateDatabaseConfig();
if (!validation.valid) {
  void logger.error("Database configuration validation failed", {
    errors: validation.errors,
  });
  throw new Error(
    `Invalid database configuration: ${validation.errors.join(", ")}`,
  );
}

// Log configuration summary (without sensitive data)
void logger.info("Database configuration loaded", {
  environment: databaseConfig.environment,
  hasDatabaseUrl: !!databaseConfig.databaseUrl,
  host: databaseConfig.databaseUrl ? "[hidden]" : databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  maxConnections: databaseConfig.maxConnections,
  ssl: databaseConfig.ssl,
  logQueries: databaseConfig.logQueries,
  autoMigrate: databaseConfig.autoMigrate,
});
*/

export default databaseConfig;
