// eslint.config.audit.mjs — flips every intentionally audited "off" rule to
// "warn" for src/** without changing the normal lint configuration.
import base from "./eslint.config.mjs";

export const AUDITED_RULES = {
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-call": "warn",
  "@typescript-eslint/no-unsafe-return": "warn",
  "@typescript-eslint/no-unsafe-argument": "warn",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/explicit-module-boundary-types": "warn",
  "@typescript-eslint/no-inferrable-types": "warn",
  "@typescript-eslint/no-unnecessary-condition": "warn",
  "@typescript-eslint/prefer-nullish-coalescing": "warn",
  "@typescript-eslint/prefer-optional-chain": "warn",
  "@typescript-eslint/prefer-readonly": "warn",
  "@typescript-eslint/require-await": "warn",
  "jsx-a11y/click-events-have-key-events": "warn",
  "jsx-a11y/no-noninteractive-element-interactions": "warn",
  "jsx-a11y/no-static-element-interactions": "warn",
  complexity: "warn",
  "max-depth": "warn",
  "max-lines": "warn",
  "max-lines-per-function": "warn",
  "max-nested-callbacks": "warn",
  "no-console": "warn",
  "no-void": "warn",
  "no-useless-assignment": "warn",
  "arrow-body-style": "warn",
  "prefer-destructuring": "warn",
  "react/display-name": "warn",
};

export default [
  ...base,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: AUDITED_RULES,
  },
];
