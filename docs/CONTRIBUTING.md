# Contributing to WhatToEatNext

Thank you for your interest in contributing to WhatToEatNext! This document provides guidelines and instructions for contributing to the project.

## Core Principles

Before contributing, please familiarize yourself with our [Elemental Principles](docs/elemental-principles.md), which are fundamental to our project philosophy:

1. All elements (Fire, Water, Earth, Air) are individually valuable
2. Elements don't oppose each other
3. Elements reinforce themselves
4. All element combinations have good compatibility

These principles must be reflected in all code contributions.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/WhatToEatNext.git
   cd WhatToEatNext
   ```
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```

## Contribution Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes, following our code style and elemental principles
3. Run tests to ensure they pass:
   ```bash
   yarn test
   ```
4. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request to our main branch

## Code Standards

- Use TypeScript for all new code
- Follow the existing code style and organization
- Write meaningful comments for complex logic
- Ensure all elemental calculations follow our principles
- Add tests for new features

## Testing Guidelines

- Test all elemental compatibility functions
- Verify that test cases uphold our elemental principles
- Use Jest for unit tests
- Simulate astrological data rather than relying on current dates

## Common Pitfalls to Avoid

1. Implementing "opposing" elements logic
2. Creating functions that return low compatibility for different elements
3. Writing code that tries to "balance" elements against each other
4. Using terms like "weakness" or "conflict" to describe elemental relationships

## Questions?

If you have questions about contributing, please open an issue labeled "question" and we'll get back to you promptly.

Thank you for contributing to WhatToEatNext and helping create a more harmonious alchemical system for food recommendations! 