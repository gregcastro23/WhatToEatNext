module.exports = {
  // Using standard configuration
  extends: ['eslint:recommended'],
  rules: {
    // Using rules defined in eslint.config.js
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint', 'react', 'react-hooks', 'import'
  ]
} 