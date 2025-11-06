#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

function measureESLintPerformance() {
  console.log("📊 Measuring ESLint Performance...");

  const startTime = Date.now();

  try {
    // Run ESLint with timing
    const output = execSync(
      "yarn lint --max-warnings=10000 --cache --cache-location=.eslint-cache",
      {
        encoding: "utf8",
        stdio: "pipe",
      },
    );

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`✅ ESLint completed in ${duration.toFixed(2)} seconds`);

    // Save performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      duration: duration,
      target: 30, // seconds
      achieved: duration < 30,
      cacheUsed: true,
    };

    fs.writeFileSync(".eslint-metrics.json", JSON.stringify(metrics, null, 2));

    if (duration < 30) {
      console.log("🎯 Performance target achieved (< 30 seconds)");
    } else {
      console.log(
        `⚠️  Performance target missed by ${(duration - 30).toFixed(2)} seconds`,
      );
    }

    return duration;
  } catch (error) {
    console.error("❌ ESLint failed:", error.message);
    return -1;
  }
}

measureESLintPerformance();
