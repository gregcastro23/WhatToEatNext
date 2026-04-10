import Link from 'next/link';
import CosmicRecipeGenerator from '@/components/recipe/CosmicRecipeGenerator';

export default function CosmicRecipePage() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-purple-600 font-bold">
            Alchm Kitchen
          </p>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Cosmic Recipe Generator
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/recipe-builder"
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs font-semibold border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors"
          >
            Recipe Builder
          </Link>
          <Link
            href="/recipe-generator"
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors"
          >
            Recipe Generator
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-colors"
          >
            Home
          </Link>
        </nav>
      </div>
      <CosmicRecipeGenerator />
    </div>
  );
}
