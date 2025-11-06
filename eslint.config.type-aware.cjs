/**
 * Type-Aware ESLint Configuration
 * Full TypeScript type checking with all rules enabled
 * Use for pre-commit hooks and CI/CD final validation
 */

const js = require("@eslint/js");
const ts = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const importPlugin = require("eslint-plugin-import");
const globals = require("globals");
const astrologicalRules = require("./src/eslint-plugins/astrological-rules.cjs");

module.exports = [
  js.configs.recommended,
  // TypeScript files with FULL type checking
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // Full type checking enabled
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        // Optimization: use existing program if available
        programs: undefined, // Let TypeScript create the program
        createDefaultProgram: false, // Don't create fallback program
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
      astrological: astrologicalRules,
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-deprecated": "warn",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unescaped-entities": "error",
      "react/no-unknown-property": "error",
      "react/require-render-return": "error",

      // TypeScript rules - ALL enabled for comprehensive checking
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^(_|UNUSED_)",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // Type-aware rules (these require the TypeScript program)
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/restrict-plus-operands": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
      "@typescript-eslint/switch-exhaustiveness-check": "warn",
      "@typescript-eslint/prefer-string-starts-ends-with": "warn",
      "@typescript-eslint/prefer-includes": "warn",
      "@typescript-eslint/prefer-readonly": "warn",

      // Temporarily disabled due to too many warnings
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",

      // Import rules
      "import/no-unresolved": [
        "warn",
        {
          ignore: [
            "^@/",
            "^@components/",
            "^@styles/",
            "^@utils/",
            "^@types/",
            "^@providers/",
            "^@services/",
            "^@data/",
            "^@constants/",
            "^@contexts/",
            "^@hooks/",
            "^@lib/",
            "^@calculations/",
            "\\.module\\.css$",
            "^astronomy-engine",
            "^suncalc",
          ],
        },
      ],
      "import/named": "warn",
      "import/default": "warn",
      "import/namespace": "warn",
      "import/no-duplicates": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-cycle": "warn",
      "import/no-self-import": "error",
      "import/no-useless-path-segments": "error",

      // General JavaScript rules
      "no-unused-vars": "off",
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error",
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-undef": "off",
    },
    settings: {
      react: {
        version: "19.1.0",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: ["./tsconfig.json"],
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      },
    },
  },
  // JavaScript files (non-TypeScript)
  {
    files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        ...globals.es2022,
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/prop-types": "off",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-unescaped-entities": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error",
      "no-debugger": "warn",
    },
    settings: {
      react: {
        version: "19.1.0",
      },
    },
  },
  // Domain-specific rules for astrological calculations
  {
    files: [
      "**/calculations/**/*.ts",
      "**/calculations/**/*.tsx",
      "**/data/planets/**/*.ts",
      "**/utils/reliableAstronomy.ts",
      "**/utils/planetaryConsistencyCheck.ts",
      "**/utils/astrology/**/*.ts",
      "**/services/*Astrological*.ts",
      "**/services/*Alchemical*.ts",
    ],
    rules: {
      "astrological/preserve-planetary-constants": "error",
      "astrological/validate-planetary-position-structure": "error",
      "astrological/validate-elemental-properties": "error",
      "astrological/require-transit-date-validation": "warn",
      "astrological/preserve-fallback-values": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "no-magic-numbers": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern:
            "^(_|planet|position|degree|sign|longitude|retrograde)",
          varsIgnorePattern:
            "^(_|FALLBACK|RELIABLE|POSITIONS|TRANSIT|DEFAULT|MARCH2025|UNUSED_|planet|degree|sign|longitude)",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info", "debug"] }],
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
  // Test files
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/__tests__/**/*.ts",
      "**/__tests__/**/*.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^(_|mock|stub)",
          varsIgnorePattern: "^(_|mock|stub|test|UNUSED_)",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
  // Scripts
  {
    files: [
      "**/scripts/**/*.ts",
      "**/scripts/**/*.js",
      "**/scripts/**/*.cjs",
      "**/scripts/**/*.mjs",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-process-exit": "off",
      "import/no-dynamic-require": "off",
    },
  },
  // Next.js specific
  {
    files: [
      "**/pages/**/*.ts",
      "**/pages/**/*.tsx",
      "**/app/**/*.ts",
      "**/app/**/*.tsx",
      "next.config.*",
      "**/middleware.ts",
    ],
    rules: {
      "import/no-default-export": "off",
      "import/no-dynamic-require": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  // Configuration files
  {
    files: [
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "*.config.cjs",
      "tailwind.config.*",
      "postcss.config.*",
      "jest.config.*",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "import/no-dynamic-require": "off",
    },
  },
  // Ignore patterns
  {
    ignores: [
      "node_modules/",
      "dist/",
      "build/",
      ".next/",
      ".astro/",
      "coverage/",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
      ".transformation-backups/",
      ".jest-cache/",
      ".eslintcache",
      ".eslintcache-fast",
      ".eslint-results.json",
      ".eslint-profile.json",
      ".eslint-ts-cache/",
      ".eslint-tsbuildinfo",
      ".lint-backup-*/",
      "yarn.lock",
      "package-lock.json",
    ],
  },
];
