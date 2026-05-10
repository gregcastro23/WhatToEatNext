# 🌟 Alchm.kitchen (WhatToEatNext) - v2.3.0

[![Bun](https://img.shields.io/badge/Bun-v1.3.13-black?logo=bun&logoColor=white)](https://bun.sh)
[![Next.js](https://img.shields.io/badge/Next.js-v15.5.16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-v19.0.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7.3-blue?logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**The world's first comprehensive astrological meal planning system.** Alchm.kitchen bridges ancient wisdom with modern AI technology to provide personalized food recommendations based on celestial alignments, elemental harmony, and thermodynamic resonance.

---

## 🚀 Version 2.3.0 - The Bun Revolution

This release marks a critical transition in our toolchain, optimizing for maximum engineering velocity.

- **✅ Toolchain Migration**: Successfully migrated from Yarn/NPM to **Bun v1.3.13**.
- **✅ 10x Performance**: Dependency installation reduced from 60s+ to **<10s**.
- **✅ Native TypeScript**: Eliminated `ts-node` and `tsx` loaders; all scripts now run natively via the Bun runtime.
- **✅ CI/CD Optimization**: GitHub Actions and GitLab CI workflows modernized with Bun's optimized cache strategies.
- **✅ Docker Overhaul**: All container images (Production & Dev) now based on `oven/bun:alpine`.

---

## 🎯 Core Features

### 🔮 Astrological Innovation
- **Real-time Cosmic Data**: Current planetary positions and lunar phases powered by `astronomy-engine`.
- **High-Precision Calculations**: ±0.1 degree accuracy with Swiss Ephemeris fallbacks.
- **Natal Chart Integration**: Personalized recommendations based on your unique astrological profile.

### 🌍 Four-Element Harmony
- **Elemental Balancing**: Every recipe is mathematically balanced (Fire, Water, Earth, Air) to sum to 1.0.
- **Self-Reinforcement**: Optimized for high compatibility (≥0.9) when elements align.
- **Alchemical Pillars**: 14 core transformation principles integrated into every recommendation.

### 🏗️ Technical Excellence
- **Decoupled Architecture**: Next.js 15 frontend on **Vercel** with a standalone Python FastAPI backend on **Railway**.
- **High-Availability Data**: Denormalized read models in **Neon PostgreSQL** for sub-1ms networking latency.
- **NextAuth.js v5**: Robust, Edge-compatible Google OAuth authentication.

---

## 🛠️ Technical Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| **Toolchain** | **Bun 1.3.13** (Installer, Runtime, Test Runner) |
| **Backend** | Python FastAPI, Swiss Ephemeris (`pyswisseph`) |
| **Database** | Neon Serverless PostgreSQL |
| **CI/CD** | GitHub Actions, GitLab CI, Vercel Build Pipeline |
| **Infrastructure**| Railway (Backend), Vercel (Frontend) |

---

## 🚀 Quick Start

Ensure you have [Bun](https://bun.sh) installed on your system.

```bash
# Clone the repository
git clone https://github.com/gregcastro23/WhatToEatNext.git
cd WhatToEatNext

# Install dependencies (blazing fast)
bun install

# Start the development server
bun run dev

# Run unit tests
bun run test

# Build for production
bun run build
```

---

## 📚 Documentation

Explore our comprehensive guides to understand the alchemical mechanics:

- 📖 **[Quick Start Guide](docs/QUICK_START.md)** - Get oriented in 5 minutes.
- 🏗️ **[Architecture Overview](docs/technical/architecture.md)** - How the stars align with our code.
- 🌍 **[Elemental Principles](docs/reference/elemental-principles.md)** - Understanding the 4-element system.
- 🧪 **[Alchemical Pillars](docs/reference/alchemical-pillars.md)** - Transformation principles.

---

## 🤝 Contributing

We welcome contributions from developers, astrologers, and culinary enthusiasts! Check out our **[Contributor Guide](docs/getting-started/for-contributors.md)** to get started.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to explore the cosmic culinary journey?** 🌟  
Visit us at **[Alchm.kitchen](https://alchm.kitchen)**
