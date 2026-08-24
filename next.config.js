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
    // SpacetimeDB Maincloud WebSocket. The bare `https:` source above does NOT
    // cover `wss:` (a distinct CSP scheme), so the prod WS origin must be listed
    // explicitly — and statically, so the allowance never silently depends on
    // whether NEXT_PUBLIC_SPACETIME_URI was present at *build* time. The token
    // POST to https://maincloud.spacetimedb.com is already covered by `https:`.
    "wss://maincloud.spacetimedb.com",
  ];

  // Local self-hosted SpacetimeDB (ws://) needs both the WebSocket origin and
  // its http:// counterpart in connect-src: the SDK exchanges a stored identity
  // token via an HTTP POST to /v1/identity/websocket-token before reconnect.
  // (Prod wss://maincloud.spacetimedb.com is allowed statically above.)
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
  // The admin dashboard's migration-status and cron-heartbeat services read
  // database/init/*.sql and vercel.json from disk at runtime; trace them into
  // that route's lambda or the manifest degrades to its honest null/fallback
  // state in production. Both key spellings are listed because app-router
  // route entries match "/api/admin/dashboard/route" while pages-style
  // matching uses the bare path.
  outputFileTracingIncludes: {
    "/api/admin/dashboard": ["./database/init/*.sql", "./vercel.json"],
    "/api/admin/dashboard/route": ["./database/init/*.sql", "./vercel.json"],
  },
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
            // Pull the static web-push handlers into the generated SW (PR 5).
            // Lives in public/, so CopyPwaAssetsPlugin leaves it untouched.
            importScripts: ["/push-listener.js"],
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

    // Dedicated static CORS headers for read-only metadata and icon assets.
    // Wildcard origin (*) must NOT be paired with Access-Control-Allow-Credentials: true
    // per W3C CORS specifications, and only read-only methods (GET, OPTIONS) apply.
    const staticCorsHeaders = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Accept, Content-Type" },
    ];

    return [
      {
        source: "/(.*)",
        headers: getSecurityHeaders(),
      },
      {
        // The compiled physics engine. public/wasm/ is committed, so these are
        // real files with STABLE, UNHASHED names — /wasm/thermo_wasm.js is the
        // same URL for every build, and its contents change whenever the Rust
        // does.
        //
        // ⚠️ NEVER `immutable` HERE, however tempting it looks for a binary.
        // `max-age=31536000, immutable` tells the browser not to revalidate for
        // a year, and on a mutable URL that pins returning visitors to an old
        // engine indefinitely — worse, it can pair a stale cached .wasm with
        // freshly deployed app JS that decodes its buffers at different
        // offsets. Immutable caching is safe only for content-hashed
        // filenames, which wasm-bindgen does not emit.
        //
        // This restates Vercel's default for public/ rather than changing it.
        // It is written down so the next person to "optimise" static assets
        // sees the reason before editing.
        source: "/wasm/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Static Token-2022 ESMS metadata documents.
        // Note: Kept at max-age=3600, must-revalidate during pre-upload staging
        // (where image is null); will flip to immutable once permanent Arweave
        // hashes land in ASOL Phase 4.
        source: "/metadata/esms/:path*",
        headers: [
          ...staticCorsHeaders,
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
      },
      {
        // Static Token-2022 ESMS SVG icon assets.
        source: "/icons/esms/:path*",
        headers: [
          ...staticCorsHeaders,
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
        ],
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
      // The tier concept is retired, but these two were never upsell pages —
      // /premium was the ESMS Vault (still linked from the footer as "ESMS
      // Vault") and /premium-table is the Alchemical Midpoint feature. Renamed
      // so the URLs stop implying a subscription that never existed; redirected
      // because both had live inbound links.
      {
        source: "/premium",
        destination: "/vault",
        permanent: true,
      },
      {
        source: "/premium-table",
        destination: "/adept-table",
        permanent: true,
      },
      // /upgrade only ever redirected to /premium. Kept as a redirect rather
      // than a 404 so any bookmark lands on the vault instead of a dead end.
      {
        source: "/upgrade",
        destination: "/vault",
        permanent: true,
      },

      // ── The Lab split ────────────────────────────────────────────────────
      // A single "Lab" section held eight routes spanning kitchen
      // thermodynamics, celestial mechanics, the alchm quantity system and
      // the token economy. It is now /kitchen-lab and /celestial-lab, split
      // by SUBJECT, with real-physics and alchm quantities on separate
      // subpages inside each.
      //
      // These six sources must stay byte-identical to LEGACY_LAB_REDIRECTS in
      // src/config/navigation.ts — this file is CommonJS and cannot import the
      // TS table, so the two are cross-checked by a test
      // (src/config/__tests__/navigation.redirects.test.ts) rather than by the
      // compiler. Edit both or the test fails.
      //
      // `permanent: false` (307), NOT 308, on purpose. A 308 is cached by the
      // browser indefinitely: if this tree is tuned again — and a
      // freshly-landed IA usually is — every user who touched a legacy URL
      // once is pinned to a stale destination with no server-side way to
      // release them. Promote these to `permanent: true` once the tree has
      // settled and the paths have stopped moving.
      //
      // /grimoire and /vault are deliberately absent: they changed SECTION,
      // not path, so they need no redirect.
      {
        source: "/lab",
        destination: "/kitchen-lab",
        permanent: false,
      },
      {
        source: "/lab-book",
        destination: "/kitchen-lab/lab-book",
        permanent: false,
      },
      {
        source: "/planetary-chart",
        destination: "/celestial-lab/mechanics",
        permanent: false,
      },
      {
        source: "/current-chart",
        destination: "/celestial-lab/current-chart",
        permanent: false,
      },
      {
        source: "/birth-chart",
        destination: "/celestial-lab/standing-chart",
        permanent: false,
      },
      {
        source: "/quantities",
        destination: "/celestial-lab/alchm",
        permanent: false,
      },
    ];
  },

  // Proxy rewrites removed - back to standard monolith on Vercel
};

export default nextConfig;
