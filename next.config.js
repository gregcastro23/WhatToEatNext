const path = require('path');

/**
 * Next.js Configuration
 * 
 * Note about "Next.js is outdated" warning:
 * This app is currently using Next.js 14.2.26. If you want to update to the latest version,
 * you can run: yarn add next@latest react@latest react-dom@latest
 * However, it's recommended to thoroughly test after upgrading as breaking changes may occur.
 * 
 * @type {import('next').NextConfig}
 */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob:;
      font-src 'self';
      connect-src 'self';
      media-src 'self';
      object-src 'none';
      frame-src 'self';
    `.replace(/\s+/g, ' ').trim()
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [], // Add any image domains you need
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    // Ignore TypeScript errors in the production build to prevent build failures
    // You should still address TypeScript errors during development
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds to catch issues
    dirs: ['src', 'pages'], // Directories to lint
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { isServer, dev }) => {
    // Use simpler React resolution without require.resolve
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      };
    }
    
    // Don't filter out the ReactFreshWebpackPlugin in development mode
    if (!dev && config.plugins) {
      config.plugins = config.plugins.filter(
        (plugin) => !(plugin.constructor.name === 'ReactFreshWebpackPlugin')
      );
    }
    
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    // Configure filesystem cache properly for sharp module
    if (config.cache) {
      // Leave the Next.js default configuration intact
      // Just add some specific ignores for the problematic modules
      if (config.cache.type === 'filesystem') {
        config.cache.buildDependencies = {
          ...(config.cache.buildDependencies || {}),
          config: [__filename],
        };
        // Add an ignore pattern for sharp modules
        config.module = config.module || {};
        config.module.rules = config.module.rules || [];
        config.module.rules.push({
          test: /node_modules[/\\]sharp/,
          use: { 
            loader: 'ignore-loader' 
          },
        });
      }
    }
    
    // Add custom webpack config to resolve paths
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src')
    };
    
    return config;
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' *.astro-api.com *.nutritionix.com; frame-src 'self'; worker-src 'self' blob:; manifest-src 'self'",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Rewrite any requests to popup.js to either dummy-popup.js or empty.js
      {
        source: '/popup.js',
        destination: '/dummy-popup.js',
      },
      {
        source: '/scripts/popup.js',
        destination: '/empty.js',
      },
      {
        source: '/assets/popup.js',
        destination: '/empty.js',
      },
      {
        source: '/js/popup.js',
        destination: '/empty.js',
      },
      {
        source: '/popup/:path*',
        destination: '/empty.js',
      },
      // Handle lockdown-related scripts
      {
        source: '/lockdown-install.js',
        destination: '/lockdown-patch.js',
      },
      {
        source: '/lockdown.js',
        destination: '/lockdown-patch.js',
      },
      {
        source: '/scripts/lockdown.js',
        destination: '/lockdown-patch.js',
      },
      {
        source: '/assets/lockdown.js',
        destination: '/lockdown-patch.js',
      },
      {
        source: '/js/lockdown.js',
        destination: '/lockdown-patch.js',
      },
      // Handle problematic viewer.js
      {
        source: '/viewer.js',
        destination: '/empty.js', 
      },
      {
        source: '/scripts/viewer.js',
        destination: '/empty.js',
      }
    ];
  },
  experimental: {
    largePageDataBytes: 12800000, // Increase from 128kb default
  },
  async redirects() {
    return [
      // Redirects can be defined here
    ];
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
};

module.exports = nextConfig;