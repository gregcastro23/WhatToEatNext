#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");

// Get all exhaustive-deps warnings
console.log("Getting exhaustive-deps warnings...");
const lintOutput = execSync("yarn lint --format=json 2>/dev/null", {
  encoding: "utf8",
});
const lintResults = JSON.parse(lintOutput);

const exhaustiveDepsWarnings = [];

lintResults.forEach((fileResult) => {
  fileResult.messages.forEach((message) => {
    if (message.ruleId === "react-hooks/exhaustive-deps") {
      exhaustiveDepsWarnings.push({
        file: fileResult.filePath.replace(process.cwd() + "/", ""),
        line: message.line,
        column: message.column,
        message: message.message,
        suggestions: message.suggestions || [],
      });
    }
  });
});

console.log(`Found ${exhaustiveDepsWarnings.length} exhaustive-deps warnings:`);
exhaustiveDepsWarnings.forEach((warning, index) => {
  console.log(
    `${index + 1}. ${warning.file}:${warning.line}:${warning.column}`,
  );
  console.log(`   ${warning.message}`);
  console.log("");
});

// For now, just report the warnings
// In a real implementation, we would parse the suggestions and apply fixes
