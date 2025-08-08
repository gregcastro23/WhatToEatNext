/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
module.exports = {
  // Core formatting
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'as-needed',

  // JSX specific
  jsxSingleQuote: true,

  // HTML/CSS
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  proseWrap: 'preserve',

  // Plugins - TailwindCSS must be last
  plugins: ['prettier-plugin-tailwindcss'],

  // TailwindCSS configuration
  tailwindConfig: './tailwind.config.js',
  tailwindFunctions: ['clsx', 'cn', 'tw'],

  // File-specific overrides
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: {
        tabWidth: 2,
        trailingComma: 'none',
      },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        proseWrap: 'always',
        printWidth: 80,
        embeddedLanguageFormatting: 'off',
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
        trailingComma: 'all',
      },
    },
    {
      files: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
      options: {
        printWidth: 120, // Allow longer lines in tests
      },
    },
    {
      files: ['*.config.js', '*.config.ts', 'tailwind.config.js', 'next.config.js'],
      options: {
        trailingComma: 'es5',
        printWidth: 120,
      },
    },
  ],
};
