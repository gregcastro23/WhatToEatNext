# Development Guide

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/gregcastro23/WhatToEatNext.git
   cd WhatToEatNext
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
bun run build
bun run start
```

## Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## Linting and CI

This project uses ESLint for code quality and has continuous integration set up
through GitHub Actions.

```bash
# Run linting
bun run lint

# Fix linting issues automatically
bun run lint:fix
```

### Pre-push Checks

A pre-push hook is configured to run linting and build checks before pushing to
GitHub:

- Your code will be linted
- A build will be attempted to catch any build errors

### GitHub CI Workflow

The GitHub Actions workflow runs on all pushes and pull requests:

1. **Linting**: Checks code quality with a maximum of 50 warnings
2. **Building**: Ensures the project builds without errors
3. **Testing**: Runs all tests

This ensures that code quality is maintained and build errors are caught before
merging.
