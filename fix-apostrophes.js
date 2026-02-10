import fs from "fs";
import path from "path";

// Function to fix apostrophes in a file
function fixApostrophesInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let fixedContent = content;

  // Pattern to match single-quoted strings containing unescaped apostrophes
  // This regex looks for 'text'word's more text' and replaces the middle apostrophe
  fixedContent = fixedContent.replace(
    /'([^']*)'([^']*)'([^']*)'/g,
    (match, before, middle, after) => {
      // Only escape if this looks like a broken string (contains spaces or typical text)
      if (middle.includes(" ") || /[a-zA-Z]/.test(middle)) {
        return `'${before}'${middle.replace(/'/g, "\\'")}'${after}'`;
      }
      return match;
    },
  );

  // More targeted fix: look for patterns like 'word's word' within object literals
  fixedContent = fixedContent.replace(
    /'([^']*?)'([^']*?)'([^']*?)'/g,
    (match, part1, part2, part3) => {
      if (part2 && part2.length > 0) {
        return `'${part1}'${part2.replace(/'/g, "\\'")}'${part3}'`;
      }
      return match;
    },
  );

  if (fixedContent !== content) {
    fs.writeFileSync(filePath, fixedContent, "utf8");
    console.log(`Fixed apostrophes in ${filePath}`);
  }
}

// Process all cuisine files
const cuisineDir = "src/data/cuisines";
const files = fs.readdirSync(cuisineDir).filter((file) => file.endsWith(".ts"));

files.forEach((file) => {
  const filePath = path.join(cuisineDir, file);
  try {
    fixApostrophesInFile(filePath);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log("Apostrophe fixing complete");
