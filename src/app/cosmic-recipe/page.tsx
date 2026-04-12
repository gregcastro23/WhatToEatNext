import Link from 'next/link';
import CosmicRecipeGenerator from '@/components/recipe/CosmicRecipeGenerator';

export default function CosmicRecipePage() {
  return (
    <div className="min-h-screen bg-[#08080e] text-white py-12">
      <div className="max-w-4xl mx-auto px-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-purple-600 font-bold">
            Alchm Kitchen
          </p>
          <h1 className="text-lg font-semibold text-white text-white/80">
            Cosmic Recipe Generator
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/recipe-builder"
            className="px-3 py-1.5 rounded-lg bg-white glass-card-premium text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-white/10 transition-colors"
          >
            Recipe Builder
          </Link>
          <Link
            href="/recipe-generator"
            className="px-3 py-1.5 rounded-lg bg-white glass-card-premium text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-white/10 transition-colors"
          >
            Recipe Generator
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg glass-card-premium text-white/80 hover:text-white text-xs transition-colors"
          >
            Home
          </Link>
        </nav>
      </div>
      <CosmicRecipeGenerator />
    </div>
  );
}
