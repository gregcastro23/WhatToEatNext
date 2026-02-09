import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  outputFileTracingRoot: __dirname,
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Turbopack configuration (Next.js 16 default bundler)
  // turbopack: {
  //   root: __dirname,
  //   resolveAlias: {
  //     '@': path.resolve(__dirname, 'src'),
  //   },
  // },
  // Webpack fallback configuration for path alias resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // Externalize Node.js core modules and 'pg' to prevent bundling them into the client-side
    // This is crucial for Vercel deployment where these modules are not available client-side
    // Ensure Node.js core modules and 'pg' are externalized for server-side builds
    // This prevents bundling them into the client-side, which is crucial for Vercel.
    // Webpack's 'externals' property can be a function that receives the Webpack context.
    // If it's already a function, we should wrap it. If it's an array or object, we merge.
    const originalExternals = config.externals;
    config.externals = ({ context, request }, callback) => {
      // List of modules to externalize
      const externalsToExternalize = ['pg', 'dns', 'net', 'tls', 'fs'];

      if (externalsToExternalize.includes(request)) {
        return callback(null, `commonjs ${request}`);
      }

      // If original externals is a function, call it
      if (typeof originalExternals === 'function') {
        return originalExternals(context, request, callback);
      }
      // If original externals is an object and contains the request
      if (typeof originalExternals === 'object' && originalExternals !== null && originalExternals[request]) {
        return callback(null, originalExternals[request]);
      }
      // If it's an array, or other cases, let Webpack handle it normally
      callback();
    };
    return config;
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // CSP configuration for Chakra UI and application security
    // Build script-src dynamically
    const scriptSrcParts = [
      "'self'",
      "'unsafe-inline'",
      "https://unpkg.com",
      "https://cdn.jsdelivr.net",
      "https://r2cdn.perplexity.ai",
      "https://vercel.live",  // Always allow Vercel Live (for preview/production deployments)
      "https://*.vercel.live" // Allow all Vercel Live subdomains
    ];

    if (isDevelopment) {
      scriptSrcParts.push("'unsafe-eval'");
    }

    const connectSrcParts = [
      "'self'",
      "https://vercel.live",
      "https://*.vercel.live",
      "https:"
    ];

    const cspHeader = [
      "default-src 'self'",
      `script-src ${scriptSrcParts.join(' ')}`,
      "style-src 'self' 'unsafe-inline' 'unsafe-hashes' https://unpkg.com https://cdn.jsdelivr.net https://r2cdn.perplexity.ai",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https: https://r2cdn.perplexity.ai",
      `connect-src ${connectSrcParts.join(' ')}`,
      "media-src 'self' https:",
      "object-src 'none'",
      "frame-src 'self' https:",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests"
    ].filter(Boolean).join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
