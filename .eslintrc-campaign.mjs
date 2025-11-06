// .eslintrc-campaign.mjs - Linting Campaign Configuration
// Updated: November 6, 2025
// Use this for focused linting campaigns with stricter rules

import baseConfig from "./eslint.config.mjs";

// Extend base config with campaign-specific stricter rules
const campaignConfig = [
  ...baseConfig,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],

    rules: {
      // ======================================================================
      // CAMPAIGN PHASE 1: Type Safety Excellence
      // ======================================================================

      // Eliminate 'any' usage
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // Require explicit types
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],

      // ======================================================================
      // CAMPAIGN PHASE 2: Clean Code
      // ======================================================================

      // Eliminate unused variables
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          // Stricter: no ignored patterns for variables
        },
      ],

      // Eliminate console statements
      "no-console": ["error", { allow: [] }],

      // ======================================================================
      // CAMPAIGN PHASE 3: Import/Export Hygiene
      // ======================================================================

      "import/no-unresolved": "error",
      "import/no-duplicates": "error",
      "import/no-cycle": "error",
      "import/no-self-import": "error",

      // ======================================================================
      // CAMPAIGN PHASE 4: React Best Practices
      // ======================================================================

      "react-hooks/exhaustive-deps": "error",
      "react/jsx-key": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-direct-mutation-state": "error",

      // ======================================================================
      // CAMPAIGN PHASE 5: Code Quality Metrics
      // ======================================================================

      complexity: ["error", 15], // Stricter than base
      "max-depth": ["error", 3],
      "max-lines": [
        "error",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 75, skipBlankLines: true, skipComments: true },
      ],
      "max-nested-callbacks": ["error", 2],
      "max-params": ["error", 4],
    },
  },
];

export default campaignConfig;
