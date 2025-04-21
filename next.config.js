const path = require('path');
const fs = require('fs');

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

// Validate required dependencies exist
const validateDependencies = () => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const requiredDeps = [
      'next', 'react', 'react-dom', 'ml-distance', 
      '@types/react', 'typescript'
    ];
    
    const missingDeps = requiredDeps.filter(dep => {
      return !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep];
    });
    
    if (missingDeps.length > 0) {
      console.warn(`WARNING: Missing required dependencies: ${missingDeps.join(', ')}`);
      console.warn('Please install using: yarn add ' + missingDeps.join(' '));
    }
    
    // Check version compatibility
    const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    const reactVersion = packageJson.dependencies?.react || packageJson.devDependencies?.react;
    
    if (nextVersion && reactVersion) {
      const nextMajor = parseInt(nextVersion.replace(/[^\d]/g, '').charAt(0), 10);
      const reactMajor = parseInt(reactVersion.replace(/[^\d]/g, '').charAt(0), 10);
      
      if (nextMajor >= 14 && reactMajor < 18) {
        console.warn('WARNING: Next.js 14+ requires React 18+. Please update React.');
      }
    }
    
    return true;
  } catch (err) {
    console.error('Error validating dependencies:', err);
    return false;
  }
};

// Run validation
validateDependencies();

const nextConfig = {
  reactStrictMode: false,
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
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
    styledComponents: true,
  },
  typescript: {
    // Enable TypeScript validation during builds to catch errors early
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint during builds to catch code quality issues
    ignoreDuringBuilds: false,
    dirs: ['src'], // Only run ESLint on the src directory
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { isServer, dev }) => {
    // Add proper source map support in development
    if (dev) {
      config.devtool = 'eval-source-map';
    }
    
    // Use simpler React resolution without require.resolve
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
        'webworker-threads': false
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
    
    // Fix for natural module in content-based-recommender
    config.module.rules.push({
      test: /node_modules\/content-based-recommender\/node_modules\/natural\/lib\/natural\/sentiment\/SentimentAnalyzer\.js$/,
      use: 'null-loader'
    });
    
    // Add optimization for specific packages
    // This achieves similar effect to optimizePackageImports but using webpack directly
    if (!isServer) {
      // For lucide-react: optimize icon imports
      config.resolve.alias['lucide-react$'] = 'lucide-react/dist/esm/lucide-react';
      // For date-fns: enable tree-shaking optimization
      config.resolve.alias['date-fns$'] = 'date-fns/esm';
      // For ml-distance: ensure proper tree-shaking
      config.resolve.alias['ml-distance$'] = 'ml-distance/lib';
    }
    
    // Add optimization for production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              chunks: 'all',
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                return `npm.${packageName.replace('@', '')}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name: false,
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()"
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://api.timeanddate.com https://json.astrologyapi.com https://ssd.jpl.nasa.gov https://*.nasa.gov https://*.astrologyapi.com"
          }
        ]
      }
    ];
  },
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-core', 
      'natural', 
      'content-based-recommender',
      'lapack',
      'webworker-threads',
      'apparatus',
      'sylvester',
      'sharp',
      'react-dom'
    ],
    largePageDataBytes: 128 * 1000 // 128KB
  },
  swcMinify: true,
  // Add a health check route for monitoring
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/health'
      }
    ];
  },
  // Customize build output
  output: 'standalone',
};

module.exports = nextConfig;