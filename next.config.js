import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */

// Security headers with Privy and Vercel support
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
    "https://auth.privy.io",
    "https://*.privy.io",
  ];

  const connectSrcParts = [
    "'self'",
    "https://vercel.live",
    "https://*.vercel.live",
    "https://auth.privy.io",
    "https://*.privy.io",
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
    "frame-src 'self' https://auth.privy.io https://*.privy.io",
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
  // Enable standalone output for Docker builds
  output: "standalone",
  images: {
    domains: [], 
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
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

  webpack: (config, { isServer }) => {
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
