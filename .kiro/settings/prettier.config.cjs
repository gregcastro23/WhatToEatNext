// Enhanced Prettier configuration for Kiro workspace
module.exports = {
  // Core formatting options
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,

  // JavaScript/TypeScript specific
  arrowParens: 'avoid',
  bracketSpacing: true,
  bracketSameLine: false,
  quoteProps: 'as-needed',

  // JSX specific
  jsxSingleQuote: true,
  jsxBracketSameLine: false,

  // HTML specific
  htmlWhitespaceSensitivity: 'css',

  // Markdown specific
  proseWrap: 'preserve',

  // Override settings for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      options: {
        parser: 'typescript',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        arrowParens: 'avoid',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      options: {
        parser: 'babel',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
        arrowParens: 'avoid',
      },
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        printWidth: 100,
        tabWidth: 2,
      },
    },
    {
      files: '*.astro',
      options: {
        parser: 'astro',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
      },
    },
    {
      files: ['*.alchm', '*.astrological', '*.culinary'],
      options: {
        parser: 'typescript',
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
  ],
};
