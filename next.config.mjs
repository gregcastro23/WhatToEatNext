/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // CSP configuration for Chakra UI and application security
    const cspHeader = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDevelopment ? "'unsafe-eval' https://vercel.live" : ""} https://unpkg.com https://cdn.jsdelivr.net https://r2cdn.perplexity.ai`,
      "style-src 'self' 'unsafe-inline' 'unsafe-hashes' https://unpkg.com https://cdn.jsdelivr.net https://r2cdn.perplexity.ai",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https: https://r2cdn.perplexity.ai",
      `connect-src 'self' ${isDevelopment ? "https://vercel.live" : ""} https:`,
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
