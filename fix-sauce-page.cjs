#!/usr/bin/env node

const fs = require("fs");

// Fix the sauce page variable issue
const filePath = "src/pages/sauces/[cuisine]/[id].tsx";
let content = fs.readFileSync(filePath, "utf8");

// Fix the destructuring
content = content.replace(
  "const {_cuisine, _id} = router.query;",
  "const {cuisine, id} = router.query;",
);

// Fix all the variable references that were incorrectly prefixed
const fixes = [
  // Fix ingredient variable
  {
    from: /sauce\.keyIngredients\.map\(\(_ingredient: string, idx: number\) => \(/g,
    to: "sauce.keyIngredients.map((ingredient: string, idx: number) => (",
  },
  { from: /{ingredient}/g, to: "{ingredient}" },

  // Fix use variable
  {
    from: /sauce\.culinaryUses\.map\(\(_use: string, idx: number\) => \(/g,
    to: "sauce.culinaryUses.map((use: string, idx: number) => (",
  },
  { from: /{use}/g, to: "{use}" },

  // Fix variant variable
  {
    from: /sauce\.variants\.map\(\(_variant: string, idx: number\) => \(/g,
    to: "sauce.variants.map((variant: string, idx: number) => (",
  },
  { from: /{variant}/g, to: "{variant}" },

  // Fix influence variable
  {
    from: /sauce\.astrologicalInfluences\.map\(\(_influence: string, idx: number\) => \(/g,
    to: "sauce.astrologicalInfluences.map((influence: string, idx: number) => (",
  },
  { from: /{influence}/g, to: "{influence}" },
];

fixes.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync(filePath, content);
console.log("Fixed sauce page variables");
