const fs = require("fs");
const data = JSON.parse(fs.readFileSync("level1-fixed.json", "utf8"));
let totalFixed = 0;

for (const file of data) {
  const msgs = file.messages.filter(m => m.ruleId === "react/no-unescaped-entities");
  if (msgs.length === 0) continue;

  let content = fs.readFileSync(file.filePath, "utf8");
  let lines = content.split("\n");
  let modified = false;

  // Process from bottom to top, right to left to avoid messing up indices
  msgs.sort((a, b) => b.line - a.line || b.column - a.column).forEach(msg => {
    const lineIdx = msg.line - 1;
    const colIdx = msg.column - 1;
    let line = lines[lineIdx];
    
    // The character is usually at colIdx.
    const char = line[colIdx];
    if (char === "'") {
      lines[lineIdx] = line.substring(0, colIdx) + "&apos;" + line.substring(colIdx + 1);
      modified = true;
      totalFixed++;
    } else if (char === "\"") {
      lines[lineIdx] = line.substring(0, colIdx) + "&quot;" + line.substring(colIdx + 1);
      modified = true;
      totalFixed++;
    } else if (char === ">") {
      // Sometimes it points to the > before the text. We have to find the quote/apostrophe after it.
      const searchStr = line.substring(colIdx);
      if (msg.message.includes("`'`")) {
         lines[lineIdx] = line.substring(0, colIdx) + searchStr.replace("'", "&apos;");
         modified = true;
         totalFixed++;
      } else if (msg.message.includes("`\"`")) {
         lines[lineIdx] = line.substring(0, colIdx) + searchStr.replace("\"", "&quot;");
         modified = true;
         totalFixed++;
      }
    } else {
        // Find it in the line if column is slightly off
        if (msg.message.includes("`'`") && line.includes("'")) {
             lines[lineIdx] = line.replace(/'([^']*)'/, "&apos;$1&apos;").replace(/'/, "&apos;");
             modified = true;
             totalFixed++;
        } else if (msg.message.includes("`\"`") && line.includes("\"")) {
             lines[lineIdx] = line.replace(/"([^"]*)"/, "&quot;$1&quot;").replace(/"/, "&quot;");
             modified = true;
             totalFixed++;
        }
    }
  });

  if (modified) {
    fs.writeFileSync(file.filePath, lines.join("\n"), "utf8");
  }
}
console.log("Fixed " + totalFixed + " unescaped entities.");
