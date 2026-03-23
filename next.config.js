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
    styledComponents: true,
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
  bundlePagesRouterDependencies: true,

  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@chakra-ui/react",
      "lucide-react",
      "react-icons",
      "@heroicons/react",
      "framer-motion",
      "date-fns",
      "lodash",
    ],
    // astronomy-engine is pure JS — must be bundled into the worker bundle
    // so the edge /api/astrologize route can use it as a fallback.
    // pg uses TCP sockets and is handled by nodejs_compat in the Worker.
    serverExternalPackages: ["pg"],
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
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
