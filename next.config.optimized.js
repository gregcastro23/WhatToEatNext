import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Optimized Next.js Configuration for WhatToEatNext
 * Enhanced for better build performance and cache management
 */

const nextConfig = {
  reactStrictMode: true,
  
  // Optimized image configuration
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      }
    ],
    // Enable image optimization
    unoptimized: false,
    // Cache images for better performance
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Enhanced compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn', 'info']
    } : false,
    styledComponents: true,
    // Enable emotion for better CSS-in-JS performance
    emotion: true
  },
  
  // TypeScript configuration
  typescript: {
    // Enable TypeScript validation during builds
    ignoreBuildErrors: false,
    // Enable incremental compilation
    incremental: true
  },
  
  // ESLint configuration
  eslint: {
    // Enable ESLint during builds for code quality
    ignoreDuringBuilds: false,
    dirs: ['src'],
    // Cache ESLint results
    cache: true,
    cacheLocation: '.eslintcache'
  },
  
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Enhanced memory optimization
  onDemandEntries: {
    maxInactiveAge: 25 * 1000, // 25 seconds
    pagesBufferLength: 4 // Keep more pages in buffer
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable modern JavaScript features
    esmExternals: true,
    // Enable concurrent features
    concurrentFeatures: true,
    // Enable server components
    serverComponents: true,
    // Enable app directory
    appDir: true,
    // Enable modern build optimizations
    modernBuild: true,
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable webpack 5 persistent caching
    webpackBuildWorker: true
  },
  
  // Enhanced webpack configuration
  webpack: (config, { isServer, dev, webpack }) => {
    // Optimize source maps for development
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map';
    } else {
      config.devtool = 'source-map';
    }
    
    // Enhanced caching configuration
    if (!dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(__dirname, '.next/cache'),
        compression: 'gzip',
        maxAge: 172800000, // 2 days
        store: 'pack',
        version: `${process.env.NODE_ENV}-${Date.now()}`,
      };
    }
    
    // Optimize module resolution
    config.resolve = {
      ...config.resolve,
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@types': path.resolve(__dirname, 'src/types'),
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
      // Enable symlinks for better module resolution
      symlinks: true,
      // Optimize module resolution
      modules: ['node_modules', 'src'],
    };
    
    // Client-side optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        net: false,
        tls: false,
        dns: false,
        'pg-native': false,
        'pg-hstore': false,
        'lapack': false,
        'webworker-threads': false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    
    // Enhanced experiments for modern features
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
      topLevelAwait: true,
      backCompat: false,
      // Enable modern JavaScript features
      outputModule: false,
      // Enable better tree shaking
      sideEffects: true,
    };
    
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // React chunk
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 30,
            },
            // Next.js chunk
            next: {
              name: 'next',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]next[\\/]/,
              priority: 30,
            },
          },
        },
      };
    }
    
    // Add performance hints
    config.performance = {
      hints: dev ? false : 'warning',
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
    
    // Optimize plugins
    if (!dev && config.plugins) {
      // Remove development plugins
      config.plugins = config.plugins.filter(
        (plugin) => !(plugin.constructor.name === 'ReactFreshWebpackPlugin')
      );
    }
    
    return config;
  },
  
  // Enhanced headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
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
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Enhanced redirects for better routing
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Enhanced rewrites for better API handling
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig; 