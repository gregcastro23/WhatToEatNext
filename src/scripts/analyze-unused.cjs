const fs = require("fs");
const data = JSON.parse(fs.readFileSync("lint-results.json", "utf8"));
const unused = {};
data.forEach(f => {
  f.messages.forEach(m => {
    if (m.ruleId === "@typescript-eslint/no-unused-vars") {
      const match = m.message.match(/^'([^']+)' is/);
      if (match) {
        unused[match[1]] = (unused[match[1]] || 0) + 1;
      }
    }
  });
});
const sorted = Object.entries(unused).sort((a, b) => b[1] - a[1]);
console.log(sorted.slice(0, 30));