# Contributing to WhatToEatNext

Thank you for your interest in contributing to WhatToEatNext (Alchm.kitchen)! This document provides guidelines and instructions for contributing to our alchemical culinary ecosystem.

## 🌟 Core Principles

Before contributing, please familiarize yourself with our [Elemental Principles](docs/reference/elemental-principles.md), which are fundamental to our project philosophy:

1.  **All elements (Fire, Water, Earth, Air) are individually valuable.**
2.  **Elements don't oppose each other.**
3.  **Elements reinforce themselves.**
4.  **All element combinations have good compatibility (≥0.7).**

These principles must be reflected in all code contributions, especially those involving astrological or alchemical calculations.

## 🛠️ Development Setup

Ensure you have [Bun v1.3.13+](https://bun.sh) installed.

1.  **Fork the repository** on GitHub.
2.  **Clone your fork**:
    ```bash
    git clone https://github.com/YOUR-USERNAME/WhatToEatNext.git
    cd WhatToEatNext
    ```
3.  **Install dependencies** (blazing fast):
    ```bash
    bun install
    ```
4.  **Start the development server**:
    ```bash
    bun run dev
    ```

## 🔄 Contribution Workflow

1.  **Create a new branch** for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
2.  **Make your changes**, following our code style and elemental principles.
3.  **Verify your changes**:
    ```bash
    bun run verify  # Runs linting and type checking
    bun run test    # Runs Jest test suite
    ```
4.  **Commit your changes** with a descriptive message following [Conventional Commits](https://www.conventionalcommits.org/):
    ```bash
    git commit -m "feat: add solar alignment logic to recommendation engine"
    ```
5.  **Push to your fork**:
    ```bash
    git push origin feature/your-feature-name
    ```
6.  **Open a Pull Request** to our `master` branch.

## 📏 Code Standards

-   **TypeScript:** Use strict TypeScript for all new code.
-   **Native Bun:** Use `bun run` and avoid `tsx` or `ts-node` for script execution.
-   **Elemental Rigor:** Ensure all elemental calculations sum to 1.0 and follow the harmony rules.
-   **Tests:** Add Jest tests for all new features.
-   **Linting:** Ensure all code passes `bun run lint`.

## 🧪 Testing Guidelines

-   Test all elemental compatibility functions.
-   Verify that test cases uphold our elemental principles.
-   Use `astronomy-engine` mocks for deterministic astrological tests.

## 🚫 Common Pitfalls to Avoid

1.  **Implementing "opposing" elements logic.**
2.  **Creating functions that return low compatibility for different elements.**
3.  **Using terms like "weakness" or "conflict" to describe elemental relationships.**

## 💬 Questions?

If you have questions, please open an issue labeled "question" or join our community discussions.

Thank you for helping us build the future of cosmic culinary planning! 🌟
