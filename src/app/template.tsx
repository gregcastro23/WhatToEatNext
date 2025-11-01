'use client';

import { useEffect, useState } from 'react';

import { logger } from '@/utils/logger';

const Loading = ({
  fullScreen,
  variant,
  text
}: {
  fullScreen?: boolean;
  variant?: string;
  text?: string;
}) => (
  <div className={`flex ${fullScreen ? 'min-h-screen' : ''} items-center justify-center p-4`}>
    <div className='text-center text-gray-600'>
      <div className='mb-2 animate-pulse'>⏳</div>
      <div>{text || 'Loading...'}</div>
    </div>
  </div>
)

interface TemplateProps {
  children: React.ReactNode
}

export default function Template({ children }: TemplateProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Mark as hydrated
      setIsHydrated(true)
      logger.info('Template hydrated successfully')

      // Check for critical elements
      const body = document.body;
      const head = document.head;

      if (!body || !head) {
        throw new Error('Critical DOM elements missing')
      }

      // Ensure minimum styling is applied
      if (!document.getElementById('base-styles')) {
        const style = document.createElement('style');
        style.id = 'base-styles'
        style.textContent = `
          body {
            margin: 0,
            padding: 0,
            min-height: 100vh,
            background: #ffffff,
            color: #000000,
            font-family: system-ui, -apple-system, sans-serif;
          }
        `
        document.head.appendChild(style)
      }
    } catch (error) {
      console.error('Template hydration error:', error, {
        context: 'Template',
        action: 'hydration'
      })
      setHasError(true)
    }
  }, [])

  if (hasError) {
    return (
      <div className='flex min-h-screen items-center justify-center p-4'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold'>Something went wrong</h1>
          <p className='mb-4'>Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!isHydrated) {
    return <Loading fullScreen variant='spinner' text='Loading application...' />;
  }

  return (
    <div id='app-root' className='min-h-screen'>
      {children}
    </div>
  )
}
