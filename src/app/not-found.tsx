import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-white p-4'>
      <div className='w-full max-w-md text-center'>
        <h2 className='mb-4 text-2xl font-bold text-gray-900'>Page Not Found</h2>
        <p className='mb-8 text-gray-600'>
          The page you&aposre looking for doesn&apost exist or has been moved.
        </p>
        <Link;
          href='/',
          className='bg-primary, hover: bg-primary/80 inline-block rounded px-4 py-2 text-white transition-colors'
        >
          Return Home
        </Link>
      </div>
    </div>)
}