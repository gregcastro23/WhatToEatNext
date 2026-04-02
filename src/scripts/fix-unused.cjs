const fs = require("fs");

const data = JSON.parse(fs.readFileSync("lint-results.json", "utf8"));
let totalFixed = 0;

for (const file of data) {
  if (file.errorCount === 0 && file.warningCount === 0) continue;

  const messages = file.messages
    .filter(m => m.ruleId === "@typescript-eslint/no-unused-vars")
    .sort((a, b) => b.line - a.line || b.column - a.column); // Process bottom-up, right-to-left

  if (messages.length === 0) continue;

  let content = fs.readFileSync(file.filePath, "utf8");
  let lines = content.split("\n");
  let modified = false;

  for (const msg of messages) {
    const match = msg.message.match(/^'([^']+)' is/);
    if (!match) continue;
    const varName = match[1];

    const lineIdx = msg.line - 1;
    let line = lines[lineIdx];

    // Case 1: Import statement
    if (/^import\s+/.test(line) || /}\s*from\s+['"]/.test(line)) {
      // It's an import. Try to remove the variable.
      
      // If it's a default import: `import Name from ...`
      const defaultImportRegex = new RegExp(`import\\s+type\\s+${varName}\\s+from|import\\s+${varName}\\s+from`);
      if (defaultImportRegex.test(line)) {
        lines.splice(lineIdx, 1);
        modified = true;
        totalFixed++;
        continue;
      }

      // If it's in a destructured import: `import { A, Name, B } from ...`
      // We need to carefully remove `Name`, its surrounding spaces, and commas.
      const regex = new RegExp(`\\b${varName}\\b\\s*(type\\s+)?(as\\s+[\\w]+)?\\s*,?|,?\\s*\\b${varName}\\b\\s*(type\\s+)?(as\\s+[\\w]+)?`);
      let newLine = line.replace(regex, "");
      
      // Cleanup `{ ,` or `, }` or `{ }`
      newLine = newLine.replace(/\{\s*,\s*/, "{ ").replace(/,\s*\}/, " }").replace(/\{\s*\}/, "");
      
      if (newLine !== line) {
        if (newLine.match(/^import\s*(type\s*)?(from\s*['"][^'"]+['"];?)?$/)) {
          // Empty import
          lines.splice(lineIdx, 1);
        } else {
          lines[lineIdx] = newLine;
        }
        modified = true;
        totalFixed++;
        continue;
      }
    }

    // Case 2: catch block `catch (err)`
    if (new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)`).test(line)) {
      lines[lineIdx] = line.replace(new RegExp(`catch\\s*\\(\\s*${varName}\\s*\\)`), `catch (_${varName})`);
      modified = true;
      totalFixed++;
      continue;
    }

    // Case 3: Function parameters, object destructuring, or variable declaration.
    // We will just rename it to _varName at the specific column if possible, to avoid breaking logic.
    // However, string replacement at a specific column is tricky due to 1-based indexing and potential multibyte characters.
    // Alternatively, we can just replace the exact word boundary.
    const before = line.substring(0, msg.column - 1);
    const after = line.substring(msg.column - 1);
    if (after.startsWith(varName)) {
      lines[lineIdx] = before + "_" + after;
      modified = true;
      totalFixed++;
      continue;
    } else {
      // Fallback: replace first occurrence of word in the line after column?
      // Sometimes column is off by 1 or points to a type definition. Let's just do a smart regex replace on the line if it matches `varName`.
      const wordRegex = new RegExp(`\\b${varName}\\b`);
      if (wordRegex.test(line)) {
        // If it's a type alias or interface we can rename it. 
        if (line.includes(`type ${varName}`) || line.includes(`interface ${varName}`)) {
          lines[lineIdx] = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
        } else {
          // Just prepend underscore
          lines[lineIdx] = line.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
        }
        modified = true;
        totalFixed++;
        continue;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file.filePath, lines.join("\n"), "utf8");
  }
}

console.log("Fixed " + totalFixed + " unused variables.");
