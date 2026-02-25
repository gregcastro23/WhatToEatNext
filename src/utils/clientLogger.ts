"use client";

/**
 * Client-side logger that outputs structured messages to the browser console.
 * Enabled by default in development; can be enabled in production via
 * localStorage.setItem('ALCHM_DEBUG', 'true')
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const COLORS: Record<LogLevel, string> = {
  debug: "color: #9e9e9e",
  info: "color: #2196f3",
  warn: "color: #ff9800",
  error: "color: #f44336; font-weight: bold",
};

function isEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Always log warnings and errors
  // Debug/info controlled by env or localStorage flag
  try {
    if (process.env.NODE_ENV === "development") return true;
    return localStorage.getItem("ALCHM_DEBUG") === "true";
  } catch {
    return false;
  }
}

function log(level: LogLevel, tag: string, message: string, data?: unknown) {
  // Always allow warn/error through
  if (level !== "warn" && level !== "error" && !isEnabled()) return;

  const timestamp = new Date().toISOString().slice(11, 23);
  const prefix = `%c[${timestamp}] [${tag}]`;
  const style = COLORS[level];

  if (data !== undefined) {
    console[level](prefix, style, message, data);
  } else {
    console[level](prefix, style, message);
  }
}

export const clientLogger = {
  debug: (tag: string, message: string, data?: unknown) =>
    log("debug", tag, message, data),
  info: (tag: string, message: string, data?: unknown) =>
    log("info", tag, message, data),
  warn: (tag: string, message: string, data?: unknown) =>
    log("warn", tag, message, data),
  error: (tag: string, message: string, data?: unknown) =>
    log("error", tag, message, data),
};
