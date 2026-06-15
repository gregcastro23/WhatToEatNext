import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const { GenerateSW } = require("workbox-webpack-plugin");

// Single source of truth for the app version. Inlined at build time via the
// `env` config below so it survives runtimes (e.g. Vercel serverless) where
// `npm_package_version` is not set — which previously made /api/health report
// a stale hardcoded version.
const appVersion = require("./package.json").version;

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

  // Local SpacetimeDB (ws://) needs both the WebSocket origin and its http://
  // counterpart in connect-src: the SDK exchanges a stored identity token via
  // an HTTP POST to /v1/identity/websocket-token before every reconnect.
  // Production (wss:// + https://) is already covered by the https: source.
  const spacetimeUri = process.env.NEXT_PUBLIC_SPACETIME_URI;
  if (spacetimeUri && (spacetimeUri.startsWith("ws://") || spacetimeUri.startsWith("wss://"))) {
    try {
      const httpUri = spacetimeUri.replace(/^ws/, "http");
      const url = new URL(httpUri);
      const httpOrigin = url.origin;
      const wsOrigin = httpOrigin.replace(/^http/, "ws");
      connectSrcParts.push(wsOrigin, httpOrigin);
    } catch {
      // Malformed URI — the client will surface the connection error.
    }
  }

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
  // Inline the package version so server + client code can report it reliably.
  env: {
    APP_VERSION: appVersion,
  },
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
            // Safe, additive runtime caching only. HTML navigations and /api/* are
            // deliberately NOT cached, so every deploy serves fresh markup and
            // auth/economy responses always hit the network. No navigateFallback —
            // this is an SSR app, not an SPA, so serving a cached shell for every
            // navigation would break it.
            runtimeCaching: [
              {
                // Content-hashed build assets are immutable — serve from cache and
                // revalidate in the background.
                urlPattern: ({ url }) => url.pathname.startsWith("/_next/static/"),
                handler: "StaleWhileRevalidate",
                options: { cacheName: "alchm-static" },
              },
              {
                // Images: cache-first with a bounded, expiring cache.
                urlPattern: ({ request }) => request.destination === "image",
                handler: "CacheFirst",
                options: {
                  cacheName: "alchm-images",
                  expiration: { maxEntries: 96, maxAgeSeconds: 7 * 24 * 60 * 60 },
                },
              },
            ],
          }),
          new CopyPwaAssetsPlugin(path.join(__dirname, "public")),
        );
      }
    }

    return config;
  },

  async headers() {
    const corsHeaders = [
      { key: "Access-Control-Allow-Credentials", value: "true" },
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
      { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
    ];

    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
      {
        source: "/api/alchm-quantities",
        headers: corsHeaders,
      },
      {
        source: "/api/alchm-quantities/:path*",
        headers: corsHeaders,
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
