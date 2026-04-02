import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */

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
    "block-all-mixed-content",
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
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];
};

const nextConfig = {
  reactStrictMode: false,
  // standalone output disabled - causes long builds and Vercel issues
  images: {
    domains: [], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true, // Cloudflare handles image optimization via its own service
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  bundlePagesRouterDependencies: false,

  // Move serverExternalPackages out of experimental for Next.js 15
  serverExternalPackages: ["pg", "astronomy-engine"],

  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@chakra-ui/react",
      "react-icons",
      "framer-motion",
    ],
  },

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
    }

    // Stub out modules that are not compatible with Edge Runtime.
    // These modules use Node.js built-ins (stream, fs, path, crypto, net, etc.)
    // that are not available in Cloudflare Workers.
    if (nextRuntime === "edge") {
      config.resolve.alias = {
        ...config.resolve.alias,
        // jose deflate - not needed for JWT sessions
        "jose/dist/webapi/lib/deflate.js": false,
        // nodemailer - uses stream, fs, path, crypto (use Resend API instead)
        nodemailer: false,
        // pg - PostgreSQL client (use dynamic imports in server-only code)
        pg: false,
        "pg-native": false,
      };
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

  // Proxy heavy API routes to Vercel deployment (for Cloudflare bundle size reduction)
  // Note: These rewrites take priority over local route handlers in the Cloudflare build.
  async rewrites() {
    const vercelApiUrl = process.env.VERCEL_API_URL || "https://v0-alchm-kitchen.vercel.app";

    // Only enable rewrites when VERCEL_API_URL is set (Cloudflare deployment)
    if (!process.env.VERCEL_API_URL) {
      return [];
    }

    return [
      // Heavy data routes - proxy to Vercel
      {
        source: "/api/cuisines/:path*",
        destination: `${vercelApiUrl}/api/cuisines/:path*`,
      },
      {
        source: "/api/recipes/:path*",
        destination: `${vercelApiUrl}/api/recipes/:path*`,
      },
      {
        source: "/api/menu-planner/:path*",
        destination: `${vercelApiUrl}/api/menu-planner/:path*`,
      },
      {
        source: "/api/alchm-quantities/:path*",
        destination: `${vercelApiUrl}/api/alchm-quantities/:path*`,
      },
      {
        source: "/api/astrologize/:path*",
        destination: `${vercelApiUrl}/api/astrologize/:path*`,
      },
      {
        source: "/api/alchemize/:path*",
        destination: `${vercelApiUrl}/api/alchemize/:path*`,
      },
      // Note: /api/auth/* stays local for session cookies to work
      // Note: /api/user/* stays local for auth context
    ];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
