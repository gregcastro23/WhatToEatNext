import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { GenerateSW } = require("workbox-webpack-plugin");

/** @type {import('next').NextConfig} */
// Keep PWA support opt-in only. The next-pwa wrapper stalls this app during
// Next.js 15 compile, so PWA generation uses Workbox directly instead.
const enablePwa = process.env.ENABLE_PWA === "true";

class CopyPwaAssetsPlugin {
  constructor(publicDir) {
    this.publicDir = publicDir;
  }

  apply(compiler) {
    compiler.hooks.done.tap("CopyPwaAssetsPlugin", () => {
      const outputPath = compiler.outputPath;
      if (!outputPath || !fs.existsSync(outputPath)) return;

      const pwaAssetNames = fs
        .readdirSync(outputPath)
        .filter(
          (assetName) =>
            assetName === "sw.js" || assetName.startsWith("workbox-"),
        );

      if (pwaAssetNames.length === 0) return;

      for (const existingAssetName of fs.readdirSync(this.publicDir)) {
        if (existingAssetName === "sw.js" || existingAssetName.startsWith("workbox-")) {
          fs.rmSync(path.join(this.publicDir, existingAssetName), { force: true });
        }
      }

      for (const assetName of pwaAssetNames) {
        const sourcePath = path.join(outputPath, assetName);
        const destinationPath = path.join(this.publicDir, assetName);
        fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
        fs.copyFileSync(sourcePath, destinationPath);
      }
    });
  }
}

// Security headers with Vercel support
const getSecurityHeaders = () => {
  const scriptSrcParts = [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://unpkg.com",
    "https://cdn.jsdelivr.net",
    "https://r2cdn.perplexity.ai",
    "https://vercel.live",
    "https://*.vercel.live",
    "https://static.cloudflareinsights.com",
  ];

  const connectSrcParts = [
    "'self'",
    "https://vercel.live",
    "https://*.vercel.live",
    "https://accounts.google.com",
    "https:",
  ];

  const cspHeader = [
    "default-src 'self'",
    `script-src ${scriptSrcParts.join(" ")}`,
    "style-src 'self' 'unsafe-inline' 'unsafe-hashes' https://unpkg.com https://cdn.jsdelivr.net https://r2cdn.perplexity.ai",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https: https://r2cdn.perplexity.ai",
    `connect-src ${connectSrcParts.join(" ")}`,
    "media-src 'self' https:",
    "object-src 'none'",
    "frame-src 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  return [
    {
      key: "Content-Security-Policy",
      value: cspHeader,
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(self)",
    },
  ];
};

const nextConfig = {
  reactStrictMode: false,
  outputFileTracingRoot: __dirname,
  // standalone output disabled - causes long builds and Vercel issues
  images: {
    domains: [], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.alchm.kitchen",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: false, // Vercel handles high-performance image optimization natively
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  bundlePagesRouterDependencies: false,

  eslint: {
    // Vercel build fails with ESLint v9/v10 flat config incompatibilities
    // We already run `eslint` fully in the test/lint jobs.
    ignoreDuringBuilds: true,
  },

  // Move serverExternalPackages out of experimental for Next.js 15
  serverExternalPackages: ["pg", "astronomy-engine"],

  turbopack: {},

  webpack: (config, { isServer, nextRuntime }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        net: false,
        tls: false,
        dns: false,
        "pg-native": false,
      };

      if (enablePwa) {
        config.plugins.push(
          new GenerateSW({
            swDest: "sw.js",
            clientsClaim: true,
            skipWaiting: true,
            cleanupOutdatedCaches: true,
            mode: process.env.NODE_ENV === "production" ? "production" : "development",
            exclude: [/\.map$/, /^build-manifest\.json$/, /^app-build-manifest\.json$/, /^react-loadable-manifest\.json$/],
            runtimeCaching: [],
          }),
          new CopyPwaAssetsPlugin(path.join(__dirname, "public")),
        );
      }
    }

    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/meal-plan",
        destination: "/menu-planner",
        permanent: true,
      },
      {
        source: "/meal-plan/groceries",
        destination: "/menu-planner",
        permanent: true,
      },
    ];
  },

  // Proxy rewrites removed - back to standard monolith on Vercel
};

export default nextConfig;
