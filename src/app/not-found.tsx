import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 