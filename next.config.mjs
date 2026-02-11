import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Webpack fallback configuration for path alias resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      async_hooks: false,
    };

    // Externalize Node.js core modules and 'pg' to prevent bundling them into the client-side
    // This is crucial for Vercel deployment where these modules are not available client-side
    const originalExternals = config.externals;
    config.externals = ({ context, request }, callback) => {
      const externalsToExternalize = ["pg", "dns", "net", "tls", "fs"];

      if (externalsToExternalize.includes(request)) {
        return callback(null, `commonjs ${request}`);
      }

      if (typeof originalExternals === "function") {
        return originalExternals(context, request, callback);
      }
      if (
        typeof originalExternals === "object" &&
        originalExternals !== null &&
        originalExternals[request]
      ) {
        return callback(null, originalExternals[request]);
      }
      callback();
    };
    return config;
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    const scriptSrcParts = [
      "'self'",
      "'unsafe-inline'",
      "https://unpkg.com",
      "https://cdn.jsdelivr.net",
      "https://r2cdn.perplexity.ai",
      "https://vercel.live",
      "https://*.vercel.live",
    ];

    if (isDevelopment) {
      scriptSrcParts.push("'unsafe-eval'");
    }

    const connectSrcParts = [
      "'self'",
      "https://vercel.live",
      "https://*.vercel.live",
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
      "frame-src 'self' https:",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests",
    ]
      .filter(Boolean)
      .join("; ");

    return [
      {
        source: "/:path*",
        headers: [
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
        ],
      },
    ];
  },
};

export default nextConfig;
