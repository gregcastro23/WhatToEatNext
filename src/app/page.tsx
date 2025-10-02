/**
 * Enhanced Main Page - Phase 26 Mobile-First Design with Core Recommenders
 *
 * Features modern responsive design, advanced performance optimizations,
 * and integration with our real-time WebSocket infrastructure.
 */

import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load the core recommender components for better performance
const CurrentMomentCuisineRecommendations = dynamic(
  () => import('@/components/cuisines/CurrentMomentCuisineRecommendations'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading cuisine recommendations...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

const AstrologicalRecommendations = dynamic(
  () => import('@/components/astrological/AstrologicalRecommendations'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading recipe recommendations...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

const EnhancedRecommendationEngine = dynamic(
  () => import('@/components/EnhancedRecommendationEngine'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading ingredient recommendations...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export const metadata: Metadata = {title: 'alchm.kitchen | Alchemical Culinary Intelligence',
  description: 'Discover the perfect meal through ancient alchemical wisdom and modern AI. Real-time planetary influences guide your culinary journey.'};

const FeatureCard = ({
  icon,
  title,
  description,
  href,
  status
}: {icon: string,
  title: string,
  description: string,
  href: string,
  status?: string}) => (
  <Link href={href} className="group">
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 h-full border border-gray-100 hover:border-purple-200">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3" role="img">{icon}</span>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>
          {status && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
              {status}
            </span>)}
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed">{description}</p>
      <div className="mt-4 text-purple-600 group-hover:text-purple-700 font-medium text-sm">
        Explore →
      </div>
    </div>
  </Link>)
const StatusIndicator = ({ label, status }: { label: string, status: 'active' | 'ready' | 'demo' }) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    ready: 'bg-blue-100 text-blue-800',
    demo: 'bg-purple-100 text-purple-800',
  };
        return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        status === 'active' ? 'bg-green-500' :
        status === 'ready' ? 'bg-blue-500' : 'bg-purple-500'
      }`}></div>
      {label}
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm: py-16 lg:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            🔮 <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              alchm.kitchen
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
            Discover the perfect meal through ancient alchemical wisdom and modern AI.
            Real-time planetary influences guide your culinary journey.
          </p>
          {/* Status Indicators */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <StatusIndicator label="Production Ready" status="active" />
            <StatusIndicator label="Real-Time Features" status="active" />
            <StatusIndicator label="Phase 6 Complete" status="ready" />
            <StatusIndicator label="Current Moment Integration" status="active" />
          </div>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/live-planetary-demo"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🌟 Experience Live Planetary Tracking
            </Link>
            <Link
              href="/backend-status"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg border border-gray-200"
            >
              📊 View System Status
            </Link>
          </div>
        </div>
      </section>
      {/* Core Recommenders Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🔮 Core Alchemical Recommenders
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience personalized culinary guidance through the three core pillars of alchemical cooking:
            current moment cuisines, astrological recipes, and elemental ingredients.
          </p>
        </div>

        {/* Cuisine Recommender */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-orange-600 mb-2">🍽️ Current Moment Cuisine Recommender</h3>
              <p className="text-gray-600">Live cuisine recommendations based on your current astrological moment</p>
            </div>
            <CurrentMomentCuisineRecommendations />
          </div>
        </div>

        {/* Recipe Recommender */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-purple-600 mb-2">🌟 Astrological Recipe Recommender</h3>
              <p className="text-gray-600">Personalized recipe recommendations based on your zodiac sign and seasonal harmony</p>
            </div>
            <AstrologicalRecommendations />
          </div>
        </div>

        {/* Ingredient Recommender */}
        <div className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-green-600 mb-2">🥕 Elemental Ingredient Recommender</h3>
              <p className="text-gray-600">Discover ingredients aligned with current celestial energies and alchemical principles</p>
            </div>
            <EnhancedRecommendationEngine
              maxRecommendations={6}
              showScoring={true}
              className="border-0 shadow-none bg-transparent"
            />
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Additional Features & Tools
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our comprehensive suite of alchemical cooking tools and advanced features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <FeatureCard
            icon="🌙"
            title="Live Planetary Tracking"
            description="Real-time planetary hour tracking with WebSocket updates. Watch celestial influences change live and get optimal cooking guidance."
            href="/live-planetary-demo"
            status="Phase 26 New"
          />

          <FeatureCard
            icon="⚡"
            title="Backend Performance"
            description="87% computational load reduction through strategic backend migration. Sub-second response times for complex calculations."
            href="/backend-status"
            status="Production Ready"
          />

          <FeatureCard
            icon="🔮"
            title="Astrologize Recipe"
            description="Transform any recipe with alchemical wisdom. Discover elemental balance and planetary influences in your ingredients."
            href="/astrologize-demo"
            status="Active"
          />

          <FeatureCard
            icon="🍳"
            title="Cooking Methods"
            description="Explore traditional cooking techniques enhanced with elemental understanding. Each method carries unique energetic properties."
            href="/cooking-methods-demo"
            status="Active"
          />

          <FeatureCard
            icon="📊"
            title="System Monitoring"
            description="Comprehensive monitoring with Prometheus metrics, real-time health checks, and enterprise-grade observability."
            href="/backend-status"
            status="Enterprise Grade"
          />

          <FeatureCard
            icon="🔒"
            title="Security & Scale"
            description="JWT authentication, rate limiting, horizontal scaling, and comprehensive security hardening for production deployment."
            href="/backend-status"
            status="Production Ready"
          />
        </div>
      </section>
      {/* Architecture Highlight */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              🏗️ Enterprise-Grade Architecture
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Built with production-ready infrastructure, horizontal scaling, and comprehensive monitoring.
              Capable of serving thousands of users with sophisticated alchemical calculations.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🔄</div>
                <div className="font-semibold text-gray-900">WebSocket</div>
                <div className="text-sm text-gray-600">Real-time updates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📈</div>
                <div className="font-semibold text-gray-900">Scaling</div>
                <div className="text-sm text-gray-600">Horizontal architecture</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="font-semibold text-gray-900">Security</div>
                <div className="text-sm text-gray-600">JWT + RBAC</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-semibold text-gray-900">Monitoring</div>
                <div className="text-sm text-gray-600">Prometheus metrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-50 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            ✨ Phase 26: Advanced Feature Development Complete - Production Launch Ready
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built with Next.js 15, React 19, TypeScript, and enterprise-grade backend services
          </p>
        </div>
      </footer>
    </div>
  )
}
